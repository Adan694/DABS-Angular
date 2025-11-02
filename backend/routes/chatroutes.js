const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const ChatController = require('../controllers/chatcontroller');
const Chat = require('../models/chat');
const { User } = require('../models/users');
const Booking = require('../models/booking');

/**
 * ✅ 1. Get patients for a specific doctor
 */
router.get('/patients/:doctorId', async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    console.log("Doctor ID param:", doctorId);

    const appointments = await Booking.find({ doctorId }).populate('patientId', 'name email');
    console.log("Appointments found:", appointments.length);

   const patients = appointments
  .map(a => a.patientId)
  .filter((p) => p && p._id) // remove nulls first
  .filter((p, i, self) => self.findIndex(x => x._id.toString() === p._id.toString()) === i);


    res.json(patients);
  } catch (err) {
    console.error('Error fetching doctor patients:', err);
    res.status(500).json({ message: 'Error fetching patients' });
  }
});

/**
 * ✅ 2. Get all patients (admin or doctor view)
 */
router.get('/all', async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('_id name email');
    const chatsWithLastMsg = await Promise.all(
      patients.map(async (patient) => {
        const lastMessage = await Chat.findOne({
          $or: [{ senderId: patient._id }, { receiverId: patient._id }]
        }).sort({ createdAt: -1 }).lean();

        const unreadCount = await Chat.countDocuments({
          senderId: patient._id,
          receiverRole: 'admin',
          read: false
        });

        return {
          _id: patient._id,
          name: patient.name,
          email: patient.email,
          lastMessage: lastMessage ? lastMessage.message : null,
          lastMessageAt: lastMessage ? lastMessage.createdAt : null,
          unreadCount,
          isUnread: unreadCount > 0,
        };
      })
    );

    chatsWithLastMsg.sort((a, b) => {
      if (b.unreadCount !== a.unreadCount)
        return b.unreadCount - a.unreadCount;
      return new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0);
    });

    res.json(chatsWithLastMsg);
  } catch (err) {
    console.error('Error fetching patient list:', err);
    res.status(500).json({ error: 'Server error fetching patients' });
  }
});

/**
 * ✅ 3. Mark messages as read
 */
router.post('/mark-read/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    await Chat.updateMany(
      { senderId: patientId, receiverRole: 'admin', read: false },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error marking messages read:', err);
    res.status(500).json({ error: 'Server error marking messages read' });
  }
});

/**
 * ✅ 4. Delete or clear chat
 */
router.delete('/clear/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const result = await Chat.deleteMany({
      $or: [
        { senderId: '689f5be6e5432f608d4b3a54', receiverId: chatId },
        { senderId: chatId, receiverId: '689f5be6e5432f608d4b3a54' },
      ],
    });
    res.json({ message: 'Chat messages cleared', deletedCount: result.deletedCount });
  } catch (err) {
    console.error('❌ Error clearing chat:', err);
    res.status(500).json({ message: 'Server error clearing chat' });
  }
});

router.delete('/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const result = await Chat.deleteMany({
      $or: [
        { senderId: 'admin', receiverId: chatId },
        { senderId: chatId, receiverId: 'admin' },
      ],
    });
    res.json({ message: 'Chat permanently deleted', deletedCount: result.deletedCount });
  } catch (err) {
    console.error('❌ Error deleting chat:', err);
    res.status(500).json({ message: 'Server error deleting chat' });
  }
});

/**
 * ✅ 5. Doctor-patient messages (use distinct path!)
 */
router.get('/:senderId/:receiverId', async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    const messages = await Chat.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages (alias route):', err);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});
/**
 * ✅ 6. Send a new chat message
 */
router.post('/send', async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;
    const newMsg = new Chat({ senderId, receiverId, message });
    await newMsg.save();
    res.json(newMsg);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: 'Error sending message' });
  }
});



module.exports = router;

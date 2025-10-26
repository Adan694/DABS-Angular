const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const ChatController = require('../controllers/chatcontroller');
const Chat = require('../models/chat');  
const { User } = require('../models/users');
// Get chat messages between two users
router.get('/:userId/:contactId', authenticateToken, ChatController.getMessages);
router.get('/list/:userId', ChatController.getChatList);

// Send a new message
router.post('/send', authenticateToken, ChatController.sendMessage);

router.get("/all", async (req, res) => {
  try {
    const patients = await User.find({ role: "patient", isBlocked: false })
      .select("_id name email");

    const chatsWithLastMsg = await Promise.all(
      patients.map(async (patient) => {
        const lastMessage = await Chat.findOne({
          $or: [
            { senderId: patient._id },
            { receiverId: patient._id }
          ]
        })
          .sort({ createdAt: -1 })
          .lean();

        const unreadCount = await Chat.countDocuments({
          senderId: patient._id,
          receiverRole: "admin",
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

    // 🟢 Sort chats so the latest (or unread) are at the top
    chatsWithLastMsg.sort((a, b) => {
      // Sort by unread first, then by lastMessageAt
      if (b.unreadCount !== a.unreadCount)
        return b.unreadCount - a.unreadCount;
      return new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0);
    });

    res.json(chatsWithLastMsg);
  } catch (err) {
    console.error("Error fetching patient list:", err);
    res.status(500).json({ error: "Server error fetching patients" });
  }
});

router.post("/mark-read/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;
    await Chat.updateMany(
      { senderId: patientId, receiverRole: "admin", read: false },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error marking messages read:", err);
    res.status(500).json({ error: "Server error marking messages read" });
  }
});

router.delete('/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;

    // Delete all messages where admin was involved with this user
    const result = await Chat.deleteMany({
      $or: [
        { senderId: 'admin', receiverId: chatId },
        { senderId: chatId, receiverId: 'admin' },
      ],
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No messages found to delete' });
    }

    res.json({ message: 'Chat permanently deleted', deletedCount: result.deletedCount });
  } catch (err) {
    console.error('❌ Error deleting chat:', err);
    res.status(500).json({ message: 'Server error deleting chat' });
  }
});

router.delete('/clear/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;

    // Delete all messages exchanged between admin and this user
    const result = await Chat.deleteMany({
      $or: [
        { senderId: 'admin', receiverId: chatId },
        { senderId: chatId, receiverId: 'admin' },
      ],
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No messages found to clear' });
    }

    res.json({ message: 'Chat messages cleared', deletedCount: result.deletedCount });
  } catch (err) {
    console.error('❌ Error clearing chat:', err);
    res.status(500).json({ message: 'Server error clearing chat' });
  }
});

module.exports = router;

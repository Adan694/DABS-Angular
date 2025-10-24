const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const ChatController = require('../controllers/chatcontroller');
const Chat = require('../models/chat');  
const { User } = require('../models/users');
// Get chat messages between two users
router.get('/:userId/:contactId', authenticateToken, ChatController.getMessages);

// Send a new message
router.post('/send', authenticateToken, ChatController.sendMessage);

// router.get("/all", async (req, res) => {
//   try {
//     const chats = await Chat.find({}).lean();

//     // Get unique patient IDs
//     const patientIds = [
//       ...new Set(
//         chats.map((chat) =>
//           chat.senderId === "admin" ? chat.receiverId : chat.senderId
//         )
//       ),
//     ];

//     // Find their user info (if stored in User or Patient model)
//     const patients = await User.find({ _id: { $in: patientIds } }).select(
//       "_id name email"
//     );

//     // If some IDs are not found (like deleted users), add them with fallback
//     const result = patientIds.map((id) => {
//       const user = patients.find((p) => p._id.toString() === id);
//       return user || { _id: id, name: `Unknown (${id})`, email: "" };
//     });

//     res.json(result);
//   } catch (err) {
//     console.error("Error fetching all chats:", err);
//     res.status(500).json({ error: "Server error fetching chats" });
//   }
// });
router.get("/all", async (req, res) => {
  try {
    // Fetch all active patients instead of relying on chat messages
    const patients = await User.find({ role: "patient", isBlocked: false }).select("_id name email");

    res.json(patients);
  } catch (err) {
    console.error("Error fetching patient list:", err);
    res.status(500).json({ error: "Server error fetching patients" });
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

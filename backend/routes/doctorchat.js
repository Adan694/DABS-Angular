const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const Chat = require('../models/chat');
const { User } = require('../models/users');
const  Doctor  = require('../models/doctors');

router.get("/alldoctors", async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .select("_id name email speciality available");

    const chatsWithLastMsg = await Promise.all(
      doctors.map(async (doctor) => {
        const lastMessage = await Chat.findOne({
          $or: [
            { senderId: doctor._id },
            { receiverId: doctor._id }
          ]
        })
          .sort({ createdAt: -1 })
          .lean();

        const unreadCount = await Chat.countDocuments({
          senderId: doctor._id,
          receiverRole: "admin",
          read: false
        });

        return {
          _id: doctor._id,
          name: doctor.name,
          email: doctor.email,
          speciality: doctor.speciality,
          available: doctor.available,
          lastMessage: lastMessage ? lastMessage.message : null,
          lastMessageAt: lastMessage ? lastMessage.createdAt : null,
          unreadCount,
          isUnread: unreadCount > 0,
        };
      })
    );

    // 🟢 Sort doctors so unread chats appear first, then by latest message
    chatsWithLastMsg.sort((a, b) => {
      if (b.unreadCount !== a.unreadCount)
        return b.unreadCount - a.unreadCount;
      return new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0);
    });

    res.json(chatsWithLastMsg);
  } catch (err) {
    console.error("Error fetching doctors list:", err);
    res.status(500).json({ error: "Server error fetching doctors" });
  }
});
// 🧩 Get chat messages
router.get("/:userId/:contactId", authenticateToken, async (req, res) => {
  const { userId, contactId } = req.params;
  const messages = await Chat.find({
    $or: [
      { senderId: userId, receiverId: contactId },
      { senderId: contactId, receiverId: userId },
    ],
  }).sort({ createdAt: 1 });
  res.json(messages);
});

// 🧩 Send message
router.post("/send", authenticateToken, async (req, res) => {
  const { senderId, receiverId, message } = req.body;
  if (!senderId || !receiverId || !message)
    return res.status(400).json({ message: "Missing required fields" });

  const chat = new Chat({
    senderId,
    receiverId,
    senderRole: "admin",
    receiverRole: "doctor",
    message,
  });
  await chat.save();

  res.status(201).json({ message: "Message sent", chat });
});

// 🧩 Mark as read
router.post("/mark-read/:doctorId", async (req, res) => {
  const { doctorId } = req.params;
  await Chat.updateMany(
    { senderId: doctorId, receiverRole: "admin", read: false },
    { $set: { read: true } }
  );
  res.json({ success: true });
});
router.delete("/clear/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;
    await Chat.deleteMany({
      $or: [{ senderId: doctorId }, { receiverId: doctorId }],
    });
    res.status(200).json({ message: "Doctor chat cleared successfully" });
  } catch (err) {
    console.error("❌ Error clearing doctor chat:", err);
    res.status(500).json({ error: "Server error while clearing doctor chat" });
  }
});
module.exports = router;

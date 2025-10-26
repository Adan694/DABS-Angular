const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    senderId: { type: String, required: true },
    senderRole: { type: String, enum: ['admin', 'patient'], default: 'patient' },
    receiverId: { type: String, required: true },
    receiverRole: { type: String, enum: ['admin', 'patient'], default: 'admin' },
    message: { type: String, required: true },
    read: { type: Boolean, default: false }, // 🟢 new field for unread tracking
  },
  { timestamps: true }
);

module.exports = mongoose.model('Chat', chatSchema);

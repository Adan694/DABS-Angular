const Chat = require('../models/chat');
const { io } = require('../server'); // 👈 import Socket.IO instance
const { getIo } = require('./socketcontroller');

exports.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;

    if (!senderId || !receiverId || !message)
      return res.status(400).json({ message: 'Missing required fields' });

    const chat = new Chat({ senderId, receiverId, message });
    await chat.save();
    const io = getIo(); 
 io.to(senderId).emit('newMessage', chat);
    io.to(receiverId).emit('newMessage', chat);
// const emitEvent = 'receive_message';

// // Emit to sender and receiver, avoid double sending if they are same
// if (senderId === receiverId) {
//   io.to(senderId).emit(emitEvent, chat);
// } else {
//   io.to(senderId).emit(emitEvent, chat);
//   io.to(receiverId).emit(emitEvent, chat);
// }

    res.status(201).json({ message: 'Message sent successfully', chat });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { userId, contactId } = req.params;

    const messages = await Chat.find({
      $or: [
        { senderId: userId, receiverId: contactId },
        { senderId: contactId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

/**
 * 📦 Get all chats for a user with last message + unread count
 */
exports.getChatList = async (req, res) => {
  try {
    const { userId } = req.params;

    const chatList = await Chat.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }],
        },
      },
      {
        $group: {
          _id: {
            pair: {
              $cond: [
                { $gt: ["$senderId", "$receiverId"] },
                ["$senderId", "$receiverId"],
                ["$receiverId", "$senderId"],
              ],
            },
          },
          lastMessage: { $last: "$message" },
          lastSender: { $last: "$senderId" },
          lastReceiver: { $last: "$receiverId" },
          lastUpdated: { $max: "$updatedAt" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$read", false] }, { $eq: ["$receiverId", userId] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { lastUpdated: -1 } },
    ]);

    res.json(chatList);
  } catch (error) {
    console.error('Error fetching chat list:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

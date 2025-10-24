const jwt = require('jsonwebtoken');
const { User } = require('../models/users');
const Chat = require('../models/chat');
const Message = require('../models/message');

/**
 * Initializes socket.io and handles all chat events
 */
function initSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('No token provided'));

      const decoded = jwt.verify(token, 'secret-123');
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`⚡ User connected: ${socket.user.name} (${socket.user.role})`);

    // Open or create chat
    socket.on('openChatWith', async ({ otherUserId }) => {
      try {
        let chat = await Chat.findOne({
          participants: { $all: [socket.user._id, otherUserId], $size: 2 }
        });

        if (!chat) chat = await Chat.create({ participants: [socket.user._id, otherUserId] });

        socket.join(chat._id.toString());
        socket.emit('chatOpened', chat);
      } catch (error) {
        console.error('Error opening chat:', error);
      }
    });

    // Send message
    socket.on('sendMessage', async ({ chatId, content }) => {
      try {
        const message = await Message.create({
          chat: chatId,
          sender: socket.user._id,
          content
        });

        await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id, updatedAt: Date.now() });

        io.to(chatId).emit('newMessage', {
          _id: message._id,
          chat: chatId,
          sender: socket.user,
          content: message.content,
          createdAt: message.createdAt
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ ${socket.user.name} disconnected`);
    });
  });
}

module.exports = { initSocket };

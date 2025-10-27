const { User } = require('../models/users');
const Chat = require('../models/chat');
const Message = require('../models/message');

const onlineUsers = new Map();

function initSocket(io) {
  io.on('connection', (socket) => {
    const user = socket.user; 
    if (!user?.email) {
      console.warn('⚠️ Socket connected without valid user data');
      return;
    }

    console.log(` [Socket] ${user.email} connected`);

    // Track online users
    onlineUsers.set(user.email, socket.id);

    //  Notify everyone this user is online
    io.emit('userStatusUpdate', { email: user.email, online: true });
    console.log(' Emitting userStatusUpdate:', { email: user.email, online: true });

    // Handle "openChatWith" ---
    socket.on('openChatWith', async ({ otherUserId }) => {
      try {
        let chat = await Chat.findOne({
          participants: { $all: [user._id, otherUserId], $size: 2 },
        });

        if (!chat) chat = await Chat.create({ participants: [user._id, otherUserId] });

        socket.join(chat._id.toString());
        socket.emit('chatOpened', chat);
      } catch (error) {
        console.error(' Error opening chat:', error);
      }
    });

    // ---  Handle "sendMessage" ---
    socket.on('sendMessage', async ({ chatId, content }) => {
      try {
        const message = await Message.create({
          chat: chatId,
          sender: user._id,
          content,
        });

        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: message._id,
          updatedAt: Date.now(),
        });

        io.to(chatId).emit('newMessage', {
          _id: message._id,
          chat: chatId,
          sender: user,
          content: message.content,
          createdAt: message.createdAt,
        });
      } catch (error) {
        console.error(' Error sending message:', error);
      }
    });

    // --Handle disconnect ---
    socket.on('disconnect', () => {
      console.log(` [Socket] ${user.email} disconnected`);
      onlineUsers.delete(user.email);
      io.emit('userStatusUpdate', { email: user.email, online: false });
      console.log(' Emitting userStatusUpdate:', { email: user.email, online: false });
    });
  });
}

module.exports = { initSocket };

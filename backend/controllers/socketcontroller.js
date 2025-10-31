const { Server } = require('socket.io');
const Chat = require('../models/chat');
const { User } = require('../models/users');
const Doctor = require('../models/doctors');

let io;
const onlineUsers = new Map();

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:4200",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on('connection', async (socket) => {
    console.log(' New socket connected:', socket.id);

    const { token, role, email } = socket.handshake.auth || {};
    console.log(` Auth Data => role: ${role}, email: ${email}`);

    let user = null;

    try {
      const normalizedRole = role?.toLowerCase();

      if (normalizedRole === 'doctor') {
        user = await Doctor.findOne({ email });
      } else {
        user = await User.findOne({ email });
      }

      if (!user) {
        console.warn(` No user found in DB for email: ${email} (role: ${role})`);
        socket.disconnect();
        return;
      }

      const userId = user._id.toString();
    
      // Store user in onlineUsers map
      onlineUsers.set(userId, socket.id);
      socket.join(userId);
      console.log(` ${normalizedRole} joined room: ${userId}`);

      // Notify everyone about this user being online
      io.emit('userStatusUpdate', { userId: userId, online: true });

console.log(` Current online users count: ${onlineUsers.size}`);
console.log(` Online users:`, Array.from(onlineUsers.keys()));

if (normalizedRole === 'admin') {
  console.log(` Admin connected: ${email}`);
  
  // Wait a bit to ensure the admin socket is fully ready
  setTimeout(() => {
    const onlineUserIds = Array.from(onlineUsers.keys());
    console.log(` Emitting currentOnlineUsers to admin ${socket.id}:`, onlineUserIds);
        socket.emit('currentOnlineUsers', onlineUserIds);
    console.log(` Emission completed for admin ${email}`);
    
    // Also emit individual status updates as backup
    onlineUserIds.forEach(userId => {
      socket.emit('userStatusUpdate', { userId, online: true });
    });
  }, 500);
}

      // Handle manual join
      socket.on('join', (userId) => {
        console.log(` Joined chat room: ${userId}`);
        socket.join(userId);
      });

      // Handle sending real-time messages
      socket.on('send_message', async (msg) => {
        try {
          console.log(' Incoming message:', msg);

          const chat = await Chat.create({
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            message: msg.message,
          });

          console.log(` Message sent ${msg.senderId} → ${msg.receiverId}`);
          io.to(msg.receiverId.toString()).emit('receive_message', chat);

        } catch (err) {
          console.error('❌ Error saving message:', err);
        }
      });
      // Add this in the admin connection section
socket.on('requestOnlineUsers', () => {
  console.log(' Admin requested online users');
  const onlineUserIds = Array.from(onlineUsers.keys());
  socket.emit('currentOnlineUsers', onlineUserIds);
});

      socket.on('disconnect', () => {
        console.log(` ${user.email} disconnected`);
        onlineUsers.delete(userId);
        io.emit('userStatusUpdate', { userId: userId, online: false });
      });

    } catch (error) {
      console.error('❌ Socket connection error:', error);
      socket.disconnect();
    }
  });
}

function getIo() {
  if (!io) throw new Error("❌ Socket.io not initialized yet!");
  return io;
}

module.exports = { initializeSocket, getIo };
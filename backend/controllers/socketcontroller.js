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
onlineUsers.set(user._id.toString(), socket.id);
io.emit('userStatusUpdate', { userId: user._id, online: true });
      //  Join user’s private room
      socket.join(user._id.toString());
      console.log(` ${normalizedRole} joined room: ${user._id}`);
      if (normalizedRole === 'admin') {
        const currentOnlineUsers = Array.from(onlineUsers.keys());
        currentOnlineUsers.forEach((id) => {
          socket.emit('userStatusUpdate', { userId: id, online: true });
        });
        console.log(` Sent current online users to admin ${email}`);
      }


      //  Handle manual join (e.g., admin opening specific doctor/patient chat)
      socket.on('join', (userId) => {
        console.log(` Joined chat room: ${userId}`);
        socket.join(userId);
      });

      //  Handle sending real-time messages
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
          if (msg.senderId !== msg.receiverId) {
            io.to(msg.senderId.toString()).emit('message_delivered', chat);
          }

        } catch (err) {
          console.error('❌ Error saving message:', err);
        }
      });

      socket.on('disconnect', () => {
        console.log(` ${user.email} disconnected`);
onlineUsers.delete(user._id.toString());
io.emit('userStatusUpdate', { userId: user._id, online: false });

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

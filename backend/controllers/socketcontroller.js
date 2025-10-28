// const jwt = require('jsonwebtoken');
// const { User } = require('../models/users');
// const Doctor = require('../models/doctors');
// const Chat = require('../models/chat');
// const Message = require('../models/message');

// const onlineUsers = new Map();

// function initSocket(io) {
//   io.on('connection', async (socket) => {
//     const { token } = socket.handshake.auth || {};
//     let user = null;

//     try {
//       if (token) {
//         // 🧠 Decode token
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         // 🩺 Try fetching from doctor collection first
//         user = await Doctor.findById(decoded.id).lean();

//         // 👩‍⚕️ If not found, try fetching from User (patients)
//         if (!user) user = await User.findById(decoded.id).lean();

//         // 🧑‍💼 If not found, try admin
//         if (!user && decoded.role === 'admin') {
//           user = await Admin.findById(decoded.id).lean();
//         }

//         if (!user) throw new Error('User not found in any collection');
//       }
//     } catch (err) {
//       console.error('❌ Socket auth error:', err.message);
//     }

//     if (!user?.email) {
//       console.warn('⚠️ Socket connected without valid user data');
//       return;
//     }

//     socket.user = user;
//     console.log(`✅ [Socket] ${user.email} connected (${user.role || 'unknown'})`);

//     // ✅ Track online user
//     onlineUsers.set(user.email, socket.id);

//     // ✅ Notify everyone
//     io.emit('userStatusUpdate', { email: user.email, online: true });

//     // 🧩 Handle "openChatWith"
//     socket.on('openChatWith', async ({ otherUserId }) => {
//       try {
//         let chat = await Chat.findOne({
//           participants: { $all: [user._id, otherUserId], $size: 2 },
//         });

//         if (!chat) chat = await Chat.create({ participants: [user._id, otherUserId] });

//         socket.join(chat._id.toString());
//         socket.emit('chatOpened', chat);
//       } catch (error) {
//         console.error(' Error opening chat:', error);
//       }
//     });

//     // 🧩 Handle sending messages
//     socket.on('sendMessage', async ({ chatId, content }) => {
//       try {
//         const message = await Message.create({
//           chat: chatId,
//           sender: user._id,
//           content,
//         });

//         await Chat.findByIdAndUpdate(chatId, {
//           lastMessage: message._id,
//           updatedAt: Date.now(),
//         });

//         io.to(chatId).emit('newMessage', {
//           _id: message._id,
//           chat: chatId,
//           sender: user,
//           content: message.content,
//           createdAt: message.createdAt,
//         });
//       } catch (error) {
//         console.error(' Error sending message:', error);
//       }
//     });

//     // 🧩 Handle disconnect
//     socket.on('disconnect', () => {
//       console.log(`🔴 [Socket] ${user.email} disconnected`);
//       onlineUsers.delete(user.email);
//       io.emit('userStatusUpdate', { email: user.email, online: false });
//     });
//   });
// }

// module.exports = { initSocket };
// socketcontroller.js
const { Server } = require('socket.io');
const Chat = require('../models/chat');
const { User } = require('../models/users');
const Doctor = require('../models/doctors');

let io;

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:4200",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on('connection', async (socket) => {
    console.log('✅ New socket connected:', socket.id);

    const { token, role, email } = socket.handshake.auth || {};
    console.log(`🔐 Auth Data => role: ${role}, email: ${email}`);

    let user = null;

    try {
      // 🩺 Always normalize role lowercase to avoid casing issues
      const normalizedRole = role?.toLowerCase();

      if (normalizedRole === 'doctor') {
        user = await Doctor.findOne({ email });
      } else {
        // includes admin + patients, since admin is stored in User
        user = await User.findOne({ email });
      }

      if (!user) {
        console.warn(`⚠️ No user found in DB for email: ${email} (role: ${role})`);
        socket.disconnect();
        return;
      }
      user.online = true;
      await user.save();
      console.log(`🟢 ${user.email} is now online`);


// ✅ Emit status to all
io.emit('userStatusUpdate', { userId: user._id, online: true });
console.log(`📡 Emitted userStatusUpdate for ${user.email}`);

      // ✅ Join user’s private room
      socket.join(user._id.toString());
      console.log(`📥 ${normalizedRole} joined room: ${user._id}`);

      // ✅ Handle manual join (e.g., admin opening specific doctor/patient chat)
      socket.on('join', (userId) => {
        console.log(`👥 Joined chat room: ${userId}`);
        socket.join(userId);
      });

      // ✅ Handle sending real-time messages
      socket.on('send_message', async (msg) => {
        try {
          console.log('📨 Incoming message:', msg);

          const chat = await Chat.create({
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            message: msg.message,
          });

          console.log(`💬 Message sent ${msg.senderId} → ${msg.receiverId}`);

          // 🔥 Emit message to both rooms
          
          // io.to(msg.receiverId.toString()).emit('receive_message', chat);
          // io.to(msg.senderId.toString()).emit('receive_message', chat);
          io.to(msg.receiverId.toString()).emit('receive_message', chat); // send only to receiver

// optional: echo back to sender only if you need to update their own UI
if (msg.senderId !== msg.receiverId) {
  io.to(msg.senderId.toString()).emit('message_delivered', chat);
}

        } catch (err) {
          console.error('❌ Error saving message:', err);
        }
      });

      socket.on('disconnect', async () => {
  console.log(`❎ ${user.email} disconnected`);
  if (user) {
    user.online = false;
    await user.save();
        console.log(`🔴 ${user.email} is now offline`);

    io.emit('userStatusUpdate', { userId: user._id, online: false });
        console.log(`📡 Emitted userStatusUpdate for ${user.email}`);

  }
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

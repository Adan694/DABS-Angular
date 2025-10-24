// const jwt = require('jsonwebtoken');

// function authenticateToken(req, res, next) {
//     const authHeader = req.headers['authorization'];

//     if (!authHeader) {
//         return res.status(401).json({ message: 'Access token required' });
//     }

//     const token = authHeader.split(' ')[1]; 

//     if (!token) {
//         return res.status(403).json({ message: 'Token not found' });
//     }
//     jwt.verify(token, 'secret-123', (err, user) => {
//         if (err) {
//             console.log('JWT Error:', err); 
//             return res.status(403).json({ message: 'Invalid or expired token' });
//         }

//         req.user = user;
//         next();
//     });
// }

// // Middleware to authorize only admin users
// function authorizeAdmin(req, res, next) {
//     console.log('authorizeAdmin - req.user:', req.user);
//     if (req.user && req.user.role === 'admin') {
//         console.log('Admin access granted');
//         next();
//     } else {
//         console.log('Admin access denied');
//         return res.status(403).json({ message: 'Admin access required' });
//     }
// }
// module.exports = { authenticateToken, authorizeAdmin };
const jwt = require('jsonwebtoken');
const { User } = require('../models/users'); 

// HTTP middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'Access token required' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(403).json({ message: 'Token not found' });

    jwt.verify(token, process.env.JWT_SECRET || 'secret-123', (err, user) => {
        if (err) {
            console.log('JWT Error:', err); 
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// Admin check middleware
function authorizeAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: 'Admin access required' });
    }
}

// Socket.IO middleware
async function verifySocketToken(socket, next) {
  try {
    console.log('\n🟢 [Socket] Incoming connection attempt...');
    const token = socket.handshake.auth?.token;
    console.log('🔐 [Socket] Token received from client:', token ? token.slice(0, 25) + '...' : '❌ None');

    if (!token) {
      console.log('🚫 [Socket] No token provided');
      return next(new Error('Access token required for socket'));
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret-123');
    console.log('📦 [Socket] Decoded JWT payload:', payload);

    // 🧠 Check what’s inside payload
    if (!payload.email) {
      console.log('🚫 [Socket] No email found in JWT payload');
      return next(new Error('Invalid token payload: no email'));
    }

    // 🧩 Try finding user by email
    const user = await User.findOne({ email: payload.email });
    console.log('🔍 [Socket] DB lookup for email:', payload.email);
    console.log('📊 [Socket] DB result:', user ? `✅ Found (${user.role})` : '❌ Not found');

    if (!user) {
      return next(new Error('User not found'));
    }

    console.log('✅ [Socket] Authenticated user:', user.email, '| Role:', user.role);
    socket.user = user;
    next();

  } catch (err) {
    console.error('🔥 [Socket] Auth error:', err.message);
    next(new Error('Authentication error'));
  }
}

module.exports = { authenticateToken, authorizeAdmin, verifySocketToken };

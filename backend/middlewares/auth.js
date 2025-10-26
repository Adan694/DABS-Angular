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
    console.log('\n🟢 [Socket] Connection attempt...');
    const token = socket.handshake.auth?.token;

    if (!token) {
      console.warn('🚫 [Socket] No token provided');
      return next(new Error('Access token required for socket'));
    }

    // Decode JWT
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret-123');
    console.log('📦 [Socket] Token payload:', payload);

    let user = null;

    // Try finding the user in all relevant collections
    if (payload.role === 'doctor') {
      user = await Doctor.findOne({ email: payload.email });
    } else {
      user = await User.findOne({ email: payload.email });
    }

    if (!user) {
      console.warn(`⚠️ [Socket] User not found in DB for email: ${payload.email}`);
      // fallback: attach minimal info so socket still connects
      socket.user = { email: payload.email, role: payload.role || 'unknown' };
      return next(); 
    }

    socket.user = {
      _id: user._id,
      email: user.email,
      role: user.role,
      name: user.name || 'Unknown',
    };

    console.log(`✅ [Socket] Authenticated: ${user.email} (${user.role})`);
    next();

  } catch (err) {
    console.error('🔥 [Socket] Auth error:', err.message);
    next(new Error('Authentication error'));
  }
}


module.exports = { authenticateToken, authorizeAdmin, verifySocketToken };

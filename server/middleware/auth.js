const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { getInMemoryUserById } = require('../utils/inMemoryStore');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_jwt_key_123');

      if (mongoose.connection.readyState === 1) {
        req.user = await User.findById(decoded.id).select('-password');
      } else {
        req.user = getInMemoryUserById(decoded.id);
      }
      
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      return next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token validation failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
  }
};

module.exports = { protect };

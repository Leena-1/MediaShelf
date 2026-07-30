const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { registerInMemoryUser, loginInMemoryUser } = require('../utils/inMemoryStore');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_jwt_key_123', {
    expiresIn: '30d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill in all fields' });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (mongoose.connection.readyState === 1) {
      const userExists = await User.findOne({ email: cleanEmail });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }

      const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`;
      const user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        password,
        avatar
      });

      const userData = {
        _id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id)
      };
      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: userData,
        ...userData
      });
    } else {
      console.log('MongoDB disconnected — using in-memory registration fallback');
      const userData = await registerInMemoryUser(name, email, password);
      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: userData,
        ...userData
      });
    }
  } catch (error) {
    console.error('Registration error:', error.message);
    const status = error.message.includes('already exists') ? 400 : 500;
    return res.status(status).json({ success: false, message: error.message || 'Error registering user' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: cleanEmail });
      if (user && (await user.matchPassword(password))) {
        const userData = {
          _id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          token: generateToken(user._id)
        };
        return res.json({
          success: true,
          message: 'Login successful',
          data: userData,
          ...userData
        });
      } else {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
    } else {
      console.log('MongoDB disconnected — using in-memory login fallback');
      const userData = await loginInMemoryUser(email, password);
      return res.json({
        success: true,
        message: 'Login successful',
        data: userData,
        ...userData
      });
    }
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(401).json({ success: false, message: error.message || 'Invalid email or password' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me or GET /api/auth/profile
const getMe = async (req, res) => {
  try {
    const userObj = req.user.toObject ? req.user.toObject() : req.user;
    return res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: req.user,
      ...userObj
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving user profile', error: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
const logoutUser = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      data: {}
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error during logout', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getProfile: getMe,
  logoutUser
};

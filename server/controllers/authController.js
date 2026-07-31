const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { registerInMemoryUser, loginInMemoryUser, memoryStore } = require('../utils/inMemoryStore');
const { sendEmail, getPasswordResetTemplate, getEmailVerificationTemplate } = require('../utils/sendEmail');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_jwt_key_123', {
    expiresIn: '30d'
  });
};

// @desc    Register new user & send email verification link
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Generate Verification Token
    const unhashedVerificationToken = crypto.randomBytes(32).toString('hex');
    const hashedVerificationToken = crypto.createHash('sha256').update(unhashedVerificationToken).digest('hex');
    const verificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verifyUrl = `${clientUrl}/verify-email/${unhashedVerificationToken}`;

    if (mongoose.connection.readyState === 1) {
      const userExists = await User.findOne({ email: cleanEmail });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'An account with this email address already exists' });
      }

      const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`;
      const user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        password,
        avatar,
        isVerified: false,
        emailVerificationToken: hashedVerificationToken,
        emailVerificationExpire: verificationExpire
      });

      // Send verification email
      let emailPreviewUrl = null;
      try {
        const emailResult = await sendEmail({
          to: user.email,
          subject: 'MediaShelf - Verify Your Email Address',
          html: getEmailVerificationTemplate(verifyUrl)
        });
        if (emailResult && emailResult.previewUrl) emailPreviewUrl = emailResult.previewUrl;
      } catch (mailErr) {
        console.error('Failed to send verification email:', mailErr.message);
      }

      const devMsg = emailPreviewUrl
        ? `Registration successful! Click to view your verification email: ${emailPreviewUrl}`
        : 'Registration successful! Please check your email to verify your account.';

      return res.status(201).json({
        success: true,
        message: devMsg,
        emailSent: true,
        ...(emailPreviewUrl && process.env.NODE_ENV !== 'production' ? { emailPreviewUrl } : {})
      });
    } else {
      console.log('MongoDB disconnected — using in-memory registration fallback');
      const userData = await registerInMemoryUser(
        name,
        cleanEmail,
        password,
        false,
        hashedVerificationToken,
        verificationExpire
      );

      let emailPreviewUrlMem = null;
      try {
        const emailResultMem = await sendEmail({
          to: cleanEmail,
          subject: 'MediaShelf - Verify Your Email Address',
          html: getEmailVerificationTemplate(verifyUrl)
        });
        if (emailResultMem && emailResultMem.previewUrl) emailPreviewUrlMem = emailResultMem.previewUrl;
      } catch (mailErr) {
        console.error('Failed to send verification email:', mailErr.message);
      }

      const devMsgMem = emailPreviewUrlMem
        ? `Registration successful! Click to view your verification email: ${emailPreviewUrlMem}`
        : 'Registration successful! Please check your email to verify your account.';

      return res.status(201).json({
        success: true,
        message: devMsgMem,
        emailSent: true,
        ...(emailPreviewUrlMem && process.env.NODE_ENV !== 'production' ? { emailPreviewUrl: emailPreviewUrlMem } : {})
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

      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      // Check if user email is verified (allow legacy users without isVerified field)
      if (user.isVerified === false) {
        return res.status(401).json({
          success: false,
          isUnverified: true,
          message: 'Please verify your email address before logging in.'
        });
      }

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
      console.log('MongoDB disconnected — using in-memory login fallback');
      const userData = await loginInMemoryUser(cleanEmail, password);
      return res.json({
        success: true,
        message: 'Login successful',
        data: userData,
        ...userData
      });
    }
  } catch (error) {
    console.error('Login error:', error.message);
    if (error.isUnverified) {
      return res.status(401).json({
        success: false,
        isUnverified: true,
        message: error.message
      });
    }
    return res.status(401).json({ success: false, message: error.message || 'Invalid email or password' });
  }
};

// @desc    Verify email token
// @route   GET /api/auth/verify-email/:token
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is required' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpire: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired email verification link.'
        });
      }

      user.isVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpire = undefined;
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Your email has been verified successfully! You can now log in.'
      });
    } else {
      const user = memoryStore.users.find(
        (u) =>
          u.emailVerificationToken === hashedToken &&
          new Date(u.emailVerificationExpire).getTime() > Date.now()
      );

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired email verification link.'
        });
      }

      user.isVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpire = undefined;

      return res.status(200).json({
        success: true,
        message: 'Your email has been verified successfully! You can now log in.'
      });
    }
  } catch (error) {
    console.error('Email verification error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error during email verification' });
  }
};

// @desc    Resend email verification
// @route   POST /api/auth/resend-verification
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const genericMsg = 'If an unverified account with that email exists, a new verification link has been sent.';

    const unhashedVerificationToken = crypto.randomBytes(32).toString('hex');
    const hashedVerificationToken = crypto.createHash('sha256').update(unhashedVerificationToken).digest('hex');
    const verificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verifyUrl = `${clientUrl}/verify-email/${unhashedVerificationToken}`;

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: cleanEmail });

      if (user && !user.isVerified) {
        user.emailVerificationToken = hashedVerificationToken;
        user.emailVerificationExpire = verificationExpire;
        await user.save();

        await sendEmail({
          to: user.email,
          subject: 'MediaShelf - Verify Your Email Address',
          html: getEmailVerificationTemplate(verifyUrl)
        });
      }
    } else {
      const user = memoryStore.users.find((u) => u.email === cleanEmail);
      if (user && !user.isVerified) {
        user.emailVerificationToken = hashedVerificationToken;
        user.emailVerificationExpire = verificationExpire;

        await sendEmail({
          to: cleanEmail,
          subject: 'MediaShelf - Verify Your Email Address',
          html: getEmailVerificationTemplate(verifyUrl)
        });
      }
    }

    return res.status(200).json({ success: true, message: genericMsg });
  } catch (error) {
    console.error('Resend verification error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error resending verification email' });
  }
};

// @desc    Forgot password - Request reset link
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const genericResponseMsg = 'If an account with that email address exists, a password reset link has been sent.';

    // Generate random 32-byte token
    const resetToken = crypto.randomBytes(32).toString('hex');
    // Hash token using SHA-256 for secure database storage
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    // Expiry set to 15 minutes
    const resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    if (mongoose.connection.readyState === 1) {
      const emailRegex = new RegExp('^' + cleanEmail.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i');
      const user = await User.findOne({ email: emailRegex });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'No registered account found with that email address. Please check your email or create a new account.'
        });
      }

      user.resetPasswordToken = hashedResetToken;
      user.resetPasswordExpire = resetPasswordExpire;
      await user.save();

      let resetPreviewUrl = null;
      try {
        const resetEmailResult = await sendEmail({
          to: user.email,
          subject: 'MediaShelf - Password Reset Request',
          html: getPasswordResetTemplate(resetUrl)
        });
        if (resetEmailResult && resetEmailResult.previewUrl) resetPreviewUrl = resetEmailResult.previewUrl;
      } catch (emailErr) {
        console.error('Failed to send password reset email:', emailErr.message);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        return res.status(500).json({
          success: false,
          message: `Email sending failed: ${emailErr.message}`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Password reset link sent! Please check your email inbox.',
        ...(resetPreviewUrl && process.env.NODE_ENV !== 'production' ? { emailPreviewUrl: resetPreviewUrl } : {})
      });
    } else {
      console.log('MongoDB disconnected — using in-memory forgot-password fallback');
      const user = memoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'No registered account found with that email address. Please check your email or create a new account.'
        });
      }

      user.resetPasswordToken = hashedResetToken;
      user.resetPasswordExpire = resetPasswordExpire;

      let resetPreviewUrlMem = null;
      try {
        const resetEmailResultMem = await sendEmail({
          to: user.email,
          subject: 'MediaShelf - Password Reset Request',
          html: getPasswordResetTemplate(resetUrl)
        });
        if (resetEmailResultMem && resetEmailResultMem.previewUrl) resetPreviewUrlMem = resetEmailResultMem.previewUrl;
      } catch (emailErr) {
        console.error('Failed to send password reset email (in-memory):', emailErr.message);
        return res.status(500).json({
          success: false,
          message: `Email sending failed: ${emailErr.message}`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Password reset link sent! Please check your email inbox.',
        ...(resetPreviewUrlMem && process.env.NODE_ENV !== 'production' ? { emailPreviewUrl: resetPreviewUrlMem } : {})
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error processing password reset request' });
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
  try {
    const token = req.params.token || req.body.token;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Password reset token is missing' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    // Hash incoming token to match database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired password reset token. Please request a new reset link.'
        });
      }

      // Update password (pre-save hook will hash it with bcrypt)
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Password reset successfully! You can now log in with your new password.'
      });
    } else {
      console.log('MongoDB disconnected — using in-memory reset-password fallback');
      const user = memoryStore.users.find(
        (u) =>
          u.resetPasswordToken === hashedToken &&
          new Date(u.resetPasswordExpire).getTime() > Date.now()
      );

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired password reset token. Please request a new reset link.'
        });
      }

      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      return res.status(200).json({
        success: true,
        message: 'Password reset successfully! You can now log in with your new password.'
      });
    }
  } catch (error) {
    console.error('Reset password error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error resetting password' });
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
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getMe,
  getProfile: getMe,
  logoutUser
};

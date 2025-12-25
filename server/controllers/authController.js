const jwt = require('jsonwebtoken');
const User = require('../models/User');
const validator = require('validator');
const crypto = require('crypto');
const { sendEmail } = require('../services/notificationService');
const { sendEmailWithResend } = require('../services/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // Input validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }

  // Sanitize inputs
  const sanitizedEmail = validator.normalizeEmail(email);
  const sanitizedName = validator.escape(name);

  const userExists = await User.findOne({ email: sanitizedEmail });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({
    name: sanitizedName,
    email: sanitizedEmail,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }

  const sanitizedEmail = validator.normalizeEmail(email);

  const user = await User.findOne({ email: sanitizedEmail });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Forgot password - Send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide your email address' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const sanitizedEmail = validator.normalizeEmail(email);
    const user = await User.findOne({ email: sanitizedEmail });

    if (!user) {
      // Don't reveal if user exists or not (security best practice)
      return res.status(200).json({ 
        message: 'If an account exists with this email, you will receive a password reset link shortly.' 
      });
    }

    // Generate reset token
    const resetToken = user.generateResetToken();
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    // Send email with reset link
    const emailSubject = 'Password Reset Request - MedRemind AI';
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">Password Reset Request</h2>
        <p>Hello <strong>${user.name}</strong>,</p>
        <p>You requested to reset your password for your MedRemind AI account.</p>
        <p>Click the button below to reset your password (valid for 10 minutes):</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Reset Password</a>
        </div>
        <p>Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>Best regards,<br>MedRemind AI Team</p>
      </div>
    `;

    try {
      // Try Resend first (if configured), fallback to Nodemailer
      console.log('🔍 Attempting to send password reset email...');
      console.log('📧 Recipient:', user.email);
      console.log('🔑 RESEND_API_KEY configured:', !!process.env.RESEND_API_KEY);
      
      let emailResult;
      if (process.env.RESEND_API_KEY) {
        console.log('✉️  Using Resend to send email...');
        emailResult = await sendEmailWithResend(user.email, emailSubject, emailHtml);
      } else {
        console.log('✉️  Using Nodemailer to send email...');
        // Fallback to nodemailer (plain text)
        const emailText = `
Hello ${user.name},

You requested to reset your password for your MedRemind AI account.

Click the link below to reset your password (valid for 10 minutes):
${resetUrl}

If you didn't request this password reset, please ignore this email.

Best regards,
MedRemind AI Team
        `;
        emailResult = await sendEmail(user.email, emailSubject, emailText);
      }
      
      console.log('📬 Email result:', emailResult);
      
      if (emailResult.success) {
        console.log('✅ Password reset email sent successfully to:', user.email);
      } else {
        console.error('❌ Failed to send password reset email:', emailResult.error);
        // Still return success to user (security best practice)
      }
    } catch (emailError) {
      console.error('💥 Email sending error:', emailError);
      // Continue anyway (don't expose email sending errors to user)
    }
    
    res.status(200).json({
      message: 'If an account exists with this email, you will receive a password reset link shortly.',
      resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined, // Only show in dev
    });

  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!password) {
      return res.status(400).json({ message: 'Please provide a new password' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Hash the token to compare with database
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.status(200).json({
      message: 'Password reset successful. You can now login with your new password.',
    });

  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, forgotPassword, resetPassword };

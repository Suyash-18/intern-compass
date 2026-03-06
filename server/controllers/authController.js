const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Build user response with profile
 */
const buildUserResponse = async (user) => {
  const profile = await Profile.findOne({ userId: user._id });
  return {
    id: user._id,
    email: user.email,
    role: user.role,
    registrationStep: user.registrationStep,
    profile: profile || undefined,
  };
};

/**
 * POST /api/v1/auth/login
 * Login user with email and password
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);
    const userResponse = await buildUserResponse(user);

    res.json({ user: userResponse, token });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/register
 * Register a new intern
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role: 'intern',
      registrationStep: 2,
    });

    // Create profile
    await Profile.create({
      userId: user._id,
      name,
      email,
      mobile: mobile || '',
    });

    const token = generateToken(user._id);
    const userResponse = await buildUserResponse(user);

    res.status(201).json({ user: userResponse, token });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/logout
 * Logout user (client-side token removal, server can blacklist if needed)
 */
exports.logout = async (req, res, next) => {
  try {
    // In a production app, you'd blacklist the token here
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/refresh-token
 * Refresh JWT token
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const token = generateToken(req.user._id);
    res.json({ token });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/forgot-password
 * Send password reset email (placeholder)
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: 'If the email exists, a reset link has been sent.' });
    }

    // TODO: Implement email sending with reset token
    res.json({ message: 'If the email exists, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/reset-password
 * Reset password with token (placeholder)
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // TODO: Verify reset token and update password
    res.json({ message: 'Password reset successful.' });
  } catch (error) {
    next(error);
  }
};

const User = require('../models/User');
const Profile = require('../models/Profile');

/**
 * GET /api/v1/users/profile
 * Get current user's profile
 */
exports.getProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });

    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        registrationStep: req.user.registrationStep,
        profile: profile || undefined,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/users/profile
 * Update user profile (used during registration steps 2 & 3)
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'name', 'email', 'mobile', 'dob', 'address',
      'skills', 'domain', 'collegeName', 'degree', 'branch', 'yearOfPassing',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        registrationStep: req.user.registrationStep,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/users/registration-step
 * Update registration step
 */
exports.updateRegistrationStep = async (req, res, next) => {
  try {
    const { step } = req.body;
    const validSteps = [1, 2, 3, 'complete'];

    if (!validSteps.includes(step)) {
      return res.status(400).json({ message: 'Invalid registration step.' });
    }

    req.user.registrationStep = step;
    await req.user.save();

    const profile = await Profile.findOne({ userId: req.user._id });

    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        registrationStep: req.user.registrationStep,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/users/avatar
 * Upload user avatar (placeholder)
 */
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // TODO: Store avatar URL in profile
    const avatarUrl = `/uploads/${req.file.filename}`;

    res.json({ url: avatarUrl });
  } catch (error) {
    next(error);
  }
};

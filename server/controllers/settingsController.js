const User = require('../models/User');

/**
 * GET /api/v1/settings
 */
exports.getSettings = async (req, res, next) => {
  try {
    // Settings could be a separate collection; for now return user prefs
    res.json({
      settings: {
        email: req.user.email,
        role: req.user.role,
        notifications: {
          email: true,
          taskUpdates: true,
          reviews: true,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/settings
 */
exports.updateSettings = async (req, res, next) => {
  try {
    // TODO: Store in a Settings collection if needed
    res.json({ message: 'Settings updated.', settings: req.body });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/settings/password
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/settings/notifications
 */
exports.updateNotifications = async (req, res, next) => {
  try {
    // TODO: Store notification preferences
    res.json({ message: 'Notification preferences updated.', notifications: req.body });
  } catch (error) {
    next(error);
  }
};

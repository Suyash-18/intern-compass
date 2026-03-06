const User = require('../models/User');
const InternTask = require('../models/InternTask');
const Profile = require('../models/Profile');

/**
 * GET /api/v1/dashboard/intern-stats
 * Stats for the logged-in intern
 */
exports.internStats = async (req, res, next) => {
  try {
    const tasks = await InternTask.find({ internId: req.user._id });
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'approved').length;
    const currentTask = tasks.find((t) => t.status === 'in_progress' || t.status === 'pending');

    res.json({
      tasksCompleted: completed,
      tasksTotal: total,
      progressPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      currentTask: currentTask || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/dashboard/admin-stats
 * Overview stats for admin
 */
exports.adminStats = async (req, res, next) => {
  try {
    const totalInterns = await User.countDocuments({ role: 'intern' });
    const activeInterns = await User.countDocuments({ role: 'intern', registrationStep: 'complete' });

    const pendingReviews = await InternTask.countDocuments({ status: 'pending' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedToday = await InternTask.countDocuments({
      status: 'approved',
      reviewedAt: { $gte: today },
    });

    res.json({ totalInterns, activeInterns, pendingReviews, completedToday });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/dashboard/progress
 * Progress overview for admin
 */
exports.progressOverview = async (req, res, next) => {
  try {
    const interns = await User.find({ role: 'intern' });
    const progressData = await Promise.all(
      interns.map(async (intern) => {
        const profile = await Profile.findOne({ userId: intern._id });
        const tasks = await InternTask.find({ internId: intern._id });
        const completed = tasks.filter((t) => t.status === 'approved').length;
        return {
          internId: intern._id,
          name: profile?.name || intern.email,
          totalTasks: tasks.length,
          completedTasks: completed,
          progress: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
        };
      })
    );

    res.json({ progress: progressData });
  } catch (error) {
    next(error);
  }
};

const User = require('../models/User');
const Profile = require('../models/Profile');
const InternTask = require('../models/InternTask');

/**
 * GET /api/v1/reports/summary
 */
exports.summary = async (req, res, next) => {
  try {
    const totalInterns = await User.countDocuments({ role: 'intern' });
    const totalTasks = await InternTask.countDocuments();
    const approvedTasks = await InternTask.countDocuments({ status: 'approved' });
    const rejectedTasks = await InternTask.countDocuments({ status: 'rejected' });
    const pendingTasks = await InternTask.countDocuments({ status: 'pending' });

    res.json({
      totalInterns,
      totalTasks,
      approvedTasks,
      rejectedTasks,
      pendingTasks,
      approvalRate: totalTasks > 0 ? Math.round((approvedTasks / totalTasks) * 100) : 0,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/reports/intern-progress
 */
exports.internProgress = async (req, res, next) => {
  try {
    const interns = await User.find({ role: 'intern' });
    const progress = await Promise.all(
      interns.map(async (intern) => {
        const profile = await Profile.findOne({ userId: intern._id });
        const tasks = await InternTask.find({ internId: intern._id });
        const completed = tasks.filter((t) => t.status === 'approved').length;
        return {
          id: intern._id,
          name: profile?.name || intern.email,
          domain: profile?.domain || '',
          total: tasks.length,
          completed,
          percentage: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
        };
      })
    );

    res.json({ progress });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/reports/task-completion
 */
exports.taskCompletion = async (req, res, next) => {
  try {
    const statuses = ['locked', 'in_progress', 'pending', 'approved', 'rejected'];
    const completion = {};
    for (const status of statuses) {
      completion[status] = await InternTask.countDocuments({ status });
    }
    res.json({ completion });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/reports/domain-distribution
 */
exports.domainDistribution = async (req, res, next) => {
  try {
    const distribution = await Profile.aggregate([
      { $match: { domain: { $ne: '' } } },
      { $group: { _id: '$domain', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      domains: distribution.map((d) => ({ domain: d._id, count: d.count })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/reports/export/pdf
 * Placeholder for PDF export
 */
exports.exportPDF = async (req, res, next) => {
  try {
    // TODO: Use pdfkit or puppeteer for real PDF generation
    res.status(501).json({ message: 'PDF export not yet implemented. Install pdfkit for this feature.' });
  } catch (error) {
    next(error);
  }
};

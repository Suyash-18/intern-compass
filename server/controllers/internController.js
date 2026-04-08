const User = require('../models/User');
const Profile = require('../models/Profile');
const InternTask = require('../models/InternTask');
const Attachment = require('../models/Attachment');

/**
 * Build intern object with profile and tasks
 */
const buildInternObject = async (user) => {
  const profile = await Profile.findOne({ userId: user._id });
  const tasks = await InternTask.find({ internId: user._id }).sort('orderIndex');

  // Get attachments for each task
  const tasksWithAttachments = await Promise.all(
    tasks.map(async (task) => {
      const attachments = await Attachment.find({ internTaskId: task._id });
      return {
        id: task._id,
        title: task.title,
        description: task.description,
        category: task.category,
        status: task.status,
        feedback: task.feedback,
        submissionNote: task.submissionNote,
        submittedAt: task.submittedAt,
        reviewedAt: task.reviewedAt,
        lockType: task.lockType,
        unlockAfterTaskId: task.unlockAfterTaskId,
        unlockDate: task.unlockDate,
        attachments,
      };
    })
  );

  return {
    id: user._id,
    profile: profile || {},
    tasks: tasksWithAttachments,
    registrationCompleted: user.registrationStep === 'complete',
    registeredAt: user.createdAt,
  };
};

/**
 * GET /api/v1/interns
 * List all interns with pagination
 */
exports.getInterns = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || '-createdAt';

    const total = await User.countDocuments({ role: 'intern' });
    const users = await User.find({ role: 'intern' })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const interns = await Promise.all(users.map(buildInternObject));

    res.json({ interns, total, page, limit });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/interns/:id
 * Get single intern by ID
 */
exports.getInternById = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'intern' });
    if (!user) {
      return res.status(404).json({ message: 'Intern not found.' });
    }

    const intern = await buildInternObject(user);
    res.json({ intern });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/interns/:id
 * Update intern details
 */
exports.updateIntern = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'intern' });
    if (!user) {
      return res.status(404).json({ message: 'Intern not found.' });
    }

    if (req.body.profile) {
      await Profile.findOneAndUpdate(
        { userId: user._id },
        { $set: req.body.profile },
        { new: true, upsert: true }
      );
    }

    const intern = await buildInternObject(user);
    res.json({ intern });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/interns/:id
 * Delete intern and all related data
 */
exports.deleteIntern = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'intern' });
    if (!user) {
      return res.status(404).json({ message: 'Intern not found.' });
    }

    // Delete all related data
    const tasks = await InternTask.find({ internId: user._id });
    await Attachment.deleteMany({ internTaskId: { $in: tasks.map((t) => t._id) } });
    await InternTask.deleteMany({ internId: user._id });
    await Profile.deleteOne({ userId: user._id });
    await User.deleteOne({ _id: user._id });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/interns/search?q=query
 * Search interns by name, email, or domain
 */
exports.searchInterns = async (req, res, next) => {
  try {
    const query = req.query.q || '';
    if (!query) {
      return res.json({ interns: [] });
    }

    const profiles = await Profile.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { domain: { $regex: query, $options: 'i' } },
      ],
    });

    const userIds = profiles.map((p) => p.userId);
    const users = await User.find({ _id: { $in: userIds }, role: 'intern' });
    const interns = await Promise.all(users.map(buildInternObject));

    res.json({ interns });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/interns/export/csv
 * Export interns data as CSV
 */
exports.exportCSV = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'intern' });
    const interns = await Promise.all(users.map(buildInternObject));

    // Build CSV
    const headers = 'Name,Email,Mobile,Domain,College,Degree,Branch,Year,Tasks Completed,Registration';
    const rows = interns.map((intern) => {
      const p = intern.profile;
      const completed = intern.tasks.filter((t) => t.status === 'approved').length;
      return `"${p.name}","${p.email}","${p.mobile}","${p.domain}","${p.collegeName}","${p.degree}","${p.branch}","${p.yearOfPassing}",${completed},"${intern.registrationCompleted ? 'Complete' : 'Incomplete'}"`;
    });

    const csv = [headers, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=interns.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/interns/export/excel
 * Export interns data as Excel (returns CSV with .xlsx extension for now)
 */
exports.exportExcel = async (req, res, next) => {
  try {
    // For full Excel support, install 'xlsx' package
    // This returns CSV as a simple fallback
    return exports.exportCSV(req, res, next);
  } catch (error) {
    next(error);
  }
};

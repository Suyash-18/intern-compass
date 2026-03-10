const InternTask = require('../models/InternTask');
const TaskTemplate = require('../models/TaskTemplate');
const Attachment = require('../models/Attachment');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

/**
 * GET /api/v1/tasks
 * Get tasks for the logged-in intern
 */
exports.getTasks = async (req, res, next) => {
  try {
    const tasks = await InternTask.find({ internId: req.user._id }).sort('orderIndex');

    const tasksWithAttachments = await Promise.all(
      tasks.map(async (task) => {
        const attachments = await Attachment.find({ internTaskId: task._id });
        return {
          id: task._id,
          title: task.title,
          description: task.description,
          status: task.status,
          feedback: task.feedback,
          submittedAt: task.submittedAt,
          reviewedAt: task.reviewedAt,
          attachments,
        };
      })
    );

    res.json({ tasks: tasksWithAttachments });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/tasks/:id
 * Get single task
 */
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await InternTask.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const attachments = await Attachment.find({ internTaskId: task._id });

    res.json({
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        feedback: task.feedback,
        submittedAt: task.submittedAt,
        reviewedAt: task.reviewedAt,
        attachments,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/tasks
 * Create a new task (Admin)
 */
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, internId, orderIndex, lockType, unlockAfterTaskId, unlockDate } = req.body;

    const resolvedLockType = lockType || 'sequential';
    const existingCount = await InternTask.countDocuments({ internId });
    const idx = orderIndex != null ? orderIndex : existingCount;

    // Determine initial status based on lock type
    let initialStatus = 'locked';
    if (resolvedLockType === 'open') {
      initialStatus = 'in_progress';
    } else if (resolvedLockType === 'sequential' && idx === 0) {
      initialStatus = 'in_progress';
    } else if (resolvedLockType === 'until_date' && unlockDate && new Date(unlockDate) <= new Date()) {
      initialStatus = 'in_progress';
    }

    const task = await InternTask.create({
      title,
      description,
      internId,
      orderIndex: idx,
      lockType: resolvedLockType,
      unlockAfterTaskId: resolvedLockType === 'after_task' ? unlockAfterTaskId : null,
      unlockDate: resolvedLockType === 'until_date' ? unlockDate : null,
      status: initialStatus,
    });

    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/tasks/:id
 * Update a task (Admin)
 */
exports.updateTask = async (req, res, next) => {
  try {
    const task = await InternTask.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.json({ task });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/tasks/:id
 * Delete a task (Admin)
 */
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await InternTask.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Delete attachments
    const attachments = await Attachment.find({ internTaskId: task._id });
    for (const att of attachments) {
      const filePath = path.join(__dirname, '..', att.url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await Attachment.deleteMany({ internTaskId: task._id });
    await InternTask.deleteOne({ _id: task._id });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/tasks/:id/submit
 * Intern submits task for review
 */
exports.submitTask = async (req, res, next) => {
  try {
    const task = await InternTask.findOne({ _id: req.params.id, internId: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    if (task.status !== 'in_progress' && task.status !== 'rejected') {
      return res.status(400).json({ message: 'Task cannot be submitted in its current state.' });
    }

    task.status = 'pending';
    task.submittedAt = new Date();
    task.feedback = '';
    await task.save();

    const attachments = await Attachment.find({ internTaskId: task._id });

    res.json({
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        feedback: task.feedback,
        submittedAt: task.submittedAt,
        reviewedAt: task.reviewedAt,
        attachments,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/tasks/:id/review
 * Admin reviews (approve/reject) a task
 * IMPORTANT: On approval, unlocks the next sequential task
 */
exports.reviewTask = async (req, res, next) => {
  try {
    const { status, feedback } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected.' });
    }

    const task = await InternTask.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    if (task.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending tasks can be reviewed.' });
    }

    task.status = status;
    task.feedback = feedback || '';
    task.reviewedAt = new Date();
    await task.save();

    // If approved, unlock the next sequential task
    if (status === 'approved') {
      const allTasks = await InternTask.find({ internId: task.internId }).sort('orderIndex');
      const currentIndex = allTasks.findIndex((t) => t._id.equals(task._id));

      if (currentIndex !== -1 && currentIndex + 1 < allTasks.length) {
        const nextTask = allTasks[currentIndex + 1];
        if (nextTask.status === 'locked') {
          nextTask.status = 'in_progress';
          await nextTask.save();
        }
      }
    }

    const attachments = await Attachment.find({ internTaskId: task._id });

    res.json({
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        feedback: task.feedback,
        submittedAt: task.submittedAt,
        reviewedAt: task.reviewedAt,
        attachments,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/tasks/:id/attachments
 * Upload attachment to a task
 */
exports.uploadAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const task = await InternTask.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Determine file type
    const ext = path.extname(req.file.originalname).toLowerCase();
    let fileType = 'other';
    if (ext === '.pdf') fileType = 'pdf';
    else if (['.png', '.jpg', '.jpeg', '.gif'].includes(ext)) fileType = 'image';
    else if (ext === '.zip') fileType = 'zip';

    const attachment = await Attachment.create({
      internTaskId: task._id,
      name: req.file.originalname,
      type: fileType,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
      mimeType: req.file.mimetype,
    });

    res.status(201).json({ attachment });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/tasks/:taskId/attachments/:attachmentId
 * Delete an attachment
 */
exports.deleteAttachment = async (req, res, next) => {
  try {
    const attachment = await Attachment.findOne({
      _id: req.params.attachmentId,
      internTaskId: req.params.taskId,
    });

    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found.' });
    }

    // Delete physical file
    const filePath = path.join(__dirname, '..', attachment.url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await Attachment.deleteOne({ _id: attachment._id });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/tasks/:taskId/attachments/:attachmentId/download
 * Download an attachment file
 */
exports.downloadAttachment = async (req, res, next) => {
  try {
    const attachment = await Attachment.findOne({
      _id: req.params.attachmentId,
      internTaskId: req.params.taskId,
    });

    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found.' });
    }

    const filePath = path.join(__dirname, '..', attachment.url);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server.' });
    }

    res.download(filePath, attachment.name);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/tasks/assign
 * Assign a task template to intern(s)
 */
exports.assignTask = async (req, res, next) => {
  try {
    const { templateId, internIds } = req.body;

    const template = await TaskTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({ message: 'Task template not found.' });
    }

    const tasks = [];
    for (const internId of internIds) {
      const user = await User.findOne({ _id: internId, role: 'intern' });
      if (!user) continue;

      // Count existing tasks to determine order
      const existingCount = await InternTask.countDocuments({ internId });

      const task = await InternTask.create({
        internId,
        taskTemplateId: template._id,
        title: template.title,
        description: template.description,
        orderIndex: existingCount,
        status: existingCount === 0 ? 'in_progress' : 'locked',
      });
      tasks.push(task);
    }

    res.status(201).json({ tasks });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/tasks/bulk-assign
 * Assign multiple templates to multiple interns
 */
exports.bulkAssign = async (req, res, next) => {
  try {
    const { templateIds, internIds } = req.body;

    const templates = await TaskTemplate.find({ _id: { $in: templateIds } }).sort('orderIndex');
    if (!templates.length) {
      return res.status(404).json({ message: 'No task templates found.' });
    }

    const allTasks = [];
    for (const internId of internIds) {
      const user = await User.findOne({ _id: internId, role: 'intern' });
      if (!user) continue;

      const existingCount = await InternTask.countDocuments({ internId });

      for (let i = 0; i < templates.length; i++) {
        const template = templates[i];
        const orderIndex = existingCount + i;

        const task = await InternTask.create({
          internId,
          taskTemplateId: template._id,
          title: template.title,
          description: template.description,
          orderIndex,
          status: existingCount === 0 && i === 0 ? 'in_progress' : 'locked',
        });
        allTasks.push(task);
      }
    }

    res.status(201).json({ tasks: allTasks });
  } catch (error) {
    next(error);
  }
};

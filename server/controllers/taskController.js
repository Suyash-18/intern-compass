const InternTask = require('../models/InternTask');
const TaskTemplate = require('../models/TaskTemplate');
const Attachment = require('../models/Attachment');
const User = require('../models/User');
const path = require('path');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');

/**
 * Build task response with separated attachments
 */
const buildTaskResponse = async (task) => {
  const allAttachments = await Attachment.find({ internTaskId: task._id });
  const taskAttachments = allAttachments.filter(a => a.source === 'template');
  const submissionAttachments = allAttachments.filter(a => a.source === 'submission');
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
    attachments: allAttachments,
    taskAttachments,
    submissionAttachments,
  };
};

 * GET /api/v1/tasks
 */
exports.getTasks = async (req, res, next) => {
  try {
    const tasks = await InternTask.find({ internId: req.user._id }).sort('orderIndex');

    // Auto-unlock date-based tasks
    const now = new Date();
    for (const task of tasks) {
      if (task.status === 'locked' && task.lockType === 'until_date' && task.unlockDate && new Date(task.unlockDate) <= now) {
        task.status = 'in_progress';
        await task.save();
      }
    }

    const tasksWithAttachments = await Promise.all(tasks.map(buildTaskResponse));

    res.json({ tasks: tasksWithAttachments });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/tasks/:id
 */
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await InternTask.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    const taskResponse = await buildTaskResponse(task);
    res.json({ task: taskResponse });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/tasks
 */
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, internId, orderIndex, lockType, unlockAfterTaskId, unlockDate } = req.body;

    const resolvedLockType = lockType || 'sequential';
    const existingCount = await InternTask.countDocuments({ internId });
    const idx = orderIndex != null ? orderIndex : existingCount;

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
 */
exports.updateTask = async (req, res, next) => {
  try {
    const task = await InternTask.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json({ task });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/tasks/:id
 */
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await InternTask.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    // Delete attachments from Cloudinary
    const attachments = await Attachment.find({ internTaskId: task._id });
    for (const att of attachments) {
      if (att.publicId) {
        await deleteFromCloudinary(att.publicId, att.type === 'image' ? 'image' : 'raw');
      }
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
 */
exports.submitTask = async (req, res, next) => {
  try {
    const task = await InternTask.findOne({ _id: req.params.id, internId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (task.status !== 'in_progress' && task.status !== 'rejected') {
      return res.status(400).json({ message: 'Task cannot be submitted in its current state.' });
    }

    task.status = 'pending';
    task.submittedAt = new Date();
    task.feedback = '';
    if (req.body.submissionNote !== undefined) {
      task.submissionNote = req.body.submissionNote;
    }
    await task.save();

    const attachments = await Attachment.find({ internTaskId: task._id });
    res.json({
      task: {
        id: task._id, title: task.title, description: task.description,
        status: task.status, feedback: task.feedback,
        submissionNote: task.submissionNote,
        submittedAt: task.submittedAt, reviewedAt: task.reviewedAt, attachments,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/tasks/:id/review
 */
exports.reviewTask = async (req, res, next) => {
  try {
    const { status, feedback } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected.' });
    }

    const task = await InternTask.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    if (task.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending tasks can be reviewed.' });
    }

    task.status = status;
    task.feedback = feedback || '';
    task.reviewedAt = new Date();
    await task.save();

    if (status === 'approved') {
      // Unlock tasks that depend on this specific task
      const dependentTasks = await InternTask.find({
        internId: task.internId, lockType: 'after_task',
        unlockAfterTaskId: task._id, status: 'locked',
      });
      for (const depTask of dependentTasks) {
        depTask.status = 'in_progress';
        await depTask.save();
      }

      // Unlock next sequential task
      const allTasks = await InternTask.find({
        internId: task.internId, lockType: 'sequential',
      }).sort('orderIndex');
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
        id: task._id, title: task.title, description: task.description,
        status: task.status, feedback: task.feedback,
        submittedAt: task.submittedAt, reviewedAt: task.reviewedAt, attachments,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/tasks/:id/attachments
 * Upload attachment to Cloudinary
 */
exports.uploadAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const task = await InternTask.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: `prima-interns/tasks/${task._id}`,
    });

    const ext = path.extname(req.file.originalname).toLowerCase();
    let fileType = 'other';
    if (ext === '.pdf') fileType = 'pdf';
    else if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) fileType = 'image';
    else if (ext === '.zip') fileType = 'zip';

    const attachment = await Attachment.create({
      internTaskId: task._id,
      name: req.file.originalname,
      type: fileType,
      size: req.file.size,
      url: result.secure_url,
      publicId: result.public_id,
      mimeType: req.file.mimetype,
      source: 'submission',
    });

    res.status(201).json({ attachment });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/tasks/:taskId/attachments/:attachmentId
 */
exports.deleteAttachment = async (req, res, next) => {
  try {
    const attachment = await Attachment.findOne({
      _id: req.params.attachmentId,
      internTaskId: req.params.taskId,
    });
    if (!attachment) return res.status(404).json({ message: 'Attachment not found.' });

    // Delete from Cloudinary
    if (attachment.publicId) {
      await deleteFromCloudinary(attachment.publicId, attachment.type === 'image' ? 'image' : 'raw');
    }

    await Attachment.deleteOne({ _id: attachment._id });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/tasks/:taskId/attachments/:attachmentId/download
 * Redirect to Cloudinary URL
 */
exports.downloadAttachment = async (req, res, next) => {
  try {
    const attachment = await Attachment.findOne({
      _id: req.params.attachmentId,
      internTaskId: req.params.taskId,
    });
    if (!attachment) return res.status(404).json({ message: 'Attachment not found.' });

    // Redirect to Cloudinary URL for download
    res.redirect(attachment.url);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/tasks/assign
 */
exports.assignTask = async (req, res, next) => {
  try {
    const { templateId, internIds, lockType, unlockAfterTaskId, unlockDate } = req.body;

    const template = await TaskTemplate.findById(templateId);
    if (!template) return res.status(404).json({ message: 'Task template not found.' });

    const resolvedLockType = lockType || 'sequential';
    const tasks = [];
    for (const internId of internIds) {
      const user = await User.findOne({ _id: internId, role: 'intern' });
      if (!user) continue;

      const existingCount = await InternTask.countDocuments({ internId });

      let initialStatus = 'locked';
      if (resolvedLockType === 'open') initialStatus = 'in_progress';
      else if (resolvedLockType === 'sequential' && existingCount === 0) initialStatus = 'in_progress';
      else if (resolvedLockType === 'until_date' && unlockDate && new Date(unlockDate) <= new Date()) initialStatus = 'in_progress';

      const task = await InternTask.create({
        internId, taskTemplateId: template._id,
        title: template.title, description: template.description,
        category: template.category || '',
        orderIndex: existingCount, lockType: resolvedLockType,
        unlockAfterTaskId: resolvedLockType === 'after_task' ? unlockAfterTaskId : null,
        unlockDate: resolvedLockType === 'until_date' ? unlockDate : null,
        status: initialStatus,
      });

      // Copy template attachments to the new task
      if (template.attachments && template.attachments.length > 0) {
        for (const att of template.attachments) {
          await Attachment.create({
            internTaskId: task._id,
            name: att.name,
            type: att.type,
            size: att.size,
            url: att.url,
            publicId: att.publicId || '',
            mimeType: att.mimeType,
          });
        }
      }

      tasks.push(task);
    }

    res.status(201).json({ tasks });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/tasks/bulk-assign
 */
exports.bulkAssign = async (req, res, next) => {
  try {
    const { templateIds, internIds, lockType, unlockDate } = req.body;

    const templates = await TaskTemplate.find({ _id: { $in: templateIds } }).sort('orderIndex');
    if (!templates.length) return res.status(404).json({ message: 'No task templates found.' });

    const resolvedLockType = lockType || 'sequential';
    const allTasks = [];
    for (const internId of internIds) {
      const user = await User.findOne({ _id: internId, role: 'intern' });
      if (!user) continue;

      const existingCount = await InternTask.countDocuments({ internId });

      for (let i = 0; i < templates.length; i++) {
        const template = templates[i];
        const orderIndex = existingCount + i;

        let initialStatus = 'locked';
        if (resolvedLockType === 'open') initialStatus = 'in_progress';
        else if (resolvedLockType === 'sequential' && existingCount === 0 && i === 0) initialStatus = 'in_progress';
        else if (resolvedLockType === 'until_date' && unlockDate && new Date(unlockDate) <= new Date()) initialStatus = 'in_progress';

        const task = await InternTask.create({
          internId, taskTemplateId: template._id,
          title: template.title, description: template.description,
          category: template.category || '',
          orderIndex, lockType: resolvedLockType,
          unlockAfterTaskId: null,
          unlockDate: resolvedLockType === 'until_date' ? unlockDate : null,
          status: initialStatus,
        });

        // Copy template attachments to the new task
        if (template.attachments && template.attachments.length > 0) {
          for (const att of template.attachments) {
            await Attachment.create({
              internTaskId: task._id,
              name: att.name,
              type: att.type,
              size: att.size,
              url: att.url,
              publicId: att.publicId || '',
              mimeType: att.mimeType,
            });
          }
        }

        allTasks.push(task);
      }
    }

    res.status(201).json({ tasks: allTasks });
  } catch (error) {
    next(error);
  }
};

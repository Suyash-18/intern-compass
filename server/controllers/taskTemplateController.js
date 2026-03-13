const TaskTemplate = require('../models/TaskTemplate');
const path = require('path');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');

/**
 * GET /api/v1/task-templates
 */
exports.getTemplates = async (req, res, next) => {
  try {
    const templates = await TaskTemplate.find().sort('orderIndex');
    const mapped = templates.map(t => {
      const obj = t.toObject();
      obj.id = obj._id;
      return obj;
    });
    res.json({ templates: mapped });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/task-templates/:id
 */
exports.getTemplateById = async (req, res, next) => {
  try {
    const template = await TaskTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found.' });
    const obj = template.toObject();
    obj.id = obj._id;
    res.json({ template: obj });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/task-templates
 */
exports.createTemplate = async (req, res, next) => {
  try {
    const { title, description, category, estimatedDays, orderIndex, priority } = req.body;
    const count = await TaskTemplate.countDocuments();

    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, {
          folder: 'prima-interns/templates',
        });

        const ext = path.extname(file.originalname).toLowerCase();
        let fileType = 'other';
        if (ext === '.pdf') fileType = 'pdf';
        else if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) fileType = 'image';
        else if (ext === '.zip') fileType = 'zip';

        attachments.push({
          name: file.originalname,
          type: fileType,
          size: file.size,
          url: result.secure_url,
          publicId: result.public_id,
          mimeType: file.mimetype,
        });
      }
    }

    const template = await TaskTemplate.create({
      title, description,
      category: category || '',
      estimatedDays: estimatedDays ? parseInt(estimatedDays) : 1,
      orderIndex: orderIndex ?? count,
      priority: priority || 'medium',
      attachments,
    });

    const obj = template.toObject();
    obj.id = obj._id;
    res.status(201).json({ template: obj });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/task-templates/:id
 */
exports.updateTemplate = async (req, res, next) => {
  try {
    const template = await TaskTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found.' });

    const { title, description, category, estimatedDays, priority, removeAttachmentIds } = req.body;

    if (title) template.title = title;
    if (description) template.description = description;
    if (category !== undefined) template.category = category;
    if (estimatedDays) template.estimatedDays = parseInt(estimatedDays);
    if (priority) template.priority = priority;

    // Remove specified attachments from Cloudinary
    if (removeAttachmentIds) {
      const idsToRemove = JSON.parse(removeAttachmentIds);
      for (const att of template.attachments) {
        if (idsToRemove.includes(att._id.toString()) && att.publicId) {
          await deleteFromCloudinary(att.publicId, att.type === 'image' ? 'image' : 'raw');
        }
      }
      template.attachments = template.attachments.filter(
        (a) => !idsToRemove.includes(a._id.toString())
      );
    }

    // Add new files via Cloudinary
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, {
          folder: 'prima-interns/templates',
        });

        const ext = path.extname(file.originalname).toLowerCase();
        let fileType = 'other';
        if (ext === '.pdf') fileType = 'pdf';
        else if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) fileType = 'image';
        else if (ext === '.zip') fileType = 'zip';

        template.attachments.push({
          name: file.originalname,
          type: fileType,
          size: file.size,
          url: result.secure_url,
          publicId: result.public_id,
          mimeType: file.mimetype,
        });
      }
    }

    await template.save();
    const obj = template.toObject();
    obj.id = obj._id;
    res.json({ template: obj });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/task-templates/:id
 */
exports.deleteTemplate = async (req, res, next) => {
  try {
    const template = await TaskTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found.' });

    // Delete attachment files from Cloudinary
    for (const att of template.attachments) {
      if (att.publicId) {
        await deleteFromCloudinary(att.publicId, att.type === 'image' ? 'image' : 'raw');
      }
    }

    await TaskTemplate.deleteOne({ _id: template._id });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/task-templates/:id/duplicate
 */
exports.duplicateTemplate = async (req, res, next) => {
  try {
    const original = await TaskTemplate.findById(req.params.id);
    if (!original) return res.status(404).json({ message: 'Template not found.' });

    const count = await TaskTemplate.countDocuments();
    const duplicate = await TaskTemplate.create({
      title: `${original.title} (Copy)`,
      description: original.description,
      category: original.category,
      estimatedDays: original.estimatedDays,
      orderIndex: count,
      priority: original.priority,
      attachments: original.attachments.map((a) => ({
        name: a.name,
        type: a.type,
        size: a.size,
        url: a.url,
        publicId: a.publicId,
        mimeType: a.mimeType,
      })),
    });

    const obj = duplicate.toObject();
    obj.id = obj._id;
    res.status(201).json({ template: obj });
  } catch (error) {
    next(error);
  }
};

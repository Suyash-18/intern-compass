const TaskTemplate = require('../models/TaskTemplate');

/**
 * GET /api/v1/task-templates
 */
exports.getTemplates = async (req, res, next) => {
  try {
    const templates = await TaskTemplate.find().sort('orderIndex');
    res.json({ templates });
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
    res.json({ template });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/task-templates
 */
exports.createTemplate = async (req, res, next) => {
  try {
    const { title, description, orderIndex, priority } = req.body;
    const count = await TaskTemplate.countDocuments();
    const template = await TaskTemplate.create({
      title,
      description,
      orderIndex: orderIndex ?? count,
      priority: priority || 'medium',
    });
    res.status(201).json({ template });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/task-templates/:id
 */
exports.updateTemplate = async (req, res, next) => {
  try {
    const template = await TaskTemplate.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!template) return res.status(404).json({ message: 'Template not found.' });
    res.json({ template });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/task-templates/:id
 */
exports.deleteTemplate = async (req, res, next) => {
  try {
    const template = await TaskTemplate.findByIdAndDelete(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found.' });
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
      orderIndex: count,
      priority: original.priority,
    });
    res.status(201).json({ template: duplicate });
  } catch (error) {
    next(error);
  }
};

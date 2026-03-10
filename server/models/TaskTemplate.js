const mongoose = require('mongoose');

const templateAttachmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['pdf', 'image', 'zip', 'other'], default: 'other' },
  size: { type: Number, required: true },
  url: { type: String, required: true },
  mimeType: { type: String, required: true },
});

const taskTemplateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
    },
    category: {
      type: String,
      default: '',
    },
    estimatedDays: {
      type: Number,
      default: 1,
    },
    orderIndex: {
      type: Number,
      required: true,
      default: 0,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    attachments: [templateAttachmentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('TaskTemplate', taskTemplateSchema);

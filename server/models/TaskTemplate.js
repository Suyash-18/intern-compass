const mongoose = require('mongoose');

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
  },
  { timestamps: true }
);

module.exports = mongoose.model('TaskTemplate', taskTemplateSchema);

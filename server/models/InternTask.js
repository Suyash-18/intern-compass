const mongoose = require('mongoose');

const internTaskSchema = new mongoose.Schema(
  {
    internId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    taskTemplateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TaskTemplate',
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
    },
    status: {
      type: String,
      enum: ['locked', 'in_progress', 'pending', 'approved', 'rejected'],
      default: 'locked',
    },
    orderIndex: {
      type: Number,
      default: 0,
    },
    feedback: { type: String, default: '' },
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

// Index for efficient queries
internTaskSchema.index({ internId: 1, orderIndex: 1 });

module.exports = mongoose.model('InternTask', internTaskSchema);

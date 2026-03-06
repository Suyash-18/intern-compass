const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema(
  {
    internTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InternTask',
      required: true,
    },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['pdf', 'image', 'zip', 'other'],
      required: true,
    },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    mimeType: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attachment', attachmentSchema);

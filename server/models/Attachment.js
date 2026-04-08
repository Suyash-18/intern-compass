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
    publicId: { type: String, default: '' }, // Cloudinary public_id for deletion
    mimeType: { type: String, required: true },
    source: {
      type: String,
      enum: ['template', 'submission'],
      default: 'template',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attachment', attachmentSchema);

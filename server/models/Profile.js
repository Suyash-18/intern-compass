const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    mobile: { type: String, default: '' },
    dob: { type: String, default: '' },
    address: { type: String, default: '' },
    skills: [{ type: String }],
    domain: { type: String, default: '' },
    collegeName: { type: String, default: '' },
    degree: { type: String, default: '' },
    branch: { type: String, default: '' },
    yearOfPassing: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);

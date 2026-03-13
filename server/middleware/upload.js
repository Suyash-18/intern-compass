const multer = require('multer');

// Use memory storage — files are uploaded to Cloudinary, not saved to disk
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  },
});

module.exports = upload;

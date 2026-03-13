const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

/**
 * Upload a file buffer to Cloudinary.
 * Returns { url, public_id, ... }
 */
function uploadToCloudinary(fileBuffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'prima-interns',
        resource_type: 'auto', // auto-detect: image, video, raw (pdf/zip/etc.)
        public_id: options.public_id || undefined,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
}

/**
 * Delete a file from Cloudinary by public_id.
 */
async function deleteFromCloudinary(publicId, resourceType = 'raw') {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
  }
}

module.exports = { uploadToCloudinary, deleteFromCloudinary };

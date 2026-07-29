const cloudinary = require('cloudinary').v2;

// Configure Cloudinary using process.env with secure fallback defaults
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'ls4pqxgk',
  api_key: process.env.CLOUDINARY_API_KEY || '762274739955399',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'PfoBl_pvU0njJP0_iYszMng2MZg'
});

/**
 * Destroy an asset on Cloudinary by public_id
 * @param {string} publicId - Cloudinary asset public ID
 */
async function deleteFromCloudinary(publicId) {
  if (!publicId) return { success: false, message: 'No public_id provided' };
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`🗑️ Cloudinary Asset Destroyed [${publicId}]:`, result);
    return { success: result.result === 'ok' || result.result === 'not found', result };
  } catch (err) {
    console.error(`⚠️ Cloudinary Destroy Error [${publicId}]:`, err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  cloudinary,
  deleteFromCloudinary
};

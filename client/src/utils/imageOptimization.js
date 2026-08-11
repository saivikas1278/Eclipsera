/**
 * Injects Cloudinary optimization parameters into a raw Cloudinary URL.
 * It forces auto-format (f_auto) and auto-quality (q_auto), while scaling to the specified width.
 * 
 * @param {string} url - The raw Cloudinary image URL
 * @param {number} width - The target width in pixels
 * @returns {string} - The optimized URL
 */
export const getOptimizedUrl = (url, width) => {
  if (!url || !url.includes('cloudinary.com')) return url;
  
  // Cloudinary URLs typically look like: https://res.cloudinary.com/cloud_name/image/upload/v1234/public_id.jpg
  // We want to insert transformations after '/upload/'
  const parts = url.split('/upload/');
  
  if (parts.length !== 2) return url;
  
  return `${parts[0]}/upload/f_auto,q_auto,w_${width}/c_limit/${parts[1]}`;
};

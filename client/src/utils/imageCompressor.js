/**
 * Compresses an image file in-browser using HTML5 Canvas.
 * Converts heavy PNG/JPEG images into optimized WebP/JPEG format
 * with bounded dimensions (maxWidth / maxHeight) and adjustable quality.
 *
 * @param {File} file - Original raw File from input element
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Max bounding width (default: 1600)
 * @param {number} options.maxHeight - Max bounding height (default: 1600)
 * @param {number} options.quality - Output quality from 0.0 to 1.0 (default: 0.82)
 * @param {string} options.outputType - MIME type ('image/webp' or 'image/jpeg')
 * @returns {Promise<File>} Compressed File instance
 */
export const compressImage = async (
  file,
  { maxWidth = 1600, maxHeight = 1600, quality = 0.82, outputType = 'image/webp' } = {}
) => {
  // If not an image, return original
  if (!file || !file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio while bounding within max dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file);
        }

        // Smooth image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              // If compression didn't reduce size, fallback to original file
              return resolve(file);
            }

            const extension = outputType === 'image/webp' ? '.webp' : '.jpg';
            const cleanName = file.name.replace(/\.[^/.]+$/, '') + extension;
            const compressedFile = new File([blob], cleanName, {
              type: outputType,
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          outputType,
          quality
        );
      };

      img.onerror = () => resolve(file);
    };

    reader.onerror = () => resolve(file);
  });
};

import React from 'react';
import { getOptimizedUrl } from '../utils/imageOptimization';

const OptimizedImage = ({ 
  src, 
  alt, 
  className, 
  sizes = '(max-width: 768px) 100vw, 33vw',
  loading = 'lazy',
  decoding = 'async',
  ...props 
}) => {
  // Generate srcSet for standard responsive breakpoints
  const srcSet = src && src.includes('cloudinary.com') 
    ? `${getOptimizedUrl(src, 300)} 300w, 
       ${getOptimizedUrl(src, 600)} 600w, 
       ${getOptimizedUrl(src, 900)} 900w, 
       ${getOptimizedUrl(src, 1200)} 1200w`
    : undefined;

  // For the default src, we can provide a moderately sized optimized image
  const defaultSrc = src && src.includes('cloudinary.com') 
    ? getOptimizedUrl(src, 800)
    : src;

  return (
    <img
      src={defaultSrc}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      {...props}
    />
  );
};

export default OptimizedImage;

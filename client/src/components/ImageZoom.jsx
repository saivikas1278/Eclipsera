import { useState, useRef, useEffect } from 'react';
import OptimizedImage from './OptimizedImage';

const ImageZoom = ({ src, alt, className, sizes }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef(null);

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  const handleMouseMove = (e) => {
    if (!imageRef.current || !isZoomed) return;
    
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to the image (0 to 1)
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;
    
    // Convert to percentage for background-position
    setPosition({ x: x * 100, y: y * 100 });
  };

  // Prevent scrolling when touching/zooming on mobile
  useEffect(() => {
    const handleTouchMove = (e) => {
      if (isZoomed) {
        // Only prevent default if we're actively zooming, but 
        // usually hover zoom is better for desktop. We'll disable it for mobile touch.
      }
    };
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => document.removeEventListener('touchmove', handleTouchMove);
  }, [isZoomed]);

  return (
    <div 
      className={`relative overflow-hidden cursor-crosshair ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      ref={imageRef}
    >
      <OptimizedImage 
        src={src} 
        alt={alt} 
        className={`w-full h-full object-cover transition-opacity duration-300 ${isZoomed && imageLoaded ? 'opacity-0' : 'opacity-100'}`}
        sizes={sizes}
        loading="eager"
        onLoad={() => setImageLoaded(true)}
      />
      
      {/* Zoom overlay */}
      {isZoomed && imageLoaded && (
        <div 
          className="absolute inset-0 pointer-events-none transition-transform duration-200"
          style={{
            backgroundImage: `url(${src})`,
            backgroundPosition: `${position.x}% ${position.y}%`,
            backgroundSize: '250%',
            backgroundRepeat: 'no-repeat'
          }}
        />
      )}
    </div>
  );
};

export default ImageZoom;

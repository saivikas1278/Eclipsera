const SkeletonCard = () => {
  return (
    <div className="bg-surface rounded-xl overflow-hidden border border-accent-gold/10 shadow-lg relative animate-pulse">
      {/* Wishlist Button Skeleton */}
      <div className="absolute top-3 right-3 z-10 w-11 h-11 bg-accent-gold/10 rounded-full border border-accent-gold/20"></div>

      {/* Image Skeleton */}
      <div className="w-full h-56 bg-accent-gold/5"></div>
      
      <div className="p-6">
        {/* Title Skeleton */}
        <div className="w-3/4 h-6 bg-accent-gold/10 rounded mb-4"></div>
        
        {/* Rating/Reviews Skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-4 bg-accent-gold/10 rounded"></div>
          <div className="w-20 h-4 bg-accent-gold/10 rounded"></div>
        </div>

        {/* Price & Button Skeleton */}
        <div className="flex flex-col md:flex-row justify-between md:items-center mt-4 pt-4 border-t border-accent-gold/10 gap-3">
          <div className="w-24 h-8 bg-accent-gold/10 rounded"></div>
          <div className="w-full md:w-24 h-11 bg-accent-gold/10 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;

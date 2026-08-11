const SkeletonProduct = () => {
  return (
    <div className="animate-pulse pb-20 md:pb-12 max-w-7xl mx-auto px-4 py-4 md:py-8">
      {/* Breadcrumb Skeleton */}
      <div className="w-32 h-5 bg-accent-gold/10 rounded mb-4 md:mb-8"></div>
      
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        {/* Left Side: Image Gallery Skeleton */}
        <div className="lg:w-1/2">
          <div className="bg-accent-gold/5 rounded-2xl shadow-sm border border-accent-gold/10 aspect-square"></div>
          
          {/* Thumbnails Skeleton */}
          <div className="flex gap-4 mt-4 overflow-x-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-20 h-20 flex-shrink-0 rounded-xl bg-accent-gold/10"></div>
            ))}
          </div>
        </div>

        {/* Right Side: Product Actions Skeleton */}
        <div className="lg:w-1/2 flex flex-col justify-start pt-2">
          {/* Title & Wishlist */}
          <div className="flex justify-between items-start mb-6">
            <div className="w-3/4 h-12 bg-accent-gold/10 rounded"></div>
            <div className="w-12 h-12 bg-accent-gold/10 rounded-full"></div>
          </div>
          
          {/* Price & Rating */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-32 h-10 bg-accent-gold/10 rounded"></div>
            <div className="w-40 h-8 bg-accent-gold/10 rounded-full"></div>
          </div>
          
          {/* Description */}
          <div className="space-y-3 mb-10">
            <div className="w-full h-5 bg-accent-gold/10 rounded"></div>
            <div className="w-full h-5 bg-accent-gold/10 rounded"></div>
            <div className="w-5/6 h-5 bg-accent-gold/10 rounded"></div>
            <div className="w-2/3 h-5 bg-accent-gold/10 rounded"></div>
          </div>

          {/* Variants */}
          <div className="mb-8">
            <div className="w-32 h-4 bg-accent-gold/10 rounded mb-4"></div>
            <div className="flex flex-wrap gap-3">
              <div className="w-24 h-10 bg-accent-gold/10 rounded-lg"></div>
              <div className="w-24 h-10 bg-accent-gold/10 rounded-lg"></div>
              <div className="w-24 h-10 bg-accent-gold/10 rounded-lg"></div>
            </div>
          </div>

          {/* Quantity & Add to Cart */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="h-14 w-full sm:w-36 bg-accent-gold/10 rounded-xl"></div>
            <div className="flex-1 h-14 bg-accent-gold/10 rounded-xl"></div>
          </div>
          
          {/* Accordions */}
          <div className="mt-4 border-t border-accent-gold/10 pt-4 space-y-6">
            <div className="w-full h-8 bg-accent-gold/10 rounded"></div>
            <div className="w-full h-8 bg-accent-gold/10 rounded"></div>
            <div className="w-full h-8 bg-accent-gold/10 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonProduct;

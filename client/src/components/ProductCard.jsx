import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import OptimizedImage from './OptimizedImage';

const ProductCard = ({ product }) => {
  const { wishlistItems, addToWishlist, removeFromWishlist, addToCart, setIsCartDrawerOpen } = useContext(StoreContext);
  const navigate = useNavigate();
  
  // Check if product is in wishlist
  const isInWishlist = wishlistItems?.some(item => item._id === product._id);

  const toggleWishlist = (e) => {
    e.preventDefault(); // Prevent navigating to the product page when clicking the heart
    if (isInWishlist) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (product.countInStock === 0) return;
    
    if (product.variants && product.variants.length > 0) {
      // If product has variants, maybe just go to product page to let them choose
      navigate(`/product/${product._id}`);
    } else {
      addToCart(product, 1, '', '');
      setIsCartDrawerOpen(true);
    }
  };

  return (
    <div className="bg-surface rounded-xl overflow-hidden border border-white/5 hover:border-accent-gold/30 hover:shadow-xl transition-all duration-300 relative group flex flex-col h-full">
      {/* Wishlist Button */}
      <button 
        onClick={toggleWishlist}
        className="absolute top-3 right-3 z-20 w-11 h-11 bg-black/40 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:text-accent-gold transition-colors focus:outline-none"
        aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <svg 
          className="w-5 h-5" 
          fill={isInWishlist ? "currentColor" : "none"} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isInWishlist ? "1" : "2"} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      <div className="overflow-hidden relative w-full aspect-square bg-white/5">
        <Link to={`/product/${product._id}`} className="absolute inset-0 z-10"></Link>
        <OptimizedImage 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      
      <div className="p-3 sm:p-4 flex flex-col flex-grow relative z-20">
        <Link to={`/product/${product._id}`} className="focus:outline-none flex-1 mb-2">
          <h3 className="font-sans text-text-primary text-sm sm:text-lg font-medium tracking-tight line-clamp-2 hover:text-accent-gold transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center gap-1 mb-3 text-accent-gold text-xs sm:text-sm">
          <span>★</span>
          <span className="text-text-secondary font-medium">{product.rating} <span className="text-text-primary/40 font-light ml-1 text-[10px] sm:text-xs">({product.numReviews})</span></span>
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 sm:pt-4 border-t border-white/5">
          <span className="text-text-primary font-bold text-lg sm:text-xl">₹{product.price}</span>
          <button 
            onClick={handleQuickAdd}
            disabled={product.countInStock === 0}
            className="bg-accent-gold hover:bg-accent-gold-hover text-bg-base font-bold min-h-[44px] min-w-[44px] px-2 py-1.5 sm:px-4 sm:py-2 rounded sm:rounded-md text-[11px] sm:text-sm transition-colors disabled:opacity-50 active:scale-95 shadow-sm whitespace-nowrap"
          >
            {product.countInStock === 0 ? 'Sold Out' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

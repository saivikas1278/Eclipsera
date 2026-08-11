import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import OptimizedImage from './OptimizedImage';

const ProductCard = ({ product }) => {
  const { wishlistItems, addToWishlist, removeFromWishlist } = useContext(StoreContext);
  
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

  return (
    <div className="bg-surface rounded-xl overflow-hidden border border-accent-gold/20 hover:border-accent-gold/50 transition-colors duration-300 shadow-lg relative group">
      {/* Wishlist Button */}
      <button 
        onClick={toggleWishlist}
        className="absolute top-3 right-3 z-10 w-11 h-11 bg-bg-base/80 backdrop-blur-sm rounded-full flex items-center justify-center text-accent-gold hover:bg-accent-gold hover:text-bg-base transition-colors shadow-md border border-accent-gold/30 min-w-[44px] min-h-[44px]"
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

      <Link to={`/product/${product._id}`}>
        <OptimizedImage 
          src={product.image} 
          alt={product.name} 
          className="w-full h-56 object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </Link>
      
      <div className="p-6">
        <Link to={`/product/${product._id}`}>
          {/* Serif font for headline, primary text color */}
          <h3 className="font-serif text-text-primary text-xl font-bold mb-2 truncate hover:text-accent-gold transition-colors">
            {product.name}
          </h3>
        </Link>
        
        {/* Sans-serif font for description/metadata, secondary text color */}
        <div className="flex items-center justify-between mb-4 text-text-secondary text-sm">
          <span>{product.rating} ★</span>
          <span>{product.numReviews} Reviews</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between md:items-center mt-4 pt-4 border-t border-accent-gold/20 gap-3">
          {/* Accent Gold for pricing */}
          <span className="text-accent-gold font-bold text-xl md:text-2xl">₹{product.price}</span>
          
          {/* Gold Button */}
          <Link to={`/product/${product._id}`} className="bg-accent-gold hover:bg-accent-gold-hover text-bg-base font-bold py-3 md:py-2 px-6 rounded-lg transition-colors text-center w-full md:w-auto min-h-[44px] flex items-center justify-center">
            View
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

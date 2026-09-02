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
    <div className="bg-surface rounded-2xl overflow-hidden border-transparent hover:shadow-lg transition-all duration-300 relative group flex flex-col h-full shadow-sm">
      {/* Wishlist Button */}
      <button
        onClick={toggleWishlist}
        className="absolute top-2 right-2 z-20 p-2 bg-black/40 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:text-accent-gold transition-colors focus:outline-none"
        aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <svg
          className="w-4 h-4"
          fill={isInWishlist ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isInWishlist ? "1" : "2"} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      <div className="overflow-hidden relative w-full aspect-square md:aspect-[4/5] bg-white/5 rounded-t-2xl">
        <Link to={`/product/${product._id}`} className="absolute inset-0 z-10"></Link>
        <OptimizedImage
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div className="p-3 sm:p-4 flex flex-col flex-grow relative z-20">
        <Link to={`/product/${product._id}`} className="focus:outline-none flex-1 mb-1">
          <h3 className="font-sans text-text-primary text-xs sm:text-sm md:text-base font-bold tracking-tight line-clamp-2 hover:text-accent-gold transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mb-2 text-accent-gold text-[10px] sm:text-xs">
          <div className="flex">
            <svg className="w-3.5 h-3.5 fill-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <span className="text-text-secondary font-medium ml-1">{product.rating.toFixed(1)} <span className="text-text-secondary/50 font-light text-[10px]">({product.numReviews})</span></span>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-text-primary font-bold text-sm sm:text-base md:text-lg">₹{product.price}</span>
          <button
            onClick={handleQuickAdd}
            disabled={product.countInStock === 0}
            className={`
              relative overflow-hidden font-bold rounded-lg transition-all duration-300 shadow-sm
              ${product.countInStock === 0 
                ? 'bg-zinc-800 text-zinc-500 px-3 py-1.5 text-[10px]' 
                : 'bg-accent-gold/10 text-accent-gold border-none hover:bg-accent-gold hover:text-bg-base px-5 py-1.5 text-xs sm:text-sm'}
            `}
          >
            {product.countInStock === 0 ? 'Out of Stock' : 'ADD'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

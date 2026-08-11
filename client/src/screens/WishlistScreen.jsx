import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';

const WishlistScreen = () => {
  const { wishlistItems, removeFromWishlist, addToCart, setIsCartDrawerOpen } = useContext(StoreContext);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setIsCartDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-bg-base py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 mb-6 text-text-primary/70 hover:text-accent-gold font-medium transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Shop
        </Link>

        <div className="w-full bg-surface rounded-xl shadow-md border border-accent-gold/10 p-6 md:p-8 flex flex-col gap-8">
          <div className="border-b border-accent-gold/10 pb-4">
            <h2 className="text-2xl font-bold text-text-primary">My Wishlist</h2>
            <p className="text-text-secondary mt-1">{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}</p>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg className="w-24 h-24 text-accent-gold/30 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <h3 className="text-xl font-bold text-text-primary mb-2">Your wishlist is empty</h3>
              <p className="text-text-secondary max-w-md mb-8">Save items you love to your wishlist. Review them anytime and easily move them to your cart.</p>
              <Link to="/" className="bg-accent-gold hover:bg-accent-gold-hover text-bg-base font-bold py-3 px-8 rounded transition-colors uppercase tracking-widest text-sm">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
              {wishlistItems.map((product) => (
                <div key={product._id} className="bg-bg-base border border-accent-gold/10 rounded-lg overflow-hidden flex flex-col group relative">
                  
                  {/* Remove Button */}
                  <button 
                    onClick={() => removeFromWishlist(product._id)}
                    className="absolute top-2 right-2 z-10 w-8 h-8 bg-surface/80 rounded-full flex items-center justify-center text-text-secondary hover:text-red-500 hover:bg-surface transition-all shadow-sm"
                    aria-label="Remove from wishlist"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <Link to={`/product/${product._id}`} className="block relative aspect-square overflow-hidden bg-white">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  
                  <div className="p-3 md:p-4 flex flex-col flex-1">
                    <Link to={`/product/${product._id}`}>
                      <h3 className="font-bold text-text-primary text-sm md:text-lg mb-1 truncate font-serif">{product.name}</h3>
                    </Link>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2 sm:gap-0">
                      <span className="text-accent-gold font-bold text-sm md:text-base">${product.price.toFixed(2)}</span>
                      {product.countInStock > 0 ? (
                        <span className="text-green-500 text-xs font-bold px-2 py-1 bg-green-500/10 rounded">In Stock</span>
                      ) : (
                        <span className="text-red-500 text-xs font-bold px-2 py-1 bg-red-500/10 rounded">Out of Stock</span>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => handleAddToCart(product)}
                      disabled={product.countInStock === 0}
                      className="mt-auto w-full py-2 px-2 rounded font-bold text-[10px] md:text-sm transition-colors uppercase tracking-wider
                        disabled:opacity-50 disabled:cursor-not-allowed bg-accent-gold text-bg-base hover:bg-accent-gold-hover"
                    >
                      {product.countInStock > 0 ? 'Move to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default WishlistScreen;

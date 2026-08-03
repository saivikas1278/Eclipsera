import React from 'react';
import { useUser } from '../context/UserContext';
import { Heart, ArrowRight, ShoppingBag, Trash2, Star } from 'lucide-react';

export const WishlistView: React.FC = () => {
  const { wishlist, products, addToCart, toggleWishlist, setCurrentView, showToast } = useUser();

  const savedProducts = products.filter(p => wishlist.includes(p.id));

  const handleMoveToCart = (productId: string) => {
    const p = products.find(prod => prod.id === productId);
    if (!p) return;
    addToCart(p, p.variants?.[0]?.id || '', 1);
    // Remove from wishlist
    toggleWishlist(productId);
  };

  const handleMoveAllToCart = () => {
    if (savedProducts.length === 0) return;
    savedProducts.forEach(p => {
      addToCart(p, p.variants?.[0]?.id || '', 1);
      toggleWishlist(p.id);
    });
    showToast(`Moved all saved masterpieces to your shopping cart!`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-28 md:pb-12 animate-fade-in text-obsidian-900">
      
      <div className="border-b border-cream-300 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-gold-700 uppercase tracking-widest">SAVED ARTISAN PIECES</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            Your Saved Wishlist ({savedProducts.length})
          </h1>
        </div>

        {savedProducts.length > 0 && (
          <div className="flex items-center gap-3">
            <button 
              onClick={handleMoveAllToCart}
              className="px-4 py-2.5 bg-gold-500 text-obsidian-900 hover:bg-gold-400 rounded-xl font-bold text-xs uppercase flex items-center gap-2 shadow-sm transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Move All to Cart</span>
            </button>

            <button 
              onClick={() => setCurrentView('shop')}
              className="text-xs font-bold text-gold-700 hover:underline flex items-center gap-1 font-sans"
            >
              <span>Continue Browsing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {savedProducts.length === 0 ? (
        <div className="bg-white/60 rounded-3xl p-12 sm:p-16 text-center space-y-4 border border-cream-300">
          <div className="w-16 h-16 bg-cream-200 rounded-full flex items-center justify-center mx-auto text-gold-600">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold">Your saved wishlist is empty</h3>
          <p className="text-xs text-obsidian-900/60 max-w-sm mx-auto font-sans leading-relaxed">
            Click the heart icon on any wooden toy, brass keychain, studio pottery, or woodcraft item to save it for later.
          </p>
          <button 
            onClick={() => setCurrentView('shop')}
            className="px-6 py-3 bg-obsidian-900 text-cream-100 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gold-600 hover:text-obsidian-900 transition-all font-sans"
          >
            Explore Handcrafted Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {savedProducts.map(product => (
            <div 
              key={product.id}
              className="group bg-white rounded-2xl overflow-hidden border border-cream-300 shadow-sm hover:-translate-y-1 hover:shadow-luxury transition-all duration-300 flex flex-col justify-between"
            >
              <div 
                className="aspect-square bg-cream-200 overflow-hidden relative cursor-pointer"
                onClick={() => setCurrentView(`product-detail`)}
              >
                <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product.id);
                  }}
                  className="absolute top-2.5 right-2.5 p-2 bg-white/90 text-terracotta-500 rounded-full hover:bg-terracotta-500 hover:text-white transition-all shadow-sm"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3 sm:p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-gold-700 uppercase tracking-widest">{product.craftTechnique}</span>
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-obsidian-900 line-clamp-1">{product.title}</h4>
                  <p className="text-[10px] text-obsidian-900/60 font-semibold">By {product.artisanName}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-gold-500 fill-current" />
                    <span className="text-[10px] font-bold">{product.rating}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-cream-200 flex flex-col gap-2">
                  <span className="font-serif text-sm font-bold">₹{product.basePrice.toLocaleString()}</span>
                  <button
                    onClick={() => handleMoveToCart(product.id)}
                    className="w-full bg-obsidian-900 text-cream-100 hover:bg-gold-500 hover:text-obsidian-900 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-gold-400" />
                    Move to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
export default WishlistView;

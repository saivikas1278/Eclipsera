import React from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/storefront/ProductCard';
import { Heart, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';

export const WishlistView: React.FC = () => {
  const { wishlist, products, addToCart, setIsCartOpen, setCurrentView, showToast } = useStore();

  const savedProducts = products.filter(p => wishlist.includes(p.id));

  const handleMoveAllToCart = () => {
    if (savedProducts.length === 0) return;
    savedProducts.forEach(p => {
      addToCart(p, p.variants[0].id, 1);
    });
    showToast(`Moved ${savedProducts.length} items to your shopping cart!`, 'success');
    setIsCartOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-28 md:pb-12">
      
      <div className="border-b border-cream-300 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-gold-700 uppercase tracking-widest">SAVED ARTISAN PIECES</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-obsidian-900">
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
              className="text-xs font-bold text-gold-700 hover:underline flex items-center gap-1"
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
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-obsidian-900">Your saved wishlist is empty</h3>
          <p className="text-xs text-obsidian-900/60 max-w-sm mx-auto">
            Click the heart icon on any wooden toy, brass keychain, studio pottery, or woodcraft item to save it for later.
          </p>
          <button 
            onClick={() => setCurrentView('shop')}
            className="px-6 py-3 bg-obsidian-900 text-cream-100 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gold-600 hover:text-obsidian-900 transition-all"
          >
            Explore Handcrafted Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {savedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
};

import React from 'react';
import { useUser } from '../../context/UserContext';
import { Home, Grid, Heart, Package, ShoppingBag, User } from 'lucide-react';

export const BottomMobileNav: React.FC = () => {
  const { currentView, setCurrentView, wishlist, cart, setIsCartOpen, orders, isCustomerLoggedIn, currentUser } = useUser();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="fixed bottom-0 inset-x-0 bg-cream-100/95 backdrop-blur-mobile border-t border-cream-300 flex items-center justify-around py-1.5 z-50 md:hidden shadow-2xl text-obsidian-900 pb-safe">
      
      {/* Home Tab */}
      <button 
        onClick={() => setCurrentView('home')}
        className={`flex flex-col items-center justify-center p-1.5 min-w-[48px] min-h-[44px] transition-colors ${
          currentView === 'home' ? 'text-gold-700 font-bold' : 'text-obsidian-900/70 hover:text-gold-600'
        }`}
        aria-label="Home"
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 font-medium">Home</span>
      </button>

      {/* Catalog Tab */}
      <button 
        onClick={() => setCurrentView('shop')}
        className={`flex flex-col items-center justify-center p-1.5 min-w-[48px] min-h-[44px] transition-colors ${
          currentView === 'shop' ? 'text-gold-700 font-bold' : 'text-obsidian-900/70 hover:text-gold-600'
        }`}
        aria-label="Categories"
      >
        <Grid className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 font-medium">Catalog</span>
      </button>

      {/* Wishlist Tab */}
      <button 
        onClick={() => setCurrentView('wishlist')}
        className={`flex flex-col items-center justify-center p-1.5 min-w-[48px] min-h-[44px] transition-colors relative ${
          currentView === 'wishlist' ? 'text-gold-700 font-bold' : 'text-obsidian-900/70 hover:text-gold-600'
        }`}
        aria-label="Wishlist"
      >
        <div className="relative">
          <Heart className="w-5 h-5" />
          {wishlist.length > 0 && (
            <span className="absolute -top-1 -right-2 bg-terracotta-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {wishlist.length}
            </span>
          )}
        </div>
        <span className="text-[10px] mt-0.5 font-medium">Wishlist</span>
      </button>

      {/* Orders Tab */}
      <button 
        onClick={() => setCurrentView('track-order')}
        className={`flex flex-col items-center justify-center p-1.5 min-w-[48px] min-h-[44px] transition-colors relative ${
          currentView === 'track-order' ? 'text-gold-700 font-bold' : 'text-obsidian-900/70 hover:text-gold-600'
        }`}
        aria-label="My Orders"
      >
        <div className="relative">
          <Package className="w-5 h-5" />
          {orders.length > 0 && (
            <span className="absolute -top-1 -right-2 bg-gold-500 text-obsidian-900 text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {orders.length}
            </span>
          )}
        </div>
        <span className="text-[10px] mt-0.5 font-medium">Orders</span>
      </button>

      {/* Account Tab */}
      <button 
        onClick={() => setCurrentView(isCustomerLoggedIn ? 'account' : 'auth')}
        className={`flex flex-col items-center justify-center p-1.5 min-w-[48px] min-h-[44px] transition-colors relative ${
          currentView === 'account' || currentView === 'auth' ? 'text-gold-700 font-bold' : 'text-obsidian-900/70 hover:text-gold-600'
        }`}
        aria-label="Account"
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 font-medium">{isCustomerLoggedIn ? 'Account' : 'Sign In'}</span>
      </button>

    </div>
  );
};
export default BottomMobileNav;

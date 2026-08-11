import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';

const MobileBottomNav = () => {
  const { cartItems, userInfo, setIsCartDrawerOpen, wishlistItems } = useContext(StoreContext);
  const location = useLocation();

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-md border-t border-accent-gold/20 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-40 pb-safe">
      <nav className="flex justify-around items-center h-16">
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center w-full h-full min-w-[44px] min-h-[44px] ${isActive('/') ? 'text-accent-gold' : 'text-text-secondary hover:text-text-primary'}`}
        >
          <svg className="w-6 h-6 mb-1" fill={isActive('/') ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="text-[10px] font-bold">Home</span>
        </Link>
        
        <Link 
          to="/wishlist" 
          className={`flex flex-col items-center justify-center w-full h-full min-w-[44px] min-h-[44px] relative ${isActive('/wishlist') ? 'text-accent-gold' : 'text-text-secondary hover:text-text-primary'}`}
        >
          <div className="relative">
            <svg className="w-6 h-6 mb-1" fill={isActive('/wishlist') ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            {wishlistItems && wishlistItems.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-accent-gold text-bg-base text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {wishlistItems.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold">Wishlist</span>
        </Link>

        <button 
          onClick={() => setIsCartDrawerOpen(true)}
          className="flex flex-col items-center justify-center w-full h-full min-w-[44px] min-h-[44px] text-text-secondary hover:text-text-primary relative"
        >
          <div className="relative">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-accent-gold text-bg-base text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold">Cart</span>
        </button>

        <Link 
          to={userInfo ? "/account" : "/login"} 
          className={`flex flex-col items-center justify-center w-full h-full min-w-[44px] min-h-[44px] ${(isActive('/account') || isActive('/login')) ? 'text-accent-gold' : 'text-text-secondary hover:text-text-primary'}`}
        >
          <svg className="w-6 h-6 mb-1" fill={isActive('/account') ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="text-[10px] font-bold">{userInfo ? 'Account' : 'Sign In'}</span>
        </Link>
      </nav>
    </div>
  );
};

export default MobileBottomNav;

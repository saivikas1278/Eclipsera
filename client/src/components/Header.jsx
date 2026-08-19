import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import MiniCartDrawer from './MiniCartDrawer';
import MobileNavDrawer from './MobileNavDrawer';
import InlineSearchBox from './InlineSearchBox';

const Header = () => {
  const { cartItems, userInfo, handleLogout, wishlistItems, setIsCartDrawerOpen } = useContext(StoreContext);
  const navigate = useNavigate();

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const accountMenuTimeoutRef = useRef(null);





  const handleAccountMenuEnter = () => {
    clearTimeout(accountMenuTimeoutRef.current);
    setIsAccountMenuOpen(true);
  };
  const handleAccountMenuLeave = () => {
    accountMenuTimeoutRef.current = setTimeout(() => setIsAccountMenuOpen(false), 200);
  };

  // Handle sticky nav blur on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const logoutHandler = () => {
    handleLogout();
    setIsAccountMenuOpen(false);
    navigate('/login');
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <>


      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-surface/90 backdrop-blur-md shadow-md py-4' : 'bg-surface py-4'
          }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Main Top Row (Desktop + Mobile) */}
          <div className="flex items-center justify-between gap-4 md:gap-8">

            {/* Left: Mobile Hamburger & Logo */}
            <div className="flex items-center gap-4">
              {/* Mobile Hamburger - Hidden completely since we have bottom nav */}
              <button
                className="hidden text-text-primary hover:text-accent-gold min-h-12 min-w-12 items-center justify-center"
                onClick={() => setIsMobileNavOpen(true)}
                aria-label="Open mobile menu"
                aria-expanded={isMobileNavOpen}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <Link to="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0 group">
                <img src="/images/logo.jpg" alt="Logo" className="h-8 sm:h-10 md:h-12 w-auto object-contain rounded-md shadow-sm group-hover:opacity-80 transition-opacity" />
                <span className="text-lg sm:text-xl md:text-2xl font-serif font-extrabold text-text-primary tracking-tighter group-hover:text-accent-gold transition-colors">
                  ECLIPSERA <span className="text-accent-gold">PREMIUM</span>
                </span>
              </Link>
            </div>

            {/* Center: Desktop Search */}
            <div className="hidden lg:block flex-1 max-w-3xl w-full">
              <InlineSearchBox />
            </div>

            {/* Right: Icons */}
            <div className="flex items-center space-x-6 flex-shrink-0">

              {/* Account (Desktop only) */}
              <div className="hidden lg:block relative">
                {userInfo ? (
                  <div
                    onMouseEnter={handleAccountMenuEnter}
                    onMouseLeave={handleAccountMenuLeave}
                    className="py-2"
                  >
                    <button aria-label="Account menu" aria-expanded={isAccountMenuOpen} className="text-text-primary hover:text-accent-gold transition-colors flex items-center justify-center min-h-12 min-w-12">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </button>
                    {isAccountMenuOpen && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-surface border border-accent-gold/20 shadow-xl rounded-md overflow-hidden z-50 animate-fade-in">
                        <div className="px-4 py-3 border-b border-accent-gold/10 text-sm font-bold text-accent-gold">{userInfo.firstName || userInfo.name}</div>
                        <Link to="/account" className="block px-4 py-3 text-sm hover:bg-bg-base hover:text-accent-gold transition-colors">My Account</Link>
                        {userInfo.isAdmin && (
                          <Link to="/admin/orderlist" className="block px-4 py-3 text-sm hover:bg-bg-base hover:text-accent-gold transition-colors">Dashboard</Link>
                        )}
                        <button onClick={logoutHandler} className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-bg-base hover:text-red-500 transition-colors">Sign Out</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link to="/login" aria-label="Sign in" className="text-text-primary hover:text-accent-gold transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </Link>
                )}
              </div>

              {/* Mobile Search Toggle */}
              <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                aria-label="Toggle mobile search"
                className="lg:hidden text-text-primary hover:text-accent-gold transition-colors relative flex items-center justify-center min-h-12 min-w-12"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>

              {/* Wishlist */}
              <Link to="/wishlist" aria-label="Wishlist" className="hidden lg:flex text-text-primary hover:text-accent-gold transition-colors relative items-center justify-center min-h-12 min-w-12">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                {wishlistItems && wishlistItems.length > 0 && (
                  <span className="absolute top-0 -right-2 bg-accent-gold text-bg-base text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                aria-label="Shopping cart"
                className="text-text-primary hover:text-accent-gold transition-colors relative flex items-center justify-center min-h-12 min-w-12"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                {cartCount > 0 && (
                  <span className="absolute top-0 -right-2 bg-accent-gold text-bg-base text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

            </div>
          </div>

          {/* Desktop Navigation Row (Secondary) */}
          <div className="hidden lg:flex items-center justify-center gap-10 border-t border-accent-gold/10 pt-4 pb-2 mt-4">



            <Link to="/search?category=New" className="text-sm font-bold uppercase tracking-widest hover:text-accent-gold transition-colors">New Arrivals</Link>
            <Link to="/search?category=BestSellers" className="text-sm font-bold uppercase tracking-widest hover:text-accent-gold transition-colors">Bestsellers</Link>

          </div>

          {/* Mobile Overlay Search Bar */}
          {isMobileSearchOpen && (
            <div className="lg:hidden absolute top-full left-0 w-full bg-surface border-t border-accent-gold/20 shadow-md p-4 animate-fade-in">
              <InlineSearchBox />
            </div>
          )}
        </div>
      </header>

      {/* Global Drawers */}
      <MiniCartDrawer />
      <MobileNavDrawer isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
    </>
  );
};

export default Header;

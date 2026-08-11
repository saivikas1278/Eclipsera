import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import MegaMenu from './MegaMenu';
import MiniCartDrawer from './MiniCartDrawer';
import MobileNavDrawer from './MobileNavDrawer';
import InlineSearchBox from './InlineSearchBox';

const Header = () => {
  const { cartItems, userInfo, handleLogout, wishlistItems, setIsCartDrawerOpen } = useContext(StoreContext);
  const navigate = useNavigate();

  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isOccasionMenuOpen, setIsOccasionMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const megaMenuTimeoutRef = useRef(null);
  const occasionMenuTimeoutRef = useRef(null);
  const accountMenuTimeoutRef = useRef(null);

  const handleMegaMenuEnter = () => {
    clearTimeout(megaMenuTimeoutRef.current);
    setIsMegaMenuOpen(true);
  };
  const handleMegaMenuLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => setIsMegaMenuOpen(false), 200);
  };

  const handleOccasionMenuEnter = () => {
    clearTimeout(occasionMenuTimeoutRef.current);
    setIsOccasionMenuOpen(true);
  };
  const handleOccasionMenuLeave = () => {
    occasionMenuTimeoutRef.current = setTimeout(() => setIsOccasionMenuOpen(false), 200);
  };

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
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled ? 'bg-surface/90 backdrop-blur-md shadow-md py-4' : 'bg-surface py-4'
        }`}
      >
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Main Top Row (Desktop + Mobile) */}
          <div className="flex items-center justify-between gap-4 md:gap-8">
            
            {/* Left: Mobile Hamburger & Logo */}
            <div className="flex items-center gap-4">
              {/* Mobile Hamburger - Hidden completely since we have bottom nav */}
              <button 
                className="hidden text-text-primary hover:text-accent-gold"
                onClick={() => setIsMobileNavOpen(true)}
                aria-label="Open mobile menu"
                aria-expanded={isMobileNavOpen}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <Link to="/" className="text-2xl md:text-3xl font-serif font-extrabold text-text-primary tracking-tighter hover:text-accent-gold transition-colors flex-shrink-0">
                ECLIPSERA <span className="text-accent-gold">PREMIUM</span>
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
                    <button aria-label="Account menu" aria-expanded={isAccountMenuOpen} className="text-text-primary hover:text-accent-gold transition-colors flex items-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </button>
                    {isAccountMenuOpen && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-surface border border-accent-gold/20 shadow-xl rounded-md overflow-hidden z-50 animate-fade-in">
                        <div className="px-4 py-3 border-b border-accent-gold/10 text-sm font-bold text-accent-gold">{userInfo.firstName || userInfo.name}</div>
                        <Link to="/profile" className="block px-4 py-3 text-sm hover:bg-bg-base hover:text-accent-gold transition-colors">Profile</Link>
                        {userInfo.isAdmin && (
                          <Link to="/admin/orderlist" className="block px-4 py-3 text-sm hover:bg-bg-base hover:text-accent-gold transition-colors">Dashboard</Link>
                        )}
                        <button onClick={logoutHandler} className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-bg-base hover:text-red-500 transition-colors">Sign Out</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link to="/login" aria-label="Sign in" className="text-text-primary hover:text-accent-gold transition-colors block py-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </Link>
                )}
              </div>

              {/* Wishlist */}
              <Link to="/wishlist" aria-label="Wishlist" className="hidden lg:block text-text-primary hover:text-accent-gold transition-colors relative py-2">
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
                className="text-text-primary hover:text-accent-gold transition-colors relative py-2"
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
            
            {/* Categories Mega Menu Trigger */}
            <div 
              className="relative"
              onMouseEnter={handleMegaMenuEnter}
              onMouseLeave={handleMegaMenuLeave}
            >
              <button 
                className="text-sm font-bold uppercase tracking-widest hover:text-accent-gold transition-colors flex items-center gap-1"
                aria-expanded={isMegaMenuOpen}
              >
                Categories
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
            </div>

            {/* Shop by Occasion Dropdown */}
            <div 
              className="relative"
              onMouseEnter={handleOccasionMenuEnter}
              onMouseLeave={handleOccasionMenuLeave}
            >
              <button 
                className="text-sm font-bold uppercase tracking-widest hover:text-accent-gold transition-colors flex items-center gap-1"
                aria-expanded={isOccasionMenuOpen}
              >
                Occasions
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {isOccasionMenuOpen && (
                <div className="absolute top-full left-0 mt-4 w-48 bg-surface border border-accent-gold/20 shadow-xl rounded-md overflow-hidden z-50 animate-fade-in">
                  <Link to="/search?category=Birthday" className="block px-4 py-3 text-sm hover:bg-bg-base hover:text-accent-gold transition-colors">Birthday</Link>
                  <Link to="/search?category=Wedding" className="block px-4 py-3 text-sm hover:bg-bg-base hover:text-accent-gold transition-colors">Wedding</Link>
                  <Link to="/search?category=Anniversary" className="block px-4 py-3 text-sm hover:bg-bg-base hover:text-accent-gold transition-colors">Anniversary</Link>
                </div>
              )}
            </div>

            <Link to="/search?category=New" className="text-sm font-bold uppercase tracking-widest hover:text-accent-gold transition-colors">New Arrivals</Link>
            <Link to="/search?category=BestSellers" className="text-sm font-bold uppercase tracking-widest hover:text-accent-gold transition-colors">Bestsellers</Link>
            
          </div>

          {/* Mobile Second Row: Search Bar */}
          <div className="mt-4 lg:hidden px-2">
            <InlineSearchBox />
          </div>
        </div>

        {/* Mega Menu rendered directly inside header for full width positioning */}
        <div 
          onMouseEnter={handleMegaMenuEnter}
          onMouseLeave={handleMegaMenuLeave}
        >
          <MegaMenu isOpen={isMegaMenuOpen} onClose={() => setIsMegaMenuOpen(false)} />
        </div>
      </header>

      {/* Global Drawers */}
      <MiniCartDrawer />
      <MobileNavDrawer isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
    </>
  );
};

export default Header;

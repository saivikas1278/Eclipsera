import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';

const MobileNavDrawer = ({ isOpen, onClose }) => {
  const { userInfo, updateSession } = useContext(StoreContext);
  const navigate = useNavigate();
  
  // Accordion states
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [occasionsOpen, setOccasionsOpen] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const logoutHandler = () => {
    updateSession(null);
    onClose();
    navigate('/login');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 left-0 h-full w-4/5 max-w-sm bg-surface shadow-2xl z-50 overflow-y-auto lg:hidden flex flex-col border-r border-accent-gold/20 animate-slide-right">
        
        {/* Header */}
        <div className="p-6 border-b border-accent-gold/10 flex justify-between items-center bg-bg-base">
          <Link to="/" onClick={onClose} className="text-xl font-serif font-bold text-accent-gold uppercase tracking-widest">
            Premium
          </Link>
          <button onClick={onClose} aria-label="Close menu" className="text-text-secondary hover:text-accent-gold">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav Links */}
        <div className="p-6 flex-1 flex flex-col space-y-2">
          <Link to="/" onClick={onClose} className="py-3 text-lg font-serif border-b border-accent-gold/5">
            Home
          </Link>
          <Link to="/search" onClick={onClose} className="py-3 text-lg font-serif border-b border-accent-gold/5">
            Shop All
          </Link>

          {/* Categories Accordion */}
          <div className="border-b border-accent-gold/5">
            <button 
              className="w-full py-3 flex justify-between items-center text-lg font-serif"
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              aria-expanded={categoriesOpen}
            >
              Categories
              <svg className={`w-5 h-5 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {categoriesOpen && (
              <div className="pl-4 pb-3 space-y-3 flex flex-col text-text-secondary">
                <Link to="/search?category=HomeDecor" onClick={onClose}>Home Decor</Link>
                <Link to="/search?category=Jewelry" onClick={onClose}>Fine Jewelry</Link>
                <Link to="/search?category=Candles" onClick={onClose}>Artisanal Candles</Link>
                <Link to="/search?category=Personalized" onClick={onClose}>Personalized Gifts</Link>
              </div>
            )}
          </div>

          {/* Occasions Accordion */}
          <div className="border-b border-accent-gold/5">
            <button 
              className="w-full py-3 flex justify-between items-center text-lg font-serif"
              onClick={() => setOccasionsOpen(!occasionsOpen)}
              aria-expanded={occasionsOpen}
            >
              Shop by Occasion
              <svg className={`w-5 h-5 transition-transform ${occasionsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {occasionsOpen && (
              <div className="pl-4 pb-3 space-y-3 flex flex-col text-text-secondary">
                <Link to="/search?category=Birthday" onClick={onClose}>Birthday</Link>
                <Link to="/search?category=Wedding" onClick={onClose}>Wedding</Link>
                <Link to="/search?category=Anniversary" onClick={onClose}>Anniversary</Link>
              </div>
            )}
          </div>

          <Link to="/about" onClick={onClose} className="py-3 text-lg font-serif border-b border-accent-gold/5">
            Our Story
          </Link>
          <Link to="/journal" onClick={onClose} className="py-3 text-lg font-serif border-b border-accent-gold/5">
            Journal
          </Link>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-bg-base border-t border-accent-gold/10">
          {userInfo ? (
            <div className="space-y-4">
              <div className="text-accent-gold font-bold mb-2">Hello, {userInfo.name}</div>
              <Link to="/profile" onClick={onClose} className="block text-text-primary hover:text-accent-gold">My Profile</Link>
              {userInfo.isAdmin && (
                <Link to="/admin/orderlist" onClick={onClose} className="block text-text-primary hover:text-accent-gold">Admin Dashboard</Link>
              )}
              <button onClick={logoutHandler} className="block w-full text-left text-red-400 hover:text-red-500">
                Sign Out
              </button>
            </div>
          ) : (
            <Link to="/login" onClick={onClose} className="block w-full bg-accent-gold text-bg-base font-bold text-center py-3 rounded-lg">
              Sign In
            </Link>
          )}
        </div>

      </div>
    </>
  );
};

export default MobileNavDrawer;

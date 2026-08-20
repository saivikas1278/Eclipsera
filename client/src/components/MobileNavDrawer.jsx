import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';

const MobileNavDrawer = ({ isOpen, onClose }) => {
  const { userInfo, updateSession } = useContext(StoreContext);
  const navigate = useNavigate();

  // Accordion states

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
          <Link to="/" onClick={onClose} className="flex items-center gap-3 group">
            <img src="/images/logo.jpg" alt="Logo" className="h-10 w-auto object-contain rounded-md shadow-sm group-hover:opacity-80 transition-opacity" />
            <span className="text-xl font-serif font-extrabold text-text-primary tracking-tighter uppercase group-hover:text-accent-gold transition-colors">
              Premium
            </span>
          </Link>
          <button onClick={onClose} aria-label="Close menu" className="text-text-secondary hover:text-accent-gold min-h-12 min-w-12 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav Links */}
        <div className="p-6 flex-1 flex flex-col space-y-2">
          <Link to="/" onClick={onClose} className="min-h-12 flex items-center text-lg font-serif border-b border-accent-gold/5">
            Home
          </Link>
          <Link to="/search" onClick={onClose} className="min-h-12 flex items-center text-lg font-serif border-b border-accent-gold/5">
            Shop All
          </Link>



          <Link to="/about" onClick={onClose} className="min-h-12 flex items-center text-lg font-serif border-b border-accent-gold/5">
            Our Story
          </Link>
          <Link to="/journal" onClick={onClose} className="min-h-12 flex items-center text-lg font-serif border-b border-accent-gold/5">
            Journal
          </Link>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-bg-base border-t border-accent-gold/10">
          {userInfo ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                {userInfo.avatar ? (
                  <img src={userInfo.avatar} alt="Profile" className="w-10 h-10 rounded-full border border-accent-gold/50 object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                )}
                <div className="text-accent-gold font-bold">Hello, {userInfo.firstName || userInfo.name}</div>
              </div>
              <Link to="/account" onClick={onClose} className="block text-text-primary hover:text-accent-gold min-h-12 flex items-center">My Account</Link>
              {userInfo.isAdmin && (
                <Link to="/admin/orderlist" onClick={onClose} className="block text-text-primary hover:text-accent-gold min-h-12 flex items-center">Admin Dashboard</Link>
              )}
              <button onClick={logoutHandler} className="block w-full text-left text-red-400 hover:text-red-500 min-h-12 flex items-center">
                Sign Out
              </button>
            </div>
          ) : (
            <Link to="/login" onClick={onClose} className="block w-full bg-accent-gold text-bg-base font-bold flex items-center justify-center min-h-12 rounded-lg">
              Sign In
            </Link>
          )}
        </div>

      </div>
    </>
  );
};

export default MobileNavDrawer;

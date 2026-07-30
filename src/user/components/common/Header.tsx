import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { ShoppingBag, Heart, Search, Sparkles, X, Menu, Package, ChevronRight, User, Bell, CheckCheck } from 'lucide-react';
import { fetchNotificationsAPI, markNotificationReadAPI, markAllNotificationsReadAPI } from '../../../shared/services/apiService';

export const Header: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    cart, 
    wishlist, 
    setIsCartOpen, 
    currentUser,
    isCustomerLoggedIn,
    products, 
    openProductDetail,
    orders,
    compareProductIds
  } = useUser();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Notification Center State
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [userNotifications, setUserNotifications] = useState<any[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  useEffect(() => {
    async function loadNotifs() {
      const email = currentUser?.email || 'ananya@eclipsera.com';
      const res = await fetchNotificationsAPI('USER', email);
      if (res && res.notifications) {
        setUserNotifications(res.notifications);
        setUnreadNotifCount(res.unreadCount || 0);
      }
    }
    loadNotifs();
  }, [currentUser?.email]);

  const handleMarkNotifRead = async (id: string, link?: string) => {
    await markNotificationReadAPI(id);
    setUserNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadNotifCount(prev => Math.max(0, prev - 1));
    if (link) {
      setIsNotifOpen(false);
      setCurrentView('track-order');
    }
  };

  const handleMarkAllRead = async () => {
    const email = currentUser?.email || 'ananya@eclipsera.com';
    await markAllNotificationsReadAPI('USER', email);
    setUserNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadNotifCount(0);
  };

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Live Auto-Suggestions filter
  const searchResults = searchQuery.trim() === '' ? [] : products.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.craftTechnique.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.originRegion.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-cream-100/95 backdrop-blur-md border-b border-cream-300 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 sm:h-16 gap-3">
            
            {/* Left: Mobile Navigation Menu Toggle & Brand Logo */}
            <div className="flex items-center gap-2.5 sm:gap-6">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden text-obsidian-900 hover:text-gold-600 p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-cream-200"
                aria-label="Toggle Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Brand Identity Logo */}
              <div className="text-left cursor-pointer shrink-0 flex items-center gap-2" onClick={() => setCurrentView('home')}>
                <img src="/eclipsera_logo.png" alt="Logo" className="w-8 sm:w-10 h-auto object-contain rounded-lg shadow-sm hover:scale-105 transition-transform" />
                <div>
                  <div className="inline-flex items-center gap-1">
                    <span className="font-serif text-base sm:text-2xl font-bold tracking-wider text-obsidian-900">
                      eclipsera<span className="text-gold-600 font-light">_premium</span>
                    </span>
                  </div>
                  <p className="text-[8px] sm:text-[10px] tracking-[0.18em] uppercase text-gold-700 font-semibold hidden sm:block">
                    Handcrafted & Artisan
                  </p>
                </div>
              </div>

              {/* Desktop Nav Links */}
              <nav className="hidden lg:flex items-center gap-6 text-xs font-bold tracking-wider uppercase ml-4">
                <button 
                  onClick={() => setCurrentView('home')} 
                  className={`transition-colors py-1 ${currentView === 'home' ? 'text-gold-600 border-b-2 border-gold-500 font-extrabold' : 'text-obsidian-900 hover:text-gold-600 font-bold'}`}
                >
                  Handcrafted Showcase
                </button>
                <button 
                  onClick={() => setCurrentView('shop')} 
                  className={`transition-colors py-1 ${currentView === 'shop' ? 'text-gold-600 border-b-2 border-gold-500 font-extrabold' : 'text-obsidian-900 hover:text-gold-600 font-bold'}`}
                >
                  Shop Catalog
                </button>
                <button 
                  onClick={() => setCurrentView('track-order')} 
                  className={`transition-colors py-1 flex items-center gap-1 ${currentView === 'track-order' ? 'text-gold-600 border-b-2 border-gold-500 font-extrabold' : 'text-obsidian-900 hover:text-gold-600 font-bold'}`}
                >
                  <Package className="w-3.5 h-3.5" />
                  My Orders ({orders.length})
                </button>
                <button 
                  onClick={() => setCurrentView('artisan-stories')} 
                  className={`transition-colors py-1 ${currentView === 'artisan-stories' ? 'text-gold-600 border-b-2 border-gold-500 font-extrabold' : 'text-obsidian-900 hover:text-gold-600 font-bold'}`}
                >
                  Artisan Guilds
                </button>
              </nav>
            </div>

            {/* Right Quick Action Icons (Wishlist, Cart, Profile with uniform gap-2.5 sm:gap-3.5) */}
            <div className="flex items-center gap-2 sm:gap-3.5 shrink-0 text-obsidian-900">
              
              {/* Search Modal Trigger (Desktop) */}
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="hidden md:flex text-obsidian-900 hover:text-gold-600 p-2 min-h-[44px] min-w-[44px] items-center justify-center transition-colors rounded-full hover:bg-cream-200"
                aria-label="Search Handcrafted Catalog"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Badge */}
              <button 
                onClick={() => setCurrentView('wishlist')}
                className="text-obsidian-900 hover:text-gold-600 p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors relative rounded-full hover:bg-cream-200"
                aria-label="View Saved Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 bg-terracotta-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Notification Center Bell Popover */}
              <div className="relative">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="text-obsidian-900 hover:text-gold-600 p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors relative rounded-full hover:bg-cream-200"
                  aria-label="View Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute top-1 right-1 bg-gold-500 text-obsidian-900 text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-extrabold animate-pulse shadow-sm">
                      {unreadNotifCount}
                    </span>
                  )}
                </button>

                {/* Popover Dropdown */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-cream-100 border border-gold-500/40 rounded-2xl shadow-2xl z-50 p-4 space-y-3 animate-fade-in text-obsidian-900">
                    <div className="flex items-center justify-between border-b border-cream-300 pb-2">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Bell className="w-4 h-4 text-gold-600" />
                        <span>Order Updates & Alerts</span>
                        {unreadNotifCount > 0 && (
                          <span className="bg-gold-500 text-obsidian-900 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                            {unreadNotifCount} New
                          </span>
                        )}
                      </div>
                      {unreadNotifCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[10px] text-gold-700 hover:underline font-bold flex items-center gap-1"
                        >
                          <CheckCheck className="w-3 h-3" /> Mark All Read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2 no-scrollbar">
                      {userNotifications.length === 0 ? (
                        <p className="text-center text-xs text-obsidian-900/50 py-4">No recent order notifications.</p>
                      ) : (
                        userNotifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => handleMarkNotifRead(n.id, n.link)}
                            className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${n.isRead ? 'bg-white/60 border-cream-300 opacity-75' : 'bg-white border-gold-500/60 shadow-sm font-semibold'}`}
                          >
                            <div className="flex justify-between items-start">
                              <h5 className="font-serif font-bold text-obsidian-900">{n.title}</h5>
                              {!n.isRead && <span className="w-2 h-2 rounded-full bg-gold-500 shrink-0 mt-1"></span>}
                            </div>
                            <p className="text-obsidian-900/80 text-[11px] mt-1 leading-relaxed font-sans">{n.message}</p>
                            <span className="text-[9px] text-gold-700 block mt-1.5 font-mono font-bold">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Drawer Trigger with Count Badge */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="bg-obsidian-900 text-cream-100 hover:bg-gold-600 hover:text-obsidian-900 transition-all px-3 py-2 sm:px-3.5 sm:py-2 rounded-full flex items-center gap-1.5 text-xs font-semibold tracking-wider shadow-sm min-h-[40px]"
                aria-label="Open Shopping Bag"
              >
                <ShoppingBag className="w-4 h-4 text-gold-400 shrink-0" />
                <span className="hidden sm:inline">CART</span>
                {cartItemsCount > 0 && (
                  <span className="bg-gold-500 text-obsidian-900 font-bold px-1.5 py-0.5 rounded-full text-[10px]">
                    {cartItemsCount}
                  </span>
                )}
              </button>

              {/* User Account / Sign In Avatar Icon */}
              <button 
                onClick={() => setCurrentView(isCustomerLoggedIn ? 'account' : 'auth')}
                className={`p-1.5 min-h-[44px] min-w-[44px] transition-all border rounded-full flex items-center justify-center text-xs ${
                  isCustomerLoggedIn 
                    ? 'bg-gold-500 text-obsidian-900 border-gold-500 font-bold shadow-sm' 
                    : 'text-obsidian-900 hover:text-gold-600 border-cream-300 hover:bg-cream-200'
                }`}
                title={isCustomerLoggedIn ? `Account (${currentUser?.name})` : "Sign In / Register"}
              >
                {isCustomerLoggedIn ? (
                  <span className="font-serif font-bold text-xs uppercase">{currentUser?.name.charAt(0)}</span>
                ) : (
                  <User className="w-4 h-4 text-gold-600" />
                )}
                <span className="hidden md:inline font-semibold ml-1 text-[11px]">
                  {isCustomerLoggedIn ? currentUser?.name.split(' ')[0] : 'Sign In'}
                </span>
              </button>
            </div>
          </div>

          {/* Full-Width Mobile Instant Search Bar directly under Header */}
          <div className="md:hidden pb-1 pt-1.5">
            <div 
              onClick={() => setIsSearchOpen(true)}
              className="w-full bg-white border border-cream-300 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-obsidian-900/60 shadow-inner cursor-pointer"
            >
              <Search className="w-4 h-4 text-gold-600 shrink-0" />
              <span className="font-medium truncate">Search toys, keychains, pottery, woodcraft...</span>
            </div>
          </div>

          {/* Sub-Header Navigation for Discovery Channels */}
          <div className="border-t border-cream-300/60 py-2 mt-2 flex items-center justify-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar text-[10px] font-bold tracking-widest uppercase text-obsidian-900/60">
            <button 
              onClick={() => setCurrentView('new-arrivals')} 
              className={`hover:text-gold-700 transition-colors ${currentView === 'new-arrivals' ? 'text-gold-600 font-extrabold' : ''}`}
            >
              New Arrivals
            </button>
            <span className="text-cream-300">•</span>
            <button 
              onClick={() => setCurrentView('best-sellers')} 
              className={`hover:text-gold-700 transition-colors ${currentView === 'best-sellers' ? 'text-gold-600 font-extrabold' : ''}`}
            >
              Best Sellers
            </button>
            <span className="text-cream-300">•</span>
            <button 
              onClick={() => setCurrentView('sale')} 
              className={`hover:text-gold-700 transition-colors ${currentView === 'sale' ? 'text-gold-600 font-extrabold' : ''}`}
            >
              Special Offers
            </button>
            <span className="text-cream-300">•</span>
            <button 
              onClick={() => setCurrentView('gift-guide')} 
              className={`hover:text-gold-700 transition-colors ${currentView === 'gift-guide' ? 'text-gold-600 font-extrabold' : ''}`}
            >
              Gift Guide
            </button>
            <span className="text-cream-300">•</span>
            <button 
              onClick={() => setCurrentView('compare')} 
              className={`hover:text-gold-700 transition-colors flex items-center gap-1 ${currentView === 'compare' ? 'text-gold-600 font-extrabold' : ''}`}
            >
              Compare
              {compareProductIds.length > 0 && (
                <span className="bg-gold-500 text-obsidian-900 text-[9px] px-1.5 rounded-full font-mono font-bold leading-none py-0.5">{compareProductIds.length}</span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Floating Overlay Mobile Navigation Drawer (position: fixed / z-index: 50) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-start">
          {/* Subtle Dark Backdrop / Scrim */}
          <div 
            className="fixed inset-0 bg-obsidian-900/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Floating Slide-Down Drawer Container */}
          <div className="relative z-10 bg-cream-100 border-b-2 border-gold-500/40 shadow-2xl rounded-b-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-slide-down text-obsidian-900">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-cream-300 pb-3">
              <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => { setCurrentView('home'); setIsMobileMenuOpen(false); }}>
                <Sparkles className="w-4 h-4 text-gold-500" />
                <span className="font-serif text-lg font-bold text-obsidian-900">
                  eclipsera<span className="text-gold-600 font-light">_premium</span>
                </span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 bg-cream-200 hover:bg-gold-500/20 rounded-full text-obsidian-900 hover:text-gold-700 min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors"
                aria-label="Close Mobile Navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Options with Icons & Badge Indicators */}
            <nav className="space-y-1 text-xs font-bold uppercase tracking-wider">
              <button 
                onClick={() => { setCurrentView('home'); setIsMobileMenuOpen(false); }}
                className={`flex items-center justify-between w-full text-left px-3.5 py-3 rounded-xl transition-all ${currentView === 'home' ? 'bg-gold-500 text-obsidian-900 font-extrabold shadow-sm' : 'hover:bg-cream-200 text-obsidian-900'}`}
              >
                <span>Handcrafted Showcase</span>
                <ChevronRight className="w-4 h-4 text-gold-700" />
              </button>

              <button 
                onClick={() => { setCurrentView('shop'); setIsMobileMenuOpen(false); }}
                className={`flex items-center justify-between w-full text-left px-3.5 py-3 rounded-xl transition-all ${currentView === 'shop' ? 'bg-gold-500 text-obsidian-900 font-extrabold shadow-sm' : 'hover:bg-cream-200 text-obsidian-900'}`}
              >
                <span>Shop All Categories</span>
                <ChevronRight className="w-4 h-4 text-gold-700" />
              </button>

              <button 
                onClick={() => { setCurrentView(isCustomerLoggedIn ? 'account' : 'auth'); setIsMobileMenuOpen(false); }}
                className={`flex items-center justify-between w-full text-left px-3.5 py-3 rounded-xl transition-all ${currentView === 'auth' || currentView === 'account' ? 'bg-gold-500 text-obsidian-900 font-extrabold shadow-sm' : 'hover:bg-cream-200 text-obsidian-900'}`}
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gold-600" />
                  <span>{isCustomerLoggedIn ? `Account (${currentUser?.name})` : 'Sign In / Register'}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gold-700" />
              </button>

              <button 
                onClick={() => { setCurrentView('track-order'); setIsMobileMenuOpen(false); }}
                className={`flex items-center justify-between w-full text-left px-3.5 py-3 rounded-xl transition-all ${currentView === 'track-order' ? 'bg-gold-500 text-obsidian-900 font-extrabold shadow-sm' : 'hover:bg-cream-200 text-obsidian-900'}`}
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gold-600" />
                  <span>My Orders & Tracking</span>
                </div>
                {orders.length > 0 && (
                  <span className="bg-gold-500 text-obsidian-900 font-bold px-2 py-0.5 rounded-full text-[10px]">
                    {orders.length}
                  </span>
                )}
              </button>

              <button 
                onClick={() => { setCurrentView('artisan-stories'); setIsMobileMenuOpen(false); }}
                className={`flex items-center justify-between w-full text-left px-3.5 py-3 rounded-xl transition-all ${currentView === 'artisan-stories' ? 'bg-gold-500 text-obsidian-900 font-extrabold shadow-sm' : 'hover:bg-cream-200 text-obsidian-900'}`}
              >
                <span>Artisan Guild Stories</span>
                <ChevronRight className="w-4 h-4 text-gold-700" />
              </button>

              <button 
                onClick={() => { setCurrentView('about'); setIsMobileMenuOpen(false); }}
                className={`flex items-center justify-between w-full text-left px-3.5 py-3 rounded-xl transition-all ${currentView === 'about' ? 'bg-gold-500 text-obsidian-900 font-extrabold shadow-sm' : 'hover:bg-cream-200 text-obsidian-900'}`}
              >
                <span>Quality & Provenance</span>
                <ChevronRight className="w-4 h-4 text-gold-700" />
              </button>
            </nav>

          </div>
        </div>
      )}

      {/* Global Search Overlay Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-obsidian-900/60 backdrop-blur-sm flex items-start justify-center pt-6 sm:pt-10 px-3 sm:px-4 animate-fade-in text-obsidian-900">
          <div className="bg-cream-100 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gold-500/30 flex flex-col">
            
            {/* Search Input Bar */}
            <div className="p-3.5 sm:p-5 border-b border-cream-300 flex items-center gap-3 bg-white">
              <Search className="w-5 h-5 text-gold-600 shrink-0" />
              <input 
                type="text"
                placeholder="Search toys, keychains, studio pottery, woodcraft..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-transparent border-none text-obsidian-900 placeholder:text-obsidian-900/50 focus:outline-none text-sm sm:text-base font-medium"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-1 text-obsidian-900/40 hover:text-obsidian-900">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => setIsSearchOpen(false)} className="p-2 hover:text-gold-600 text-xs font-bold text-obsidian-900 uppercase shrink-0">
                Close
              </button>
            </div>

            {/* Quick Category Suggestions */}
            <div className="px-4 py-2 bg-cream-200/60 border-b border-cream-300 flex items-center gap-2 overflow-x-auto text-xs shrink-0 no-scrollbar">
              <span className="font-semibold text-obsidian-900 shrink-0 text-[11px] uppercase">Popular Tags:</span>
              <button onClick={() => setSearchQuery('Toy')} className="px-2.5 py-1 bg-white rounded-full border border-cream-300 hover:border-gold-500 text-[11px] font-semibold shrink-0">Wooden Toys</button>
              <button onClick={() => setSearchQuery('Keychain')} className="px-2.5 py-1 bg-white rounded-full border border-cream-300 hover:border-gold-500 text-[11px] font-semibold shrink-0">Brass Keychains</button>
              <button onClick={() => setSearchQuery('Pottery')} className="px-2.5 py-1 bg-white rounded-full border border-cream-300 hover:border-gold-500 text-[11px] font-semibold shrink-0">Studio Pottery</button>
              <button onClick={() => setSearchQuery('Teakwood')} className="px-2.5 py-1 bg-white rounded-full border border-cream-300 hover:border-gold-500 text-[11px] font-semibold shrink-0">Teakwood</button>
            </div>

            {/* Live Auto-Suggest Results */}
            <div className="max-h-[60vh] overflow-y-auto p-3 space-y-2">
              {searchQuery.trim() !== '' && searchResults.length === 0 ? (
                <div className="py-8 text-center text-obsidian-900/60 space-y-1">
                  <p className="font-serif text-base font-bold text-obsidian-900">No handcrafted items found matching "{searchQuery}"</p>
                  <p className="text-xs">Try searching for "Toy", "Brass", "Pottery", or "Teakwood".</p>
                </div>
              ) : (
                searchResults.map(p => (
                  <div 
                    key={p.id}
                    onClick={() => {
                      openProductDetail(p.slug);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white hover:bg-gold-500/10 border border-cream-300 hover:border-gold-500/40 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={p.images[0]} alt={p.title} className="w-12 h-12 object-cover rounded-lg border border-cream-300 shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-serif font-bold text-xs text-obsidian-900 truncate group-hover:text-gold-700">{p.title}</h4>
                        <p className="text-[10px] text-gold-700 font-semibold">{p.craftTechnique} • {p.originRegion}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-serif font-bold text-xs text-obsidian-900">₹{p.basePrice.toLocaleString()}</span>
                      <ChevronRight className="w-4 h-4 text-gold-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
};
export default Header;

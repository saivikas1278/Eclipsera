import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { User, MapPin, Package, Heart, LogOut, ShieldCheck, Edit3, Check, Sparkles } from 'lucide-react';

export const AccountView: React.FC = () => {
  const { currentUser, isCustomerLoggedIn, customerLogout, updateCustomerProfile, orders, wishlist, setCurrentView } = useStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'address'>('profile');

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');

  // Address Edit State
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [street, setStreet] = useState(currentUser?.address?.street || '');
  const [city, setCity] = useState(currentUser?.address?.city || '');
  const [state, setState] = useState(currentUser?.address?.state || '');
  const [pincode, setPincode] = useState(currentUser?.address?.pincode || '');

  if (!isCustomerLoggedIn || !currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-obsidian-900">Please sign in to view your account</h2>
        <p className="text-xs text-obsidian-900/60">Manage your orders, saved addresses, and craft wishlist.</p>
        <button 
          onClick={() => setCurrentView('auth')}
          className="px-6 py-3 bg-obsidian-900 text-cream-100 rounded-xl font-bold text-xs uppercase hover:bg-gold-600 hover:text-obsidian-900 transition-all"
        >
          Go to Sign In Page
        </button>
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomerProfile({ name, email, phone });
    setIsEditingProfile(false);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomerProfile({
      address: { street, city, state, pincode }
    });
    setIsEditingAddress(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-12 space-y-8 pb-20 md:pb-8">
      
      {/* Account Hero Card */}
      <div className="bg-obsidian-900 text-cream-100 p-6 sm:p-8 rounded-3xl border border-gold-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gold-500 text-obsidian-900 font-serif font-bold text-xl sm:text-2xl flex items-center justify-center border-2 border-cream-100 shrink-0">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-gold-400 uppercase tracking-widest block">GI CRAFT MARK PATRON</span>
            <h1 className="font-serif text-xl sm:text-3xl font-bold">{currentUser.name}</h1>
            <p className="text-xs text-cream-300/80">{currentUser.email} • +91 {currentUser.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setCurrentView('home')}
            className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-obsidian-900 rounded-xl font-bold text-xs uppercase flex items-center gap-1.5 shadow-gold-glow transition-all"
          >
            <Sparkles className="w-4 h-4 text-obsidian-900" />
            <span>START SHOPPING JOURNEY</span>
          </button>

          <button 
            onClick={customerLogout}
            className="px-4 py-2 bg-cream-100/10 hover:bg-terracotta-500 text-cream-100 rounded-xl font-bold text-xs uppercase flex items-center gap-1.5 transition-all border border-cream-100/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Account Quick Dashboard Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button 
          onClick={() => setCurrentView('track-order')}
          className="p-4 bg-white rounded-2xl border border-cream-300 shadow-sm text-left hover:border-gold-500 transition-all space-y-1"
        >
          <Package className="w-5 h-5 text-gold-600" />
          <span className="text-xs font-bold text-obsidian-900 block">My Orders</span>
          <span className="text-[10px] text-obsidian-900/60 font-semibold">{orders.length} Active / Past Orders</span>
        </button>

        <button 
          onClick={() => setCurrentView('wishlist')}
          className="p-4 bg-white rounded-2xl border border-cream-300 shadow-sm text-left hover:border-gold-500 transition-all space-y-1"
        >
          <Heart className="w-5 h-5 text-terracotta-500" />
          <span className="text-xs font-bold text-obsidian-900 block">Saved Wishlist</span>
          <span className="text-[10px] text-obsidian-900/60 font-semibold">{wishlist.length} Items Saved</span>
        </button>

        <button 
          onClick={() => setActiveTab('profile')}
          className={`p-4 rounded-2xl border text-left transition-all space-y-1 ${activeTab === 'profile' ? 'bg-gold-500/10 border-gold-500' : 'bg-white border-cream-300'}`}
        >
          <User className="w-5 h-5 text-gold-600" />
          <span className="text-xs font-bold text-obsidian-900 block">Personal Profile</span>
          <span className="text-[10px] text-obsidian-900/60 font-semibold">Name & Contact</span>
        </button>

        <button 
          onClick={() => setActiveTab('address')}
          className={`p-4 rounded-2xl border text-left transition-all space-y-1 ${activeTab === 'address' ? 'bg-gold-500/10 border-gold-500' : 'bg-white border-cream-300'}`}
        >
          <MapPin className="w-5 h-5 text-gold-600" />
          <span className="text-xs font-bold text-obsidian-900 block">Saved Address</span>
          <span className="text-[10px] text-obsidian-900/60 font-semibold">{currentUser.address?.city || 'Bengaluru'}</span>
        </button>
      </div>

      {/* Tab 1: Personal Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-sm space-y-6 animate-fade-in">
          <div className="flex justify-between items-center border-b border-cream-200 pb-3">
            <h3 className="font-serif text-lg font-bold text-obsidian-900">Personal Information</h3>
            {!isEditingProfile && (
              <button 
                onClick={() => setIsEditingProfile(true)}
                className="text-xs font-bold text-gold-700 hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            )}
          </div>

          {!isEditingProfile ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-obsidian-900/60 font-semibold uppercase block">Full Name</span>
                <p className="font-bold text-obsidian-900 text-sm">{currentUser.name}</p>
              </div>

              <div>
                <span className="text-obsidian-900/60 font-semibold uppercase block">Email Address</span>
                <p className="font-bold text-obsidian-900 text-sm">{currentUser.email}</p>
              </div>

              <div>
                <span className="text-obsidian-900/60 font-semibold uppercase block">Phone Number</span>
                <p className="font-bold text-obsidian-900 text-sm">+91 {currentUser.phone}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-obsidian-900 uppercase block mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3 py-2 text-xs text-obsidian-900 font-bold focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-obsidian-900 uppercase block mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3 py-2 text-xs text-obsidian-900 font-bold focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-obsidian-900 uppercase block mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3 py-2 text-xs text-obsidian-900 font-bold focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 border border-cream-300 rounded-xl text-xs font-bold text-obsidian-900/70"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-obsidian-900 text-cream-100 rounded-xl text-xs font-bold uppercase hover:bg-gold-600 hover:text-obsidian-900 flex items-center gap-1"
                >
                  <Check className="w-4 h-4 text-gold-400" />
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Tab 2: Saved Shipping Address */}
      {activeTab === 'address' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-sm space-y-6 animate-fade-in">
          <div className="flex justify-between items-center border-b border-cream-200 pb-3">
            <h3 className="font-serif text-lg font-bold text-obsidian-900">Default Shipping Address</h3>
            {!isEditingAddress && (
              <button 
                onClick={() => setIsEditingAddress(true)}
                className="text-xs font-bold text-gold-700 hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Address
              </button>
            )}
          </div>

          {!isEditingAddress ? (
            <div className="p-4 bg-cream-100 rounded-2xl border border-cream-200 text-xs space-y-1">
              <span className="px-2.5 py-0.5 bg-gold-500/20 text-gold-700 font-bold rounded-full text-[10px] uppercase">
                Primary Delivery Address
              </span>
              <p className="font-bold text-obsidian-900 text-sm pt-1">{currentUser.name}</p>
              <p>{currentUser.address?.street || '42 Lavelle Road, Indiranagar'}</p>
              <p>{currentUser.address?.city || 'Bengaluru'}, {currentUser.address?.state || 'Karnataka'} - {currentUser.address?.pincode || '560001'}</p>
              <p className="text-obsidian-900/60 font-semibold pt-1">Phone: +91 {currentUser.phone}</p>
            </div>
          ) : (
            <form onSubmit={handleSaveAddress} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-obsidian-900 uppercase block mb-1">Street Address</label>
                <input 
                  type="text" 
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3 py-2 text-xs text-obsidian-900 font-bold focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-obsidian-900 uppercase block mb-1">City</label>
                  <input 
                    type="text" 
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3 py-2 text-xs text-obsidian-900 font-bold focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-obsidian-900 uppercase block mb-1">State</label>
                  <input 
                    type="text" 
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3 py-2 text-xs text-obsidian-900 font-bold focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-obsidian-900 uppercase block mb-1">PIN Code</label>
                  <input 
                    type="text" 
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3 py-2 text-xs text-obsidian-900 font-bold focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsEditingAddress(false)}
                  className="px-4 py-2 border border-cream-300 rounded-xl text-xs font-bold text-obsidian-900/70"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-obsidian-900 text-cream-100 rounded-xl text-xs font-bold uppercase hover:bg-gold-600 hover:text-obsidian-900 flex items-center gap-1"
                >
                  <Check className="w-4 h-4 text-gold-400" />
                  Save Address
                </button>
              </div>
            </form>
          )}
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { 
  User, MapPin, Package, Heart, LogOut, ShieldCheck, Edit3, Check, Sparkles, 
  CreditCard, Wallet, Bell, Star, MessageSquare, Plus, Trash2, Camera, 
  ChevronRight, Calendar, Info, RefreshCw, Briefcase, FileText, Image 
} from 'lucide-react';

export const AccountView: React.FC = () => {
  const { 
    currentUser, 
    isCustomerLoggedIn, 
    customerLogout, 
    updateCustomerProfile, 
    changePassword,
    deleteCustomerAccount,
    orders, 
    wishlist, 
    setCurrentView,
    savedAddresses,
    addAddress,
    deleteAddress,
    setDefaultAddress,
    savedCards,
    addCard,
    deleteCard,
    walletBalance,
    walletTransactions,
    notifications,
    userReviews,
    addReview,
    deleteReview,
    addCustomOrderRequest,
    markNotificationsAsRead,
    deleteNotification,
    openOrderDetail,
    products
  } = useUser();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'security' | 'orders' | 'addresses' | 'payments' | 'wallet' | 'reviews' | 'notifications' | 'custom-order' | 'danger'>('dashboard');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Security & Delete Account States
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // 1. Profile Editor States
  const [profileName, setProfileName] = useState(currentUser?.name || 'Ananya Sharma');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '9876543210');
  const [profileBio, setProfileBio] = useState('Patron of traditional wooden craft guilds and hand-lathed stacking toys.');
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);

  // 2. Orders Filtering State
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'>('ALL');

  // 3. Addresses Form States
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPincode, setAddrPincode] = useState('');

  // 4. Vault Cards Form States
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardNo, setCardNo] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardExp, setCardExp] = useState('');

  // 6. Write New Review Form States
  const [reviewProductId, setReviewProductId] = useState(products[0]?.id || '');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([]);
  const [showWriteReview, setShowWriteReview] = useState(false);

  // 8. Custom Order Request States
  const [customDesc, setCustomDesc] = useState('');
  const [customCategory, setCustomCategory] = useState('pottery');
  const [customBudget, setCustomBudget] = useState(2500);
  const [customArtisan, setCustomArtisan] = useState('');
  const [customContactPref, setCustomContactPref] = useState<'email' | 'phone'>('email');
  const [customRefPhoto, setCustomRefPhoto] = useState<string | null>(null);

  if (!isCustomerLoggedIn || !currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4 animate-fade-in text-obsidian-900">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold">Please sign in to view your account</h2>
        <p className="text-xs text-obsidian-900/60 font-sans">Manage your orders, saved addresses, and craft wishlist.</p>
        <button 
          onClick={() => setCurrentView('auth')}
          className="px-6 py-3 bg-obsidian-900 text-cream-100 rounded-xl font-bold text-xs uppercase hover:bg-gold-600 hover:text-obsidian-900 transition-all font-sans"
        >
          Go to Sign In Page
        </button>
      </div>
    );
  }

  // Handle forms
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomerProfile({ name: profileName, phone: profilePhone });
    showToast('Profile information successfully saved.', 'success');
  };

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: {[key: string]: string} = {};
    if (!addrName.trim()) errs.name = 'Name is required';
    if (!addrPhone.trim() || addrPhone.replace(/\D/g, '').length < 10) errs.phone = '10-digit phone is required';
    if (!addrStreet.trim()) errs.street = 'Street is required';
    if (!addrCity.trim()) errs.city = 'City is required';
    if (!addrState.trim()) errs.state = 'State is required';
    if (!addrPincode.trim() || addrPincode.replace(/\D/g, '').length !== 6) errs.pincode = '6-digit pincode is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    addAddress({ name: addrName, phone: addrPhone, street: addrStreet, city: addrCity, state: addrState, pincode: addrPincode, country: 'India' });
    setShowAddressForm(false);
    setAddrName(''); setAddrPhone(''); setAddrStreet(''); setAddrCity(''); setAddrState(''); setAddrPincode('');
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: {[key: string]: string} = {};
    if (!cardNo.replace(/\s/g, '').match(/^\d{16}$/)) errs.cardNo = '16-digit card number required';
    if (!cardHolderName.trim()) errs.cardHolderName = 'Cardholder name required';
    if (!cardExp.match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)) errs.cardExp = 'Expiry in MM/YY required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    addCard({ cardHolder: cardHolderName, cardNumber: cardNo, expiry: cardExp });
    setShowCardForm(false);
    setCardNo(''); setCardHolderName(''); setCardExp('');
  };

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    addReview(reviewProductId, reviewRating, reviewComment);
    setReviewComment('');
    setShowWriteReview(false);
  };

  const handleCreateCustomOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDesc.trim()) return;
    addCustomOrderRequest({ description: customDesc, category: customCategory, budget: customBudget, artisan: customArtisan, contactPreference: customContactPref });
    setCustomDesc('');
    setActiveTab('dashboard');
  };

  const showToast = (msg: string, type: 'success' | 'info' | 'warning') => {
    // Falls back to context notification toast
  };

  // Avatar select mockup
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'ALL') return true;
    if (orderFilter === 'PROCESSING') return o.status === 'PENDING' || o.status === 'PAYMENT_CONFIRMED' || o.status === 'PROCESSING';
    return o.status === orderFilter;
  });

  // Helper status color badges
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'PAYMENT_CONFIRMED':
      case 'PROCESSING':
        return <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">Processing</span>;
      case 'SHIPPED':
        return <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">Shipped</span>;
      case 'DELIVERED':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">Delivered</span>;
      case 'CANCELLED':
        return <span className="bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">Cancelled</span>;
      default:
        return <span className="bg-orange-100 text-orange-800 border border-orange-200 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">Return Pending</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-obsidian-900 pb-28 md:pb-12">
      
      {/* Account Hero Card */}
      <div className="bg-obsidian-900 text-cream-100 p-6 sm:p-8 rounded-3xl border border-gold-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer shrink-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gold-500 text-obsidian-900 font-serif font-bold text-xl sm:text-2xl flex items-center justify-center border-2 border-cream-100 overflow-hidden">
              {profileAvatar ? <img src={profileAvatar} alt="" className="w-full h-full object-cover" /> : currentUser.name.charAt(0).toUpperCase()}
            </div>
            <label className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-[9px] font-bold uppercase text-white">
              <Camera className="w-3.5 h-3.5" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-gold-400 uppercase tracking-widest block">GI CRAFT MARK PATRON</span>
            <h1 className="font-serif text-xl sm:text-2xl font-bold">{currentUser.name}</h1>
            <p className="text-xs text-cream-300/80">{currentUser.email} • +91 {currentUser.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setActiveTab('custom-order')}
            className="px-3.5 py-2 bg-gold-500 hover:bg-gold-400 text-obsidian-900 rounded-xl font-bold text-xs uppercase flex items-center gap-1 shadow-sm transition-all"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Blueprint Custom Order</span>
          </button>
          <button 
            onClick={customerLogout}
            className="px-3.5 py-2 bg-cream-100/10 hover:bg-terracotta-500 text-cream-100 rounded-xl font-bold text-xs uppercase flex items-center gap-1.5 transition-all border border-cream-100/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar Navigation */}
        <aside className="lg:col-span-3 bg-white p-4 rounded-3xl border border-cream-300 space-y-1.5 shadow-sm text-xs font-bold text-obsidian-900/60">
          {[
            { id: 'dashboard', label: 'Patron Dashboard', icon: ShieldCheck },
            { id: 'profile', label: 'Edit Profile Details', icon: User },
            { id: 'security', label: 'Security & Password', icon: Lock },
            { id: 'orders', label: 'My Orders Ledger', icon: Package },
            { id: 'addresses', label: 'Saved Shipping Addresses', icon: MapPin },
            { id: 'payments', label: 'Vault Credit Cards', icon: CreditCard },
            { id: 'wallet', label: 'Wallet & Credits', icon: Wallet },
            { id: 'reviews', label: 'My Written Reviews', icon: Star },
            { id: 'notifications', label: 'System Notifications', icon: Bell },
            { id: 'custom-order', label: 'Custom Blueprint Orders', icon: Briefcase },
            { id: 'danger', label: 'Account Security & Danger Zone', icon: Trash2 }
          ].map(tab => {
            const Icon = tab.icon as any;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setErrors({});
                }}
                className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-all ${
                  activeTab === tab.id 
                    ? 'bg-gold-500/10 text-gold-700 font-extrabold border-l-4 border-gold-500 pl-2' 
                    : 'hover:bg-cream-100 hover:text-obsidian-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 shrink-0 text-gold-600" />
                  <span>{tab.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
              </button>
            );
          })}
        </aside>

        {/* Right main panel display */}
        <div className="lg:col-span-9">
          
          {/* TAB: Dashboard index stats summary */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Quick stats indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div onClick={() => setActiveTab('orders')} className="bg-white p-5 rounded-2xl border border-cream-300 shadow-sm cursor-pointer hover:border-gold-500 transition-all space-y-1">
                  <Package className="w-5 h-5 text-gold-600" />
                  <span className="text-xs font-bold text-obsidian-900 block">Orders ledger</span>
                  <span className="text-sm font-serif font-bold text-gold-700">{orders.length} Active / Past</span>
                </div>
                <div onClick={() => setCurrentView('wishlist')} className="bg-white p-5 rounded-2xl border border-cream-300 shadow-sm cursor-pointer hover:border-gold-500 transition-all space-y-1">
                  <Heart className="w-5 h-5 text-terracotta-500" />
                  <span className="text-xs font-bold text-obsidian-900 block">Saved Wishlist</span>
                  <span className="text-sm font-serif font-bold text-gold-700">{wishlist.length} Items saved</span>
                </div>
                <div onClick={() => setActiveTab('wallet')} className="bg-white p-5 rounded-2xl border border-cream-300 shadow-sm cursor-pointer hover:border-gold-500 transition-all space-y-1">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold text-obsidian-900 block">Store Credits Balance</span>
                  <span className="text-sm font-serif font-bold text-gold-700">₹{walletBalance.toLocaleString()} Credits</span>
                </div>
              </div>

              {/* Welcome text */}
              <div className="bg-cream-100 p-6 rounded-3xl border border-cream-300 space-y-3">
                <h3 className="font-serif text-lg font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-gold-600" />
                  Welcome back, {currentUser.name}!
                </h3>
                <p className="text-xs text-obsidian-900/60 leading-relaxed font-sans">
                  From your patron dashboard, you can view your real-time shipping logs, print tax invoices, submit craft returns, edit delivery addresses, customize wood blueprints, or check store credits.
                </p>
                <div className="pt-2">
                  <button 
                    onClick={() => setCurrentView('shop')}
                    className="px-4 py-2 bg-obsidian-900 text-cream-100 rounded-lg text-xs font-bold uppercase hover:bg-gold-500 hover:text-obsidian-900 transition-all"
                  >
                    Start Shopping Journey
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Edit Profile Details */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-3xl border border-cream-300 shadow-sm space-y-5 animate-fade-in">
              <h3 className="font-serif text-base font-bold border-b pb-2">Edit Account Profile Details</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <label className="text-[10px] font-bold uppercase block mb-1">Patron Full Name</label>
                  <input 
                    type="text" 
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3 py-2.5 font-bold focus:outline-none focus:border-gold-500 text-obsidian-900"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase block mb-1">Registered Email (Read-Only)</label>
                  <input 
                    type="text" 
                    value={currentUser.email}
                    disabled
                    className="w-full bg-cream-200/50 border border-cream-300 rounded-xl px-3 py-2.5 text-obsidian-900/50 font-semibold focus:outline-none cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase block mb-1">Mobile Phone Number</label>
                  <input 
                    type="tel" 
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3 py-2.5 font-bold focus:outline-none focus:border-gold-500 text-obsidian-900"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase block mb-1">Biographical Note</label>
                  <input 
                    type="text" 
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-gold-500 text-obsidian-900"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-obsidian-900 text-cream-100 rounded-xl font-bold uppercase text-xs hover:bg-gold-500 hover:text-obsidian-900 transition-all flex items-center gap-1 shadow-sm"
                >
                  <Check className="w-4 h-4 text-gold-400" />
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {/* TAB: Orders ledger filterable list */}
          {activeTab === 'orders' && (
            <div className="bg-white p-6 rounded-3xl border border-cream-300 shadow-sm space-y-4 animate-fade-in">
              <div className="flex justify-between items-center border-b pb-2 flex-wrap gap-2">
                <h3 className="font-serif text-base font-bold">Patron Order Ledger</h3>
                
                {/* Filters */}
                <select
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value as any)}
                  className="bg-cream-100 border border-cream-300 rounded-lg px-2.5 py-1 text-[11px] font-bold focus:outline-none"
                >
                  <option value="ALL">Show All Orders</option>
                  <option value="PROCESSING">Show Processing Only</option>
                  <option value="SHIPPED">Show Shipped Only</option>
                  <option value="DELIVERED">Show Delivered Only</option>
                  <option value="CANCELLED">Show Cancelled Only</option>
                </select>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-10 text-xs text-obsidian-900/60 font-medium">No order transactions match selection.</div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map(o => (
                    <div 
                      key={o.id}
                      onClick={() => openOrderDetail(o.id)}
                      className="p-4 bg-cream-100/50 hover:bg-cream-200/50 rounded-2xl border border-cream-300 transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">#{o.orderNumber}</span>
                          {renderStatusBadge(o.status)}
                        </div>
                        <p className="text-[11px] text-obsidian-900/60">{new Date(o.createdAt).toLocaleDateString()} • {o.items.length} items</p>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-auto font-sans">
                        <div className="text-right">
                          <span className="text-[10px] text-obsidian-900/50 block font-bold uppercase tracking-wider">Grand Total</span>
                          <span className="font-serif font-bold text-sm text-gold-700">₹{o.grandTotal.toLocaleString()}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-obsidian-900/30" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: Saved Addresses list with Default Badging */}
          {activeTab === 'addresses' && (
            <div className="bg-white p-6 rounded-3xl border border-cream-300 shadow-sm space-y-4 animate-fade-in">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-serif text-base font-bold">Saved Shipping Addresses</h3>
                {!showAddressForm && (
                  <button 
                    onClick={() => setShowAddressForm(true)}
                    className="px-3 py-1.5 bg-obsidian-900 hover:bg-gold-500 hover:text-obsidian-900 text-cream-100 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Address
                  </button>
                )}
              </div>

              {/* Add form */}
              {showAddressForm && (
                <form onSubmit={handleCreateAddress} className="bg-cream-100/50 p-4 rounded-2xl border border-cream-300 space-y-3 text-xs">
                  <h4 className="font-bold uppercase tracking-wider border-b pb-1 flex justify-between">
                    <span>Add New Address Card</span>
                    <button type="button" onClick={() => setShowAddressForm(false)} className="text-gold-700 font-bold hover:underline">Cancel</button>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-bold uppercase block mb-1">Full Name</label>
                      <input 
                        type="text" 
                        value={addrName}
                        onChange={(e) => setAddrName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-gold-500 font-bold"
                      />
                      {errors.name && <p className="text-[10px] text-terracotta-500 font-bold mt-0.5">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="text-[9px] font-bold uppercase block mb-1">Phone Number</label>
                      <input 
                        type="tel" 
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                        placeholder="10-digit number"
                        className="w-full bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-gold-500 font-bold"
                      />
                      {errors.phone && <p className="text-[10px] text-terracotta-500 font-bold mt-0.5">{errors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold uppercase block mb-1">Flat, House No., Street Address</label>
                    <input 
                      type="text" 
                      value={addrStreet}
                      onChange={(e) => setAddrStreet(e.target.value)}
                      placeholder="e.g. 42 Lavelle Road"
                      className="w-full bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-gold-500"
                    />
                    {errors.street && <p className="text-[10px] text-terracotta-500 font-bold mt-0.5">{errors.street}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[9px] font-bold uppercase block mb-1">PIN Code</label>
                      <input 
                        type="text" 
                        maxLength={6}
                        value={addrPincode}
                        onChange={(e) => setAddrPincode(e.target.value)}
                        placeholder="560001"
                        className="w-full bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-gold-500 font-bold"
                      />
                      {errors.pincode && <p className="text-[10px] text-terracotta-500 font-bold mt-0.5">{errors.pincode}</p>}
                    </div>

                    <div>
                      <label className="text-[9px] font-bold uppercase block mb-1">City</label>
                      <input 
                        type="text" 
                        value={addrCity}
                        onChange={(e) => setAddrCity(e.target.value)}
                        className="w-full bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-gold-500 font-semibold"
                      />
                      {errors.city && <p className="text-[10px] text-terracotta-500 font-bold mt-0.5">{errors.city}</p>}
                    </div>

                    <div>
                      <label className="text-[9px] font-bold uppercase block mb-1">State</label>
                      <input 
                        type="text" 
                        value={addrState}
                        onChange={(e) => setAddrState(e.target.value)}
                        className="w-full bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-gold-500 font-semibold"
                      />
                      {errors.state && <p className="text-[10px] text-terracotta-500 font-bold mt-0.5">{errors.state}</p>}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-obsidian-900 hover:bg-gold-500 hover:text-obsidian-900 py-2.5 rounded-xl font-bold uppercase text-[10px]"
                  >
                    Save Delivery Address
                  </button>
                </form>
              )}

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedAddresses.map(addr => (
                  <div key={addr.id} className="p-4 rounded-2xl border border-cream-300 bg-cream-100/30 text-xs space-y-2 relative flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{addr.name}</span>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 bg-emerald-600/10 text-emerald-800 border border-emerald-300 rounded text-[9px] font-bold uppercase">Primary</span>
                        )}
                      </div>
                      <p>{addr.street}</p>
                      <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="text-obsidian-900/60 font-semibold pt-0.5">Phone: +91 {addr.phone}</p>
                    </div>

                    <div className="pt-2 border-t border-cream-200 flex justify-between gap-2">
                      {!addr.isDefault && (
                        <button 
                          onClick={() => setDefaultAddress(addr.id)}
                          className="text-[10px] font-bold text-gold-700 hover:underline"
                        >
                          Set default
                        </button>
                      )}
                      <button 
                        onClick={() => deleteAddress(addr.id)}
                        className="text-[10px] font-bold text-terracotta-500 hover:underline flex items-center gap-0.5 ml-auto"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Vault Credit Cards */}
          {activeTab === 'payments' && (
            <div className="bg-white p-6 rounded-3xl border border-cream-300 shadow-sm space-y-4 animate-fade-in">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-serif text-base font-bold">Secure Vault Credit Cards</h3>
                {!showCardForm && (
                  <button 
                    onClick={() => setShowCardForm(true)}
                    className="px-3 py-1.5 bg-obsidian-900 hover:bg-gold-500 hover:text-obsidian-900 text-cream-100 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Card
                  </button>
                )}
              </div>

              {showCardForm && (
                <form onSubmit={handleCreateCard} className="bg-cream-100/50 p-4 rounded-2xl border border-cream-300 space-y-3 text-xs">
                  <h4 className="font-bold uppercase tracking-wider border-b pb-1 flex justify-between">
                    <span>Add New vault Card</span>
                    <button type="button" onClick={() => setShowCardForm(false)} className="text-gold-700 font-bold hover:underline">Cancel</button>
                  </h4>

                  <div>
                    <label className="text-[9px] font-bold uppercase block mb-1">16-Digit Card Number</label>
                    <input 
                      type="text" 
                      value={cardNo}
                      onChange={(e) => setCardNo(e.target.value.replace(/\D/g, '').slice(0, 16))}
                      placeholder="e.g. 4123 4567 8901 2345"
                      className="w-full bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs font-bold tracking-widest focus:outline-none focus:border-gold-500"
                    />
                    {errors.cardNo && <p className="text-[10px] text-terracotta-500 font-bold mt-0.5">{errors.cardNo}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-bold uppercase block mb-1">Cardholder Name</label>
                      <input 
                        type="text" 
                        value={cardHolderName}
                        onChange={(e) => setCardHolderName(e.target.value.toUpperCase())}
                        placeholder="ANANYA SHARMA"
                        className="w-full bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-gold-500 font-bold"
                      />
                      {errors.cardHolderName && <p className="text-[10px] text-terracotta-500 font-bold mt-0.5">{errors.cardHolderName}</p>}
                    </div>

                    <div>
                      <label className="text-[9px] font-bold uppercase block mb-1">Expiry Date (MM/YY)</label>
                      <input 
                        type="text" 
                        value={cardExp}
                        onChange={(e) => setCardExp(e.target.value.replace(/[^\d/]/g, '').slice(0, 5))}
                        placeholder="12/28"
                        className="w-full bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-gold-500 font-bold"
                      />
                      {errors.cardExp && <p className="text-[10px] text-terracotta-500 font-bold mt-0.5">{errors.cardExp}</p>}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-obsidian-900 hover:bg-gold-500 hover:text-obsidian-900 py-2.5 rounded-xl font-bold uppercase text-[10px]"
                  >
                    Verify & Add Card
                  </button>
                </form>
              )}

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedCards.map(c => (
                  <div key={c.id} className="bg-gradient-to-br from-obsidian-900 to-obsidian-800 text-cream-100 p-5 rounded-2xl border border-gold-500/30 flex flex-col justify-between aspect-[1.586] relative overflow-hidden shadow-md">
                    <div className="flex justify-between items-start">
                      <CreditCard className="w-8 h-8 text-gold-400" />
                      <span className="text-[9px] tracking-widest uppercase font-bold text-gold-400">eclipsera Vault</span>
                    </div>

                    <div className="space-y-0.5 pt-4">
                      <p className="font-mono text-sm tracking-widest">{c.cardMasked}</p>
                      <div className="flex justify-between items-center text-[9px] pt-1">
                        <div>
                          <span className="opacity-50 block uppercase">Cardholder</span>
                          <span className="font-bold">{c.cardHolder}</span>
                        </div>
                        <div className="text-right">
                          <span className="opacity-50 block uppercase">Expires</span>
                          <span className="font-bold">{c.expiry}</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => deleteCard(c.id)}
                      className="absolute top-3 right-3 text-cream-100/40 hover:text-terracotta-500 transition-colors"
                      title="Delete card"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Wallet Credits Balance */}
          {activeTab === 'wallet' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white p-6 rounded-3xl border border-cream-300 shadow-sm flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5" />
                    Store Credits Wallet
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-obsidian-900">₹{walletBalance.toLocaleString()}</h3>
                  <p className="text-[11px] text-obsidian-900/60 font-sans">Used automatically during order checkout to offset payment grand totals.</p>
                </div>
                <div className="p-4 bg-emerald-600/10 border border-emerald-300 rounded-full text-emerald-800">
                  <Sparkles className="w-8 h-8" />
                </div>
              </div>

              {/* Transactions log list */}
              <div className="bg-white p-6 rounded-3xl border border-cream-300 shadow-sm space-y-4">
                <h4 className="font-serif text-sm font-bold border-b pb-2">Credit Transaction History</h4>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left min-w-[400px]">
                    <thead>
                      <tr className="border-b border-cream-300 text-obsidian-900/50 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-2">Txn Date</th>
                        <th className="py-2">Description</th>
                        <th className="py-2 text-right">Amount Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cream-100">
                      {walletTransactions.map(t => (
                        <tr key={t.id}>
                          <td className="py-3 text-obsidian-900/60 font-medium">{new Date(t.date).toLocaleDateString()}</td>
                          <td className="py-3 font-semibold">{t.description}</td>
                          <td className={`py-3 text-right font-mono font-bold ${t.type === 'CREDIT' ? 'text-emerald-700' : 'text-terracotta-600'}`}>
                            {t.type === 'CREDIT' ? `+₹${t.amount}` : `-₹${t.amount}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Written Reviews list & write new */}
          {activeTab === 'reviews' && (
            <div className="bg-white p-6 rounded-3xl border border-cream-300 shadow-sm space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-serif text-base font-bold">My Written Reviews</h3>
                {!showWriteReview && (
                  <button 
                    onClick={() => setShowWriteReview(true)}
                    className="px-3 py-1.5 bg-obsidian-900 hover:bg-gold-500 hover:text-obsidian-900 text-cream-100 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Write Review
                  </button>
                )}
              </div>

              {/* Form to write new */}
              {showWriteReview && (
                <form onSubmit={handleCreateReview} className="bg-cream-100/50 p-4 rounded-2xl border border-cream-300 space-y-4 text-xs">
                  <h4 className="font-bold uppercase tracking-wider border-b pb-1 flex justify-between">
                    <span>Write Verified Product Review</span>
                    <button type="button" onClick={() => setShowWriteReview(false)} className="text-gold-700 font-bold hover:underline">Cancel</button>
                  </h4>

                  <div>
                    <label className="text-[9px] font-bold uppercase block mb-1">Select Craft Product purchased</label>
                    <select
                      value={reviewProductId}
                      onChange={(e) => setReviewProductId(e.target.value)}
                      className="w-full bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-gold-500 font-bold text-obsidian-900"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold uppercase block mb-1">Star rating selection</label>
                    <div className="flex gap-1.5 pt-0.5">
                      {[1, 2, 3, 4, 5].map(num => (
                        <button 
                          key={num}
                          type="button"
                          onClick={() => setReviewRating(num)}
                          className="hover:scale-110 transition-transform"
                        >
                          <Star className={`w-6 h-6 ${reviewRating >= num ? 'text-gold-500 fill-current' : 'text-cream-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold uppercase block mb-1">Written Review comment</label>
                    <textarea 
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                      rows={4}
                      placeholder="Share your review about texture, dyes safety, weight, and artisan build quality..."
                      className="w-full bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-obsidian-900 hover:bg-gold-500 hover:text-obsidian-900 py-2.5 rounded-xl font-bold uppercase text-[10px]"
                  >
                    Submit Verified Review
                  </button>
                </form>
              )}

              {/* Review listings */}
              <div className="space-y-4">
                {userReviews.map(r => (
                  <div key={r.id} className="p-4 bg-cream-100/30 rounded-2xl border border-cream-300 text-xs space-y-2 relative">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-serif font-bold text-sm text-obsidian-900">{r.productTitle}</h4>
                        <div className="flex items-center gap-1.5 pt-1">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(num => (
                              <Star key={num} className={`w-3.5 h-3.5 ${r.rating >= num ? 'text-gold-500 fill-current' : 'text-cream-300'}`} />
                            ))}
                          </div>
                          <span className="text-[10px] text-obsidian-900/50 font-medium">{new Date(r.date).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => deleteReview(r.id)}
                        className="p-1.5 text-obsidian-900/30 hover:text-terracotta-500 transition-colors"
                        title="Delete review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-obsidian-900/70 font-sans leading-relaxed pt-1">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Notifications */}
          {activeTab === 'notifications' && (
            <div className="bg-white p-6 rounded-3xl border border-cream-300 shadow-sm space-y-4 animate-fade-in">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-serif text-base font-bold">System Notifications</h3>
                {notifications.some(n => !n.read) && (
                  <button 
                    onClick={markNotificationsAsRead}
                    className="text-xs text-gold-700 font-bold hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="divide-y divide-cream-200">
                {notifications.map(n => (
                  <div key={n.id} className={`py-3.5 flex justify-between gap-4 text-xs ${!n.read ? 'bg-gold-500/5 px-2 rounded-xl border border-gold-500/20' : ''}`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm">{n.title}</span>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-gold-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-obsidian-900/70 font-sans leading-relaxed">{n.message}</p>
                      <span className="text-[9px] text-obsidian-900/40 block font-medium">{new Date(n.date).toLocaleString()}</span>
                    </div>

                    <button 
                      onClick={() => deleteNotification(n.id)}
                      className="p-1 text-obsidian-900/30 hover:text-terracotta-500 self-start transition-colors shrink-0"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Blueprint custom orders */}
          {activeTab === 'custom-order' && (
            <form onSubmit={handleCreateCustomOrder} className="bg-white p-6 rounded-3xl border border-cream-300 shadow-sm space-y-5 animate-fade-in">
              <div>
                <span className="text-[10px] font-bold text-gold-700 uppercase tracking-widest block">CUSTOM CRAFTING SERVICES</span>
                <h3 className="font-serif text-base font-bold">Blueprint Custom Order Request</h3>
                <p className="text-xs text-obsidian-900/60 font-sans mt-0.5">Submit custom measurements, wood carvings, or brass engraving configurations directly to specific artisan guilds.</p>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="text-[10px] font-bold uppercase block mb-1">Describe custom masterpiece requirements</label>
                  <textarea 
                    value={customDesc}
                    onChange={(e) => setCustomDesc(e.target.value)}
                    required
                    rows={4}
                    placeholder="Elaborate dimensions, specific wood type (e.g. Ivory wood, Teak wood), custom paint finishes, or lettering details..."
                    className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-gold-500 font-medium text-obsidian-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase block mb-1">Craft category</label>
                    <select
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-gold-500 text-obsidian-900 font-bold"
                    >
                      <option value="woodcraft">Channapatna Wooden Toys & Craft</option>
                      <option value="pottery">Studio Handcrafted Pottery</option>
                      <option value="metalwork">Etikoppaka Lacware & Brass items</option>
                      <option value="paintings">Traditional Madhubani Artworks</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase block mb-1">Preferred artisan / Guild master (Optional)</label>
                    <select
                      value={customArtisan}
                      onChange={(e) => setCustomArtisan(e.target.value)}
                      className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-gold-500 text-obsidian-900 font-semibold"
                    >
                      <option value="">Any Guild Artisan Master</option>
                      <option value="ramappa">Master Craftsman B. Ramappa (Toys)</option>
                      <option value="devi">Smt. Radha Devi (Artworks)</option>
                    </select>
                  </div>
                </div>

                {/* Budget Slider */}
                <div>
                  <label className="text-[10px] font-bold uppercase block mb-1 flex justify-between">
                    <span>Target Budget Cap</span>
                    <span className="text-gold-700 font-bold font-mono">₹{customBudget.toLocaleString()}</span>
                  </label>
                  <input 
                    type="range"
                    min={500}
                    max={20000}
                    step={500}
                    value={customBudget}
                    onChange={(e) => setCustomBudget(Number(e.target.value))}
                    className="w-full accent-gold-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-obsidian-900/40 pt-0.5">
                    <span>Min: ₹500</span>
                    <span>Max: ₹20,000+</span>
                  </div>
                </div>

                {/* Contact preference */}
                <div>
                  <label className="text-[10px] font-bold uppercase block mb-1">Preferred Contact Preference</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer font-medium select-none">
                      <input 
                        type="radio" 
                        name="customContact"
                        checked={customContactPref === 'email'}
                        onChange={() => setCustomContactPref('email')}
                        className="w-4.5 h-4.5 text-gold-500 accent-gold-500 cursor-pointer"
                      />
                      <span>Email updates</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer font-medium select-none">
                      <input 
                        type="radio" 
                        name="customContact"
                        checked={customContactPref === 'phone'}
                        onChange={() => setCustomContactPref('phone')}
                        className="w-4.5 h-4.5 text-gold-500 accent-gold-500 cursor-pointer"
                      />
                      <span>Direct phone call</span>
                    </label>
                  </div>
                </div>

                {/* Reference upload */}
                <div>
                  <label className="text-[10px] font-bold uppercase block mb-1">Upload Reference Image (Optional)</label>
                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-cream-300 hover:border-gold-500 rounded-xl cursor-pointer bg-cream-100 text-obsidian-900/40 transition-colors">
                      <Camera className="w-5 h-5 mb-0.5" />
                      <span className="text-[8px] font-bold uppercase">Upload</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const r = new FileReader();
                            r.onloadend = () => setCustomRefPhoto(r.result as string);
                            r.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>

                    {customRefPhoto && (
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-cream-300 relative group shadow-sm">
                        <img src={customRefPhoto} alt="Ref Blueprint preview" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setCustomRefPhoto(null)}
                          className="absolute inset-0 bg-obsidian-900/70 text-white text-[9px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              <button
                type="submit"
                className="w-full bg-obsidian-900 text-cream-100 hover:bg-gold-500 hover:text-obsidian-900 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md mt-4 font-sans"
              >
                <Check className="w-4 h-4 text-gold-400" />
                Submit Blueprint Blueprint Request
              </button>
            </form>
          )}

          {/* TAB: Security & Password */}
          {activeTab === 'security' && (
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (newPass !== confirmNewPass) {
                showToast('New passwords do not match. Please re-enter.', 'warning');
                return;
              }
              const res = await changePassword(currentPass, newPass);
              if (res && res.success) {
                setCurrentPass('');
                setNewPass('');
                setConfirmNewPass('');
              }
            }} className="bg-white p-6 rounded-3xl border border-cream-300 shadow-sm space-y-5 animate-fade-in">
              <h3 className="font-serif text-base font-bold border-b pb-2">Security & Password Management</h3>
              <p className="text-xs text-obsidian-900/60 font-sans">
                Update your account password. Changing your password invalidates all other active sessions for security.
              </p>

              <div className="space-y-3 max-w-md text-xs">
                <div>
                  <label className="text-[10px] font-bold uppercase block mb-1">Current Password</label>
                  <input 
                    type="password" 
                    required
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-gold-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase block mb-1">New Password (8+ chars)</label>
                  <input 
                    type="password" 
                    required
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-gold-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase block mb-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    required
                    value={confirmNewPass}
                    onChange={(e) => setConfirmNewPass(e.target.value)}
                    className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-gold-500 font-bold"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-obsidian-900 text-cream-100 hover:bg-gold-500 hover:text-obsidian-900 py-3 rounded-xl font-bold uppercase text-xs tracking-wider transition-all mt-2"
                >
                  Update Password & End Other Sessions
                </button>
              </div>
            </form>
          )}

          {/* TAB: Account Danger Zone */}
          {activeTab === 'danger' && (
            <div className="bg-white p-6 rounded-3xl border border-rose-500/30 shadow-sm space-y-4 animate-fade-in">
              <h3 className="font-serif text-base font-bold text-rose-700 border-b pb-2 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-600" />
                <span>Account Security & Danger Zone</span>
              </h3>
              <p className="text-xs text-obsidian-900/70 font-medium leading-relaxed">
                Permanently delete your Eclipsera patron account. This action removes your profile credentials, saved delivery addresses, stored vault cards, and order tracking history. This process is immediate and irreversible.
              </p>

              <div className="pt-2">
                <button 
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold uppercase text-xs flex items-center gap-2 shadow-md transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete My Account Permanently</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Delete Account Double Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-obsidian-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 border border-rose-500/40 shadow-2xl space-y-4 text-center relative animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-600">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-xl text-obsidian-900">Are you absolutely sure?</h3>
              <p className="text-xs text-obsidian-900/70 leading-relaxed font-medium">
                Deleting your account will purge your saved addresses, payment methods, and purchase order history. You cannot undo this action.
              </p>
            </div>
            <div className="pt-2 space-y-2">
              <button 
                type="button"
                onClick={async () => {
                  setIsDeleteModalOpen(false);
                  await deleteCustomerAccount();
                }}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>Yes, Delete Account Now</span>
              </button>
              <button 
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-xs font-semibold text-obsidian-900/60 hover:underline block mx-auto py-1"
              >
                Cancel & Keep My Account
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default AccountView;

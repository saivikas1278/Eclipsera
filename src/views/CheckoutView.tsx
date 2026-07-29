import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, Lock, CreditCard, CheckCircle2, ArrowRight, Tag, Truck, RefreshCw, Sparkles, MapPin } from 'lucide-react';

export const CheckoutView: React.FC = () => {
  const { 
    cart, 
    subtotal, 
    mrpTotal,
    savingsFromMRP,
    discountTotal, 
    totalSavings,
    shippingFee, 
    taxTotal, 
    grandTotal, 
    appliedCoupon, 
    applyCoupon, 
    removeCoupon,
    placeOrder,
    currentUser,
    setCurrentView
  } = useStore();

  // Form State
  const [email, setEmail] = useState(currentUser?.email || 'ananya.sharma@example.com');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98765 43210');
  const [firstName, setFirstName] = useState(currentUser?.name ? currentUser.name.split(' ')[0] : 'Ananya');
  const [lastName, setLastName] = useState(currentUser?.name && currentUser.name.split(' ').length > 1 ? currentUser.name.split(' ')[1] : 'Sharma');
  const [street, setStreet] = useState(currentUser?.address?.street || '42 Lavelle Road, Indiranagar');
  const [pincode, setPincode] = useState(currentUser?.address?.pincode || '560001');
  const [city, setCity] = useState(currentUser?.address?.city || 'Bengaluru');
  const [state, setState] = useState(currentUser?.address?.state || 'Karnataka');
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'COD'>('RAZORPAY');

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState('');

  // Payment Modal Simulator state
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'IDLE' | 'MODAL' | 'SUCCESS'>('IDLE');

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-3xl font-bold text-obsidian-900">Your shopping cart is empty</h2>
        <p className="text-xs text-obsidian-900/60">Please add items to your cart before proceeding to checkout.</p>
        <button 
          onClick={() => setCurrentView('shop')}
          className="px-6 py-3 bg-obsidian-900 text-cream-100 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gold-600 hover:text-obsidian-900 transition-all"
        >
          Return to Handcrafted Shop
        </button>
      </div>
    );
  }

  const handlePincodeChange = (val: string) => {
    setPincode(val);
    if (val === '560001' || val === '560038') {
      setCity('Bengaluru'); setState('Karnataka');
    } else if (val === '110001' || val === '110003') {
      setCity('New Delhi'); setState('Delhi');
    } else if (val === '400001' || val === '400050') {
      setCity('Mumbai'); setState('Maharashtra');
    }
  };

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponMsg(res.message);
    if (res.success) setCouponInput('');
  };

  const handleStartPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentStep('MODAL');
  };

  const handleConfirmRazorpayPayment = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setPaymentStep('SUCCESS');
      placeOrder({
        firstName, lastName, email, phone, street, city, state, pincode
      }, paymentMethod === 'RAZORPAY' ? 'Razorpay UPI (GPay / PhonePe)' : 'Cash on Delivery (COD)');
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="border-b border-cream-300 pb-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-gold-700 uppercase tracking-widest">AMAZON / FLIPKART STYLE CHECKOUT</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-obsidian-900">Secure Order Checkout</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-gold-700 font-bold bg-gold-500/10 px-3 py-1.5 rounded-full border border-gold-500/30">
          <ShieldCheck className="w-4 h-4 text-gold-600" />
          <span>256-Bit SSL Encrypted</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: 3-Step Checkout Form */}
        <form onSubmit={handleStartPayment} className="lg:col-span-7 space-y-6">
          
          {/* Step 1: Delivery Address */}
          <div className="bg-white p-6 rounded-2xl border border-cream-300 space-y-4 shadow-sm">
            <h3 className="font-serif text-base font-bold text-obsidian-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gold-500 text-obsidian-900 text-xs font-bold flex items-center justify-center">1</span>
              Delivery Address & Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-obsidian-900 uppercase block mb-1">Email (for updates)</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3 py-2 text-xs text-obsidian-900 font-medium focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-obsidian-900 uppercase block mb-1">Mobile Phone Number</label>
                <input 
                  type="tel" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3 py-2 text-xs text-obsidian-900 font-medium focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-obsidian-900 uppercase block mb-1">First Name</label>
                <input 
                  type="text" 
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3 py-2 text-xs text-obsidian-900 font-medium focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-obsidian-900 uppercase block mb-1">Last Name</label>
                <input 
                  type="text" 
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3 py-2 text-xs text-obsidian-900 font-medium focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-obsidian-900 uppercase block mb-1">Flat, House No., Street Address</label>
              <input 
                type="text" 
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3 py-2 text-xs text-obsidian-900 font-medium focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-obsidian-900 uppercase block mb-1">PIN Code</label>
                <input 
                  type="text" 
                  required
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  placeholder="560001"
                  className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3 py-2 text-xs text-obsidian-900 font-bold focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-obsidian-900 uppercase block mb-1">City</label>
                <input 
                  type="text" 
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3 py-2 text-xs text-obsidian-900 font-medium focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-obsidian-900 uppercase block mb-1">State</label>
                <input 
                  type="text" 
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3 py-2 text-xs text-obsidian-900 font-medium focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method Selection */}
          <div className="bg-white p-6 rounded-2xl border border-cream-300 space-y-4 shadow-sm">
            <h3 className="font-serif text-base font-bold text-obsidian-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gold-500 text-obsidian-900 text-xs font-bold flex items-center justify-center">2</span>
              Select Payment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div 
                onClick={() => setPaymentMethod('RAZORPAY')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'RAZORPAY' 
                    ? 'border-gold-500 bg-gold-500/10 shadow-sm' 
                    : 'border-cream-300 bg-cream-100 hover:border-cream-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-serif font-bold text-xs text-obsidian-900">Razorpay Online</span>
                  <CreditCard className="w-4 h-4 text-gold-600" />
                </div>
                <p className="text-[11px] text-obsidian-900/70">
                  Instant UPI (GPay, PhonePe), Credit/Debit Cards, NetBanking.
                </p>
              </div>

              <div 
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'COD' 
                    ? 'border-gold-500 bg-gold-500/10 shadow-sm' 
                    : 'border-cream-300 bg-cream-100 hover:border-cream-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-serif font-bold text-xs text-obsidian-900">Cash on Delivery</span>
                  <Truck className="w-4 h-4 text-gold-600" />
                </div>
                <p className="text-[11px] text-obsidian-900/70">
                  Pay cash upon delivery with OTP verification.
                </p>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-obsidian-900 text-cream-100 hover:bg-gold-600 hover:text-obsidian-900 py-3.5 rounded-2xl text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 shadow-xl transition-all"
          >
            <span>Place Order (Pay ₹{grandTotal.toLocaleString()})</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        {/* Right Column: Step 3 Order Review & Cost Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-cream-200/60 p-6 rounded-3xl border border-cream-300 space-y-4 sticky top-28">
            <h3 className="font-serif text-base font-bold text-obsidian-900 border-b border-cream-300 pb-3 flex items-center justify-between">
              <span>Order Summary Review</span>
              <span className="text-xs text-gold-700 font-bold">{cart.reduce((a, b) => a + b.quantity, 0)} Items</span>
            </h3>

            {/* Savings Callout */}
            {totalSavings > 0 && (
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Total Savings: ₹{totalSavings.toLocaleString()} on this purchase!
              </div>
            )}

            {/* Item Thumbnails */}
            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
              {cart.map(item => (
                <div key={item.variantId} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={item.product.images[0]} alt="" className="w-10 h-12 object-cover rounded-lg border border-cream-300 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-obsidian-900 truncate">{item.product.title}</p>
                      <p className="text-gold-700 font-medium text-[11px]">{item.colorName} • Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-obsidian-900 shrink-0">₹{(item.unitPrice * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Coupon Code Section */}
            <form onSubmit={handleCouponSubmit} className="space-y-1 pt-2 border-t border-cream-300">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Coupon Code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs uppercase font-medium focus:outline-none focus:border-gold-500"
                />
                <button type="submit" className="bg-obsidian-900 text-cream-100 px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-gold-600 hover:text-obsidian-900">
                  Apply
                </button>
              </div>
              {couponMsg && <p className="text-[11px] text-gold-700 font-semibold">{couponMsg}</p>}
            </form>

            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs text-obsidian-900 font-medium border-t border-cream-300 pt-3">
              <div className="flex justify-between">
                <span>Subtotal (MRP)</span>
                <span>₹{mrpTotal.toLocaleString()}</span>
              </div>
              {savingsFromMRP > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>MRP Discount</span>
                  <span>-₹{savingsFromMRP.toLocaleString()}</span>
                </div>
              )}
              {discountTotal > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{discountTotal.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST (5% Handcrafted)</span>
                <span>₹{taxTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>{shippingFee === 0 ? <span className="text-gold-700 font-bold">FREE</span> : `₹${shippingFee}`}</span>
              </div>
              <div className="flex justify-between font-serif text-base font-bold text-obsidian-900 pt-2 border-t border-cream-300">
                <span>Grand Total</span>
                <span className="text-gold-700">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Razorpay Interactive Modal Simulator */}
      {paymentStep === 'MODAL' && (
        <div className="fixed inset-0 z-50 bg-obsidian-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white max-w-md w-full rounded-3xl overflow-hidden shadow-2xl border border-gold-500/40 space-y-5 p-6 text-center">
            
            <div className="flex items-center justify-between border-b pb-3">
              <div className="text-left">
                <span className="text-[10px] font-bold tracking-widest text-gold-600 uppercase">Razorpay Secure Gateway</span>
                <h4 className="font-serif font-bold text-base text-obsidian-900">eclipsera_premium</h4>
              </div>
              <span className="font-serif font-bold text-lg text-gold-700">₹{grandTotal.toLocaleString()}</span>
            </div>

            <div className="p-3.5 bg-cream-100 rounded-2xl border border-cream-300 space-y-1 text-xs text-left">
              <p><strong>Customer:</strong> {firstName} {lastName}</p>
              <p><strong>Shipping To:</strong> {city}, {state} ({pincode})</p>
              <p><strong>Payment Mode:</strong> {paymentMethod === 'RAZORPAY' ? 'Instant UPI / Card' : 'Cash on Delivery (COD)'}</p>
            </div>

            <div className="space-y-2.5">
              <button 
                onClick={handleConfirmRazorpayPayment}
                disabled={isPaying}
                className="w-full bg-emerald-600 text-white hover:bg-emerald-700 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                {isPaying ? (
                  <span>Verifying HMAC Signature...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Simulate Successful Order Payment
                  </>
                )}
              </button>

              <button 
                onClick={() => setPaymentStep('IDLE')}
                className="text-xs text-obsidian-900/60 hover:underline font-semibold"
              >
                Cancel & Return to Address Form
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { ShieldCheck, CreditCard, Check, ArrowRight, ArrowLeft, Tag, Truck, Gift, User, MapPin, Sparkles, CheckCircle2, Wallet, CircleDot } from 'lucide-react';

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
    setCurrentView,
    savedAddresses,
    addAddress,
    savedCards,
    addCard,
    walletBalance,
    deductWalletBalance
  } = useUser();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Step 1: Address State
  const [selectedAddressId, setSelectedAddressId] = useState<string>(savedAddresses[0]?.id || '');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddrName, setNewAddrName] = useState('');
  const [newAddrPhone, setNewAddrPhone] = useState('');
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrState, setNewAddrState] = useState('');
  const [newAddrPincode, setNewAddrPincode] = useState('');

  // Step 2: Delivery State
  const [deliveryMethod, setDeliveryMethod] = useState<'STANDARD' | 'EXPRESS'>('STANDARD');
  const [useGiftWrapping, setUseGiftWrapping] = useState(false);

  // Step 3: Payment State
  const [payMode, setPayMode] = useState<'CARD' | 'UPI' | 'WALLET' | 'COD'>('CARD');
  const [selectedCardId, setSelectedCardId] = useState<string>(savedCards[0]?.id || 'new');
  // New Card Form
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [saveCardChecked, setSaveCardChecked] = useState(true);
  // UPI ID Input
  const [upiId, setUpiId] = useState('');
  // Wallet state
  const [useWalletBalance, setUseWalletBalance] = useState(false);

  // Step 4: Terms check
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);

  // Delivery costs calculation
  const expressFee = deliveryMethod === 'EXPRESS' ? 150 : 0;
  const giftWrapFee = useGiftWrapping ? 50 : 0;
  
  // Calculate Wallet deduction
  const baseGrandTotal = Math.max(0, grandTotal + expressFee + giftWrapFee);
  const walletDeduction = useWalletBalance ? Math.min(walletBalance, baseGrandTotal) : 0;
  const finalGrandTotal = Math.max(0, baseGrandTotal - walletDeduction);

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4 animate-fade-in text-obsidian-900">
        <h2 className="font-serif text-3xl font-bold">Your shopping cart is empty</h2>
        <p className="text-xs text-obsidian-900/60 font-sans">Please add items to your cart before proceeding to checkout.</p>
        <button 
          onClick={() => setCurrentView('shop')}
          className="px-6 py-3 bg-obsidian-900 text-cream-100 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gold-600 hover:text-obsidian-900 transition-all font-sans"
        >
          Return to Handcrafted Shop
        </button>
      </div>
    );
  }

  // Format credit card number with spaces (e.g. 1234 5678 1234 5678)
  const handleCardNumberChange = (val: string) => {
    const numeric = val.replace(/\D/g, '');
    const trimmed = numeric.slice(0, 16);
    const matches = trimmed.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(trimmed);
    }
  };

  // Step 1 Validation
  const validateStep1 = () => {
    const errs: {[key: string]: string} = {};
    if (showNewAddressForm) {
      if (!newAddrName.trim()) errs.name = 'Full name is required';
      if (!newAddrPhone.trim() || newAddrPhone.replace(/\D/g, '').length < 10) errs.phone = 'Enter a valid 10-digit mobile number';
      if (!newAddrStreet.trim()) errs.street = 'Street address is required';
      if (!newAddrCity.trim()) errs.city = 'City name is required';
      if (!newAddrState.trim()) errs.state = 'State name is required';
      if (!newAddrPincode.trim() || newAddrPincode.replace(/\D/g, '').length !== 6) errs.pincode = 'Enter a valid 6-digit Indian PIN code';
    } else {
      if (!selectedAddressId) errs.addressSelection = 'Please select a shipping address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 3 Validation
  const validateStep3 = () => {
    const errs: {[key: string]: string} = {};
    
    // If wallet balance covers the entire order, no payment method validation needed
    if (finalGrandTotal === 0 && useWalletBalance) {
      setErrors({});
      return true;
    }

    if (payMode === 'CARD' && selectedCardId === 'new') {
      if (!cardNumber.trim() || cardNumber.replace(/\s/g, '').length !== 16) errs.cardNumber = 'Card number must be 16 digits';
      if (!cardHolder.trim()) errs.cardHolder = 'Cardholder name is required';
      if (!cardExpiry.trim() || !/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(cardExpiry)) errs.cardExpiry = 'Expiry must be in MM/YY format';
      if (!cardCvv.trim() || cardCvv.length !== 3) errs.cardCvv = 'CVV must be 3 digits';
    } else if (payMode === 'UPI') {
      if (!upiId.trim() || !upiId.includes('@')) errs.upiId = 'Enter a valid UPI ID (e.g. name@okhdfcbank)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Advance steps
  const handleNextStep = () => {
    if (step === 1) {
      if (validateStep1()) {
        if (showNewAddressForm) {
          const newAddr = {
            name: newAddrName,
            phone: newAddrPhone,
            street: newAddrStreet,
            city: newAddrCity,
            state: newAddrState,
            pincode: newAddrPincode,
            country: 'India'
          };
          addAddress(newAddr);
          setShowNewAddressForm(false);
          // Auto select newly created address
          const lastIndex = savedAddresses.length;
          setSelectedAddressId(`addr-${Date.now()}`); // Mock ID or auto select default
        }
        setStep(2);
      }
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      if (validateStep3()) {
        setStep(4);
      }
    }
  };

  const handlePlaceOrderSubmit = async () => {
    const errs: {[key: string]: string} = {};
    if (!agreeTerms) {
      errs.terms = 'You must agree to the Terms of Service';
      setErrors(errs);
      return;
    }
    setErrors({});
    setIsProcessing(true);

    // Deduct wallet balance if selected
    if (useWalletBalance && walletDeduction > 0) {
      deductWalletBalance(walletDeduction);
    }

    // Capture selected address
    const activeAddress = savedAddresses.find(a => a.id === selectedAddressId) || savedAddresses[0];

    setTimeout(async () => {
      setIsProcessing(false);
      let payLabel = '';
      if (finalGrandTotal === 0 && useWalletBalance) {
        payLabel = 'Store Credits Wallet';
      } else if (payMode === 'CARD') {
        payLabel = 'Credit/Debit Card';
        if (selectedCardId === 'new' && saveCardChecked) {
          addCard({ cardHolder, cardNumber, expiry: cardExpiry });
        }
      } else if (payMode === 'UPI') {
        payLabel = `UPI (ID: ${upiId})`;
      } else if (payMode === 'COD') {
        payLabel = 'Cash on Delivery (COD)';
      }

      await placeOrder({
        firstName: activeAddress.name.split(' ')[0] || 'Patron',
        lastName: activeAddress.name.split(' ')[1] || '',
        email: currentUser?.email || 'patron@example.com',
        phone: activeAddress.phone,
        street: activeAddress.street,
        city: activeAddress.city,
        state: activeAddress.state,
        pincode: activeAddress.pincode
      }, payLabel);
    }, 1500);
  };

  const handleCouponApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponMsg(res.message);
    if (res.success) setCouponInput('');
  };

  // Get active address details
  const activeAddressObj = savedAddresses.find(a => a.id === selectedAddressId) || savedAddresses[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-obsidian-900">
      
      {/* Header & Secure Shield */}
      <div className="border-b border-cream-300 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <span className="text-xs font-bold text-gold-700 uppercase tracking-widest block">SECURE PROTOCOL</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">Secure Order Checkout</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-gold-700 font-bold bg-gold-500/10 px-3.5 py-2 rounded-full border border-gold-500/30">
          <ShieldCheck className="w-4 h-4 text-gold-600" />
          <span>256-Bit SSL Encryption Active</span>
        </div>
      </div>

      {/* Persistent Wizard Progress Bar */}
      <div className="bg-cream-200/50 p-4 rounded-2xl border border-cream-300">
        <div className="flex items-center justify-between max-w-2xl mx-auto text-xs font-bold text-obsidian-900/60">
          {[
            { id: 1, label: 'Shipping' },
            { id: 2, label: 'Delivery' },
            { id: 3, label: 'Payment' },
            { id: 4, label: 'Review' }
          ].map(s => (
            <div key={s.id} className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] border transition-all ${
                step === s.id 
                  ? 'bg-gold-500 border-gold-500 text-obsidian-900 font-extrabold shadow-sm' 
                  : step > s.id 
                    ? 'bg-emerald-600 border-emerald-600 text-white font-extrabold'
                    : 'bg-white border-cream-300 text-obsidian-900/40'
              }`}>
                {step > s.id ? '✓' : s.id}
              </span>
              <span className={step === s.id ? 'text-obsidian-900 font-extrabold' : ''}>{s.label}</span>
            </div>
          ))}
        </div>
        <div className="w-full bg-cream-300 h-1.5 rounded-full mt-4 max-w-2xl mx-auto overflow-hidden">
          <div className="bg-gold-500 h-full transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }} />
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Active Step Wizards */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* STEP 1: Shipping Address Selection */}
          {step === 1 && (
            <div className="bg-white p-6 rounded-3xl border border-cream-300 space-y-4 shadow-sm animate-fade-in">
              <h3 className="font-serif text-base font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gold-600" />
                Select Shipping Address
              </h3>

              {/* Saved Addresses list */}
              <div className="space-y-2.5">
                {savedAddresses.map(addr => (
                  <label 
                    key={addr.id}
                    className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedAddressId === addr.id && !showNewAddressForm
                        ? 'border-gold-500 bg-gold-500/5' 
                        : 'border-cream-300 bg-cream-100/30 hover:border-cream-400'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="shippingAddressSelect"
                      checked={selectedAddressId === addr.id && !showNewAddressForm}
                      onChange={() => {
                        setSelectedAddressId(addr.id);
                        setShowNewAddressForm(false);
                      }}
                      className="w-4 h-4 mt-0.5 text-gold-500 accent-gold-500"
                    />
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{addr.name}</span>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 bg-gold-500/20 text-gold-800 rounded text-[9px] font-bold uppercase tracking-wider">Default</span>
                        )}
                      </div>
                      <p>{addr.street}</p>
                      <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="text-obsidian-900/60 font-semibold pt-0.5">Phone: +91 {addr.phone}</p>
                    </div>
                  </label>
                ))}
              </div>

              {errors.addressSelection && <p className="text-xs font-bold text-terracotta-500 mt-1">{errors.addressSelection}</p>}

              {/* Add New Address triggers */}
              {!showNewAddressForm ? (
                <button 
                  type="button" 
                  onClick={() => setShowNewAddressForm(true)}
                  className="w-full py-3 border-2 border-dashed border-gold-500/30 hover:border-gold-500/80 rounded-2xl text-xs font-bold text-gold-700 hover:text-gold-800 transition-all text-center block uppercase tracking-wider bg-cream-100/30"
                >
                  + Add New Shipping Address
                </button>
              ) : (
                <div className="bg-cream-100/50 p-4 rounded-2xl border border-cream-300 space-y-3 animate-fade-in text-xs">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="font-bold uppercase tracking-wide">New Address Blueprint</h4>
                    <button type="button" onClick={() => setShowNewAddressForm(false)} className="text-gold-700 font-bold hover:underline">Cancel</button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase block mb-1">Full Name</label>
                      <input 
                        type="text" 
                        value={newAddrName}
                        onChange={(e) => setNewAddrName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-gold-500 font-bold"
                      />
                      {errors.name && <p className="text-[10px] text-terracotta-500 font-bold mt-0.5">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase block mb-1">Phone Number</label>
                      <input 
                        type="tel" 
                        value={newAddrPhone}
                        onChange={(e) => setNewAddrPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-gold-500 font-bold"
                      />
                      {errors.phone && <p className="text-[10px] text-terracotta-500 font-bold mt-0.5">{errors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase block mb-1">Street Address, Flat, Building</label>
                    <input 
                      type="text" 
                      value={newAddrStreet}
                      onChange={(e) => setNewAddrStreet(e.target.value)}
                      placeholder="e.g. Flat 402, Oakwood Towers"
                      className="w-full bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-gold-500"
                    />
                    {errors.street && <p className="text-[10px] text-terracotta-500 font-bold mt-0.5">{errors.street}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase block mb-1">PIN Code</label>
                      <input 
                        type="text" 
                        maxLength={6}
                        value={newAddrPincode}
                        onChange={(e) => {
                          setNewAddrPincode(e.target.value);
                          if (e.target.value === '560001') { setNewAddrCity('Bengaluru'); setNewAddrState('Karnataka'); }
                        }}
                        placeholder="560001"
                        className="w-full bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-gold-500 font-bold"
                      />
                      {errors.pincode && <p className="text-[10px] text-terracotta-500 font-bold mt-0.5">{errors.pincode}</p>}
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase block mb-1">City</label>
                      <input 
                        type="text" 
                        value={newAddrCity}
                        onChange={(e) => setNewAddrCity(e.target.value)}
                        className="w-full bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-gold-500 font-semibold"
                      />
                      {errors.city && <p className="text-[10px] text-terracotta-500 font-bold mt-0.5">{errors.city}</p>}
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase block mb-1">State</label>
                      <input 
                        type="text" 
                        value={newAddrState}
                        onChange={(e) => setNewAddrState(e.target.value)}
                        className="w-full bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-gold-500 font-semibold"
                      />
                      {errors.state && <p className="text-[10px] text-terracotta-500 font-bold mt-0.5">{errors.state}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Forward trigger */}
              <button 
                onClick={handleNextStep}
                className="w-full bg-obsidian-900 text-cream-100 hover:bg-gold-500 hover:text-obsidian-900 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md mt-4"
              >
                <span>Proceed to Shipping Method</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Delivery Upgrades */}
          {step === 2 && (
            <div className="bg-white p-6 rounded-3xl border border-cream-300 space-y-5 shadow-sm animate-fade-in">
              <h3 className="font-serif text-base font-bold flex items-center gap-2">
                <Truck className="w-5 h-5 text-gold-600" />
                Select Delivery Mode
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Standard Shipping */}
                <div 
                  onClick={() => setDeliveryMethod('STANDARD')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    deliveryMethod === 'STANDARD' 
                      ? 'border-gold-500 bg-gold-500/10 shadow-sm' 
                      : 'border-cream-300 bg-cream-100/30 hover:border-cream-400'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span>Standard Insured Courier</span>
                    <span className="text-emerald-700">FREE / ₹{shippingFee}</span>
                  </div>
                  <p className="text-obsidian-900/60">Estimated Delivery: 3 to 5 business days.</p>
                </div>

                {/* Express Shipping */}
                <div 
                  onClick={() => setDeliveryMethod('EXPRESS')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    deliveryMethod === 'EXPRESS' 
                      ? 'border-gold-500 bg-gold-500/10 shadow-sm' 
                      : 'border-cream-300 bg-cream-100/30 hover:border-cream-400'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span>Air Express Delivery</span>
                    <span className="text-gold-700">+₹150</span>
                  </div>
                  <p className="text-obsidian-900/60">Guaranteed Delivery: 1 to 2 business days.</p>
                </div>
              </div>

              {/* Gift wrapping Add-on option */}
              <label className="flex items-start gap-3 p-4 bg-cream-200/40 border border-cream-300 rounded-2xl text-xs cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={useGiftWrapping}
                  onChange={(e) => setUseGiftWrapping(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-gold-500 accent-gold-500 rounded cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-1 font-bold text-gold-700">
                    <Gift className="w-3.5 h-3.5" />
                    <span>Include Luxury Gift Box Wrapping (+₹50)</span>
                  </div>
                  <p className="text-obsidian-900/60 mt-0.5">Adds a custom box wood-shaving bedding, customized greeting note card, and gold thread ribbon.</p>
                </div>
              </label>

              {/* Stepper controls */}
              <div className="flex gap-3 pt-3">
                <button 
                  onClick={() => setStep(1)}
                  className="px-5 py-3 border border-cream-300 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-cream-200"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button 
                  onClick={handleNextStep}
                  className="flex-1 bg-obsidian-900 text-cream-100 hover:bg-gold-500 hover:text-obsidian-900 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <span>Proceed to Payment Mode</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Options */}
          {step === 3 && (
            <div className="bg-white p-6 rounded-3xl border border-cream-300 space-y-6 shadow-sm animate-fade-in">
              <h3 className="font-serif text-base font-bold flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gold-600" />
                Select Payment Mode
              </h3>

              {/* Wallet Credits Balance Check box */}
              {walletBalance > 0 && (
                <label className="flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    checked={useWalletBalance}
                    onChange={(e) => setUseWalletBalance(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-emerald-600 accent-emerald-600 rounded cursor-pointer"
                  />
                  <div className="flex-1 flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                        <Wallet className="w-4 h-4" />
                        <span>Use Store Credits Wallet Balance</span>
                      </div>
                      <p className="text-obsidian-900/60 mt-0.5">Available: ₹{walletBalance.toLocaleString()}</p>
                    </div>
                    {useWalletBalance && (
                      <span className="font-bold text-emerald-800 text-[11px]">-₹{walletDeduction.toLocaleString()}</span>
                    )}
                  </div>
                </label>
              )}

              {/* Main Pay modes */}
              {finalGrandTotal > 0 && (
                <div className="space-y-4 pt-2">
                  <span className="text-[10px] font-bold text-obsidian-900/50 uppercase tracking-wide block">Remaining Balance: ₹{finalGrandTotal.toLocaleString()}</span>
                  
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-bold text-center">
                    {(['CARD', 'UPI', 'COD'] as const).map(mode => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setPayMode(mode)}
                        className={`py-2 rounded-xl border-2 transition-all ${
                          payMode === mode 
                            ? 'border-gold-500 bg-gold-500/5 text-obsidian-900 font-extrabold' 
                            : 'border-cream-300 bg-white text-obsidian-900/60 hover:border-gold-500'
                        }`}
                      >
                        {mode === 'CARD' ? 'Credit/Debit Card' : mode === 'UPI' ? 'Instant UPI' : 'Cash on Delivery'}
                      </button>
                    ))}
                  </div>

                  {/* Mode Card Form Details */}
                  {payMode === 'CARD' && (
                    <div className="p-4 bg-cream-100/50 rounded-2xl border border-cream-300 space-y-4 animate-fade-in text-xs">
                      
                      {/* Saved cards list */}
                      {savedCards.length > 0 && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider block mb-1">Select Vault Card</label>
                          <select 
                            value={selectedCardId} 
                            onChange={(e) => setSelectedCardId(e.target.value)}
                            className="w-full bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-gold-500 font-bold"
                          >
                            {savedCards.map(c => (
                              <option key={c.id} value={c.id}>{c.cardMasked} ({c.cardHolder})</option>
                            ))}
                            <option value="new">+ Use Different Card</option>
                          </select>
                        </div>
                      )}

                      {/* New Card Details Form */}
                      {selectedCardId === 'new' && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] font-bold uppercase block mb-1">Card Number</label>
                            <input 
                              type="text" 
                              value={cardNumber}
                              onChange={(e) => handleCardNumberChange(e.target.value)}
                              placeholder="4123 4567 8901 2345"
                              className="w-full bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs font-bold tracking-widest focus:outline-none focus:border-gold-500"
                            />
                            {errors.cardNumber && <p className="text-[10px] text-terracotta-500 font-bold mt-0.5">{errors.cardNumber}</p>}
                          </div>

                          <div>
                            <label className="text-[10px] font-bold uppercase block mb-1">Cardholder Name</label>
                            <input 
                              type="text" 
                              value={cardHolder}
                              onChange={(e) => setCardHolder(e.target.value)}
                              placeholder="e.g. ANANYA SHARMA"
                              className="w-full bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs font-bold uppercase focus:outline-none focus:border-gold-500"
                            />
                            {errors.cardHolder && <p className="text-[10px] text-terracotta-500 font-bold mt-0.5">{errors.cardHolder}</p>}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-bold uppercase block mb-1">Expiry Date (MM/YY)</label>
                              <input 
                                type="text" 
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value.replace(/[^\d/]/g, '').slice(0, 5))}
                                placeholder="12/28"
                                className="w-full bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-gold-500"
                              />
                              {errors.cardExpiry && <p className="text-[10px] text-terracotta-500 font-bold mt-0.5">{errors.cardExpiry}</p>}
                            </div>

                            <div>
                              <label className="text-[10px] font-bold uppercase block mb-1">CVV Security Code</label>
                              <input 
                                type="password" 
                                maxLength={3}
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                                placeholder="***"
                                className="w-full bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-gold-500"
                              />
                              {errors.cardCvv && <p className="text-[10px] text-terracotta-500 font-bold mt-0.5">{errors.cardCvv}</p>}
                            </div>
                          </div>

                          <label className="flex items-center gap-2 pt-1.5 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={saveCardChecked}
                              onChange={(e) => setSaveCardChecked(e.target.checked)}
                              className="w-4 h-4 text-gold-500 accent-gold-500 rounded"
                            />
                            <span className="text-[10px] font-semibold text-obsidian-900/60 select-none">Save card securely for future purchases</span>
                          </label>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mode UPI Details */}
                  {payMode === 'UPI' && (
                    <div className="p-4 bg-cream-100/50 rounded-2xl border border-cream-300 space-y-2 animate-fade-in text-xs">
                      <label className="text-[10px] font-bold uppercase block mb-1">UPI VPA Address</label>
                      <input 
                        type="text" 
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value.trim().toLowerCase())}
                        placeholder="e.g. ananya@okaxis"
                        className="w-full bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-gold-500"
                      />
                      {errors.upiId && <p className="text-[10px] text-terracotta-500 font-bold mt-0.5">{errors.upiId}</p>}
                      <p className="text-[9px] text-obsidian-900/50 leading-relaxed font-medium">A payment request notification will be sent to your UPI app (Google Pay, PhonePe, Paytm).</p>
                    </div>
                  )}

                  {/* Mode COD details */}
                  {payMode === 'COD' && (
                    <div className="p-4 bg-cream-100/50 border border-cream-300 rounded-2xl animate-fade-in text-[11px] text-obsidian-900/70 space-y-1">
                      <p>• Cash on Delivery is eligible for this craft pin code.</p>
                      <p>• A verification code SMS will be sent during dispatch to confirm shipment delivery.</p>
                    </div>
                  )}

                </div>
              )}

              {/* Stepper controls */}
              <div className="flex gap-3 pt-3">
                <button 
                  onClick={() => setStep(2)}
                  className="px-5 py-3 border border-cream-300 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-cream-200"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button 
                  onClick={handleNextStep}
                  className="flex-1 bg-obsidian-900 text-cream-100 hover:bg-gold-500 hover:text-obsidian-900 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <span>Review Final Order</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Review and Place Order */}
          {step === 4 && (
            <div className="bg-white p-6 rounded-3xl border border-cream-300 space-y-5 shadow-sm animate-fade-in">
              <h3 className="font-serif text-base font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Final Order Review
              </h3>

              <div className="divide-y divide-cream-200 text-xs">
                {/* Shipping Details summary */}
                <div className="py-3 flex justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-obsidian-900/50 uppercase font-bold tracking-wider">Shipping Address</span>
                    <p className="font-bold">{activeAddressObj.name}</p>
                    <p className="text-obsidian-900/70">{activeAddressObj.street}, {activeAddressObj.city}, {activeAddressObj.state} - {activeAddressObj.pincode}</p>
                  </div>
                  <button type="button" onClick={() => setStep(1)} className="text-gold-700 font-bold hover:underline self-start shrink-0">Change</button>
                </div>

                {/* Delivery upgrade summary */}
                <div className="py-3 flex justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-obsidian-900/50 uppercase font-bold tracking-wider">Delivery Mode</span>
                    <p className="font-bold">{deliveryMethod === 'EXPRESS' ? 'Air Express Shipping' : 'Standard Shipping'}</p>
                    {useGiftWrapping && <p className="text-gold-700 font-semibold">• Luxury Gift Box Wrapping included</p>}
                  </div>
                  <button type="button" onClick={() => setStep(2)} className="text-gold-700 font-bold hover:underline self-start shrink-0">Change</button>
                </div>

                {/* Payment summary */}
                <div className="py-3 flex justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-obsidian-900/50 uppercase font-bold tracking-wider">Selected Payment Method</span>
                    {finalGrandTotal === 0 && useWalletBalance ? (
                      <p className="font-bold text-emerald-700">Paid 100% via Store Credits Wallet</p>
                    ) : (
                      <div className="space-y-0.5">
                        <p className="font-bold">
                          {payMode === 'CARD' ? 'Credit/Debit Card' : payMode === 'UPI' ? `UPI VPA: ${upiId}` : 'Cash on Delivery (COD)'}
                        </p>
                        {useWalletBalance && (
                          <p className="text-emerald-700 font-bold">• Wallet Balance Deducted: -₹{walletDeduction}</p>
                        )}
                      </div>
                    )}
                  </div>
                  <button type="button" onClick={() => setStep(3)} className="text-gold-700 font-bold hover:underline self-start shrink-0">Change</button>
                </div>
              </div>

              {/* Terms checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs select-none">
                  <input 
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4.5 h-4.5 text-gold-500 accent-gold-500 rounded cursor-pointer mt-0.5"
                  />
                  <div>
                    <span className="font-semibold">I agree to the Terms of Service & handcrafted return policy guidelines.</span>
                    <p className="text-[10px] text-obsidian-900/50 mt-0.5">Custom engravings or personalized orders cannot be returned once dispatched unless received in damaged condition.</p>
                  </div>
                </label>
                {errors.terms && <p className="text-xs font-bold text-terracotta-500 mt-1">{errors.terms}</p>}
              </div>

              {/* Stepper controls */}
              <div className="flex gap-3 pt-3">
                <button 
                  onClick={() => setStep(3)}
                  className="px-5 py-3 border border-cream-300 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-cream-200"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <button 
                  onClick={handlePlaceOrderSubmit}
                  disabled={isProcessing}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  {isProcessing ? (
                    <span>Processing HMAC secure handshake...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Place Secure Order (Pay ₹{finalGrandTotal.toLocaleString()})
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Cost summaries & coupon codes */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-cream-200/60 p-6 rounded-3xl border border-cream-300 space-y-4 sticky top-28">
            <h3 className="font-serif text-base font-bold text-obsidian-900 border-b border-cream-300 pb-3 flex items-center justify-between">
              <span>Order Summary Review</span>
              <span className="text-xs text-gold-700 font-bold">{cart.reduce((a, b) => a + b.quantity, 0)} Items</span>
            </h3>

            {/* Savings Callout */}
            {totalSavings > 0 && (
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1 shadow-sm">
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
            <form onSubmit={handleCouponApply} className="space-y-1 pt-2 border-t border-cream-300">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Promo Coupon Code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs uppercase font-medium focus:outline-none focus:border-gold-500"
                />
                <button type="submit" className="bg-obsidian-900 text-cream-100 px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-gold-600 hover:text-obsidian-900 transition-all">
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
              
              {/* Delivery mode additions */}
              {expressFee > 0 && (
                <div className="flex justify-between font-bold text-gold-700">
                  <span>Air Express shipping upgrade</span>
                  <span>+₹150</span>
                </div>
              )}
              {giftWrapFee > 0 && (
                <div className="flex justify-between font-bold text-gold-700">
                  <span>Luxury Gift Box Wrapping</span>
                  <span>+₹50</span>
                </div>
              )}

              {/* Wallet deduction */}
              {useWalletBalance && walletDeduction > 0 && (
                <div className="flex justify-between font-bold text-emerald-700">
                  <span>Store Credits Deduction</span>
                  <span>-₹{walletDeduction.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between font-serif text-base font-bold text-obsidian-900 pt-2 border-t border-cream-300">
                <span>Grand Total</span>
                <span className="text-gold-700">₹{finalGrandTotal.toLocaleString()}</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
export default CheckoutView;

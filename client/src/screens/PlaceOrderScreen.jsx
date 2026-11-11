import { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../context/StoreContext';
import toast from 'react-hot-toast';
import { compressImage } from '../utils/imageCompressor';
import { QRCodeSVG } from 'qrcode.react';

const PlaceOrderScreen = () => {
  const { cartItems, shippingAddress, userInfo, clearCart, setUserInfo } = useContext(StoreContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('PHONEPE');
  const [paymentReceipt, setPaymentReceipt] = useState('');
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Direct P2P UPI State
  const [merchantUpiId, setMerchantUpiId] = useState('eclipsera@upi');
  const [merchantName, setMerchantName] = useState('Eclipsera Premium');
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Fetch dynamic merchant UPI configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await axios.get('/api/orders/payment-config');
        if (data.merchantUpiId) setMerchantUpiId(data.merchantUpiId);
        if (data.merchantName) setMerchantName(data.merchantName);
      } catch (error) {
        console.error('Failed to fetch payment config, using defaults', error);
      }
    };
    fetchConfig();
  }, []);

  // If there's no shipping address saved, bounce them back to the shipping screen
  // If the cart is empty, bounce them back to the cart screen
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    } else if (!shippingAddress.address) {
      navigate('/shipping');
    }
  }, [shippingAddress, cartItems, navigate]);

  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2);

  const placeOrderHandler = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    
    // Direct P2P UPI validation: require either 10-12 digit UTR or receipt screenshot
    if (paymentMethod === 'PHONEPE') {
      const cleanUtr = utrNumber.trim();
      if (!cleanUtr && !paymentReceipt) {
        toast.error('Please enter the 12-digit UTR number or upload your payment screenshot');
        return;
      }
      if (cleanUtr && cleanUtr.length < 10) {
        toast.error('Please enter a valid 10 to 12 digit Bank UTR / Reference number');
        return;
      }
    }

    setLoading(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(userInfo && { Authorization: `Bearer ${userInfo.token}` }),
        },
      };

      const { data } = await axios.post(
        '/api/orders',
        {
          orderItems: cartItems.map(item => ({
            name: item.name,
            quantity: item.qty,
            price: item.price,
            product: item._id,
            image: item.image,
          })),
          shippingAddress,
          totalPrice: Number(totalPrice),
          paymentMethod,
          paymentReceipt,
          utrNumber: utrNumber.trim(),
        },
        config
      );

      // Successfully placed the order in the database!
      clearCart();
      toast.success('Order placed successfully!');
      // Navigate them to the order details page
      navigate(`/order/${data._id}`);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        // Token is expired or invalid
        setUserInfo(null);
        clearCart();
        localStorage.removeItem('userInfo');
        navigate('/login');
      } else {
        toast.error(
          err.response && err.response.data.message
            ? err.response.data.message
            : err.message
        );
        setLoading(false);
      }
    }
  };

  const uploadReceiptHandler = async (e) => {
    const rawFile = e.target.files[0];
    if (!rawFile) return;

    setUploadingReceipt(true);
    setUploadError(null);

    try {
      const file = await compressImage(rawFile, { maxWidth: 1200, maxHeight: 1200, quality: 0.8 });
      const formData = new FormData();
      formData.append('image', file);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.post('/api/upload', formData, config);
      setPaymentReceipt(data);
      setUploadingReceipt(false);
      toast.success('Receipt uploaded successfully!');
    } catch (err) {
      setUploadError(err.response?.data?.message || err.message);
      setUploadingReceipt(false);
    }
  };

  return (
    <div className="py-12 pb-40 md:pb-32 animate-fade-in max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Order Details */}
        <div className="lg:w-2/3 space-y-8">
          <div className="bg-surface p-8 rounded-3xl shadow-sm border border-accent-gold/20">
            <h2 className="text-2xl font-serif font-extrabold text-text-primary mb-4 border-b border-accent-gold/20 pb-4">Shipping Destination</h2>
            <div className="text-text-secondary leading-relaxed">
              <p className="font-medium text-text-primary mb-1">
                {shippingAddress.name}
              </p>
              <p className="mb-1 text-sm text-text-secondary/70">
                {shippingAddress.email}
              </p>
              <p className="text-sm">
                {shippingAddress.address}, {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}, {shippingAddress.country}
              </p>
              {shippingAddress.phone && (
                <p className="text-sm mt-1 text-text-secondary/80">Phone: {shippingAddress.phone}</p>
              )}
            </div>
          </div>

          <div className="bg-surface p-8 rounded-3xl shadow-sm border border-accent-gold/20">
            <h2 className="text-2xl font-serif font-extrabold text-text-primary mb-4 border-b border-accent-gold/20 pb-4">Order Items</h2>
            {cartItems.length === 0 ? (
              <p className="text-gray-500 italic">Your cart is empty</p>
            ) : (
              <ul className="divide-y divide-walnut/10">
                {cartItems.map((item, index) => (
                  <li key={index} className="py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    <img 
                      src={item.image || 'https://placehold.co/150x150?text=No+Image'} 
                      alt={item.name} 
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x150?text=No+Image'; }}
                      className="w-20 h-20 rounded-xl object-cover border border-accent-gold/20 shadow-sm" 
                    />
                    <Link to={`/product/${item._id}`} className="flex-1 text-lg font-serif font-bold text-text-primary hover:text-accent-gold transition-colors line-clamp-2 break-words">
                      {item.name}
                    </Link>
                    <div className="font-semibold text-text-primary/70 text-lg whitespace-nowrap">
                      {item.qty} x ₹{item.price.toFixed(2)} = <span className="text-text-primary ml-1">₹{(item.qty * item.price).toFixed(2)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Side: Order Summary & Checkout Button */}
        <div className="lg:w-1/3">
          <div className="bg-transparent rounded-3xl p-8 border border-accent-gold/20 shadow-sm sticky top-8">
            <h2 className="text-2xl font-serif font-extrabold text-text-primary mb-6 border-b border-accent-gold/20 pb-4">Final Summary</h2>
            
            <div className="space-y-4 text-lg text-text-primary/70 mb-8">
              <div className="flex justify-between items-center">
                <span>Items ({totalItems}):</span>
                <span className="font-bold text-text-primary">₹{totalPrice}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Shipping:</span>
                <span className="font-bold text-text-primary">₹0.00</span>
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-accent-gold/20 text-2xl font-extrabold text-text-primary mt-6">
                <span>Total:</span>
                <span className="text-accent-gold">₹{totalPrice}</span>
              </div>
            </div>

            <div className="mb-8 bg-bg-base p-6 rounded-xl border border-accent-gold/20">
              <h3 className="text-xl font-bold text-text-primary mb-4 border-b border-accent-gold/20 pb-2">Payment Method</h3>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer min-h-12 p-3 rounded-lg border border-transparent hover:border-accent-gold/20 transition-all">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="PHONEPE" 
                    checked={paymentMethod === 'PHONEPE'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-accent-gold focus:ring-accent-gold bg-surface border-accent-gold/40"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-text-primary text-base font-bold">Direct UPI / QR Transfer</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-accent-gold/15 text-accent-gold border border-accent-gold/30">
                        0% Gateway Fee
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">Google Pay, PhonePe, Paytm, BHIM or any UPI App</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer min-h-12 p-3 rounded-lg border border-transparent hover:border-accent-gold/20 transition-all">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="COD" 
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-accent-gold focus:ring-accent-gold bg-surface border-accent-gold/40"
                  />
                  <div className="flex-1">
                    <span className="text-text-primary text-base font-medium">Cash on Delivery (COD)</span>
                    <p className="text-xs text-text-secondary mt-0.5">Pay upon package arrival</p>
                  </div>
                </label>
              </div>
            </div>

            {paymentMethod === 'PHONEPE' && (() => {
              const upiUrl = `upi://pay?pa=${encodeURIComponent(merchantUpiId)}&pn=${encodeURIComponent(merchantName)}&am=${totalPrice}&cu=INR&tn=${encodeURIComponent('Eclipsera Order')}`;
              
              return (
                <div className="mb-8 bg-surface p-6 rounded-2xl border border-accent-gold/30 shadow-lg animate-fade-in">
                  <div className="flex items-center justify-between mb-4 border-b border-accent-gold/20 pb-3">
                    <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                      <span>📲</span> Direct UPI Payment
                    </h3>
                    <span className="text-xs font-mono font-bold px-2 py-1 bg-accent-gold/15 text-accent-gold rounded-md border border-accent-gold/20">
                      ₹{totalPrice}
                    </span>
                  </div>

                  {/* 1-Click Mobile Intent Button */}
                  <a
                    href={upiUrl}
                    className="w-full sm:hidden flex items-center justify-center gap-2 py-3.5 px-4 bg-accent-gold hover:bg-accent-gold-hover text-bg-base font-bold rounded-xl shadow-md transition-all active:scale-[0.98] mb-5 text-center text-sm uppercase tracking-wider"
                  >
                    <span>⚡ Pay with Installed UPI App</span>
                  </a>

                  {/* Dynamic SVG QR Code with Prefilled Amount */}
                  <div className="flex flex-col items-center justify-center p-4 bg-bg-base/70 rounded-xl border border-accent-gold/20 mb-5">
                    <div className="p-3 bg-white rounded-xl shadow-md">
                      <QRCodeSVG
                        value={upiUrl}
                        size={170}
                        level="M"
                        includeMargin={false}
                      />
                    </div>
                    <p className="text-xs text-text-secondary mt-3 text-center">
                      Scan with Google Pay, PhonePe or Paytm<br />
                      Amount <strong className="text-accent-gold font-bold">₹{totalPrice}</strong> prefilled automatically
                    </p>
                  </div>

                  {/* Official Merchant UPI ID & Copy Action */}
                  <div className="flex items-center justify-between p-3.5 bg-bg-base rounded-xl border border-accent-gold/20 mb-5">
                    <div>
                      <p className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">Official Merchant UPI</p>
                      <p className="font-mono text-sm text-text-primary font-bold">{merchantUpiId}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(merchantUpiId);
                        setCopiedUpi(true);
                        toast.success('UPI ID copied!');
                        setTimeout(() => setCopiedUpi(false), 2000);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-surface border border-accent-gold/30 text-accent-gold text-xs font-bold hover:bg-accent-gold hover:text-bg-base transition-colors"
                    >
                      {copiedUpi ? '✓ Copied' : 'Copy UPI'}
                    </button>
                  </div>

                  {/* 12-Digit UTR Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-text-primary mb-1">
                      12-Digit Bank UTR / Reference No. <span className="text-accent-gold">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      placeholder="e.g. 412356789012"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-bg-base border border-accent-gold/40 rounded-xl px-4 py-3 text-text-primary font-mono tracking-wider focus:outline-none focus:border-accent-gold text-sm transition-colors"
                    />
                    <p className="text-[11px] text-text-secondary mt-1">
                      Enter the 12-digit transaction ID / UTR shown on your payment confirmation screen.
                    </p>
                  </div>

                  {/* Optional Screenshot Upload */}
                  <div className="pt-3 border-t border-accent-gold/15">
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                      Upload Screenshot (Optional if UTR provided)
                    </label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={uploadReceiptHandler}
                      className="w-full text-xs text-text-primary/70 file:mr-3 file:py-2 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-accent-gold/10 file:text-accent-gold hover:file:bg-accent-gold/20"
                    />
                    {uploadingReceipt && <p className="text-accent-gold text-xs mt-1.5 font-medium animate-pulse">Compressing & Uploading...</p>}
                    {uploadError && <p className="text-red-500 text-xs mt-1.5">{uploadError}</p>}
                    {paymentReceipt && <p className="text-green-500 text-xs mt-1.5 font-medium">✓ Screenshot uploaded</p>}
                  </div>
                </div>
              );
            })()}

            {/* Trust Badges */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6 p-4 bg-surface/50 rounded-xl border border-accent-gold/10 text-text-secondary">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <span className="text-xs font-medium uppercase tracking-wider text-center">100% Secure SSL</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                <span className="text-xs font-medium uppercase tracking-wider text-center">Authenticity Guaranteed</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Sticky Bottom Call to Action */}
      <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] md:bottom-0 left-0 right-0 p-4 bg-surface/95 backdrop-blur-xl border-t border-accent-gold/20 z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.15)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="text-sm text-text-secondary">Total Amount</p>
            <p className="text-xl font-bold text-accent-gold">₹{totalPrice}</p>
          </div>
          <button
            onClick={placeOrderHandler}
            disabled={cartItems.length === 0 || loading || (paymentMethod === 'PHONEPE' && !utrNumber.trim() && !paymentReceipt)}
            className="flex-1 sm:flex-none sm:w-64 bg-accent-gold hover:bg-accent-gold-hover text-bg-base font-extrabold py-4 min-h-[56px] rounded-xl shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg uppercase tracking-wide"
          >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrderScreen;

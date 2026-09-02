import { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../context/StoreContext';
import toast from 'react-hot-toast';

const PlaceOrderScreen = () => {
  const { cartItems, shippingAddress, userInfo, clearCart, setUserInfo } = useContext(StoreContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('PHONEPE');
  const [paymentReceipt, setPaymentReceipt] = useState('');
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Fetch QR code for the first item in the cart if PHONEPE is selected
  useEffect(() => {
    const fetchQr = async () => {
      if (cartItems.length > 0 && paymentMethod === 'PHONEPE') {
        try {
          const { data } = await axios.get(`/api/products/${cartItems[0]._id}`);
          if (data.paymentQRCode) {
            setQrCodeUrl(data.paymentQRCode);
          }
        } catch (error) {
          console.error('Failed to fetch QR code', error);
        }
      }
    };
    fetchQr();
  }, [cartItems, paymentMethod]);

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
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setUploadingReceipt(true);
    setUploadError(null);

    try {
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
                <label className="flex items-center gap-3 cursor-pointer min-h-12">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="COD" 
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-accent-gold focus:ring-accent-gold bg-surface border-accent-gold/40"
                  />
                  <span className="text-text-primary text-lg font-medium">Cash on Delivery (COD)</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer min-h-12">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="PHONEPE" 
                    checked={paymentMethod === 'PHONEPE'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-accent-gold focus:ring-accent-gold bg-surface border-accent-gold/40"
                  />
                  <span className="text-text-primary text-lg font-medium">PhonePe (Scan & Pay)</span>
                </label>
              </div>
            </div>

            {paymentMethod === 'PHONEPE' && (
              <div className="mb-8 bg-surface p-6 rounded-xl border border-accent-gold/20">
                <h3 className="text-lg font-bold text-text-primary mb-4">Complete Payment</h3>
                <p className="text-text-primary/70 mb-4 text-sm">Please pay ₹{totalPrice} to our official PhonePe account and upload the screenshot below.</p>
                
                {/* Display dynamic Cloudinary QR code, fallback to placeholder */}
                <img src={qrCodeUrl || "/images/qr-placeholder.png"} alt="Scan to Pay" className="w-48 h-48 mx-auto mb-4 object-contain border border-accent-gold/20 p-2 rounded-lg" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x200?text=Scan+QR'; }} />
                
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-text-primary mb-2">Upload Payment Receipt / Screenshot *</label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={uploadReceiptHandler}
                    className="w-full text-sm text-text-primary/70 min-h-12 file:mr-4 file:py-3 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-gold/10 file:text-accent-gold hover:file:bg-accent-gold/20"
                  />
                  {uploadingReceipt && <p className="text-accent-gold text-sm mt-2 font-medium animate-pulse">Uploading...</p>}
                  {uploadError && <p className="text-red-500 text-sm mt-2">{uploadError}</p>}
                  {paymentReceipt && <p className="text-green-500 text-sm mt-2 font-medium">✓ Receipt uploaded</p>}
                </div>
              </div>
            )}

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
      <div className="fixed bottom-[64px] md:bottom-0 left-0 right-0 p-4 bg-surface/95 backdrop-blur-xl border-t border-accent-gold/20 z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.15)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="text-sm text-text-secondary">Total Amount</p>
            <p className="text-xl font-bold text-accent-gold">₹{totalPrice}</p>
          </div>
          <button
            onClick={placeOrderHandler}
            disabled={cartItems.length === 0 || loading || (paymentMethod === 'PHONEPE' && !paymentReceipt)}
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

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
    <div className="py-12 animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Order Details */}
        <div className="lg:w-2/3 space-y-8">
          <div className="bg-surface p-8 rounded-3xl shadow-sm border border-accent-gold/20">
            <h2 className="text-2xl font-serif font-extrabold text-text-primary mb-4 border-b border-accent-gold/20 pb-4">Shipping Destination</h2>
            <p className="text-text-primary/70 text-lg mb-2">
              <span className="font-semibold text-text-primary mr-2">Name: </span>
              {shippingAddress.name}
            </p>
            <p className="text-text-primary/70 text-lg mb-2">
              <span className="font-semibold text-text-primary mr-2">Email: </span>
              {shippingAddress.email}
            </p>
            <p className="text-text-primary/70 text-lg">
              <span className="font-semibold text-text-primary mr-2">Address: </span>
              {shippingAddress.address}, {shippingAddress.city} {shippingAddress.postalCode}, {shippingAddress.country}
            </p>
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
                <label className="flex items-center gap-3 cursor-pointer">
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
                
                <label className="flex items-center gap-3 cursor-pointer">
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
                    className="w-full text-sm text-text-primary/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-gold/10 file:text-accent-gold hover:file:bg-accent-gold/20"
                  />
                  {uploadingReceipt && <p className="text-accent-gold text-sm mt-2 font-medium animate-pulse">Uploading...</p>}
                  {uploadError && <p className="text-red-500 text-sm mt-2">{uploadError}</p>}
                  {paymentReceipt && <p className="text-green-500 text-sm mt-2 font-medium">✓ Receipt uploaded</p>}
                </div>
              </div>
            )}


            <button
              onClick={placeOrderHandler}
              disabled={cartItems.length === 0 || loading || (paymentMethod === 'PHONEPE' && !paymentReceipt)}
              className="w-full bg-accent-gold hover:bg-accent-gold-hover text-white font-bold py-4 rounded-xl shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
            >
              {loading ? 'Processing...' : 'Confirm & Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrderScreen;

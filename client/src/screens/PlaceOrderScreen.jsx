import { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../context/StoreContext';
import toast from 'react-hot-toast';

const PlaceOrderScreen = () => {
  const { cartItems, shippingAddress, userInfo, clearCart, setUserInfo } = useContext(StoreContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

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
                  <li key={index} className="py-4 flex items-center gap-6">
                    <img 
                      src={item.image || 'https://placehold.co/150x150?text=No+Image'} 
                      alt={item.name} 
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x150?text=No+Image'; }}
                      className="w-20 h-20 rounded-xl object-cover border border-accent-gold/20 shadow-sm" 
                    />
                    <Link to={`/product/${item._id}`} className="flex-1 text-lg font-serif font-bold text-text-primary hover:text-accent-gold transition-colors">
                      {item.name}
                    </Link>
                    <div className="font-semibold text-text-primary/70 text-lg">
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



            <button
              onClick={placeOrderHandler}
              disabled={cartItems.length === 0 || loading}
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

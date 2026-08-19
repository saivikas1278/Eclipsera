import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../context/StoreContext';
import toast from 'react-hot-toast';

const OrderScreen = () => {
  const { id: orderId } = useParams();
  const { userInfo, updateSession } = useContext(StoreContext);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [deliverLoading, setDeliverLoading] = useState(false);

  const [registerPassword, setRegisterPassword] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const config = {
          headers: {
            ...(userInfo && { Authorization: `Bearer ${userInfo.token}` }),
          },
        };
        const { data } = await orderId ? axios.get(`/api/orders/${orderId}`, config) : { data: null };
        setOrder(data);
        setLoading(false);
      } catch (err) {
        setError(
          err.response && err.response.data.message
            ? err.response.data.message
            : err.message
        );
        setLoading(false);
      }
    };

    if (!order || order._id !== orderId) {
      fetchOrder();
    }
  }, [order, orderId, userInfo]);

  const shadowRegisterHandler = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    try {
      const { data } = await axios.post('/api/users', {
        name: order.shippingAddress.name,
        email: order.shippingAddress.email,
        password: registerPassword
      });
      updateSession(data);
      toast.success('Account created successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setRegisterLoading(false);
    }
  };

  const deliverHandler = async () => {
    setDeliverLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.put(`/api/orders/${orderId}/deliver`, {}, config);
      
      // Reload order
      const { data: updatedOrder } = await axios.get(`/api/orders/${orderId}`, config);
      setOrder(updatedOrder);
    } catch (err) {
      alert(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    } finally {
      setDeliverLoading(false);
    }
  };

  const downloadInvoiceHandler = async () => {
    try {
      const config = {
        headers: {
          ...(userInfo && { Authorization: `Bearer ${userInfo.token}` }),
        },
        responseType: 'blob',
      };
      const { data } = await axios.get(`/api/orders/${orderId}/invoice`, config);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-EP-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      toast.error('Failed to download invoice');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <svg className="animate-spin h-10 w-10 text-accent-gold" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-accent-gold/10 text-accent-gold p-4 rounded-lg text-center mt-10 max-w-2xl mx-auto border border-accent-gold/20">
        {error}
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="py-12 animate-fade-in max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-serif font-extrabold text-text-primary mb-8">Order <span className="text-text-primary/60 font-sans text-xl">#{order._id}</span></h1>
      
      {order.isCancelled && (
        <div className="mb-8 bg-red-900/20 border border-red-800/50 p-6 rounded-2xl flex items-start gap-4 animate-fade-in shadow-sm">
          <svg className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <div className="w-full">
            <h3 className="text-xl font-bold text-red-500 mb-2">Order Declined</h3>
            <p className="text-red-400 text-lg mb-4">Reason: {order.cancelReason}</p>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 bg-surface hover:bg-surface-hover border border-accent-gold/50 text-accent-gold font-bold py-2 px-4 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              Place a new order with the correct details
            </Link>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side */}
        <div className="lg:w-2/3 space-y-8">
          <div className="bg-surface p-8 rounded-3xl shadow-sm border border-accent-gold/20">
            <h2 className="text-2xl font-serif font-extrabold text-text-primary mb-4 border-b border-accent-gold/20 pb-4">Shipping Destination</h2>
            <p className="text-text-primary/70 text-lg mb-4">
              <span className="font-semibold text-text-primary mr-2">Name: </span>
              {order.user?.name || order.shippingAddress?.name || 'Guest'}
            </p>
            <p className="text-text-primary/70 text-lg mb-4">
              <span className="font-semibold text-text-primary mr-2">Email: </span>
              <a href={`mailto:${order.user?.email || order.shippingAddress?.email}`} className="text-accent-gold hover:underline">{order.user?.email || order.shippingAddress?.email}</a>
            </p>
            <p className="text-text-primary/70 text-lg mb-2">
              <span className="font-semibold text-text-primary mr-2">Address: </span>
              {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}, {order.shippingAddress.country}
            </p>
            {order.shippingAddress.phone && (
              <p className="text-text-primary/70 text-lg mb-4">
                <span className="font-semibold text-text-primary mr-2">Phone: </span>
                {order.shippingAddress.phone}
              </p>
            )}
            
            {order.isDelivered ? (
              <div className="bg-green-900/30 text-green-400 p-4 rounded-xl border border-green-800/50 font-medium">
                Delivered on {new Date(order.deliveredAt).toLocaleString()}
              </div>
            ) : (
              <div className="bg-accent-gold/10 text-accent-gold p-4 rounded-xl border border-accent-gold/20 font-medium">
                Not Delivered
              </div>
            )}
          </div>

          <div className="bg-surface p-8 rounded-3xl shadow-sm border border-accent-gold/20">
            <h2 className="text-2xl font-serif font-extrabold text-text-primary mb-4 border-b border-accent-gold/20 pb-4">Payment Method</h2>
            <p className="text-text-primary/70 text-lg mb-4">
              <span className="font-semibold text-text-primary mr-2">Method: </span>
              {order.paymentMethod === 'PHONEPE' ? 'PhonePe (Manual Verification)' : 'Cash on Delivery (COD)'}
            </p>
            {order.isPaid ? (
              <div className="bg-green-900/30 text-green-400 p-4 rounded-xl border border-green-800/50 font-medium">
                Paid on {new Date(order.paidAt).toLocaleString()}
              </div>
            ) : (
              <div className="bg-accent-gold/10 text-accent-gold p-4 rounded-xl border border-accent-gold/20 font-medium">
                Not Paid
              </div>
            )}
          </div>

          <div className="bg-surface p-8 rounded-3xl shadow-sm border border-accent-gold/20">
            <h2 className="text-2xl font-serif font-extrabold text-text-primary mb-4 border-b border-accent-gold/20 pb-4">Order Items</h2>
            {order.orderItems.length === 0 ? (
              <p className="text-text-primary/60 italic">Order is empty</p>
            ) : (
              <ul className="divide-y divide-walnut/10">
                {order.orderItems.map((item, index) => (
                  <li key={index} className="py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    <img 
                      src={item.image || (item.product && item.product.image) || 'https://placehold.co/150x150?text=No+Image'} 
                      alt={item.name} 
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x150?text=No+Image'; }}
                      className="w-16 h-16 rounded-xl object-cover border border-accent-gold/20 shadow-sm" 
                    />
                    <Link to={`/product/${item.product}`} className="flex-1 text-lg font-serif font-bold text-text-primary hover:text-accent-gold transition-colors line-clamp-2 break-words">
                      {item.name}
                    </Link>
                    <div className="font-semibold text-text-primary/70 text-lg whitespace-nowrap">
                      {item.quantity} x ₹{item.price.toFixed(2)} = <span className="text-text-primary ml-1">₹{(item.quantity * item.price).toFixed(2)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className="lg:w-1/3">
          <div className="bg-transparent rounded-3xl p-8 border border-accent-gold/20 shadow-sm sticky top-8">
            <h2 className="text-2xl font-serif font-extrabold text-text-primary mb-6 border-b border-accent-gold/20 pb-4">Order Summary</h2>
            
            <div className="space-y-4 text-lg text-text-primary/70 mb-8">
              <div className="flex justify-between items-center">
                <span>Items:</span>
                <span className="font-bold text-text-primary">₹{order.totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Shipping:</span>
                <span className="font-bold text-text-primary">₹0.00</span>
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-accent-gold/20 text-2xl font-extrabold text-text-primary mt-6">
                <span>Total:</span>
                <span className="text-accent-gold">₹{order.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={downloadInvoiceHandler}
              className="w-full bg-surface hover:bg-surface/90 text-text-primary font-bold py-4 min-h-12 rounded-xl shadow-sm border border-accent-gold/20 transition-all hover:shadow-md flex items-center justify-center gap-2 mb-4"
            >
              <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Download Invoice (PDF)
            </button>

            {!order.isPaid && order.paymentMethod === 'PHONEPE' && !order.isVerifiedByAdmin && !order.isCancelled && (
              <div className="mt-4 bg-accent-gold/10 p-4 rounded-xl border border-accent-gold/20 text-center">
                <p className="text-accent-gold font-medium">Payment verification pending. Our admin will verify your screenshot soon.</p>
              </div>
            )}
            
            {!order.isPaid && order.paymentMethod === 'COD' && (
              <div className="mt-4 bg-surface p-4 rounded-xl border border-accent-gold/20 text-center">
                <p className="text-text-primary/70 font-medium">Please pay cash upon delivery.</p>
              </div>
            )}

            {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
              <div className="mt-4">
                <button
                  type="button"
                  className="w-full bg-surface hover:bg-surface/90 text-white font-bold py-4 min-h-12 rounded-xl shadow-md transition-all hover:shadow-lg disabled:opacity-50"
                  onClick={deliverHandler}
                  disabled={deliverLoading}
                >
                  {deliverLoading ? 'Processing...' : 'Mark As Delivered'}
                </button>
              </div>
            )}

            {!userInfo && !order.user && (
              <div className="mt-8 bg-accent-gold/5 rounded-2xl p-6 border border-accent-gold/20">
                <h3 className="text-xl font-serif font-bold text-text-primary mb-2">Want to track your order easily?</h3>
                <p className="text-sm text-text-primary/70 mb-4">Set a password to create an account using your email <strong>{order.shippingAddress.email}</strong>.</p>
                <form onSubmit={shadowRegisterHandler} className="space-y-4">
                  <input
                    type="password"
                    placeholder="Create a password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 min-h-12 rounded-xl bg-surface border border-accent-gold/20 focus:ring-2 focus:ring-accent-gold outline-none transition-all duration-300"
                  />
                  <button
                    type="submit"
                    disabled={registerLoading}
                    className="w-full bg-surface hover:bg-surface/90 text-text-primary font-bold py-3 min-h-12 rounded-xl shadow-sm border border-accent-gold/20 transition-all hover:shadow-md disabled:opacity-50"
                  >
                    {registerLoading ? 'Creating...' : 'Create Account'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderScreen;

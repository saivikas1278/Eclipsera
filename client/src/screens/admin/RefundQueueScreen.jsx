import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const RefundQueueScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const { userInfo, handleLogout } = useContext(StoreContext);
  const navigate = useNavigate();

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      // Fetch only REFUND_PENDING orders
      const { data } = await axios.get(`/api/orders?limit=250&financialStatus=REFUND_PENDING`, config);
      setOrders(data.data || data);
      setLoading(false);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        handleLogout();
        navigate('/login');
      } else {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      fetchRefunds();
    } else {
      navigate('/login');
    }
  }, [userInfo, navigate]);

  const markRefunded = async (orderId) => {
    if (window.confirm('Confirm that this user has been manually refunded? This action cannot be undone.')) {
      try {
        setActionLoading(true);
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.put(`/api/orders/${orderId}/refund`, {}, config);
        
        setToastMessage(`Order ${orderId} marked as REFUNDED`);
        setTimeout(() => setToastMessage(null), 3000);
        fetchRefunds();
      } catch (err) {
        alert(err.response?.data?.message || err.message);
      } finally {
        setActionLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-xl font-medium text-accent-gold/80 animate-pulse">
        Fetching refund queue...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 text-red-500 p-4 rounded-lg text-center mt-10 border border-red-500/20">
        {error}
      </div>
    );
  }

  return (
    <div className="py-8 animate-fade-in relative px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[60] bg-accent-gold text-bg-base font-bold px-6 py-3 rounded-lg shadow-xl animate-fade-in">
          {toastMessage}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-serif font-extrabold text-text-primary tracking-tight mb-2">Refunds Queue</h1>
          <p className="text-text-secondary">Orders that have been paid but cancelled. Awaiting manual refund.</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg font-bold">
          {orders.length} Pending Refunds
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-surface border border-accent-gold/20 rounded-xl p-12 text-center text-text-primary">
          <svg className="w-16 h-16 mx-auto text-accent-gold/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-serif font-bold mb-2">All clear!</h2>
          <p className="text-text-secondary">There are no pending refunds in the queue.</p>
        </div>
      ) : (
        <div className="bg-surface rounded-3xl shadow-sm border border-accent-gold/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="hidden md:table-header-group">
                <tr className="bg-transparent border-b border-accent-gold/20">
                  <th className="p-4 text-xs uppercase tracking-widest font-bold text-text-secondary">Order Summary / Date</th>
                  <th className="p-4 text-xs uppercase tracking-widest font-bold text-text-secondary">Customer</th>
                  <th className="p-4 text-xs uppercase tracking-widest font-bold text-text-secondary">Refund Amount</th>
                  <th className="p-4 text-xs uppercase tracking-widest font-bold text-text-secondary">Cancel Reason</th>
                  <th className="p-4 text-xs uppercase tracking-widest font-bold text-text-secondary text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-accent-gold/10">
                {orders.map((order) => (
                  <tr key={order._id} className="grid grid-cols-2 md:table-row gap-y-1 p-3 mb-3 border border-accent-gold/20 md:border-none rounded-xl md:rounded-none bg-surface md:bg-transparent shadow-sm md:shadow-none md:p-0 relative hover:bg-bg-base/50 transition-colors">
                    
                    {/* Order ID / Date */}
                    <td className="col-start-1 col-span-2 row-start-1 flex justify-between items-center md:table-cell p-0 md:p-4 align-top md:border-b md:border-accent-gold/10">
                      <div className="flex justify-between items-center w-full md:block">
                        <div className="font-black text-sm text-text-primary truncate pr-4">{order.orderItems?.map(i => i.name).join(', ') || 'Custom Order'}</div>
                        <div className="text-xs font-bold text-text-secondary md:mt-1">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </div>
                    </td>
                    
                    {/* Customer */}
                    <td className="col-start-1 col-span-2 row-start-2 block md:table-cell p-0 md:p-4 align-top md:border-b md:border-accent-gold/10">
                      <div className="text-left flex items-center justify-between md:block">
                        <div className="text-sm font-bold text-text-primary mb-0.5">{order.user?.name || order.shippingAddress?.name || 'Guest'}</div>
                        <div className="text-xs text-text-secondary truncate max-w-[150px] md:max-w-none">{order.user?.email || order.shippingAddress?.email}</div>
                      </div>
                    </td>
                    
                    {/* Refund Amount (DOM Order: ID, Customer, Amount, Reason, Action) */}
                    <td className="col-start-1 col-span-1 row-start-4 flex items-end md:table-cell p-0 md:p-4 align-top md:border-b md:border-accent-gold/10">
                      <div className="text-lg font-black text-red-400">₹{order.totalPrice.toFixed(2)}</div>
                    </td>
                    
                    {/* Reason */}
                    <td className="col-start-1 col-span-2 row-start-3 block md:table-cell p-0 md:p-4 align-top md:border-b md:border-accent-gold/10">
                      <div className="bg-red-900/10 p-2 rounded md:bg-transparent md:p-0">
                        <div className="text-xs font-medium text-text-primary/90 md:line-clamp-2" title={order.cancelReason}>
                          <span className="text-red-400 font-bold md:hidden mr-1">Reason:</span>
                          {order.cancelReason || 'Cancelled'}
                        </div>
                      </div>
                    </td>
                    
                    {/* Actions */}
                    <td className="col-start-2 col-span-1 row-start-4 flex justify-end items-end md:table-cell p-0 md:p-4 align-top text-right md:border-b md:border-accent-gold/10">
                      <button
                        onClick={() => markRefunded(order._id)}
                        disabled={actionLoading}
                        className="bg-accent-gold hover:bg-accent-gold-hover text-bg-base font-black py-1.5 px-3 md:py-2 md:px-4 rounded-md transition-all text-xs md:text-sm shadow-sm disabled:opacity-50 whitespace-nowrap"
                      >
                        Process Refund
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundQueueScreen;

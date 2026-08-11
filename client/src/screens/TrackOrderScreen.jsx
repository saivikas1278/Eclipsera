import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import ProfileSidebar from '../components/ProfileSidebar';

const TrackOrderScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const navigate = useNavigate();
  const { userInfo, handleLogout } = useContext(StoreContext);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const { data } = await axios.get('/api/orders/mine', config);
        // Sort descending by date
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(data);
        setLoading(false);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          handleLogout();
          navigate('/login');
        } else {
          setError(
            err.response && err.response.data.message
              ? err.response.data.message
              : err.message
          );
          setLoading(false);
        }
      }
    };

    fetchOrders();
  }, [userInfo, navigate, handleLogout]);

  const openModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setCopySuccess(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const getStatusStage = (status) => {
    switch (status) {
      case 'PENDING': return 1;
      case 'PROCESSING': return 2;
      case 'SHIPPED': return 3;
      case 'DELIVERED': return 4;
      default: return 1;
    }
  };

  return (
    <div className="min-h-screen bg-bg-base py-8 px-4 sm:px-6 lg:px-8 font-sans animate-fade-in relative">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
        
        {/* Left Sidebar */}
        <ProfileSidebar />

        {/* Main Content Area */}
        <div className="flex-1">
          <div className="bg-surface rounded-xl shadow-md border border-accent-gold/10 p-6 md:p-8">
            <Link to="/account" className="md:hidden flex items-center gap-2 text-accent-gold font-semibold mb-6 hover:text-accent-gold-hover transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              Back to Profile
            </Link>
            <h1 className="text-2xl font-bold text-text-primary mb-6 border-b border-accent-gold/10 pb-4">Track My Orders</h1>

            {loading ? (
              <div className="flex justify-center items-center h-40 text-accent-gold animate-pulse font-medium">
                Loading tracking data...
              </div>
            ) : error ? (
              <div className="bg-red-900/30 text-red-400 p-4 rounded-lg">{error}</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-text-secondary mb-4">You have no active or past orders to track.</p>
                <Link to="/" className="inline-block bg-accent-gold hover:bg-accent-gold-hover text-bg-base font-bold py-3 px-8 rounded transition-colors shadow-md">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order._id} className="bg-bg-base border border-accent-gold/20 rounded-xl overflow-hidden shadow-sm hover:border-accent-gold/50 transition-colors">
                    
                    {/* Header */}
                    <div className="bg-surface/50 border-b border-accent-gold/10 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <p className="text-sm text-text-secondary font-medium">Order Placed</p>
                        <p className="text-text-primary font-bold">{order.createdAt.substring(0, 10)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-text-secondary font-medium">Total</p>
                        <p className="text-accent-gold font-bold">₹{order.totalPrice.toFixed(2)}</p>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-sm text-text-secondary font-medium mb-1">Order #{order._id}</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.fulfillmentStatus === 'DELIVERED' ? 'bg-green-900/50 text-green-400' :
                          order.fulfillmentStatus === 'SHIPPED' ? 'bg-blue-900/50 text-blue-400' :
                          order.fulfillmentStatus === 'CANCELLED' ? 'bg-red-900/50 text-red-400' :
                          'bg-accent-gold/20 text-accent-gold'
                        }`}>
                          {order.fulfillmentStatus || 'PENDING'}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4 sm:p-6 flex flex-col lg:flex-row justify-between gap-6">
                      
                      <div className="flex-1">
                        <div className="flex -space-x-4 mb-4">
                          {order.orderItems.map((item, idx) => (
                            <img 
                              key={idx}
                              src={item.image || (item.product && item.product.image) || 'https://placehold.co/150x150?text=No+Image'} 
                              alt={item.name} 
                              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x150?text=No+Image'; }}
                              className="w-16 h-16 rounded-full border-2 border-surface object-cover shadow-sm"
                            />
                          ))}
                        </div>
                        <p className="text-text-primary font-medium">
                          {order.orderItems[0].name} {order.orderItems.length > 1 && <span className="text-text-secondary text-sm"> + {order.orderItems.length - 1} more items</span>}
                        </p>
                      </div>

                      <div className="flex items-center justify-start lg:justify-end">
                        <button 
                          onClick={() => openModal(order)}
                          className="bg-transparent border border-accent-gold hover:bg-accent-gold/10 text-accent-gold font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm whitespace-nowrap w-full lg:w-auto text-center"
                        >
                          View Tracking Updates
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tracking Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface border border-accent-gold/20 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col relative">
            
            <div className="bg-surface/95 backdrop-blur z-10 px-6 py-5 border-b border-accent-gold/20 flex justify-between items-center sticky top-0">
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <svg className="w-6 h-6 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                Shipment Tracker
              </h2>
              <button onClick={closeModal} className="text-text-secondary hover:text-accent-gold text-2xl font-bold transition-colors">&times;</button>
            </div>

            <div className="p-6 md:p-8 max-h-[80vh] overflow-y-auto">
              
              {/* Order Info */}
              <div className="flex flex-col md:flex-row justify-between mb-8 gap-4 bg-bg-base p-4 rounded-xl border border-accent-gold/10">
                <div>
                  <p className="text-sm text-text-secondary font-medium">Order Number</p>
                  <p className="text-lg font-bold text-text-primary">#{selectedOrder._id}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary font-medium">Expected Arrival</p>
                  <p className="text-lg font-bold text-accent-gold">
                    {selectedOrder.isDelivered ? `Delivered on ${selectedOrder.deliveredAt.substring(0, 10)}` : 'Arriving Soon'}
                  </p>
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="mb-12 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-accent-gold/20 -translate-y-1/2 rounded-full hidden sm:block"></div>
                
                {/* Dynamically fill the progress bar */}
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-accent-gold -translate-y-1/2 rounded-full transition-all duration-1000 hidden sm:block"
                  style={{ width: `${(getStatusStage(selectedOrder.fulfillmentStatus || 'PENDING') - 1) * 33.33}%` }}
                ></div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10 gap-8 sm:gap-0">
                  
                  {/* Stage 1 */}
                  <div className="flex sm:flex-col items-center gap-4 sm:gap-2 relative w-full sm:w-1/4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md z-10 shrink-0 transition-colors ${
                      getStatusStage(selectedOrder.fulfillmentStatus) >= 1 ? 'bg-accent-gold text-bg-base ring-4 ring-bg-base' : 'bg-surface border-2 border-accent-gold/30 text-text-secondary'
                    }`}>
                      1
                    </div>
                    <div className="text-left sm:text-center">
                      <p className={`font-bold ${getStatusStage(selectedOrder.fulfillmentStatus) >= 1 ? 'text-text-primary' : 'text-text-secondary'}`}>Order Placed</p>
                      <p className="text-xs text-text-secondary mt-1 hidden sm:block">We have received your order</p>
                    </div>
                    {/* Mobile connecting line */}
                    <div className="absolute top-10 left-5 w-[2px] h-[calc(100%+32px)] bg-accent-gold/20 sm:hidden"></div>
                  </div>

                  {/* Stage 2 */}
                  <div className="flex sm:flex-col items-center gap-4 sm:gap-2 relative w-full sm:w-1/4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md z-10 shrink-0 transition-colors ${
                      getStatusStage(selectedOrder.fulfillmentStatus) >= 2 ? 'bg-accent-gold text-bg-base ring-4 ring-bg-base' : 'bg-surface border-2 border-accent-gold/30 text-text-secondary'
                    }`}>
                      2
                    </div>
                    <div className="text-left sm:text-center">
                      <p className={`font-bold ${getStatusStage(selectedOrder.fulfillmentStatus) >= 2 ? 'text-text-primary' : 'text-text-secondary'}`}>Processing</p>
                      <p className="text-xs text-text-secondary mt-1 hidden sm:block">Packing your items</p>
                    </div>
                    {/* Mobile connecting line */}
                    <div className="absolute top-10 left-5 w-[2px] h-[calc(100%+32px)] bg-accent-gold/20 sm:hidden"></div>
                  </div>

                  {/* Stage 3 */}
                  <div className="flex sm:flex-col items-center gap-4 sm:gap-2 relative w-full sm:w-1/4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md z-10 shrink-0 transition-colors ${
                      getStatusStage(selectedOrder.fulfillmentStatus) >= 3 ? 'bg-accent-gold text-bg-base ring-4 ring-bg-base' : 'bg-surface border-2 border-accent-gold/30 text-text-secondary'
                    }`}>
                      3
                    </div>
                    <div className="text-left sm:text-center">
                      <p className={`font-bold ${getStatusStage(selectedOrder.fulfillmentStatus) >= 3 ? 'text-text-primary' : 'text-text-secondary'}`}>Dispatched</p>
                      <p className="text-xs text-text-secondary mt-1 hidden sm:block">Handed to courier</p>
                    </div>
                    {/* Mobile connecting line */}
                    <div className="absolute top-10 left-5 w-[2px] h-[calc(100%+32px)] bg-accent-gold/20 sm:hidden"></div>
                  </div>

                  {/* Stage 4 */}
                  <div className="flex sm:flex-col items-center gap-4 sm:gap-2 relative w-full sm:w-1/4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md z-10 shrink-0 transition-colors ${
                      getStatusStage(selectedOrder.fulfillmentStatus) >= 4 ? 'bg-accent-gold text-bg-base ring-4 ring-bg-base' : 'bg-surface border-2 border-accent-gold/30 text-text-secondary'
                    }`}>
                      4
                    </div>
                    <div className="text-left sm:text-center">
                      <p className={`font-bold ${getStatusStage(selectedOrder.fulfillmentStatus) >= 4 ? 'text-text-primary' : 'text-text-secondary'}`}>Delivered</p>
                      <p className="text-xs text-text-secondary mt-1 hidden sm:block">Package arrived</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Courier Info & Admin Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 border-t border-accent-gold/10 pt-8">
                
                {/* Courier Details */}
                <div className="bg-bg-base p-6 rounded-xl border border-accent-gold/20 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent-gold"></div>
                  <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">Courier / AWB Tracking</h3>
                  
                  {selectedOrder.trackingNumber ? (
                    <div className="mt-4">
                      <p className="text-2xl font-bold text-text-primary mb-4 break-all">
                        {selectedOrder.trackingNumber}
                      </p>
                      <button 
                        onClick={() => copyToClipboard(selectedOrder.trackingNumber)}
                        className={`text-sm font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all shadow-sm ${
                          copySuccess ? 'bg-green-600/20 text-green-500 border border-green-500/50' : 'bg-surface hover:bg-surface-hover text-text-primary border border-accent-gold/20 hover:border-accent-gold/50'
                        }`}
                      >
                        {copySuccess ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            Copy Number
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 flex flex-col justify-center h-20">
                      <p className="text-text-secondary italic">Tracking details will appear here once the order is dispatched.</p>
                    </div>
                  )}
                </div>

                {/* Admin Fulfillment Notes */}
                <div className="bg-bg-base p-6 rounded-xl border border-accent-gold/20 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent-gold"></div>
                  <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">Latest Updates</h3>
                  
                  <div className="mt-4">
                    {selectedOrder.fulfillmentNote ? (
                      <div className="bg-surface p-4 rounded-lg border border-accent-gold/10">
                        <p className="text-text-primary font-medium leading-relaxed">
                          "{selectedOrder.fulfillmentNote}"
                        </p>
                        <p className="text-xs text-text-secondary mt-2 text-right">- Warehouse Team</p>
                      </div>
                    ) : (
                      <div className="flex flex-col justify-center h-20">
                        <p className="text-text-secondary italic">No additional notes from the warehouse team.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TrackOrderScreen;

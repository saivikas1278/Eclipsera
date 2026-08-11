import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import { TableVirtuoso } from 'react-virtuoso';
import { useDebounce } from '../../hooks/useDebounce';

const OrderListScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Search
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const debouncedSearch = useDebounce(search, 500);

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fulfillmentStatus, setFulfillmentStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [fulfillmentNote, setFulfillmentNote] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Bulk Action State
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('PROCESSING');
  const [bulkNote, setBulkNote] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

  const { userInfo, handleLogout } = useContext(StoreContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const { data } = await axios.get(`/api/orders?page=${page}&limit=50&search=${debouncedSearch}`, config);
        setOrders(data.data ? data.data : data);
        if (data.totalPages) setTotalPages(data.totalPages);
        if (data.totalCount) setTotalCount(data.totalCount);
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

    if (userInfo && userInfo.isAdmin) {
      fetchOrders();
    }
  }, [userInfo, navigate, handleLogout, page, debouncedSearch]);

  const openModal = (order) => {
    setSelectedOrder(order);
    setFulfillmentStatus(order.fulfillmentStatus || 'PENDING');
    setTrackingNumber(order.trackingNumber || '');
    setFulfillmentNote(order.fulfillmentNote || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrders(orders.map(order => order._id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (id) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter(orderId => orderId !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedOrders.length === 0) return;
    setBulkLoading(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const payload = {
        orderIds: selectedOrders,
        status: bulkStatus,
        note: bulkNote,
      };

      await axios.put('/api/orders/bulk-fulfillment', payload, config);
      
      // Update local state instantly
      const updatedOrders = orders.map(order => {
        if (selectedOrders.includes(order._id)) {
          return { ...order, fulfillmentStatus: bulkStatus };
        }
        return order;
      });
      setOrders(updatedOrders);
      setSelectedOrders([]);
      setBulkLoading(false);
      showToast(`Successfully updated ${selectedOrders.length} orders to ${bulkStatus}!`);
    } catch (err) {
      setBulkLoading(false);
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const payload = {
        status: fulfillmentStatus,
        trackingNumber,
        note: fulfillmentNote,
        location: 'Admin Warehouse'
      };

      const { data: updatedOrder } = await axios.put(
        `/api/orders/${selectedOrder._id}/fulfillment`,
        payload,
        config
      );

      // Instantly update the order list in background
      setOrders(orders.map((o) => (o._id === updatedOrder._id ? updatedOrder : o)));
      
      setUpdateLoading(false);
      showToast(`Order status updated to ${fulfillmentStatus} and customer notified.`);
      closeModal();
    } catch (err) {
      setUpdateLoading(false);
      alert(err.response?.data?.message || err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-xl font-medium text-accent-gold/80 animate-pulse">
        Fetching orders...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-accent-gold/10 text-accent-gold p-4 rounded-lg text-center mt-10 border border-accent-gold/20">
        {error}
      </div>
    );
  }

  return (
    <div className="py-8 animate-fade-in relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[60] bg-accent-gold text-bg-base font-bold px-6 py-3 rounded-lg shadow-xl animate-fade-in">
          {toastMessage}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-4xl font-serif font-extrabold text-text-primary tracking-tight">Customer Orders</h1>
        <input 
          type="text" 
          placeholder="Search Order ID or Name..."
          value={search}
          onChange={(e) => {setSearch(e.target.value); setPage(1);}}
          className="bg-bg-base border border-accent-gold/40 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-gold w-full sm:w-72"
        />
      </div>
      
      {/* Bulk Action Bar */}
      {selectedOrders.length > 0 && (
        <div className="bg-surface border border-accent-gold/40 rounded-xl p-4 mb-6 shadow-md flex flex-wrap items-center justify-between gap-4 animate-fade-in">
          <div className="text-accent-gold font-bold text-lg">
            [{selectedOrders.length}] Orders Selected
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="bg-bg-base border border-accent-gold/40 rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-gold"
            >
              <option value="PENDING">PENDING</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="RETURN_APPROVED">RETURN_APPROVED</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>
            <input 
              type="text" 
              value={bulkNote}
              onChange={(e) => setBulkNote(e.target.value)}
              placeholder="Optional Note..."
              className="bg-bg-base border border-accent-gold/40 rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-gold placeholder:text-text-secondary/50"
            />
            <button 
              onClick={handleBulkUpdate}
              disabled={bulkLoading}
              className="bg-accent-gold hover:bg-accent-gold-hover text-bg-base font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
            >
              {bulkLoading ? 'Applying...' : 'Apply to All'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-surface rounded-3xl shadow-sm border border-accent-gold/20 overflow-hidden h-[600px]">
        <TableVirtuoso
          data={orders}
          useWindowScroll={false}
          fixedHeaderContent={() => (
            <tr className="bg-bg-base/95 backdrop-blur-sm border-b border-accent-gold/20 shadow-sm">
                <th className="px-6 py-4 text-sm font-bold text-text-primary/80 uppercase tracking-wider w-12 z-10">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded text-accent-gold focus:ring-accent-gold bg-bg-base border-accent-gold/40 cursor-pointer"
                    checked={orders.length > 0 && selectedOrders.length === orders.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 text-sm font-bold text-text-primary/80 uppercase tracking-wider z-10">Order ID</th>
                <th className="px-6 py-4 text-sm font-bold text-text-primary/80 uppercase tracking-wider z-10">User</th>
                <th className="px-6 py-4 text-sm font-bold text-text-primary/80 uppercase tracking-wider z-10">Date</th>
                <th className="px-6 py-4 text-sm font-bold text-text-primary/80 uppercase tracking-wider z-10">Total</th>
                <th className="px-6 py-4 text-sm font-bold text-text-primary/80 uppercase tracking-wider z-10">Status</th>
            </tr>
          )}
          itemContent={(index, order) => (
            <>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded text-accent-gold focus:ring-accent-gold bg-bg-base border-accent-gold/40 cursor-pointer"
                      checked={selectedOrders.includes(order._id)}
                      onChange={() => handleSelectOrder(order._id)}
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-text-primary font-medium cursor-pointer" onClick={() => openModal(order)}>
                    {order._id}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-primary/90 font-semibold cursor-pointer" onClick={() => openModal(order)}>
                    {order.user && order.user.name ? order.user.name : 'Deleted User'}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-primary/70 cursor-pointer" onClick={() => openModal(order)}>
                    {order.createdAt.substring(0, 10)}
                  </td>
                  <td className="px-6 py-4 text-sm text-accent-gold font-bold cursor-pointer" onClick={() => openModal(order)}>
                    ₹{order.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm cursor-pointer" onClick={() => openModal(order)}>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.fulfillmentStatus === 'DELIVERED' ? 'bg-green-900/50 text-green-400' :
                      order.fulfillmentStatus === 'SHIPPED' ? 'bg-blue-900/50 text-blue-400' :
                      order.fulfillmentStatus === 'CANCELLED' ? 'bg-red-900/50 text-red-400' :
                      'bg-accent-gold/20 text-accent-gold'
                    }`}>
                      {order.fulfillmentStatus || 'PENDING'}
                    </span>
                  </td>
            </>
          )}
        />
      </div>

      <div className="flex justify-between items-center mt-6 px-4">
        <button 
          disabled={page === 1} 
          onClick={() => setPage(p => p - 1)}
          className="bg-surface border border-accent-gold/40 text-text-primary font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 hover:border-accent-gold hover:text-accent-gold"
        >
          Previous
        </button>
        <span className="text-text-primary font-medium">Page {page} of {totalPages} <span className="text-text-primary/50 text-sm ml-2">(Total: {totalCount})</span></span>
        <button 
          disabled={page >= totalPages} 
          onClick={() => setPage(p => p + 1)}
          className="bg-surface border border-accent-gold/40 text-text-primary font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 hover:border-accent-gold hover:text-accent-gold"
        >
          Next
        </button>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface border border-accent-gold/20 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col relative">
            
            <div className="sticky top-0 bg-surface/95 backdrop-blur z-10 px-6 py-4 border-b border-accent-gold/20 flex justify-between items-center">
              <h2 className="text-2xl font-serif font-bold text-text-primary">Order #{selectedOrder._id}</h2>
              <button onClick={closeModal} className="text-text-secondary hover:text-accent-gold text-2xl font-bold">&times;</button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-accent-gold mb-3">Customer Details</h3>
                  <div className="bg-bg-base p-4 rounded-xl border border-walnut/10">
                    <p className="text-text-primary"><span className="font-semibold">Name:</span> {selectedOrder.user?.name || 'N/A'}</p>
                    <p className="text-text-primary"><span className="font-semibold">Email:</span> {selectedOrder.user?.email || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-accent-gold mb-3">Shipping Address</h3>
                  <div className="bg-bg-base p-4 rounded-xl border border-walnut/10 text-text-primary">
                    <p>{selectedOrder.shippingAddress.address}</p>
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}</p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-accent-gold mb-3">Order Items</h3>
                  <div className="bg-bg-base rounded-xl border border-walnut/10 overflow-hidden divide-y divide-walnut/10">
                    {selectedOrder.orderItems.map((item, index) => (
                      <div key={index} className="p-4 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-text-primary">{item.name}</p>
                          <p className="text-sm text-text-secondary">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-accent-gold">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-accent-gold mb-3">Financial Summary</h3>
                  <div className="bg-bg-base p-4 rounded-xl border border-walnut/10">
                    <div className="flex justify-between font-bold text-lg text-text-primary mt-2 pt-2">
                      <span>Total:</span>
                      <span className="text-accent-gold">₹{selectedOrder.totalPrice.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-text-secondary mt-2">
                      Payment Status: {selectedOrder.isPaid ? `Paid on ${selectedOrder.paidAt.substring(0,10)}` : 'Unpaid'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Fulfillment Control */}
              <div>
                <h3 className="text-lg font-bold text-accent-gold mb-3">Fulfillment Control Panel</h3>
                <form onSubmit={handleUpdateStatus} className="bg-bg-base p-6 rounded-xl border border-accent-gold/30 shadow-inner">
                  
                  <div className="mb-4">
                    <label className="block text-sm font-bold text-text-primary mb-2">Order Status</label>
                    <select 
                      value={fulfillmentStatus} 
                      onChange={(e) => setFulfillmentStatus(e.target.value)}
                      className="w-full bg-surface border border-accent-gold/40 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-gold"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-bold text-text-primary mb-2">Tracking / AWB Number</label>
                    <input 
                      type="text" 
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g. BLUEDART-123456"
                      className="w-full bg-surface border border-accent-gold/40 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-gold placeholder:text-text-secondary/50"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-bold text-text-primary mb-2">Update Note to Customer</label>
                    <textarea 
                      value={fulfillmentNote}
                      onChange={(e) => setFulfillmentNote(e.target.value)}
                      placeholder="Optional note to send customer..."
                      rows="3"
                      className="w-full bg-surface border border-accent-gold/40 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-gold placeholder:text-text-secondary/50 resize-none"
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={updateLoading}
                    className="w-full bg-accent-gold hover:bg-accent-gold-hover text-bg-base font-bold py-3 px-6 rounded-lg transition-colors flex justify-center items-center h-12"
                  >
                    {updateLoading ? (
                      <svg className="animate-spin h-5 w-5 text-bg-base" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      'Update Status & Notify Customer'
                    )}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default OrderListScreen;

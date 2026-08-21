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

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fulfillmentStatus, setFulfillmentStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [fulfillmentNote, setFulfillmentNote] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Decline Form State
  const predefinedReasons = [
    "We were unable to verify the payment receipt provided. Please ensure the screenshot is clear and corresponds to this exact order.",
    "The payment amount received does not match the order total. Please contact support to resolve this discrepancy.",
    "The provided payment screenshot indicates the transaction is pending or failed. We have not received the funds.",
    "We apologize, but one or more items in your order are currently out of stock due to an inventory mismatch.",
    "We are currently unable to deliver to the shipping address or PIN code provided.",
    "Cash on Delivery is currently unavailable for this item or location.",
    "The customization request provided cannot be fulfilled. Please contact support for alternative options.",
    "Other (Custom Reason)"
  ];
  const [showDeclineOptions, setShowDeclineOptions] = useState(false);
  const [declineReason, setDeclineReason] = useState(predefinedReasons[0]);
  const [customReason, setCustomReason] = useState('');

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

        const { data } = await axios.get(`/api/orders?page=${page}&limit=50&search=${debouncedSearch}&status=${statusFilter}&startDate=${startDate}&endDate=${endDate}`, config);
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
  }, [userInfo, navigate, handleLogout, page, debouncedSearch, statusFilter, startDate, endDate]);

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
    setShowDeclineOptions(false);
    setDeclineReason(predefinedReasons[0]);
    setCustomReason('');
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
          if (bulkStatus === 'DELIVERED') {
            return { ...order, fulfillmentStatus: bulkStatus, isDelivered: true, deliveredAt: new Date().toISOString() };
          }
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

  const handleVerifyPayment = async () => {
    setUpdateLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      const { data: updatedOrder } = await axios.put(
        `/api/orders/${selectedOrder._id}/verify-payment`,
        {},
        config
      );
      
      setOrders(orders.map((o) => (o._id === updatedOrder._id ? updatedOrder : o)));
      setSelectedOrder(updatedOrder);
      setUpdateLoading(false);
      showToast('Payment verified successfully!');
    } catch (err) {
      setUpdateLoading(false);
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDeclineOrder = async () => {
    let reason = declineReason;
    if (reason === 'Other (Custom Reason)') {
      if (!customReason.trim()) {
        alert("Please enter a custom reason.");
        return;
      }
      reason = customReason;
    }

    setUpdateLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      const { data: updatedOrder } = await axios.put(
        `/api/orders/${selectedOrder._id}/cancel`,
        { reason },
        config
      );
      
      setOrders(orders.map((o) => (o._id === updatedOrder._id ? updatedOrder : o)));
      setSelectedOrder(updatedOrder);
      setShowDeclineOptions(false);
      setUpdateLoading(false);
      showToast('Order declined successfully!');
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
    <div className="py-8 animate-fade-in relative px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
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
      
      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 bg-surface p-4 rounded-xl border border-accent-gold/20 shadow-sm animate-fade-in">
        <div className="flex-1">
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Status</label>
          <select 
            value={statusFilter}
            onChange={(e) => {setStatusFilter(e.target.value); setPage(1);}}
            className="w-full bg-bg-base border border-accent-gold/40 rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-gold min-h-[44px]"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="RETURNED">RETURNED</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Start Date</label>
          <input 
            type="date"
            value={startDate}
            onChange={(e) => {setStartDate(e.target.value); setPage(1);}}
            className="w-full bg-bg-base border border-accent-gold/40 rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-gold min-h-[44px]"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">End Date</label>
          <input 
            type="date"
            value={endDate}
            onChange={(e) => {setEndDate(e.target.value); setPage(1);}}
            className="w-full bg-bg-base border border-accent-gold/40 rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-gold min-h-[44px]"
          />
        </div>
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
              className="bg-bg-base border border-accent-gold/40 rounded-lg px-4 py-2 min-h-12 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-gold placeholder:text-text-secondary/50"
            />
            <button 
              onClick={handleBulkUpdate}
              disabled={bulkLoading}
              className="bg-accent-gold hover:bg-accent-gold-hover text-bg-base font-bold py-2 min-h-12 px-6 rounded-lg transition-colors flex items-center gap-2"
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
          components={{
            Table: (props) => <table {...props} className="w-full border-collapse" />,
            TableRow: (props) => <tr {...props} className="grid grid-cols-2 md:table-row gap-y-1 p-3 mb-3 border border-accent-gold/20 md:border-none rounded-xl md:rounded-none bg-surface md:bg-transparent shadow-sm md:shadow-none md:p-0 relative hover:bg-bg-base/50 transition-colors cursor-pointer" />
          }}
          fixedHeaderContent={() => (
            <tr className="bg-bg-base/95 backdrop-blur-sm border-b border-accent-gold/20 shadow-sm hidden md:table-row">
                <th className="px-6 py-4 text-sm font-bold text-text-primary/80 uppercase tracking-wider w-12 z-10">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded text-accent-gold focus:ring-accent-gold bg-bg-base border-accent-gold/40 cursor-pointer"
                    checked={orders.length > 0 && selectedOrders.length === orders.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 text-sm font-bold text-text-primary/80 uppercase tracking-wider z-10">Order Summary</th>
                <th className="px-6 py-4 text-sm font-bold text-text-primary/80 uppercase tracking-wider z-10">User</th>
                <th className="px-6 py-4 text-sm font-bold text-text-primary/80 uppercase tracking-wider z-10">Date</th>
                <th className="px-6 py-4 text-sm font-bold text-text-primary/80 uppercase tracking-wider z-10">Total</th>
                <th className="px-6 py-4 text-sm font-bold text-text-primary/80 uppercase tracking-wider z-10">Status</th>
            </tr>
          )}
          itemContent={(index, order) => (
            <>
                  {/* Checkbox: Top right absolute on mobile */}
                  <td className="absolute top-3 right-3 md:static md:table-cell md:px-6 md:py-4 md:border-b md:border-white/5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 md:w-4 md:h-4 rounded text-accent-gold focus:ring-accent-gold bg-bg-base border-accent-gold/40 cursor-pointer shadow-sm"
                        checked={selectedOrders.includes(order._id)}
                        onChange={() => handleSelectOrder(order._id)}
                      />
                    </div>
                  </td>
                  
                  {/* Order Summary */}
                  <td className="col-start-1 col-span-2 row-start-1 block md:table-cell p-0 md:px-6 md:py-4 md:border-b md:border-white/5" onClick={() => openModal(order)}>
                    <span className="text-sm md:text-sm font-black text-text-primary pr-10 block truncate">{order.orderItems?.map(i => i.name).join(', ') || 'Custom Order'}</span>
                  </td>
                  
                  {/* User */}
                  <td className="col-start-1 col-span-1 row-start-2 block md:table-cell p-0 md:px-6 md:py-4 md:border-b md:border-white/5" onClick={() => openModal(order)}>
                    <span className="text-sm font-bold text-text-primary/90 truncate block">{order.user?.name || 'Deleted'}</span>
                  </td>
                  
                  {/* Date */}
                  <td className="col-start-1 col-span-1 row-start-3 block md:table-cell p-0 md:px-6 md:py-4 md:border-b md:border-white/5" onClick={() => openModal(order)}>
                    <span className="text-xs font-semibold text-text-secondary">{order.createdAt.substring(0, 10)}</span>
                  </td>
                  
                  {/* Total */}
                  <td className="col-start-2 col-span-1 row-start-2 block md:table-cell p-0 md:px-6 md:py-4 md:border-b md:border-white/5" onClick={() => openModal(order)}>
                    <div className="text-right pr-10 md:pr-0 md:text-left">
                      <span className="text-sm font-black text-accent-gold block">₹{order.totalPrice.toFixed(2)}</span>
                    </div>
                  </td>
                  
                  {/* Status */}
                  <td className="col-start-2 col-span-1 row-start-3 flex items-center justify-end pr-10 md:table-cell p-0 md:px-6 md:py-4 md:border-b md:border-white/5" onClick={() => openModal(order)}>
                    <div className="flex justify-end md:justify-start w-full">
                      <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-black tracking-wide shadow-sm border ${
                        order.fulfillmentStatus === 'DELIVERED' ? 'bg-green-900/30 text-green-400 border-green-500/30' :
                        order.fulfillmentStatus === 'SHIPPED' ? 'bg-blue-900/30 text-blue-400 border-blue-500/30' :
                        order.fulfillmentStatus === 'CANCELLED' ? 'bg-red-900/30 text-red-400 border-red-500/30' :
                        'bg-accent-gold/20 text-accent-gold border-accent-gold/30'
                      }`}>
                        {order.fulfillmentStatus || 'PENDING'}
                      </span>
                    </div>
                  </td>
            </>
          )}
        />
      </div>

      <div className="flex justify-between items-center mt-6 px-4">
        <button 
          disabled={page === 1} 
          onClick={() => setPage(p => p - 1)}
          className="bg-surface border border-accent-gold/40 text-text-primary font-bold py-2 min-h-12 px-6 rounded-lg transition-colors disabled:opacity-50 hover:border-accent-gold hover:text-accent-gold"
        >
          Previous
        </button>
        <span className="text-text-primary font-medium">Page {page} of {totalPages} <span className="text-text-primary/50 text-sm ml-2">(Total: {totalCount})</span></span>
        <button 
          disabled={page >= totalPages} 
          onClick={() => setPage(p => p + 1)}
          className="bg-surface border border-accent-gold/40 text-text-primary font-bold py-2 min-h-12 px-6 rounded-lg transition-colors disabled:opacity-50 hover:border-accent-gold hover:text-accent-gold"
        >
          Next
        </button>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface border border-accent-gold/20 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col relative">
            
            <div className="sticky top-0 bg-surface/95 backdrop-blur z-10 px-6 py-4 border-b border-accent-gold/20 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-serif font-bold text-text-primary">Order for {selectedOrder.user?.name || 'Customer'}</h2>
                {selectedOrder.paymentMethod === 'Cash On Delivery' && (
                  <span className="bg-red-900/30 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">COD</span>
                )}
              </div>
              <button onClick={closeModal} className="text-text-secondary hover:text-accent-gold text-2xl font-bold min-h-12 min-w-12 flex items-center justify-center">&times;</button>
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
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}</p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                    {selectedOrder.shippingAddress.phone && (
                      <p className="mt-2 text-text-secondary">Phone: {selectedOrder.shippingAddress.phone}</p>
                    )}
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
                    <p className="text-sm text-text-secondary mt-1">
                      Payment Method: <span className="font-bold text-accent-gold">{selectedOrder.paymentMethod || 'N/A'}</span>
                    </p>
                    {selectedOrder.paymentMethod === 'PHONEPE' && (
                      <div className="mt-4 pt-4 border-t border-walnut/10">
                        <p className="font-bold text-text-primary mb-2">PhonePe Manual Payment</p>
                        {selectedOrder.paymentReceipt ? (
                          <div className="mb-4">
                            <a href={selectedOrder.paymentReceipt} target="_blank" rel="noreferrer" className="text-accent-gold underline text-sm">
                              View Uploaded Receipt
                            </a>
                            <div className="mt-2 w-32 h-32 rounded border border-walnut/10 overflow-hidden">
                              <img src={selectedOrder.paymentReceipt} alt="Receipt" className="w-full h-full object-cover" />
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-red-400 mb-4">No receipt uploaded</p>
                        )}
                        
                        {!selectedOrder.isVerifiedByAdmin && selectedOrder.paymentReceipt && !selectedOrder.isCancelled && (
                          <div className="w-full mt-4 bg-bg-base p-4 rounded-xl border border-walnut/10">
                            {!showDeclineOptions ? (
                              <div className="flex gap-2 w-full">
                                <button 
                                  onClick={(e) => { e.preventDefault(); handleVerifyPayment(); }}
                                  disabled={updateLoading}
                                  className="w-1/2 bg-accent-gold hover:bg-accent-gold-hover text-bg-base font-bold py-2 min-h-12 rounded-lg transition-colors"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={(e) => { e.preventDefault(); setShowDeclineOptions(true); }}
                                  disabled={updateLoading}
                                  className="w-1/2 bg-surface hover:bg-surface/80 border border-red-500 text-red-500 font-bold py-2 min-h-12 rounded-lg transition-colors"
                                >
                                  Decline
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-3 w-full animate-fade-in">
                                <label className="text-sm font-bold text-red-500">Select Decline Reason:</label>
                                <select 
                                  value={declineReason}
                                  onChange={(e) => setDeclineReason(e.target.value)}
                                  className="w-full bg-surface border border-walnut/20 text-text-primary text-sm rounded-lg p-2 min-h-12 focus:outline-none focus:border-accent-gold"
                                >
                                  {predefinedReasons.map((r, idx) => (
                                    <option key={idx} value={r}>{r}</option>
                                  ))}
                                </select>
                                
                                {declineReason === 'Other (Custom Reason)' && (
                                  <textarea 
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                    placeholder="Type your exact reason here..."
                                    className="w-full bg-surface border border-walnut/20 text-text-primary text-sm rounded-lg p-2 h-20 resize-none focus:outline-none focus:border-accent-gold"
                                  />
                                )}
                                
                                <div className="flex gap-2 w-full mt-2">
                                  <button 
                                    onClick={(e) => { e.preventDefault(); setShowDeclineOptions(false); }}
                                    disabled={updateLoading}
                                    className="w-1/3 bg-surface hover:bg-surface/80 border border-walnut/20 text-text-primary font-bold py-2 min-h-12 rounded-lg transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button 
                                    onClick={(e) => { e.preventDefault(); handleDeclineOrder(); }}
                                    disabled={updateLoading}
                                    className="w-2/3 bg-red-600 hover:bg-red-700 text-white font-bold py-2 min-h-12 rounded-lg transition-colors"
                                  >
                                    Confirm Decline
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {selectedOrder.isVerifiedByAdmin && !selectedOrder.isCancelled && (
                          <p className="text-green-400 font-bold text-sm bg-green-900/20 p-2 rounded inline-block mt-2">Payment Verified</p>
                        )}
                        {selectedOrder.isCancelled && (
                          <p className="text-red-500 font-bold text-sm bg-red-900/20 p-2 rounded inline-block mt-2">Order Cancelled: {selectedOrder.cancelReason}</p>
                        )}
                      </div>
                    )}
                    
                    {/* Cash On Delivery Decline Block */}
                    {selectedOrder.paymentMethod === 'Cash On Delivery' && !selectedOrder.isCancelled && !selectedOrder.isDelivered && (
                      <div className="w-full mt-4 bg-bg-base p-4 rounded-xl border border-red-500/30">
                        <p className="font-bold text-red-400 mb-3">Cash On Delivery Order</p>
                        {!showDeclineOptions ? (
                          <button 
                            onClick={(e) => { e.preventDefault(); setShowDeclineOptions(true); }}
                            disabled={updateLoading}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 min-h-12 rounded-lg transition-colors shadow-sm"
                          >
                            Decline COD Order
                          </button>
                        ) : (
                          <div className="flex flex-col gap-3 w-full animate-fade-in">
                            <label className="text-sm font-bold text-red-500">Select Decline Reason:</label>
                            <select 
                              value={declineReason}
                              onChange={(e) => setDeclineReason(e.target.value)}
                              className="w-full bg-surface border border-walnut/20 text-text-primary text-sm rounded-lg p-2 min-h-12 focus:outline-none focus:border-accent-gold"
                            >
                              {predefinedReasons.map((r, idx) => (
                                <option key={idx} value={r}>{r}</option>
                              ))}
                            </select>
                            
                            {declineReason === 'Other (Custom Reason)' && (
                              <textarea 
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                placeholder="Type your exact reason here..."
                                className="w-full bg-surface border border-walnut/20 text-text-primary text-sm rounded-lg p-2 h-20 resize-none focus:outline-none focus:border-accent-gold"
                              />
                            )}
                            
                            <div className="flex gap-2 w-full mt-2">
                              <button 
                                onClick={(e) => { e.preventDefault(); setShowDeclineOptions(false); }}
                                disabled={updateLoading}
                                className="w-1/3 bg-surface hover:bg-surface/80 border border-walnut/20 text-text-primary font-bold py-2 min-h-12 rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={(e) => { e.preventDefault(); handleDeclineOrder(); }}
                                disabled={updateLoading}
                                className="w-2/3 bg-red-600 hover:bg-red-700 text-white font-bold py-2 min-h-12 rounded-lg transition-colors shadow-md"
                              >
                                Confirm Decline
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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
                      className="w-full bg-surface border border-accent-gold/40 rounded-lg px-4 py-3 min-h-12 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-gold"
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
                      className="w-full bg-surface border border-accent-gold/40 rounded-lg px-4 py-3 min-h-12 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-gold placeholder:text-text-secondary/50"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-bold text-text-primary mb-2">Update Note to Customer</label>
                    <textarea 
                      value={fulfillmentNote}
                      onChange={(e) => setFulfillmentNote(e.target.value)}
                      placeholder="Optional note to send customer..."
                      rows="3"
                      className="w-full bg-surface border border-accent-gold/40 rounded-lg px-4 py-3 min-h-12 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-gold placeholder:text-text-secondary/50 resize-none"
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

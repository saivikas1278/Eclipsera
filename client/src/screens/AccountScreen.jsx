import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../context/StoreContext';
import AddressManager from '../components/AddressManager';
import UserReviewsScreen from './UserReviewsScreen';
import NotificationsScreen from './NotificationsScreen';
import TrackOrderScreen from './TrackOrderScreen';
import toast from 'react-hot-toast';

const AccountScreen = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [errorOrders, setErrorOrders] = useState(null);

  // Profile Edit State
  const [nameProfile, setNameProfile] = useState('');
  const [emailProfile, setEmailProfile] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);

  const navigate = useNavigate();
  const { userInfo, setUserInfo, updateSession } = useContext(StoreContext);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }
  }, [navigate, userInfo]);

  useEffect(() => {
    const fetchMyOrders = async () => {
      if (userInfo && activeTab === 'overview') {
        try {
          setLoadingOrders(true);
          const config = {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          };
          const { data } = await axios.get('/api/orders/mine', config);
          // Only take top 3 most recent orders
          setOrders(data.slice(0, 3));
          setLoadingOrders(false);
        } catch (error) {
          setErrorOrders(
            error.response && error.response.data.message
              ? error.response.data.message
              : error.message
          );
          setLoadingOrders(false);
        }
      }
    };

    fetchMyOrders();
  }, [userInfo, activeTab]);

  // Pre-fill profile form when tab is active
  useEffect(() => {
    if (userInfo && activeTab === 'edit_profile') {
      setNameProfile(userInfo.name || '');
      setEmailProfile(userInfo.email || '');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [userInfo, activeTab]);

  const updateProfileHandler = async (e) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoadingProfile(true);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.put(
        '/api/users/profile',
        { 
          name: nameProfile, 
          email: emailProfile, 
          currentPassword, 
          password: newPassword 
        },
        config
      );

      updateSession(data);
      toast.success('Account updated successfully!');
      setLoadingProfile(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
      setLoadingProfile(false);
    }
  };

  const logoutHandler = () => {
    setUserInfo(null);
    localStorage.removeItem('userInfo');
    localStorage.removeItem('cartItems');
    navigate('/login');
  };

  const downloadInvoiceHandler = async (orderId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
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

  if (!userInfo) return null;

  // Find default address
  const defaultAddress = userInfo.addresses?.find((addr) => addr.isDefault) || userInfo.addresses?.[0];

  return (
    <div className="min-h-screen bg-transparent py-10 px-4 sm:px-6 lg:px-8 font-sans text-text-primary">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight mb-8">My Account</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="hidden md:block w-full md:w-64 flex-shrink-0">
            <div className="bg-surface rounded-2xl shadow-sm border border-accent-gold/20 overflow-hidden">
              <nav className="flex flex-col">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`text-left px-6 py-4 font-semibold transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-accent-gold text-white'
                      : 'hover:bg-transparent text-text-primary'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('edit_profile')}
                  className={`text-left px-6 py-4 font-semibold transition-colors border-t border-accent-gold/20 ${
                    activeTab === 'edit_profile'
                      ? 'bg-accent-gold text-white'
                      : 'hover:bg-transparent text-text-primary'
                  }`}
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`text-left px-6 py-4 font-semibold transition-colors border-t border-accent-gold/20 ${
                    activeTab === 'addresses'
                      ? 'bg-accent-gold text-white'
                      : 'hover:bg-transparent text-text-primary'
                  }`}
                >
                  Saved Addresses
                </button>
                <button
                  onClick={() => setActiveTab('track_orders')}
                  className={`text-left px-6 py-4 font-semibold transition-colors border-t border-accent-gold/20 ${
                    activeTab === 'track_orders'
                      ? 'bg-accent-gold text-white'
                      : 'hover:bg-transparent text-text-primary'
                  }`}
                >
                  Track Orders
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`text-left px-6 py-4 font-semibold transition-colors border-t border-accent-gold/20 ${
                    activeTab === 'reviews'
                      ? 'bg-accent-gold text-white'
                      : 'hover:bg-transparent text-text-primary'
                  }`}
                >
                  My Reviews
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`text-left px-6 py-4 font-semibold transition-colors border-t border-accent-gold/20 ${
                    activeTab === 'notifications'
                      ? 'bg-accent-gold text-white'
                      : 'hover:bg-transparent text-text-primary'
                  }`}
                >
                  Notifications
                </button>
                {userInfo.isAdmin && (
                  <Link
                    to="/admin/orderlist"
                    className="block text-left px-6 py-4 font-semibold text-accent-gold hover:bg-accent-gold/10 transition-colors border-t border-accent-gold/20"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={logoutHandler}
                  className="text-left px-6 py-4 font-semibold text-red-600 hover:bg-red-50 transition-colors border-t border-accent-gold/20"
                >
                  Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-grow">
            {activeTab === 'overview' && (
              <>
                {/* --- MOBILE DASHBOARD --- */}
                <div className="block md:hidden animate-fade-in space-y-4">
                  {/* User Header */}
                  <div className="flex items-center gap-4 bg-surface p-4 rounded-xl border border-accent-gold/20 shadow-sm">
                    <div className="w-14 h-14 rounded-full bg-accent-gold text-white flex items-center justify-center text-xl font-bold uppercase shadow-inner">
                      {userInfo.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-text-primary leading-tight">{userInfo.name}</h2>
                      <p className="text-text-secondary text-sm">{userInfo.email}</p>
                    </div>
                  </div>

                  {/* Quick Links Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setActiveTab('track_orders')} className="bg-surface p-4 rounded-xl border border-accent-gold/10 flex flex-col items-center justify-center gap-2 hover:border-accent-gold/30 transition-colors shadow-sm w-full">
                      <svg className="w-8 h-8 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                      <span className="font-semibold text-sm text-text-primary">Orders</span>
                    </button>
                    <Link to="/wishlist" className="bg-surface p-4 rounded-xl border border-accent-gold/10 flex flex-col items-center justify-center gap-2 hover:border-accent-gold/30 transition-colors shadow-sm">
                      <svg className="w-8 h-8 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                      <span className="font-semibold text-sm text-text-primary">Wishlist</span>
                    </Link>
                  </div>

                  {userInfo.isAdmin && (
                    <div className="grid grid-cols-1 mt-3">
                      <Link to="/admin/orderlist" className="bg-surface p-4 rounded-xl border border-accent-gold/10 flex items-center justify-center gap-2 hover:border-accent-gold/30 transition-colors shadow-sm w-full text-accent-gold">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span className="font-semibold text-sm">Admin Dashboard</span>
                      </Link>
                    </div>
                  )}

                  {/* Account Settings List */}
                  <div className="bg-surface rounded-xl border border-accent-gold/10 overflow-hidden shadow-sm mt-2">
                    <div className="p-4 border-b border-accent-gold/10 font-bold text-lg text-text-primary bg-bg-base/50">Account Settings</div>
                    <button onClick={() => setActiveTab('edit_profile')} className="w-full flex items-center justify-between p-4 border-b border-accent-gold/10 hover:bg-bg-base transition-colors">
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        <span className="font-semibold text-text-primary">Edit Profile</span>
                      </div>
                      <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                    <button onClick={() => setActiveTab('addresses')} className="w-full flex items-center justify-between p-4 hover:bg-bg-base transition-colors">
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span className="font-semibold text-text-primary">Saved Addresses</span>
                      </div>
                      <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                    <button onClick={() => setActiveTab('reviews')} className="w-full flex items-center justify-between p-4 border-t border-accent-gold/10 hover:bg-bg-base transition-colors">
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                        <span className="font-semibold text-text-primary">My Reviews</span>
                      </div>
                      <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                    <button onClick={() => setActiveTab('notifications')} className="w-full flex items-center justify-between p-4 border-t border-accent-gold/10 hover:bg-bg-base transition-colors">
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        <span className="font-semibold text-text-primary">Notifications</span>
                      </div>
                      <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>

                  {/* Logout Button */}
                  <button onClick={logoutHandler} className="w-full bg-surface text-red-500 font-bold p-4 rounded-xl border border-red-200 hover:bg-red-50 transition-colors shadow-sm mt-4 mb-10">
                    Log Out
                  </button>
                </div>

                {/* --- DESKTOP OVERVIEW --- */}
                <div className="hidden md:block animate-fade-in space-y-6">
                  
                  {/* Header Card */}
                <div className="bg-accent-gold text-white rounded-2xl p-8 shadow-md relative overflow-hidden">
                  <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">Welcome back, {userInfo.name.split(' ')[0]}!</h2>
                    <p className="text-white/80 font-medium">Artisan Member since {new Date(userInfo.createdAt || Date.now()).getFullYear()}</p>
                  </div>
                  {/* Decorative background shape */}
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 rounded-full bg-surface opacity-10 blur-2xl"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Account Details */}
                  <div className="bg-surface rounded-2xl p-6 shadow-sm border border-accent-gold/20">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold">Account Details</h3>
                      <button 
                        onClick={() => setActiveTab('edit_profile')}
                        className="text-sm font-semibold text-accent-gold hover:text-accent-gold transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="font-medium text-text-primary">{userInfo.name}</p>
                    <p className="text-text-secondary mt-1">{userInfo.email}</p>
                  </div>

                  {/* Primary Address */}
                  <div className="bg-surface rounded-2xl p-6 shadow-sm border border-accent-gold/20">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold">Primary Address</h3>
                      <button 
                        onClick={() => setActiveTab('addresses')}
                        className="text-sm font-semibold text-accent-gold hover:text-accent-gold transition-colors"
                      >
                        Manage
                      </button>
                    </div>
                    {defaultAddress ? (
                      <div className="text-text-primary">
                        <p className="font-semibold mb-1">{defaultAddress.label}</p>
                        <p>{defaultAddress.street}</p>
                        <p>{defaultAddress.city}, {defaultAddress.state} {defaultAddress.postalCode}</p>
                        <p>{defaultAddress.country}</p>
                        <p className="text-sm text-text-secondary mt-2">Phone: {defaultAddress.phone}</p>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-text-secondary mb-3">No saved addresses yet.</p>
                        <button 
                          onClick={() => setActiveTab('addresses')}
                          className="inline-block border-2 border-accent-gold text-accent-gold hover:bg-accent-gold hover:text-white font-bold py-2 px-6 rounded-xl transition-all"
                        >
                          Add Address
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Orders Preview */}
                <div className="bg-surface rounded-2xl p-6 shadow-sm border border-accent-gold/20">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">Recent Orders</h3>
                    <Link to="/orderlist" className="text-sm font-semibold text-accent-gold hover:text-accent-gold transition-colors">
                      View All
                    </Link>
                  </div>
                  
                  {loadingOrders ? (
                    <div className="animate-pulse flex flex-col gap-4">
                      <div className="h-16 bg-transparent rounded-xl w-full"></div>
                      <div className="h-16 bg-transparent rounded-xl w-full"></div>
                    </div>
                  ) : errorOrders ? (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium">
                      {errorOrders}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8 bg-transparent rounded-xl">
                      <p className="text-text-secondary font-medium mb-4">You haven't placed any orders yet.</p>
                      <Link to="/" className="inline-block bg-surface hover:bg-slate-900 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-lg">
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-accent-gold/20 text-text-secondary text-sm">
                            <th className="pb-3 font-semibold">Order ID</th>
                            <th className="pb-3 font-semibold">Date</th>
                            <th className="pb-3 font-semibold">Total</th>
                            <th className="pb-3 font-semibold">Status</th>
                            <th className="pb-3 font-semibold text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFEBE4]">
                          {orders.map((order) => (
                            <tr key={order._id} className="hover:bg-transparent transition-colors">
                              <td className="py-4 font-medium text-sm text-text-primary">#{order._id.substring(0, 8)}</td>
                              <td className="py-4 text-sm text-text-secondary">{order.createdAt.substring(0, 10)}</td>
                              <td className="py-4 font-semibold">₹{order.totalPrice.toFixed(2)}</td>
                              <td className="py-4">
                                {order.isDelivered ? (
                                  <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
                                    Delivered
                                  </span>
                                ) : (
                                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
                                    Processing
                                  </span>
                                )}
                              </td>
                              <td className="py-4 text-right flex justify-end gap-2">
                                <button
                                  onClick={() => downloadInvoiceHandler(order._id)}
                                  className="text-sm font-semibold text-text-primary bg-surface border border-accent-gold/20 hover:border-accent-gold/50 px-3 py-2 rounded-lg transition-colors flex items-center"
                                  title="Download Invoice"
                                >
                                  <svg className="w-4 h-4 mr-1 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                  PDF
                                </button>
                                <Link 
                                  to={`/order/${order._id}`} 
                                  className="text-sm font-semibold text-accent-gold hover:text-accent-gold bg-accent-gold/10 hover:bg-accent-gold/20 px-4 py-2 rounded-lg transition-colors"
                                >
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
              </>
            )}
            {/* --- EDIT PROFILE TAB --- */}
            {activeTab === 'edit_profile' && (
              <div className="animate-fade-in bg-surface rounded-2xl p-6 md:p-8 shadow-sm border border-accent-gold/20">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className="md:hidden flex items-center gap-2 text-accent-gold font-semibold mb-6 hover:text-accent-gold-hover transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg> 
                  Back to Profile
                </button>
                <h2 className="text-2xl font-bold text-text-primary mb-6">Edit Profile</h2>
                


                <form onSubmit={updateProfileHandler} className="space-y-6 max-w-lg">
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">Full Name</label>
                    <input
                      type="text"
                      value={nameProfile}
                      onChange={(e) => setNameProfile(e.target.value)}
                      className="w-full px-5 py-4 rounded-xl bg-transparent border border-accent-gold/20 focus:bg-surface focus:ring-2 focus:ring-accent-gold outline-none transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">Email Address</label>
                    <input
                      type="email"
                      value={emailProfile}
                      onChange={(e) => setEmailProfile(e.target.value)}
                      className="w-full px-5 py-4 rounded-xl bg-transparent border border-accent-gold/20 focus:bg-surface focus:ring-2 focus:ring-accent-gold outline-none transition-all"
                      required
                    />
                  </div>

                  <div className="pt-6 mt-6 border-t border-accent-gold/20">
                    <h3 className="text-lg font-bold text-text-primary mb-4">Password Management</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-text-primary mb-2">Current Password</label>
                        <input
                          type="password"
                          placeholder="Required only if changing password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-5 py-4 rounded-xl bg-transparent border border-accent-gold/20 focus:bg-surface focus:ring-2 focus:ring-accent-gold outline-none transition-all"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-text-primary mb-2">New Password</label>
                          <input
                            type="password"
                            placeholder="Leave blank to keep current"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-5 py-4 rounded-xl bg-transparent border border-accent-gold/20 focus:bg-surface focus:ring-2 focus:ring-accent-gold outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-text-primary mb-2">Confirm New Password</label>
                          <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-5 py-4 rounded-xl bg-transparent border border-accent-gold/20 focus:bg-surface focus:ring-2 focus:ring-accent-gold outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loadingProfile}
                    className="bg-accent-gold hover:bg-accent-gold-hover text-white font-bold py-4 px-8 rounded-xl shadow-md transition-all disabled:opacity-70 flex items-center justify-center mt-4 w-full md:w-auto"
                  >
                    {loadingProfile ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </form>
              </div>
            )}
            
            {/* --- SAVED ADDRESSES TAB --- */}
            {activeTab === 'addresses' && (
              <div className="animate-fade-in bg-surface rounded-2xl p-6 md:p-8 shadow-sm border border-accent-gold/20">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className="md:hidden flex items-center gap-2 text-accent-gold font-semibold mb-6 hover:text-accent-gold-hover transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg> 
                  Back to Profile
                </button>
                <AddressManager />
              </div>
            )}
            
            {/* --- TRACK ORDERS TAB --- */}
            {activeTab === 'track_orders' && (
              <TrackOrderScreen setActiveTab={setActiveTab} />
            )}

            {/* --- REVIEWS TAB --- */}
            {activeTab === 'reviews' && (
              <UserReviewsScreen setActiveTab={setActiveTab} />
            )}

            {/* --- NOTIFICATIONS TAB --- */}
            {activeTab === 'notifications' && (
              <NotificationsScreen setActiveTab={setActiveTab} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountScreen;

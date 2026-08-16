import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../context/StoreContext';
import ProfileSidebar from '../components/ProfileSidebar'; // Can be removed later

const NotificationsScreen = ({ setActiveTab }) => {
  const { userInfo } = useContext(StoreContext);
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    fetchNotifications();
  }, [navigate, userInfo]);

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${userInfo.token}` }
  });

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/notifications', getAuthHeader());
      setNotifications(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`, {}, getAuthHeader());
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data } = await axios.put('/api/notifications/read-all', {}, getAuthHeader());
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIconForType = (type) => {
    switch(type) {
      case 'order':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
      case 'promo':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>;
      default:
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
  };

  return (
    <div className="animate-fade-in bg-surface rounded-2xl p-6 md:p-8 shadow-sm border border-accent-gold/20 flex flex-col gap-8">
      <button onClick={() => setActiveTab('overview')} className="md:hidden flex items-center gap-2 text-accent-gold font-semibold hover:text-accent-gold-hover transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        Back to Overview
      </button>
          <div className="flex justify-between items-end border-b border-accent-gold/10 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                All Notifications
                {unreadCount > 0 && (
                  <span className="bg-accent-gold text-bg-base text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} New
                  </span>
                )}
              </h2>
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-accent-gold hover:underline text-sm font-bold"
              >
                Mark all as read
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-gold"></div>
            </div>
          ) : error ? (
            <div className="bg-red-900/30 text-red-400 p-3 rounded">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-24 h-24 bg-accent-gold/5 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-accent-gold/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">No notifications</h3>
              <p className="text-text-secondary max-w-md">You're all caught up! When you have new alerts, order updates, or offers, they will appear here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {notifications.map((notif) => (
                <div 
                  key={notif._id} 
                  className={`p-5 rounded-lg border flex gap-4 ${
                    notif.isRead 
                      ? 'border-accent-gold/10 bg-bg-base opacity-75' 
                      : 'border-accent-gold/30 bg-surface shadow-md'
                  }`}
                >
                  <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notif.isRead ? 'bg-bg-base text-text-secondary' : 'bg-accent-gold/10 text-accent-gold'}`}>
                    {getIconForType(notif.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-4 mb-1">
                      <h4 className={`font-bold ${notif.isRead ? 'text-text-secondary' : 'text-text-primary'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-xs text-text-secondary whitespace-nowrap">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`text-sm ${notif.isRead ? 'text-text-secondary' : 'text-text-primary/90'}`}>
                      {notif.message}
                    </p>
                  </div>
                  
                  {!notif.isRead && (
                    <button 
                      onClick={() => markAsRead(notif._id)}
                      className="flex-shrink-0 self-center w-3 h-3 bg-accent-gold rounded-full"
                      title="Mark as read"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

    </div>
  );
};

export default NotificationsScreen;

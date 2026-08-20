import { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../context/StoreContext';

const NotificationBell = () => {
  const { userInfo } = useContext(StoreContext);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!userInfo) return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      const { data } = await axios.get('/api/notifications', config);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [userInfo]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      await axios.put(`/api/notifications/${id}/read`, {}, config);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      await axios.put('/api/notifications/read-all', {}, config);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  if (!userInfo) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-text-primary hover:text-accent-gold transition-colors focus:outline-none"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-bg-base">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface rounded-2xl shadow-xl border border-accent-gold/20 overflow-hidden z-50 animate-fade-in origin-top-right">
          <div className="flex justify-between items-center p-4 border-b border-accent-gold/10 bg-bg-base/50">
            <h3 className="font-serif font-bold text-lg text-text-primary">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs font-semibold text-accent-gold hover:text-accent-gold-hover transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-text-secondary flex flex-col items-center">
                <svg className="w-12 h-12 mb-3 text-accent-gold/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-accent-gold/10">
                {notifications.map(notif => (
                  <div 
                    key={notif._id} 
                    className={`p-4 transition-colors hover:bg-bg-base/30 ${!notif.isRead ? 'bg-accent-gold/5' : ''}`}
                    onClick={() => !notif.isRead && markAsRead(notif._id)}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {notif.type === 'order' ? (
                          <div className="w-8 h-8 rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notif.isRead ? 'font-bold text-text-primary' : 'font-medium text-text-secondary'}`}>
                          {notif.title}
                        </p>
                        <p className="text-sm text-text-secondary mt-1 whitespace-pre-wrap">{notif.message}</p>
                        <p className="text-xs text-text-primary/50 mt-2">
                          {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="flex-shrink-0 mt-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <Link 
            to="/account" 
            onClick={() => setIsOpen(false)}
            className="block w-full p-3 text-center text-sm font-semibold text-text-primary bg-bg-base/50 hover:bg-accent-gold hover:text-white transition-colors border-t border-accent-gold/10"
          >
            View all in Account
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

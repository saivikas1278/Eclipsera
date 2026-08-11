import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';

const ProfileSidebar = ({ activeTab = 'profile' }) => {
  const { userInfo, updateSession } = useContext(StoreContext);
  const navigate = useNavigate();

  const handleComingSoon = () => {
    alert("This feature is coming soon!");
  };

  const getTabClass = (tabName) => {
    return activeTab === tabName
      ? "text-left pl-14 py-2 pr-4 text-sm font-bold text-accent-gold bg-accent-gold/5 block w-full"
      : "text-left pl-14 py-2 pr-4 text-sm text-text-primary hover:text-accent-gold hover:bg-bg-base transition-colors block w-full";
  };

  return (
    <div className="hidden md:flex w-full md:w-[300px] flex-shrink-0 flex-col gap-4">
      {/* Top Profile Box */}
      <div className="bg-surface rounded-xl shadow-md border border-accent-gold/10 p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <p className="text-xs text-text-secondary">Hello,</p>
          <h3 className="text-lg font-bold text-text-primary">{userInfo?.firstName || userInfo?.name}</h3>
        </div>
      </div>

      {/* Navigation Menu Card */}
      <div className="bg-surface rounded-xl shadow-md border border-accent-gold/10 overflow-hidden flex flex-col">
        
        {/* Track My Order */}
        <Link to="/profile/track-orders" className="flex items-center justify-between p-4 border-b border-accent-gold/10 hover:bg-bg-base transition-colors group">
          <div className="flex items-center gap-4">
            <svg className="w-6 h-6 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span className="font-bold text-text-primary group-hover:text-accent-gold transition-colors">Track My Order</span>
          </div>
          <svg className="w-5 h-5 text-text-secondary group-hover:text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </Link>

        {/* Account Settings */}
        <div className="border-b border-accent-gold/10">
          <div className="flex items-center gap-4 p-4 pb-2">
            <svg className="w-6 h-6 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <span className="font-bold text-text-secondary uppercase tracking-wider text-xs">Account Settings</span>
          </div>
          <div className="flex flex-col pb-2">
            <Link to="/profile" className={getTabClass('profile')}>Profile Information</Link>
            <Link to="/profile/addresses" className={getTabClass('addresses')}>Manage Addresses</Link>
            <button onClick={handleComingSoon} className={getTabClass('panCard')}>PAN Card Information</button>
          </div>
        </div>

        {/* Payments */}
        <div className="border-b border-accent-gold/10">
          <div className="flex items-center gap-4 p-4 pb-2">
            <svg className="w-6 h-6 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            <span className="font-bold text-text-secondary uppercase tracking-wider text-xs">Payments</span>
          </div>
          <div className="flex flex-col pb-2">
            <button onClick={handleComingSoon} className={getTabClass('giftCards')}>Gift Cards</button>
            <button onClick={handleComingSoon} className={getTabClass('upi')}>Saved UPI</button>
            <button onClick={handleComingSoon} className={getTabClass('savedCards')}>Saved Cards</button>
          </div>
        </div>

        {/* My Stuff */}
        <div>
          <div className="flex items-center gap-4 p-4 pb-2">
            <svg className="w-6 h-6 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
            <span className="font-bold text-text-secondary uppercase tracking-wider text-xs">My Stuff</span>
          </div>
          <div className="flex flex-col pb-2">
            <Link to="/profile/reviews" className={getTabClass('reviews')}>My Reviews & Ratings</Link>
            <Link to="/profile/notifications" className={getTabClass('notifications')}>All Notifications</Link>
            <Link to="/wishlist" className={getTabClass('wishlist')}>My Wishlist</Link>
          </div>
        </div>

        {/* Logout */}
        <div onClick={() => {
          updateSession(null);
          navigate('/login');
        }} className="border-t border-accent-gold/10 p-4 hover:bg-bg-base transition-colors cursor-pointer group">
          <div className="flex items-center gap-4">
            <svg className="w-6 h-6 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span className="font-bold text-text-primary group-hover:text-accent-gold transition-colors">Logout</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfileSidebar;

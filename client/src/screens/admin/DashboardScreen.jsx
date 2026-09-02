import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';

const DashboardScreen = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { userInfo } = useContext(StoreContext);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        // Fetch stats and recent orders in parallel
        const [statsResponse, ordersResponse] = await Promise.all([
          axios.get('/api/admin/stats', config),
          axios.get('/api/orders', config)
        ]);
        
        setStats(statsResponse.data);
        // Take the 5 most recent orders for the activity feed
        setRecentOrders(ordersResponse.data.slice(0, 5));
        setError('');
      } catch (err) {
        setError(
          err.response && err.response.data.message
            ? err.response.data.message
            : err.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userInfo]);

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
      <div className="bg-accent-gold/10 border border-accent-gold/20 text-accent-gold px-5 py-4 rounded-xl mb-6 font-medium">
        {error}
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-serif font-extrabold text-text-primary mb-8 tracking-tight flex items-center gap-3">
        <svg className="w-8 h-8 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        Admin Dashboard
      </h1>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Revenue Card */}
        <div className="bg-surface/60 backdrop-blur-xl border border-accent-gold/20 hover:border-accent-gold/50 hover:-translate-y-1 transition-all duration-300 rounded-3xl p-6 text-text-primary shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col justify-between h-48 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-24 h-24 text-accent-gold" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
          </div>
          <div className="flex justify-between items-start relative z-10">
            <h3 className="text-text-secondary font-bold text-xs uppercase tracking-widest">Total Revenue</h3>
            <div className="w-10 h-10 rounded-full bg-accent-gold/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-4xl font-black font-serif tracking-tight">₹{stats?.totalRevenue?.toFixed(2)}</p>
            <div className="flex items-center gap-2 mt-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              <span className="text-xs font-bold text-green-500">+14.5% from last month</span>
            </div>
          </div>
          {/* Sparkline */}
          <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30">
             <svg viewBox="0 0 100 25" className="w-full h-full" preserveAspectRatio="none"><path d="M0 25 L10 15 L20 20 L30 5 L40 10 L50 2 L60 8 L70 0 L80 5 L90 2 L100 0 V25 Z" fill="url(#grad1)" /><defs><linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#D4AF37" stopOpacity="1" /><stop offset="100%" stopColor="#D4AF37" stopOpacity="0" /></linearGradient></defs></svg>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-surface/60 backdrop-blur-xl border border-accent-gold/20 hover:border-accent-gold/50 hover:-translate-y-1 transition-all duration-300 rounded-3xl p-6 text-text-primary shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col justify-between h-48 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-24 h-24 text-accent-gold" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
          </div>
          <div className="flex justify-between items-start relative z-10">
            <h3 className="text-text-secondary font-bold text-xs uppercase tracking-widest">Total Orders</h3>
            <div className="w-10 h-10 rounded-full bg-accent-gold/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-4xl font-black font-serif tracking-tight">{stats?.totalOrders}</p>
            <div className="flex items-center gap-2 mt-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              <span className="text-xs font-bold text-green-500">+5.2% from last month</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30">
             <svg viewBox="0 0 100 25" className="w-full h-full" preserveAspectRatio="none"><path d="M0 25 L10 20 L20 18 L30 15 L40 10 L50 12 L60 8 L70 5 L80 2 L90 5 L100 0 V25 Z" fill="url(#grad2)" /><defs><linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#D4AF37" stopOpacity="1" /><stop offset="100%" stopColor="#D4AF37" stopOpacity="0" /></linearGradient></defs></svg>
          </div>
        </div>

        {/* Users Card */}
        <div className="bg-surface/60 backdrop-blur-xl border border-accent-gold/20 hover:border-accent-gold/50 hover:-translate-y-1 transition-all duration-300 rounded-3xl p-6 text-text-primary shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col justify-between h-48 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <svg className="w-24 h-24 text-accent-gold" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          </div>
          <div className="flex justify-between items-start relative z-10">
            <h3 className="text-text-secondary font-bold text-xs uppercase tracking-widest">Total Users</h3>
            <div className="w-10 h-10 rounded-full bg-accent-gold/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-4xl font-black font-serif tracking-tight">{stats?.totalUsers}</p>
            <div className="flex items-center gap-2 mt-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              <span className="text-xs font-bold text-green-500">+12% new users</span>
            </div>
          </div>
        </div>

        {/* Products Card */}
        <div className="bg-surface/60 backdrop-blur-xl border border-accent-gold/20 hover:border-accent-gold/50 hover:-translate-y-1 transition-all duration-300 rounded-3xl p-6 text-text-primary shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col justify-between h-48 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-24 h-24 text-accent-gold" fill="currentColor" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          </div>
          <div className="flex justify-between items-start relative z-10">
            <h3 className="text-text-secondary font-bold text-xs uppercase tracking-widest">Total Products</h3>
            <div className="w-10 h-10 rounded-full bg-accent-gold/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-4xl font-black font-serif tracking-tight">{stats?.totalProducts}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-bold text-text-secondary">Across all categories</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Live Activity Feed */}
        <div className="bg-surface/80 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-accent-gold/20 p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-accent-gold/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent-gold/10 rounded-lg">
                <svg className="w-6 h-6 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h2 className="text-2xl font-serif font-bold text-text-primary">Live Activity Feed</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Live</span>
            </div>
          </div>
          
          <div className="flex-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-text-secondary text-sm">No recent activity.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {recentOrders.map((order, idx) => (
                  <div key={order._id} className="relative pl-6 border-l-2 border-accent-gold/20 pb-2 last:pb-0 group">
                    <div className="absolute w-3 h-3 bg-bg-base border-2 border-accent-gold rounded-full -left-[7.5px] top-1.5 group-hover:scale-125 group-hover:bg-accent-gold transition-all"></div>
                    <div className="bg-bg-base/50 p-4 rounded-2xl border border-accent-gold/10 hover:border-accent-gold/30 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-bold text-text-primary">
                          New Order Placed
                        </h4>
                        <span className="text-xs text-text-secondary font-medium whitespace-nowrap ml-2">
                          {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary mb-3">
                        <span className="font-bold text-text-primary">{order.user?.name || 'Guest'}</span> purchased <span className="font-bold text-accent-gold">₹{order.totalPrice.toFixed(2)}</span> worth of items.
                      </p>
                      <Link 
                        to={`/order/${order._id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-accent-gold hover:text-accent-gold-hover uppercase tracking-wider"
                      >
                        View Order
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-surface/80 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-accent-gold/20 p-8">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-accent-gold/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-serif font-bold text-text-primary">Low Stock Alerts</h2>
            </div>
            <span className="text-xs font-bold bg-accent-gold/20 text-accent-gold px-3 py-1 rounded-full">{stats?.lowStockItems?.length || 0} items</span>
          </div>
          
          {stats?.lowStockItems?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-bg-base/50 rounded-2xl border border-accent-gold/10">
              <svg className="w-16 h-16 text-green-500/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <h3 className="text-lg font-bold text-text-primary mb-1">Inventory Healthy</h3>
              <p className="text-text-secondary text-sm">All products have sufficient stock levels.</p>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar rounded-2xl border border-accent-gold/10 bg-bg-base/30">
              <table className="w-full text-left border-collapse">
                <thead className="hidden md:table-header-group">
                  <tr className="bg-surface text-text-primary/70 text-xs uppercase tracking-widest border-b border-accent-gold/10">
                    <th className="p-5 font-bold">Product Name</th>
                    <th className="p-5 font-bold text-center">Current Stock</th>
                    <th className="p-5 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-accent-gold/5">
                  {stats.lowStockItems.map((product) => (
                    <tr key={product._id} className="block md:table-row hover:bg-accent-gold/5 transition-colors mb-4 md:mb-0 bg-transparent overflow-hidden group">
                      <td className="block md:table-cell p-5 text-text-primary font-medium">
                        <div className="flex items-center justify-between md:block">
                          <span className="md:hidden font-bold text-xs uppercase tracking-wider text-text-secondary">Product</span>
                          <Link to={`/product/${product._id}`} className="hover:text-accent-gold font-bold transition-colors truncate max-w-xs block">
                            {product.name}
                          </Link>
                        </div>
                      </td>
                      <td className="block md:table-cell p-5 text-center">
                        <div className="flex items-center justify-between md:justify-center">
                          <span className="md:hidden font-bold text-xs uppercase tracking-wider text-text-secondary">Stock</span>
                          <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-black bg-red-500/10 text-red-500 border border-red-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                            {product.countInStock} LEFT
                          </span>
                        </div>
                      </td>
                      <td className="block md:table-cell p-5 text-right">
                        <div className="flex items-center justify-between md:justify-end">
                          <span className="md:hidden font-bold text-xs uppercase tracking-wider text-text-secondary">Action</span>
                          <Link
                            to={`/admin/product/${product._id}/edit`}
                            className="inline-flex items-center gap-2 bg-accent-gold/10 text-accent-gold hover:bg-accent-gold hover:text-bg-base px-4 py-2 rounded-lg text-xs font-bold transition-all"
                          >
                            Restock
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;

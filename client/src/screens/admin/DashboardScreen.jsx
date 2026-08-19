import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';

const DashboardScreen = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { userInfo } = useContext(StoreContext);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const { data } = await axios.get('/api/admin/stats', config);
        setStats(data);
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

    fetchStats();
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
      <h1 className="text-3xl font-serif font-extrabold text-text-primary mb-8">Admin Dashboard</h1>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Revenue Card */}
        <div className="bg-surface border border-accent-gold/20 hover:scale-[1.02] transition-transform duration-300 rounded-2xl p-6 text-text-primary shadow-lg flex flex-col justify-between h-40 group">
          <div className="flex justify-between items-start">
            <h3 className="text-text-secondary font-semibold text-lg uppercase tracking-wider">Total Revenue</h3>
            <svg className="w-8 h-8 text-accent-gold opacity-80 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-4xl font-bold font-serif">₹{stats?.totalRevenue?.toFixed(2)}</p>
        </div>

        {/* Orders Card */}
        <div className="bg-surface border border-accent-gold/20 hover:scale-[1.02] transition-transform duration-300 rounded-2xl p-6 text-text-primary shadow-lg flex flex-col justify-between h-40 group">
          <div className="flex justify-between items-start">
            <h3 className="text-text-secondary font-semibold text-lg uppercase tracking-wider">Total Orders</h3>
            <svg className="w-8 h-8 text-accent-gold opacity-80 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-4xl font-bold font-serif">{stats?.totalOrders}</p>
        </div>

        {/* Users Card */}
        <div className="bg-surface border border-accent-gold/20 hover:scale-[1.02] transition-transform duration-300 rounded-2xl p-6 text-text-primary shadow-lg flex flex-col justify-between h-40 group">
          <div className="flex justify-between items-start">
            <h3 className="text-text-secondary font-semibold text-lg uppercase tracking-wider">Total Users</h3>
            <svg className="w-8 h-8 text-accent-gold opacity-80 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-4xl font-bold font-serif">{stats?.totalUsers}</p>
        </div>

        {/* Products Card */}
        <div className="bg-surface border border-accent-gold/20 hover:scale-[1.02] transition-transform duration-300 rounded-2xl p-6 text-text-primary shadow-lg flex flex-col justify-between h-40 group">
          <div className="flex justify-between items-start">
            <h3 className="text-text-secondary font-semibold text-lg uppercase tracking-wider">Total Products</h3>
            <svg className="w-8 h-8 text-accent-gold opacity-80 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-4xl font-bold font-serif">{stats?.totalProducts}</p>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-surface rounded-3xl shadow-sm border border-accent-gold/20 p-8">
        <div className="flex items-center gap-3 mb-6 border-b border-accent-gold/20 pb-4">
          <svg className="w-6 h-6 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-serif font-bold text-text-primary">Low Stock Alerts</h2>
        </div>
        
        {stats?.lowStockItems?.length === 0 ? (
          <div className="text-text-primary/60 italic bg-surface p-6 rounded-xl text-center">
            All products have sufficient stock levels!
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="hidden md:table-header-group">
                <tr className="bg-surface text-text-primary/80 text-sm uppercase tracking-wider">
                  <th className="p-4 rounded-tl-xl font-semibold">Product Name</th>
                  <th className="p-4 font-semibold">Current Stock</th>
                  <th className="p-4 rounded-tr-xl font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-accent-gold/10">
                {stats.lowStockItems.map((product) => (
                  <tr key={product._id} className="block md:table-row hover:bg-accent-gold/5 transition-colors mb-4 md:mb-0 border border-accent-gold/20 md:border-none rounded-xl md:rounded-none bg-surface md:bg-transparent overflow-hidden shadow-sm md:shadow-none">
                    <td className="block md:table-cell p-4 text-text-primary font-medium border-b border-accent-gold/10 md:border-none">
                      <div className="flex items-center justify-between md:block">
                        <span className="md:hidden font-bold text-xs uppercase tracking-wider text-text-secondary">Product Name</span>
                        <Link to={`/product/${product._id}`} className="hover:text-accent-gold transition-colors break-words">
                          {product.name}
                        </Link>
                      </div>
                    </td>
                    <td className="block md:table-cell p-4 border-b border-accent-gold/10 md:border-none">
                      <div className="flex items-center justify-between md:block">
                        <span className="md:hidden font-bold text-xs uppercase tracking-wider text-text-secondary">Current Stock</span>
                        <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-sm font-bold bg-accent-gold/10 text-accent-gold">
                          <span className="w-2 h-2 rounded-full bg-accent-gold"></span>
                          {product.countInStock}
                        </span>
                      </div>
                    </td>
                    <td className="block md:table-cell p-4 text-right">
                      <div className="flex items-center justify-between md:justify-end">
                        <span className="md:hidden font-bold text-xs uppercase tracking-wider text-text-secondary">Action</span>
                        <Link
                          to={`/admin/product/${product._id}/edit`}
                          className="inline-flex items-center gap-2 bg-surface border border-accent-gold/20 hover:border-accent-gold hover:text-accent-gold px-4 py-2 min-h-12 rounded-lg text-sm font-medium transition-all shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Edit
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
  );
};

export default DashboardScreen;

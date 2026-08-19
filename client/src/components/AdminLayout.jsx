import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Storefront', path: '/admin/storefront', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { name: 'Products', path: '/admin/productlist', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { name: 'Orders', path: '/admin/orderlist', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { name: 'Refunds', path: '/admin/refunds', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
    { name: 'Users', path: '/admin/userlist', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' }
  ];

  return (
    <div className="flex h-full min-h-[80vh] flex-col md:flex-row rounded-3xl overflow-hidden shadow-sm border border-accent-gold/20 bg-surface">
      {/* Mobile Toggle Button */}
      <div className="md:hidden bg-bg-base/95 backdrop-blur-md border-b border-accent-gold/20 p-4 flex justify-between items-center z-20">
        <span className="font-bold tracking-widest text-accent-gold uppercase">Admin Panel</span>
        <button onClick={toggleSidebar} className="focus:outline-none hover:text-accent-gold min-h-12 min-w-12 flex items-center justify-center text-text-primary transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isSidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-surface border-r border-accent-gold/10 text-text-secondary flex-shrink-0 transition-all duration-300 z-10`}
      >
        <div className="p-6 hidden md:block border-b border-accent-gold/10">
          <h2 className="text-lg font-extrabold tracking-widest text-accent-gold uppercase">Back Office</h2>
        </div>
        <nav className="p-4 space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setIsSidebarOpen(false)} // Close on mobile click
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 min-h-12 rounded-xl transition-all duration-200 font-medium ${
                  isActive
                    ? 'bg-accent-gold/10 text-accent-gold border border-accent-gold/20 shadow-sm'
                    : 'hover:bg-accent-gold/5 hover:text-accent-gold text-text-secondary'
                }`
              }
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon} />
              </svg>
              {link.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-3 md:p-8 overflow-y-auto bg-bg-base">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

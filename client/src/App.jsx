import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useContext, useEffect, Suspense, lazy } from 'react';
import axios from 'axios';
import { StoreContext } from './context/StoreContext';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import MobileBottomNav from './components/MobileBottomNav';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';

const HomeScreen = lazy(() => import('./screens/HomeScreen'));
const ProductScreen = lazy(() => import('./screens/ProductScreen'));
const CartScreen = lazy(() => import('./screens/CartScreen'));
const LoginScreen = lazy(() => import('./screens/LoginScreen'));
const RegisterScreen = lazy(() => import('./screens/RegisterScreen'));
const ShippingScreen = lazy(() => import('./screens/ShippingScreen'));
const PlaceOrderScreen = lazy(() => import('./screens/PlaceOrderScreen'));
const OrderScreen = lazy(() => import('./screens/OrderScreen'));
const WishlistScreen = lazy(() => import('./screens/WishlistScreen'));
const OrderListScreen = lazy(() => import('./screens/admin/OrderListScreen'));
const ProductListScreen = lazy(() => import('./screens/admin/ProductListScreen'));
const ProductEditScreen = lazy(() => import('./screens/admin/ProductEditScreen'));
const RefundQueueScreen = lazy(() => import('./screens/admin/RefundQueueScreen'));
const DashboardScreen = lazy(() => import('./screens/admin/DashboardScreen'));
const UserListScreen = lazy(() => import('./screens/admin/UserListScreen'));
const UserEditScreen = lazy(() => import('./screens/admin/UserEditScreen'));
const AccountScreen = lazy(() => import('./screens/AccountScreen'));
const NotFoundScreen = lazy(() => import('./screens/NotFoundScreen'));

function App() {
  const { handleLogout } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          handleLogout();
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate, handleLogout]);

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans text-text-primary selection:bg-accent-gold/20 selection:text-accent-gold">
      <ScrollToTop />
      <Toaster
        position="bottom-center"
        toastOptions={{
          className: 'z-[9999]',
          style: {
            background: '#18181b',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid rgba(212, 175, 55, 0.2)'
          },
          success: {
            iconTheme: {
              primary: '#d4af37',
              secondary: '#18181b',
            },
          },
        }}
      />
      {!isAuthPage && <Header />}
      <main className={`flex-grow container mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-7xl ${isAuthPage ? '' : 'py-8'}`}>
        <Suspense fallback={
          <div className="w-full flex flex-col gap-8 p-4 md:p-8 animate-fade-in">
            <div className="w-full h-12 bg-zinc-800/50 animate-pulse rounded-xl mb-8"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <div className="w-full h-64 md:h-80 bg-zinc-800/50 animate-pulse rounded-2xl"></div>
                  <div className="w-3/4 h-6 bg-zinc-800/50 animate-pulse rounded"></div>
                  <div className="w-1/2 h-6 bg-zinc-800/50 animate-pulse rounded"></div>
                </div>
              ))}
            </div>
          </div>
        }>
          <Routes>
            {/* --- PUBLIC ROUTES --- */}
            <Route path="/" element={<HomeScreen />} />
            <Route path="/product/:id" element={<ProductScreen />} />
            <Route path="/cart" element={<CartScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/wishlist" element={<WishlistScreen />} />

            {/* --- PRIVATE ROUTES (LOGGED IN USERS) --- */}
            <Route path="" element={<PrivateRoute />}>
              <Route path="/shipping" element={<ShippingScreen />} />
              <Route path="/placeorder" element={<PlaceOrderScreen />} />
              <Route path="/account" element={<AccountScreen />} />
              <Route path="/order/:id" element={<OrderScreen />} />
            </Route>

            {/* --- ADMIN ROUTES --- */}
            <Route path="" element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<DashboardScreen />} />
                <Route path="userlist" element={<UserListScreen />} />
                <Route path="user/:id/edit" element={<UserEditScreen />} />
                <Route path="orderlist" element={<OrderListScreen />} />
                <Route path="refunds" element={<RefundQueueScreen />} />
                <Route path="productlist" element={<ProductListScreen />} />
                <Route path="product/:id/edit" element={<ProductEditScreen />} />
              </Route>
            </Route>

            {/* --- 404 CATCH-ALL ROUTE --- */}
            <Route path="*" element={<NotFoundScreen />} />
          </Routes>
        </Suspense>
      </main>
      {!isAuthPage && <Footer />}
      {!isAuthPage && <MobileBottomNav />}
    </div>
  );
}

export default App;

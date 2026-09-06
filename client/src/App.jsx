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
import WhatsAppWidget from './components/WhatsAppWidget';

const HomeScreen = lazy(() => import('./screens/HomeScreen'));
const ProductScreen = lazy(() => import('./screens/ProductScreen'));
const CartScreen = lazy(() => import('./screens/CartScreen'));
const LoginScreen = lazy(() => import('./screens/LoginScreen'));
const ForgotPasswordScreen = lazy(() => import('./screens/ForgotPasswordScreen'));
const ResetPasswordScreen = lazy(() => import('./screens/ResetPasswordScreen'));
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
const AdminStorefrontScreen = lazy(() => import('./screens/admin/AdminStorefrontScreen'));
const UserListScreen = lazy(() => import('./screens/admin/UserListScreen'));
const UserEditScreen = lazy(() => import('./screens/admin/UserEditScreen'));
const AccountScreen = lazy(() => import('./screens/AccountScreen'));
const SearchScreen = lazy(() => import('./screens/SearchScreen'));
const AboutScreen = lazy(() => import('./screens/AboutScreen'));
const FAQScreen = lazy(() => import('./screens/FAQScreen'));
const ShippingPolicyScreen = lazy(() => import('./screens/ShippingPolicyScreen'));
const CareGuideScreen = lazy(() => import('./screens/CareGuideScreen'));
const ContactScreen = lazy(() => import('./screens/ContactScreen'));
const NotFoundScreen = lazy(() => import('./screens/NotFoundScreen'));

function App() {
  const { handleLogout } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password' || location.pathname.startsWith('/reset-password');
  const isAdminPage = location.pathname.startsWith('/admin');

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
    <div className="min-h-screen bg-transparent flex flex-col font-sans text-text-primary selection:bg-accent-gold/20 selection:text-accent-gold overflow-x-hidden max-w-[100vw]">
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
            border: '1px solid rgba(212, 175, 55, 0.2)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            fontFamily: '"Inter", sans-serif'
          },
          success: {
            iconTheme: {
              primary: '#d4af37',
              secondary: '#18181b',
            },
          },
        }}
      />
      <WhatsAppWidget />
      {!isAuthPage && <Header />}
      <main className={`flex-grow container mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-7xl pb-24 md:pb-8 ${isAuthPage ? '' : 'pt-8'}`}>
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
          <div key={location.pathname} className="animate-fade-in">
            <Routes location={location}>
              {/* --- PUBLIC ROUTES --- */}
            <Route path="/" element={<HomeScreen />} />
            <Route path="/search" element={<SearchScreen />} />
            <Route path="/product/:id" element={<ProductScreen />} />
            <Route path="/cart" element={<CartScreen />} />
            
            {/* --- STATIC PAGES --- */}
            <Route path="/about" element={<AboutScreen />} />
            <Route path="/faq" element={<FAQScreen />} />
            <Route path="/shipping-policy" element={<ShippingPolicyScreen />} />
            <Route path="/care-guide" element={<CareGuideScreen />} />
            <Route path="/contact" element={<ContactScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
            <Route path="/reset-password/:token" element={<ResetPasswordScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/wishlist" element={<WishlistScreen />} />

            {/* --- CHECKOUT ROUTES (GUESTS + LOGGED IN) --- */}
            <Route path="/shipping" element={<ShippingScreen />} />
            <Route path="/placeorder" element={<PlaceOrderScreen />} />
            <Route path="/order/:id" element={<OrderScreen />} />

            {/* --- PRIVATE ROUTES (LOGGED IN USERS) --- */}
            <Route path="" element={<PrivateRoute />}>
              <Route path="/account" element={<AccountScreen />} />
            </Route>

            {/* --- ADMIN ROUTES --- */}
            <Route path="" element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<DashboardScreen />} />
                <Route path="storefront" element={<AdminStorefrontScreen />} />
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
          </div>
        </Suspense>
      </main>

      {/* Floating WhatsApp Support Bubble */}
      {!isAuthPage && !isAdminPage && (
        <a 
          href="https://wa.me/919876543210" 
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed bottom-[80px] md:bottom-6 right-4 md:right-6 z-[60] bg-[#25D366] hover:bg-[#128C7E] text-white p-3 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center animate-fade-in"
          aria-label="Chat on WhatsApp"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824v.001zM20.11 3.888C15.694-.527 8.527-.527 4.11 3.888c-4.417 4.416-4.417 11.583 0 15.999l-1.328 4.855 4.97-1.306c2.04 1.093 4.316 1.666 6.643 1.666 7.643 0 13.844-6.202 13.844-13.844 0-3.699-1.44-7.176-4.053-9.789l-.076-.081zM12 23.111c-2.198 0-4.32-.57-6.206-1.644l-.445-.254-3.13.823.839-3.053-.279-.444A11.966 11.966 0 011.83 12.002c0-6.617 5.383-12 12-12s12 5.383 12 12-5.383 12-12 11.109z"/></svg>
        </a>
      )}

      {!isAuthPage && <Footer />}
      {!isAuthPage && <MobileBottomNav />}
    </div>
  );
}

export default App;

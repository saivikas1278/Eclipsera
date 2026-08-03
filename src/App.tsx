import React, { useState } from 'react';
import { AdminProvider, useAdmin } from './admin/context/AdminContext';
import { UserProvider, useUser } from './user/context/UserContext';

// Import Admin views
import { AdminLoginView } from './admin/views/AdminLoginView';
import { AdminDashboardView } from './admin/views/AdminDashboardView';

// Import User views
import { HomeView } from './user/views/HomeView';
import { ShopView } from './user/views/ShopView';
import { ProductDetailView } from './user/views/ProductDetailView';
import { CheckoutView } from './user/views/CheckoutView';
import { OrderConfirmationView } from './user/views/OrderConfirmationView';
import { TrackOrderView } from './user/views/TrackOrderView';
import { WishlistView } from './user/views/WishlistView';
import { ArtisanStoriesView } from './user/views/ArtisanStoriesView';
import { AboutView } from './user/views/AboutView';
import { AuthView } from './user/views/AuthView';
import { RegisterView } from './user/views/RegisterView';
import { AccountView } from './user/views/AccountView';

// Import new User views
import { CategoryView } from './user/views/CategoryView';
import { SearchView } from './user/views/SearchView';
import { ArtisanProfileView } from './user/views/ArtisanProfileView';
import { NewArrivalsView } from './user/views/NewArrivalsView';
import { BestSellersView } from './user/views/BestSellersView';
import { SaleOffersView } from './user/views/SaleOffersView';
import { GiftGuideView } from './user/views/GiftGuideView';
import { CompareView } from './user/views/CompareView';
import { CartView } from './user/views/CartView';
import { PaymentFailedView } from './user/views/PaymentFailedView';
import { OrderDetailView } from './user/views/OrderDetailView';
import { OrderTrackingView } from './user/views/OrderTrackingView';
import { ReturnRequestView } from './user/views/ReturnRequestView';
import { ArtisansDirectoryView } from './user/views/ArtisansDirectoryView';
import { HowItWorksView } from './user/views/HowItWorksView';
import { SustainabilityView } from './user/views/SustainabilityView';
import { BlogListView } from './user/views/BlogListView';
import { BlogPostDetailView } from './user/views/BlogPostDetailView';
import { FaqsView } from './user/views/FaqsView';
import { ContactView } from './user/views/ContactView';
import { PolicyPagesView } from './user/views/PolicyPagesView';
import { NotFoundView } from './user/views/NotFoundView';
import { MaintenanceView } from './user/views/MaintenanceView';

// Import User components
import { Header } from './user/components/common/Header';
import { BottomMobileNav } from './user/components/common/BottomMobileNav';
import { CartDrawer } from './user/components/cart/CartDrawer';
import { SplashScreen } from './user/components/common/SplashScreen';

// Import Shared components
import { ToastContainer } from './shared/components/ToastContainer';
import { AuthModal } from './user/components/auth/AuthModal';

const AdminApp: React.FC = () => {
  const { isAdminLoggedIn } = useAdmin();
  return (
    <div className="min-h-screen bg-obsidian-900 text-cream-100 selection:bg-gold-500 selection:text-obsidian-900">
      {isAdminLoggedIn ? <AdminDashboardView /> : <AdminLoginView />}
      <ToastContainer />
    </div>
  );
};

const UserApp: React.FC = () => {
  const { currentView, setCurrentView, isCustomerLoggedIn } = useUser();
  const [showSplash, setShowSplash] = useState(() => {
    // If user is already logged in, skip splash screen automatically!
    try {
      return !localStorage.getItem('eclipsera_user');
    } catch (e) {
      return true;
    }
  });

  // If user is already logged in and navigates to auth/login/register, stay logged in and redirect to home
  React.useEffect(() => {
    if (isCustomerLoggedIn && (currentView === 'auth' || currentView === 'login' || currentView === 'register')) {
      setCurrentView('home');
    }
  }, [isCustomerLoggedIn, currentView, setCurrentView]);

  if (showSplash) {
    return (
      <SplashScreen 
        onEnter={() => {
          setShowSplash(false);
          if (isCustomerLoggedIn) {
            setCurrentView('home');
          } else {
            setCurrentView('auth');
          }
        }} 
      />
    );
  }

  const isAuthView = currentView === 'auth' || currentView === 'login' || currentView === 'register';
  const shouldHideNav = isAuthView;

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'shop':
        return <ShopView />;
      case 'product-detail':
        return <ProductDetailView />;
      case 'checkout':
        return <CheckoutView />;
      case 'order-confirmation':
        return <OrderConfirmationView />;
      case 'track-order':
        return <TrackOrderView />;
      case 'wishlist':
        return <WishlistView />;
      case 'artisan-stories':
        return <ArtisanStoriesView />;
      case 'about':
        return <AboutView />;
      case 'auth':
      case 'login':
        return <AuthView />;
      case 'register':
        return <RegisterView />;
      case 'account':
        return <AccountView />;
      case 'category':
        return <CategoryView />;
      case 'search':
        return <SearchView />;
      case 'artisan-profile':
        return <ArtisanProfileView />;
      case 'new-arrivals':
        return <NewArrivalsView />;
      case 'best-sellers':
        return <BestSellersView />;
      case 'sale':
        return <SaleOffersView />;
      case 'gift-guide':
        return <GiftGuideView />;
      case 'compare':
        return <CompareView />;
      case 'cart':
        return <CartView />;
      case 'payment-failed':
        return <PaymentFailedView />;
      case 'order-detail':
        return <OrderDetailView />;
      case 'order-tracking':
        return <OrderTrackingView />;
      case 'return-request':
        return <ReturnRequestView />;
      case 'artisans':
        return <ArtisansDirectoryView />;
      case 'how-it-works':
        return <HowItWorksView />;
      case 'sustainability':
        return <SustainabilityView />;
      case 'blog':
        return <BlogListView />;
      case 'blog-post':
        return <BlogPostDetailView />;
      case 'faqs':
        return <FaqsView />;
      case 'contact':
        return <ContactView />;
      case 'policy':
        return <PolicyPagesView />;
      case '404':
        return <NotFoundView />;
      default:
        return <HomeView />;
    }
  };

  const { maintenanceMode } = useUser();
  if (maintenanceMode) {
    return <MaintenanceView />;
  }

  return (
    <div className={`min-h-screen flex flex-col justify-between bg-cream-100 text-obsidian-900 selection:bg-gold-500 selection:text-white ${shouldHideNav ? 'pb-0' : 'pb-20 md:pb-0'}`}>
      <div>
        {!shouldHideNav && <Header />}
        <main>{renderView()}</main>
      </div>
      {!shouldHideNav && <BottomMobileNav />}
      <CartDrawer />
      <AuthModal />
      <ToastContainer />
    </div>
  );
};

export function App() {
  const isAdminRoute = 
    window.location.pathname.startsWith('/admin') || 
    window.location.search.includes('portal=admin') || 
    window.location.hash.startsWith('#admin');

  if (isAdminRoute) {
    return (
      <UserProvider>
        <AdminProvider>
          <AdminApp />
        </AdminProvider>
      </UserProvider>
    );
  }

  return (
    <UserProvider>
      <UserApp />
    </UserProvider>
  );
}

export default App;

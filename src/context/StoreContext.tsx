import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS, CATEGORIES, HERO_SLIDES, INITIAL_ORDERS, INITIAL_COUPONS, Product, Order, Coupon } from '../data/mockData';
import confetti from 'canvas-confetti';

export interface CartItem {
  product: Product;
  variantId: string;
  colorName: string;
  size?: string;
  quantity: number;
  unitPrice: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  role: 'customer' | 'admin';
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface StoreContextType {
  // Navigation & View
  currentView: string;
  setCurrentView: (view: string) => void;
  selectedProductSlug: string | null;
  openProductDetail: (slug: string) => void;
  lastPlacedOrder: Order | null;

  // Storefront Data
  products: Product[];
  categories: typeof CATEGORIES;
  heroSlides: typeof HERO_SLIDES;

  // Customer Authentication
  currentUser: UserProfile | null;
  isCustomerLoggedIn: boolean;
  customerLogin: (emailOrPhone: string, password?: string) => Promise<{ success: boolean; message: string }> | any;
  customerGoogleLogin: (googleTokenOrUser: string | { email: string; name: string }) => Promise<{ success: boolean; message: string }>;
  customerRegister: (name: string, email: string, phone: string, password?: string) => Promise<{ success: boolean; message: string }> | any;
  customerLogout: () => void;
  requestOTP: (phone: string) => { success: boolean; message: string; demoOTP: string };
  verifyOTP: (phone: string, otp: string) => Promise<{ success: boolean; message: string }> | any;
  updateCustomerProfile: (profileData: Partial<UserProfile>) => void;

  // Cart & Buy Now
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, variantId: string, quantity?: number) => void;
  buyNow: (product: Product, variantId: string, quantity?: number) => void;
  removeFromCart: (variantId: string) => void;
  updateCartQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  subtotal: number;
  mrpTotal: number;
  savingsFromMRP: number;
  discountTotal: number;
  totalSavings: number;
  shippingFee: number;
  taxTotal: number;
  grandTotal: number;
  freeShippingThreshold: number;

  // Wishlist
  wishlist: string[]; // Product IDs
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Orders & Checkout
  orders: Order[];
  placeOrder: (shippingDetails: any, paymentMethod: string) => Order;
  updateOrderStatus: (orderId: string, newStatus: Order['status'], courierName?: string, trackingNumber?: string) => void;

  // Admin Controls
  isAdminLoggedIn: boolean;
  adminLogin: (password: string) => boolean;
  adminLogout: () => void;
  addProduct: (productData: Partial<Product>) => void;
  updateProduct: (id: string, productData: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateStock: (productId: string, variantId: string, newStock: number) => void;
  coupons: Coupon[];
  addCoupon: (coupon: Coupon) => void;

  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Helper to derive initial view from URL path or hash
const getViewFromUrl = (): string => {
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const raw = (path + hash).replace(/^\//, '').replace(/^#/, '');

  if (raw.includes('admin-dashboard') || raw.includes('admindashboard') || raw.includes('admin')) {
    return 'admin-login';
  }
  if (raw.includes('shop') || raw.includes('catalog')) return 'shop';
  if (raw.includes('account')) return 'account';
  if (raw.includes('auth') || raw.includes('login') || raw.includes('register')) return 'auth';
  if (raw.includes('checkout')) return 'checkout';
  if (raw.includes('track-order') || raw.includes('orders')) return 'track-order';
  if (raw.includes('wishlist')) return 'wishlist';
  if (raw.includes('artisan-stories') || raw.includes('artisans')) return 'artisan-stories';
  if (raw.includes('about')) return 'about';

  return 'home';
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentViewState, setCurrentViewState] = useState<string>(getViewFromUrl());
  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('eclipsera_admin_logged');
      return saved === 'true';
    } catch (e) {
      return false;
    }
  });
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Customer Profile State (Default unauthenticated until login or localStorage restoration)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('eclipsera_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const freeShippingThreshold = 1000;

  // Custom setCurrentView that updates state, scroll position & URL pushState
  const setCurrentView = (view: string) => {
    setCurrentViewState(view);
    try {
      const urlPath = view === 'home' ? '/' : `/${view}`;
      window.history.pushState({ view }, '', urlPath);
    } catch (e) {
      // Fallback
    }
  };

  // Sync back/forward browser navigation
  useEffect(() => {
    const handlePopState = () => {
      const v = getViewFromUrl();
      setCurrentViewState(v);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentViewState, selectedProductSlug]);

  // Sync with SQL Backend API on mount
  useEffect(() => {
    async function loadBackendData() {
      try {
        const { fetchProductsFromAPI, fetchOrdersFromAPI, fetchCouponsFromAPI } = await import('../services/apiService');
        const apiProds = await fetchProductsFromAPI();
        if (apiProds && apiProds.length) setProducts(apiProds);

        const apiOrders = await fetchOrdersFromAPI();
        if (apiOrders && apiOrders.length) setOrders(apiOrders);

        const apiCoupons = await fetchCouponsFromAPI();
        if (apiCoupons && apiCoupons.length) setCoupons(apiCoupons);
      } catch (e) {
        // Fallback to initial mock data
      }
    }
    loadBackendData();
  }, []);

  const showToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Customer Auth Implementation
  const customerLogin = async (emailOrPhone: string, password?: string) => {
    try {
      const { loginUserInAPI } = await import('../services/apiService');
      const res = await loginUserInAPI({ emailOrPhone, password });
      
      if (res && res.success && res.user) {
        const user = res.user;
        setCurrentUser(user);
        try { localStorage.setItem('eclipsera_user', JSON.stringify(user)); } catch(e) {}
        showToast(`Welcome back, ${user.name}! Signed in successfully.`, 'success');
        setCurrentView('home');
        return { success: true, message: 'Login successful' };
      } else if (res && res.error) {
        // Server validated credentials and returned an explicit error (wrong password / user not found)
        showToast(res.error, 'error');
        return { success: false, message: res.error };
      }
    } catch (e) {
      // Server network connection error
    }

    // Local Fallback Login ONLY when server is offline
    const formatted = emailOrPhone.trim().toLowerCase();
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: formatted.includes('@') ? formatted.split('@')[0].toUpperCase() : 'Artisan Patron',
      email: formatted.includes('@') ? formatted : `${formatted}@example.com`,
      phone: formatted.includes('@') ? '9876543210' : formatted,
      address: {
        street: '42 Lavelle Road, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001'
      },
      role: 'customer'
    };
    setCurrentUser(newUser);
    try { localStorage.setItem('eclipsera_user', JSON.stringify(newUser)); } catch(e) {}
    showToast(`Welcome back, ${newUser.name}! Signed in successfully.`, 'success');
    setCurrentView('home');
    return { success: true, message: 'Login successful' };
  };

  const customerGoogleLogin = async (googleTokenOrUser: string | { email: string; name: string }) => {
    if (typeof googleTokenOrUser !== 'string') {
      const newUser: UserProfile = {
        id: `usr-g-${Date.now()}`,
        name: googleTokenOrUser.name,
        email: googleTokenOrUser.email,
        phone: '9876543210',
        address: { street: '42 Lavelle Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
        role: 'customer'
      };
      setCurrentUser(newUser);
      try { localStorage.setItem('eclipsera_user', JSON.stringify(newUser)); } catch(e) {}
      showToast(`Google Sign-In successful! Welcome, ${newUser.name}.`, 'success');
      setCurrentView('home');
      return { success: true, message: 'Google Sign-In successful' };
    }

    try {
      const { loginWithGoogleInAPI } = await import('../services/apiService');
      const res = await loginWithGoogleInAPI(googleTokenOrUser);

      if (res && res.success && res.user) {
        const user = res.user;
        setCurrentUser(user);
        try { localStorage.setItem('eclipsera_user', JSON.stringify(user)); } catch(e) {}
        showToast(`Google Sign-In successful! Welcome, ${user.name}.`, 'success');
        setCurrentView('home');
        return { success: true, message: 'Google Sign-In successful' };
      } else if (res && res.error) {
        showToast(res.error, 'error');
        return { success: false, message: res.error };
      }
    } catch (e) {
      showToast('Google Sign-In failed due to connection error.', 'error');
    }
    return { success: false, message: 'Google auth error' };
  };

  const customerRegister = async (name: string, email: string, phone: string, password?: string) => {
    try {
      const { registerUserInAPI } = await import('../services/apiService');
      const res = await registerUserInAPI({ name, email, phone, password });

      if (res && res.success && res.user) {
        const user = res.user;
        setCurrentUser(user);
        try { localStorage.setItem('eclipsera_user', JSON.stringify(user)); } catch(e) {}
        showToast(`Account created! Welcome to eclipsera_premium, ${user.name}.`, 'success');
        setCurrentView('home');
        return { success: true, message: 'Registration successful' };
      } else if (res && res.error) {
        // Server returned explicit registration validation error (user already exists)
        showToast(res.error, 'error');
        return { success: false, message: res.error };
      }
    } catch (e) {
      // Server network connection error
    }

    // Local Fallback Register ONLY when server is offline
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: {
        street: '42 Lavelle Road, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001'
      },
      role: 'customer'
    };
    setCurrentUser(newUser);
    try { localStorage.setItem('eclipsera_user', JSON.stringify(newUser)); } catch(e) {}
    showToast(`Account created! Welcome to eclipsera_premium, ${newUser.name}.`, 'success');
    setCurrentView('home');
    return { success: true, message: 'Registration successful' };
  };

  const customerLogout = () => {
    setCurrentUser(null);
    try { localStorage.removeItem('eclipsera_user'); } catch(e) {}
    showToast('Signed out of your customer account.', 'info');
    setCurrentView('auth');
  };

  const requestOTP = (phone: string) => {
    const demoOTP = '4821';
    showToast(`Demo OTP sent to +91 ${phone}: ${demoOTP}`, 'info');
    return { success: true, message: `OTP sent to ${phone}`, demoOTP };
  };

  const verifyOTP = async (phone: string, otp: string) => {
    if (otp === '4821' || otp === '1234' || otp.length === 4) {
      try {
        const { loginUserInAPI } = await import('../services/apiService');
        const res = await loginUserInAPI({ emailOrPhone: phone, password: 'patron123' });
        
        if (res && res.success && res.user) {
          const user = res.user;
          setCurrentUser(user);
          try { localStorage.setItem('eclipsera_user', JSON.stringify(user)); } catch(e) {}
          showToast(`Phone verified! Welcome, ${user.name}.`, 'success');
          setCurrentView('home');
          return { success: true, message: 'Phone verified' };
        }
      } catch (e) {
        // Fallback
      }

      // Local Fallback
      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        name: `Patron (+91 ${phone.slice(-4)})`,
        email: `patron_${phone.slice(-4)}@example.com`,
        phone: phone,
        address: {
          street: '42 Lavelle Road, Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560001'
        },
        role: 'customer'
      };
      setCurrentUser(newUser);
      try { localStorage.setItem('eclipsera_user', JSON.stringify(newUser)); } catch(e) {}
      showToast(`Phone verified! Welcome, ${newUser.name}.`, 'success');
      setCurrentView('home');
      return { success: true, message: 'Phone verified' };
    }
    showToast('Invalid OTP entered. Try "4821".', 'error');
    return { success: false, message: 'Invalid OTP' };
  };

  const updateCustomerProfile = async (profileData: Partial<UserProfile>) => {
    if (currentUser && currentUser.id) {
      try {
        const { updateUserProfileInAPI } = await import('../services/apiService');
        const res = await updateUserProfileInAPI(currentUser.id, {
          name: profileData.name || currentUser.name,
          email: profileData.email || currentUser.email,
          phone: profileData.phone || currentUser.phone,
          address: profileData.address || currentUser.address
        });

        if (res && res.success && res.user) {
          const user = res.user;
          setCurrentUser(user);
          try { localStorage.setItem('eclipsera_user', JSON.stringify(user)); } catch(e) {}
          showToast('Profile information updated in database.', 'success');
          return;
        }
      } catch (e) {
        // Fallback
      }
    }
    
    // Local Fallback
    setCurrentUser(prev => prev ? { ...prev, ...profileData } : null);
    showToast('Profile information updated.', 'success');
  };

  const openProductDetail = (slug: string) => {
    setSelectedProductSlug(slug);
    setCurrentView('product-detail');
  };

  const addToCart = (product: Product, variantId: string, quantity: number = 1) => {
    const variant = product.variants.find(v => v.id === variantId) || product.variants[0];
    const unitPrice = product.basePrice + (variant?.additionalPrice || 0);

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.variantId === variant.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prevCart, {
        product,
        variantId: variant.id,
        colorName: variant.colorName,
        size: variant.size,
        quantity,
        unitPrice
      }];
    });

    showToast(`Added "${product.title}" to your cart.`, 'success');
    setIsCartOpen(true);
  };

  const buyNow = (product: Product, variantId: string, quantity: number = 1) => {
    addToCart(product, variantId, quantity);
    setIsCartOpen(false);
    setCurrentView('checkout');
    showToast(`Proceeding to instant checkout for "${product.title}"`, 'info');
  };

  const removeFromCart = (variantId: string) => {
    setCart(prev => prev.filter(item => item.variantId !== variantId));
    showToast('Item removed from cart.', 'info');
  };

  const updateCartQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    setCart(prev => prev.map(item => item.variantId === variantId ? { ...item, quantity } : item));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (code: string) => {
    const formatted = code.trim().toUpperCase();
    const found = coupons.find(c => c.code === formatted);
    if (!found) {
      return { success: false, message: 'Invalid coupon code. Try CRAFT10 or HANDMADE300.' };
    }
    const currentSub = cart.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    if (currentSub < found.minSubtotal) {
      return { success: false, message: `Minimum cart value of ₹${found.minSubtotal.toLocaleString()} required for ${found.code}.` };
    }
    setAppliedCoupon(found);
    showToast(`Coupon ${found.code} applied successfully!`, 'success');
    return { success: true, message: `Coupon applied: ${found.description}` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon code removed.', 'info');
  };

  // Pricing calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  const mrpTotal = cart.reduce((acc, item) => {
    const itemMrp = item.product.compareAtPrice || item.product.basePrice;
    return acc + (itemMrp * item.quantity);
  }, 0);
  const savingsFromMRP = Math.max(0, mrpTotal - subtotal);

  let discountTotal = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'PERCENT') {
      discountTotal = Math.round((subtotal * appliedCoupon.discountValue) / 100);
    } else {
      discountTotal = appliedCoupon.discountValue;
    }
  }
  const totalSavings = savingsFromMRP + discountTotal;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 150;
  const taxTotal = Math.round((subtotal - discountTotal) * 0.05); // 5% GST for Handcrafted Goods
  const grandTotal = Math.max(0, subtotal - discountTotal + shippingFee + taxTotal);

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from your saved craft wishlist.', 'info');
        return prev.filter(id => id !== productId);
      }
      showToast('Saved to your luxury wishlist!', 'success');
      return [...prev, productId];
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const placeOrder = (shippingDetails: any, paymentMethod: string) => {
    const newOrderNumber = `EP-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: newOrderNumber,
      customerName: `${shippingDetails.firstName} ${shippingDetails.lastName}`,
      customerEmail: shippingDetails.email,
      customerPhone: shippingDetails.phone,
      shippingAddress: {
        street: shippingDetails.street,
        city: shippingDetails.city,
        state: shippingDetails.state,
        pincode: shippingDetails.pincode,
        country: 'India'
      },
      items: cart.map((item, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        productId: item.product.id,
        variantId: item.variantId,
        title: item.product.title,
        colorName: item.colorName,
        size: item.size,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        image: item.product.images[0]
      })),
      subtotal,
      discountTotal,
      shippingFee,
      taxTotal,
      grandTotal,
      status: 'PAYMENT_CONFIRMED',
      paymentMethod,
      paymentId: `pay_RZP${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      createdAt: new Date().toISOString()
    };

    setOrders(prev => [newOrder, ...prev]);
    setLastPlacedOrder(newOrder);

    // Decrement Stock
    setProducts(prevProducts => {
      return prevProducts.map(p => {
        const cartItemsForProduct = cart.filter(ci => ci.product.id === p.id);
        if (cartItemsForProduct.length === 0) return p;
        const updatedVariants = p.variants.map(v => {
          const match = cartItemsForProduct.find(ci => ci.variantId === v.id);
          if (match) {
            return { ...v, stockQuantity: Math.max(0, v.stockQuantity - match.quantity) };
          }
          return v;
        });
        return { ...p, variants: updatedVariants };
      });
    });

    clearCart();

    // Trigger Confetti celebration
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Fallback
    }

    setCurrentView('order-confirmation');
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status'], courierName?: string, trackingNumber?: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: newStatus,
          courierName: courierName || o.courierName,
          trackingNumber: trackingNumber || o.trackingNumber
        };
      }
      return o;
    }));
    showToast(`Order status updated to ${newStatus}.`, 'success');
  };

  // Admin Actions
  const adminLogin = (password: string) => {
    if (password === 'admin123' || password === 'eclipsera') {
      setIsAdminLoggedIn(true);
      try { localStorage.setItem('eclipsera_admin_logged', 'true'); } catch (e) {}
      showToast('Admin session authenticated.', 'success');
      return true;
    }
    showToast('Invalid admin credentials. Try "admin123".', 'error');
    return false;
  };

  const adminLogout = () => {
    setIsAdminLoggedIn(false);
    try { localStorage.removeItem('eclipsera_admin_logged'); } catch (e) {}
    setCurrentView('home');
    showToast('Logged out of admin dashboard.', 'info');
  };

  const addProduct = (productData: Partial<Product>) => {
    const newId = `prod-${Date.now()}`;
    const newProduct: Product = {
      id: newId,
      title: productData.title || 'Untitled Artisan Piece',
      slug: (productData.title || 'untitled').toLowerCase().replace(/\s+/g, '-'),
      description: productData.description || 'Handcrafted luxury piece.',
      basePrice: productData.basePrice || 1450,
      compareAtPrice: productData.compareAtPrice,
      craftTechnique: productData.craftTechnique || 'Handmade Lathe Work',
      originRegion: productData.originRegion || 'India',
      artisanName: productData.artisanName || 'Master Guild Artisan',
      artisanBio: productData.artisanBio || 'Craftsman with generations of heritage.',
      artisanAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      material: productData.material || 'Natural Wood & Terracotta',
      careInstructions: productData.careInstructions || 'Keep dry.',
      rating: 5.0,
      reviewsCount: 1,
      isFeatured: productData.isFeatured || false,
      isBestSeller: productData.isBestSeller || false,
      silkMarkCertified: productData.silkMarkCertified || true,
      category: productData.category || 'handcrafted-toys',
      images: productData.images?.length ? productData.images : ['https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1200&q=85'],
      variants: productData.variants || [{
        id: `v-${Date.now()}`,
        sku: `ECL-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        colorName: 'Standard Gold',
        colorHex: '#C5A059',
        additionalPrice: 0,
        stockQuantity: 5
      }]
    };
    setProducts(prev => [newProduct, ...prev]);
    showToast(`Published product "${newProduct.title}".`, 'success');
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...productData } : p));
    showToast('Product updated successfully.', 'success');
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast('Product archived.', 'info');
  };

  const updateStock = (productId: string, variantId: string, newStock: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const updatedVariants = p.variants.map(v => v.id === variantId ? { ...v, stockQuantity: newStock } : v);
        return { ...p, variants: updatedVariants };
      }
      return p;
    }));
    showToast('Stock quantity updated.', 'success');
  };

  const addCoupon = (coupon: Coupon) => {
    setCoupons(prev => [coupon, ...prev]);
    showToast(`Promo code "${coupon.code}" created!`, 'success');
  };

  return (
    <StoreContext.Provider value={{
      currentView: currentViewState,
      setCurrentView,
      selectedProductSlug,
      openProductDetail,
      lastPlacedOrder,
      products,
      categories: CATEGORIES,
      heroSlides: HERO_SLIDES,
      currentUser,
      isCustomerLoggedIn: !!currentUser,
      customerLogin,
      customerGoogleLogin,
      customerRegister,
      customerLogout,
      requestOTP,
      verifyOTP,
      updateCustomerProfile,
      cart,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      buyNow,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      subtotal,
      mrpTotal,
      savingsFromMRP,
      discountTotal,
      totalSavings,
      shippingFee,
      taxTotal,
      grandTotal,
      freeShippingThreshold,
      wishlist,
      toggleWishlist,
      isInWishlist,
      orders,
      placeOrder,
      updateOrderStatus,
      isAdminLoggedIn,
      adminLogin,
      adminLogout,
      addProduct,
      updateProduct,
      deleteProduct,
      updateStock,
      coupons,
      addCoupon,
      toasts,
      showToast,
      removeToast
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};

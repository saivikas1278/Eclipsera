import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS, CATEGORIES, HERO_SLIDES, INITIAL_ORDERS, INITIAL_COUPONS, Product, Order, Coupon } from '../../shared/data/mockData';
import { 
  fetchProductsFromAPI, 
  fetchCouponsFromAPI,
  loginUserInAPI,
  loginWithGoogleInAPI,
  registerUserInAPI,
  updateUserProfileInAPI,
  createOrderInAPI,
  fetchCustomerOrdersFromAPI
} from '../../shared/services/apiService';
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

interface UserContextType {
  currentView: string;
  setCurrentView: (view: string) => void;
  selectedProductSlug: string | null;
  openProductDetail: (slug: string) => void;
  lastPlacedOrder: Order | null;
  products: Product[];
  categories: typeof CATEGORIES;
  heroSlides: typeof HERO_SLIDES;
  currentUser: UserProfile | null;
  isCustomerLoggedIn: boolean;
  customerLogin: (emailOrPhone: string, password?: string) => Promise<{ success: boolean; message: string }>;
  customerGoogleLogin: (googleTokenOrUser: string | { email: string; name: string }) => Promise<{ success: boolean; message: string }>;
  customerRegister: (name: string, email: string, phone: string, password?: string) => Promise<{ success: boolean; message: string }>;
  customerLogout: () => void;
  requestOTP: (phone: string) => { success: boolean; message: string; demoOTP: string };
  verifyOTP: (phone: string, otp: string) => Promise<{ success: boolean; message: string }>;
  updateCustomerProfile: (profileData: Partial<UserProfile>) => void;
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
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  orders: Order[];
  placeOrder: (shippingDetails: any, paymentMethod: string) => Promise<Order | null>;
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  selectedCategorySlug: string | null;
  searchQueryState: string;
  selectedArtisanName: string | null;
  compareProductIds: string[];
  openCategory: (slug: string) => void;
  openSearch: (query: string) => void;
  openArtisanProfile: (name: string) => void;
  toggleCompare: (productId: string) => void;
  clearCompare: () => void;
  addQaToProduct: (productId: string, question: string) => void;
  selectedOrderId: string | null;
  openOrderDetail: (id: string) => void;
  savedAddresses: { id: string; name: string; phone: string; street: string; city: string; state: string; pincode: string; country: string; isDefault: boolean }[];
  savedCards: { id: string; cardHolder: string; cardMasked: string; expiry: string }[];
  walletBalance: number;
  walletTransactions: { id: string; date: string; description: string; type: 'CREDIT' | 'DEBIT'; amount: number }[];
  notifications: { id: string; title: string; message: string; date: string; read: boolean; type: string }[];
  userReviews: { id: string; productId: string; productTitle: string; rating: number; comment: string; date: string }[];
  addAddress: (addr: any) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  addCard: (card: any) => void;
  deleteCard: (id: string) => void;
  addReview: (productId: string, rating: number, comment: string) => void;
  deleteReview: (id: string) => void;
  addCustomOrderRequest: (req: any) => void;
  cancelOrder: (orderId: string) => void;
  requestReturnOrder: (orderId: string, itemIds: string[], reason: string, comment: string) => void;
  deductWalletBalance: (amount: number) => boolean;
  markNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  blogPosts: Array<{ slug: string; title: string; excerpt: string; author: string; date: string; readTime: string; category: string; content: string; image: string }>;
  faqs: Array<{ id: string; category: 'Ordering' | 'Shipping' | 'Returns' | 'Customization' | 'Artisans'; question: string; answer: string }>;
  artisanApplications: Array<{ id: string; name: string; email: string; craft: string; location: string; portfolio: string; bio: string; status: 'PENDING' | 'APPROVED' | 'REJECTED' }>;
  maintenanceMode: boolean;
  selectedBlogSlug: string | null;
  selectedPolicySlug: string;
  openBlogPost: (slug: string) => void;
  openPolicy: (slug: string) => void;
  applyForArtisan: (appData: any) => void;
  toggleMaintenanceMode: () => void;
  addBlogPost: (post: any) => void;
  deleteBlogPost: (slug: string) => void;
  addFaq: (faq: any) => void;
  deleteFaq: (id: string) => void;
  approveArtisanApp: (id: string) => void;
  rejectArtisanApp: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const getViewFromUrl = (): string => {
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const raw = (path + hash).replace(/^\//, '').replace(/^#/, '');

  if (raw.includes('shop') || raw.includes('catalog')) return 'shop';
  if (raw.includes('account')) return 'account';
  if (raw.includes('auth') || raw.includes('login') || raw.includes('register')) return 'auth';
  if (raw.includes('checkout')) return 'checkout';
  if (raw.includes('track-order')) return 'track-order';
  if (raw.includes('wishlist')) return 'wishlist';
  if (raw.includes('artisans')) return 'artisans';
  if (raw.includes('how-it-works')) return 'how-it-works';
  if (raw.includes('sustainability')) return 'sustainability';
  if (raw.includes('blog')) return 'blog';
  if (raw.includes('faqs')) return 'faqs';
  if (raw.includes('contact')) return 'contact';
  if (raw.includes('policy') || raw.includes('terms') || raw.includes('privacy')) return 'policy';
  if (raw.includes('about')) return 'about';

  return 'home';
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentViewState, setCurrentViewState] = useState<string>(getViewFromUrl());
  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('eclipsera_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Missing pages states
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [searchQueryState, setSearchQueryState] = useState<string>('');
  const [selectedArtisanName, setSelectedArtisanName] = useState<string | null>(null);
  const [compareProductIds, setCompareProductIds] = useState<string[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const openOrderDetail = (id: string) => {
    setSelectedOrderId(id);
    setCurrentView('order-detail');
  };

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState([
    { id: 'addr-1', name: 'Ananya Sharma', phone: '9876543210', street: '42 Lavelle Road, Indiranagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560001', country: 'India', isDefault: true },
    { id: 'addr-2', name: 'Ananya Sharma', phone: '9876543210', street: 'Flat 304, Prestige Heights, HSR Layout', city: 'Bengaluru', state: 'Karnataka', pincode: '560102', country: 'India', isDefault: false }
  ]);

  // Saved Cards State
  const [savedCards, setSavedCards] = useState([
    { id: 'card-1', cardHolder: 'Ananya Sharma', cardMasked: '•••• •••• •••• 4821', expiry: '12/28' },
    { id: 'card-2', cardHolder: 'Ananya Sharma', cardMasked: '•••• •••• •••• 9032', expiry: '05/30' }
  ]);

  // Wallet & Credits Balance & Transactions
  const [walletBalance, setWalletBalance] = useState(1500); // 1500 store credits
  const [walletTransactions, setWalletTransactions] = useState<Array<{ id: string; date: string; description: string; type: 'CREDIT' | 'DEBIT'; amount: number }>>([
    { id: 'tx-1', date: '2026-07-15T12:00:00Z', description: 'Referral Bonus Credit', type: 'CREDIT' as const, amount: 500 },
    { id: 'tx-2', date: '2026-07-20T10:00:00Z', description: 'Promotional Refund Credit', type: 'CREDIT' as const, amount: 1000 }
  ]);

  // System Notifications
  const [notifications, setNotifications] = useState([
    { id: 'nt-1', title: 'Order Dispatched', message: 'Your Channapatna stacking rings order is out for delivery with Blue Dart.', date: '2026-07-25T11:00:00Z', read: false, type: 'order' },
    { id: 'nt-2', title: 'Monsoon Artisan Offer', message: 'Enjoy 20% off woodcrafts with code ECLIPSERA20.', date: '2026-07-22T09:00:00Z', read: true, type: 'offer' },
    { id: 'nt-3', title: 'Artisan Replied', message: 'Master Craftsman B. Ramappa answered your question about dye safety.', date: '2026-07-23T14:00:00Z', read: false, type: 'reply' }
  ]);

  // User Written Reviews
  const [userReviews, setUserReviews] = useState([
    { id: 'ur-1', productId: 'prod-1', productTitle: 'Channapatna Hand-Lathed Wooden Stacking Ring Toy', rating: 5, comment: 'Wonderful texture and vegetable dye finish. Completely safe for my toddler daughter.', date: '2026-07-22T10:00:00Z' }
  ]);

  // Blog posts initial mock
  const [blogPosts, setBlogPosts] = useState([
    {
      slug: 'channapatna-lacquerware-craft-heritage',
      title: 'The Ancient Art of Channapatna Lacquerware',
      excerpt: 'Discover how 200-year-old eco-friendly vegetable dye turning techniques continue to thrive in Karnataka.',
      author: 'Master Craftsman B. Ramappa',
      date: 'July 15, 2026',
      readTime: '5 min read',
      category: 'Artisan Stories',
      image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
      content: 'Channapatna toys are a particular form of wooden toys and dolls that are manufactured in the town of Channapatna in the Ramanagara district of Karnataka state. Traditional lacquerware uses non-toxic vegetable dyes extracted from turmeric, indigo, and katha wood shavings. Every lathe rotation is calibrated by hand.'
    },
    {
      slug: 'sustainable-home-decor-guide',
      title: 'Styling Your Home with Ethical Terracotta & Brass',
      excerpt: 'Simple interior design tips to bring warmth, texture, and cultural heritage to modern minimalist living spaces.',
      author: 'Ananya Sharma',
      date: 'July 20, 2026',
      readTime: '4 min read',
      category: 'Gift Ideas',
      image: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=800&q=80',
      content: 'Integrating natural terracotta clay and hand-engraved brass into modern home spaces creates timeless visual contrast. Discover how studio pottery retains moisture for indoor flora while adding rich rustic aesthetic.'
    },
    {
      slug: 'behind-the-scenes-pottery-workshop',
      title: 'Behind the Scenes: A Day in the Studio Pottery Workshop',
      excerpt: 'Step inside Kumartuli clay guild workshops where red earth transforms into GI-certified art.',
      author: 'Somnath Pal',
      date: 'July 24, 2026',
      readTime: '6 min read',
      category: 'Behind the Scenes',
      image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
      content: 'Pottery requires patience, heat calibration, and deep respect for natural earth materials. In our studio, we prepare clay beds through traditional sun drying before shaping each pot on high-speed wheels.'
    }
  ]);

  // FAQs initial mock
  const [faqs, setFaqs] = useState([
    { id: 'faq-1', category: 'Ordering' as const, question: 'How do I place a custom order with an artisan?', answer: 'Navigate to your Account Dashboard → Blueprint Custom Order, or submit your specifications directly on the product detail page.' },
    { id: 'faq-2', category: 'Shipping' as const, question: 'Are items insured during transit?', answer: 'Yes! All shipments are 100% insured against loss or transit damage with Blue Dart Express.' },
    { id: 'faq-3', category: 'Returns' as const, question: 'What is your 7-day return policy?', answer: 'If an item arrives damaged or differs from specifications, submit a return claim under Account → My Orders within 7 days for a full refund.' },
    { id: 'faq-4', category: 'Customization' as const, question: 'Are the vegetable dyes safe for children?', answer: 'All Channapatna wooden toys use 100% natural, non-toxic vegetable dyes (turmeric, indigo) and natural lac, completely safe for children.' },
    { id: 'faq-5', category: 'Artisans' as const, question: 'How are artisans verified for GI Craft Mark status?', answer: 'Every artisan registered on eclipsera is audited by regional craft guild councils and verified against Geographical Indication (GI) heritage standards.' }
  ]);

  // Artisan Applications initial mock
  const [artisanApplications, setArtisanApplications] = useState<Array<{ id: string; name: string; email: string; craft: string; location: string; portfolio: string; bio: string; status: 'PENDING' | 'APPROVED' | 'REJECTED' }>>([
    { id: 'app-1', name: 'Lakshmi Devi', email: 'lakshmi@craftsguild.org', craft: 'Madhubani Painting', location: 'Bihar', portfolio: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80', bio: 'Specializing in traditional natural ink freehand paintings.', status: 'PENDING' as const }
  ]);

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string | null>(null);
  const [selectedPolicySlug, setSelectedPolicySlug] = useState<string>('shipping-policy');

  const openBlogPost = (slug: string) => {
    setSelectedBlogSlug(slug);
    setCurrentView('blog-post');
  };

  const openPolicy = (slug: string) => {
    setSelectedPolicySlug(slug);
    setCurrentView('policy');
  };

  const applyForArtisan = (appData: any) => {
    const newApp = {
      id: `app-${Date.now()}`,
      ...appData,
      status: 'PENDING' as const
    };
    setArtisanApplications(prev => [newApp, ...prev]);
    showToast('Your artisan application has been submitted to the guild council.', 'success');
  };

  const toggleMaintenanceMode = () => {
    setMaintenanceMode(prev => !prev);
    showToast(`Storefront maintenance mode set to ${!maintenanceMode ? 'ENABLED' : 'DISABLED'}.`, 'info');
  };

  const addBlogPost = (post: any) => {
    setBlogPosts(prev => [post, ...prev]);
    showToast(`Published blog post "${post.title}".`, 'success');
  };

  const deleteBlogPost = (slug: string) => {
    setBlogPosts(prev => prev.filter(p => p.slug !== slug));
    showToast('Removed blog post article.', 'info');
  };

  const addFaq = (faq: any) => {
    setFaqs(prev => [...prev, { id: `faq-${Date.now()}`, ...faq }]);
    showToast('Added new FAQ item.', 'success');
  };

  const deleteFaq = (id: string) => {
    setFaqs(prev => prev.filter(f => f.id !== id));
    showToast('Deleted FAQ item.', 'info');
  };

  const approveArtisanApp = (id: string) => {
    setArtisanApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'APPROVED' as const } : a));
    showToast('Artisan application approved! Credentials issued.', 'success');
  };

  const rejectArtisanApp = (id: string) => {
    setArtisanApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'REJECTED' as const } : a));
    showToast('Rejected artisan application.', 'info');
  };

  const addAddress = (addr: any) => {
    const newAddr = {
      id: `addr-${Date.now()}`,
      ...addr,
      isDefault: savedAddresses.length === 0 ? true : addr.isDefault || false
    };
    if (newAddr.isDefault) {
      setSavedAddresses(prev => prev.map(a => ({ ...a, isDefault: false })).concat(newAddr));
    } else {
      setSavedAddresses(prev => [...prev, newAddr]);
    }
    showToast('Saved new delivery address.', 'success');
  };

  const deleteAddress = (id: string) => {
    setSavedAddresses(prev => prev.filter(a => a.id !== id));
    showToast('Deleted saved shipping address.', 'info');
  };

  const setDefaultAddress = (id: string) => {
    setSavedAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
    showToast('Set default shipping address.', 'success');
  };

  const addCard = (card: any) => {
    const newCard = {
      id: `card-${Date.now()}`,
      cardHolder: card.cardHolder,
      cardMasked: `•••• •••• •••• ${card.cardNumber.slice(-4)}`,
      expiry: card.expiry
    };
    setSavedCards(prev => [...prev, newCard]);
    showToast('Added payment card to secure vault.', 'success');
  };

  const deleteCard = (id: string) => {
    setSavedCards(prev => prev.filter(c => c.id !== id));
    showToast('Removed payment card.', 'info');
  };

  const addReview = (productId: string, rating: number, comment: string) => {
    const matchedP = products.find(p => p.id === productId);
    const newRev = {
      id: `ur-${Date.now()}`,
      productId,
      productTitle: matchedP ? matchedP.title : 'Artisan Handcraft',
      rating,
      comment,
      date: new Date().toISOString()
    };
    setUserReviews(prev => [newRev, ...prev]);
    showToast('Your verified review has been published.', 'success');
  };

  const deleteReview = (id: string) => {
    setUserReviews(prev => prev.filter(r => r.id !== id));
    showToast('Removed your written review.', 'info');
  };

  const addCustomOrderRequest = (req: any) => {
    showToast('Your custom order blueprint has been sent to the artisan guild.', 'success');
  };

  const cancelOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' as const } : o));
    showToast('Order cancelled successfully. Refund initiated to source.', 'info');
  };

  const requestReturnOrder = (orderId: string, itemIds: string[], reason: string, comment: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'PROCESSING' as const } : o));
    showToast('Return and refund request submitted for approval.', 'success');
  };

  const deductWalletBalance = (amount: number): boolean => {
    if (walletBalance < amount) {
      showToast('Insufficient wallet store credits.', 'warning');
      return false;
    }
    setWalletBalance(prev => prev - amount);
    setWalletTransactions(prev => [
      { id: `tx-${Date.now()}`, date: new Date().toISOString(), description: 'Store checkout payment debit', type: 'DEBIT' as const, amount },
      ...prev
    ]);
    showToast('Deducted store credits from wallet balance.', 'success');
    return true;
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('Marked all notifications as read.', 'success');
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    showToast('Deleted system notification.', 'info');
  };

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('eclipsera_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const freeShippingThreshold = 1000;

  const openCategory = (slug: string) => {
    setSelectedCategorySlug(slug);
    setCurrentView('category');
  };

  const openSearch = (query: string) => {
    setSearchQueryState(query);
    setCurrentView('search');
  };

  const openArtisanProfile = (name: string) => {
    setSelectedArtisanName(name);
    setCurrentView('artisan-profile');
  };

  const toggleCompare = (productId: string) => {
    setCompareProductIds(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed product from comparison list.', 'info');
        return prev.filter(id => id !== productId);
      }
      if (prev.length >= 3) {
        showToast('You can compare up to 3 products at a time.', 'warning');
        return prev;
      }
      showToast('Added product to comparison list.', 'success');
      return [...prev, productId];
    });
  };

  const clearCompare = () => {
    setCompareProductIds([]);
    showToast('Cleared comparison list.', 'info');
  };

  const addQaToProduct = (productId: string, question: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      const originalQaList = p.qaList || [];
      const newQa = {
        id: `q-${Date.now()}`,
        question,
        user: currentUser?.name || 'Anonymous Patron',
        date: new Date().toISOString()
      };
      return {
        ...p,
        qaList: [...originalQaList, newQa]
      };
    }));
    showToast('Your question has been posted to this artisan piece.', 'success');
  };

  const setCurrentView = (view: string) => {
    setCurrentViewState(view);
    try {
      const urlPath = view === 'home' ? '/' : `/${view}`;
      window.history.pushState({ view }, '', urlPath);
    } catch (e) {
      // Fallback
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const v = getViewFromUrl();
      setCurrentViewState(v);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('eclipsera_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentViewState, selectedProductSlug]);

  useEffect(() => {
    async function loadStorefrontData() {
      try {
        const apiProds = await fetchProductsFromAPI();
        if (apiProds && apiProds.length) setProducts(apiProds);

        const apiCoupons = await fetchCouponsFromAPI();
        if (apiCoupons && apiCoupons.length) setCoupons(apiCoupons);
      } catch (e) {
        // Fallback
      }
    }
    loadStorefrontData();
  }, []);

  const loadUserOrders = async () => {
    try {
      const apiOrders = await fetchCustomerOrdersFromAPI();
      if (apiOrders && Array.isArray(apiOrders)) {
        setOrders(apiOrders);
      } else {
        setOrders(INITIAL_ORDERS);
      }
    } catch (e) {
      setOrders(INITIAL_ORDERS);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadUserOrders();
    } else {
      setOrders([]);
    }
  }, [currentUser]);

  const showToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const customerLogin = async (emailOrPhone: string, password?: string) => {
    try {
      const res = await loginUserInAPI({ emailOrPhone, password });
      if (res && res.success && res.user) {
        const user = res.user;
        setCurrentUser(user);
        try { localStorage.setItem('eclipsera_user', JSON.stringify(user)); } catch(e) {}
        showToast(`Welcome back, ${user.name}! Signed in successfully.`, 'success');
        setCurrentView('home');
        return { success: true, message: 'Login successful' };
      } else if (res && res.error) {
        showToast(res.error, 'error');
        return { success: false, message: res.error };
      }
    } catch (e) {
      showToast('Connection error during sign-in. Please try again.', 'error');
      return { success: false, message: 'Connection error' };
    }

    showToast('Invalid login credentials. Please check your email/phone and password.', 'error');
    return { success: false, message: 'Login failed' };
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
      const res = await registerUserInAPI({ name, email, phone, password });
      if (res && res.success && res.user) {
        const user = res.user;
        setCurrentUser(user);
        try { 
          localStorage.setItem('eclipsera_user', JSON.stringify(user)); 
          localStorage.setItem('eclipsera_token', `usr_session_${user.id}`);
        } catch(e) {}
        showToast(`Account created! Welcome to eclipsera_premium, ${user.name}.`, 'success');
        setCurrentView('home');
        return { success: true, message: 'Registration successful', user };
      } else if (res && res.error) {
        showToast(res.error, 'error');
        return { success: false, message: res.error };
      }
    } catch (e) {
      showToast('Connection error during registration. Please try again.', 'error');
      return { success: false, message: 'Connection error' };
    }

    showToast('Registration failed. Please check your details.', 'error');
    return { success: false, message: 'Registration failed' };
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
        const res = await loginUserInAPI({ emailOrPhone: phone, password: 'patron123', isOtp: true });
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

      // Offline Fallback
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
  };

  const openProductDetail = (slug: string) => {
    setSelectedProductSlug(slug);
    setCurrentView('product-detail');
  };

  const addToCart = (product: Product, variantId: string, quantity = 1) => {
    const variant = product.variants.find(v => v.id === variantId) || product.variants[0];
    setCart(prev => {
      const existsIndex = prev.findIndex(item => item.variantId === variantId);
      if (existsIndex > -1) {
        const updated = [...prev];
        updated[existsIndex].quantity += quantity;
        showToast(`Added ${quantity} more "${product.title}" to bag.`, 'success');
        return updated;
      }
      showToast(`Added "${product.title}" to shopping bag.`, 'success');
      return [...prev, {
        product,
        variantId: variant.id,
        colorName: variant.colorName,
        size: variant.size,
        quantity,
        unitPrice: product.basePrice + variant.additionalPrice
      }];
    });
    setIsCartOpen(true);
  };

  const buyNow = (product: Product, variantId: string, quantity = 1) => {
    const variant = product.variants.find(v => v.id === variantId) || product.variants[0];
    setCart([{
      product,
      variantId: variant.id,
      colorName: variant.colorName,
      size: variant.size,
      quantity,
      unitPrice: product.basePrice + variant.additionalPrice
    }]);
    setCurrentView('checkout');
  };

  const removeFromCart = (variantId: string) => {
    setCart(prev => prev.filter(item => item.variantId !== variantId));
    showToast('Removed item from shopping bag.', 'info');
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
    try { localStorage.removeItem('eclipsera_cart'); } catch (e) {}
  };

  const applyCoupon = (code: string) => {
    const match = coupons.find(c => c.code === code.toUpperCase());
    if (!match) {
      showToast('Invalid coupon code.', 'error');
      return { success: false, message: 'Invalid coupon' };
    }
    if (subtotal < match.minSubtotal) {
      showToast(`Minimum subtotal of ₹${match.minSubtotal} required.`, 'warning');
      return { success: false, message: `Min subtotal ₹${match.minSubtotal} required` };
    }
    setAppliedCoupon(match);
    showToast(`Promo code "${match.code}" applied!`, 'success');
    return { success: true, message: 'Coupon applied successfully' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon code removed.', 'info');
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  const mrpTotal = cart.reduce((acc, item) => acc + ((item.product.compareAtPrice || item.unitPrice) * item.quantity), 0);
  const savingsFromMRP = mrpTotal - subtotal;

  const isPercentDiscount = (c: Coupon) => {
    const type = (c.discountType || '').toUpperCase();
    return type === 'PERCENT' || type === 'PERCENTAGE' || Boolean(c.discountPercentage);
  };

  const discountTotal = appliedCoupon
    ? isPercentDiscount(appliedCoupon)
      ? Math.round(subtotal * ((appliedCoupon.discountPercentage || appliedCoupon.discountValue || 10) / 100))
      : (appliedCoupon.discountValue || 0)
    : 0;

  const totalSavings = savingsFromMRP + discountTotal;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 99;
  const taxTotal = Math.round((subtotal - discountTotal) * 0.18); // 18% GST standard
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

  const placeOrder = async (shippingDetails: any, paymentMethod: string) => {
    const orderData = {
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
      items: cart.map(item => ({
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
      paymentMethod
    };

    try {
      const res = await createOrderInAPI(orderData);
      if (res && res.success && res.order) {
        setOrders(prev => [res.order, ...prev]);
        setLastPlacedOrder(res.order);
        clearCart();
        try { confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); } catch (e) {}
        setCurrentView('order-confirmation');
        return res.order;
      }
    } catch (e) {
      // offline fallback below
    }

    // Offline Local Fallback
    const awbNum = `ECL-AWB-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `EP-${Math.floor(10000 + Math.random() * 90000)}`,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      shippingAddress: orderData.shippingAddress,
      items: orderData.items.map((it, idx) => ({ ...it, id: `item-${Date.now()}-${idx}` })),
      subtotal,
      discountTotal,
      shippingFee,
      taxTotal,
      grandTotal,
      status: 'PENDING_FULFILLMENT',
      paymentMethod,
      paymentId: `pay_RZP${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      courierName: 'BlueDart Luxury Express',
      trackingNumber: awbNum,
      awbTrackingNumber: awbNum,
      estimatedDeliveryDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
      trackingHistory: [
        {
          status: 'PENDING_FULFILLMENT',
          location: 'Eclipsera Central Vault',
          timestamp: new Date().toISOString(),
          note: 'Order confirmed & queued for Master Guild Quality Inspector'
        }
      ],
      createdAt: new Date().toISOString()
    };
    setOrders(prev => [newOrder, ...prev]);
    setLastPlacedOrder(newOrder);
    clearCart();
    try { confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); } catch (e) {}
    setCurrentView('order-confirmation');
    return newOrder;
  };

  return (
    <UserContext.Provider value={{
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
      toasts,
      showToast,
      removeToast,
      selectedCategorySlug,
      searchQueryState,
      selectedArtisanName,
      compareProductIds,
      openCategory,
      openSearch,
      openArtisanProfile,
      toggleCompare,
      clearCompare,
      addQaToProduct,
      savedAddresses,
      savedCards,
      walletBalance,
      walletTransactions,
      notifications,
      userReviews,
      addAddress,
      deleteAddress,
      setDefaultAddress,
      addCard,
      deleteCard,
      addReview,
      deleteReview,
      addCustomOrderRequest,
      cancelOrder,
      requestReturnOrder,
      deductWalletBalance,
      markNotificationsAsRead,
      deleteNotification,
      selectedOrderId,
      openOrderDetail,
      blogPosts,
      faqs,
      artisanApplications,
      maintenanceMode,
      selectedBlogSlug,
      selectedPolicySlug,
      openBlogPost,
      openPolicy,
      applyForArtisan,
      toggleMaintenanceMode,
      addBlogPost,
      deleteBlogPost,
      addFaq,
      deleteFaq,
      approveArtisanApp,
      rejectArtisanApp
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    return {
      currentView: 'home',
      setCurrentView: () => {},
      selectedProductSlug: null,
      openProductDetail: () => {},
      lastPlacedOrder: null,
      products: [],
      categories: CATEGORIES,
      heroSlides: HERO_SLIDES,
      currentUser: null,
      isCustomerLoggedIn: false,
      customerLogin: async () => ({ success: false, message: '' }),
      customerGoogleLogin: async () => ({ success: false, message: '' }),
      customerRegister: async () => ({ success: false, message: '' }),
      customerLogout: () => {},
      requestOTP: () => ({ success: false, message: '', demoOTP: '' }),
      verifyOTP: async () => ({ success: false, message: '' }),
      updateCustomerProfile: () => {},
      cart: [],
      isCartOpen: false,
      setIsCartOpen: () => {},
      addToCart: () => {},
      buyNow: () => {},
      removeFromCart: () => {},
      updateCartQuantity: () => {},
      clearCart: () => {},
      appliedCoupon: null,
      applyCoupon: () => ({ success: false, message: '' }),
      removeCoupon: () => {},
      subtotal: 0,
      mrpTotal: 0,
      savingsFromMRP: 0,
      discountTotal: 0,
      totalSavings: 0,
      shippingFee: 0,
      taxTotal: 0,
      grandTotal: 0,
      freeShippingThreshold: 1000,
      wishlist: [] as string[],
      toggleWishlist: () => {},
      isInWishlist: () => false,
      orders: [],
      placeOrder: async () => null,
      toasts: [],
      showToast: () => {},
      removeToast: () => {},
      selectedCategorySlug: null,
      searchQueryState: '',
      selectedArtisanName: null,
      compareProductIds: [] as string[],
      openCategory: () => {},
      openSearch: () => {},
      openArtisanProfile: () => {},
      toggleCompare: () => {},
      clearCompare: () => {},
      addQaToProduct: () => {},
      savedAddresses: [],
      savedCards: [],
      walletBalance: 0,
      walletTransactions: [],
      notifications: [],
      userReviews: [],
      addAddress: () => {},
      deleteAddress: () => {},
      setDefaultAddress: () => {},
      addCard: () => {},
      deleteCard: () => {},
      addReview: () => {},
      deleteReview: () => {},
      addCustomOrderRequest: () => {},
      cancelOrder: () => {},
      requestReturnOrder: () => {},
      deductWalletBalance: () => {},
      markNotificationsAsRead: () => {},
      deleteNotification: () => {},
      selectedOrderId: null,
      openOrderDetail: () => {},
      blogPosts: [],
      faqs: [],
      artisanApplications: [],
      maintenanceMode: false,
      selectedBlogSlug: null,
      selectedPolicySlug: null,
      openBlogPost: () => {},
      openPolicy: () => {},
      applyForArtisan: () => {},
      toggleMaintenanceMode: () => {},
      addBlogPost: () => {},
      deleteBlogPost: () => {},
      addFaq: () => {},
      deleteFaq: () => {},
      approveArtisanApp: () => {},
      rejectArtisanApp: () => {}
    };
  }
  return context;
};

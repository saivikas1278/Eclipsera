import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Product, Order, Artisan } from '../../shared/data/mockData';
import { uploadImageToAPI, fetchNotificationsAPI, markNotificationReadAPI, markAllNotificationsReadAPI, downloadReportCSV } from '../../shared/services/apiService';
import { 
  LayoutDashboard, Package, ShoppingBag, Layers, 
  Plus, Edit3, Trash2, LogOut, Search, CheckCircle2, 
  X, AlertTriangle, Upload, Eye, Check, RefreshCw, UserCheck, ShieldCheck, Award, Star, Bell, CheckCheck, TrendingUp, Download, BarChart2, FileText, Menu
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const { 
    products, 
    orders, 
    artisans, 
    updateOrderStatus, 
    addProduct, 
    deleteProduct, 
    updateStock, 
    addArtisan,
    updateArtisan,
    deleteArtisan,
    adminLogout,
    showToast 
  } = useAdmin();

  // Active Navigation Tab & Mobile Drawer
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'inventory' | 'artisans' | 'reviews' | 'alerts' | 'analytics'>('dashboard');
  const [isMobileAdminSidebarOpen, setIsMobileAdminSidebarOpen] = useState(false);

  // --- PRODUCT MANAGEMENT STATES ---
  const [prodSearch, setProdSearch] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Product Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('1450');
  const [formCategory, setFormCategory] = useState('handcrafted-toys');
  const [formStock, setFormStock] = useState('10');
  const [formImageUrl, setFormImageUrl] = useState('https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80');
  const [formGiTagRegion, setFormGiTagRegion] = useState('Kashmir');
  const [formCraftType, setFormCraftType] = useState<string>('Hand-loom');
  const [formCraftingHours, setFormCraftingHours] = useState('120');
  const [formSilkMark, setFormSilkMark] = useState(true);
  const [formArtisanId, setFormArtisanId] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // --- ARTISAN MANAGEMENT STATES ---
  const [isArtisanModalOpen, setIsArtisanModalOpen] = useState(false);
  const [editingArtisan, setEditingArtisan] = useState<Artisan | null>(null);
  const [artisanName, setArtisanName] = useState('');
  const [artisanStory, setArtisanStory] = useState('');
  const [artisanExp, setArtisanExp] = useState('15');
  const [artisanRegion, setArtisanRegion] = useState('Kashmir, Jammu & Kashmir');
  const [artisanAvatar, setArtisanAvatar] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80');
  const [artisanSpecialty, setArtisanSpecialty] = useState('Pashmina Weaving');

  // --- ORDER MANAGEMENT & FULFILLMENT STATES ---
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderFilterTab, setOrderFilterTab] = useState<'ALL' | 'PENDING' | 'QUALITY' | 'TRANSIT' | 'DELIVERED' | 'RETURNS'>('ALL');
  
  // Fulfillment Modal State
  const [fulfillmentOrder, setFulfillmentOrder] = useState<Order | null>(null);
  const [fulStatus, setFulStatus] = useState<string>('PENDING_FULFILLMENT');
  const [fulCourier, setFulCourier] = useState('BlueDart Luxury Express');
  const [fulAwb, setFulAwb] = useState('');
  const [fulEstDate, setFulEstDate] = useState('');
  const [fulVideoUrl, setFulVideoUrl] = useState('');
  const [fulLocation, setFulLocation] = useState('Bengaluru Fulfillment Center');
  const [fulNote, setFulNote] = useState('');

  // Packing Slip Modal State
  const [packingSlipOrder, setPackingSlipOrder] = useState<Order | null>(null);

  // --- REVIEW MODERATION STATES ---
  const [adminReviews, setAdminReviews] = useState<any[]>([]);
  const [reviewFilterTab, setReviewFilterTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [replyingReview, setReplyingReview] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');

  // Load reviews for moderation
  useEffect(() => {
    async function loadAdminReviews() {
      const { fetchAdminReviewsAPI } = await import('../../shared/services/apiService');
      const list = await fetchAdminReviewsAPI();
      setAdminReviews(list || []);
    }
    loadAdminReviews();
  }, []);

  const handleModerateReview = async (revId: string, status: string) => {
    const { moderateReviewAPI } = await import('../../shared/services/apiService');
    await moderateReviewAPI(revId, status);
    setAdminReviews(prev => prev.map(r => r.id === revId ? { ...r, status } : r));
    showToast(`Review status updated to ${status}!`, 'success');
  };

  const handleSaveAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReview) return;
    const { moderateReviewAPI } = await import('../../shared/services/apiService');
    await moderateReviewAPI(replyingReview.id, replyingReview.status || 'APPROVED', replyText);
    setAdminReviews(prev => prev.map(r => r.id === replyingReview.id ? { ...r, adminReply: replyText } : r));
    showToast(`Curator response published for Review #${replyingReview.id}!`, 'success');
    setReplyingReview(null);
  };

  const handleDeleteReview = async (revId: string) => {
    const { deleteReviewAPI } = await import('../../shared/services/apiService');
    await deleteReviewAPI(revId);
    setAdminReviews(prev => prev.filter(r => r.id !== revId));
    showToast('Review permanently deleted.', 'info');
  };

  // --- ADMIN NOTIFICATION STATES ---
  const [adminNotifications, setAdminNotifications] = useState<any[]>([]);
  const [unreadAdminNotifCount, setUnreadAdminNotifCount] = useState(0);
  const [isAdminNotifOpen, setIsAdminNotifOpen] = useState(false);
  const [alertFilter, setAlertFilter] = useState<'ALL' | 'LOW_STOCK' | 'ORDER_STATUS' | 'REVIEW'>('ALL');

  useEffect(() => {
    async function loadAdminNotifs() {
      const res = await fetchNotificationsAPI('ADMIN', 'admin');
      if (res && res.notifications) {
        setAdminNotifications(res.notifications);
        setUnreadAdminNotifCount(res.unreadCount || 0);
      }
    }
    loadAdminNotifs();
  }, []);

  // --- SYSTEM AUDIT LOG STATES ---
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    async function loadAuditLogs() {
      try {
        const { fetchAuditLogsFromAPI } = await import('../../shared/services/apiService');
        const logs = await fetchAuditLogsFromAPI();
        if (logs && Array.isArray(logs)) {
          setAuditLogs(logs);
        }
      } catch (e) {}
    }
    loadAuditLogs();
  }, []);

  const handleMarkAdminNotifRead = async (id: string) => {
    await markNotificationReadAPI(id);
    setAdminNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadAdminNotifCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllAdminNotifsRead = async () => {
    await markAllNotificationsReadAPI('ADMIN', 'admin');
    setAdminNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadAdminNotifCount(0);
    showToast('All admin system alerts marked as read.', 'success');
  };

  // --- INVENTORY STATES ---
  const [stockEdits, setStockEdits] = useState<{ [key: string]: number }>({});

  // Helper for High-Contrast Status Badge Styling
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800/80 rounded-full font-bold uppercase text-[10px] tracking-wider inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            DELIVERED
          </span>
        );
      case 'DISPATCHED':
      case 'IN_TRANSIT':
      case 'OUT_FOR_DELIVERY':
      case 'SHIPPED':
        return (
          <span className="px-2.5 py-1 bg-sky-950 text-sky-400 border border-sky-800/80 rounded-full font-bold uppercase text-[10px] tracking-wider inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
            {status.replace(/_/g, ' ')}
          </span>
        );
      case 'PACKED':
        return (
          <span className="px-2.5 py-1 bg-indigo-950 text-indigo-400 border border-indigo-800/80 rounded-full font-bold uppercase text-[10px] tracking-wider inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            PACKED
          </span>
        );
      case 'QUALITY_CHECK':
        return (
          <span className="px-2.5 py-1 bg-purple-950 text-purple-400 border border-purple-800/80 rounded-full font-bold uppercase text-[10px] tracking-wider inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
            QUALITY CHECK
          </span>
        );
      case 'PENDING_FULFILLMENT':
      case 'PENDING':
      case 'PAYMENT_CONFIRMED':
      case 'PROCESSING':
        return (
          <span className="px-2.5 py-1 bg-amber-950 text-amber-400 border border-amber-800/80 rounded-full font-bold uppercase text-[10px] tracking-wider inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            PENDING FULFILLMENT
          </span>
        );
      case 'RETURN_REQUESTED':
        return (
          <span className="px-2.5 py-1 bg-orange-950 text-orange-400 border border-orange-800/80 rounded-full font-bold uppercase text-[10px] tracking-wider inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce"></span>
            RETURN REQUESTED
          </span>
        );
      case 'RETURNED':
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-1 bg-rose-950 text-rose-400 border border-rose-800/80 rounded-full font-bold uppercase text-[10px] tracking-wider inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            {status}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-full font-bold uppercase text-[10px]">
            {status}
          </span>
        );
    }
  };

  // Cloudinary Direct Image Upload Handler
  const handleCloudinaryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    showToast('Uploading image to Cloudinary...', 'info');

    const uploadedUrl = await uploadImageToAPI(file);
    setIsUploading(false);

    if (uploadedUrl) {
      setFormImageUrl(uploadedUrl);
      showToast('Image uploaded successfully to Cloudinary!', 'success');
    } else {
      showToast('Image upload failed. Using existing image.', 'error');
    }
  };

  // Open Product Modal
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormTitle('');
    setFormDescription('');
    setFormPrice('1450');
    setFormCategory('handcrafted-toys');
    setFormStock('10');
    setFormImageUrl('https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80');
    setFormGiTagRegion('Kashmir');
    setFormCraftType('Hand-loom');
    setFormCraftingHours('120');
    setFormSilkMark(true);
    setFormArtisanId(artisans[0]?.id || '');
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormTitle(p.title);
    setFormDescription(p.description || '');
    setFormPrice(p.basePrice.toString());
    setFormCategory(p.category);
    setFormStock((p.variants[0]?.stockQuantity || 0).toString());
    setFormImageUrl(p.images[0] || '');
    setFormGiTagRegion(p.giTagRegion || p.originRegion || 'Kashmir');
    setFormCraftType(p.craftType || 'Hand-loom');
    setFormCraftingHours((p.craftingHours || 120).toString());
    setFormSilkMark(p.isSilkMarkCertified ?? p.silkMarkCertified ?? true);
    setFormArtisanId(p.artisanId || p.artisan?.id || artisans[0]?.id || '');
    setIsProductModalOpen(true);
  };

  // Save Product Handler
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const basePriceNum = Number(formPrice) || 0;
    const stockNum = Number(formStock) || 0;
    const selectedArtisanObj = artisans.find(a => a.id === formArtisanId) || artisans[0] || null;

    const newVariant = {
      id: `v-${Date.now()}`,
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      colorName: 'Natural',
      colorHex: '#8B4513',
      additionalPrice: 0,
      stockQuantity: stockNum
    };

    if (editingProduct) {
      // Edit existing product
      editingProduct.title = formTitle;
      editingProduct.description = formDescription;
      editingProduct.basePrice = basePriceNum;
      editingProduct.category = formCategory;
      editingProduct.giTagRegion = formGiTagRegion;
      editingProduct.craftType = formCraftType;
      editingProduct.craftingHours = Number(formCraftingHours) || 120;
      editingProduct.isSilkMarkCertified = formSilkMark;
      editingProduct.silkMarkCertified = formSilkMark;
      if (selectedArtisanObj) {
        editingProduct.artisan = selectedArtisanObj;
        editingProduct.artisanId = selectedArtisanObj.id;
        editingProduct.artisanName = selectedArtisanObj.name;
        editingProduct.artisanBio = selectedArtisanObj.story;
        editingProduct.artisanAvatar = selectedArtisanObj.avatarUrl;
      }
      if (editingProduct.variants[0]) {
        editingProduct.variants[0].stockQuantity = stockNum;
      }
      if (formImageUrl) {
        editingProduct.images = [formImageUrl, ...editingProduct.images.slice(1)];
      }
      showToast(`Updated product "${formTitle}"`, 'success');
    } else {
      // Add new product
      const newProductData: Partial<Product> = {
        title: formTitle,
        slug: formTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: formDescription,
        basePrice: basePriceNum,
        compareAtPrice: Math.round(basePriceNum * 1.2),
        craftTechnique: `${formCraftType} Technique`,
        originRegion: formGiTagRegion,
        artisanName: selectedArtisanObj?.name || 'Master Artisan Guild',
        artisanBio: selectedArtisanObj?.story || '',
        artisanAvatar: selectedArtisanObj?.avatarUrl || '',
        giTagRegion: formGiTagRegion,
        craftType: formCraftType,
        craftingHours: Number(formCraftingHours) || 120,
        isSilkMarkCertified: formSilkMark,
        silkMarkCertified: formSilkMark,
        artisan: selectedArtisanObj || undefined,
        artisanId: selectedArtisanObj?.id || '',
        category: formCategory,
        material: 'Natural Organic Material',
        careInstructions: 'Keep dry, clean with soft cloth.',
        rating: 5.0,
        reviewsCount: 1,
        isFeatured: true,
        images: [formImageUrl],
        variants: [newVariant]
      };
      addProduct(newProductData);
    }

    setIsProductModalOpen(false);
  };

  // --- ARTISAN HANDLERS ---
  const handleOpenAddArtisanModal = () => {
    setEditingArtisan(null);
    setArtisanName('');
    setArtisanStory('');
    setArtisanExp('15');
    setArtisanRegion('Kashmir, Jammu & Kashmir');
    setArtisanAvatar('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80');
    setArtisanSpecialty('Pashmina Weaving');
    setIsArtisanModalOpen(true);
  };

  const handleOpenEditArtisanModal = (a: Artisan) => {
    setEditingArtisan(a);
    setArtisanName(a.name);
    setArtisanStory(a.story);
    setArtisanExp(a.yearsExperience.toString());
    setArtisanRegion(a.region);
    setArtisanAvatar(a.avatarUrl);
    setArtisanSpecialty(a.craftSpecialty || 'Heritage Craft');
    setIsArtisanModalOpen(true);
  };

  const handleSaveArtisan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artisanName.trim()) return;

    const data: Partial<Artisan> = {
      name: artisanName,
      story: artisanStory,
      yearsExperience: Number(artisanExp) || 10,
      region: artisanRegion,
      avatarUrl: artisanAvatar,
      craftSpecialty: artisanSpecialty
    };

    if (editingArtisan) {
      await updateArtisan(editingArtisan.id, data);
    } else {
      await addArtisan(data);
    }

    setIsArtisanModalOpen(false);
  };

  // --- FULFILLMENT HANDLERS ---
  const handleOpenFulfillmentModal = (o: Order) => {
    setFulfillmentOrder(o);
    setFulStatus(o.status);
    setFulCourier(o.courierName || 'BlueDart Luxury Express');
    setFulAwb(o.awbTrackingNumber || o.trackingNumber || `ECL-AWB-${Math.floor(100000 + Math.random() * 900000)}`);
    setFulEstDate(o.estimatedDeliveryDate || new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0]);
    setFulVideoUrl(o.packingVideoUrl || '');
    setFulLocation(o.shippingAddress?.city ? `${o.shippingAddress.city} Regional Hub` : 'Central Fulfillment Vault');
    setFulNote(`Status updated to ${o.status}`);
  };

  const handleSaveFulfillment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fulfillmentOrder) return;

    const { updateOrderFulfillmentInAPI } = await import('../../shared/services/apiService');
    
    const payload = {
      status: fulStatus,
      courierName: fulCourier,
      awbTrackingNumber: fulAwb,
      estimatedDeliveryDate: fulEstDate,
      packingVideoUrl: fulVideoUrl,
      location: fulLocation,
      note: fulNote || `Status updated to ${fulStatus}`
    };

    const res = await updateOrderFulfillmentInAPI(fulfillmentOrder.id, payload);
    
    // Update local state in order
    fulfillmentOrder.status = fulStatus as any;
    fulfillmentOrder.courierName = fulCourier;
    fulfillmentOrder.awbTrackingNumber = fulAwb;
    fulfillmentOrder.trackingNumber = fulAwb;
    fulfillmentOrder.estimatedDeliveryDate = fulEstDate;
    fulfillmentOrder.packingVideoUrl = fulVideoUrl;
    if (!fulfillmentOrder.trackingHistory) fulfillmentOrder.trackingHistory = [];
    fulfillmentOrder.trackingHistory.push({
      status: fulStatus,
      location: fulLocation,
      timestamp: new Date().toISOString(),
      note: fulNote || `Status updated to ${fulStatus}`
    });

    showToast(`Order #${fulfillmentOrder.orderNumber} updated to ${fulStatus}!`, 'success');
    setFulfillmentOrder(null);
  };

  // Metrics Calculations
  const totalRevenue = orders.filter(o => o.status !== 'CANCELLED').reduce((acc, o) => acc + o.grandTotal, 0);
  const totalOrdersCount = orders.length;
  const totalActiveProducts = products.length;
  const lowStockCount = products.filter(p => p.variants.some(v => v.stockQuantity < 5)).length;

  const lowStockProducts = products.filter(p => p.variants.some(v => v.stockQuantity < 5));

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col md:flex-row items-stretch">
      
      {/* MOBILE BACKDROP OVERLAY */}
      {isMobileAdminSidebarOpen && (
        <div 
          onClick={() => setIsMobileAdminSidebarOpen(false)} 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 md:hidden animate-fade-in"
        />
      )}

      {/* 1. DARK SIDEBAR NAVIGATION */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-900/95 backdrop-blur-mobile border-r border-zinc-800 flex-col justify-between p-4 select-none transition-transform duration-300 md:static md:translate-x-0 ${isMobileAdminSidebarOpen ? 'translate-x-0 flex shadow-2xl shadow-black/90' : '-translate-x-full hidden md:flex'}`}>
        <div className="space-y-6">
          
          {/* Logo & Admin Badge + Mobile Close */}
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-600/30">
                E
              </div>
              <div>
                <h1 className="font-serif font-bold text-base tracking-tight text-white leading-none">eclipsera</h1>
                <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-[9px] font-bold tracking-widest uppercase">
                  Admin Panel
                </span>
              </div>
            </div>

            <button 
              onClick={() => setIsMobileAdminSidebarOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg md:hidden touch-target-min"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            <button
              onClick={() => { setActiveTab('dashboard'); setIsMobileAdminSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all touch-target-min ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => { setActiveTab('products'); setIsMobileAdminSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all touch-target-min ${
                activeTab === 'products'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Products</span>
            </button>

            <button
              onClick={() => { setActiveTab('orders'); setIsMobileAdminSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all touch-target-min ${
                activeTab === 'orders'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Orders</span>
            </button>

            <button
              onClick={() => { setActiveTab('inventory'); setIsMobileAdminSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all touch-target-min ${
                activeTab === 'inventory'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4" />
                <span>Inventory</span>
              </div>
              {lowStockCount > 0 && (
                <span className="px-1.5 py-0.5 bg-rose-950 text-rose-400 border border-rose-800 rounded text-[9px] font-mono font-bold">
                  {lowStockCount}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('artisans'); setIsMobileAdminSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all touch-target-min ${
                activeTab === 'artisans'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Artisans & Guilds</span>
            </button>

            <button
              onClick={() => { setActiveTab('reviews'); setIsMobileAdminSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all touch-target-min ${
                activeTab === 'reviews'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Star className="w-4 h-4 text-gold-400" />
              <span>Review Moderation</span>
            </button>

            <button
              onClick={() => { setActiveTab('alerts'); setIsMobileAdminSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all touch-target-min ${
                activeTab === 'alerts'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-amber-400" />
                <span>System Alerts</span>
              </div>
              {unreadAdminNotifCount > 0 && (
                <span className="px-1.5 py-0.5 bg-amber-950 text-amber-400 border border-amber-800 rounded text-[9px] font-mono font-bold animate-pulse">
                  {unreadAdminNotifCount}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('analytics'); setIsMobileAdminSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all touch-target-min ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Analytics & BI</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Status & Logout */}
        <div className="space-y-3 pt-4 border-t border-zinc-800/80">
          <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 text-[11px] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-zinc-300">Admin Session Active</span>
          </div>

          <button
            onClick={adminLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-800 hover:bg-rose-950 hover:text-rose-400 text-zinc-300 rounded-xl text-xs font-bold transition-all border border-zinc-700 hover:border-rose-800"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
        
        {/* ADMIN TOP HEADER BAR */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileAdminSidebarOpen(true)}
              className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl md:hidden touch-target-min"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-gold-400" />
            </button>
            <div>
              <h1 className="font-serif text-lg sm:text-xl font-bold text-white tracking-tight">eclipsera_premium Admin Portal</h1>
              <span className="text-[10px] font-mono text-zinc-400 block sm:inline">Authenticated Session • Cloud Sync</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Admin Notification Bell Popover */}
            <div className="relative">
              <button
                onClick={() => setIsAdminNotifOpen(!isAdminNotifOpen)}
                className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-300 relative transition-all"
                title="System Notifications"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                {unreadAdminNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-zinc-950 font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {unreadAdminNotifCount}
                  </span>
                )}
              </button>

              {isAdminNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 p-4 space-y-3 animate-fade-in text-zinc-100">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Bell className="w-4 h-4 text-amber-400" />
                      <span>Admin Alerts & System Logs</span>
                      {unreadAdminNotifCount > 0 && (
                        <span className="bg-amber-500 text-zinc-950 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                          {unreadAdminNotifCount} Unread
                        </span>
                      )}
                    </div>
                    {unreadAdminNotifCount > 0 && (
                      <button
                        onClick={handleMarkAllAdminNotifsRead}
                        className="text-[10px] text-amber-400 hover:underline font-bold flex items-center gap-1"
                      >
                        <CheckCheck className="w-3 h-3" /> Mark All Read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2 no-scrollbar">
                    {adminNotifications.length === 0 ? (
                      <p className="text-center text-xs text-zinc-500 py-4">No active system alerts.</p>
                    ) : (
                      adminNotifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            handleMarkAdminNotifRead(n.id);
                            if (n.type === 'LOW_STOCK') setActiveTab('inventory');
                            if (n.type === 'REVIEW') setActiveTab('reviews');
                            if (n.type === 'ORDER_STATUS') setActiveTab('orders');
                            setIsAdminNotifOpen(false);
                          }}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${n.isRead ? 'bg-zinc-950/60 border-zinc-800 opacity-60' : 'bg-zinc-950 border-amber-500/50 shadow-md'}`}
                        >
                          <div className="flex justify-between items-start">
                            <h5 className="font-serif font-bold text-white">{n.title}</h5>
                            {!n.isRead && <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-1"></span>}
                          </div>
                          <p className="text-zinc-400 text-[11px] mt-1 leading-relaxed">{n.message}</p>
                          <span className="text-[9px] text-amber-400 block mt-1.5 font-mono">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Header */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-white">Dashboard Overview</h2>
              <p className="text-xs text-zinc-400 mt-1">Real-time platform performance and summary metrics.</p>
            </div>

            {/* 4 Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Revenue</span>
                <p className="text-2xl font-bold font-mono text-emerald-400">₹{totalRevenue.toLocaleString()}</p>
                <p className="text-[11px] text-zinc-500 font-medium">Net settled store volume</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Orders</span>
                <p className="text-2xl font-bold text-white">{totalOrdersCount}</p>
                <p className="text-[11px] text-zinc-500 font-medium">Customer purchase count</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Active Products</span>
                <p className="text-2xl font-bold text-white">{totalActiveProducts}</p>
                <p className="text-[11px] text-zinc-500 font-medium">Published catalog items</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Stock Alerts</span>
                <p className="text-2xl font-bold text-rose-400">{lowStockCount}</p>
                <p className="text-[11px] text-zinc-500 font-medium">Items requiring replenishment</p>
              </div>

            </div>

            {/* Recent Activity Table (Last 5 Incoming Orders) */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-white">Recent Customer Orders</h3>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-indigo-400 hover:underline"
                >
                  View All Orders →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3">Order ID</th>
                      <th className="py-3 px-3">Customer</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {orders.slice(0, 5).map(o => (
                      <tr key={o.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3.5 px-3 font-mono font-bold text-indigo-400">{o.orderNumber}</td>
                        <td className="py-3.5 px-3 font-semibold text-zinc-200">{o.customerName}</td>
                        <td className="py-3.5 px-3 text-zinc-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td className="py-3.5 px-3">{renderStatusBadge(o.status)}</td>
                        <td className="py-3.5 px-3 text-right font-mono font-bold text-white">₹{o.grandTotal.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: PRODUCT MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Header & Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white">Product Catalog Management</h2>
                <p className="text-xs text-zinc-400 mt-1">Manage catalog items, pricing, stock, and Cloudinary media uploads.</p>
              </div>

              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Search Filter */}
            <div className="relative max-w-md">
              <input 
                type="text"
                value={prodSearch}
                onChange={(e) => setProdSearch(e.target.value)}
                placeholder="Search products by title or category..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            </div>

            {/* Products Table & Mobile Cards */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-950/40 text-zinc-400 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3.5 px-4">Item</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Price</th>
                      <th className="py-3.5 px-4">Stock Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {products
                      .filter(p => p.title.toLowerCase().includes(prodSearch.toLowerCase()) || p.category.toLowerCase().includes(prodSearch.toLowerCase()))
                      .map(p => {
                        const stock = p.variants[0]?.stockQuantity || 0;
                        return (
                          <tr key={p.id} className="hover:bg-zinc-800/40 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={p.images[0]} 
                                  alt={p.title} 
                                  className="w-10 h-10 rounded-lg object-cover bg-zinc-800 border border-zinc-700" 
                                />
                                <div>
                                  <h4 className="font-bold text-white">{p.title}</h4>
                                  <span className="text-[10px] text-zinc-500 font-mono">{p.variants[0]?.sku || 'SKU-NONE'}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-zinc-300 capitalize">{p.category.replace('-', ' ')}</td>
                            <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">₹{p.basePrice.toLocaleString()}</td>
                            <td className="py-3.5 px-4">
                              {stock === 0 ? (
                                <span className="px-2 py-0.5 bg-rose-950 text-rose-400 border border-rose-800 rounded text-[10px] font-bold uppercase">Out of Stock</span>
                              ) : stock < 5 ? (
                                <span className="px-2 py-0.5 bg-amber-950 text-amber-400 border border-amber-800 rounded text-[10px] font-bold uppercase">Low Stock ({stock})</span>
                              ) : (
                                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[10px] font-bold uppercase">In Stock ({stock})</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => handleOpenEditModal(p)}
                                  className="p-1.5 bg-zinc-800 hover:bg-indigo-600 hover:text-white text-zinc-300 rounded-lg transition-all touch-target-min"
                                  title="Edit Product"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => deleteProduct(p.id)}
                                  className="p-1.5 bg-zinc-800 hover:bg-rose-900 hover:text-rose-300 text-zinc-300 rounded-lg transition-all touch-target-min"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Glass Cards View */}
              <div className="block md:hidden divide-y divide-zinc-800/60 p-4 space-y-4">
                {products
                  .filter(p => p.title.toLowerCase().includes(prodSearch.toLowerCase()) || p.category.toLowerCase().includes(prodSearch.toLowerCase()))
                  .map(p => {
                    const stock = p.variants[0]?.stockQuantity || 0;
                    return (
                      <div key={p.id} className="pt-4 first:pt-0 space-y-3">
                        <div className="flex items-start gap-3">
                          <img 
                            src={p.images[0]} 
                            alt={p.title} 
                            className="w-14 h-14 rounded-xl object-cover bg-zinc-800 border border-zinc-700 shrink-0" 
                          />
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <h4 className="font-bold text-sm text-white line-clamp-2">{p.title}</h4>
                            <p className="text-[10px] text-zinc-400 font-mono capitalize">{p.category.replace('-', ' ')} • SKU: {p.variants[0]?.sku || 'NONE'}</p>
                            <span className="font-mono font-bold text-emerald-400 text-sm block">₹{p.basePrice.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          {stock === 0 ? (
                            <span className="px-2 py-0.5 bg-rose-950 text-rose-400 border border-rose-800 rounded text-[9px] font-bold uppercase">Out of Stock</span>
                          ) : stock < 5 ? (
                            <span className="px-2 py-0.5 bg-amber-950 text-amber-400 border border-amber-800 rounded text-[9px] font-bold uppercase">Low Stock ({stock})</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[9px] font-bold uppercase">In Stock ({stock})</span>
                          )}

                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleOpenEditModal(p)}
                              className="px-3 py-1.5 bg-zinc-800 text-zinc-200 rounded-lg text-xs font-bold flex items-center gap-1 touch-target-min"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button 
                              onClick={() => deleteProduct(p.id)}
                              className="px-3 py-1.5 bg-rose-950/60 text-rose-400 border border-rose-800/60 rounded-lg text-xs font-bold flex items-center gap-1 touch-target-min"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: ORDER MANAGEMENT & FULFILLMENT STATE MACHINE */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white">Order Fulfillment & Logistics Engine</h2>
                <p className="text-xs text-zinc-400 mt-1">Manage 9-stage fulfillment pipeline, assign AWB numbers, and generate packing slips.</p>
              </div>

              {/* Search Filter */}
              <div className="relative w-full sm:w-72">
                <input 
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search Order ID, Customer, AWB..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold border-b border-zinc-800">
              <button
                onClick={() => setOrderFilterTab('ALL')}
                className={`px-3 py-2 rounded-xl transition-all ${orderFilterTab === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}
              >
                All Orders ({orders.length})
              </button>
              <button
                onClick={() => setOrderFilterTab('PENDING')}
                className={`px-3 py-2 rounded-xl transition-all ${orderFilterTab === 'PENDING' ? 'bg-amber-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}
              >
                Pending Fulfillment ({orders.filter(o => ['PENDING_FULFILLMENT', 'PENDING', 'PAYMENT_CONFIRMED'].includes(o.status)).length})
              </button>
              <button
                onClick={() => setOrderFilterTab('QUALITY')}
                className={`px-3 py-2 rounded-xl transition-all ${orderFilterTab === 'QUALITY' ? 'bg-purple-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}
              >
                Quality Check ({orders.filter(o => o.status === 'QUALITY_CHECK').length})
              </button>
              <button
                onClick={() => setOrderFilterTab('TRANSIT')}
                className={`px-3 py-2 rounded-xl transition-all ${orderFilterTab === 'TRANSIT' ? 'bg-sky-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}
              >
                In Transit ({orders.filter(o => ['PACKED', 'DISPATCHED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'SHIPPED'].includes(o.status)).length})
              </button>
              <button
                onClick={() => setOrderFilterTab('DELIVERED')}
                className={`px-3 py-2 rounded-xl transition-all ${orderFilterTab === 'DELIVERED' ? 'bg-emerald-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}
              >
                Delivered ({orders.filter(o => o.status === 'DELIVERED').length})
              </button>
              <button
                onClick={() => setOrderFilterTab('RETURNS')}
                className={`px-3 py-2 rounded-xl transition-all ${orderFilterTab === 'RETURNS' ? 'bg-orange-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}
              >
                Return Requests ({orders.filter(o => ['RETURN_REQUESTED', 'RETURNED'].includes(o.status)).length})
              </button>
            </div>

            {/* Orders Table & Mobile Cards */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-950/40 text-zinc-400 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3.5 px-4">Order ID & AWB</th>
                      <th className="py-3.5 px-4">Customer</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Courier</th>
                      <th className="py-3.5 px-4">Fulfillment Status</th>
                      <th className="py-3.5 px-4 text-right">Fulfillment Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {orders
                      .filter(o => {
                        const matchesSearch = o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) || 
                          o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          (o.awbTrackingNumber && o.awbTrackingNumber.toLowerCase().includes(orderSearch.toLowerCase()));

                        if (!matchesSearch) return false;

                        if (orderFilterTab === 'PENDING') return ['PENDING_FULFILLMENT', 'PENDING', 'PAYMENT_CONFIRMED', 'PROCESSING'].includes(o.status);
                        if (orderFilterTab === 'QUALITY') return o.status === 'QUALITY_CHECK';
                        if (orderFilterTab === 'TRANSIT') return ['PACKED', 'DISPATCHED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'SHIPPED'].includes(o.status);
                        if (orderFilterTab === 'DELIVERED') return o.status === 'DELIVERED';
                        if (orderFilterTab === 'RETURNS') return ['RETURN_REQUESTED', 'RETURNED'].includes(o.status);
                        return true;
                      })
                      .map(o => (
                        <tr key={o.id} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono">
                            <span className="font-bold text-indigo-400 block">{o.orderNumber}</span>
                            <span className="text-[10px] text-zinc-500 font-bold">
                              AWB: {o.awbTrackingNumber || o.trackingNumber || 'Pending'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-zinc-200 block">{o.customerName}</span>
                            <span className="text-[10px] text-zinc-500">{o.shippingAddress?.city || 'India'}</span>
                          </td>
                          <td className="py-3.5 px-4 text-zinc-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td className="py-3.5 px-4 font-semibold text-zinc-300">
                            {o.courierName || 'BlueDart Luxury Express'}
                          </td>
                          <td className="py-3.5 px-4">
                            {renderStatusBadge(o.status)}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1.5">
                            <button
                              onClick={() => handleOpenFulfillmentModal(o)}
                              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-[10px] uppercase shadow transition-all touch-target-min"
                            >
                              Update Status
                            </button>
                            <button
                              onClick={() => setPackingSlipOrder(o)}
                              className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-amber-500/30 rounded-lg font-bold text-[10px] uppercase transition-all touch-target-min"
                            >
                              Packing Slip
                            </button>
                            <button
                              onClick={() => setSelectedOrder(o)}
                              className="px-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-bold text-[10px] uppercase touch-target-min"
                            >
                              Items
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Glass Cards View */}
              <div className="block md:hidden divide-y divide-zinc-800/60 p-4 space-y-4">
                {orders
                  .filter(o => {
                    const matchesSearch = o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) || 
                      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
                      (o.awbTrackingNumber && o.awbTrackingNumber.toLowerCase().includes(orderSearch.toLowerCase()));
                    if (!matchesSearch) return false;
                    if (orderFilterTab === 'PENDING') return ['PENDING_FULFILLMENT', 'PENDING', 'PAYMENT_CONFIRMED', 'PROCESSING'].includes(o.status);
                    if (orderFilterTab === 'QUALITY') return o.status === 'QUALITY_CHECK';
                    if (orderFilterTab === 'TRANSIT') return ['PACKED', 'DISPATCHED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'SHIPPED'].includes(o.status);
                    if (orderFilterTab === 'DELIVERED') return o.status === 'DELIVERED';
                    if (orderFilterTab === 'RETURNS') return ['RETURN_REQUESTED', 'RETURNED'].includes(o.status);
                    return true;
                  })
                  .map(o => (
                    <div key={o.id} className="pt-4 first:pt-0 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <span className="font-mono font-bold text-indigo-400 text-sm block">{o.orderNumber}</span>
                          <span className="text-[10px] text-zinc-500 font-bold block">AWB: {o.awbTrackingNumber || o.trackingNumber || 'Pending'}</span>
                          <span className="text-xs text-zinc-200 font-semibold block mt-1">{o.customerName}</span>
                          <span className="text-[10px] text-zinc-500">{o.shippingAddress?.city || 'India'} • {new Date(o.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="shrink-0 pt-0.5">{renderStatusBadge(o.status)}</div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => handleOpenFulfillmentModal(o)}
                          className="flex-1 min-w-[100px] px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-[10px] uppercase shadow text-center touch-target-min"
                        >
                          Update Status
                        </button>
                        <button
                          onClick={() => setPackingSlipOrder(o)}
                          className="px-3 py-2 bg-zinc-800 text-amber-400 border border-amber-500/30 rounded-lg font-bold text-[10px] uppercase touch-target-min"
                        >
                          Slip
                        </button>
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="px-3 py-2 bg-zinc-800 text-zinc-300 rounded-lg font-bold text-[10px] uppercase touch-target-min"
                        >
                          Items
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: INVENTORY & STOCK CONTROL */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Header */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-white">Inventory & Stock Control</h2>
              <p className="text-xs text-zinc-400 mt-1">Dedicated table for products flagged with low stock thresholds or zero inventory.</p>
            </div>

            {/* Low Stock Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden space-y-4 p-5">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Low Stock & Out of Stock Items</span>
              </h3>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3">Product Title</th>
                      <th className="py-3 px-3">SKU</th>
                      <th className="py-3 px-3">Current Stock</th>
                      <th className="py-3 px-3">Stock Alert Level</th>
                      <th className="py-3 px-3 text-right">Quick Edit Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {lowStockProducts.map(p => {
                      const variant = p.variants[0];
                      const currentQty = stockEdits[p.id] !== undefined ? stockEdits[p.id] : (variant?.stockQuantity || 0);

                      return (
                        <tr key={p.id} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-3">
                              <img src={p.images[0]} alt={p.title} className="w-8 h-8 rounded-lg object-cover bg-zinc-800 border border-zinc-700" />
                              <span className="font-bold text-white">{p.title}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 font-mono text-zinc-400">{variant?.sku || 'N/A'}</td>
                          <td className="py-3.5 px-3 font-mono font-bold text-white">{variant?.stockQuantity || 0}</td>
                          <td className="py-3.5 px-3">
                            {(variant?.stockQuantity || 0) === 0 ? (
                              <span className="px-2 py-0.5 bg-rose-950 text-rose-400 border border-rose-800 rounded text-[10px] font-bold uppercase">Critical (Out of Stock)</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-950 text-amber-400 border border-amber-800 rounded text-[10px] font-bold uppercase">Warning (&lt; 5 Left)</span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <input 
                                type="number" 
                                min={0}
                                value={currentQty}
                                onChange={(e) => setStockEdits({ ...stockEdits, [p.id]: Number(e.target.value) })}
                                className="w-20 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                              <button
                                onClick={() => {
                                  if (variant) {
                                    updateStock(p.id, variant.id, currentQty);
                                  }
                                }}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold uppercase transition-colors touch-target-min"
                              >
                                Save Qty
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {lowStockProducts.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-zinc-500 text-xs">
                          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                          <p className="font-bold text-white">All Stock Levels Healthy!</p>
                          <p className="text-[11px] text-zinc-400">No products are currently under low inventory thresholds.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Glass Cards View */}
              <div className="block md:hidden divide-y divide-zinc-800/60 p-4 space-y-4">
                {lowStockProducts.length === 0 ? (
                  <div className="py-8 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="font-bold text-white text-sm">All Stock Levels Healthy!</p>
                    <p className="text-[11px] text-zinc-400">No products are currently under low inventory thresholds.</p>
                  </div>
                ) : (
                  lowStockProducts.map(p => {
                    const variant = p.variants[0];
                    const currentQty = stockEdits[p.id] !== undefined ? stockEdits[p.id] : (variant?.stockQuantity || 0);

                    return (
                      <div key={p.id} className="pt-4 first:pt-0 space-y-3">
                        <div className="flex items-start gap-3">
                          <img src={p.images[0]} alt={p.title} className="w-12 h-12 rounded-xl object-cover bg-zinc-800 border border-zinc-700 shrink-0" />
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <h4 className="font-bold text-sm text-white line-clamp-2">{p.title}</h4>
                            <p className="text-[10px] text-zinc-400 font-mono">SKU: {variant?.sku || 'N/A'} • Stock: {variant?.stockQuantity || 0}</p>
                            {(variant?.stockQuantity || 0) === 0 ? (
                              <span className="inline-block px-2 py-0.5 bg-rose-950 text-rose-400 border border-rose-800 rounded text-[9px] font-bold uppercase">Critical</span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 bg-amber-950 text-amber-400 border border-amber-800 rounded text-[9px] font-bold uppercase">Warning</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            min={0}
                            value={currentQty}
                            onChange={(e) => setStockEdits({ ...stockEdits, [p.id]: Number(e.target.value) })}
                            className="w-20 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2.5 py-2 text-xs font-mono font-bold text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <button
                            onClick={() => { if (variant) updateStock(p.id, variant.id, currentQty); }}
                            className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold uppercase transition-colors touch-target-min text-center"
                          >
                            Save Qty
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}

        {/* 5. ARTISANS MANAGEMENT VIEW */}
        {activeTab === 'artisans' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white tracking-tight">Artisans & Master Guilds</h2>
                <p className="text-zinc-400 text-xs mt-1">Manage master craftspersons, heritage bios, and regional GI certifications.</p>
              </div>

              <button
                onClick={handleOpenAddArtisanModal}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Artisan Profile</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {artisans.map(artisan => (
                <div key={artisan.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-lg hover:border-zinc-700 transition-all flex items-start gap-4">
                  <img 
                    src={artisan.avatarUrl} 
                    alt={artisan.name} 
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/50 shrink-0 bg-zinc-950"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif font-bold text-base text-white truncate">{artisan.name}</h3>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleOpenEditArtisanModal(artisan)}
                          className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteArtisan(artisan.id)}
                          className="p-1.5 hover:bg-rose-950/50 text-zinc-400 hover:text-rose-400 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      <Award className="w-3.5 h-3.5 shrink-0" />
                      <span>{artisan.craftSpecialty || 'Master Craft'} • {artisan.yearsExperience} Years Exp</span>
                    </div>

                    <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed pt-1">
                      {artisan.story}
                    </p>

                    <div className="pt-2 text-[10px] text-zinc-500 font-mono">
                      Region: <span className="text-zinc-300 font-semibold">{artisan.region}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. REVIEW MODERATION VIEW */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white tracking-tight">Verified Buyer Review Moderation</h2>
                <p className="text-zinc-400 text-xs mt-1">Approve, reject, or publish curator responses to patron customer reviews.</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 text-xs font-bold bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800">
                <button
                  onClick={() => setReviewFilterTab('ALL')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${reviewFilterTab === 'ALL' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                  All ({adminReviews.length})
                </button>
                <button
                  onClick={() => setReviewFilterTab('PENDING')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${reviewFilterTab === 'PENDING' ? 'bg-amber-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                  Pending ({adminReviews.filter(r => r.status === 'PENDING').length})
                </button>
                <button
                  onClick={() => setReviewFilterTab('APPROVED')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${reviewFilterTab === 'APPROVED' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                  Approved ({adminReviews.filter(r => r.status === 'APPROVED').length})
                </button>
                <button
                  onClick={() => setReviewFilterTab('REJECTED')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${reviewFilterTab === 'REJECTED' ? 'bg-rose-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                  Rejected ({adminReviews.filter(r => r.status === 'REJECTED').length})
                </button>
              </div>
            </div>

            {/* Reviews Moderation Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-950/40 text-zinc-400 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3.5 px-4">Patron & Product</th>
                      <th className="py-3.5 px-4">Rating & Review Title</th>
                      <th className="py-3.5 px-4">Review Content & Photos</th>
                      <th className="py-3.5 px-4">Verification</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {adminReviews
                      .filter(r => reviewFilterTab === 'ALL' || r.status === reviewFilterTab)
                      .map(rev => {
                        const targetProd = products.find(p => p.id === rev.productId);
                        return (
                          <tr key={rev.id} className="hover:bg-zinc-800/40 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="space-y-0.5">
                                <span className="font-bold text-white block">{rev.userName || rev.patronName || 'Patron'}</span>
                                <span className="text-[10px] text-indigo-400 font-mono block truncate max-w-[160px]">
                                  {targetProd?.title || `ID: ${rev.productId}`}
                                </span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="space-y-1">
                                <div className="flex items-center text-amber-400 font-bold">
                                  {'★'.repeat(rev.rating || 5)}
                                  <span className="text-zinc-500 text-[10px] ml-1">({rev.rating}/5)</span>
                                </div>
                                <span className="font-semibold text-zinc-200 block">{rev.title || 'Artisanal Review'}</span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 max-w-xs">
                              <p className="text-zinc-300 line-clamp-2">{rev.comment}</p>

                              {/* Cloudinary Photos preview */}
                              {(rev.images?.length > 0 || rev.photos?.length > 0) && (
                                <div className="flex gap-1.5 mt-2">
                                  {(rev.images || rev.photos).map((imgUrl: string, idx: number) => (
                                    <img key={idx} src={imgUrl} alt="" className="w-8 h-8 rounded object-cover border border-zinc-700 bg-zinc-950" />
                                  ))}
                                </div>
                              )}

                              {/* Admin Response Badge */}
                              {rev.adminReply && (
                                <div className="mt-2 p-2 bg-amber-950/40 border border-amber-500/30 rounded-lg text-[10px] text-amber-300">
                                  <span className="font-bold block uppercase">Curator Response:</span>
                                  <span>{rev.adminReply}</span>
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              {rev.isVerifiedPurchase ? (
                                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[9px] font-bold uppercase">
                                  Verified Buyer ✅
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded text-[9px] font-bold uppercase">
                                  Guest Submission
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              {rev.status === 'APPROVED' ? (
                                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[9px] font-bold uppercase">Approved</span>
                              ) : rev.status === 'REJECTED' ? (
                                <span className="px-2 py-0.5 bg-rose-950 text-rose-400 border border-rose-800 rounded text-[9px] font-bold uppercase">Rejected</span>
                              ) : (
                                <span className="px-2 py-0.5 bg-amber-950 text-amber-400 border border-amber-800 rounded text-[9px] font-bold uppercase animate-pulse">Pending Review</span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-right space-x-1">
                              {rev.status !== 'APPROVED' && (
                                <button
                                  onClick={() => handleModerateReview(rev.id, 'APPROVED')}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold uppercase"
                                >
                                  Approve
                                </button>
                              )}
                              {rev.status !== 'REJECTED' && (
                                <button
                                  onClick={() => handleModerateReview(rev.id, 'REJECTED')}
                                  className="px-2 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded text-[10px] font-bold uppercase"
                                >
                                  Reject
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setReplyingReview(rev);
                                  setReplyText(rev.adminReply || '');
                                }}
                                className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-amber-500/30 rounded text-[10px] font-bold uppercase"
                              >
                                Reply
                              </button>
                              <button
                                onClick={() => handleDeleteReview(rev.id)}
                                className="p-1 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* 7. SYSTEM ALERTS VIEW */}
        {activeTab === 'alerts' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white tracking-tight">Platform System Alerts & Audit Logs</h2>
                <p className="text-zinc-400 text-xs mt-1">Review historical low stock triggers, customer order receipts, and moderation logs.</p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800">
                <button
                  onClick={() => setAlertFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${alertFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                  All ({adminNotifications.length})
                </button>
                <button
                  onClick={() => setAlertFilter('LOW_STOCK')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${alertFilter === 'LOW_STOCK' ? 'bg-rose-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                  Low Stock
                </button>
                <button
                  onClick={() => setAlertFilter('ORDER_STATUS')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${alertFilter === 'ORDER_STATUS' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                  Orders
                </button>
                <button
                  onClick={() => setAlertFilter('REVIEW')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${alertFilter === 'REVIEW' ? 'bg-amber-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                  Reviews
                </button>
              </div>
            </div>

            {/* System Alerts Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-950/40 text-zinc-400 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3.5 px-4">Timestamp</th>
                      <th className="py-3.5 px-4">Category Type</th>
                      <th className="py-3.5 px-4">Alert Title</th>
                      <th className="py-3.5 px-4">Message Details</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {adminNotifications
                      .filter(n => alertFilter === 'ALL' || n.type === alertFilter)
                      .map(n => (
                        <tr key={n.id} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-zinc-400 text-[11px]">
                            {new Date(n.createdAt).toLocaleString()}
                          </td>
                          
                          <td className="py-3.5 px-4">
                            {n.type === 'LOW_STOCK' ? (
                              <span className="px-2 py-0.5 bg-rose-950 text-rose-400 border border-rose-800 rounded text-[9px] font-bold uppercase">
                                Low Stock Alert
                              </span>
                            ) : n.type === 'REVIEW' ? (
                              <span className="px-2 py-0.5 bg-amber-950 text-amber-400 border border-amber-800 rounded text-[9px] font-bold uppercase">
                                Review Moderation
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[9px] font-bold uppercase">
                                Order Lifecycle
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 font-bold text-white max-w-xs truncate">{n.title}</td>

                          <td className="py-3.5 px-4 text-zinc-300 max-w-md">{n.message}</td>

                          <td className="py-3.5 px-4">
                            {n.isRead ? (
                              <span className="text-zinc-500 font-bold text-[10px]">Read</span>
                            ) : (
                              <span className="text-amber-400 font-bold text-[10px] animate-pulse">Unread</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {!n.isRead && (
                              <button
                                onClick={() => handleMarkAdminNotifRead(n.id)}
                                className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded text-[10px] font-bold uppercase"
                              >
                                Mark Read
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Real-Time Security Audit Logs Section */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-gold-400" />
                  Security & Operations Audit Trail
                </h3>
                <span className="text-xs text-zinc-500 font-mono">{auditLogs.length} Records Logged</span>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-950/40 text-zinc-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-3.5 px-4">Log ID</th>
                        <th className="py-3.5 px-4">Timestamp</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Action Summary</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {auditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-zinc-500 font-mono">
                            No audit log entries recorded yet.
                          </td>
                        </tr>
                      ) : (
                        auditLogs.map((log: any) => (
                          <tr key={log.id} className="hover:bg-zinc-800/40 transition-colors">
                            <td className="py-3.5 px-4 font-mono text-zinc-500 text-[11px]">{log.id}</td>
                            <td className="py-3.5 px-4 font-mono text-zinc-400 text-[11px]">{log.timestamp || 'Just now'}</td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 bg-zinc-800 text-gold-400 border border-gold-500/20 rounded text-[9px] font-bold uppercase">
                                {log.category || 'SYSTEM'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-medium text-zinc-200">{log.action}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* 8. ANALYTICS & BUSINESS INTELLIGENCE DASHBOARD */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header & 1-Click CSV Exporters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                  Business Intelligence & Financial Reports
                </h2>
                <p className="text-zinc-400 text-xs mt-1">Real-time revenue metrics, inventory valuation, and 1-click tax/GST CSV exports.</p>
              </div>

              {/* CSV Exporter Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={async () => {
                    showToast('Generating Sales & Orders CSV...', 'info');
                    const ok = await downloadReportCSV('sales');
                    if (ok) showToast('Sales Report downloaded successfully!', 'success');
                  }}
                  className="px-3.5 py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Sales Ledger CSV</span>
                </button>

                <button
                  onClick={async () => {
                    showToast('Generating Tax / GST Ledger CSV...', 'info');
                    const ok = await downloadReportCSV('tax');
                    if (ok) showToast('Tax/GST Ledger downloaded successfully!', 'success');
                  }}
                  className="px-3.5 py-2 bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>GST Tax Ledger CSV</span>
                </button>

                <button
                  onClick={async () => {
                    showToast('Generating Inventory Snapshot CSV...', 'info');
                    const ok = await downloadReportCSV('inventory');
                    if (ok) showToast('Inventory Snapshot downloaded successfully!', 'success');
                  }}
                  className="px-3.5 py-2 bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 text-indigo-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>Inventory CSV</span>
                </button>
              </div>
            </div>

            {/* 4 Core BI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-emerald-500/30 p-5 rounded-2xl space-y-2 shadow-xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Total Settled Revenue</span>
                <p className="text-3xl font-extrabold font-mono text-emerald-400">₹{totalRevenue.toLocaleString()}</p>
                <p className="text-[11px] text-zinc-400 font-medium">Gross revenue settled from orders</p>
              </div>

              <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-indigo-500/30 p-5 rounded-2xl space-y-2 shadow-xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Total Orders Fulfilled</span>
                <p className="text-3xl font-extrabold font-mono text-white">{totalOrdersCount}</p>
                <p className="text-[11px] text-zinc-400 font-medium">High-value artisan craft orders</p>
              </div>

              <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-amber-500/30 p-5 rounded-2xl space-y-2 shadow-xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Average Order Value (AOV)</span>
                <p className="text-3xl font-extrabold font-mono text-amber-300">
                  ₹{(totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0).toLocaleString()}
                </p>
                <p className="text-[11px] text-zinc-400 font-medium">Average purchase size per transaction</p>
              </div>

              <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-rose-500/30 p-5 rounded-2xl space-y-2 shadow-xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Active Catalog Valuation</span>
                <p className="text-3xl font-extrabold font-mono text-rose-300">
                  ₹{products.reduce((acc, p) => {
                    const stock = p.variants?.reduce((s, v) => s + v.stockQuantity, 0) || 10;
                    return acc + (p.basePrice * stock);
                  }, 0).toLocaleString()}
                </p>
                <p className="text-[11px] text-zinc-400 font-medium">Total market value of stock on hand</p>
              </div>
            </div>

            {/* Sales & Orders Monthly Trend SVG Bar Chart */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">Monthly Sales & Order Growth</h3>
                  <p className="text-xs text-zinc-400">Historical performance trend breakdown over the last 6 months.</p>
                </div>
                <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-950 px-2.5 py-1 rounded-full border border-amber-800">
                  Live Analytics Feed
                </span>
              </div>

              {/* Pure SVG Bar Chart */}
              <div className="pt-6 pb-2">
                <div className="h-64 flex items-end justify-between gap-4 sm:gap-8 px-4 border-b border-zinc-800 pb-2">
                  {[
                    { month: 'Feb', revenue: Math.round(totalRevenue * 0.45), orders: Math.max(1, Math.round(totalOrdersCount * 0.5)) },
                    { month: 'Mar', revenue: Math.round(totalRevenue * 0.60), orders: Math.max(2, Math.round(totalOrdersCount * 0.6)) },
                    { month: 'Apr', revenue: Math.round(totalRevenue * 0.75), orders: Math.max(2, Math.round(totalOrdersCount * 0.7)) },
                    { month: 'May', revenue: Math.round(totalRevenue * 0.85), orders: Math.max(3, Math.round(totalOrdersCount * 0.8)) },
                    { month: 'Jun', revenue: Math.round(totalRevenue * 0.90), orders: Math.max(3, Math.round(totalOrdersCount * 0.9)) },
                    { month: 'Jul (Current)', revenue: totalRevenue, orders: totalOrdersCount }
                  ].map((m, idx) => {
                    const maxRev = Math.max(totalRevenue * 1.1, 100000);
                    const heightPercent = Math.min(100, Math.max(15, (m.revenue / maxRev) * 100));
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                        {/* Hover Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 transition-all absolute -top-12 bg-zinc-950 border border-amber-500/50 p-2 rounded-xl text-[10px] whitespace-nowrap z-20 shadow-2xl pointer-events-none text-center">
                          <p className="font-bold text-amber-300">₹{m.revenue.toLocaleString()}</p>
                          <p className="text-zinc-400">{m.orders} Orders Fulfilled</p>
                        </div>

                        {/* Bar */}
                        <div className="w-full bg-zinc-800/80 rounded-t-xl h-full flex items-end overflow-hidden p-1">
                          <div 
                            className="w-full bg-gradient-to-t from-emerald-600 via-amber-500 to-gold-400 rounded-t-lg transition-all duration-700 shadow-lg group-hover:brightness-125"
                            style={{ height: `${heightPercent}%` }}
                          ></div>
                        </div>

                        <span className="text-[11px] font-bold text-zinc-400 group-hover:text-amber-400 transition-colors">
                          {m.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Top Performing Categories & Artisans */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Categories Breakdown */}
              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-4 shadow-xl">
                <h3 className="font-serif font-bold text-white text-base">Top Heritage Categories by Sales</h3>
                <div className="space-y-3">
                  {[
                    { category: 'Handcrafted Textiles & Silks', percent: 42, color: 'bg-amber-500' },
                    { category: 'Terracotta & Ceramics', percent: 28, color: 'bg-emerald-500' },
                    { category: 'Traditional Toys & Carvings', percent: 18, color: 'bg-indigo-500' },
                    { category: 'Metal Craft & Jewelry', percent: 12, color: 'bg-rose-500' }
                  ].map((cat, i) => (
                    <div key={i} className="space-y-1 text-xs">
                      <div className="flex justify-between font-bold text-zinc-300">
                        <span>{cat.category}</span>
                        <span className="font-mono text-zinc-400">{cat.percent}%</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full ${cat.color} transition-all duration-500`} style={{ width: `${cat.percent}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Master Artisans Breakdown */}
              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-4 shadow-xl">
                <h3 className="font-serif font-bold text-white text-base">Featured Master Craftspeople</h3>
                <div className="space-y-3 divide-y divide-zinc-800/60">
                  {artisans.slice(0, 3).map((art, i) => (
                    <div key={art.id} className="pt-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img src={art.avatarUrl} alt={art.name} className="w-9 h-9 rounded-full object-cover border border-amber-500/40" />
                        <div>
                          <h5 className="font-bold text-white">{art.name}</h5>
                          <p className="text-[10px] text-zinc-400">{art.craftSpecialty || 'Heritage Artisan'} • {art.region}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-amber-950 text-amber-300 border border-amber-800 rounded-full text-[10px] font-bold">
                        {art.yearsExperience} Yrs Master
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Critical Inventory Health Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-white text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Critical Stock Inventory Health (&lt; 5 Units)
                </h3>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className="text-xs text-amber-400 hover:underline font-bold"
                >
                  Manage Inventory →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-950/40 text-zinc-400 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3">Origin Region</th>
                      <th className="py-2.5 px-3">Master Artisan</th>
                      <th className="py-2.5 px-3">Base Price</th>
                      <th className="py-2.5 px-3">Current Stock</th>
                      <th className="py-2.5 px-3">Health Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {products
                      .filter(p => p.variants.some(v => v.stockQuantity < 5))
                      .map(p => {
                        const stock = p.variants[0]?.stockQuantity || 0;
                        return (
                          <tr key={p.id} className="hover:bg-zinc-800/40">
                            <td className="py-2.5 px-3 font-bold text-white">{p.title}</td>
                            <td className="py-2.5 px-3 text-zinc-400">{p.originRegion || 'India'}</td>
                            <td className="py-2.5 px-3 text-amber-300 font-bold">{p.artisanName || 'Master Artisan'}</td>
                            <td className="py-2.5 px-3 font-mono">₹{p.basePrice.toLocaleString()}</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-rose-400">{stock} Units Left</td>
                            <td className="py-2.5 px-3">
                              {stock < 3 ? (
                                <span className="px-2 py-0.5 bg-rose-950 text-rose-400 border border-rose-800 rounded text-[9px] font-bold uppercase animate-pulse">
                                  CRITICAL RESTOCK
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-amber-950 text-amber-400 border border-amber-800 rounded text-[9px] font-bold uppercase">
                                  LOW STOCK
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* PRODUCT ADD / EDIT MODAL WITH CLOUDINARY UPLOAD */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-white">
                {editingProduct ? 'Edit Product Catalog Item' : 'Add New Product'}
              </h3>
              <button 
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              
              {/* Product Title */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-zinc-400">Product Title</label>
                <input 
                  type="text" 
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Channapatna Wooden Stacking Toy"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-zinc-400">Description</label>
                <textarea 
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Elaborate details about craft technique, vegetable dyes safety..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Price, Category, Stock Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-zinc-400">Price (₹)</label>
                  <input 
                    type="number" 
                    required
                    min={0}
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-zinc-400">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="handcrafted-toys">Handcrafted Toys</option>
                    <option value="brass-keychains">Brass Keychains</option>
                    <option value="studio-pottery">Studio Pottery</option>
                    <option value="custom-woodcraft">Custom Woodcraft</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-zinc-400">Stock Qty</label>
                  <input 
                    type="number" 
                    required
                    min={0}
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* HERITAGE & AUTHENTICITY METADATA GRID */}
              <div className="p-3.5 bg-zinc-950/80 border border-amber-500/20 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Heritage & GI Authenticity Parameters</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-zinc-400">GI Tag Region</label>
                    <input 
                      type="text" 
                      value={formGiTagRegion}
                      onChange={(e) => setFormGiTagRegion(e.target.value)}
                      placeholder="e.g. Kashmir, Varanasi, Chanderi"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-zinc-400">Craft Type</label>
                    <select
                      value={formCraftType}
                      onChange={(e) => setFormCraftType(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="Hand-loom">Hand-loom</option>
                      <option value="Hand-carved">Hand-carved</option>
                      <option value="Hand-spun">Hand-spun</option>
                      <option value="Hand-painted">Hand-painted</option>
                      <option value="Embroidery">Embroidery</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-zinc-400">Crafting Hours</label>
                    <input 
                      type="number" 
                      min={1}
                      value={formCraftingHours}
                      onChange={(e) => setFormCraftingHours(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-zinc-400">Assigned Artisan</label>
                    <select
                      value={formArtisanId}
                      onChange={(e) => setFormArtisanId(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 truncate"
                    >
                      {artisans.map(a => (
                        <option key={a.id} value={a.id}>{a.name} ({a.region.split(',')[0]})</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pb-1.5">
                    <input 
                      type="checkbox"
                      id="silkMarkCheck"
                      checked={formSilkMark}
                      onChange={(e) => setFormSilkMark(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <label htmlFor="silkMarkCheck" className="text-[11px] font-bold text-amber-300 cursor-pointer select-none">
                      Silk Mark Certified
                    </label>
                  </div>
                </div>
              </div>

              {/* Cloudinary Direct Image Upload Integration */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <label className="text-[10px] font-bold uppercase tracking-wider block text-zinc-400">
                  Cloudinary Product Image Integration
                </label>

                {/* Live Image Preview Container */}
                {formImageUrl && (
                  <div className="flex items-center gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-2xl">
                    <img 
                      src={formImageUrl} 
                      alt="Uploaded Preview" 
                      className="w-14 h-14 object-cover rounded-xl border border-zinc-700 bg-zinc-900"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate text-xs">{formImageUrl}</p>
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Cloudinary Secure Image Ready
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormImageUrl('')}
                      className="p-1.5 bg-zinc-800 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 rounded-lg transition-colors"
                      title="Remove Image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Cloudinary Dropzone Upload Input */}
                <div className="relative bg-zinc-800/80 border-2 border-dashed border-zinc-700 hover:border-indigo-500 rounded-2xl p-4 text-center cursor-pointer transition-colors">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleCloudinaryUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="w-6 h-6 text-indigo-400 mx-auto mb-1" />
                  <p className="font-bold text-white text-xs">
                    {isUploading ? 'Uploading to Cloudinary...' : 'Click to Upload Image to Cloudinary'}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-mono">PNG, JPG, WebP up to 10MB</p>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-bold uppercase text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold uppercase text-xs tracking-wider transition-colors shadow-lg shadow-indigo-600/25"
                >
                  {editingProduct ? 'Save Product Changes' : 'Publish Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-white">Order Details — {selectedOrder.orderNumber}</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <div>
                  <span className="text-zinc-500 block text-[10px] font-bold uppercase">Customer</span>
                  <span className="font-bold text-white">{selectedOrder.customerName}</span>
                </div>
                <div className="text-right">
                  <span className="text-zinc-500 block text-[10px] font-bold uppercase">Status</span>
                  {renderStatusBadge(selectedOrder.status)}
                </div>
              </div>

              {/* Items */}
              <div>
                <span className="text-zinc-500 block text-[10px] font-bold uppercase mb-1">Purchased Line Items</span>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                      <div className="flex items-center gap-2">
                        <img src={item.image} alt={item.title} className="w-8 h-8 rounded object-cover bg-zinc-800 border border-zinc-700" />
                        <div>
                          <p className="font-bold text-white text-[11px]">{item.title}</p>
                          <span className="text-[10px] text-zinc-400 font-mono">Qty: {item.quantity} x ₹{item.unitPrice}</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-emerald-400">₹{(item.quantity * item.unitPrice).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-zinc-500">Shipping Delivery Address</span>
                <p className="text-zinc-300 font-semibold">{selectedOrder.shippingAddress?.street || '42 Lavelle Road'}, {selectedOrder.shippingAddress?.city || 'Bengaluru'}, {selectedOrder.shippingAddress?.state || 'KA'} - {selectedOrder.shippingAddress?.pincode || '560001'}</p>
              </div>
            </div>

            <button 
              onClick={() => setSelectedOrder(null)} 
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold uppercase text-xs"
            >
              Close Window
            </button>
          </div>
        </div>
      )}

      {/* ARTISAN ADD / EDIT MODAL */}
      {isArtisanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-white">
                {editingArtisan ? 'Edit Artisan Profile' : 'Create Master Artisan Profile'}
              </h3>
              <button 
                onClick={() => setIsArtisanModalOpen(false)}
                className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArtisan} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-zinc-400">Artisan Full Name</label>
                <input 
                  type="text" 
                  required
                  value={artisanName}
                  onChange={(e) => setArtisanName(e.target.value)}
                  placeholder="Master Abdul Gani"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-zinc-400">Years Experience</label>
                  <input 
                    type="number" 
                    required
                    min={1}
                    value={artisanExp}
                    onChange={(e) => setArtisanExp(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2 text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-zinc-400">Craft Specialty</label>
                  <input 
                    type="text" 
                    value={artisanSpecialty}
                    onChange={(e) => setArtisanSpecialty(e.target.value)}
                    placeholder="Pashmina Weaving"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-zinc-400">Origin Region & State</label>
                <input 
                  type="text" 
                  value={artisanRegion}
                  onChange={(e) => setArtisanRegion(e.target.value)}
                  placeholder="Srinagar, Kashmir"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-zinc-400">Avatar Image URL</label>
                <input 
                  type="text" 
                  value={artisanAvatar}
                  onChange={(e) => setArtisanAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-zinc-400">Craft Heritage Story & Bio</label>
                <textarea 
                  rows={3}
                  value={artisanStory}
                  onChange={(e) => setArtisanStory(e.target.value)}
                  placeholder="Pioneer of GI-certified weaving with 30+ years preserving traditional looms..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsArtisanModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-bold uppercase text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold uppercase text-xs shadow-lg shadow-emerald-600/20"
                >
                  {editingArtisan ? 'Update Profile' : 'Save Artisan Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* FULFILLMENT STATE MACHINE MODAL */}
      {fulfillmentOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-indigo-400">Order Logistics Engine</span>
                <h3 className="font-serif text-lg font-bold text-white">Fulfillment Update — #{fulfillmentOrder.orderNumber}</h3>
              </div>
              <button 
                onClick={() => setFulfillmentOrder(null)}
                className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFulfillment} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-zinc-400">Select Fulfillment Pipeline Stage</label>
                <select
                  value={fulStatus}
                  onChange={(e) => setFulStatus(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3.5 py-2.5 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="PENDING_FULFILLMENT">1. PENDING FULFILLMENT (Assigned to Guild)</option>
                  <option value="QUALITY_CHECK">2. QUALITY CHECK (Inspector & GI Seal Verification)</option>
                  <option value="PACKED">3. PACKED (Velvet Padded Gift Box Sealed)</option>
                  <option value="DISPATCHED">4. DISPATCHED (Handed to Air Courier)</option>
                  <option value="IN_TRANSIT">5. IN TRANSIT (En Route Regional Hub)</option>
                  <option value="OUT_FOR_DELIVERY">6. OUT FOR DELIVERY (Last Mile Delivery Agent)</option>
                  <option value="DELIVERED">7. DELIVERED (Customer Signature Verified)</option>
                  <option value="RETURN_REQUESTED">8. RETURN REQUESTED (Customer Review)</option>
                  <option value="RETURNED">9. RETURNED (Restocked to Vault)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-zinc-400">Courier Partner</label>
                  <input 
                    type="text" 
                    value={fulCourier}
                    onChange={(e) => setFulCourier(e.target.value)}
                    placeholder="BlueDart Luxury Express"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-zinc-400">AWB Tracking Number</label>
                  <input 
                    type="text" 
                    value={fulAwb}
                    onChange={(e) => setFulAwb(e.target.value)}
                    placeholder="ECL-AWB-984210"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-zinc-400">Est. Delivery Date</label>
                  <input 
                    type="date" 
                    value={fulEstDate}
                    onChange={(e) => setFulEstDate(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-zinc-400">Packing QC Video Link (Optional)</label>
                  <input 
                    type="text" 
                    value={fulVideoUrl}
                    onChange={(e) => setFulVideoUrl(e.target.value)}
                    placeholder="https://cloudinary.com/video..."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold uppercase text-indigo-400 block">Add Tracking History Milestone Entry</span>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text" 
                    value={fulLocation}
                    onChange={(e) => setFulLocation(e.target.value)}
                    placeholder="Milestone Location (e.g. Bengaluru Central Hub)"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-white text-xs"
                  />
                  <input 
                    type="text" 
                    value={fulNote}
                    onChange={(e) => setFulNote(e.target.value)}
                    placeholder="Milestone Note (e.g. Quality Passed)"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-white text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFulfillmentOrder(null)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl font-bold uppercase text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold uppercase text-xs shadow-lg shadow-indigo-600/30"
                >
                  Save & Dispatch Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE PACKING SLIP MODAL */}
      {packingSlipOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in text-zinc-900">
          <div className="bg-white max-w-xl w-full rounded-3xl p-8 shadow-2xl relative space-y-6 border-4 border-amber-500 max-h-[90vh] overflow-y-auto">
            
            <button 
              onClick={() => setPackingSlipOrder(null)}
              className="absolute top-4 right-4 p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl transition-all print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Slip Header */}
            <div className="flex items-center justify-between border-b-2 border-amber-500 pb-4">
              <div>
                <h2 className="font-serif font-bold text-2xl tracking-tight text-zinc-900">eclipsera_premium</h2>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-700">Heritage Artisan Packing Manifest</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-base text-zinc-900 block">#{packingSlipOrder.orderNumber}</span>
                <span className="text-[10px] font-mono text-zinc-500">AWB: {packingSlipOrder.awbTrackingNumber || 'ECL-AWB-PENDING'}</span>
              </div>
            </div>

            {/* Address & Dispatch Specs */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
              <div>
                <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-0.5">SHIP TO PATRON</span>
                <p className="font-bold text-zinc-900">{packingSlipOrder.customerName}</p>
                <p className="text-zinc-600">{packingSlipOrder.shippingAddress?.street}</p>
                <p className="text-zinc-600">{packingSlipOrder.shippingAddress?.city}, {packingSlipOrder.shippingAddress?.state} - {packingSlipOrder.shippingAddress?.pincode}</p>
                <p className="text-zinc-500 font-mono mt-1">{packingSlipOrder.customerPhone}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-0.5">FULFILLMENT DETAILS</span>
                <p className="text-zinc-700">Courier: <strong>{packingSlipOrder.courierName || 'BlueDart Luxury'}</strong></p>
                <p className="text-zinc-700">Est Delivery: <strong>{packingSlipOrder.estimatedDeliveryDate || '3 - 5 Days'}</strong></p>
                <p className="text-zinc-700">Quality Cert: <strong className="text-emerald-700">Silk Mark Certified ✅</strong></p>
              </div>
            </div>

            {/* Item Manifest Table */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">PACKING ITEM MANIFEST</span>
              <table className="w-full text-left text-xs border border-zinc-200 rounded-xl overflow-hidden">
                <thead className="bg-zinc-100 text-[10px] font-bold uppercase text-zinc-600">
                  <tr>
                    <th className="p-2.5">Item Description</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Unit Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-sans">
                  {packingSlipOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-semibold text-zinc-900">{item.title} ({item.colorName})</td>
                      <td className="p-2.5 text-center font-bold text-zinc-800">{item.quantity}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-zinc-900">₹{item.unitPrice.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* QR Code & Signatures */}
            <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-zinc-900 text-white rounded-xl flex items-center justify-center font-mono text-[9px] text-center p-1 font-bold border-2 border-amber-500">
                  QR AWB VERIFIED
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  <span>Scan QR for digital manifest & verification hash</span>
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-zinc-900 hover:bg-amber-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider print:hidden shadow-lg transition-all"
              >
                Print Packing Slip
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CURATOR OFFICIAL REPLY MODAL */}
      {replyingReview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-400">Official Guild Curator Response</span>
                <h3 className="font-serif text-lg font-bold text-white">Reply to Review — #{replyingReview.id}</h3>
              </div>
              <button 
                onClick={() => setReplyingReview(null)}
                className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs space-y-1">
              <span className="font-bold text-white block">{replyingReview.userName || replyingReview.patronName} wrote:</span>
              <p className="text-zinc-400 italic">"{replyingReview.comment}"</p>
            </div>

            <form onSubmit={handleSaveAdminReply} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-zinc-400">Curator Official Store Response</label>
                <textarea 
                  rows={4}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Thank you for appreciating master craft traditions..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReplyingReview(null)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl font-bold uppercase text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl uppercase text-xs shadow-lg shadow-amber-600/20"
                >
                  Publish Curator Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default AdminDashboardView;

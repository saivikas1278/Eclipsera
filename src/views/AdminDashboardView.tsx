import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Order } from '../data/mockData';
import { 
  BarChart3, 
  Package, 
  ShoppingBag, 
  AlertTriangle, 
  Plus, 
  Edit3, 
  Trash2, 
  Printer, 
  LogOut, 
  Tag, 
  Search, 
  CheckCircle2, 
  X, 
  Sparkles,
  ArrowUpRight,
  Truck,
  Download,
  Bell,
  Activity,
  Check,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  SlidersHorizontal,
  ExternalLink,
  Upload
} from 'lucide-react';
import { uploadImageToAPI } from '../services/apiService';

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  category: 'ORDER' | 'PRODUCT' | 'STOCK' | 'COUPON';
}

export const AdminDashboardView: React.FC = () => {
  const { 
    products, 
    orders, 
    coupons, 
    updateOrderStatus, 
    addProduct, 
    deleteProduct, 
    updateStock, 
    addCoupon, 
    adminLogout,
    setCurrentView,
    showToast 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'inventory' | 'coupons'>('overview');
  const [globalSearch, setGlobalSearch] = useState('');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    showToast('Uploading image to Cloudinary CDN...', 'info');
    const uploadedUrl = await uploadImageToAPI(file);
    setIsUploading(false);
    if (uploadedUrl) {
      setNewImage(uploadedUrl);
      showToast('Image uploaded to Cloudinary successfully!', 'success');
    } else {
      showToast('Failed to upload image. Please try again or use direct URL.', 'error');
    }
  };

  // Status & Search Filter for Orders
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');

  // Courier Dispatch Form State
  const [dispatchOrderId, setDispatchOrderId] = useState<string | null>(null);
  const [courierNameInput, setCourierNameInput] = useState('Blue Dart Express Air');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');

  // Published / Draft Toggle State
  const [publishedStatus, setPublishedStatus] = useState<Record<string, boolean>>({
    'prod-1': true,
    'prod-2': true,
    'prod-3': true,
    'prod-4': true,
    'prod-5': false,
    'prod-6': true
  });

  // Audit Logs Stream
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: 'log-1', timestamp: 'Just now', action: 'Order #EP-10482 status updated to SHIPPED via Blue Dart', category: 'ORDER' },
    { id: 'log-2', timestamp: '12 mins ago', action: 'Published status toggled for "Channapatna Wooden Toy Train"', category: 'PRODUCT' },
    { id: 'log-3', timestamp: '45 mins ago', action: 'Created promo coupon CRAFT15 (15% OFF)', category: 'COUPON' },
    { id: 'log-[#]', timestamp: '2 hours ago', action: 'Inventory stock replenished for SKU ECL-WT01 (+10 units)', category: 'STOCK' }
  ]);

  const addAuditLog = (action: string, category: AuditLog['category']) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      action,
      category
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Non-Apparel Add Product Form State
  const [newTitle, setNewTitle] = useState('Royal Channapatna Lacquered Toy Train');
  const [newPrice, setNewPrice] = useState(1450);
  const [newComparePrice, setNewComparePrice] = useState(1800);
  const [newCraft, setNewCraft] = useState('Channapatna Wood Lathe');
  const [newRegion, setNewRegion] = useState('Channapatna, Karnataka');
  const [newArtisan, setNewArtisan] = useState('B. Ramappa & Toy Guild');
  const [newArtisanBio, setNewArtisanBio] = useState('Master woodturning collective using vegetable lacquer dyes.');
  const [newCategory, setNewCategory] = useState('handcrafted-toys');
  const [newImage, setNewImage] = useState('https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1000&q=85');

  // Edit Product Form State
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState(0);
  const [editComparePrice, setEditComparePrice] = useState(0);
  const [editCraft, setEditCraft] = useState('');
  const [editArtisan, setEditArtisan] = useState('');

  // Non-Apparel Add Coupon Form State
  const [newCouponCode, setNewCouponCode] = useState('CRAFT15');
  const [newCouponType, setNewCouponType] = useState<'PERCENT' | 'FLAT'>('PERCENT');
  const [newCouponVal, setNewCouponVal] = useState(15);
  const [newCouponMin, setNewCouponMin] = useState(1500);
  const [newCouponDesc, setNewCouponDesc] = useState('15% off authentic handcrafted non-apparel artifacts');

  // Analytics Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.grandTotal, 0);
  const totalOrdersCount = orders.length;
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;
  
  // Count Low Stock Variants across all products (quantity <= 3)
  const lowStockItems = products.flatMap(p => p.variants).filter(v => v.stockQuantity <= 3);

  // Stat Pills
  const publishedCount = Object.values(publishedStatus).filter(Boolean).length;
  const draftCount = Object.values(publishedStatus).filter(v => !v).length;
  const outOfStockCount = lowStockItems.length;

  const togglePublishedState = (id: string, title: string) => {
    const nextState = !publishedStatus[id];
    setPublishedStatus(prev => ({ ...prev, [id]: nextState }));
    const msg = nextState ? `Published "${title}" to store` : `Unpublished "${title}" (Saved as Draft)`;
    showToast(msg, nextState ? 'success' : 'info');
    addAuditLog(msg, 'PRODUCT');
  };

  const exportSalesCSV = () => {
    const headers = ['Order Number', 'Date', 'Customer Name', 'Customer Phone', 'Payment Method', 'Grand Total (INR)', 'Status'];
    const rows = orders.map(o => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleDateString(),
      `"${o.customerName}"`,
      o.customerPhone,
      o.paymentMethod,
      o.grandTotal,
      o.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `eclipsera_sales_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Sales CSV Report generated and downloaded!', 'success');
    addAuditLog('Exported Sales CSV Report', 'ORDER');
  };

  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
    if (orderSearchQuery || globalSearch) {
      const q = (orderSearchQuery || globalSearch).toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchName = o.customerName.toLowerCase().includes(q);
      const matchPhone = o.customerPhone.includes(q);
      const matchEmail = o.customerEmail?.toLowerCase().includes(q);
      if (!matchNum && !matchName && !matchPhone && !matchEmail) return false;
    }
    return true;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct({
      title: newTitle || 'Channapatna Lacquered Toy Train',
      basePrice: Number(newPrice),
      compareAtPrice: Number(newComparePrice),
      craftTechnique: newCraft,
      originRegion: newRegion,
      artisanName: newArtisan,
      artisanBio: newArtisanBio,
      category: newCategory,
      images: [newImage],
      isFeatured: true,
      silkMarkCertified: true
    });
    setIsAddProductOpen(false);
    showToast(`Published "${newTitle}" to live store catalog!`, 'success');
    addAuditLog(`Published new product "${newTitle}"`, 'PRODUCT');
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setEditTitle(p.title);
    setEditPrice(p.basePrice);
    setEditComparePrice(p.compareAtPrice || p.basePrice);
    setEditCraft(p.craftTechnique);
    setEditArtisan(p.artisanName);
  };

  const handleSaveProductEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    editingProduct.title = editTitle;
    editingProduct.basePrice = editPrice;
    editingProduct.compareAtPrice = editComparePrice;
    editingProduct.craftTechnique = editCraft;
    editingProduct.artisanName = editArtisan;
    setEditingProduct(null);
    showToast(`Updated product details for "${editTitle}"!`, 'success');
    addAuditLog(`Updated product details for "${editTitle}"`, 'PRODUCT');
  };

  const handleDeleteProduct = (id: string, title: string) => {
    deleteProduct(id);
    showToast(`Removed "${title}" from catalog.`, 'info');
    addAuditLog(`Archived product "${title}"`, 'PRODUCT');
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    addCoupon({
      code: newCouponCode.toUpperCase(),
      discountType: newCouponType,
      discountValue: Number(newCouponVal),
      minSubtotal: Number(newCouponMin),
      description: newCouponDesc
    });
    setIsAddCouponOpen(false);
    showToast(`Promo coupon "${newCouponCode.toUpperCase()}" created successfully!`, 'success');
    addAuditLog(`Created promo code ${newCouponCode.toUpperCase()}`, 'COUPON');
  };

  const handleDispatchOrder = (orderId: string) => {
    const awb = trackingNumberInput || `BD-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    updateOrderStatus(
      orderId, 
      'SHIPPED', 
      courierNameInput, 
      awb
    );
    setDispatchOrderId(null);
    showToast(`Order dispatched via ${courierNameInput} (AWB #${awb})!`, 'success');
    addAuditLog(`Order dispatched via ${courierNameInput} (AWB #${awb})`, 'ORDER');
  };

  return (
    <div className="min-h-screen bg-obsidian-900 text-cream-100 font-sans selection:bg-gold-500 selection:text-obsidian-900 pb-16">
      
      {/* 1. DEDICATED ADMIN NAVIGATION HEADER (No Storefront UI Elements) */}
      <header className="bg-obsidian-900 border-b border-gold-500/30 sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xl backdrop-blur-md">
        
        {/* Left Side: Brand Badge */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gold-500 text-obsidian-900 flex items-center justify-center font-serif font-bold text-base shadow-gold-glow">
              e
            </div>
            <div>
              <span className="font-serif font-bold text-sm text-cream-100 tracking-wide block">
                eclipsera<span className="text-gold-400 font-light">_premium</span>
              </span>
              <span className="text-[10px] text-gold-400 font-semibold tracking-widest uppercase block">
                Operations Control Portal
              </span>
            </div>
          </div>

          <span className="md:hidden px-2.5 py-1 bg-emerald-500/20 text-emerald-400 font-bold rounded-full text-[10px] flex items-center gap-1 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        </div>

        {/* Middle: Global Admin Command Search Bar */}
        <div className="w-full md:max-w-md relative">
          <input 
            type="text"
            placeholder="Search Orders, SKUs, Customer Email, or Coupons..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full bg-obsidian-800 border border-gold-500/30 rounded-xl pl-9 pr-4 py-2 text-xs text-cream-100 font-medium placeholder-cream-300/40 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50"
          />
          <Search className="w-4 h-4 text-gold-400 absolute left-3 top-2.5" />
          {globalSearch && (
            <button onClick={() => setGlobalSearch('')} className="absolute right-3 top-2.5 text-cream-300/60 hover:text-cream-100">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right Side: System Status, Notifications & Admin Avatar */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          
          {/* Status Pills (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] font-semibold">
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Supabase Active
            </span>
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Gateway Live
            </span>
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="p-2 bg-obsidian-800 border border-gold-500/30 text-gold-400 hover:text-cream-100 rounded-xl relative transition-all"
              aria-label="Admin Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-terracotta-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                3
              </span>
            </button>

            {/* Notification Popover */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-obsidian-900 border border-gold-500/40 rounded-2xl p-4 shadow-2xl space-y-3 z-50 text-xs text-cream-100">
                <div className="flex justify-between items-center border-b border-gold-500/20 pb-2">
                  <span className="font-serif font-bold text-gold-400">System Alerts</span>
                  <span className="text-[10px] text-cream-300/60">3 New</span>
                </div>
                <div className="space-y-2 text-[11px]">
                  <p className="text-emerald-400 font-semibold">• Payment #pay_RZP83921 verified for ₹3,450</p>
                  <p className="text-gold-400 font-semibold">• Low stock alert for SKU ECL-WT01 (2 left)</p>
                  <p className="text-cream-300/80">• New customer registration: Ananya Sharma</p>
                </div>
              </div>
            )}
          </div>

          {/* Admin Avatar & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-gold-500/20">
            <div className="w-8 h-8 rounded-xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400 font-bold text-xs">
              OP
            </div>
            <button 
              onClick={() => { adminLogout(); setCurrentView('home'); showToast('Signed out of Operations Control Portal.', 'info'); }}
              className="px-3 py-1.5 bg-terracotta-600/20 text-terracotta-400 hover:bg-terracotta-600 hover:text-white rounded-xl text-xs font-bold border border-terracotta-500/30 flex items-center gap-1 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout & Return to Storefront</span>
            </button>
          </div>

        </div>

      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* 2. QUICK ACTION BAR & CORE OPERATIONAL WIDGETS */}
        <div className="flex flex-col lg:flex-row items-stretch justify-between gap-4 bg-obsidian-800/80 p-4 sm:p-5 rounded-3xl border border-gold-500/30 shadow-xl">
          
          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button 
              onClick={() => setIsAddProductOpen(true)}
              className="px-4 py-2.5 bg-gold-500 text-obsidian-900 hover:bg-gold-400 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-gold-glow transition-all"
            >
              <Plus className="w-4 h-4" />
              + Add Product
            </button>

            <button 
              onClick={() => setIsAddCouponOpen(true)}
              className="px-4 py-2.5 bg-obsidian-900 border border-gold-500/40 text-gold-400 hover:bg-gold-500/10 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all"
            >
              <Tag className="w-4 h-4 text-gold-400" />
              + Create Coupon
            </button>

            <button 
              onClick={exportSalesCSV}
              className="px-4 py-2.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4" />
              Export Sales CSV
            </button>
          </div>

          {/* View Live Storefront Button */}
          <button 
            onClick={() => setCurrentView('home')}
            className="px-4 py-2.5 bg-obsidian-900/60 text-cream-300 hover:text-gold-400 border border-cream-300/20 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
          >
            <span>View Live Storefront</span>
            <ExternalLink className="w-4 h-4 text-gold-400" />
          </button>

        </div>

        {/* 3. PUBLISHING & STATUS WIDGET & ACTIVITY STREAM ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (8 cols): Publishing & Item Status Quick Toggle List */}
          <div className="lg:col-span-8 bg-obsidian-800/80 p-5 rounded-3xl border border-gold-500/30 space-y-4 shadow-lg">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gold-500/20 pb-3">
              <div>
                <span className="text-[10px] font-bold text-gold-400 uppercase tracking-widest">LIVE CATALOG STATUS</span>
                <h3 className="font-serif text-lg font-bold text-cream-100">Publishing & Availability Control</h3>
              </div>

              {/* Stat Pills */}
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                  Published: {publishedCount}
                </span>
                <span className="px-3 py-1 bg-gold-500/20 text-gold-400 rounded-full border border-gold-500/30">
                  Drafts: {draftCount}
                </span>
                <span className="px-3 py-1 bg-terracotta-500/20 text-terracotta-400 rounded-full border border-terracotta-500/30">
                  Low Stock: {outOfStockCount}
                </span>
              </div>
            </div>

            {/* Quick-List of Modified Items with Published Toggle */}
            <div className="space-y-2.5">
              {products.slice(0, 4).map(p => {
                const isPub = publishedStatus[p.id] ?? true;
                return (
                  <div key={p.id} className="p-3 bg-obsidian-900/60 rounded-2xl border border-gold-500/20 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <img 
                        src={p.images[0]} 
                        alt="" 
                        loading="lazy"
                        className="w-10 h-10 object-cover rounded-xl border border-gold-500/30 shrink-0" 
                      />
                      <div className="min-w-0">
                        <h4 className="font-serif font-bold text-cream-100 truncate">{p.title}</h4>
                        <p className="text-[10px] text-gold-400 font-semibold uppercase">{p.craftTechnique} • ₹{p.basePrice.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Live Toggle Switch */}
                    <button 
                      onClick={() => togglePublishedState(p.id, p.title)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] uppercase flex items-center gap-1.5 transition-all shrink-0 ${
                        isPub 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30' 
                          : 'bg-cream-300/10 text-cream-300/60 border border-cream-300/20 hover:bg-cream-300/20'
                      }`}
                    >
                      {isPub ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-cream-300/40" />}
                      <span>{isPub ? 'Published' : 'Draft'}</span>
                    </button>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Column (4 cols): Real-Time Activity & Audit Log Stream */}
          <div className="lg:col-span-4 bg-obsidian-800/80 p-5 rounded-3xl border border-gold-500/30 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-gold-500/20 pb-2.5">
              <div className="flex items-center gap-1.5 text-gold-400 font-bold text-xs uppercase tracking-wider">
                <Activity className="w-4 h-4 text-gold-400" />
                <span>Admin Activity Audit Stream</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs max-h-60 overflow-y-auto no-scrollbar">
              {auditLogs.map(log => (
                <div key={log.id} className="p-2.5 bg-obsidian-900/60 rounded-xl border border-gold-500/10 space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-gold-400 font-semibold">
                    <span className="uppercase">{log.category}</span>
                    <span className="text-cream-300/50">{log.timestamp}</span>
                  </div>
                  <p className="text-cream-100/90 text-[11px] leading-snug">{log.action}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 4. NAVIGATION TAB REGISTRY */}
        <div className="flex items-center gap-2 border-b border-gold-500/20 overflow-x-auto pb-1 text-xs font-bold no-scrollbar">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${activeTab === 'overview' ? 'bg-gold-500 text-obsidian-900 shadow-sm' : 'text-cream-100/70 hover:bg-obsidian-800'}`}
          >
            <BarChart3 className="w-4 h-4" />
            Dashboard KPIs
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${activeTab === 'orders' ? 'bg-gold-500 text-obsidian-900 shadow-sm' : 'text-cream-100/70 hover:bg-obsidian-800'}`}
          >
            <Package className="w-4 h-4" />
            Order Management ({orders.length})
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${activeTab === 'products' ? 'bg-gold-500 text-obsidian-900 shadow-sm' : 'text-cream-100/70 hover:bg-obsidian-800'}`}
          >
            <ShoppingBag className="w-4 h-4" />
            Product Master ({products.length})
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${activeTab === 'inventory' ? 'bg-gold-500 text-obsidian-900 shadow-sm' : 'text-cream-100/70 hover:bg-obsidian-800'}`}
          >
            <AlertTriangle className="w-4 h-4 text-terracotta-400" />
            Low Stock ({lowStockItems.length})
          </button>
          <button 
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${activeTab === 'coupons' ? 'bg-gold-500 text-obsidian-900 shadow-sm' : 'text-cream-100/70 hover:bg-obsidian-800'}`}
          >
            <Tag className="w-4 h-4" />
            Coupons ({coupons.length})
          </button>
        </div>

        {/* TAB 1: OVERVIEW KPIs & REVENUE BREAKDOWN */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-obsidian-800/80 p-5 rounded-3xl border border-gold-500/30 space-y-2">
                <span className="text-xs font-bold text-gold-400 uppercase">TOTAL REVENUE</span>
                <h3 className="font-serif text-3xl font-bold text-cream-100">₹{totalRevenue.toLocaleString()}</h3>
                <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  +24.5% vs target
                </p>
              </div>

              <div className="bg-obsidian-800/80 p-5 rounded-3xl border border-gold-500/30 space-y-2">
                <span className="text-xs font-bold text-gold-400 uppercase">ORDERS PROCESSED</span>
                <h3 className="font-serif text-3xl font-bold text-cream-100">{totalOrdersCount}</h3>
                <p className="text-[11px] text-cream-300/60 font-medium">100% Verified Payments</p>
              </div>

              <div className="bg-obsidian-800/80 p-5 rounded-3xl border border-gold-500/30 space-y-2">
                <span className="text-xs font-bold text-gold-400 uppercase">AVERAGE ORDER VALUE</span>
                <h3 className="font-serif text-3xl font-bold text-cream-100">₹{avgOrderValue.toLocaleString()}</h3>
                <p className="text-[11px] text-emerald-400 font-semibold">Exceeds Target</p>
              </div>

              <div className="bg-obsidian-800/80 p-5 rounded-3xl border border-gold-500/30 space-y-2">
                <span className="text-xs font-bold text-terracotta-400 uppercase">LOW STOCK ALERTS</span>
                <h3 className="font-serif text-3xl font-bold text-terracotta-400">{lowStockItems.length}</h3>
                <p className="text-[11px] text-terracotta-400 font-semibold">Variants &lt;= 3 units</p>
              </div>
            </div>

            {/* Recent Orders Stream */}
            <div className="bg-obsidian-800/80 p-5 rounded-3xl border border-gold-500/30 space-y-4">
              <h3 className="font-serif text-lg font-bold text-cream-100">Recent Customer Purchases</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-gold-500/20 text-gold-400 font-bold uppercase">
                      <th className="py-2.5">Order #</th>
                      <th className="py-2.5">Customer</th>
                      <th className="py-2.5">Amount</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-500/10 font-medium">
                    {orders.slice(0, 5).map(o => (
                      <tr key={o.id}>
                        <td className="py-3 font-bold font-mono text-cream-100">{o.orderNumber}</td>
                        <td className="py-3 text-cream-200">{o.customerName}</td>
                        <td className="py-3 font-bold text-gold-400">₹{o.grandTotal.toLocaleString()}</td>
                        <td className="py-3">
                          <span className="px-2.5 py-0.5 bg-gold-500/20 text-gold-400 rounded-full font-bold uppercase text-[10px]">
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button onClick={() => setActiveTab('orders')} className="text-gold-400 hover:underline font-bold">
                            Manage →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT & PRINTABLE LABELS */}
        {activeTab === 'orders' && (
          <div className="bg-obsidian-800/80 p-5 rounded-3xl border border-gold-500/30 space-y-6 shadow-sm">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gold-500/20 pb-4">
              <h3 className="font-serif text-xl font-bold text-cream-100">Order Fulfillment Portal</h3>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <input 
                    type="text" 
                    placeholder="Search Order #, Name, Phone..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="w-full bg-obsidian-900 border border-gold-500/30 rounded-xl pl-8 pr-3 py-1.5 text-xs text-cream-100 font-bold focus:outline-none focus:border-gold-500"
                  />
                  <Search className="w-3.5 h-3.5 text-gold-400 absolute left-2.5 top-2.5" />
                </div>

                <select 
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-obsidian-900 border border-gold-500/30 rounded-xl px-3 py-1.5 text-xs font-bold text-cream-100 focus:outline-none focus:border-gold-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="PAYMENT_CONFIRMED">Payment Confirmed</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-gold-500/20 text-gold-400 font-bold uppercase">
                    <th className="py-3">Order #</th>
                    <th className="py-3">Customer & Address</th>
                    <th className="py-3">Items Purchased</th>
                    <th className="py-3">Grand Total</th>
                    <th className="py-3">Status</th>
                    <th className="py-3 text-right">Actions & Label</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-500/10 font-medium">
                  {filteredOrders.map(o => (
                    <tr key={o.id}>
                      <td className="py-4 font-bold font-mono text-cream-100">
                        {o.orderNumber}
                        <p className="text-[10px] text-cream-300/50 font-normal">{new Date(o.createdAt).toLocaleDateString()}</p>
                      </td>

                      <td className="py-4">
                        <p className="font-bold text-cream-100">{o.customerName}</p>
                        <p className="text-[10px] text-cream-300/70">{o.shippingAddress.city}, {o.shippingAddress.state} ({o.shippingAddress.pincode})</p>
                        <p className="text-[10px] text-gold-400">{o.customerPhone}</p>
                      </td>

                      <td className="py-4 space-y-1">
                        {o.items.map((item, idx) => (
                          <p key={idx} className="text-[11px] text-cream-200">
                            • {item.title} ({item.colorName}) x{item.quantity}
                          </p>
                        ))}
                      </td>

                      <td className="py-4 font-bold text-sm text-gold-400">₹{o.grandTotal.toLocaleString()}</td>

                      <td className="py-4">
                        <span className="px-3 py-1 bg-gold-500/20 text-gold-400 font-bold rounded-full text-[10px] uppercase border border-gold-500/30">
                          {o.status}
                        </span>
                        {o.courierName && (
                          <p className="text-[10px] font-mono text-cream-300/60 mt-1">
                            {o.courierName} ({o.trackingNumber})
                          </p>
                        )}
                      </td>

                      <td className="py-4 text-right space-y-2">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setPrintingOrder(o)}
                            className="px-2.5 py-1 bg-obsidian-900 border border-gold-500/30 text-gold-400 hover:bg-gold-500 hover:text-obsidian-900 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1"
                            title="Print Packing Slip"
                          >
                            <Printer className="w-3 h-3" />
                            Label
                          </button>

                          {o.status === 'PAYMENT_CONFIRMED' && (
                            <button 
                              onClick={() => { updateOrderStatus(o.id, 'PROCESSING'); showToast(`Order #${o.orderNumber} marked as Processing`, 'info'); addAuditLog(`Marked Order #${o.orderNumber} as Processing`, 'ORDER'); }}
                              className="px-3 py-1 bg-gold-500 text-obsidian-900 rounded-lg text-[10px] font-bold uppercase hover:bg-gold-400"
                            >
                              Mark Processing
                            </button>
                          )}

                          {o.status === 'PROCESSING' && (
                            <button 
                              onClick={() => setDispatchOrderId(o.id)}
                              className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold uppercase hover:bg-emerald-700"
                            >
                              Dispatch Courier
                            </button>
                          )}

                          {o.status === 'SHIPPED' && (
                            <button 
                              onClick={() => { updateOrderStatus(o.id, 'DELIVERED'); showToast(`Order #${o.orderNumber} marked as Delivered`, 'success'); addAuditLog(`Order #${o.orderNumber} delivered`, 'ORDER'); }}
                              className="px-3 py-1 bg-gold-500 text-obsidian-900 rounded-lg text-[10px] font-bold uppercase hover:bg-gold-400"
                            >
                              Mark Delivered
                            </button>
                          )}
                        </div>

                        {/* Dispatch Modal Box */}
                        {dispatchOrderId === o.id && (
                          <div className="p-3 bg-obsidian-900 rounded-xl border border-gold-500/30 text-left space-y-2 mt-2">
                            <label className="text-[10px] font-bold uppercase block text-gold-400">Select Courier Partner</label>
                            <input 
                              type="text" 
                              value={courierNameInput} 
                              onChange={(e) => setCourierNameInput(e.target.value)}
                              className="w-full p-1.5 border rounded text-xs bg-obsidian-800 text-cream-100"
                            />
                            <button 
                              onClick={() => handleDispatchOrder(o.id)}
                              className="w-full py-1.5 bg-emerald-600 text-white rounded font-bold text-xs uppercase"
                            >
                              Confirm Dispatch
                            </button>
                          </div>
                        )}

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 3: PRODUCTS MASTER & EDIT MODAL */}
        {activeTab === 'products' && (
          <div className="bg-obsidian-800/80 p-5 rounded-3xl border border-gold-500/30 space-y-6 shadow-sm">
            
            <div className="flex items-center justify-between border-b border-gold-500/20 pb-4">
              <h3 className="font-serif text-xl font-bold text-cream-100">Product Master Catalog</h3>
              <button 
                onClick={() => setIsAddProductOpen(true)}
                className="px-4 py-2 bg-gold-500 text-obsidian-900 hover:bg-gold-400 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                New Product
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => (
                <div key={p.id} className="p-4 rounded-2xl border border-gold-500/20 bg-obsidian-900/60 space-y-3">
                  <img 
                    src={p.images[0]} 
                    alt="" 
                    loading="lazy"
                    className="w-full h-40 object-cover rounded-xl border border-gold-500/30" 
                  />
                  <div>
                    <span className="text-[10px] font-bold text-gold-400 uppercase">{p.craftTechnique}</span>
                    <h4 className="font-serif font-bold text-base text-cream-100 truncate">{p.title}</h4>
                    <p className="text-xs text-cream-300/60">{p.artisanName}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gold-500/20 text-xs">
                    <span className="font-bold font-serif text-sm text-gold-400">₹{p.basePrice.toLocaleString()}</span>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleOpenEditProduct(p)}
                        className="p-1.5 text-cream-100 hover:bg-obsidian-800 rounded-lg"
                        title="Edit Product"
                      >
                        <Edit3 className="w-4 h-4 text-gold-400" />
                      </button>

                      <button 
                        onClick={() => handleDeleteProduct(p.id, p.title)}
                        className="p-1.5 text-terracotta-400 hover:bg-terracotta-500/10 rounded-lg"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 4: LOW STOCK INVENTORY AUDITS */}
        {activeTab === 'inventory' && (
          <div className="bg-obsidian-800/80 p-5 rounded-3xl border border-gold-500/30 space-y-6 shadow-sm">
            <h3 className="font-serif text-xl font-bold text-cream-100">Inventory Stock Audit System</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-gold-500/20 text-gold-400 font-bold uppercase">
                    <th className="py-3">Product Title</th>
                    <th className="py-3">SKU</th>
                    <th className="py-3">Color / Variant</th>
                    <th className="py-3">Current Stock</th>
                    <th className="py-3 text-right">Inline Stock Stepper</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-500/10 font-medium">
                  {products.flatMap(p => p.variants.map(v => ({ product: p, variant: v }))).map(({ product, variant }) => (
                    <tr key={variant.id}>
                      <td className="py-3 font-semibold text-cream-100">{product.title}</td>
                      <td className="py-3 font-mono text-gold-400 font-bold">{variant.sku}</td>
                      <td className="py-3 text-cream-200">{variant.colorName}</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${variant.stockQuantity <= 3 ? 'bg-terracotta-500/20 text-terracotta-400 border border-terracotta-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                          {variant.stockQuantity} units
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="inline-flex items-center border border-gold-500/30 rounded-lg bg-obsidian-900">
                          <button 
                            onClick={() => { updateStock(product.id, variant.id, Math.max(0, variant.stockQuantity - 1)); showToast(`Stock decreased for ${variant.sku}`, 'info'); addAuditLog(`Stock decreased for ${variant.sku}`, 'STOCK'); }}
                            className="px-2 py-1 font-bold text-cream-100 hover:text-gold-400"
                          >
                            -
                          </button>
                          <span className="px-2 font-bold text-gold-400">{variant.stockQuantity}</span>
                          <button 
                            onClick={() => { updateStock(product.id, variant.id, variant.stockQuantity + 1); showToast(`Stock increased for ${variant.sku}`, 'success'); addAuditLog(`Stock increased for ${variant.sku}`, 'STOCK'); }}
                            className="px-2 py-1 font-bold text-cream-100 hover:text-gold-400"
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: COUPON & PROMOTIONAL CMS */}
        {activeTab === 'coupons' && (
          <div className="bg-obsidian-800/80 p-5 rounded-3xl border border-gold-500/30 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gold-500/20 pb-4">
              <h3 className="font-serif text-xl font-bold text-cream-100">Promotional Coupon CMS</h3>
              <button 
                onClick={() => setIsAddCouponOpen(true)}
                className="px-4 py-2 bg-gold-500 text-obsidian-900 hover:bg-gold-400 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                New Coupon
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {coupons.map((c, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-gold-500/30 bg-gold-500/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-mono text-base text-gold-400">{c.code}</span>
                    <span className="text-[10px] font-bold bg-gold-500 text-obsidian-900 px-2 py-0.5 rounded-full">
                      {c.discountType === 'PERCENT' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                    </span>
                  </div>
                  <p className="text-xs text-cream-200">{c.description}</p>
                  <p className="text-[10px] text-gold-400 font-semibold">Min Subtotal: ₹{c.minSubtotal.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-obsidian-900/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in text-cream-100">
          <div className="bg-obsidian-900 max-w-md w-full rounded-3xl p-6 space-y-4 shadow-2xl relative border border-gold-500/40">
            <button onClick={() => setEditingProduct(null)} className="absolute top-4 right-4 p-2 text-cream-300/60 hover:text-gold-400">
              <X className="w-6 h-6" />
            </button>

            <h3 className="font-serif text-xl font-bold text-gold-400">Edit Product Master</h3>

            <form onSubmit={handleSaveProductEdit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold uppercase block mb-1">Product Title</label>
                <input 
                  type="text" 
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-obsidian-800 border border-gold-500/30 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-gold-500 text-cream-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold uppercase block mb-1">Base Price (₹)</label>
                  <input 
                    type="number" 
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full bg-obsidian-800 border border-gold-500/30 rounded-xl px-3 py-2 text-xs font-bold text-cream-100"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase block mb-1">MSRP Price (₹)</label>
                  <input 
                    type="number" 
                    value={editComparePrice}
                    onChange={(e) => setEditComparePrice(Number(e.target.value))}
                    className="w-full bg-obsidian-800 border border-gold-500/30 rounded-xl px-3 py-2 text-xs font-bold text-cream-100"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold uppercase block mb-1">Craft Technique</label>
                <input 
                  type="text" 
                  value={editCraft}
                  onChange={(e) => setEditCraft(e.target.value)}
                  className="w-full bg-obsidian-800 border border-gold-500/30 rounded-xl px-3 py-2 text-xs font-medium text-cream-100"
                />
              </div>

              <div>
                <label className="font-bold uppercase block mb-1">Artisan Guild</label>
                <input 
                  type="text" 
                  value={editArtisan}
                  onChange={(e) => setEditArtisan(e.target.value)}
                  className="w-full bg-obsidian-800 border border-gold-500/30 rounded-xl px-3 py-2 text-xs font-medium text-cream-100"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-gold-500 text-obsidian-900 hover:bg-gold-400 py-3 rounded-xl font-bold uppercase tracking-wider shadow-lg transition-all"
              >
                Save Product Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE PACKING SLIP & SHIPPING LABEL MODAL */}
      {printingOrder && (
        <div className="fixed inset-0 z-50 bg-obsidian-900/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in text-obsidian-900">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 space-y-4 shadow-2xl relative border border-gold-500">
            
            <div className="border-b border-cream-300 pb-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-gold-600" />
                <h3 className="font-serif text-lg font-bold text-obsidian-900">Packing Slip & Courier Label</h3>
              </div>
              <button onClick={() => setPrintingOrder(null)} className="text-obsidian-900 hover:text-gold-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-2 border-dashed border-obsidian-900 rounded-2xl space-y-3 text-xs font-mono bg-cream-100/50">
              <div className="flex justify-between border-b pb-2">
                <span className="font-bold">eclipsera_premium</span>
                <span className="font-bold text-gold-700">EXPRESS AIR SHIPMENT</span>
              </div>

              <div>
                <p className="font-bold uppercase text-[10px] text-obsidian-900/60">SHIP TO PATRON:</p>
                <p className="font-bold text-sm text-obsidian-900">{printingOrder.customerName}</p>
                <p>{printingOrder.shippingAddress.city}, {printingOrder.shippingAddress.state} - {printingOrder.shippingAddress.pincode}</p>
                <p>Phone: {printingOrder.customerPhone}</p>
              </div>

              <div className="border-t border-b py-2 space-y-1">
                <p className="font-bold">ORDER CONTENTS:</p>
                {printingOrder.items.map((it, idx) => (
                  <p key={idx}>• {it.title} ({it.colorName}) x{it.quantity}</p>
                ))}
              </div>

              <div className="flex justify-between font-bold">
                <span>AWB NO: {printingOrder.trackingNumber || 'BD83910293'}</span>
                <span>TOTAL: ₹{printingOrder.grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={() => { window.print(); setPrintingOrder(null); }}
              className="w-full bg-obsidian-900 text-cream-100 hover:bg-gold-600 hover:text-obsidian-900 py-3 rounded-xl font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Printer className="w-4 h-4" />
              Print Shipping Label
            </button>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-obsidian-900/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in text-cream-100">
          <div className="bg-obsidian-900 max-w-xl w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl relative border border-gold-500/40">
            <button onClick={() => setIsAddProductOpen(false)} className="absolute top-4 right-4 p-2 text-cream-300/60 hover:text-gold-400">
              <X className="w-6 h-6" />
            </button>

            <h3 className="font-serif text-2xl font-bold text-gold-400">Create Non-Apparel Handcrafted Item</h3>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-bold uppercase block mb-1">Product Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Channapatna Lacquered Wooden Toy Train"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-obsidian-800 border border-gold-500/30 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-gold-500 text-cream-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold uppercase block mb-1">Base Price (₹)</label>
                  <input 
                    type="number" 
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full bg-obsidian-800 border border-gold-500/30 rounded-xl px-3 py-2 text-xs font-bold text-cream-100"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase block mb-1">MSRP Compare Price (₹)</label>
                  <input 
                    type="number" 
                    value={newComparePrice}
                    onChange={(e) => setNewComparePrice(Number(e.target.value))}
                    className="w-full bg-obsidian-800 border border-gold-500/30 rounded-xl px-3 py-2 text-xs font-bold text-cream-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold uppercase block mb-1">Craft Technique</label>
                  <input 
                    type="text" 
                    required
                    value={newCraft}
                    onChange={(e) => setNewCraft(e.target.value)}
                    className="w-full bg-obsidian-800 border border-gold-500/30 rounded-xl px-3 py-2 text-xs font-medium text-cream-100"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase block mb-1">Origin Region</label>
                  <input 
                    type="text" 
                    required
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value)}
                    className="w-full bg-obsidian-800 border border-gold-500/30 rounded-xl px-3 py-2 text-xs font-medium text-cream-100"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold uppercase block mb-1">Artisan Guild Name</label>
                <input 
                  type="text" 
                  required
                  value={newArtisan}
                  onChange={(e) => setNewArtisan(e.target.value)}
                  className="w-full bg-obsidian-800 border border-gold-500/30 rounded-xl px-3 py-2 text-xs font-medium text-cream-100"
                />
              </div>

              <div>
                <label className="font-bold uppercase block mb-1">Product Image (Cloudinary Auto-Upload or URL)</label>
                <div className="flex items-center gap-2 mb-2">
                  <label className="flex-1 cursor-pointer bg-gold-500/20 border border-dashed border-gold-500/50 hover:bg-gold-500/30 text-gold-400 p-2.5 rounded-xl text-center font-bold flex items-center justify-center gap-2 transition-all">
                    <Upload className="w-4 h-4" />
                    <span>{isUploading ? 'Uploading to Cloudinary...' : 'Choose Image File from Computer'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageFileUpload}
                      disabled={isUploading}
                      className="hidden" 
                    />
                  </label>
                </div>
                <input 
                  type="url" 
                  required
                  placeholder="https://res.cloudinary.com/..."
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="w-full bg-obsidian-800 border border-gold-500/30 rounded-xl px-3 py-2 text-xs font-medium text-cream-100"
                />
                {newImage && (
                  <div className="mt-2 flex items-center gap-2">
                    <img 
                      src={newImage} 
                      alt="" 
                      loading="lazy"
                      className="w-12 h-12 object-cover rounded-lg border border-gold-500/40" 
                    />
                    <span className="text-[10px] text-emerald-400 font-semibold">✓ Ready for publishing</span>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="w-full bg-gold-500 text-obsidian-900 hover:bg-gold-400 py-3.5 rounded-xl font-bold uppercase tracking-wider shadow-lg transition-all"
              >
                Publish Master Product
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD COUPON MODAL */}
      {isAddCouponOpen && (
        <div className="fixed inset-0 z-50 bg-obsidian-900/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in text-cream-100">
          <div className="bg-obsidian-900 max-w-md w-full rounded-3xl p-6 space-y-4 shadow-2xl relative border border-gold-500/40">
            <button onClick={() => setIsAddCouponOpen(false)} className="absolute top-4 right-4 p-2 text-cream-300/60 hover:text-gold-400">
              <X className="w-6 h-6" />
            </button>

            <h3 className="font-serif text-2xl font-bold text-gold-400">Create Promo Code</h3>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="font-bold uppercase block mb-1">Coupon Code (e.g. CRAFT15)</label>
                <input 
                  type="text" 
                  required
                  placeholder="CRAFT15"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  className="w-full bg-obsidian-800 border border-gold-500/30 rounded-xl px-3 py-2 text-xs font-bold uppercase focus:outline-none focus:border-gold-500 text-cream-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold uppercase block mb-1">Discount Type</label>
                  <select 
                    value={newCouponType}
                    onChange={(e) => setNewCouponType(e.target.value as any)}
                    className="w-full bg-obsidian-800 border border-gold-500/30 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-gold-500 text-cream-100"
                  >
                    <option value="PERCENT">Percentage (%)</option>
                    <option value="FLAT">Flat (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold uppercase block mb-1">Discount Value</label>
                  <input 
                    type="number" 
                    required
                    value={newCouponVal}
                    onChange={(e) => setNewCouponVal(Number(e.target.value))}
                    className="w-full bg-obsidian-800 border border-gold-500/30 rounded-xl px-3 py-2 text-xs font-bold text-cream-100"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold uppercase block mb-1">Min Subtotal Requirement (₹)</label>
                <input 
                  type="number" 
                  required
                  value={newCouponMin}
                  onChange={(e) => setNewCouponMin(Number(e.target.value))}
                  className="w-full bg-obsidian-800 border border-gold-500/30 rounded-xl px-3 py-2 text-xs font-bold text-cream-100"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-gold-500 text-obsidian-900 hover:bg-gold-400 py-3.5 rounded-xl font-bold uppercase tracking-wider shadow-lg transition-all"
              >
                Save Promo Code
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Product, Order, Artisan } from '../../shared/data/mockData';
import { uploadImageToAPI } from '../../shared/services/apiService';
import { 
  LayoutDashboard, Package, ShoppingBag, Layers, 
  Plus, Edit3, Trash2, LogOut, Search, CheckCircle2, 
  X, AlertTriangle, Upload, Eye, Check, RefreshCw, UserCheck, ShieldCheck, Award
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

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'inventory' | 'artisans'>('dashboard');

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

  // --- ORDER MANAGEMENT STATES ---
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // --- INVENTORY STATES ---
  const [stockEdits, setStockEdits] = useState<{ [key: string]: number }>({});

  // Helper for Status Badge Styling
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
      case 'SHIPPED':
        return (
          <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800/80 rounded-full font-bold uppercase text-[10px] tracking-wider inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            {status}
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="px-2.5 py-1 bg-blue-950 text-blue-400 border border-blue-800/80 rounded-full font-bold uppercase text-[10px] tracking-wider inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            PROCESSING
          </span>
        );
      case 'PENDING':
      case 'PAYMENT_CONFIRMED':
        return (
          <span className="px-2.5 py-1 bg-amber-950 text-amber-400 border border-amber-800/80 rounded-full font-bold uppercase text-[10px] tracking-wider inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            PENDING
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-1 bg-rose-950 text-rose-400 border border-rose-800/80 rounded-full font-bold uppercase text-[10px] tracking-wider inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            CANCELLED
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

  // Metrics Calculations
  const totalRevenue = orders.filter(o => o.status !== 'CANCELLED').reduce((acc, o) => acc + o.grandTotal, 0);
  const totalOrdersCount = orders.length;
  const totalActiveProducts = products.length;
  const lowStockCount = products.filter(p => p.variants.some(v => v.stockQuantity < 5)).length;

  const lowStockProducts = products.filter(p => p.variants.some(v => v.stockQuantity < 5));

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex items-stretch">
      
      {/* 1. DARK SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-zinc-900/90 border-r border-zinc-800 shrink-0 flex flex-col justify-between p-4 select-none">
        <div className="space-y-6">
          
          {/* Logo & Admin Badge */}
          <div className="flex items-center gap-3 px-2 py-1">
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

          {/* Navigation Items */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'products'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Products</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'orders'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Orders</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
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
              onClick={() => setActiveTab('artisans')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'artisans'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Artisans & Guilds</span>
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
        
        {/* TAB 1: DASHBOARD OVERVIEW */}
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

            {/* Products Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
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
                                  className="p-1.5 bg-zinc-800 hover:bg-indigo-600 hover:text-white text-zinc-300 rounded-lg transition-all"
                                  title="Edit Product"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => deleteProduct(p.id)}
                                  className="p-1.5 bg-zinc-800 hover:bg-rose-900 hover:text-rose-300 text-zinc-300 rounded-lg transition-all"
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
            </div>

          </div>
        )}

        {/* TAB 3: ORDER MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Header */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-white">Order Management & Fulfillment</h2>
              <p className="text-xs text-zinc-400 mt-1">Review orders, toggle fulfillment status, and inspect shipping addresses.</p>
            </div>

            {/* Search Filter */}
            <div className="relative max-w-md">
              <input 
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search orders by customer or order number..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            </div>

            {/* Orders Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-950/40 text-zinc-400 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3.5 px-4">Order ID</th>
                      <th className="py-3.5 px-4">Customer Name</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Total Amount</th>
                      <th className="py-3.5 px-4">Status Updater</th>
                      <th className="py-3.5 px-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {orders
                      .filter(o => o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) || o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()))
                      .map(o => (
                        <tr key={o.id} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">{o.orderNumber}</td>
                          <td className="py-3.5 px-4 font-semibold text-zinc-200">{o.customerName}</td>
                          <td className="py-3.5 px-4 text-zinc-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-white">₹{o.grandTotal.toLocaleString()}</td>
                          <td className="py-3.5 px-4">
                            <select
                              value={o.status}
                              onChange={(e) => updateOrderStatus(o.id, e.target.value as Order['status'])}
                              className="bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="PENDING">Pending</option>
                              <option value="PROCESSING">Processing</option>
                              <option value="SHIPPED">Shipped</option>
                              <option value="DELIVERED">Delivered</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedOrder(o)}
                              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg font-bold text-[11px] uppercase transition-colors"
                            >
                              View Items
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

              <div className="overflow-x-auto">
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
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold uppercase transition-colors"
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

    </div>
  );
};
export default AdminDashboardView;

import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { ShieldCheck, Heart, ShoppingBag, Star, ZoomIn, Check, MapPin, Zap, Share2, Award, Upload, MessageSquare, ArrowRight, Layers, Truck, Calendar } from 'lucide-react';
import { GICertificateModal } from '../../shared/components/GICertificateModal';
import { fetchReviewsFromAPI, createReviewInAPI, uploadImageToAPI } from '../../shared/services/apiService';

export const ProductDetailView: React.FC = () => {
  const { 
    selectedProductSlug, 
    products, 
    addToCart, 
    buyNow, 
    isInWishlist, 
    toggleWishlist, 
    setCurrentView, 
    showToast,
    openArtisanProfile,
    addQaToProduct,
    toggleCompare,
    compareProductIds,
    openProductDetail,
    orders,
    currentUser
  } = useUser();

  const product = products.find(p => p.slug === selectedProductSlug) || products[0];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(product?.variants[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [customNote, setCustomNote] = useState('');

  // Tab State: 'description' | 'materials' | 'shipping' | 'reviews'
  const [activeTab, setActiveTab] = useState<'description' | 'materials' | 'shipping' | 'reviews'>('description');

  // PIN Code Delivery Checker State
  const [deliveryPincode, setDeliveryPincode] = useState('560001');
  const [pincodeStatus, setPincodeStatus] = useState<{ checked: boolean; valid: boolean; deliveryDays: string }>({
    checked: true,
    valid: true,
    deliveryDays: '3 - 5 Business Days (Free Delivery)'
  });

  // GI Certificate Modal State
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  // Verified Review States
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewerName, setReviewerName] = useState(currentUser?.name || '');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [aggregatedStats, setAggregatedStats] = useState<{ averageRating: number; totalCount: number; ratingBreakdown: any }>({
    averageRating: 5.0,
    totalCount: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  // Filter States
  const [reviewStarFilter, setReviewStarFilter] = useState<number | 'ALL'>('ALL');
  const [photosOnlyFilter, setPhotosOnlyFilter] = useState(false);

  // Q&A & Zoom States
  const [newQuestion, setNewQuestion] = useState('');
  const [zoomStyle, setZoomStyle] = useState<{ display: string; backgroundPosition: string }>({ display: 'none', backgroundPosition: '0% 0%' });

  // Check if current user is a verified purchaser with a DELIVERED order for this product
  const isVerifiedBuyer = orders.some(o => {
    if (!o) return false;
    const isDelivered = o.status === 'DELIVERED';
    const matchesUser = !!(currentUser && (
      (o.customerEmail && currentUser.email && o.customerEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
      (o.customerName && currentUser.name && o.customerName.toLowerCase() === currentUser.name.toLowerCase())
    ));
    const containsProduct = Array.isArray(o.items) && o.items.some((i: any) => i && (i.productId === product?.id || i.id === product?.id));
    return !!(isDelivered && matchesUser && containsProduct);
  });

  // Load Reviews from API
  useEffect(() => {
    async function loadProductReviews() {
      if (!product || !product.id) return;
      const { fetchProductReviewsAPI } = await import('../../shared/services/apiService');
      const data = await fetchProductReviewsAPI(product.id);
      if (data && data.reviews) {
        setReviewsList(data.reviews);
        setAggregatedStats({
          averageRating: data.averageRating || 5.0,
          totalCount: data.totalCount || data.reviews.length,
          ratingBreakdown: data.ratingBreakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        });
      } else {
        setReviewsList([
          { id: 'rev-fb1', userName: "Ananya Roy", rating: 5, title: "Exquisite Craftsmanship", comment: "The vegetable dye sheen on this wooden toy engine is smooth and safe. Certificate included!", isVerifiedPurchase: true, createdAt: "2026-07-15T08:00:00Z" }
        ]);
      }
    }
    loadProductReviews();
    setActiveImageIndex(0);
    setCustomNote('');
  }, [product?.id]);

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4 animate-fade-in">
        <h2 className="font-serif text-3xl font-bold text-obsidian-900">Product not found</h2>
        <button onClick={() => setCurrentView('shop')} className="px-6 py-3 bg-obsidian-900 text-cream-100 rounded-xl font-bold text-xs uppercase transition-all">
          Return to Shop
        </button>
      </div>
    );
  }

  const handleReviewPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    const { uploadImageToAPI } = await import('../../shared/services/apiService');
    const uploadedUrl = await uploadImageToAPI(file);
    if (uploadedUrl) {
      setReviewPhotos(prev => [...prev, uploadedUrl]);
      showToast('Photo uploaded to Cloudinary CDN!', 'success');
    } else {
      // Local fallback
      setReviewPhotos(prev => [...prev, URL.createObjectURL(file)]);
    }
    setIsUploadingPhoto(false);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    const { submitReviewAPI } = await import('../../shared/services/apiService');
    
    const payload = {
      productId: product.id,
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      userName: reviewerName || currentUser?.name || 'Verified Patron',
      title: reviewTitle || 'Authentic Artisanal Review',
      rating: reviewRating,
      comment: reviewComment,
      images: reviewPhotos,
      bypassVerification: isVerifiedBuyer // Pass true if buyer order verified
    };

    const res = await submitReviewAPI(payload);

    if (res && res.error) {
      showToast(res.error, 'warning');
      return;
    }

    setIsReviewFormOpen(false);
    setReviewTitle('');
    setReviewComment('');
    setReviewPhotos([]);
    showToast('Your review has been submitted for curator moderation! Thank you.', 'success');
  };

  const handleQaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    addQaToProduct(product.id, newQuestion.trim());
    setNewQuestion('');
  };

  const activeVariant = product.variants.find(v => v.id === selectedVariantId) || product.variants[0];
  const currentPrice = product.basePrice + (activeVariant?.additionalPrice || 0);
  const inWishlist = isInWishlist(product.id);
  const isCompared = compareProductIds.includes(product.id);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none', backgroundPosition: '0% 0%' });
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (deliveryPincode.length === 6) {
      setPincodeStatus({
        checked: true,
        valid: true,
        deliveryDays: 'Delivery by Tuesday, 28 Jul | Insured Express Courier Available'
      });
    } else {
      setPincodeStatus({
        checked: true,
        valid: false,
        deliveryDays: 'Please enter a valid 6-digit Indian PIN code.'
      });
    }
  };

  const handleShareProduct = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      showToast(`Link to "${product.title}" copied to clipboard!`, 'success');
    } catch (e) {
      showToast(`Sharing link for "${product.title}"`, 'info');
    }
  };

  // Find related products in the same category
  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id);

  // Helper for rendering rating stars consistently
  const renderStars = (rating: number, size = 4) => {
    const rounded = Math.floor(rating);
    return (
      <div className="flex text-gold-500">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-${size} h-${size} ${i < rounded ? 'fill-current' : 'text-cream-300'}`} 
          />
        ))}
      </div>
    );
  };

  // Compute Review distribution stats
  const totalReviewsCount = reviewsList.length || 1;
  const starsBreakdown = [5, 4, 3, 2, 1].map(stars => {
    const count = reviewsList.filter(r => Math.round(r.rating) === stars).length;
    return {
      stars,
      percentage: Math.round((count / totalReviewsCount) * 100)
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 pb-28 md:pb-12 animate-fade-in">
      
      {/* Breadcrumb Navigation */}
      <nav className="text-xs font-semibold text-obsidian-900/60 flex items-center gap-2">
        <button onClick={() => setCurrentView('home')} className="hover:text-gold-600">Home</button>
        <span>/</span>
        <button onClick={() => setCurrentView('shop')} className="hover:text-gold-600">Handcrafted Catalog</button>
        <span>/</span>
        <span className="text-obsidian-900 font-bold truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Image Gallery & 2.5x Texture Zoom Lens */}
        <div className="lg:col-span-7 space-y-4">
          <div 
            className="relative aspect-square sm:aspect-[4/5] rounded-3xl overflow-hidden border border-cream-300 bg-cream-200 cursor-crosshair shadow-lg"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img 
              src={product.images[activeImageIndex] || product.images[0]} 
              alt={product.title} 
              className="w-full h-full object-cover object-center"
            />

            {/* Macro Texture Zoom Overlay Lens */}
            <div 
              className="absolute inset-0 pointer-events-none transition-opacity duration-200 border-2 border-gold-500 rounded-3xl"
              style={{
                display: zoomStyle.display,
                backgroundImage: `url(${product.images[activeImageIndex] || product.images[0]})`,
                backgroundSize: '250%',
                backgroundPosition: zoomStyle.backgroundPosition
              }}
            />

            <div className="absolute top-4 left-4 z-10 flex flex-col sm:flex-row gap-2">
              <span className="px-3 py-1.5 bg-obsidian-900/90 text-gold-400 text-xs font-bold rounded-full border border-gold-500/30 flex items-center gap-1.5 backdrop-blur-md">
                <ShieldCheck className="w-4 h-4 text-gold-400" />
                Craft Mark Certified
              </span>

              <button 
                onClick={() => setIsCertModalOpen(true)}
                className="px-3 py-1.5 bg-gold-500 text-obsidian-900 hover:bg-gold-400 text-xs font-bold rounded-full border border-gold-500 flex items-center gap-1.5 shadow-gold-glow transition-all"
              >
                <Award className="w-4 h-4" />
                View GI Certificate
              </button>
            </div>

            <div className="absolute bottom-4 right-4 bg-obsidian-900/70 text-cream-100 px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-md pointer-events-none">
              <ZoomIn className="w-3.5 h-3.5 text-gold-400" />
              Hover to Inspect Craft Texture
            </div>
          </div>

          {/* Gallery Thumbnails Carousel */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-20 h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${idx === activeImageIndex ? 'border-gold-500 scale-95 shadow-md' : 'border-cream-300 opacity-70'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Product Specs, Variants & Purchase Actions */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between text-obsidian-900">
          <div className="space-y-6">
            
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gold-700 uppercase tracking-widest">
                  {product.craftTechnique} • {product.originRegion}
                </span>

                <div className="flex items-center gap-2">
                  {/* Compare toggle */}
                  <button 
                    onClick={() => toggleCompare(product.id)}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold uppercase transition-all ${isCompared ? 'bg-gold-500 border-gold-500 text-obsidian-900' : 'bg-cream-200 border-cream-300 text-obsidian-900'}`}
                  >
                    {isCompared ? 'Comparing' : 'Compare'}
                  </button>

                  <button 
                    onClick={handleShareProduct}
                    className="p-2.5 rounded-full border bg-cream-200 border-cream-300 text-obsidian-900 hover:text-gold-700 transition-all"
                    title="Share Craft Piece"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-2.5 rounded-full border transition-all ${inWishlist ? 'bg-terracotta-500 text-white border-terracotta-500' : 'bg-cream-200 border-cream-300 text-obsidian-900'}`}
                    aria-label="Wishlist Heart Toggle"
                  >
                    <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-obsidian-900 mt-2 leading-tight">
                {product.title}
              </h1>

              {/* Clickable Artisan Link */}
              <div className="mt-2 flex items-center gap-2">
                <button 
                  onClick={() => openArtisanProfile(product.artisanName)}
                  className="text-xs font-semibold text-gold-700 hover:underline hover:text-gold-800 transition-colors uppercase tracking-wider"
                >
                  By {product.artisanName}
                </button>
              </div>

              {/* Rating summary */}
              <div className="flex items-center gap-2 mt-2.5">
                {renderStars(product.rating, 4)}
                <span className="text-xs text-obsidian-900/70 font-bold">{product.rating} ({product.reviewsCount} customer ratings)</span>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 mt-3 border-b border-cream-300 pb-3">
                <span className="font-serif text-3xl font-bold text-obsidian-900">
                  ₹{currentPrice.toLocaleString()}
                </span>
                {product.compareAtPrice && (
                  <span className="text-sm text-obsidian-900/40 line-through font-mono">
                    ₹{product.compareAtPrice.toLocaleString()}
                  </span>
                )}
                {product.compareAtPrice && (
                  <span className="text-xs text-terracotta-500 font-bold bg-terracotta-500/10 px-2 py-0.5 rounded-md">
                    {Math.round(((product.compareAtPrice - product.basePrice) / product.compareAtPrice) * 100)}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* HIGH-TRUST AUTHENTICITY BADGES */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-2.5 bg-gold-500/10 border border-gold-500/30 rounded-xl flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gold-700 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gold-800 block">Cert Status</span>
                  <span className="text-[11px] font-bold text-obsidian-900 truncate block">
                    {(product.isSilkMarkCertified ?? product.silkMarkCertified ?? true) ? 'Silk Mark Certified' : 'Craft Certified'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-700 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-800 block">GI Tag Origin</span>
                  <span className="text-[11px] font-bold text-obsidian-900 truncate block">
                    GI Tagged: {product.giTagRegion || product.originRegion?.split(',')[0] || 'Kashmir'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-cream-200 border border-cream-300 rounded-xl flex items-center gap-2">
                <Calendar className="w-4 h-4 text-obsidian-900/70 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-obsidian-900/60 block">Crafting Time</span>
                  <span className="text-[11px] font-bold text-obsidian-900 truncate block">
                    {product.craftingHours || 120} Hours
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-cream-200 border border-cream-300 rounded-xl flex items-center gap-2">
                <Layers className="w-4 h-4 text-obsidian-900/70 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-obsidian-900/60 block">Craft Technique</span>
                  <span className="text-[11px] font-bold text-obsidian-900 truncate block">
                    {product.craftType || 'Hand-loom'}
                  </span>
                </div>
              </div>
            </div>

            {/* ARTISAN STORY CARD (WITH GRACEFUL FALLBACK) */}
            <div className="p-4 bg-white rounded-2xl border border-cream-300 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <img 
                  src={product.artisan?.avatarUrl || product.artisanAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'} 
                  alt={product.artisan?.name || product.artisanName} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-gold-500 shrink-0 shadow-sm bg-cream-100"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gold-700">Master Craftsperson</span>
                    <span className="px-2 py-0.5 bg-gold-500/20 text-gold-900 text-[9px] font-bold rounded-full border border-gold-500/30 uppercase">
                      {product.artisan?.yearsExperience || product.artisanYearsCrafting || 25}+ Yrs Exp
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-base text-obsidian-900 truncate">
                    {product.artisan?.name || product.artisanName || 'Eclipsera Master Craftsmen Guild'}
                  </h4>
                </div>
              </div>

              <p className="text-xs text-obsidian-900/80 leading-relaxed font-serif italic border-l-2 border-gold-500 pl-3">
                "{product.artisan?.story || product.artisanBio || 'Handcrafted using centuries-old heritage looms passed down through master artisan lineages. Certified for authentic vegetable dyeing and traditional weave density.'}"
              </p>
            </div>

            {/* Spec breakdown */}
            <div className="grid grid-cols-3 gap-2 bg-cream-200/50 p-3.5 rounded-xl border border-cream-300 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-obsidian-900/50 uppercase font-semibold">Dimensions</span>
                <p className="font-bold text-obsidian-900">{product.dimensions || 'N/A'}</p>
              </div>
              <div className="space-y-0.5 border-l border-cream-300 pl-3">
                <span className="text-[10px] text-obsidian-900/50 uppercase font-semibold">Weight</span>
                <p className="font-bold text-obsidian-900">{product.weight || 'N/A'}</p>
              </div>
              <div className="space-y-0.5 border-l border-cream-300 pl-3">
                <span className="text-[10px] text-obsidian-900/50 uppercase font-semibold">Shipping</span>
                <p className="font-bold text-emerald-700">{product.shippingTime || '3 - 5 days'}</p>
              </div>
            </div>

            {/* Variant Selector */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-obsidian-900">
                <span>SELECT CRAFT SHADE:</span>
                <span className="text-gold-700">{activeVariant?.colorName}</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {product.variants.map(v => (
                  <button 
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      v.id === activeVariant?.id 
                        ? 'border-gold-500 bg-gold-500/10 shadow-sm' 
                        : 'border-cream-300 bg-white hover:border-cream-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0" style={{ backgroundColor: v.colorHex }} />
                      <span className="text-xs font-semibold text-obsidian-900 truncate">{v.colorName}</span>
                    </div>
                    {v.id === activeVariant?.id && <Check className="w-4 h-4 text-gold-600 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Personalization / Gift engraving text field */}
            {product.customizable && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <label htmlFor="customNoteInput" className="uppercase tracking-wide text-obsidian-900/80">Add Custom Engraving / Gift Note (Optional)</label>
                  <span className="text-[10px] font-mono text-obsidian-900/40">{customNote.length}/100</span>
                </div>
                <input
                  id="customNoteInput"
                  type="text"
                  maxLength={100}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="e.g. Happy Anniversary Mom! or Engrave 'A.K. 2026'"
                  className="w-full bg-white border border-cream-300 rounded-xl px-3.5 py-2.5 text-xs text-obsidian-900 placeholder-obsidian-900/30 focus:outline-none focus:border-gold-500"
                />
              </div>
            )}

            {/* Stock Urgency Status Badge */}
            <div className="p-3 rounded-xl border flex items-center justify-between text-xs bg-emerald-500/10 border-emerald-500/30">
              <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                In Stock & Ready for Immediate Dispatch
              </span>
              <span className="text-obsidian-900/60 font-semibold">Only {activeVariant?.stockQuantity || 4} units left</span>
            </div>

            {/* Delivery PIN Code Checker */}
            <div className="bg-white/80 p-4 rounded-2xl border border-cream-300 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-obsidian-900">
                <MapPin className="w-4 h-4 text-gold-600" />
                <span>Delivery & COD Availability Checker</span>
              </div>

              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <input 
                  type="text" 
                  maxLength={6}
                  value={deliveryPincode}
                  onChange={(e) => setDeliveryPincode(e.target.value)}
                  placeholder="Enter 6-digit PIN code"
                  className="flex-1 bg-cream-100 border border-cream-300 rounded-xl px-3 py-2 text-xs font-bold text-obsidian-900 focus:outline-none focus:border-gold-500"
                />
                <button 
                  type="submit" 
                  className="bg-obsidian-900 text-cream-100 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gold-600 hover:text-obsidian-900 transition-all"
                >
                  Check
                </button>
              </form>

              {pincodeStatus.checked && (
                <p className={`text-[11px] font-semibold mt-1 ${pincodeStatus.valid ? 'text-emerald-700' : 'text-terracotta-500'}`}>
                  {pincodeStatus.deliveryDays}
                </p>
              )}
            </div>

            {/* Primary Action Buttons: Add to Cart & BUY NOW */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-cream-300 rounded-xl bg-cream-100 px-3">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 font-bold hover:text-gold-600">-</button>
                  <span className="px-3 text-sm font-bold">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-2 font-bold hover:text-gold-600">+</button>
                </div>

                <button 
                  onClick={() => {
                    const customMessage = customNote.trim() ? ` [Engraving: ${customNote}]` : '';
                    const customProduct = customMessage 
                      ? { ...product, title: `${product.title}${customMessage}` } 
                      : product;
                    addToCart(customProduct, activeVariant?.id || product.variants[0].id, quantity);
                  }}
                  className="flex-1 bg-white text-obsidian-900 border-2 border-obsidian-900 hover:bg-cream-200 py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>

              {/* Instant Buy Now Button */}
              <button 
                onClick={() => {
                  const customMessage = customNote.trim() ? ` [Engraving: ${customNote}]` : '';
                  const customProduct = customMessage 
                    ? { ...product, title: `${product.title}${customMessage}` } 
                    : product;
                  buyNow(customProduct, activeVariant?.id || product.variants[0].id, quantity);
                }}
                className="w-full bg-gold-500 text-obsidian-900 hover:bg-gold-400 py-4 rounded-xl text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 shadow-gold-glow transition-all"
              >
                <Zap className="w-4 h-4" />
                BUY NOW (Instant Checkout)
              </button>
            </div>

            {/* Clickable Artisan Bio Card */}
            <div 
              onClick={() => openArtisanProfile(product.artisanName)}
              className="p-3.5 bg-cream-200/60 hover:bg-cream-200 rounded-2xl border border-cream-300 flex items-center gap-3 cursor-pointer transition-all duration-200"
            >
              <img src={product.artisanAvatar} alt={product.artisanName} className="w-12 h-12 rounded-full object-cover border-2 border-gold-500 shrink-0 animate-fade-in" />
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-gold-700 uppercase">Crafted by Master Artisan</p>
                <h4 className="font-serif font-bold text-xs text-obsidian-900 flex items-center gap-1.5">
                  {product.artisanName}
                  <span className="text-[9px] px-1.5 py-0.5 bg-gold-500/20 text-gold-800 rounded font-sans uppercase font-bold tracking-wide">
                    {product.artisanYearsCrafting || 20} Yrs Experience
                  </span>
                </h4>
                <p className="text-[11px] text-obsidian-900/70 line-clamp-1">{product.artisanBio}</p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Tabbed details Section */}
      <section className="bg-white rounded-3xl border border-cream-300 shadow-sm overflow-hidden text-obsidian-900">
        <div className="flex border-b border-cream-300 bg-cream-200/30 overflow-x-auto no-scrollbar">
          {(['description', 'materials', 'shipping', 'reviews'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
                activeTab === tab 
                  ? 'border-gold-500 text-obsidian-900 bg-white' 
                  : 'border-transparent text-obsidian-900/60 hover:text-obsidian-900'
              }`}
            >
              {tab === 'reviews' ? `Reviews & Q&A (${reviewsList.length})` : tab}
            </button>
          ))}
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {activeTab === 'description' && (
            <div className="space-y-4 max-w-3xl leading-relaxed text-xs">
              <h3 className="font-serif text-lg font-bold">The Story Behind This Piece</h3>
              <p className="text-obsidian-900/80 font-sans">{product.description}</p>
              <div className="grid grid-cols-2 gap-4 pt-3 text-xs">
                <div>
                  <h4 className="font-bold text-gold-700 uppercase tracking-widest text-[10px]">Craft Technique</h4>
                  <p className="mt-1 font-semibold">{product.craftTechnique}</p>
                </div>
                <div>
                  <h4 className="font-bold text-gold-700 uppercase tracking-widest text-[10px]">Origin Region</h4>
                  <p className="mt-1 font-semibold">{product.originRegion}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="space-y-4 max-w-3xl leading-relaxed text-xs">
              <h3 className="font-serif text-lg font-bold">Materials & Craftsmanship Care</h3>
              <p className="text-obsidian-900/80 font-sans">
                Every piece is handpicked and sustainably crafted by certified artisans.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3 text-xs">
                <div>
                  <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] text-gold-700 tracking-wider">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Materials Selected</span>
                  </div>
                  <p className="mt-1 font-semibold text-obsidian-900/85">{product.material}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] text-gold-700 tracking-wider">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Care Instructions</span>
                  </div>
                  <p className="mt-1 font-semibold text-obsidian-900/85">{product.careInstructions}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-4 max-w-3xl leading-relaxed text-xs">
              <h3 className="font-serif text-lg font-bold">Shipping, Delivery & Return Policy</h3>
              <p className="text-obsidian-900/80 font-sans">
                We take special care in wrapping these fragile, luxury, handcrafted art pieces. Every package is sealed in high-security custom wooden crates or heavy corrugated boxes.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3 text-xs">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-gold-600" />
                    <span className="font-bold text-[11px] uppercase">Insured Express Courier</span>
                  </div>
                  <p className="text-obsidian-900/70">Dispatched within 24 hours. Transit time ranges from 3 to 5 business days with live tracking links.</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gold-600" />
                    <span className="font-bold text-[11px] uppercase">7-Day Craft Return Guarantee</span>
                  </div>
                  <p className="text-obsidian-900/70">If the handcrafted item is damaged in transit, we provide free pickup and an immediate 100% replacement or refund.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-10">
              
              {/* Reviews Breakdown and Write Review Button */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-cream-200 pb-8 text-xs">
                
                {/* Total rating score */}
                <div className="md:col-span-3 text-center space-y-1">
                  <span className="font-serif text-4xl font-extrabold">{aggregatedStats.averageRating || product.rating}</span>
                  {renderStars(aggregatedStats.averageRating || product.rating, 5)}
                  <p className="text-[10px] text-obsidian-900/50 uppercase font-bold tracking-widest mt-1">Based on {aggregatedStats.totalCount || reviewsList.length} reviews</p>
                </div>

                {/* Rating stars bars */}
                <div className="md:col-span-6 space-y-2">
                  {[5, 4, 3, 2, 1].map(stars => {
                    const count = aggregatedStats.ratingBreakdown[stars] || 0;
                    const total = aggregatedStats.totalCount || reviewsList.length || 1;
                    const percentage = Math.round((count / total) * 100);
                    return (
                      <div key={stars} className="flex items-center gap-3">
                        <span className="w-8 font-semibold text-right">{stars} ★</span>
                        <div className="flex-1 h-2 bg-cream-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gold-500 rounded-full" style={{ width: `${percentage}%` }} />
                        </div>
                        <span className="w-8 text-obsidian-900/60 font-semibold">{percentage}%</span>
                      </div>
                    );
                  })}
                </div>

                {/* Call to write review / Verified Lock */}
                <div className="md:col-span-3 text-center sm:text-right space-y-2">
                  {isVerifiedBuyer ? (
                    <button 
                      onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
                      className="w-full sm:w-auto bg-obsidian-900 text-cream-100 hover:bg-gold-500 hover:text-obsidian-900 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md"
                    >
                      + Write A Verified Review
                    </button>
                  ) : (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center text-[10px]">
                      <span className="font-bold text-amber-800 flex items-center justify-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
                        Verified Buyers Only
                      </span>
                      <p className="text-amber-900/70 mt-0.5">Reviews are strictly reserved for patrons with a delivered order of this item.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Review Filter Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-cream-100/60 p-3 rounded-2xl border border-cream-200 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-obsidian-900 uppercase text-[10px] tracking-wider">Filter:</span>
                  <button
                    onClick={() => setReviewStarFilter('ALL')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${reviewStarFilter === 'ALL' ? 'bg-gold-500 text-obsidian-900' : 'bg-white text-obsidian-900/70 hover:text-obsidian-900'}`}
                  >
                    All
                  </button>
                  {[5, 4, 3, 2, 1].map(st => (
                    <button
                      key={st}
                      onClick={() => setReviewStarFilter(st)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${reviewStarFilter === st ? 'bg-gold-500 text-obsidian-900' : 'bg-white text-obsidian-900/70 hover:text-obsidian-900'}`}
                    >
                      {st} ★
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-obsidian-900">
                  <input
                    type="checkbox"
                    checked={photosOnlyFilter}
                    onChange={(e) => setPhotosOnlyFilter(e.target.checked)}
                    className="accent-gold-500 w-4 h-4 rounded"
                  />
                  <span>With Photos Only</span>
                </label>
              </div>

              {/* Review submit form modal */}
              {isReviewFormOpen && (
                <form onSubmit={handleReviewSubmit} className="p-6 bg-cream-100 rounded-3xl border-2 border-gold-500 space-y-4 text-xs animate-fade-in text-obsidian-900 shadow-xl">
                  <h4 className="font-serif font-bold text-base text-obsidian-900 flex items-center gap-2">
                    <Star className="w-5 h-5 text-gold-500 fill-current" />
                    <span>Write Your Verified Heritage Review</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold uppercase block mb-1 text-[10px] text-gold-700">Review Title</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Masterpiece Finish & Insured Delivery"
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        className="w-full bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-gold-500 text-obsidian-900"
                      />
                    </div>

                    <div>
                      <label className="font-bold uppercase block mb-1 text-[10px] text-gold-700">Rating (1 to 5 Stars)</label>
                      <div className="flex items-center gap-1 pt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button 
                            key={star} 
                            type="button" 
                            onClick={() => setReviewRating(star)}
                            className="p-1 text-gold-500 hover:scale-110 transition-all"
                          >
                            <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-current' : 'text-cream-300'}`} />
                          </button>
                        ))}
                        <span className="font-bold text-gold-700 ml-2">{reviewRating} Stars</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold uppercase block mb-1 text-[10px] text-gold-700">Your Detailed Review</label>
                    <textarea 
                      required
                      rows={3}
                      placeholder="Describe the craft weight, texture finish, and delivery experience..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full bg-white border border-cream-300 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-gold-500 text-obsidian-900"
                    />
                  </div>

                  {/* Cloudinary Photo Uploader */}
                  <div>
                    <label className="font-bold uppercase block mb-1 text-[10px] text-gold-700">Attach Unboxing Photo (Cloudinary CDN)</label>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer bg-white border border-dashed border-gold-500 hover:bg-gold-50 text-gold-700 px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs">
                        <Upload className="w-4 h-4 text-gold-600" />
                        <span>{isUploadingPhoto ? 'Uploading to Cloudinary...' : 'Choose Image File'}</span>
                        <input type="file" accept="image/*" onChange={handleReviewPhotoUpload} disabled={isUploadingPhoto} className="hidden" />
                      </label>

                      {reviewPhotos.map((ph, idx) => (
                        <img key={idx} src={ph} alt="" className="w-12 h-12 object-cover rounded-xl border border-gold-500/40 shadow-sm" />
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button 
                      type="button" 
                      onClick={() => setIsReviewFormOpen(false)}
                      className="px-4 py-2 bg-cream-300 text-obsidian-900 rounded-xl font-bold uppercase text-xs"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-6 py-2.5 bg-obsidian-900 text-cream-100 hover:bg-gold-600 hover:text-obsidian-900 rounded-xl font-bold uppercase tracking-wider transition-all shadow-gold-glow"
                    >
                      Submit For Moderation
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews List Display */}
              <div className="space-y-4">
                {reviewsList
                  .filter(r => reviewStarFilter === 'ALL' || Math.round(r.rating) === reviewStarFilter)
                  .filter(r => !photosOnlyFilter || (r.images?.length > 0 || r.photos?.length > 0))
                  .map(rev => (
                    <div key={rev.id} className="p-5 bg-cream-100/70 rounded-3xl border border-cream-200 space-y-3 text-xs shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-obsidian-900">{rev.userName || rev.patronName || 'Heritage Patron'}</span>
                            {(rev.isVerifiedPurchase || rev.isVerified) && (
                              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-800 border border-emerald-500/30 font-bold rounded text-[10px] flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600" /> Verified Heritage Buyer
                              </span>
                            )}
                          </div>
                          <span className="font-serif font-bold text-xs text-obsidian-900 block mt-1">{rev.title || 'Artisanal Craft Review'}</span>
                        </div>

                        <div className="flex items-center text-gold-500 font-bold">
                          {'★'.repeat(rev.rating || 5)}
                        </div>
                      </div>

                      <p className="text-obsidian-900/80 leading-relaxed font-sans text-xs">
                        "{rev.comment}"
                      </p>

                      {/* Cloudinary Photos */}
                      {(rev.images?.length > 0 || rev.photos?.length > 0) && (
                        <div className="flex gap-2 pt-1">
                          {(rev.images || rev.photos).map((ph: string, idx: number) => (
                            <img key={idx} src={ph} alt="" className="w-16 h-16 object-cover rounded-xl border border-gold-500/30 shadow-sm" />
                          ))}
                        </div>
                      )}

                      {/* Curator Official Store Reply */}
                      {rev.adminReply && (
                        <div className="mt-3 p-3 bg-amber-50 border-l-4 border-gold-500 rounded-r-2xl space-y-1">
                          <span className="text-[10px] font-bold uppercase text-gold-800 block">Official Eclipsera Guild Curator Response</span>
                          <p className="text-obsidian-900/85 italic text-xs">"{rev.adminReply}"</p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              {/* Product Q&A Section */}
              <div className="pt-6 border-t border-cream-200 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-serif font-bold text-sm">Product Q&A</h4>
                    <p className="text-[10px] text-obsidian-900/50">Ask questions directly about this artisan piece</p>
                  </div>
                </div>

                {/* Ask a question form */}
                <form onSubmit={handleQaSubmit} className="flex gap-2 text-xs">
                  <input
                    type="text"
                    required
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Ask about dimensions, customizing, shipping, etc."
                    className="flex-1 bg-cream-100 border border-cream-300 rounded-xl px-3.5 py-2.5 text-xs text-obsidian-900 placeholder-obsidian-900/40 focus:outline-none focus:border-gold-500"
                  />
                  <button
                    type="submit"
                    className="bg-obsidian-900 text-cream-100 hover:bg-gold-500 hover:text-obsidian-900 px-4 py-2.5 rounded-xl font-bold uppercase transition-all"
                  >
                    Ask
                  </button>
                </form>

                {/* Q&A list */}
                <div className="space-y-4">
                  {!product.qaList || product.qaList.length === 0 ? (
                    <p className="text-[11px] text-obsidian-900/50 italic">No questions asked yet. Be the first to ask!</p>
                  ) : (
                    product.qaList.map(qa => (
                      <div key={qa.id} className="space-y-2 text-xs p-4 bg-cream-100/40 rounded-xl border border-cream-200">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-gold-700 uppercase">Question from {qa.user}</span>
                          <p className="font-semibold text-obsidian-900">Q: {qa.question}</p>
                        </div>
                        {qa.answer ? (
                          <div className="pl-4 border-l-2 border-gold-500 space-y-0.5 bg-gold-500/5 p-2 rounded-r-lg">
                            <span className="text-[10px] font-bold text-obsidian-900 uppercase">Answer from Artisan Partner</span>
                            <p className="text-obsidian-900/80 font-sans">A: {qa.answer}</p>
                          </div>
                        ) : (
                          <p className="text-[10px] text-obsidian-900/50 italic pl-4">Awaiting response from artisan collective...</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </section>

      {/* Related products horizontal scroll section */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-cream-300 pb-2">
            <h3 className="font-serif text-lg font-bold text-obsidian-900">Related Masterpieces</h3>
            <button 
              onClick={() => setCurrentView('shop')}
              className="text-xs text-gold-700 hover:text-gold-800 font-bold uppercase flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {relatedProducts.map(rel => (
              <div 
                key={rel.id}
                onClick={() => openProductDetail(rel.slug)}
                className="w-48 sm:w-56 shrink-0 bg-white border border-cream-300 rounded-2xl overflow-hidden p-3.5 space-y-2 hover:-translate-y-1 hover:shadow-luxury cursor-pointer transition-all duration-300 text-obsidian-900"
              >
                <div className="aspect-square bg-cream-200 rounded-xl overflow-hidden relative">
                  <img src={rel.images[0]} alt={rel.title} className="w-full h-full object-cover" />
                  {rel.isBestSeller && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-gold-500 text-obsidian-900 text-[8px] font-bold rounded uppercase">Best Seller</span>
                  )}
                </div>
                <div>
                  <span className="text-[9px] text-gold-700 font-bold uppercase tracking-wider block truncate">{rel.craftTechnique}</span>
                  <h4 className="font-serif font-bold text-xs hover:text-gold-600 line-clamp-1 mt-0.5">{rel.title}</h4>
                  <div className="flex justify-between items-center mt-2.5 pt-1.5 border-t border-cream-200">
                    <span className="font-bold text-xs">₹{rel.basePrice.toLocaleString()}</span>
                    <div className="flex items-center gap-0.5 text-[9px] font-bold">
                      <Star className="w-3 h-3 text-gold-500 fill-current" />
                      <span>{rel.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* GI Authenticity Certificate Modal */}
      {isCertModalOpen && (
        <GICertificateModal 
          product={product} 
          patronName={reviewerName || "Ananya Sharma"} 
          onClose={() => setIsCertModalOpen(false)} 
        />
      )}

      {/* Sticky Bottom Mobile Action Bar (Thumb-Accessible for 360px - 430px) */}
      <div className="fixed bottom-0 inset-x-0 bg-cream-100/95 backdrop-blur-mobile border-t border-cream-300 p-3 z-40 md:hidden shadow-2xl pb-safe flex items-center gap-2">
        <button 
          onClick={() => {
            const customMessage = customNote.trim() ? ` [Engraving: ${customNote}]` : '';
            const customProduct = customMessage ? { ...product, title: `${product.title}${customMessage}` } : product;
            addToCart(customProduct, activeVariant?.id || product.variants[0].id, quantity);
          }}
          className="flex-1 bg-white text-obsidian-900 border-2 border-obsidian-900 py-3 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-1.5 min-h-[44px]"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Cart</span>
        </button>

        <button 
          onClick={() => {
            const customMessage = customNote.trim() ? ` [Engraving: ${customNote}]` : '';
            const customProduct = customMessage ? { ...product, title: `${product.title}${customMessage}` } : product;
            buyNow(customProduct, activeVariant?.id || product.variants[0].id, quantity);
          }}
          className="flex-1 bg-gold-500 text-obsidian-900 hover:bg-gold-400 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-gold-glow min-h-[44px]"
        >
          <Zap className="w-4 h-4" />
          <span>BUY NOW</span>
        </button>
      </div>

    </div>
  );
};
export default ProductDetailView;

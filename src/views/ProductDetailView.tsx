import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, Heart, ShoppingBag, Star, ZoomIn, Check, MapPin, Zap, Share2, ThumbsUp, MessageSquare, Award, Upload } from 'lucide-react';
import { GICertificateModal } from '../components/common/GICertificateModal';
import { fetchReviewsFromAPI, createReviewInAPI, uploadImageToAPI } from '../services/apiService';

export const ProductDetailView: React.FC = () => {
  const { selectedProductSlug, products, addToCart, buyNow, isInWishlist, toggleWishlist, setCurrentView, showToast } = useStore();

  const product = products.find(p => p.slug === selectedProductSlug) || products[0];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(product.variants[0]?.id || '');
  const [quantity, setQuantity] = useState(1);

  // PIN Code Delivery Checker State
  const [deliveryPincode, setDeliveryPincode] = useState('560001');
  const [pincodeStatus, setPincodeStatus] = useState<{ checked: boolean; valid: boolean; deliveryDays: string }>({
    checked: true,
    valid: true,
    deliveryDays: '3 - 5 Business Days (Free Delivery)'
  });

  // GI Certificate Modal State
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  // Review Form & Reviews List State
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ display: 'none' });

  // Load Reviews from Neon Cloud PostgreSQL
  useEffect(() => {
    async function loadProductReviews() {
      if (!product.id) return;
      const apiRevs = await fetchReviewsFromAPI(product.id);
      if (apiRevs && apiRevs.length) {
        setReviewsList(apiRevs);
      }
    }
    loadProductReviews();
  }, [product.id]);

  const handleReviewPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    showToast('Uploading photo to Cloudinary...', 'info');
    const uploadedUrl = await uploadImageToAPI(file);
    setIsUploadingPhoto(false);
    if (uploadedUrl) {
      setReviewPhotos(prev => [...prev, uploadedUrl]);
      showToast('Review photo uploaded to Cloudinary!', 'success');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    const newRev = {
      id: `rev-${Date.now()}`,
      productId: product.id,
      patronName: reviewerName || 'Verified Patron',
      rating: reviewRating,
      comment: reviewComment,
      photos: reviewPhotos
    };
    setReviewsList(prev => [newRev, ...prev]);
    setIsReviewFormOpen(false);
    showToast('Thank you! Your verified review has been published.', 'success');
    await createReviewInAPI(newRev);
  };

  const activeVariant = product.variants.find(v => v.id === selectedVariantId) || product.variants[0];
  const currentPrice = product.basePrice + (activeVariant?.additionalPrice || 0);
  const inWishlist = isInWishlist(product.id);

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
        deliveryDays: 'Delivery by Tuesday, 28 Jul | Insured Express Courier'
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 pb-28 md:pb-12">
      
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
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gold-700 uppercase tracking-widest">
                  {product.craftTechnique} • {product.originRegion}
                </span>

                <div className="flex items-center gap-2">
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

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex text-gold-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-cream-300'}`} />
                  ))}
                </div>
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
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 font-bold text-obsidian-900 hover:text-gold-600">-</button>
                  <span className="px-3 text-sm font-bold text-obsidian-900">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-2 font-bold text-obsidian-900 hover:text-gold-600">+</button>
                </div>

                <button 
                  onClick={() => addToCart(product, activeVariant?.id || product.variants[0].id, quantity)}
                  className="flex-1 bg-white text-obsidian-900 border-2 border-obsidian-900 hover:bg-cream-200 py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>

              {/* Instant Buy Now Button */}
              <button 
                onClick={() => buyNow(product, activeVariant?.id || product.variants[0].id, quantity)}
                className="w-full bg-gold-500 text-obsidian-900 hover:bg-gold-400 py-4 rounded-xl text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 shadow-gold-glow transition-all"
              >
                <Zap className="w-4 h-4" />
                BUY NOW (Instant Checkout)
              </button>
            </div>

            {/* Artisan Bio Attribution */}
            <div className="p-3.5 bg-cream-200/60 rounded-2xl border border-cream-300 flex items-center gap-3">
              <img src={product.artisanAvatar} alt={product.artisanName} className="w-12 h-12 rounded-full object-cover border-2 border-gold-500 shrink-0" />
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-gold-700 uppercase">Crafted by Master Artisan</p>
                <h4 className="font-serif font-bold text-xs text-obsidian-900">{product.artisanName}</h4>
                <p className="text-[11px] text-obsidian-900/70">{product.artisanBio}</p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Verified Customer Reviews & Rating Breakdown Section */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cream-200 pb-4">
          <div>
            <span className="text-[10px] font-bold text-gold-700 uppercase tracking-widest block">GI CRAFT PATRON FEEDBACK</span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-obsidian-900">Verified Customer Reviews</h3>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
              className="px-4 py-2 bg-gold-500 text-obsidian-900 hover:bg-gold-400 font-bold rounded-xl text-xs uppercase flex items-center gap-1.5 shadow-sm transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              + Write a Review
            </button>

            <div className="text-right pl-3 border-l border-cream-300">
              <span className="font-serif text-2xl font-bold text-obsidian-900">{product.rating}</span>
              <span className="text-xs text-obsidian-900/60 font-semibold block">out of 5 stars</span>
            </div>
          </div>
        </div>

        {/* Interactive Review Form */}
        {isReviewFormOpen && (
          <form onSubmit={handleReviewSubmit} className="p-5 bg-cream-100/80 rounded-2xl border border-gold-500/30 space-y-4 text-xs animate-fade-in">
            <h4 className="font-serif font-bold text-sm text-obsidian-900">Share Your Craft Experience</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold uppercase block mb-1">Your Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Ananya Sharma"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-gold-500 text-obsidian-900"
                />
              </div>

              <div>
                <label className="font-bold uppercase block mb-1">Rating (1 to 5 Stars)</label>
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
              <label className="font-bold uppercase block mb-1">Your Written Review</label>
              <textarea 
                required
                rows={3}
                placeholder="Describe the craft quality, texture finish, and delivery experience..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full bg-white border border-cream-300 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-gold-500 text-obsidian-900"
              />
            </div>

            {/* Cloudinary Photo Uploader */}
            <div>
              <label className="font-bold uppercase block mb-1">Upload Unboxing Photo (Cloudinary)</label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer bg-white border border-dashed border-gold-500/50 hover:bg-gold-500/10 text-gold-700 px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all">
                  <Upload className="w-4 h-4" />
                  <span>{isUploadingPhoto ? 'Uploading...' : 'Choose Photo File'}</span>
                  <input type="file" accept="image/*" onChange={handleReviewPhotoUpload} disabled={isUploadingPhoto} className="hidden" />
                </label>

                {reviewPhotos.map((ph, idx) => (
                  <img key={idx} src={ph} alt="" className="w-10 h-10 object-cover rounded-lg border border-gold-500/40" />
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              className="px-6 py-2.5 bg-obsidian-900 text-cream-100 hover:bg-gold-600 hover:text-obsidian-900 rounded-xl font-bold uppercase tracking-wider transition-all"
            >
              Submit Verified Patron Review
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reviewsList.map(rev => (
            <div key={rev.id} className="p-4 bg-cream-100/70 rounded-2xl border border-cream-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-obsidian-900">{rev.patronName}</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-700 font-bold rounded text-[10px] flex items-center gap-1">
                  <Check className="w-3 h-3" /> Verified Patron
                </span>
              </div>
              <div className="flex text-gold-500">
                {[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-cream-300'}`} />)}
              </div>
              <p className="text-obsidian-900/80 leading-relaxed font-sans">
                "{rev.comment}"
              </p>
              {rev.photos && rev.photos.length > 0 && (
                <div className="flex gap-2 pt-1">
                  {rev.photos.map((ph: string, idx: number) => (
                    <img key={idx} src={ph} alt="" className="w-12 h-12 object-cover rounded-lg border border-gold-500/30" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* GI Authenticity Certificate Modal */}
      {isCertModalOpen && (
        <GICertificateModal 
          product={product} 
          patronName="Ananya Sharma" 
          onClose={() => setIsCertModalOpen(false)} 
        />
      )}

    </div>
  );
};

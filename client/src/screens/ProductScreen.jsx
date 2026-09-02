import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../context/StoreContext';
import RelatedProductsCarousel from '../components/RelatedProductsCarousel';
import SkeletonProduct from '../components/SkeletonProduct';
import OptimizedImage from '../components/OptimizedImage';
import ImageZoom from '../components/ImageZoom';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';

const StarRating = ({ rating }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 md:w-5 md:h-5 ${star <= Math.round(rating) ? 'text-accent-gold fill-accent-gold' : 'text-accent-gold/30'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ))}
    </div>
  );
};

const Accordion = ({ title, children, content, defaultOpen = false, className = '' }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!content && !children) return null;

  return (
    <div className={`border-b border-accent-gold/20 py-4 ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full justify-between items-center text-left focus:outline-none"
      >
        <h3 className="text-xl font-serif font-bold text-text-primary">{title}</h3>
        <span className="text-accent-gold ml-4">
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          )}
        </span>
      </button>
      <div
        className={`mt-4 text-text-primary/80 leading-relaxed overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        {children || <p>{content}</p>}
      </div>
    </div>
  );
};

const ProductScreen = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cart & Wishlist state
  const { addToCart, addToWishlist, userInfo, setIsCartDrawerOpen } = useContext(StoreContext);
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [personalization, setPersonalization] = useState('');

  // Gallery state
  const [mainImage, setMainImage] = useState('');
  const [currentMobileImageIdx, setCurrentMobileImageIdx] = useState(0);

  const handleMobileScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.offsetWidth;
    const newIdx = Math.round(scrollLeft / width);
    if (newIdx !== currentMobileImageIdx) {
      setCurrentMobileImageIdx(newIdx);
    }
  };

  // Reviews state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Live Social Proof state
  const [viewersCount, setViewersCount] = useState(0);
  const [purchasedCount, setPurchasedCount] = useState(0);

  // Pincode Delivery Estimator State
  const [pincode, setPincode] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState(null);

  // Tabs State
  const [activeTab, setActiveTab] = useState('Description');

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (pincode.length === 6) {
      // Simulate API call for delivery date based on pincode
      const randomDays = Math.floor(Math.random() * 4) + 2; // 2 to 5 days
      const date = new Date(Date.now() + randomDays * 24 * 60 * 60 * 1000);
      setDeliveryEstimate(`Get it by ${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`);
    } else {
      setDeliveryEstimate('Please enter a valid 6-digit pincode');
    }
  };

  // Mobile sticky bar
  const [showStickyBar, setShowStickyBar] = useState(false);
  const mainAddToCartRef = useRef(null);

  useEffect(() => {
    // Generate randomized social proof numbers on product load
    setViewersCount(Math.floor(Math.random() * (45 - 12 + 1) + 12));
    setPurchasedCount(Math.floor(Math.random() * (12 - 2 + 1) + 2));
    
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/products/${id}`);
        setProduct(data);
        setMainImage(data.image);
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0].name);
        }
        setLoading(false);
        
        // Save to recently viewed
        const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const updatedRecent = [data, ...recent.filter(item => item._id !== data._id)].slice(0, 8);
        localStorage.setItem('recentlyViewed', JSON.stringify(updatedRecent));
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, reviewSuccess]);

  // Intersection observer for sticky mobile bar
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // If main button is NOT intersecting (visible), show sticky bar
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (mainAddToCartRef.current) {
      observer.observe(mainAddToCartRef.current);
    }

    return () => {
      if (mainAddToCartRef.current) observer.unobserve(mainAddToCartRef.current);
    };
  }, [loading, product]);

  const addToCartHandler = () => {
    addToCart(product, qty, selectedVariant, personalization);
    setIsCartDrawerOpen(true);
  };

  const submitReviewHandler = async (e) => {
    e.preventDefault();
    try {
      setReviewLoading(true);
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(`/api/products/${id}/reviews`, { rating, comment }, config);
      toast.success('Review submitted successfully!');
      setReviewSuccess(true);
      setRating(0);
      setComment('');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setReviewLoading(false);
      setTimeout(() => setReviewSuccess(false), 3000);
    }
  };

  if (loading) {
    return <SkeletonProduct />;
  }

  if (error || !product) {
    return (
      <div className="bg-red-900/20 text-red-400 p-6 rounded-xl text-center mt-10 max-w-2xl mx-auto border border-red-900/50">
        {error || 'Product not found'}
      </div>
    );
  }

  const allImages = [product.image, ...(product.images || [])].filter(Boolean);

  // Calculate stock based on variant if variants exist
  const currentVariantObj = product.variants?.find(v => v.name === selectedVariant);
  const availableStock = currentVariantObj ? currentVariantObj.countInStock : product.countInStock;
  const isOutOfStock = availableStock === 0;

  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.image,
    "description": product.description,
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "INR",
      "availability": product.countInStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  if (product.numReviews > 0) {
    structuredData.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.numReviews
    };
  }

  return (
    <>
      <div className="animate-fade-in pb-40 md:pb-12">
      <SEO
        title={`${product.name} | Eclipsera`}
        description={product.description}
        image={product.image}
        structuredData={structuredData}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4 md:mb-8 text-sm text-text-secondary font-medium">
          <Link to="/" className="hover:text-accent-gold transition-colors">Home</Link>
          <span className="text-accent-gold/40">/</span>
          {product.category && (
            <>
              <span className="hover:text-accent-gold transition-colors cursor-pointer">{product.category}</span>
              <span className="text-accent-gold/40">/</span>
            </>
          )}
          <span className="text-text-primary truncate">{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">

          {/* Left Side: Image Gallery */}
          <div className="lg:w-1/2 relative">
            {/* Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full md:w-3/4 md:h-3/4 bg-accent-gold/20 blur-[60px] md:blur-[120px] rounded-full pointer-events-none z-0"></div>

            <div className="sticky top-24 z-10">
              {/* Desktop View: Main Image + Thumbnails */}
              <div className="hidden md:block">
                <div className="bg-surface rounded-2xl shadow-md border border-accent-gold/20 overflow-hidden relative group aspect-square md:aspect-[4/5]">
                  <ImageZoom
                    key={mainImage}
                    src={mainImage}
                    alt={product.name}
                    className="w-full h-full animate-fade-in"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.processingTime && (
                      <span className="bg-surface/90 backdrop-blur text-accent-gold text-xs font-bold px-3 py-1.5 rounded-full border border-accent-gold/30 shadow-sm uppercase tracking-wider">
                        {product.processingTime}
                      </span>
                    )}
                    {isOutOfStock ? (
                      <span className="bg-red-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wider">
                        Out of Stock
                      </span>
                    ) : (
                      <span className="bg-green-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wider">
                        In Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Thumbnails */}
                {allImages.length > 1 && (
                  <div className="flex gap-4 mt-4 overflow-x-auto pb-2 snap-x hide-scrollbar">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setMainImage(img)}
                        className={`w-20 aspect-square flex-shrink-0 rounded-xl overflow-hidden transition-all snap-center ${mainImage === img ? 'ring-2 ring-offset-2 ring-offset-surface ring-accent-gold scale-105' : 'border border-accent-gold/20 opacity-70 hover:opacity-100 hover:border-accent-gold/50'}`}
                      >
                        <OptimizedImage
                          src={img}
                          alt={`Thumbnail ${idx}`}
                          className="w-full h-full object-cover"
                          sizes="80px"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile View: Swipeable Carousel */}
              <div className="md:hidden relative w-full aspect-square bg-surface rounded-2xl border border-accent-gold/20 overflow-hidden shadow-sm">
                <div 
                  className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar h-full w-full"
                  onScroll={handleMobileScroll}
                >
                  {allImages.map((img, idx) => (
                    <div key={idx} className="w-full h-full flex-shrink-0 snap-center relative">
                      <OptimizedImage
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                        sizes="100vw"
                      />
                    </div>
                  ))}
                </div>
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  {product.processingTime && (
                    <span className="bg-surface/90 backdrop-blur text-accent-gold text-xs font-bold px-3 py-1.5 rounded-full border border-accent-gold/30 shadow-sm uppercase tracking-wider">
                      {product.processingTime}
                    </span>
                  )}
                  {isOutOfStock ? (
                    <span className="bg-red-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wider">
                      Out of Stock
                    </span>
                  ) : (
                    <span className="bg-green-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wider">
                      In Stock
                    </span>
                  )}
                </div>

                {/* Pagination Dots */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                    {allImages.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`transition-all duration-300 rounded-full ${idx === currentMobileImageIdx ? 'w-4 h-1.5 bg-accent-gold' : 'w-1.5 h-1.5 bg-bg-base/70 backdrop-blur-sm'}`} 
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Product Actions */}
          <div className="lg:w-1/2 flex flex-col justify-start pt-2">
            <div className="flex justify-between items-start mb-4 animate-fade-in" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-extrabold text-text-primary tracking-tight leading-tight pr-4">
                {product.name}
              </h1>
              <button
                onClick={() => addToWishlist(product)}
                className="p-3 text-text-secondary hover:text-red-500 hover:bg-surface rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent-gold shadow-sm border border-accent-gold/10 bg-bg-base/50 backdrop-blur"
                aria-label="Add to Wishlist"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </button>
            </div>

            <div className="flex items-center gap-4 mb-2 animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
              <div className="text-3xl font-bold text-accent-gold">
                ₹{product.price}
              </div>
              <div className="w-px h-8 bg-accent-gold/30 mx-2"></div>
              <div className="flex items-center bg-surface px-4 py-2 rounded-full border border-accent-gold/20 shadow-sm backdrop-blur-sm">
                <StarRating rating={product.rating} />
                <span className="text-text-secondary text-sm ml-2 font-medium">({product.numReviews} reviews)</span>
              </div>
            </div>

            <div className="mb-6 animate-fade-in" style={{ animationDelay: '125ms', animationFillMode: 'both' }}>
              <form onSubmit={handlePincodeCheck} className="flex flex-col sm:flex-row gap-3 p-4 bg-surface rounded-xl border border-accent-gold/20 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-accent-gold"></div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Delivery Estimator
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      maxLength="6"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter Pincode"
                      className="w-full bg-bg-base border border-accent-gold/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-gold transition-colors text-text-primary"
                    />
                    <button type="submit" className="bg-accent-gold/10 text-accent-gold hover:bg-accent-gold hover:text-bg-base font-bold px-4 rounded-lg transition-colors text-sm whitespace-nowrap border border-accent-gold/20">
                      Check
                    </button>
                  </div>
                  {deliveryEstimate && (
                    <p className={`mt-2 text-xs font-medium ${deliveryEstimate.includes('Please') ? 'text-red-400' : 'text-green-500'}`}>
                      {deliveryEstimate}
                    </p>
                  )}
                </div>
              </form>
            </div>

            {/* Live Social Proof */}
            <div className="flex flex-wrap items-center gap-3 mb-6 animate-fade-in" style={{ animationDelay: '135ms', animationFillMode: 'both' }}>
              {viewersCount > 0 && (
                <div className="flex items-center gap-2 bg-red-500/10 text-red-500 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider border border-red-500/20 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  {viewersCount} viewing now
                </div>
              )}
              {purchasedCount > 0 && (
                <div className="flex items-center gap-1.5 bg-accent-gold/10 text-accent-gold px-3 py-1.5 rounded-full text-xs font-bold tracking-wider border border-accent-gold/20 shadow-sm">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  {purchasedCount} sold recently
                </div>
              )}
            </div>

            <div className="w-16 h-px bg-accent-gold mb-8 animate-fade-in" style={{ animationDelay: '150ms', animationFillMode: 'both' }}></div>

            <p className="text-text-primary/70 text-lg mb-10 leading-loose animate-fade-in font-light" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
              {product.description}
            </p>

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-10 animate-fade-in" style={{ animationDelay: '250ms', animationFillMode: 'both' }}>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">Select Option</label>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((v) => (
                    <button
                      key={v.name}
                      onClick={() => setSelectedVariant(v.name)}
                      className={`px-6 py-3 rounded-full border font-medium transition-all backdrop-blur-sm active:scale-95 ${selectedVariant === v.name
                          ? 'border-accent-gold bg-accent-gold/10 text-accent-gold shadow-md ring-1 ring-accent-gold/50'
                          : 'border-accent-gold/20 text-text-primary/70 hover:border-accent-gold/50 bg-surface/50 hover:bg-surface'
                        }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Personalization Field */}
            {product.isPersonalizable && (
              <div className="mb-8 bg-surface p-5 rounded-xl border border-accent-gold/20 shadow-sm">
                <label className="block text-sm font-bold text-text-primary uppercase tracking-wider mb-2">
                  {product.personalizationLabel || 'Add Personalization'}
                </label>
                <input
                  type="text"
                  maxLength={20}
                  value={personalization}
                  onChange={(e) => setPersonalization(e.target.value)}
                  placeholder="e.g. John & Jane"
                  className="w-full px-4 py-3 bg-bg-base border border-accent-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold text-text-primary transition-all"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-text-secondary">{20 - personalization.length} characters remaining</span>
                  {personalization && (
                    <span className="text-xs font-serif italic text-accent-gold">Preview: "{personalization}"</span>
                  )}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10 animate-fade-in" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
              <div className="flex items-center border border-accent-gold/30 rounded-xl bg-surface shadow-sm h-14 w-full sm:w-36">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-12 h-full flex items-center justify-center text-text-primary hover:text-accent-gold transition-colors font-bold active:scale-95"
                >-</button>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  min="1"
                  max={availableStock}
                  className="flex-1 w-full text-center bg-transparent font-bold text-text-primary focus:outline-none"
                />
                <button
                  onClick={() => setQty(Math.min(availableStock, qty + 1))}
                  className="w-12 h-full flex items-center justify-center text-text-primary hover:text-accent-gold transition-colors font-bold active:scale-95"
                >+</button>
              </div>

              <button
                ref={mainAddToCartRef}
                onClick={addToCartHandler}
                disabled={isOutOfStock}
                className={`flex-1 h-14 rounded-xl text-lg font-bold transition-all duration-300 shadow-md flex items-center justify-center gap-2 uppercase tracking-wider ${isOutOfStock
                    ? 'bg-transparent text-text-primary/50 border border-accent-gold/20 cursor-not-allowed'
                    : 'bg-accent-gold hover:bg-accent-gold-hover text-bg-base hover:shadow-lg active:scale-[0.98]'
                  }`}
              >
                {isOutOfStock ? 'Out of Stock' : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    Add to Cart
                  </>
                )}
              </button>
            </div>

            {/* Artisan Trust Signals */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-12 pt-8 border-t border-accent-gold/10 animate-fade-in" style={{ animationDelay: '350ms', animationFillMode: 'both' }}>
              <div className="flex flex-col items-center text-center gap-3">
                <svg className="w-7 h-7 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                <span className="text-[10px] sm:text-xs text-text-secondary uppercase tracking-widest font-bold">Secure<br />Checkout</span>
              </div>
              <div className="flex flex-col items-center text-center gap-3">
                <svg className="w-7 h-7 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                <span className="text-[10px] sm:text-xs text-text-secondary uppercase tracking-widest font-bold">7-Day Easy<br />Returns</span>
              </div>
              <div className="flex flex-col items-center text-center gap-3">
                <svg className="w-7 h-7 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                <span className="text-[10px] sm:text-xs text-text-secondary uppercase tracking-widest font-bold">Premium<br />Shipping</span>
              </div>
            </div>

            {/* Mobile Accordions */}
            <div className="md:hidden animate-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
              <Accordion title="Full Description" content={product.description} defaultOpen={true} />
              <Accordion title="The Story Behind This Piece" content={product.story || "Every piece is thoughtfully designed and handcrafted in our small studio. We believe in preserving traditional artisan techniques while designing for the modern home."} />
              <Accordion title="Materials & Care" content={product.materials || "Wipe clean with a soft, dry cloth. Avoid harsh chemicals and prolonged exposure to direct sunlight."} />
              <Accordion title="Shipping & Returns" content={product.shippingReturns || "Free shipping on orders over ₹10,000. Returns accepted within 14 days of delivery. Custom and personalized items are final sale."} />
              <Accordion title="Customer Reviews" defaultOpen={false}>
                {product.reviews.length === 0 ? (
                  <p>No reviews yet.</p>
                ) : (
                  <div className="space-y-4">
                    {product.reviews.map(review => (
                      <div key={review._id} className="border-b border-accent-gold/10 pb-4">
                        <div className="flex justify-between items-center mb-2">
                          <strong className="text-text-primary">{review.name}</strong>
                          <StarRating rating={review.rating} />
                        </div>
                        <p className="text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-accent-gold/10 animate-fade-in">
        <div className="flex gap-12 border-b border-accent-gold/20 mb-8">
          {['Description', 'The Story', 'Materials & Care', 'Shipping', 'Reviews'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-xl font-serif font-bold transition-all relative ${
                activeTab === tab ? 'text-accent-gold' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-accent-gold"></span>
              )}
            </button>
          ))}
        </div>
        
        <div className="min-h-[300px]">
          {activeTab === 'Description' && (
            <div className="text-lg leading-relaxed text-text-primary/80 max-w-4xl animate-fade-in">
              <p>{product.description}</p>
            </div>
          )}
          {activeTab === 'The Story' && (
            <div className="text-lg leading-relaxed text-text-primary/80 max-w-4xl animate-fade-in">
              <p>{product.story || "Every piece is thoughtfully designed and handcrafted in our small studio. We believe in preserving traditional artisan techniques while designing for the modern home."}</p>
            </div>
          )}
          {activeTab === 'Materials & Care' && (
            <div className="text-lg leading-relaxed text-text-primary/80 max-w-4xl animate-fade-in">
              <p>{product.materials || "Wipe clean with a soft, dry cloth. Avoid harsh chemicals and prolonged exposure to direct sunlight."}</p>
            </div>
          )}
          {activeTab === 'Shipping' && (
            <div className="text-lg leading-relaxed text-text-primary/80 max-w-4xl animate-fade-in">
              <p>{product.shippingReturns || "Free shipping on orders over ₹10,000. Returns accepted within 14 days of delivery. Custom and personalized items are final sale."}</p>
            </div>
          )}
          {activeTab === 'Reviews' && (
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 animate-fade-in">
              {/* Write a Review Form */}
              <div className="lg:w-1/3">
                <div className="bg-surface p-8 rounded-2xl border border-accent-gold/20 shadow-sm sticky top-24">
                  <h3 className="text-2xl font-serif font-bold mb-6">Write a Review</h3>
                  {userInfo ? (
                    <form onSubmit={submitReviewHandler} className="space-y-5">
                      <div>
                        <label className="block text-sm font-bold text-text-primary uppercase tracking-wider mb-2">Rating</label>
                        <select required value={rating} onChange={(e) => setRating(e.target.value)} className="w-full px-4 py-3 min-h-12 border border-accent-gold/20 rounded-xl bg-bg-base focus:ring-2 focus:ring-accent-gold outline-none text-text-primary transition-all">
                          <option value="">Select a rating...</option>
                          <option value="5">5 - Excellent</option>
                          <option value="4">4 - Very Good</option>
                          <option value="3">3 - Good</option>
                          <option value="2">2 - Fair</option>
                          <option value="1">1 - Poor</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-text-primary uppercase tracking-wider mb-2">Your Review</label>
                        <textarea required rows="4" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your thoughts about this piece..." className="w-full px-5 py-4 border border-accent-gold/20 rounded-xl bg-bg-base focus:ring-2 focus:ring-accent-gold outline-none text-text-primary transition-all resize-none"></textarea>
                      </div>
                      <button disabled={reviewLoading} type="submit" className="w-full bg-accent-gold hover:bg-accent-gold-hover text-bg-base font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 uppercase tracking-wider active:scale-[0.98]">
                        {reviewLoading ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  ) : (
                    <div className="text-text-primary/70 bg-bg-base p-6 rounded-xl border border-accent-gold/10 text-center">
                      Please <Link to={`/login?redirect=/product/${id}`} className="font-bold text-accent-gold hover:underline">sign in</Link> to write a review.
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews List */}
              <div className="lg:w-2/3">
                {product.reviews.length === 0 ? (
                  <div className="bg-surface p-12 rounded-2xl border border-accent-gold/10 text-center flex flex-col items-center">
                    <svg className="w-16 h-16 text-accent-gold/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                    <h4 className="text-xl font-serif font-bold text-text-primary mb-2">No reviews yet</h4>
                    <p className="text-text-secondary">Be the first to review this product!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {product.reviews.map((review) => (
                      <div key={review._id} className="bg-surface p-8 rounded-2xl shadow-sm border border-accent-gold/10 relative">
                        {/* Verified Badge */}
                        <div className="absolute top-8 right-8 flex items-center text-green-500 text-sm font-bold gap-1 bg-green-500/10 px-3 py-1 rounded-full">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          Verified
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold font-bold font-serif text-xl border border-accent-gold/30">
                            {review.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong className="text-lg font-bold text-text-primary block">{review.name}</strong>
                            <div className="text-sm text-text-secondary">
                              {review.createdAt ? review.createdAt.substring(0, 10) : 'Just now'}
                            </div>
                          </div>
                        </div>
                        <div className="mb-4">
                          <StarRating rating={review.rating} />
                        </div>
                        <p className="text-text-primary/80 leading-relaxed text-lg">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Carousel */}
      <RelatedProductsCarousel productId={product._id} />

      </div> {/* Closes animate-fade-in div */}

      {/* Sticky Add-to-Cart Bar (Mobile & Desktop) */}
      <div
        className={`fixed bottom-[64px] md:bottom-0 left-0 right-0 p-3 sm:p-4 bg-surface/95 backdrop-blur-xl border-t border-accent-gold/20 shadow-[0_-10px_30px_rgba(0,0,0,0.15)] transition-transform duration-300 z-40 ${showStickyBar && !isOutOfStock ? 'translate-y-0' : 'translate-y-full'
          }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-8 px-0 md:px-8">
          {/* Mobile Trust Strip & Estimator */}
          <div className="flex justify-between items-center text-[10px] sm:text-xs text-text-secondary font-bold uppercase tracking-wider md:hidden">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Secure
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              7-Day Return
            </span>
            <span className="flex items-center gap-1 text-green-500">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="flex gap-4 items-center w-full justify-between">
            {/* Desktop Info */}
            <div className="hidden md:flex items-center gap-4 flex-1">
               <img src={product.image || "/images/placeholder.jpg"} alt={product.name} className="w-14 h-14 object-cover rounded-lg border border-accent-gold/20 shadow-sm" />
               <div className="flex flex-col">
                  <h4 className="font-bold font-serif text-text-primary text-lg truncate max-w-md">{product.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-text-secondary mt-1">
                     <span className="flex items-center text-accent-gold"><StarRating rating={product.rating} /></span>
                     <span>({product.numReviews} Reviews)</span>
                  </div>
               </div>
            </div>

            {/* Mobile Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center md:hidden">
              <h4 className="font-bold font-serif text-text-primary text-sm sm:text-base truncate leading-tight">{product.name}</h4>
              <span className="text-accent-gold font-bold text-sm">₹{product.price}</span>
            </div>
            
            {/* Action Area */}
            <div className="flex items-center gap-4 md:gap-8 justify-end w-full md:w-auto flex-1 md:flex-none">
              <span className="hidden md:block text-accent-gold font-bold text-2xl">₹{product.price}</span>
              <button
                onClick={addToCartHandler}
                disabled={isOutOfStock}
                className="flex-1 md:flex-none bg-accent-gold hover:bg-accent-gold-hover text-bg-base font-bold py-3 sm:py-4 px-4 sm:px-8 rounded-xl shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider active:scale-[0.98] transition-all"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductScreen;

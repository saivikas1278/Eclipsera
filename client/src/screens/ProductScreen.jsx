import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../context/StoreContext';
import RelatedProductsCarousel from '../components/RelatedProductsCarousel';
import SkeletonProduct from '../components/SkeletonProduct';
import OptimizedImage from '../components/OptimizedImage';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';

const Accordion = ({ title, content, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  if (!content) return null;
  
  return (
    <div className="border-b border-accent-gold/20 py-4">
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
        className={`mt-4 text-text-primary/80 leading-relaxed overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <p>{content}</p>
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
  
  // Reviews state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Mobile sticky bar
  const [showStickyBar, setShowStickyBar] = useState(false);
  const mainAddToCartRef = useRef(null);

  useEffect(() => {
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
    <div className="animate-fade-in pb-20 md:pb-12">
      <SEO 
        title={`${product.name} | Eclipsera`} 
        description={product.description} 
        image={product.image}
        structuredData={structuredData} 
      />
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        
        {/* Breadcrumb / Back */}
        <Link to="/" className="inline-flex items-center gap-2 mb-4 md:mb-8 text-text-primary/70 hover:text-accent-gold font-medium transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Shop
        </Link>
        
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* Left Side: Image Gallery */}
          <div className="lg:w-1/2">
            <div className="sticky top-24">
              <div className="bg-surface rounded-2xl shadow-sm border border-accent-gold/20 overflow-hidden relative group aspect-square">
                <OptimizedImage 
                  src={mainImage} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110 cursor-zoom-in"
                  loading="eager"
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
                      className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all snap-center ${mainImage === img ? 'border-accent-gold shadow-md scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
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
          </div>

          {/* Right Side: Product Actions */}
          <div className="lg:w-1/2 flex flex-col justify-start pt-2">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-extrabold text-text-primary tracking-tight leading-tight pr-4">
                {product.name}
              </h1>
              <button 
                onClick={() => addToWishlist(product)}
                className="p-3 text-text-secondary hover:text-red-500 hover:bg-surface rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent-gold shadow-sm border border-accent-gold/10"
                aria-label="Add to Wishlist"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="text-3xl font-bold text-accent-gold">
                ₹{product.price}
              </div>
              <div className="flex items-center bg-surface px-3 py-1 rounded-full border border-accent-gold/20">
                <span className="text-accent-gold mr-1">{'★'.repeat(Math.round(product.rating))}</span>
                <span className="text-text-secondary text-sm">({product.numReviews} reviews)</span>
              </div>
            </div>
            
            <p className="text-text-primary/80 text-lg mb-8 leading-relaxed">
              {product.description}
            </p>

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-bold text-text-primary uppercase tracking-wider mb-3">Option / Variant</label>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((v) => (
                    <button
                      key={v.name}
                      onClick={() => setSelectedVariant(v.name)}
                      className={`px-5 py-2.5 rounded-lg border-2 font-medium transition-all ${
                        selectedVariant === v.name 
                          ? 'border-accent-gold bg-accent-gold/10 text-accent-gold shadow-sm' 
                          : 'border-accent-gold/20 text-text-primary/70 hover:border-accent-gold/50 bg-surface'
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
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <div className="flex items-center border border-accent-gold/30 rounded-xl bg-surface shadow-sm h-14 w-full sm:w-36">
                <button 
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-12 h-full flex items-center justify-center text-text-primary hover:text-accent-gold transition-colors font-bold"
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
                  className="w-12 h-full flex items-center justify-center text-text-primary hover:text-accent-gold transition-colors font-bold"
                >+</button>
              </div>
              
              <button
                ref={mainAddToCartRef}
                onClick={addToCartHandler}
                disabled={isOutOfStock}
                className={`flex-1 h-14 rounded-xl text-lg font-bold transition-all duration-300 shadow-md flex items-center justify-center gap-2 uppercase tracking-wider ${
                  isOutOfStock
                    ? 'bg-transparent text-text-primary/50 border border-accent-gold/20 cursor-not-allowed'
                    : 'bg-accent-gold hover:bg-accent-gold-hover text-bg-base hover:shadow-lg'
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
            
            {/* Accordions */}
            <div className="mt-4 border-t border-accent-gold/20 pt-4">
              <Accordion title="Full Description" content={product.description} defaultOpen={true} />
              <Accordion title="The Story Behind This Piece" content={product.story || "Every piece is thoughtfully designed and handcrafted in our small studio. We believe in preserving traditional artisan techniques while designing for the modern home."} />
              <Accordion title="Materials & Care" content={product.materials || "Wipe clean with a soft, dry cloth. Avoid harsh chemicals and prolonged exposure to direct sunlight."} />
              <Accordion title="Shipping & Returns" content={product.shippingReturns || "Free shipping on orders over ₹10,000. Returns accepted within 14 days of delivery. Custom and personalized items are final sale."} />
            </div>

          </div>
        </div>
      </div>
      
      {/* Related Products Carousel */}
      <RelatedProductsCarousel productId={product._id} />

      {/* REVIEWS SECTION */}
      <div className="max-w-7xl mx-auto px-4 mt-16 pt-16 border-t border-accent-gold/10">
        <h2 className="text-4xl font-serif font-extrabold text-text-primary text-center mb-12">Customer Reviews</h2>
        
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* Write a Review Form */}
          <div className="lg:w-1/3">
            <div className="bg-surface p-8 rounded-2xl border border-accent-gold/20 shadow-sm sticky top-24">
              <h3 className="text-2xl font-serif font-bold mb-6">Write a Review</h3>
              


              {userInfo ? (
                <form onSubmit={submitReviewHandler} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-text-primary uppercase tracking-wider mb-2">Rating</label>
                    <select
                      required
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      className="w-full px-4 py-3 border border-accent-gold/20 rounded-xl bg-bg-base focus:ring-2 focus:ring-accent-gold outline-none text-text-primary transition-all"
                    >
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
                    <textarea
                      required
                      rows="4"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your thoughts about this piece..."
                      className="w-full px-5 py-4 border border-accent-gold/20 rounded-xl bg-bg-base focus:ring-2 focus:ring-accent-gold outline-none text-text-primary transition-all resize-none"
                    ></textarea>
                  </div>
                  <button
                    disabled={reviewLoading}
                    type="submit"
                    className="w-full bg-accent-gold hover:bg-accent-gold-hover text-bg-base font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 uppercase tracking-wider"
                  >
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
                      <span className="text-accent-gold text-lg tracking-widest">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </span>
                    </div>
                    <p className="text-text-primary/80 leading-relaxed text-lg">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Sticky Mobile Add-to-Cart Bar */}
      <div 
        className={`fixed bottom-0 left-0 right-0 p-4 bg-surface/90 backdrop-blur-md border-t border-accent-gold/20 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] transition-transform duration-300 md:hidden z-40 ${
          showStickyBar && !isOutOfStock ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex gap-4 items-center max-w-lg mx-auto">
          <div className="hidden sm:block flex-1 truncate">
            <h4 className="font-bold font-serif text-text-primary truncate">{product.name}</h4>
            <span className="text-accent-gold font-bold">₹{product.price}</span>
          </div>
          <button
            onClick={addToCartHandler}
            disabled={isOutOfStock}
            className="flex-1 bg-accent-gold text-bg-base font-bold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            Add to Cart
          </button>
        </div>
      </div>
      
    </div>
  );
};

export default ProductScreen;

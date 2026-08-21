import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import HeroSlider from '../components/HeroSlider';
import ProductCarousel from '../components/ProductCarousel';
import NewArrivals from '../components/NewArrivals';
import SocialProofStrip from '../components/SocialProofStrip';
import NewsletterSignup from '../components/NewsletterSignup';
import TrustBadges from '../components/TrustBadges';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import SEO from '../components/SEO';

const HomeScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  
  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const inStock = searchParams.get('inStock') === 'true';

  const isShopView = keyword || category || minPrice || maxPrice || searchParams.has('inStock');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const url = `/api/products?${searchParams.toString()}`;
        const { data } = await axios.get(url);
        setProducts(data.data ? data.data : data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Something went wrong fetching products.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [location.search]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    navigate(`/?${params.toString()}`);
  };

  const clearFilters = () => {
    navigate('/');
  };

  if (isShopView) {
    return (
      <div className="py-8 md:py-16 animate-fade-in min-h-screen px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        <SEO title={`Shop ${category || keyword || 'Collection'} | Eclipsera`} description="Browse our luxury handcrafts." />
        
        {/* Mobile Filter Button */}
        <button 
          onClick={() => setShowMobileFilters(true)}
          className="md:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-accent-gold text-bg-base px-6 py-3 rounded-full font-bold shadow-[0_4px_20px_rgba(212,175,55,0.4)] flex items-center gap-2 transition-transform active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          Filters
        </button>

        {/* Mobile Filter Backdrop */}
        {showMobileFilters && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
            onClick={() => setShowMobileFilters(false)}
          ></div>
        )}

        {/* Sidebar / Mobile Drawer */}
        <div className={`fixed inset-y-0 left-0 z-50 w-4/5 max-w-sm bg-surface p-6 overflow-y-auto transition-transform duration-300 md:static md:translate-x-0 md:w-1/4 md:max-w-none lg:w-1/5 rounded-r-3xl md:rounded-2xl border-r md:border border-accent-gold/20 md:h-fit md:sticky md:top-24 shadow-2xl md:shadow-none ${showMobileFilters ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex justify-between items-center mb-6 border-b border-accent-gold/20 pb-4">
            <h2 className="text-xl font-serif font-bold text-text-primary">Filters</h2>
            <button onClick={() => setShowMobileFilters(false)} className="md:hidden text-text-primary/70 hover:text-accent-gold p-2 bg-zinc-800 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          {/* Keyword active indicator */}
          {keyword && (
            <div className="mb-6 bg-accent-gold/10 p-3 rounded-xl border border-accent-gold/20 flex justify-between items-center">
              <span className="text-sm font-semibold text-accent-gold">"{keyword}"</span>
              <button onClick={() => updateFilter('keyword', '')} className="text-accent-gold hover:text-white">✕</button>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3 text-text-primary">Category</h3>
            {['All', 'General', 'Jewelry', 'Apparel', 'Accessories'].map(c => (
              <label key={c} className="flex items-center gap-3 mb-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={category === c || (c === 'All' && !category)}
                  onChange={() => updateFilter('category', c === 'All' ? '' : c)}
                  className="w-4 h-4 rounded text-accent-gold focus:ring-accent-gold bg-transparent border-accent-gold/50 cursor-pointer"
                />
                <span className="text-text-primary/80 group-hover:text-accent-gold transition-colors">{c}</span>
              </label>
            ))}
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3 text-text-primary">Availability</h3>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={inStock}
                onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : '')}
                className="w-4 h-4 rounded text-accent-gold focus:ring-accent-gold bg-transparent border-accent-gold/50 cursor-pointer"
              />
              <span className="text-text-primary/80 group-hover:text-accent-gold transition-colors">In Stock Only</span>
            </label>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-semibold mb-3 text-text-primary">Price Range</h3>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                placeholder="Min ₹" 
                value={minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
                className="w-1/2 bg-bg-base border border-accent-gold/20 rounded-lg px-3 py-3 min-h-12 outline-none focus:border-accent-gold text-sm text-text-primary"
              />
              <span className="text-text-primary/50">-</span>
              <input 
                type="number" 
                placeholder="Max ₹" 
                value={maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                className="w-1/2 bg-bg-base border border-accent-gold/20 rounded-lg px-3 py-3 min-h-12 outline-none focus:border-accent-gold text-sm text-text-primary"
              />
            </div>
          </div>
          
          <button 
            onClick={() => { clearFilters(); setShowMobileFilters(false); }} 
            className="w-full text-center text-sm font-bold text-bg-base bg-accent-gold hover:bg-accent-gold-hover rounded-xl py-3 min-h-12 transition-colors shadow-sm"
          >
            Clear Filters
          </button>
        </div>

        {/* Product Grid */}
        <div className="w-full md:w-3/4 lg:w-4/5">
          <div className="flex justify-between items-end mb-8 border-b border-accent-gold/20 pb-4">
            <h1 className="text-3xl md:text-4xl font-serif text-text-primary tracking-tight">
              Shop Collection
            </h1>
            <span className="text-text-primary/50 text-sm">{products.length} Results</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
               <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center border border-accent-gold/20 mb-6 text-accent-gold/50">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-serif font-bold text-text-primary mb-4">No matches found.</h2>
              <p className="text-text-secondary text-sm mb-6">Try adjusting your filters or search terms.</p>
              <button onClick={clearFilters} className="text-accent-gold hover:underline">Clear all filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Otherwise, we display the full rich homepage experience
  return (
    <div className="bg-background min-h-screen">
      <SEO title="Shop Luxury Handcrafts | Eclipsera" description="Discover exclusive, handcrafted luxury goods at Eclipsera." />
      
      {/* HERO SECTION - Edge to Edge */}
      <HeroSlider />
      
      {/* Strict Unified Master Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-12 md:gap-20 pb-20 md:pb-32">
        <ProductCarousel />
        
        {!loading && !error && products.length > 0 && (
          <NewArrivals products={products} />
        )}
        
        <TrustBadges />
        <SocialProofStrip />
        <NewsletterSignup />
      </div>
    </div>
  );
};

export default HomeScreen;

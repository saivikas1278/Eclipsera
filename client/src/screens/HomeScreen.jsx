import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import HeroSlider from '../components/HeroSlider';
import CategoryTiles from '../components/CategoryTiles';
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
      <div className="py-4 md:py-12 animate-fade-in min-h-screen px-3 md:px-0 flex flex-col md:flex-row gap-8">
        <SEO title={`Shop ${category || keyword || 'Collection'} | Eclipsera`} description="Browse our luxury handcrafts." />
        
        {/* Sidebar */}
        <div className="w-full md:w-1/4 lg:w-1/5 bg-surface p-6 rounded-2xl border border-accent-gold/20 h-fit md:sticky top-24">
          <h2 className="text-xl font-serif font-bold mb-6 border-b border-accent-gold/20 pb-4 text-text-primary">Filters</h2>
          
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
                className="w-1/2 bg-bg-base border border-accent-gold/20 rounded-lg px-3 py-2 outline-none focus:border-accent-gold text-sm text-text-primary"
              />
              <span className="text-text-primary/50">-</span>
              <input 
                type="number" 
                placeholder="Max ₹" 
                value={maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                className="w-1/2 bg-bg-base border border-accent-gold/20 rounded-lg px-3 py-2 outline-none focus:border-accent-gold text-sm text-text-primary"
              />
            </div>
          </div>
          
          <button 
            onClick={clearFilters} 
            className="w-full text-center text-sm font-bold text-bg-base bg-accent-gold hover:bg-accent-gold-hover rounded-xl py-3 transition-colors shadow-sm"
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
        <CategoryTiles />
      </div>
    </div>
  );
};

export default HomeScreen;

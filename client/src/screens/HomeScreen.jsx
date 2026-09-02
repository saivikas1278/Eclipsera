import { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../context/StoreContext';
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
  const { userInfo } = useContext(StoreContext);
  const [products, setProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

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

  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    setRecentlyViewed(recent);
  }, []);

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

  const filterContent = (
    <>
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
              className="w-5 h-5 md:w-4 md:h-4 rounded text-accent-gold focus:ring-accent-gold bg-transparent border-accent-gold/50 cursor-pointer"
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
            className="w-5 h-5 md:w-4 md:h-4 rounded text-accent-gold focus:ring-accent-gold bg-transparent border-accent-gold/50 cursor-pointer"
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
            className="w-1/2 bg-bg-base border border-accent-gold/20 rounded-lg px-3 py-3 min-h-[48px] outline-none focus:border-accent-gold text-sm text-text-primary"
          />
          <span className="text-text-primary/50">-</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={maxPrice}
            onChange={(e) => updateFilter('maxPrice', e.target.value)}
            className="w-1/2 bg-bg-base border border-accent-gold/20 rounded-lg px-3 py-3 min-h-[48px] outline-none focus:border-accent-gold text-sm text-text-primary"
          />
        </div>
      </div>

      <button
        onClick={() => { clearFilters(); setIsMobileFilterOpen(false); }}
        className="w-full text-center text-sm font-bold text-bg-base bg-accent-gold hover:bg-accent-gold-hover rounded-xl py-3 min-h-[48px] transition-colors shadow-sm"
      >
        Clear Filters
      </button>
    </>
  );

  if (isShopView) {
    return (
      <div className="py-8 md:py-16 animate-fade-in min-h-screen px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        <SEO title={`Shop ${category || keyword || 'Collection'} | Eclipsera`} description="Browse our luxury handcrafts." />

        {/* Sidebar (Desktop Only) */}
        <div className="hidden md:block w-full md:w-1/4 lg:w-1/5 bg-surface p-6 rounded-2xl border border-accent-gold/20 h-fit sticky top-24">
          {filterContent}
        </div>

        {/* Mobile Filters Bottom Sheet */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center md:hidden animate-fade-in bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)}>
            <div className="bg-surface w-full max-h-[85vh] rounded-t-3xl sm:rounded-3xl p-6 overflow-y-auto transform transition-transform translate-y-0" onClick={e => e.stopPropagation()}>
              <div className="w-12 h-1.5 bg-accent-gold/20 rounded-full mx-auto mb-6"></div>
              {filterContent}
              <button onClick={() => setIsMobileFilterOpen(false)} className="w-full mt-4 text-center text-sm font-bold text-accent-gold border border-accent-gold/40 hover:bg-accent-gold/10 rounded-xl py-3 min-h-[48px] transition-colors">
                Apply & Close
              </button>
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="w-full md:w-3/4 lg:w-4/5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-accent-gold/20 pb-4 gap-4">
            <h1 className="text-3xl md:text-4xl font-serif text-text-primary tracking-tight">
              Shop Collection
            </h1>
            <div className="flex items-center justify-between w-full md:w-auto">
              <span className="text-text-primary/50 text-sm md:mr-4">{products.length} Results</span>
              {/* Mobile Filter Toggle */}
              <button 
                onClick={() => setIsMobileFilterOpen(true)}
                className="md:hidden flex items-center gap-2 text-accent-gold bg-accent-gold/10 px-4 py-2 rounded-lg font-bold text-sm min-h-[48px]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                Filters
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
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
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-8 md:gap-16 pb-20 md:pb-32 mt-6">
        
        {/* Personalized Greeting */}
        {userInfo && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-serif text-text-primary">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, <span className="font-bold text-accent-gold">{userInfo.name?.split(' ')[0] || 'Guest'}</span>
            </h1>
            <p className="text-sm text-text-secondary mt-1">Discover your next luxury.</p>
          </div>
        )}
        
        {/* Quick Categories (Swiggy Style Snap Scroll) */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-bold text-text-primary tracking-tight">Explore Categories</h2>
          </div>
          <div className="flex overflow-x-auto gap-5 pb-4 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {[
              { name: 'Rings', image: 'https://images.unsplash.com/photo-1605100804763-247f67b2548e?w=200&h=200&fit=crop', link: '/?category=Rings' },
              { name: 'Necklaces', image: 'https://images.unsplash.com/photo-1599643478524-fb66f7ca065b?w=200&h=200&fit=crop', link: '/?category=Necklaces' },
              { name: 'Earrings', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200&h=200&fit=crop', link: '/?category=Earrings' },
              { name: 'Bracelets', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=200&h=200&fit=crop', link: '/?category=Bracelets' },
              { name: 'Watches', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=200&h=200&fit=crop', link: '/?category=Watches' },
              { name: 'Sets', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop', link: '/?category=Sets' },
            ].map((cat, idx) => (
              <Link key={idx} to={cat.link} className="flex flex-col items-center gap-3 min-w-[80px] md:min-w-[100px] snap-center group">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-surface shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-accent-gold transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-[0_8px_25px_rgba(212,175,55,0.2)]">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-xs md:text-sm font-bold text-text-secondary group-hover:text-accent-gold transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>

        <ProductCarousel />

        {loading ? (
          <section className="mb-24">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-serif text-text-primary tracking-tight">New Arrivals</h2>
                <div className="w-16 h-1 bg-accent-gold mt-2 opacity-80"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </section>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : products.length > 0 ? (
          <NewArrivals products={products} />
        ) : null}

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div className="border-t border-accent-gold/10 pt-10 animate-fade-in">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-serif font-bold text-text-primary">Recently Viewed</h2>
            </div>
            <div className="flex overflow-x-auto gap-4 px-1 pb-6 snap-x snap-mandatory hide-scrollbar">
              {recentlyViewed.map((product) => (
                <div key={`recent-${product._id}`} className="w-[160px] md:w-[220px] flex-shrink-0 snap-start">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}

        <TrustBadges />
        <SocialProofStrip />
        <NewsletterSignup />
      </div>
    </div>
  );
};

export default HomeScreen;

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  const searchParams = new URLSearchParams(location.search);
  const keyword = searchParams.get('keyword') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const url = keyword ? `/api/products?keyword=${keyword}` : '/api/products';
        const { data } = await axios.get(url);
        setProducts(data.data ? data.data : data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Something went wrong fetching products.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword]);

  // If a user is searching, we just display the search results grid
  if (keyword) {
    return (
      <div className="py-4 md:py-12 animate-fade-in min-h-screen px-3 md:px-0">
        <h1 className="text-3xl md:text-4xl font-serif text-accent-gold mb-8 md:mb-12 tracking-tight text-center">
          Search Results for "{keyword}"
        </h1>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 md:py-16 text-center animate-fade-in">
            <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center border border-accent-gold/20 shadow-inner mb-6 text-accent-gold/50">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-serif font-bold text-text-primary mb-4">No matches found.</h2>
            <p className="text-text-secondary text-lg mb-8 max-w-md">
              We couldn't find any pieces matching your current filters.
            </p>
            <Link to="/" className="bg-surface hover:bg-bg-base border border-accent-gold/30 text-text-primary font-bold py-3 px-8 rounded-xl transition-all shadow-sm hover:shadow-md inline-flex items-center gap-2 mb-16">
              Clear All Filters
            </Link>
            
            <div className="w-full text-left mt-8 border-t border-accent-gold/10 pt-16">
              <ProductCarousel />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Otherwise, we display the full rich homepage experience
  return (
    <div className="bg-background min-h-screen">
      <SEO title="Shop Luxury Handcrafts | Eclipsera" description="Discover exclusive, handcrafted luxury goods at Eclipsera." />
      {/* HERO SECTION */}
      <HeroSlider />
      
      <CategoryTiles />
      
      <ProductCarousel />
      
      {!loading && !error && products.length > 0 && (
        <NewArrivals products={products} />
      )}
      
      <TrustBadges />
      
      <SocialProofStrip />
      
      <NewsletterSignup />
    </div>
  );
};

export default HomeScreen;

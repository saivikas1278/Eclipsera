import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';

const ProductCarousel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/products/top');
        setProducts(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Something went wrong fetching top products.');
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32 text-xl font-medium text-text-secondary animate-pulse">
        Loading bestsellers...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 text-red-400 p-4 rounded-lg text-center my-8">
        {error}
      </div>
    );
  }

  return (
    <section className="mb-24 px-3 md:px-0 relative group">
      <div className="flex justify-between items-end mb-8 md:mb-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">Trending Now</h2>
          <div className="w-16 h-1 bg-accent-gold opacity-80"></div>
        </div>
      </div>
      
      <button 
        onClick={() => scroll('left')} 
        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-20 bg-surface border border-accent-gold/20 text-text-primary p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:block hover:bg-accent-gold hover:text-bg-base"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>

      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-3 md:gap-5 pb-4 snap-x snap-mandatory hide-scrollbar"
      >
        {products.map((product) => (
          <div key={product._id} className="w-[175px] sm:w-[200px] md:w-[220px] lg:w-[260px] flex-shrink-0 snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <button 
        onClick={() => scroll('right')} 
        className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-20 bg-surface border border-accent-gold/20 text-text-primary p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:block hover:bg-accent-gold hover:text-bg-base"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </button>
    </section>
  );
};

export default ProductCarousel;

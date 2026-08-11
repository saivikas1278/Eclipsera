import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';

const ProductCarousel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <section className="mb-20">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-serif font-bold text-text-primary">Featured Bestsellers</h2>
          <div className="w-24 h-1 bg-accent-gold mt-4 opacity-50"></div>
        </div>
      </div>
      
      <div className="flex overflow-x-auto gap-4 pb-6 snap-x hide-scrollbar px-1 -mx-1">
        {products.map((product) => (
          <div key={product._id} className="w-[180px] sm:w-[220px] md:w-[280px] lg:w-[300px] flex-shrink-0 snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductCarousel;

import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';

const RelatedProductsCarousel = ({ productId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/products/${productId}/related`);
        setProducts(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchRelatedProducts();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="animate-pulse text-accent-gold font-serif">Loading related products...</div>
      </div>
    );
  }

  if (error || products.length === 0) {
    return null; // Don't show anything if no related products or error
  }

  return (
    <div className="py-12 mt-12 border-t border-accent-gold/10 overflow-hidden">
      <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-6 px-4 max-w-7xl mx-auto">You May Also Like</h2>
      
      <div className="flex overflow-x-auto gap-4 px-4 pb-6 snap-x snap-mandatory hide-scrollbar max-w-7xl mx-auto">
        {products.map((product) => (
          <div key={product._id} className="w-[160px] md:w-[220px] flex-shrink-0 snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProductsCarousel;

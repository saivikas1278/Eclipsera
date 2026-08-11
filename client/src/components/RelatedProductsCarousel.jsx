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
    <div className="py-16 mt-16 border-t border-accent-gold/10">
      <h2 className="text-3xl font-serif font-extrabold text-text-primary text-center mb-10">You May Also Like</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto px-4">
        {products.map((product) => (
          <div key={product._id} className="w-full">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProductsCarousel;

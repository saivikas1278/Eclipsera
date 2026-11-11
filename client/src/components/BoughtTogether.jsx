import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../context/StoreContext';
import toast from 'react-hot-toast';

const BoughtTogether = ({ productId, currentPrice = 0 }) => {
  const [bundleProducts, setBundleProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, setIsCartDrawerOpen } = useContext(StoreContext);

  useEffect(() => {
    const fetchBundle = async () => {
      try {
        const { data } = await axios.get(`/api/products/${productId}/bought-together`);
        setBundleProducts(data || []);
      } catch (err) {
        console.error('Failed to fetch complementary items:', err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchBundle();
  }, [productId]);

  if (loading || bundleProducts.length === 0) return null;

  const bundleTotal = currentPrice + bundleProducts.reduce((acc, p) => acc + (Number(p.price) || 0), 0);

  const addBundleToCart = () => {
    bundleProducts.forEach((item) => {
      addToCart(item, 1, '', '');
    });
    toast.success('Bundle added to cart!', { icon: '✨' });
    setIsCartDrawerOpen(true);
  };

  return (
    <div className="bg-surface/60 rounded-2xl p-6 border border-accent-gold/20 my-8 shadow-sm animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-accent-gold font-bold text-xs uppercase tracking-wider flex items-center gap-1">
          <svg className="w-4 h-4 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Frequently Bought Together
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 w-full md:w-auto">
          {bundleProducts.map((p, idx) => (
            <div key={p._id} className="flex items-center gap-3 flex-shrink-0">
              <Link to={`/product/${p._id}`} className="group flex flex-col items-center">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-accent-gold/20 group-hover:scale-105 transition-transform"
                />
                <span className="text-xs font-bold text-text-primary mt-1 truncate max-w-[90px]">{p.name}</span>
                <span className="text-xs font-bold text-accent-gold">₹{p.price}</span>
              </Link>
              {idx < bundleProducts.length - 1 && (
                <span className="text-accent-gold/40 text-lg font-bold">+</span>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-accent-gold/10">
          <div className="text-right">
            <span className="text-[10px] text-text-secondary uppercase tracking-widest block">Combined Total</span>
            <span className="text-xl font-bold text-accent-gold">₹{bundleTotal.toFixed(2)}</span>
          </div>
          <button
            onClick={addBundleToCart}
            className="w-full sm:w-auto bg-accent-gold/10 hover:bg-accent-gold hover:text-bg-base text-accent-gold font-bold px-6 py-3 rounded-xl transition-all border border-accent-gold/30 text-sm active:scale-95 whitespace-nowrap"
          >
            Add Both to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoughtTogether;

import { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';

const PersonalizedRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const viewedIds = recent.map((item) => item._id).filter(Boolean).join(',');

        const { data } = await axios.get(`/api/products/recommendations?viewed=${viewedIds}`);
        setRecommendations(data || []);
      } catch (err) {
        console.error('Failed to load personalized recommendations:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading || recommendations.length === 0) return null;

  return (
    <section className="animate-fade-in my-8">
      <div className="flex items-center justify-between mb-6 border-b border-accent-gold/20 pb-4">
        <div>
          <span className="text-[10px] sm:text-xs font-bold text-accent-gold uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-accent-gold animate-pulse"></span>
            AI Personalized Picks
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-text-primary">
            Curated Just For You
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {recommendations.slice(0, 4).map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default PersonalizedRecommendations;

import { Link } from 'react-router-dom';
import OptimizedImage from './OptimizedImage';

const categories = [
  { name: 'Home', image: '/images/category_home.png', path: '/search?category=Home' },
  { name: 'Candles', image: '/images/category_candles.png', path: '/search?category=Candles' },
  { name: 'Jewelry', image: '/images/category_jewelry.png', path: '/search?category=Jewelry' },
  { name: 'Art', image: '/images/category_art.png', path: '/search?category=Art' },
  { name: 'Gifts', image: '/images/category_gifts.png', path: '/search?category=Gifts' },
  { name: 'Sale', image: '/images/category_sale.png', path: '/search?category=Sale' },
];

const StoryBubbles = () => {
  return (
    <div className="w-full overflow-x-auto hide-scrollbar py-8 mb-4">
      <div className="flex gap-4 px-4 md:justify-center md:gap-8 min-w-max">
        {categories.map((cat, idx) => (
          <Link key={idx} to={cat.path} className="flex flex-col items-center gap-3 group">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full p-1 border-2 border-accent-gold/30 group-hover:border-accent-gold transition-all duration-300 relative bg-surface shadow-sm">
              <div className="w-full h-full rounded-full overflow-hidden bg-bg-base">
                {/* Fallback styling if image not found, since we don't have these exact image paths guaranteed */}
                <div className="w-full h-full bg-accent-gold/10 flex items-center justify-center text-accent-gold font-serif font-bold text-xl group-hover:scale-110 transition-transform duration-700">
                  {cat.name[0]}
                </div>
              </div>
            </div>
            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-text-primary group-hover:text-accent-gold transition-colors">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};
export default StoryBubbles;

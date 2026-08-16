import { Link } from 'react-router-dom';

const MegaMenu = ({ isOpen, onClose }) => {
  return (
    <div 
      className={`absolute top-full left-0 w-full bg-surface border-t border-accent-gold/20 shadow-2xl z-40 transition-all duration-300 transform origin-top ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
      onMouseLeave={onClose}
    >
      <div className="container mx-auto max-w-7xl px-4 py-8 flex">
        {/* Left Side: Category Links */}
        <div className="w-1/3 border-r border-accent-gold/10 pr-8">
          <h3 className="text-sm font-bold text-accent-gold tracking-widest uppercase mb-6">Categories</h3>
          <ul className="space-y-4">
            <li>
              <Link to="/search?category=HomeDecor" className="text-text-primary hover:text-accent-gold text-lg transition-colors font-serif">Home Decor</Link>
            </li>
            <li>
              <Link to="/search?category=Jewelry" className="text-text-primary hover:text-accent-gold text-lg transition-colors font-serif">Fine Jewelry</Link>
            </li>
            <li>
              <Link to="/search?category=Candles" className="text-text-primary hover:text-accent-gold text-lg transition-colors font-serif">Artisanal Candles</Link>
            </li>
            <li>
              <Link to="/search?category=Personalized" className="text-text-primary hover:text-accent-gold text-lg transition-colors font-serif">Personalized Gifts</Link>
            </li>
          </ul>
        </div>
        
        {/* Right Side: Featured Visuals */}
        <div className="w-2/3 pl-8">
          <h3 className="text-sm font-bold text-accent-gold tracking-widest uppercase mb-6">Featured Collections</h3>
          <div className="grid grid-cols-3 gap-6">
            
            <Link to="/search?category=HomeDecor" className="group block">
              <div className="aspect-[4/5] rounded-lg overflow-hidden bg-bg-base mb-3 border border-accent-gold/10">
                <img src="/images/category_home.png" alt="Home Decor" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <p className="text-center font-serif text-text-primary group-hover:text-accent-gold transition-colors">Home Decor</p>
            </Link>
            
            <Link to="/search?category=Jewelry" className="group block">
              <div className="aspect-[4/5] rounded-lg overflow-hidden bg-bg-base mb-3 border border-accent-gold/10">
                <img src="/images/category_jewelry.png" alt="Jewelry" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <p className="text-center font-serif text-text-primary group-hover:text-accent-gold transition-colors">Fine Jewelry</p>
            </Link>

            <Link to="/search?category=Candles" className="group block">
              <div className="aspect-[4/5] rounded-lg overflow-hidden bg-bg-base mb-3 border border-accent-gold/10">
                <img src="/images/category_candles.png" alt="Candles" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <p className="text-center font-serif text-text-primary group-hover:text-accent-gold transition-colors">Artisanal Candles</p>
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
};

export default MegaMenu;

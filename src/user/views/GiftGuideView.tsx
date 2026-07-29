import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { ProductCard } from '../components/storefront/ProductCard';
import { QuickViewModal } from '../components/storefront/QuickViewModal';
import { Product } from '../../shared/data/mockData';
import { Gift, ArrowLeft } from 'lucide-react';

type Occasion = 'Wedding' | 'Birthday' | 'Festival' | 'Home Decor' | 'Self-Care';

export const GiftGuideView: React.FC = () => {
  const { products, setCurrentView } = useUser();
  const [activeOccasion, setActiveOccasion] = useState<Occasion>('Wedding');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const occasions: { name: Occasion; description: string; tag: string }[] = [
    { name: 'Wedding', description: 'Timeless heirloom gifts representing auspicious craftsmanship and lasting memories.', tag: 'HEIRLOOM WEDDING GIFTS' },
    { name: 'Birthday', description: 'Unique personal collectibles and toys handcrafted with organic materials.', tag: 'THOUGHTFUL BIRTHDAY SURPRISES' },
    { name: 'Festival', description: 'Brightly colored, traditional accents and clay dolls to elevate festive spirits.', tag: 'TRADITIONAL FESTIVAL ACCENTS' },
    { name: 'Home Decor', description: 'Studio pottery and hand-painted wood carving to add heritage warmth to living spaces.', tag: 'ARTISAN HOME STATEMENT PIECES' },
    { name: 'Self-Care', description: 'Small treasures, vanity organizers, and premium brass accessories to pamper oneself.', tag: 'LUXURIOUS INDULGENCES' }
  ];

  const currentOccasionInfo = occasions.find(o => o.name === activeOccasion) || occasions[0];

  // Filter products matching active occasion
  const curatedProducts = products.filter(p => p.giftOccasions && p.giftOccasions.includes(activeOccasion));

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 pb-28 md:pb-12 animate-fade-in text-obsidian-900">
      
      {/* Back button */}
      <button 
        onClick={() => setCurrentView('shop')}
        className="flex items-center gap-1 text-xs font-bold text-gold-700 hover:text-gold-800 transition-colors uppercase tracking-wider"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Catalog
      </button>

      {/* Hero Banner */}
      <div className="bg-obsidian-900 text-cream-100 p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-gold-500/30 shadow-lg flex items-center">
        <div className="max-w-xl space-y-1 sm:space-y-2 relative z-10">
          <span className="text-[10px] sm:text-xs font-bold text-gold-400 uppercase tracking-widest flex items-center gap-1">
            <Gift className="w-4 h-4 text-gold-400" />
            Artisan Curations
          </span>
          <h1 className="font-serif text-lg sm:text-3xl font-bold">Curated Gift Guide</h1>
          <p className="text-xs text-cream-300/80 leading-relaxed font-sans">
            Explore premium handpicked gifts crafted by GI-certified master artisans for every special occasion.
          </p>
        </div>
      </div>

      {/* Occasion Selection Pills */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1 border-b border-cream-300">
        {occasions.map(occ => (
          <button
            key={occ.name}
            onClick={() => setActiveOccasion(occ.name)}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold uppercase tracking-wider transition-all border-b-2 shrink-0 ${
              activeOccasion === occ.name
                ? 'border-gold-500 text-obsidian-900 bg-cream-200/50'
                : 'border-transparent text-obsidian-900/60 hover:text-obsidian-900'
            }`}
          >
            {occ.name}
          </button>
        ))}
      </div>

      {/* Curation Description Panel */}
      <div className="bg-cream-200/40 p-5 rounded-2xl border border-cream-300 space-y-1">
        <span className="text-[9px] font-bold text-gold-700 uppercase tracking-widest block">{currentOccasionInfo.tag}</span>
        <p className="text-xs text-obsidian-900/70">{currentOccasionInfo.description}</p>
      </div>

      {/* Curation Product Grid */}
      {curatedProducts.length === 0 ? (
        <p className="text-xs text-obsidian-900/50 italic">No products curated for this occasion yet. Check back soon!</p>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {curatedProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onQuickView={(p) => setQuickViewProduct(p)} 
            />
          ))}
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal 
          product={quickViewProduct} 
          onClose={() => setQuickViewProduct(null)} 
        />
      )}

    </div>
  );
};
export default GiftGuideView;

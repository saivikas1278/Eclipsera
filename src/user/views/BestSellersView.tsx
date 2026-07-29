import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { ProductCard } from '../components/storefront/ProductCard';
import { QuickViewModal } from '../components/storefront/QuickViewModal';
import { Product } from '../../shared/data/mockData';
import { Award, ArrowLeft } from 'lucide-react';

export const BestSellersView: React.FC = () => {
  const { products, setCurrentView } = useUser();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Filter products by isBestSeller
  const bestProducts = products.filter(p => p.isBestSeller);

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
            <Award className="w-4 h-4 text-gold-400" />
            Highly Acclaimed Handcrafts
          </span>
          <h1 className="font-serif text-lg sm:text-3xl font-bold">Best Sellers</h1>
          <p className="text-xs text-cream-300/80 leading-relaxed font-sans">
            Our most sought-after heirloom artifacts, highly praised by verified collectors and craft patrons worldwide.
          </p>
        </div>
      </div>

      {/* Product Grid */}
      {bestProducts.length === 0 ? (
        <div className="bg-white/60 rounded-2xl p-12 text-center border border-cream-300">
          <p className="text-xs text-obsidian-900/50 italic">No best sellers listed at this moment. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {bestProducts.map(product => (
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
export default BestSellersView;

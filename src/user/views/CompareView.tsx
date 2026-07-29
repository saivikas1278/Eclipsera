import React from 'react';
import { useUser } from '../context/UserContext';
import { ArrowLeft, Trash2, ShoppingBag, Star, HelpCircle } from 'lucide-react';
import { Product } from '../../shared/data/mockData';

export const CompareView: React.FC = () => {
  const { 
    products, 
    compareProductIds, 
    toggleCompare, 
    clearCompare, 
    setCurrentView,
    addToCart,
    openProductDetail
  } = useUser();

  // Find products that are in the comparison list
  const comparedProducts = products.filter(p => compareProductIds.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 pb-28 md:pb-12 animate-fade-in text-obsidian-900">
      
      {/* Header action bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button 
          onClick={() => setCurrentView('shop')}
          className="flex items-center gap-1 text-xs font-bold text-gold-700 hover:text-gold-800 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Catalog
        </button>

        {comparedProducts.length > 0 && (
          <button
            onClick={clearCompare}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-terracotta-500/10 hover:bg-terracotta-500 text-terracotta-500 hover:text-white rounded-xl text-xs font-bold transition-all border border-terracotta-500/20"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Comparison List
          </button>
        )}
      </div>

      {/* Main Compare Screen */}
      {comparedProducts.length === 0 ? (
        <div className="bg-white/60 rounded-3xl p-12 text-center border border-cream-300 max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 bg-cream-300 rounded-full flex items-center justify-center mx-auto text-obsidian-900/60">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-obsidian-900">No craft artifacts selected for comparison</h3>
            <p className="text-xs text-obsidian-900/60 leading-relaxed max-w-sm mx-auto font-sans">
              Browse the catalog and click the "Compare" checkbox on product cards or details to view specifications side-by-side.
            </p>
          </div>
          <button 
            onClick={() => setCurrentView('shop')}
            className="px-6 py-2.5 bg-obsidian-900 text-cream-100 hover:bg-gold-500 hover:text-obsidian-900 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
          >
            Start Comparing Crafts
          </button>
        </div>
      ) : (
        <div className="bg-white border border-cream-300 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left table-fixed border-collapse">
              
              {/* Product Header Row */}
              <thead>
                <tr className="border-b border-cream-300 bg-cream-200/30">
                  <th className="w-40 sm:w-48 p-4 font-bold uppercase tracking-wider text-obsidian-900/50 text-[10px] shrink-0 border-r border-cream-200">
                    Product Details
                  </th>
                  {comparedProducts.map(p => (
                    <th key={p.id} className="p-4 border-r border-cream-200 min-w-[200px] text-center">
                      <div className="relative group space-y-3">
                        <button
                          onClick={() => toggleCompare(p.id)}
                          className="absolute -top-1 -right-1 p-1 bg-cream-200 hover:bg-terracotta-500 text-obsidian-900 hover:text-white rounded-full transition-all"
                          title="Remove from comparison"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        
                        <div 
                          onClick={() => openProductDetail(p.slug)}
                          className="w-24 h-24 bg-cream-200 rounded-xl overflow-hidden mx-auto cursor-pointer"
                        >
                          <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                        </div>
                        
                        <h4 
                          onClick={() => openProductDetail(p.slug)}
                          className="font-serif font-bold text-xs hover:text-gold-600 cursor-pointer line-clamp-1"
                        >
                          {p.title}
                        </h4>

                        <button
                          onClick={() => addToCart(p, p.variants[0].id)}
                          className="mx-auto bg-obsidian-900 hover:bg-gold-500 hover:text-obsidian-900 text-cream-100 px-3 py-1.5 rounded-lg font-bold uppercase text-[10px] flex items-center justify-center gap-1 transition-all"
                        >
                          <ShoppingBag className="w-3 h-3 text-gold-400" />
                          Add to Cart
                        </button>
                      </div>
                    </th>
                  ))}
                  {/* Fill empty comparison columns up to 3 */}
                  {[...Array(Math.max(0, 3 - comparedProducts.length))].map((_, idx) => (
                    <th key={idx} className="p-4 border-r border-cream-200 text-center font-sans text-obsidian-900/30 font-semibold italic text-[11px]">
                      Add another product to compare
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Rows */}
              <tbody className="divide-y divide-cream-200 font-sans">
                
                {/* Price */}
                <tr className="hover:bg-cream-100/40">
                  <td className="p-4 font-bold uppercase text-[10px] tracking-wide text-obsidian-900/60 border-r border-cream-200">
                    Price
                  </td>
                  {comparedProducts.map(p => (
                    <td key={p.id} className="p-4 text-center font-bold text-sm border-r border-cream-200">
                      ₹{p.basePrice.toLocaleString()}
                    </td>
                  ))}
                  {[...Array(Math.max(0, 3 - comparedProducts.length))].map((_, idx) => (
                    <td key={idx} className="p-4 border-r border-cream-200" />
                  ))}
                </tr>

                {/* Rating */}
                <tr className="hover:bg-cream-100/40">
                  <td className="p-4 font-bold uppercase text-[10px] tracking-wide text-obsidian-900/60 border-r border-cream-200">
                    Rating
                  </td>
                  {comparedProducts.map(p => (
                    <td key={p.id} className="p-4 text-center border-r border-cream-200 font-bold">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-3.5 h-3.5 text-gold-500 fill-current" />
                        <span>{p.rating} ({p.reviewsCount})</span>
                      </div>
                    </td>
                  ))}
                  {[...Array(Math.max(0, 3 - comparedProducts.length))].map((_, idx) => (
                    <td key={idx} className="p-4 border-r border-cream-200" />
                  ))}
                </tr>

                {/* Craft Technique */}
                <tr className="hover:bg-cream-100/40">
                  <td className="p-4 font-bold uppercase text-[10px] tracking-wide text-obsidian-900/60 border-r border-cream-200">
                    Technique
                  </td>
                  {comparedProducts.map(p => (
                    <td key={p.id} className="p-4 text-center border-r border-cream-200 font-semibold text-gold-700 uppercase tracking-wide text-[10px]">
                      {p.craftTechnique}
                    </td>
                  ))}
                  {[...Array(Math.max(0, 3 - comparedProducts.length))].map((_, idx) => (
                    <td key={idx} className="p-4 border-r border-cream-200" />
                  ))}
                </tr>

                {/* Material */}
                <tr className="hover:bg-cream-100/40">
                  <td className="p-4 font-bold uppercase text-[10px] tracking-wide text-obsidian-900/60 border-r border-cream-200">
                    Material
                  </td>
                  {comparedProducts.map(p => (
                    <td key={p.id} className="p-4 text-center border-r border-cream-200 text-obsidian-900/80">
                      {p.material}
                    </td>
                  ))}
                  {[...Array(Math.max(0, 3 - comparedProducts.length))].map((_, idx) => (
                    <td key={idx} className="p-4 border-r border-cream-200" />
                  ))}
                </tr>

                {/* Dimensions */}
                <tr className="hover:bg-cream-100/40">
                  <td className="p-4 font-bold uppercase text-[10px] tracking-wide text-obsidian-900/60 border-r border-cream-200">
                    Dimensions
                  </td>
                  {comparedProducts.map(p => (
                    <td key={p.id} className="p-4 text-center border-r border-cream-200 text-obsidian-900/85 font-mono">
                      {p.dimensions || 'N/A'}
                    </td>
                  ))}
                  {[...Array(Math.max(0, 3 - comparedProducts.length))].map((_, idx) => (
                    <td key={idx} className="p-4 border-r border-cream-200" />
                  ))}
                </tr>

                {/* Weight */}
                <tr className="hover:bg-cream-100/40">
                  <td className="p-4 font-bold uppercase text-[10px] tracking-wide text-obsidian-900/60 border-r border-cream-200">
                    Weight
                  </td>
                  {comparedProducts.map(p => (
                    <td key={p.id} className="p-4 text-center border-r border-cream-200 text-obsidian-900/80">
                      {p.weight || 'N/A'}
                    </td>
                  ))}
                  {[...Array(Math.max(0, 3 - comparedProducts.length))].map((_, idx) => (
                    <td key={idx} className="p-4 border-r border-cream-200" />
                  ))}
                </tr>

                {/* Artisan */}
                <tr className="hover:bg-cream-100/40">
                  <td className="p-4 font-bold uppercase text-[10px] tracking-wide text-obsidian-900/60 border-r border-cream-200">
                    Artisan Partner
                  </td>
                  {comparedProducts.map(p => (
                    <td key={p.id} className="p-4 text-center border-r border-cream-200 text-obsidian-900 font-serif font-bold">
                      {p.artisanName}
                    </td>
                  ))}
                  {[...Array(Math.max(0, 3 - comparedProducts.length))].map((_, idx) => (
                    <td key={idx} className="p-4 border-r border-cream-200" />
                  ))}
                </tr>

                {/* Shipping Time */}
                <tr className="hover:bg-cream-100/40">
                  <td className="p-4 font-bold uppercase text-[10px] tracking-wide text-obsidian-900/60 border-r border-cream-200">
                    Shipping Time
                  </td>
                  {comparedProducts.map(p => (
                    <td key={p.id} className="p-4 text-center border-r border-cream-200 font-bold text-emerald-700">
                      {p.shippingTime || '3 - 5 Days'}
                    </td>
                  ))}
                  {[...Array(Math.max(0, 3 - comparedProducts.length))].map((_, idx) => (
                    <td key={idx} className="p-4 border-r border-cream-200" />
                  ))}
                </tr>

              </tbody>

            </table>
          </div>
        </div>
      )}

    </div>
  );
};
export default CompareView;

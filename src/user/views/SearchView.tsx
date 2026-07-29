import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { ProductCard } from '../components/storefront/ProductCard';
import { QuickViewModal } from '../components/storefront/QuickViewModal';
import { Product } from '../../shared/data/mockData';
import { Search, ArrowRight, Grid, List } from 'lucide-react';

export const SearchView: React.FC = () => {
  const { 
    products, 
    categories, 
    searchQueryState, 
    openSearch,
    openCategory,
    openProductDetail
  } = useUser();

  const [inputVal, setInputVal] = useState(searchQueryState);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    setInputVal(searchQueryState);
  }, [searchQueryState]);

  // Spell-check suggestion dictionary mapping common typos to correct terms
  const searchSuggestions: { [key: string]: string } = {
    'toy': 'toys',
    'toy s': 'toys',
    'toyy': 'toys',
    'potery': 'pottery',
    'poty': 'pottery',
    'bras': 'brass',
    'key': 'keychains',
    'woodbox': 'box',
    'jali': 'teakwood',
    'madubani': 'madhubani',
    'painting': 'art',
  };

  const currentQueryNormalized = searchQueryState.toLowerCase().trim();
  const suggestion = searchSuggestions[currentQueryNormalized] || null;

  // Search filter matching multiple fields
  const matchedProducts = products.filter(p => {
    if (!searchQueryState) return true;
    const query = searchQueryState.toLowerCase();
    return (
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.craftTechnique.toLowerCase().includes(query) ||
      p.artisanName.toLowerCase().includes(query) ||
      p.material.toLowerCase().includes(query) ||
      p.originRegion.toLowerCase().includes(query)
    );
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      openSearch(inputVal.trim());
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 pb-28 md:pb-12 animate-fade-in text-obsidian-900">
      
      {/* Top Search Input Box */}
      <div className="bg-cream-200/50 p-6 rounded-3xl border border-cream-300 shadow-sm max-w-2xl mx-auto">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <input 
            type="text"
            placeholder="Search our heritage craft artifacts..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-full bg-white border border-cream-300 rounded-2xl pl-11 pr-24 py-3.5 text-sm font-bold text-obsidian-900 focus:outline-none focus:border-gold-500 shadow-inner"
          />
          <Search className="w-5 h-5 text-obsidian-900/40 absolute left-4" />
          <button 
            type="submit"
            className="absolute right-2 bg-obsidian-900 hover:bg-gold-500 hover:text-obsidian-900 text-cream-100 px-5 py-2 rounded-xl text-xs font-bold uppercase transition-all shadow-sm"
          >
            Search
          </button>
        </form>

        {/* Suggest typo corrections ("Did you mean...") */}
        {suggestion && (
          <p className="text-xs text-obsidian-900/60 mt-3 pl-2 font-medium">
            Did you mean:{' '}
            <button 
              onClick={() => openSearch(suggestion)} 
              className="text-gold-700 font-bold hover:underline"
            >
              "{suggestion}"
            </button> ?
          </p>
        )}
      </div>

      {/* Query status header */}
      <div className="border-b border-cream-300 pb-3 flex justify-between items-baseline">
        <h2 className="font-serif text-base sm:text-xl font-bold">
          {searchQueryState 
            ? `Search Results for "${searchQueryState}"` 
            : 'All Craft Artifacts'}
        </h2>
        <span className="text-xs text-obsidian-900/60 font-semibold">{matchedProducts.length} items found</span>
      </div>

      {/* Product Display Grid or Empty States */}
      {matchedProducts.length === 0 ? (
        <div className="max-w-md mx-auto py-12 text-center space-y-6">
          <div className="space-y-2">
            <h3 className="font-serif text-lg font-bold text-obsidian-900">We couldn't find matches for "{searchQueryState}"</h3>
            <p className="text-xs text-obsidian-900/60 leading-relaxed font-sans">
              Double check the spelling or explore our curated collections to find premium handcrafted pieces.
            </p>
          </div>

          {/* Curated Categories Suggestions */}
          <div className="space-y-3 bg-white p-6 rounded-2xl border border-cream-300 shadow-sm text-left">
            <h4 className="text-[10px] font-bold text-gold-700 uppercase tracking-widest">Suggested Collections</h4>
            <div className="divide-y divide-cream-200">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => openCategory(cat.slug)}
                  className="w-full py-2.5 flex items-center justify-between text-xs font-bold hover:text-gold-600 transition-colors"
                >
                  <span>{cat.name}</span>
                  <ArrowRight className="w-4 h-4 text-gold-500" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {matchedProducts.map(product => (
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
export default SearchView;

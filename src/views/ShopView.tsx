import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/storefront/ProductCard';
import { QuickViewModal } from '../components/storefront/QuickViewModal';
import { Product } from '../data/mockData';
import { SlidersHorizontal, Search, RotateCcw, X, Filter } from 'lucide-react';

export const ShopView: React.FC = () => {
  const { products, categories } = useStore();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [selectedCraft, setSelectedCraft] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Craft Options
  const crafts = Array.from(new Set(products.map(p => p.craftTechnique)));

  // Filter Logic
  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase()) && !p.craftTechnique.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (p.basePrice > maxPrice) return false;
    if (selectedCraft !== 'all' && p.craftTechnique !== selectedCraft) return false;
    if (inStockOnly && p.variants.every(v => v.stockQuantity <= 0)) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
    if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
    if (sortBy === 'rating') return b.rating - a.rating;
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  const hasActiveFilters = selectedCategory !== 'all' || searchQuery !== '' || maxPrice < 5000 || selectedCraft !== 'all' || inStockOnly;

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setMaxPrice(5000);
    setSelectedCraft('all');
    setInStockOnly(false);
    setSortBy('featured');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-28 md:pb-12">
      
      {/* Header Banner */}
      <div className="bg-obsidian-900 text-cream-100 p-4 sm:p-8 rounded-2xl sm:rounded-3xl relative overflow-hidden border border-gold-500/30 shadow-lg">
        <div className="max-w-xl space-y-1 sm:space-y-2 relative z-10">
          <span className="text-[10px] sm:text-xs font-bold text-gold-400 uppercase tracking-widest">Handcrafted Registry</span>
          <h1 className="font-serif text-lg sm:text-3xl font-bold">Artisan Catalog</h1>
          <p className="text-xs text-cream-300/80 leading-relaxed font-sans hidden sm:block">
            Handmade toys, keychains, studio pottery, and woodcrafts certified by artisan guilds.
          </p>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left Filter Sidebar (Desktop) */}
        <div className="hidden lg:block lg:col-span-3 space-y-6 bg-cream-200/50 p-6 rounded-2xl border border-cream-300 h-fit">
          <div className="flex items-center justify-between border-b border-cream-300 pb-3">
            <h3 className="font-serif text-base font-bold text-obsidian-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-gold-600" />
              Craft Filters
            </h3>
            {hasActiveFilters && (
              <button onClick={resetFilters} className="text-[11px] font-bold text-gold-700 hover:underline flex items-center gap-1">
                <RotateCcw className="w-3 h-3" />
                Reset All
              </button>
            )}
          </div>

          {/* Search Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-obsidian-900 uppercase block">Search Keyword</label>
            <div className="relative">
              <input 
                type="text"
                placeholder="Toys, keychains, wood..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs text-obsidian-900 focus:outline-none focus:border-gold-500"
              />
              <Search className="w-4 h-4 text-obsidian-900/40 absolute right-3 top-2.5" />
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-obsidian-900 uppercase block">Category Realm</label>
            <div className="space-y-1 text-xs">
              <button 
                onClick={() => setSelectedCategory('all')}
                className={`block w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${selectedCategory === 'all' ? 'bg-gold-500 text-obsidian-900 font-bold' : 'hover:bg-cream-300/50'}`}
              >
                All Handcrafted ({products.length})
              </button>
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`block w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${selectedCategory === cat.slug ? 'bg-gold-500 text-obsidian-900 font-bold' : 'hover:bg-cream-300/50'}`}
                >
                  {cat.name} ({products.filter(p => p.category === cat.slug).length})
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-1.5 pt-2 border-t border-cream-300">
            <div className="flex justify-between text-xs font-bold text-obsidian-900">
              <span>Max Price</span>
              <span className="text-gold-700">₹{maxPrice.toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              min="500" 
              max="5000" 
              step="250"
              value={maxPrice} 
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-gold-500 cursor-pointer"
            />
          </div>

          {/* Craft Technique Dropdown */}
          <div className="space-y-1.5 pt-2 border-t border-cream-300">
            <label className="text-xs font-bold text-obsidian-900 uppercase block">Craft Technique</label>
            <select 
              value={selectedCraft}
              onChange={(e) => setSelectedCraft(e.target.value)}
              className="w-full bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-gold-500"
            >
              <option value="all">All Handcrafted Techniques</option>
              {crafts.map((craft, idx) => (
                <option key={idx} value={craft}>{craft}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Right Product Grid Area */}
        <div className="lg:col-span-9 space-y-4">
          
          {/* Control Bar */}
          <div className="flex flex-row items-center justify-between gap-2 bg-cream-200/40 p-2.5 sm:p-4 rounded-2xl border border-cream-300">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                className="lg:hidden bg-obsidian-900 text-cream-100 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 min-h-[38px]"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-gold-400" />
                Filter
              </button>
              <p className="text-[11px] sm:text-xs text-obsidian-900/70 font-semibold">
                <span className="text-gold-700 font-bold">{filteredProducts.length}</span> Items
              </p>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] sm:text-xs font-semibold text-obsidian-900 hidden sm:inline">Sort:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-cream-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-gold-500"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips Bar */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
              <span className="text-[11px] font-bold text-obsidian-900 uppercase shrink-0">Active Filters:</span>
              
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gold-500/20 text-gold-700 font-bold rounded-full border border-gold-500/30 shrink-0">
                  Cat: {categories.find(c => c.slug === selectedCategory)?.name}
                  <X className="w-3 h-3 cursor-pointer hover:text-obsidian-900" onClick={() => setSelectedCategory('all')} />
                </span>
              )}

              {searchQuery !== '' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gold-500/20 text-gold-700 font-bold rounded-full border border-gold-500/30 shrink-0">
                  Search: "{searchQuery}"
                  <X className="w-3 h-3 cursor-pointer hover:text-obsidian-900" onClick={() => setSearchQuery('')} />
                </span>
              )}

              {maxPrice < 5000 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gold-500/20 text-gold-700 font-bold rounded-full border border-gold-500/30 shrink-0">
                  Max: ₹{maxPrice.toLocaleString()}
                  <X className="w-3 h-3 cursor-pointer hover:text-obsidian-900" onClick={() => setMaxPrice(5000)} />
                </span>
              )}

              {selectedCraft !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gold-500/20 text-gold-700 font-bold rounded-full border border-gold-500/30 shrink-0">
                  Craft: {selectedCraft}
                  <X className="w-3 h-3 cursor-pointer hover:text-obsidian-900" onClick={() => setSelectedCraft('all')} />
                </span>
              )}

              <button 
                onClick={resetFilters} 
                className="text-[11px] font-bold text-gold-700 hover:underline shrink-0 ml-1"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Mobile Filter Drawer */}
          {isMobileFilterOpen && (
            <div className="lg:hidden bg-cream-100 p-4 rounded-2xl border border-gold-500/30 space-y-3 animate-fade-in">
              <div className="flex justify-between items-center border-b border-cream-300 pb-2">
                <span className="font-serif font-bold text-sm text-obsidian-900">Filters</span>
                <button onClick={() => setIsMobileFilterOpen(false)} className="text-xs text-gold-700 font-bold">Done</button>
              </div>

              <div className="space-y-2 text-xs">
                <label className="font-bold block">Category</label>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-white p-2 rounded-lg border border-cream-300"
                >
                  <option value="all">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span>Max Price</span>
                  <span>₹{maxPrice.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="500" 
                  max="5000" 
                  step="250"
                  value={maxPrice} 
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-gold-500"
                />
              </div>
            </div>
          )}

          {/* Strict 2-Column Mobile Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white/60 rounded-2xl p-8 text-center space-y-2 border border-cream-300">
              <h3 className="font-serif text-base font-bold text-obsidian-900">No handcrafted items matched your query</h3>
              <p className="text-xs text-obsidian-900/60">Try clearing active price or technique filters.</p>
              <button 
                onClick={resetFilters}
                className="px-4 py-1.5 bg-gold-500 text-obsidian-900 rounded-xl font-bold text-xs uppercase"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-3">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onQuickView={(p) => setQuickViewProduct(p)} 
                />
              ))}
            </div>
          )}

        </div>

      </div>

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

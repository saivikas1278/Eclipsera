import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { ProductCard } from '../components/storefront/ProductCard';
import { QuickViewModal } from '../components/storefront/QuickViewModal';
import { Product } from '../../shared/data/mockData';
import { SlidersHorizontal, Search, RotateCcw, X, Grid, List, Heart, ShoppingBag, Star, Plus } from 'lucide-react';

export const ShopView: React.FC = () => {
  const { products, categories, addToCart, isInWishlist, toggleWishlist, openProductDetail } = useUser();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Layout View Toggle State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [selectedCraft, setSelectedCraft] = useState<string>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [selectedArtisan, setSelectedArtisan] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  
  // Mobile Filter Sidebar Toggle
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Sort State: newest, price-asc, price-desc, rating, most-popular, featured
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'most-popular'>('featured');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 4;

  // Loading skeleton state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, maxPrice, selectedCraft, selectedMaterial, selectedArtisan, minRating, inStockOnly, sortBy]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, maxPrice, selectedCraft, selectedMaterial, selectedArtisan, minRating, inStockOnly, sortBy]);

  // Distinct Filter options gathered from data dynamically
  const crafts = Array.from(new Set(products.map(p => p.craftTechnique)));
  const materials = Array.from(new Set(products.map(p => p.material)));
  const artisans = Array.from(new Set(products.map(p => p.artisanName)));

  // Filter Logic
  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase()) && !p.craftTechnique.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (p.basePrice > maxPrice) return false;
    if (selectedCraft !== 'all' && p.craftTechnique !== selectedCraft) return false;
    if (selectedMaterial !== 'all' && p.material !== selectedMaterial) return false;
    if (selectedArtisan !== 'all' && p.artisanName !== selectedArtisan) return false;
    if (p.rating < minRating) return false;
    if (inStockOnly && p.variants.every(v => v.stockQuantity <= 0)) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
    if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'most-popular') return b.reviewsCount - a.reviewsCount;
    if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0) || b.id.localeCompare(a.id);
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  // Pagination bounds
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const hasActiveFilters = 
    selectedCategory !== 'all' || 
    searchQuery !== '' || 
    maxPrice < 5000 || 
    selectedCraft !== 'all' || 
    selectedMaterial !== 'all' || 
    selectedArtisan !== 'all' || 
    minRating > 0 || 
    inStockOnly;

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setMaxPrice(5000);
    setSelectedCraft('all');
    setSelectedMaterial('all');
    setSelectedArtisan('all');
    setMinRating(0);
    setInStockOnly(false);
    setSortBy('featured');
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-28 md:pb-12 animate-fade-in">
      
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
        <div className="hidden lg:block lg:col-span-3 space-y-6 bg-cream-200/50 p-6 rounded-2xl border border-cream-300 h-fit text-obsidian-900">
          <div className="flex items-center justify-between border-b border-cream-300 pb-3">
            <h3 className="font-serif text-base font-bold flex items-center gap-2">
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
            <label className="text-xs font-bold uppercase block">Search Keyword</label>
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
            <label className="text-xs font-bold uppercase block">Category Realm</label>
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
            <div className="flex justify-between text-xs font-bold">
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

          {/* Material Filter */}
          <div className="space-y-1.5 pt-2 border-t border-cream-300">
            <label className="text-xs font-bold uppercase block">Material Used</label>
            <select 
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className="w-full bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-gold-500 text-obsidian-900"
            >
              <option value="all">All Materials</option>
              {materials.map((mat, idx) => (
                <option key={idx} value={mat}>{mat}</option>
              ))}
            </select>
          </div>

          {/* Artisan Filter */}
          <div className="space-y-1.5 pt-2 border-t border-cream-300">
            <label className="text-xs font-bold uppercase block">Master Artisan</label>
            <select 
              value={selectedArtisan}
              onChange={(e) => setSelectedArtisan(e.target.value)}
              className="w-full bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-gold-500 text-obsidian-900"
            >
              <option value="all">All Artisans / Guilds</option>
              {artisans.map((art, idx) => (
                <option key={idx} value={art}>{art}</option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div className="space-y-1.5 pt-2 border-t border-cream-300">
            <label className="text-xs font-bold uppercase block">Minimum Rating</label>
            <div className="flex gap-1">
              {[3, 4, 4.5, 4.8].map((ratingVal) => (
                <button
                  key={ratingVal}
                  type="button"
                  onClick={() => setMinRating(minRating === ratingVal ? 0 : ratingVal)}
                  className={`flex-1 py-1 rounded border text-[10px] font-bold transition-all ${
                    minRating === ratingVal 
                      ? 'bg-gold-500 border-gold-500 text-obsidian-900' 
                      : 'bg-white border-cream-300 text-obsidian-900/70 hover:border-gold-500'
                  }`}
                >
                  {ratingVal}★
                </button>
              ))}
            </div>
          </div>

          {/* Availability Switch */}
          <div className="flex items-center justify-between pt-3 border-t border-cream-300 text-xs font-bold">
            <span>In Stock Only</span>
            <input 
              type="checkbox" 
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 rounded text-gold-500 focus:ring-gold-500 accent-gold-500 cursor-pointer"
            />
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

              {/* Grid / List view toggle */}
              <div className="hidden sm:flex border border-cream-300 rounded-xl bg-white p-1">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-gold-500 text-obsidian-900 shadow-sm' : 'text-obsidian-900/60 hover:text-obsidian-900'}`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-gold-500 text-obsidian-900 shadow-sm' : 'text-obsidian-900/60 hover:text-obsidian-900'}`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] sm:text-xs text-obsidian-900/70 font-semibold">
                Showing <span className="text-gold-700 font-bold">{filteredProducts.length}</span> Handcrafted Items
              </p>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 text-obsidian-900">
              <span className="text-[11px] sm:text-xs font-semibold hidden sm:inline">Sort:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-cream-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-gold-500 text-obsidian-900"
              >
                <option value="featured">Featured / Awarded</option>
                <option value="newest">New Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Best Rated</option>
                <option value="most-popular">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips Bar */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
              <span className="text-[11px] font-bold text-obsidian-900 uppercase shrink-0">Active:</span>
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gold-500/20 text-gold-700 font-bold rounded-full border border-gold-500/30 shrink-0">
                  {categories.find(c => c.slug === selectedCategory)?.name}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('all')} />
                </span>
              )}
              {searchQuery !== '' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gold-500/20 text-gold-700 font-bold rounded-full border border-gold-500/30 shrink-0">
                  "{searchQuery}"
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                </span>
              )}
              {maxPrice < 5000 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gold-500/20 text-gold-700 font-bold rounded-full border border-gold-500/30 shrink-0">
                  &lt; ₹{maxPrice}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setMaxPrice(5000)} />
                </span>
              )}
              {selectedMaterial !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gold-500/20 text-gold-700 font-bold rounded-full border border-gold-500/30 shrink-0">
                  {selectedMaterial}
                  <X className="w-3 h-3" onClick={() => setSelectedMaterial('all')} />
                </span>
              )}
              {selectedArtisan !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gold-500/20 text-gold-700 font-bold rounded-full border border-gold-500/30 shrink-0 text-ellipsis overflow-hidden max-w-[120px]">
                  {selectedArtisan}
                  <X className="w-3 h-3" onClick={() => setSelectedArtisan('all')} />
                </span>
              )}
              {minRating > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gold-500/20 text-gold-700 font-bold rounded-full border border-gold-500/30 shrink-0">
                  {minRating}★+
                  <X className="w-3 h-3" onClick={() => setMinRating(0)} />
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gold-500/20 text-gold-700 font-bold rounded-full border border-gold-500/30 shrink-0">
                  In Stock
                  <X className="w-3 h-3" onClick={() => setInStockOnly(false)} />
                </span>
              )}
              <button onClick={resetFilters} className="text-[11px] font-bold text-gold-700 hover:underline shrink-0 ml-1">
                Clear All
              </button>
            </div>
          )}

          {/* Mobile Filter Drawer */}
          {isMobileFilterOpen && (
            <div className="lg:hidden bg-cream-100 p-4 rounded-2xl border border-gold-500/30 space-y-3 animate-fade-in text-obsidian-900 shadow-md">
              <div className="flex justify-between items-center border-b border-cream-300 pb-2">
                <span className="font-serif font-bold text-sm">Filters</span>
                <button onClick={() => setIsMobileFilterOpen(false)} className="text-xs text-gold-700 font-bold">Done</button>
              </div>

              <div className="space-y-2 text-xs">
                <label className="font-bold block">Category</label>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full bg-white p-2 rounded-lg border border-cream-300 text-obsidian-900">
                  <option value="all">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-2 text-xs">
                <label className="font-bold block">Artisan</label>
                <select value={selectedArtisan} onChange={(e) => setSelectedArtisan(e.target.value)} className="w-full bg-white p-2 rounded-lg border border-cream-300 text-obsidian-900">
                  <option value="all">All Artisans</option>
                  {artisans.map((art, idx) => <option key={idx} value={art}>{art}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Loading Skeleton or Product Grid/List */}
          {isLoading ? (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3">
              {[...Array(itemsPerPage)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white border border-cream-300 rounded-2xl h-80 flex flex-col justify-between p-4 space-y-3">
                  <div className="bg-cream-300 aspect-square rounded-xl w-full" />
                  <div className="h-4 bg-cream-300 rounded w-2/3" />
                  <div className="h-3 bg-cream-300 rounded w-1/2" />
                  <div className="h-6 bg-cream-300 rounded w-1/3 mt-2" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white/60 rounded-2xl p-12 text-center space-y-3 border border-cream-300">
              <h3 className="font-serif text-lg font-bold text-obsidian-900">No handcrafted items match your filters</h3>
              <p className="text-xs text-obsidian-900/60">Try loosening your search keywords, rating requirements, or price threshold.</p>
              <button 
                onClick={resetFilters}
                className="px-5 py-2.5 bg-gold-500 text-obsidian-900 hover:bg-gold-400 rounded-xl font-bold text-xs uppercase transition-all"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3">
              {paginatedProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onQuickView={(p) => setQuickViewProduct(p)} 
                />
              ))}
            </div>
          ) : (
            // LIST VIEW LAYOUT
            <div className="space-y-3.5">
              {paginatedProducts.map(product => {
                const inWish = isInWishlist(product.id);
                return (
                  <div 
                    key={product.id}
                    className="group bg-white border border-cream-300 rounded-2xl p-4 flex gap-4 hover:-translate-y-1 hover:shadow-luxury transition-all duration-300 text-obsidian-900"
                  >
                    <div 
                      onClick={() => openProductDetail(product.slug)}
                      className="w-32 h-36 bg-cream-200 rounded-xl overflow-hidden cursor-pointer shrink-0"
                    >
                      <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[10px] font-bold text-gold-700 uppercase tracking-widest">{product.craftTechnique}</span>
                          <button 
                            onClick={() => toggleWishlist(product.id)}
                            className={`p-1.5 rounded-full transition-all shrink-0 ${inWish ? 'bg-terracotta-500 text-white' : 'bg-cream-100 hover:text-terracotta-500 border border-cream-300'}`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${inWish ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                        <h3 
                          onClick={() => openProductDetail(product.slug)}
                          className="font-serif font-bold text-sm sm:text-base hover:text-gold-600 cursor-pointer mt-1 text-obsidian-900 line-clamp-1"
                        >
                          {product.title}
                        </h3>
                        <p className="text-[11px] text-obsidian-900/60 font-semibold mt-0.5">By {product.artisanName} ({product.originRegion})</p>
                        <p className="text-xs text-obsidian-900/80 line-clamp-2 mt-1.5 font-sans leading-relaxed hidden sm:block">{product.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-cream-200">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-serif text-sm sm:text-base font-bold text-obsidian-900">₹{product.basePrice.toLocaleString()}</span>
                          {product.compareAtPrice && <span className="text-[10px] text-obsidian-900/40 line-through font-mono">₹{product.compareAtPrice.toLocaleString()}</span>}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-[11px] font-bold">
                            <Star className="w-3.5 h-3.5 text-gold-500 fill-current" />
                            <span>{product.rating}</span>
                          </div>

                          <button 
                            onClick={() => addToCart(product, product.variants[0].id)}
                            className="bg-obsidian-900 hover:bg-gold-600 hover:text-obsidian-900 text-cream-100 px-3.5 py-2 rounded-xl text-xs font-semibold uppercase flex items-center gap-1.5 transition-all shadow-sm"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 text-gold-400" />
                            <span>Add to Cart</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Simple Client-side Pagination Controls */}
          {filteredProducts.length > itemsPerPage && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-cream-300 text-xs font-bold hover:border-gold-500 disabled:opacity-40 text-obsidian-900"
              >
                Prev
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border ${
                    currentPage === i + 1 
                      ? 'bg-gold-500 border-gold-500 text-obsidian-900 font-extrabold shadow-sm' 
                      : 'bg-white border-cream-300 text-obsidian-900/70 hover:border-gold-500'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-cream-300 text-xs font-bold hover:border-gold-500 disabled:opacity-40 text-obsidian-900"
              >
                Next
              </button>
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
export default ShopView;

import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { ProductCard } from '../components/storefront/ProductCard';
import { QuickViewModal } from '../components/storefront/QuickViewModal';
import { Product } from '../../shared/data/mockData';
import { SlidersHorizontal, ArrowLeft, Grid, List, Heart, Star, ShoppingBag } from 'lucide-react';

export const CategoryView: React.FC = () => {
  const { 
    products, 
    categories, 
    selectedCategorySlug, 
    setCurrentView,
    addToCart,
    isInWishlist,
    toggleWishlist,
    openProductDetail
  } = useUser();

  const category = categories.find(c => c.slug === selectedCategorySlug) || categories[0];

  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Loading skeleton state
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [selectedCategorySlug, selectedSubcategory, sortBy]);

  // Gather subcategories for products belonging to this category
  const categoryProducts = products.filter(p => p.category === category?.slug);
  const subcategories = Array.from(new Set(
    categoryProducts.flatMap(p => p.subcategories || [])
  ));

  // Filter & Sort Logic
  const filteredProducts = categoryProducts.filter(p => {
    if (selectedSubcategory !== 'all' && (!p.subcategories || !p.subcategories.includes(selectedSubcategory))) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
    if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
    if (sortBy === 'rating') return b.rating - a.rating;
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-28 md:pb-12 animate-fade-in text-obsidian-900">
      
      {/* Back button */}
      <button 
        onClick={() => setCurrentView('shop')}
        className="flex items-center gap-1 text-xs font-bold text-gold-700 hover:text-gold-800 transition-colors uppercase tracking-wider"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to All Crafts
      </button>

      {/* Category Hero Banner */}
      <div 
        className="bg-cover bg-center rounded-2xl sm:rounded-3xl relative overflow-hidden h-40 sm:h-56 flex items-center border border-gold-500/20 shadow-lg"
        style={{ backgroundImage: `linear-gradient(rgba(10, 10, 10, 0.75), rgba(10, 10, 10, 0.75)), url(${category?.image})` }}
      >
        <div className="p-6 sm:p-10 space-y-2 text-cream-100 max-w-xl">
          <span className="text-[10px] sm:text-xs font-bold text-gold-400 uppercase tracking-widest">Handcrafted Realm</span>
          <h1 className="font-serif text-xl sm:text-4xl font-bold">{category?.name}</h1>
          <p className="text-xs text-cream-300/80 leading-relaxed font-sans">
            {category?.description}
          </p>
        </div>
      </div>

      {/* Subcategory pills */}
      {subcategories.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-obsidian-900/60 mr-1">Subcategories:</span>
          <button
            onClick={() => setSelectedSubcategory('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
              selectedSubcategory === 'all'
                ? 'bg-gold-500 border-gold-500 text-obsidian-900 font-extrabold shadow-sm'
                : 'bg-white border-cream-300 text-obsidian-900/70 hover:border-gold-500'
            }`}
          >
            All {category?.name}
          </button>
          {subcategories.map(sub => (
            <button
              key={sub}
              onClick={() => setSelectedSubcategory(sub)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                selectedSubcategory === sub
                  ? 'bg-gold-500 border-gold-500 text-obsidian-900 font-extrabold shadow-sm'
                  : 'bg-white border-cream-300 text-obsidian-900/70 hover:border-gold-500'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-row items-center justify-between gap-2 bg-cream-200/40 p-2.5 sm:p-4 rounded-2xl border border-cream-300">
        <div className="flex items-center gap-2">
          {/* View Toggles */}
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
            Found <span className="text-gold-700 font-bold">{filteredProducts.length}</span> items
          </p>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] sm:text-xs font-semibold hidden sm:inline">Sort:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-cream-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-gold-500 text-obsidian-900"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Best Rated</option>
          </select>
        </div>
      </div>

      {/* Product Display Grid/List */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white border border-cream-300 rounded-2xl h-80 flex flex-col justify-between p-4">
              <div className="bg-cream-300 aspect-square rounded-xl w-full" />
              <div className="h-4 bg-cream-300 rounded w-2/3 mt-3" />
              <div className="h-3 bg-cream-300 rounded w-1/2 mt-2" />
              <div className="h-6 bg-cream-300 rounded w-1/3 mt-4" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white/60 rounded-2xl p-12 text-center border border-cream-300">
          <p className="text-xs text-obsidian-900/60 font-semibold">No items match this subcategory filter.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onQuickView={(p) => setQuickViewProduct(p)} 
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredProducts.map(product => {
            const inWish = isInWishlist(product.id);
            return (
              <div 
                key={product.id}
                className="group bg-white border border-cream-300 rounded-2xl p-4 flex gap-4 hover:-translate-y-1 hover:shadow-luxury transition-all duration-300"
              >
                <div 
                  onClick={() => openProductDetail(product.slug)}
                  className="w-32 h-36 bg-cream-200 rounded-xl overflow-hidden cursor-pointer shrink-0"
                >
                  <img 
                    src={product.images[0]} 
                    alt={product.title} 
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-bold text-gold-700 uppercase tracking-widest">{product.craftTechnique}</span>
                      <button 
                        onClick={() => toggleWishlist(product.id)}
                        className={`p-1.5 rounded-full transition-all shrink-0 ${inWish ? 'bg-terracotta-500 text-white shadow-sm' : 'bg-cream-100 border border-cream-300 hover:text-terracotta-500'}`}
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
                    <p className="text-[10px] text-obsidian-900/60 font-semibold mt-0.5">By {product.artisanName} ({product.originRegion})</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-cream-200">
                    <span className="font-serif text-sm sm:text-base font-bold">₹{product.basePrice.toLocaleString()}</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[11px] font-bold">
                        <Star className="w-3.5 h-3.5 text-gold-500 fill-current" />
                        <span>{product.rating}</span>
                      </div>
                      <button 
                        onClick={() => addToCart(product, product.variants?.[0]?.id || '')}
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
export default CategoryView;

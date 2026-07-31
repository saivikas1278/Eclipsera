import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { ProductCard } from '../components/storefront/ProductCard';
import { QuickViewModal } from '../components/storefront/QuickViewModal';
import { Product } from '../../shared/data/mockData';
import { Sparkles, ShieldCheck, Award, ArrowRight, Compass, Users } from 'lucide-react';

export const HomeView: React.FC = () => {
  const { products, categories, setCurrentView } = useUser();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  
  // Quick Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    return true;
  });

  // Featured Craft Collections
  const craftCollections = [
    {
      id: 'col-1',
      title: 'Channapatna Toycraft',
      slug: 'handcrafted-toys',
      count: products.filter(p => p.category === 'handcrafted-toys').length,
      image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80',
      region: 'Karnataka Guild'
    },
    {
      id: 'col-2',
      title: 'Engraved Brasscraft',
      slug: 'artisan-keychains',
      count: products.filter(p => p.category === 'artisan-keychains').length,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
      region: 'Moradabad Guild'
    },
    {
      id: 'col-3',
      title: 'Studio Terracotta',
      slug: 'studio-pottery',
      count: products.filter(p => p.category === 'studio-pottery').length,
      image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
      region: 'Khurja Guild'
    },
    {
      id: 'col-4',
      title: 'Saharanpur Woodcraft',
      slug: 'custom-art-woodcraft',
      count: products.filter(p => p.category === 'custom-art-woodcraft').length,
      image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80',
      region: 'UP Wood Guild'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-8 sm:space-y-12 pb-28 md:pb-12 animate-fade-in">
      
      {/* Refined Hero Banner */}
      <div className="mt-2 mb-4 sm:mt-4 sm:mb-6 bg-obsidian-900 text-cream-100 p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl relative overflow-hidden border border-gold-500/30 shadow-xl">
        <div className="max-w-2xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-500/20 text-gold-400 text-[10px] sm:text-xs font-bold rounded-full border border-gold-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>100% HANDCRAFTED NON-APPAREL</span>
          </div>
          <h1 className="font-serif text-xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-wide">
            Artisan Handcrafted Showcase
          </h1>
          <p className="text-xs sm:text-sm text-cream-300/80 font-sans leading-relaxed hidden sm:block">
            Discover handmade wooden toys, solid brass engraved keychains, studio pottery, and custom woodcraft directly from certified artisan guilds.
          </p>
        </div>
      </div>

      {/* Heritage Craft Realms Highlight Cards */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-gold-600" />
            <h2 className="font-serif text-base sm:text-xl font-bold text-obsidian-900">
              Heritage Craft Collections
            </h2>
          </div>
          <button 
            onClick={() => setCurrentView('shop')}
            className="text-xs font-bold text-gold-700 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          {craftCollections.map(col => (
            <div 
              key={col.id}
              onClick={() => {
                setSelectedCategory(col.slug);
                setCurrentView('shop');
              }}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer border border-cream-300 shadow-sm hover:shadow-luxury transition-all duration-300"
            >
              <img 
                src={col.image} 
                alt={col.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian-900/90 via-obsidian-900/40 to-transparent p-3 flex flex-col justify-end">
                <span className="text-[8px] sm:text-[9px] font-bold text-gold-400 uppercase tracking-widest block">
                  {col.region}
                </span>
                <h3 className="font-serif font-bold text-xs sm:text-sm text-cream-100 leading-tight">
                  {col.title}
                </h3>
                <span className="text-[9px] text-cream-300/80 font-semibold mt-0.5">
                  {col.count} Artifacts
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Category Filter Horizontal Scroll Track */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-serif text-base sm:text-xl font-bold text-obsidian-900">
            Browse by Craft Category
          </h2>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar px-1 py-1">
          <button 
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all shrink-0 min-h-[44px] flex items-center touch-target-min ${
              selectedCategory === 'all' 
                ? 'bg-gold-500 text-obsidian-900 shadow-sm' 
                : 'bg-white text-obsidian-900/70 hover:bg-cream-200 border border-cream-300'
            }`}
          >
            All Handcrafted ({products.length})
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all shrink-0 min-h-[44px] flex items-center touch-target-min ${
                selectedCategory === cat.slug 
                  ? 'bg-gold-500 text-obsidian-900 shadow-sm' 
                  : 'bg-white text-obsidian-900/70 hover:bg-cream-200 border border-cream-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* STRICT 2-COLUMN SIDE-BY-SIDE MOBILE GRID */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white/70 rounded-2xl p-8 text-center space-y-2 border border-cream-300">
            <p className="font-serif text-sm font-bold text-obsidian-900">No handcrafted items found in this category</p>
            <button 
              onClick={() => setSelectedCategory('all')}
              className="px-3.5 py-1.5 bg-gold-500 text-obsidian-900 rounded-xl font-bold text-xs uppercase"
            >
              Show All Items
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onQuickView={(p) => setQuickViewProduct(p)} 
              />
            ))}
          </div>
        )}
      </section>

      {/* Value Proposition Section: Why Buy Handcrafted? */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gold-700 bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/20 inline-block">
            Ethical Craft Guarantee
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold">Why Buy Handcrafted at eclipsera?</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs font-semibold">
          <div className="p-4 bg-cream-100/50 rounded-2xl space-y-2 border border-cream-300">
            <ShieldCheck className="w-6 h-6 text-gold-600 mx-auto" />
            <h3 className="font-serif font-bold text-sm">100% Authentic GI Mark</h3>
            <p className="text-obsidian-900/60 text-[11px] font-sans">Certified heritage craft origin verified by regional councils.</p>
          </div>
          <div className="p-4 bg-cream-100/50 rounded-2xl space-y-2 border border-cream-300">
            <Users className="w-6 h-6 text-gold-600 mx-auto" />
            <h3 className="font-serif font-bold text-sm">Direct Artisan Profit</h3>
            <p className="text-obsidian-900/60 text-[11px] font-sans">Zero middleman margins ensuring 100% fair trade living wages.</p>
          </div>
          <div className="p-4 bg-cream-100/50 rounded-2xl space-y-2 border border-cream-300">
            <Sparkles className="w-6 h-6 text-gold-600 mx-auto" />
            <h3 className="font-serif font-bold text-sm">Non-Toxic Organic Dyes</h3>
            <p className="text-obsidian-900/60 text-[11px] font-sans">Turmeric and indigo vegetable dyes safe for children and home.</p>
          </div>
          <div className="p-4 bg-cream-100/50 rounded-2xl space-y-2 border border-cream-300">
            <Award className="w-6 h-6 text-gold-600 mx-auto" />
            <h3 className="font-serif font-bold text-sm">Insured Doorstep Transit</h3>
            <p className="text-obsidian-900/60 text-[11px] font-sans">100% insured transit logistics with zero-plastic packaging.</p>
          </div>
        </div>
      </section>

      {/* Gift Guide & Blog Teaser Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gift Guide Teaser */}
        <div 
          onClick={() => setCurrentView('gift-guide')}
          className="bg-obsidian-900 text-cream-100 p-6 sm:p-8 rounded-3xl border border-gold-500/30 shadow-lg cursor-pointer group space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gold-400">Curated Celebrations</span>
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-white group-hover:text-gold-400 transition-colors">The Artisan Gift Guide</h3>
            <p className="text-xs text-cream-100/70 font-sans">Find personalized woodcrafts, studio pottery, and engraved brass for every milestone celebration.</p>
          </div>
          <span className="text-xs font-bold text-gold-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 uppercase tracking-wider">
            Explore Gift Ideas <ArrowRight className="w-4 h-4" />
          </span>
        </div>

        {/* Blog / Journal Preview */}
        <div 
          onClick={() => setCurrentView('blog')}
          className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-sm cursor-pointer group space-y-4 flex flex-col justify-between hover:shadow-md transition-all"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gold-700">Cultural Journal</span>
            <h3 className="font-serif font-bold text-xl sm:text-2xl group-hover:text-gold-600 transition-colors">Stories Behind the Craft</h3>
            <p className="text-xs text-obsidian-900/70 font-sans">Read about 200-year-old Channapatna lathe turning and Madhubani natural ink painting techniques.</p>
          </div>
          <span className="text-xs font-bold text-gold-700 group-hover:translate-x-1 transition-transform flex items-center gap-1 uppercase tracking-wider">
            Read Journal Articles <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Trust Badges Footer Strip */}
      <div className="bg-cream-200/60 p-4 rounded-2xl border border-cream-300 flex flex-col sm:flex-row sm:flex-wrap items-center justify-around gap-3 sm:gap-4 text-center text-xs font-bold text-obsidian-900">
        <span>🔒 100% Encrypted Payments</span>
        <span className="text-cream-300 hidden sm:inline">•</span>
        <span>🚚 Free Insured Shipping &gt; ₹1,000</span>
        <span className="text-cream-300 hidden sm:inline">•</span>
        <span>🔄 7-Day Hassle-Free Returns</span>
        <span className="text-cream-300 hidden sm:inline">•</span>
        <span>🌿 GI Verified Handcrafted</span>
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
export default HomeView;

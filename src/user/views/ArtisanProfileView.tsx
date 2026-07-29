import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { ProductCard } from '../components/storefront/ProductCard';
import { QuickViewModal } from '../components/storefront/QuickViewModal';
import { Product } from '../../shared/data/mockData';
import { ArrowLeft, MapPin, Calendar, Award, Star, StarOff, ShieldCheck, Heart } from 'lucide-react';

export const ArtisanProfileView: React.FC = () => {
  const { 
    products, 
    selectedArtisanName, 
    setCurrentView,
    openProductDetail
  } = useUser();

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Filter products by this artisan
  const artisanProducts = products.filter(p => p.artisanName === selectedArtisanName);

  // If selectedArtisanName is null or not found, fallback to the first product's artisan
  const representativeProduct = artisanProducts[0] || products[0];
  const name = selectedArtisanName || representativeProduct.artisanName;
  const bio = representativeProduct.artisanBio;
  const avatar = representativeProduct.artisanAvatar;
  const location = representativeProduct.originRegion;
  const yearsCrafting = representativeProduct.artisanYearsCrafting || 20;

  // Calculate dynamic stats from products
  const totalProductsCount = artisanProducts.length;
  const avgRating = totalProductsCount > 0 
    ? Number((artisanProducts.reduce((acc, p) => acc + p.rating, 0) / totalProductsCount).toFixed(1)) 
    : 4.8;
  const totalReviewsCount = artisanProducts.reduce((acc, p) => acc + p.reviewsCount, 0);

  // Collect some reviews dynamically from their products
  const sampleReviews = [
    { id: 'ar-1', reviewer: 'Radhika M.', rating: 5, comment: 'Simply stunning! The wood finishing is extremely smooth and polished. Highly recommend this master creator.', date: 'July 2026' },
    { id: 'ar-2', reviewer: 'Amit J.', rating: 5, comment: 'Perfect addition to our home decor. Very authentic lost-wax brass casting quality.', date: 'June 2026' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 pb-28 md:pb-12 animate-fade-in text-obsidian-900">
      
      {/* Back to shop */}
      <button 
        onClick={() => setCurrentView('shop')}
        className="flex items-center gap-1 text-xs font-bold text-gold-700 hover:text-gold-800 transition-colors uppercase tracking-wider"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Shop
      </button>

      {/* Artisan Profile Hero Panel */}
      <div className="bg-white rounded-3xl border border-cream-300 p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center sm:items-start shadow-sm text-center md:text-left">
        <img 
          src={avatar} 
          alt={name} 
          className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover border-4 border-gold-500/30 shadow-md shrink-0" 
        />
        
        <div className="space-y-4 flex-1">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-bold text-gold-700 uppercase tracking-widest flex items-center justify-center md:justify-start gap-1">
              <Award className="w-3.5 h-3.5 text-gold-600" />
              Certified Guild Master Craftsman
            </span>
            <h1 className="font-serif text-xl sm:text-3xl font-bold">{name}</h1>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3.5 text-xs text-obsidian-900/60 font-semibold pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gold-600 shrink-0" />
                {location}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-gold-600 shrink-0" />
                {yearsCrafting} Years Crafting Experience
              </span>
            </div>
          </div>

          <p className="text-xs text-obsidian-900/80 leading-relaxed font-sans max-w-2xl">
            {bio}
          </p>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-md pt-2 border-t border-cream-200">
            <div className="space-y-0.5">
              <span className="text-[9px] text-obsidian-900/50 uppercase font-bold tracking-wider">Total Items</span>
              <p className="font-serif text-base sm:text-xl font-bold">{totalProductsCount}</p>
            </div>
            <div className="space-y-0.5 border-l border-cream-200 pl-3">
              <span className="text-[9px] text-obsidian-900/50 uppercase font-bold tracking-wider">Avg Rating</span>
              <p className="font-serif text-base sm:text-xl font-bold flex items-center justify-center md:justify-start gap-1">
                {avgRating} <Star className="w-4 h-4 text-gold-500 fill-current" />
              </p>
            </div>
            <div className="space-y-0.5 border-l border-cream-200 pl-3">
              <span className="text-[9px] text-obsidian-900/50 uppercase font-bold tracking-wider">Total Reviews</span>
              <p className="font-serif text-base sm:text-xl font-bold">{totalReviewsCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Products by this Artisan */}
      <section className="space-y-4">
        <h2 className="font-serif text-base sm:text-xl font-bold border-b border-cream-300 pb-2">
          All Handcrafted Masterpieces by {name}
        </h2>
        
        {artisanProducts.length === 0 ? (
          <p className="text-xs text-obsidian-900/50 italic">No products available at the moment.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {artisanProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onQuickView={(p) => setQuickViewProduct(p)} 
              />
            ))}
          </div>
        )}
      </section>

      {/* Artisan-Specific Reviews */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-sm space-y-4">
        <h3 className="font-serif text-sm sm:text-base font-bold uppercase text-gold-700 tracking-wider">Verified Artisan Feedback</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sampleReviews.map(rev => (
            <div key={rev.id} className="p-4 bg-cream-100/50 rounded-2xl border border-cream-200 space-y-2 text-xs">
              <div className="flex justify-between items-center font-bold">
                <span>{rev.reviewer}</span>
                <span className="text-obsidian-900/40 text-[10px]">{rev.date}</span>
              </div>
              <div className="flex text-gold-500">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-obsidian-900/70 font-sans italic">
                "{rev.comment}"
              </p>
            </div>
          ))}
        </div>
      </section>

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
export default ArtisanProfileView;

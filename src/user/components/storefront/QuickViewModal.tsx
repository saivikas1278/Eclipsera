import React, { useState } from 'react';
import { Product } from '../../../shared/data/mockData';
import { useUser } from '../../context/UserContext';
import { X, ShieldCheck, ShoppingBag, Heart, Star, Check } from 'lucide-react';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addToCart, openProductDetail, isInWishlist, toggleWishlist } = useUser();
  const [selectedVariantId, setSelectedVariantId] = useState<string>(product?.variants[0]?.id || '');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!product) return null;

  const activeVariant = product.variants.find(v => v.id === selectedVariantId) || product.variants[0];
  const currentPrice = product.basePrice + (activeVariant?.additionalPrice || 0);
  const inWishlist = isInWishlist(product.id);

  return (
    <div className="fixed inset-0 z-50 bg-obsidian-900/70 backdrop-blur-mobile flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-cream-100 w-full max-w-full sm:max-w-4xl rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-black/40 overflow-y-auto border border-gold-500/30 relative max-h-[92vh] flex flex-col md:flex-row box-border text-obsidian-900">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2.5 bg-cream-200/80 hover:bg-gold-500 hover:text-white rounded-full transition-colors text-obsidian-900 min-w-[44px] min-h-[44px] flex items-center justify-center touch-target-min"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Gallery */}
        <div className="md:w-1/2 p-4 sm:p-6 bg-cream-200/50 flex flex-col justify-between">
          <div className="aspect-[4/5] rounded-xl overflow-hidden border border-cream-300 relative shadow-inner">
            <img 
              src={product.images[activeImageIndex] || product.images[0]} 
              alt={product.title} 
              className="w-full h-full object-cover object-center"
            />
            {product.silkMarkCertified && (
              <span className="absolute top-3 left-3 px-3 py-1 bg-obsidian-900/90 text-gold-400 text-xs font-bold rounded-full border border-gold-500/30 flex items-center gap-1.5 backdrop-blur-md">
                <ShieldCheck className="w-4 h-4" />
                Silk Mark Certified
              </span>
            )}
          </div>

          {/* Thumbnails */}
          <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${idx === activeImageIndex ? 'border-gold-500 scale-95' : 'border-cream-300 opacity-70'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Details */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs font-bold text-gold-700 uppercase tracking-widest">
              {product.craftTechnique} • {product.originRegion}
            </span>

            <h2 className="font-serif text-2xl font-bold text-obsidian-900 mt-1 leading-snug">
              {product.title}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex text-gold-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-cream-300'}`} />
                ))}
              </div>
              <span className="text-xs text-obsidian-900/60 font-semibold">{product.rating} ({product.reviewsCount} customer reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-4">
              <span className="font-serif text-3xl font-bold text-obsidian-900">
                ₹{currentPrice.toLocaleString()}
              </span>
              {product.compareAtPrice && (
                <span className="text-sm text-obsidian-900/40 line-through">
                  ₹{product.compareAtPrice.toLocaleString()}
                </span>
              )}
            </div>

            <p className="text-xs text-obsidian-900/80 leading-relaxed mt-4 line-clamp-3">
              {product.description}
            </p>

            {/* Variant Selector */}
            <div className="mt-6 space-y-3">
              <label className="text-xs font-bold text-obsidian-900 uppercase tracking-wider block">
                Select Shade / Variant:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map(v => (
                  <button 
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                      v.id === (activeVariant?.id || '')
                        ? 'border-gold-500 bg-gold-500/10 text-obsidian-900 font-bold shadow-sm'
                        : 'border-cream-300 bg-white text-obsidian-900/80 hover:border-cream-400'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: v.colorHex }} />
                    <span>{v.colorName}</span>
                    {v.id === (activeVariant?.id || '') && <Check className="w-3.5 h-3.5 text-gold-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Artisan Bio Card */}
            <div className="mt-6 p-3.5 bg-cream-200/60 rounded-xl border border-cream-300 flex items-center gap-3">
              <img src={product.artisanAvatar} alt={product.artisanName} className="w-10 h-10 rounded-full object-cover border border-gold-500" />
              <div>
                <p className="text-xs font-bold text-obsidian-900">Crafted by {product.artisanName}</p>
                <p className="text-[11px] text-obsidian-900/60 leading-tight">{product.artisanBio}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 border-t border-cream-300 pt-6">
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  addToCart(product, activeVariant?.id || product.variants[0].id);
                  onClose();
                }}
                className="flex-1 bg-obsidian-900 text-cream-100 hover:bg-gold-600 hover:text-obsidian-900 py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-md min-h-[48px] touch-target-min"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Craft Bag
              </button>

              <button 
                onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 rounded-xl border transition-all min-w-[48px] min-h-[48px] flex items-center justify-center touch-target-min ${inWishlist ? 'bg-terracotta-500 text-white border-terracotta-500' : 'bg-white border-cream-300 text-obsidian-900 hover:border-gold-500'}`}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            <button 
              onClick={() => {
                onClose();
                openProductDetail(product.slug);
              }}
              className="w-full text-center text-xs font-semibold text-gold-700 hover:underline pt-1"
            >
              View Full Specs, Fabric Care & Weaver Certificate →
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

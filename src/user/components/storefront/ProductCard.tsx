import React, { useState } from 'react';
import { Product } from '../../../shared/data/mockData';
import { useUser } from '../../context/UserContext';
import { Heart, ShieldCheck, Eye, Plus, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { openProductDetail, addToCart, isInWishlist, toggleWishlist } = useUser();
  const [isHovered, setIsHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const primaryVariant = product.variants[0];
  const inWishlist = isInWishlist(product.id);

  // Discount percentage calculation
  const discountPercent = product.compareAtPrice 
    ? Math.round(((product.compareAtPrice - product.basePrice) / product.compareAtPrice) * 100) 
    : 0;

  return (
    <div 
      className="group relative bg-white rounded-2xl overflow-hidden border border-cream-300 shadow-sm hover:-translate-y-1 hover:shadow-luxury transition-all duration-300 flex flex-col justify-between h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* Product Image Container (Identical Aspect Ratio aspect-square for all cards) */}
      <div 
        className="relative aspect-square bg-cream-200 overflow-hidden cursor-pointer shrink-0 w-full" 
        onClick={() => openProductDetail(product.slug)}
      >
        {/* Image Skeleton Loader */}
        {!imgLoaded && (
          <div className="absolute inset-0 bg-cream-300 animate-pulse rounded-t-2xl" />
        )}

        <img 
          src={isHovered && product.images[1] ? product.images[1] : product.images[0]} 
          alt={product.title} 
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Compact GI Craft Badge (Top-Left) */}
        <div className="absolute top-2 left-2 z-10">
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-obsidian-900/90 text-gold-400 text-[8px] sm:text-[10px] font-bold tracking-wider uppercase rounded-full backdrop-blur-md shadow-sm border border-gold-500/30">
            <ShieldCheck className="w-2.5 h-2.5 text-gold-400 shrink-0" />
            GI CRAFT
          </span>
        </div>

        {/* Floating Wishlist Heart Button (Top-Right) */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2 right-2 p-1 rounded-full transition-all duration-200 z-10 backdrop-blur-md min-w-[32px] min-h-[32px] flex items-center justify-center ${
            inWishlist 
              ? 'bg-terracotta-500 text-white shadow-md' 
              : 'bg-white/90 text-obsidian-900 hover:bg-white hover:text-terracotta-500 shadow-sm border border-cream-300'
          }`}
          aria-label="Save to Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button Hover Overlay (Desktop) */}
        {onQuickView && (
          <div className="absolute inset-x-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex z-10">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              className="w-full bg-cream-100/95 text-obsidian-900 hover:bg-gold-500 hover:text-obsidian-900 py-1.5 rounded-xl text-xs font-semibold tracking-wider flex items-center justify-center gap-1 shadow-lg backdrop-blur-md transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              Quick View
            </button>
          </div>
        )}
      </div>

      {/* Product Details Section */}
      <div className="p-2.5 sm:p-3.5 flex-1 flex flex-col justify-between space-y-1.5 text-obsidian-900">
        
        <div>
          {/* Craft Technique (Clean single-line truncate) */}
          <p className="text-[9px] sm:text-[10px] font-bold text-gold-700 uppercase tracking-widest truncate block">
            {product.craftTechnique}
          </p>

          {/* Title (Limited to 2 lines line-clamp-2 text-xs font-semibold) */}
          <h3 
            onClick={() => openProductDetail(product.slug)}
            className="font-serif font-semibold text-xs sm:text-sm text-obsidian-900 hover:text-gold-600 cursor-pointer transition-colors line-clamp-2 leading-snug mt-0.5"
          >
            {product.title}
          </h3>

          {/* Artisan Name */}
          <p className="text-[10px] text-obsidian-900/60 font-semibold mt-0.5">By {product.artisanName}</p>

          {/* Rating Row */}
          <div className="flex items-center gap-1 mt-1">
            <div className="flex text-gold-500">
              <Star className="w-3 h-3 fill-current text-gold-500" />
            </div>
            <span className="text-[10px] font-bold">{product.rating}</span>
            <span className="text-[9px] text-obsidian-900/50 font-medium">({product.reviewsCount})</span>
          </div>
        </div>

        {/* Pricing & Fast Quick-Add Button Footer */}
        <div className="mt-auto pt-2 border-t border-cream-200 flex items-center justify-between gap-1">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="font-serif text-xs sm:text-sm font-bold text-obsidian-900">
                ₹{product.basePrice.toLocaleString()}
              </span>
              {product.compareAtPrice && (
                <span className="text-[9px] sm:text-[10px] text-obsidian-900/40 line-through font-mono">
                  ₹{product.compareAtPrice.toLocaleString()}
                </span>
              )}
            </div>
            {discountPercent > 0 && (
              <span className="text-[9px] text-terracotta-500 font-bold block">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Fast Quick Add-to-Cart Button */}
          <button 
            onClick={() => addToCart(product, primaryVariant?.id || 'v1')}
            className="bg-obsidian-900 text-cream-100 hover:bg-gold-600 hover:text-obsidian-900 p-2 rounded-xl transition-all shadow-sm flex items-center justify-center min-w-[34px] min-h-[34px] shrink-0"
            title="Fast Add to Cart"
            aria-label="Add to cart"
          >
            <Plus className="w-4 h-4 text-gold-400" />
          </button>
        </div>

      </div>

    </div>
  );
};
export default ProductCard;

import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { ShoppingBag, ArrowRight, Trash2, Tag, Star, Gift, Sparkles } from 'lucide-react';
import { Product } from '../../shared/data/mockData';

export const CartView: React.FC = () => {
  const { 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    subtotal, 
    mrpTotal,
    savingsFromMRP,
    discountTotal, 
    totalSavings,
    shippingFee, 
    taxTotal, 
    grandTotal, 
    appliedCoupon, 
    applyCoupon, 
    removeCoupon,
    setCurrentView,
    products,
    openProductDetail
  } = useUser();

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState('');

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponMsg(res.message);
    if (res.success) setCouponInput('');
  };

  // Up-sell recommendations: filter out products currently in cart
  const cartProductIds = cart.map(item => item.product.id);
  const suggestedProducts = products.filter(p => !cartProductIds.includes(p.id)).slice(0, 3);

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4 animate-fade-in text-obsidian-900">
        <div className="w-16 h-16 bg-cream-200 rounded-full flex items-center justify-center mx-auto text-gold-600">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-xl sm:text-2xl font-bold">Your shopping bag is empty</h2>
        <p className="text-xs text-obsidian-900/60 max-w-sm mx-auto font-sans leading-relaxed">
          Explore our GI-certified handcrafted stacking toys, engraved brass keychains, and terracotta vessels.
        </p>
        <button 
          onClick={() => setCurrentView('shop')}
          className="px-6 py-3 bg-obsidian-900 text-cream-100 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gold-600 hover:text-obsidian-900 transition-all font-sans"
        >
          Browse Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 space-y-8 pb-28 md:pb-12 animate-fade-in text-obsidian-900">
      
      {/* Page Title */}
      <div>
        <span className="text-xs font-bold text-gold-700 uppercase tracking-widest block">SHOPPING FLOW</span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold">Your Shopping Cart</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Cart items list */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="bg-white rounded-3xl border border-cream-300 divide-y divide-cream-200 overflow-hidden shadow-sm">
            {cart.map(item => (
              <div key={item.variantId} className="p-4 sm:p-5 flex gap-4 text-xs">
                
                {/* Product Image */}
                <div 
                  onClick={() => openProductDetail(item.product.slug)}
                  className="w-20 h-24 sm:w-24 sm:h-28 bg-cream-200 rounded-xl overflow-hidden cursor-pointer shrink-0 border border-cream-300"
                >
                  <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <h3 
                        onClick={() => openProductDetail(item.product.slug)}
                        className="font-serif font-bold text-sm hover:text-gold-700 cursor-pointer truncate"
                      >
                        {item.product.title}
                      </h3>
                      <button 
                        onClick={() => removeFromCart(item.variantId)}
                        className="p-2 text-obsidian-900/40 hover:text-terracotta-500 rounded-lg hover:bg-cream-100 transition-all shrink-0 touch-target-min min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-[10px] text-gold-700 font-bold uppercase tracking-wider">
                      Shade: {item.colorName} {item.size ? `• Size: ${item.size}` : ''}
                    </p>

                    {/* Personalization Note Display */}
                    {item.product.title.includes('[Engraving:') && (
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gold-500/10 text-gold-800 rounded font-semibold text-[10px]">
                        <Gift className="w-3 h-3 text-gold-600" />
                        <span>Custom Engraving: {item.product.title.split('[Engraving:')[1].replace(']', '')}</span>
                      </div>
                    )}
                  </div>

                  {/* Quantity Stepper and Price Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-cream-200">
                    <div className="flex items-center border border-cream-300 rounded-xl bg-cream-100">
                      <button 
                        onClick={() => updateCartQuantity(item.variantId, item.quantity - 1)} 
                        className="px-3 py-2 font-bold text-obsidian-900/60 hover:text-gold-600 min-h-[44px] min-w-[44px] flex items-center justify-center touch-target-min"
                      >
                        -
                      </button>
                      <span className="px-3 font-bold text-obsidian-900 text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateCartQuantity(item.variantId, item.quantity + 1)} 
                        className="px-3 py-2 font-bold text-obsidian-900/60 hover:text-gold-600 min-h-[44px] min-w-[44px] flex items-center justify-center touch-target-min"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-baseline gap-1.5 font-mono">
                      <span className="font-bold text-obsidian-900 text-xs sm:text-sm">
                        ₹{(item.unitPrice * item.quantity).toLocaleString()}
                      </span>
                      {item.product.compareAtPrice && (
                        <span className="text-[10px] text-obsidian-900/40 line-through">
                          ₹{((item.product.compareAtPrice) * item.quantity).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            ))}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <button 
              onClick={() => setCurrentView('shop')}
              className="text-xs font-bold text-gold-700 hover:text-gold-800 transition-colors uppercase tracking-wider flex items-center gap-1 font-sans"
            >
              ← Continue Shopping
            </button>
          </div>

        </div>

        {/* Right Column: Checkout Breakdown & Coupon Codes */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-cream-100/95 backdrop-blur-mobile p-6 rounded-3xl border border-cream-300 space-y-4 shadow-xl shadow-black/10">
            <h3 className="font-serif text-base font-bold border-b border-cream-300 pb-3">Cost Breakdown</h3>

            {/* Total savings callout */}
            {totalSavings > 0 && (
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl text-[11px] font-bold text-center flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                You are saving ₹{totalSavings.toLocaleString()} on this order!
              </div>
            )}

            {/* Coupon Code section */}
            <form onSubmit={handleCouponSubmit} className="space-y-1">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Promo Coupon Code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs uppercase font-medium focus:outline-none focus:border-gold-500 text-obsidian-900"
                />
                <button type="submit" className="bg-obsidian-900 text-cream-100 px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-gold-600 hover:text-obsidian-900 transition-all shrink-0">
                  Apply
                </button>
              </div>
              {couponMsg && <p className="text-[11px] text-gold-700 font-semibold">{couponMsg}</p>}
              
              {appliedCoupon && (
                <div className="flex items-center justify-between p-2 bg-gold-500/15 border border-gold-500/30 rounded-xl text-[10px] mt-2">
                  <span className="font-bold text-gold-800 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-gold-600" />
                    Promo: {appliedCoupon.code}
                  </span>
                  <button type="button" onClick={removeCoupon} className="text-terracotta-500 hover:underline font-bold">Remove</button>
                </div>
              )}
            </form>

            {/* Financial breakdown values */}
            <div className="space-y-1.5 text-xs text-obsidian-900/90 font-medium border-t border-cream-300 pt-3">
              <div className="flex justify-between">
                <span>Subtotal (MRP)</span>
                <span>₹{mrpTotal.toLocaleString()}</span>
              </div>
              {savingsFromMRP > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Catalog Discount</span>
                  <span>-₹{savingsFromMRP.toLocaleString()}</span>
                </div>
              )}
              {discountTotal > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Promo Code Discount</span>
                  <span>-₹{discountTotal.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST (5% Handcrafted)</span>
                <span>₹{taxTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span>{shippingFee === 0 ? <span className="text-gold-700 font-bold">FREE</span> : `₹${shippingFee}`}</span>
              </div>
              
              <div className="flex justify-between font-serif text-base font-bold text-obsidian-900 pt-2 border-t border-cream-300">
                <span>Total Amount</span>
                <span className="text-gold-700">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout forward triggers */}
            <button
              onClick={() => setCurrentView('checkout')}
              className="w-full bg-obsidian-900 text-cream-100 hover:bg-gold-500 hover:text-obsidian-900 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all min-h-[52px] touch-target-min"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Suggested Products upsell panel */}
      {suggestedProducts.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-cream-300">
          <h3 className="font-serif text-lg font-bold">You May Also Like</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {suggestedProducts.map(p => (
              <div 
                key={p.id}
                onClick={() => openProductDetail(p.slug)}
                className="bg-white border border-cream-300 rounded-2xl p-3.5 space-y-2 hover:-translate-y-1 hover:shadow-luxury cursor-pointer transition-all duration-300"
              >
                <div className="aspect-square bg-cream-200 rounded-xl overflow-hidden">
                  <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-[9px] text-gold-700 font-bold uppercase tracking-wider block truncate">{p.craftTechnique}</span>
                  <h4 className="font-serif font-bold text-xs line-clamp-1 mt-0.5">{p.title}</h4>
                  <div className="flex justify-between items-baseline pt-1 mt-1 border-t border-cream-200">
                    <span className="font-bold text-xs">₹{p.basePrice.toLocaleString()}</span>
                    <div className="flex items-center gap-0.5 text-[9px] font-bold">
                      <Star className="w-3 h-3 text-gold-500 fill-current" />
                      <span>{p.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
export default CartView;

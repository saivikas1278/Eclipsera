import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { X, ShoppingBag, Trash2, Tag, ArrowRight, Truck, Sparkles, Plus, Check } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart, 
    addToCart,
    products,
    removeFromCart, 
    updateCartQuantity,
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
    freeShippingThreshold,
    setCurrentView
  } = useUser();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isCartOpen) return null;

  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountRemainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  // Cross-sell suggestions (Items not in cart)
  const crossSellItem = products.find(p => !cart.some(ci => ci.product.id === p.id)) || products[0];

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setCurrentView('checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-obsidian-900/60 backdrop-blur-sm animate-fade-in max-w-full">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

      {/* Drawer Panel Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-full max-w-full sm:max-w-md bg-cream-100 shadow-2xl flex flex-col border-l border-gold-500/30 overflow-x-hidden box-border text-obsidian-900">
          
          {/* 1. Header & Close Button */}
          <div className="flex justify-between items-center px-4 py-3.5 w-full bg-obsidian-900 text-cream-100 border-b border-gold-500/20 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <ShoppingBag className="w-5 h-5 text-gold-400 shrink-0" />
              <h3 className="font-serif text-sm sm:text-base font-bold tracking-wider truncate">
                Your Shopping Cart ({cart.reduce((a, b) => a + b.quantity, 0)})
              </h3>
            </div>
            <button 
              onClick={() => setIsCartOpen(false)} 
              className="p-1.5 text-cream-300 hover:text-gold-400 transition-colors shrink-0 rounded-lg"
              aria-label="Close Cart Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Total Savings Callout Banner */}
          {totalSavings > 0 && (
            <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-sm shrink-0 w-full">
              <Sparkles className="w-4 h-4 text-gold-300 shrink-0" />
              <span className="truncate">You save ₹{totalSavings.toLocaleString()} on this order!</span>
            </div>
          )}

          {/* Free Shipping Progress Indicator */}
          <div className="bg-cream-200 p-3.5 border-b border-cream-300 shrink-0 w-full box-border">
            {subtotal >= freeShippingThreshold ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-gold-700">
                <Truck className="w-4 h-4 text-gold-600 shrink-0" />
                <span className="truncate">You unlocked FREE Express Insured Shipping!</span>
              </div>
            ) : (
              <div className="space-y-1 text-xs">
                <div className="flex justify-between font-medium text-obsidian-900 gap-1">
                  <span className="truncate">Add ₹{amountRemainingForFreeShipping.toLocaleString()} for Free Delivery</span>
                  <span className="font-bold text-gold-700 shrink-0">{freeShippingProgress}%</span>
                </div>
                <div className="w-full bg-cream-300 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gold-500 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Cart Item List */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 space-y-3.5 w-full box-border">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-4 px-4">
                <div className="w-16 h-16 bg-cream-200 rounded-full flex items-center justify-center mx-auto text-gold-600">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-lg font-semibold text-obsidian-900">Your cart is empty</h4>
                <p className="text-xs text-obsidian-900/60 max-w-xs mx-auto">
                  Discover handcrafted wooden toys, brass keychains, studio pottery, and custom art.
                </p>
                <button 
                  onClick={() => { setIsCartOpen(false); setCurrentView('shop'); }}
                  className="mt-2 px-5 py-2.5 bg-obsidian-900 text-cream-100 rounded-xl font-semibold text-xs tracking-wider hover:bg-gold-600 hover:text-obsidian-900 transition-all"
                >
                  Browse Handcrafted Catalog
                </button>
              </div>
            ) : (
              <>
                {cart.map(item => (
                  <div key={item.variantId} className="w-full box-border p-3.5 bg-white rounded-xl border border-cream-300 shadow-sm flex gap-3 overflow-hidden">
                    <img 
                      src={item.product.images[0]} 
                      alt={item.product.title} 
                      className="w-16 h-16 object-cover rounded-lg shrink-0 border border-cream-200"
                    />

                    <div className="flex-1 min-w-0 flex flex-col justify-between space-y-1.5 overflow-hidden">
                      <div>
                        <h4 className="font-serif text-xs font-bold text-obsidian-900 leading-snug truncate">
                          {item.product.title}
                        </h4>
                        <p className="text-[11px] text-gold-700 font-semibold truncate mt-0.5">
                          {item.colorName}
                        </p>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-xs font-bold text-obsidian-900">
                            ₹{item.unitPrice.toLocaleString()}
                          </span>
                          {item.product.compareAtPrice && (
                            <span className="text-[10px] text-obsidian-900/40 line-through">
                              ₹{item.product.compareAtPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-cream-200">
                        <div className="flex items-center border border-cream-300 rounded-lg bg-cream-100">
                          <button 
                            onClick={() => updateCartQuantity(item.variantId, item.quantity - 1)}
                            className="px-2 py-0.5 text-xs font-bold hover:text-gold-600"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-bold text-obsidian-900">{item.quantity}</span>
                          <button 
                            onClick={() => updateCartQuantity(item.variantId, item.quantity + 1)}
                            className="px-2 py-0.5 text-xs font-bold hover:text-gold-600"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <button 
                          onClick={() => removeFromCart(item.variantId)}
                          className="text-terracotta-500 hover:text-terracotta-600 text-xs font-semibold flex items-center gap-1 shrink-0 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 1-Click In-Cart Cross-Sell Recommendation */}
                {crossSellItem && (
                  <div className="p-3 bg-gold-500/10 border border-gold-500/30 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-obsidian-900 uppercase text-[10px]">Complete Your Collection</span>
                      <span className="text-gold-700 font-bold text-[10px]">Add for ₹{crossSellItem.basePrice.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <img src={crossSellItem.images[0]} alt={crossSellItem.title} className="w-10 h-10 object-cover rounded-lg shrink-0 border border-cream-300" />
                        <div className="min-w-0">
                          <p className="font-serif font-bold text-xs text-obsidian-900 truncate">{crossSellItem.title}</p>
                          <p className="text-[10px] text-gold-700 font-semibold">{crossSellItem.craftTechnique}</p>
                        </div>
                      </div>

                      <button 
                        onClick={() => addToCart(crossSellItem, crossSellItem.variants[0].id, 1)}
                        className="px-3 py-1.5 bg-obsidian-900 text-cream-100 hover:bg-gold-600 hover:text-obsidian-900 rounded-lg font-bold text-[11px] shrink-0 flex items-center gap-1 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5 text-gold-400" />
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 3. Drawer Footer: Promo Code & Price Summary */}
          {cart.length > 0 && (
            <div className="p-4 bg-cream-200 border-t border-cream-300 space-y-3 shrink-0 w-full box-border">
              
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-gold-500/10 border border-gold-500/40 rounded-xl text-xs w-full">
                  <div className="flex items-center gap-1.5 text-gold-700 font-semibold min-w-0">
                    <Tag className="w-4 h-4 shrink-0" />
                    <span className="truncate">{appliedCoupon.code} ({appliedCoupon.discountType === 'PERCENT' ? `${appliedCoupon.discountValue}% OFF` : `₹${appliedCoupon.discountValue} OFF`})</span>
                  </div>
                  <button onClick={removeCoupon} className="text-terracotta-500 hover:underline text-[11px] font-bold shrink-0 ml-2">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1 w-full">
                  <div className="flex items-center gap-2 w-full">
                    <input 
                      type="text" 
                      placeholder="Promo code (CRAFT10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 min-w-0 w-full px-3 py-2 text-xs rounded-xl border border-cream-300 uppercase font-medium focus:outline-none focus:border-gold-500 bg-white"
                    />
                    <button 
                      type="submit" 
                      className="shrink-0 px-3.5 py-2 text-xs font-semibold whitespace-nowrap bg-obsidian-900 text-cream-100 hover:bg-gold-600 hover:text-obsidian-900 rounded-xl transition-all"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-terracotta-500 font-medium">{couponError}</p>}
                </form>
              )}

              <div className="space-y-1.5 text-xs font-medium border-t border-cream-300 pt-2.5 w-full">
                <div className="flex justify-between items-center text-xs w-full py-1.5">
                  <span className="text-obsidian-900/70">Subtotal (MRP)</span>
                  <span className="font-semibold">₹{mrpTotal.toLocaleString()}</span>
                </div>
                {savingsFromMRP > 0 && (
                  <div className="flex justify-between items-center text-xs w-full py-1.5 text-emerald-700 font-semibold">
                    <span>MRP Discount</span>
                    <span>-₹{savingsFromMRP.toLocaleString()}</span>
                  </div>
                )}
                {discountTotal > 0 && (
                  <div className="flex justify-between items-center text-xs w-full py-1.5 text-emerald-700 font-semibold">
                    <span>Coupon Savings</span>
                    <span>-₹{discountTotal.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs w-full py-1.5">
                  <span className="text-obsidian-900/70">Estimated Delivery</span>
                  <span className="font-semibold">{shippingFee === 0 ? <span className="text-gold-700 font-bold">FREE</span> : `₹${shippingFee}`}</span>
                </div>
                <div className="flex justify-between items-center text-xs w-full py-1.5">
                  <span className="text-obsidian-900/70">GST (5% Handcrafted)</span>
                  <span className="font-semibold">₹{taxTotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center font-serif text-sm sm:text-base font-bold text-obsidian-900 pt-2 border-t border-cream-300 w-full">
                  <span>Grand Total</span>
                  <span className="text-gold-700">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 rounded-xl font-bold text-center bg-obsidian-900 text-cream-100 hover:bg-gold-600 hover:text-obsidian-900 transition-all text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

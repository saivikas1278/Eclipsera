import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Search, Package, Truck, CheckCircle2, AlertCircle, ShoppingBag, ArrowRight, Clock, FileText, MapPin } from 'lucide-react';

export const TrackOrderView: React.FC = () => {
  const { orders, addToCart, products, setCurrentView } = useUser();
  
  const [orderQuery, setOrderQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<any | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;
    const found = orders.find(o => 
      o.orderNumber.toLowerCase() === orderQuery.trim().toLowerCase() ||
      o.id.toLowerCase() === orderQuery.trim().toLowerCase()
    );
    setSearchedOrder(found || null);
    setHasSearched(true);
  };

  const getStepProgress = (status: string) => {
    switch (status) {
      case 'PENDING': return 1;
      case 'PAYMENT_CONFIRMED': return 2;
      case 'PROCESSING': return 2;
      case 'SHIPPED': return 3;
      case 'DELIVERED': return 4;
      default: return 1;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10 pb-28 md:pb-12 animate-fade-in">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-gold-700 uppercase tracking-widest">CUSTOMER ORDER PORTAL</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-obsidian-900">
          My Orders & Live Shipment Tracking
        </h1>
        <p className="text-xs sm:text-sm text-obsidian-900/60 leading-relaxed">
          Track shipment progress, view order invoices, or quickly re-order your favorite handcrafted items.
        </p>
      </div>

      {/* Lookup Bar */}
      <form onSubmit={handleTrackSubmit} className="bg-white/90 p-4 rounded-2xl border border-cream-300 shadow-sm flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
        <div className="relative flex-1">
          <input 
            type="text"
            placeholder="Search by Order ID (e.g. EP-10482)"
            value={orderQuery}
            onChange={(e) => setOrderQuery(e.target.value)}
            className="w-full bg-cream-100 border border-cream-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-obsidian-900 font-bold focus:outline-none focus:border-gold-500 text-obsidian-900"
          />
          <Search className="w-4 h-4 text-obsidian-900/40 absolute left-3 top-3" />
        </div>
        <button 
          type="submit"
          className="bg-obsidian-900 text-cream-100 px-6 py-2.5 rounded-xl font-bold text-xs uppercase hover:bg-gold-600 hover:text-obsidian-900 transition-all shrink-0"
        >
          Find Order
        </button>
      </form>

      {/* Searched Order Lookup Display */}
      {hasSearched && (
        searchedOrder ? (
          <div className="bg-cream-100 p-6 rounded-3xl border border-cream-300 space-y-4 shadow-md animate-fade-in text-obsidian-900">
            <div className="flex justify-between items-center border-b border-cream-300 pb-3">
              <div>
                <span className="text-[10px] font-bold text-gold-700 uppercase">SEARCH RESULT</span>
                <h3 className="font-serif font-bold text-lg text-obsidian-900">Order #{searchedOrder.orderNumber}</h3>
              </div>
              <span className="px-3 py-1 bg-gold-500 text-obsidian-900 rounded-full text-xs font-bold uppercase">
                {searchedOrder.status}
              </span>
            </div>
            <p className="text-xs text-obsidian-900/70">Placed on {new Date(searchedOrder.createdAt).toLocaleDateString()} • Total: ₹{searchedOrder.grandTotal.toLocaleString()}</p>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl text-center space-y-2 border border-cream-300">
            <AlertCircle className="w-6 h-6 text-terracotta-500 mx-auto" />
            <p className="text-xs font-bold text-obsidian-900">No order matching "{orderQuery}" found.</p>
          </div>
        )
      )}

      {/* All Recent Orders List */}
      <div className="space-y-6">
        <h2 className="font-serif text-xl font-bold text-obsidian-900 border-b border-cream-300 pb-3">
          Your Order History ({orders.length})
        </h2>

        {orders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center space-y-3 border border-cream-300">
            <Package className="w-10 h-10 text-gold-600 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-obsidian-900">No orders placed yet</h3>
            <button 
              onClick={() => setCurrentView('shop')}
              className="px-5 py-2.5 bg-obsidian-900 text-cream-100 rounded-xl font-bold text-xs uppercase"
            >
              Browse Handcrafted Catalog
            </button>
          </div>
        ) : (
          orders.map(order => {
            const currentStep = getStepProgress(order.status);
            return (
              <div key={order.id} className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-sm space-y-6 text-obsidian-900">
                
                {/* Top Info Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream-200 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-lg text-obsidian-900">Order #{order.orderNumber}</span>
                      <span className="px-2.5 py-0.5 bg-gold-500/20 text-gold-700 font-bold rounded-full text-[10px] uppercase">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-obsidian-900/60 mt-0.5">
                      Placed on {new Date(order.createdAt).toLocaleDateString()} • Payment: {order.paymentMethod}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-obsidian-900/60 block">Total Amount</span>
                    <span className="font-serif font-bold text-lg text-obsidian-900">₹{order.grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Progress Timeline Tracker */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase">Live Delivery Timeline</span>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    
                    <div className={`p-2.5 rounded-xl border transition-all ${currentStep >= 1 ? 'bg-gold-500/10 border-gold-500 text-obsidian-900 font-bold' : 'bg-cream-100 border-cream-300 text-obsidian-900/40'}`}>
                      <span className="text-[10px] uppercase block font-semibold text-gold-700">STEP 1</span>
                      <span className="text-xs">Placed</span>
                    </div>

                    <div className={`p-2.5 rounded-xl border transition-all ${currentStep >= 2 ? 'bg-gold-500/10 border-gold-500 text-obsidian-900 font-bold' : 'bg-cream-100 border-cream-300 text-obsidian-900/40'}`}>
                      <span className="text-[10px] uppercase block font-semibold text-gold-700">STEP 2</span>
                      <span className="text-xs">Packed</span>
                    </div>

                    <div className={`p-2.5 rounded-xl border transition-all ${currentStep >= 3 ? 'bg-gold-500/10 border-gold-500 text-obsidian-900 font-bold' : 'bg-cream-100 border-cream-300 text-obsidian-900/40'}`}>
                      <span className="text-[10px] uppercase block font-semibold text-gold-700">STEP 3</span>
                      <span className="text-xs">Shipped</span>
                    </div>

                    <div className={`p-2.5 rounded-xl border transition-all ${currentStep >= 4 ? 'bg-gold-500/10 border-gold-500 text-obsidian-900 font-bold' : 'bg-cream-100 border-cream-300 text-obsidian-900/40'}`}>
                      <span className="text-[10px] uppercase block font-semibold text-gold-700">STEP 4</span>
                      <span className="text-xs">Delivered</span>
                    </div>

                  </div>
                </div>

                {/* Detailed Courier Tracking Log Milestones */}
                <div className="bg-cream-100 p-4 rounded-2xl border border-cream-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-gold-600" />
                      <span className="font-serif font-bold text-xs text-obsidian-900">
                        {order.courierName ? `Courier: ${order.courierName}` : 'Express Courier Dispatch'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-gold-700 bg-gold-500/20 px-2 py-0.5 rounded-md">
                      AWB #{order.trackingNumber || 'BD83910293'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs border-l-2 border-gold-500 pl-3 ml-1 pt-1">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-gold-700 uppercase block">25 Jul • 08:30 AM</span>
                      <p className="font-semibold text-obsidian-900">In Transit — Out for Delivery from Bengaluru Hub</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-obsidian-900/50 uppercase block">24 Jul • 04:15 PM</span>
                      <p className="text-obsidian-900/70">Dispatched from Master Guild Artisan Hub (Channapatna, KA)</p>
                    </div>
                  </div>
                </div>

                {/* Item List */}
                <div className="space-y-3 pt-2">
                  {order.items.map(item => {
                    const originalProduct = products.find(p => p.id === item.productId);
                    return (
                      <div key={item.id} className="flex items-center justify-between gap-3 p-3 bg-cream-100/60 rounded-xl border border-cream-200 text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={item.image} alt="" className="w-12 h-12 object-cover rounded-lg border border-cream-300 shrink-0" />
                          <div className="min-w-0">
                            <h4 className="font-serif font-bold text-obsidian-900 truncate">{item.title}</h4>
                            <p className="text-gold-700 font-semibold text-[11px]">{item.colorName} • Qty: {item.quantity}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-mono font-bold text-obsidian-900">₹{(item.unitPrice * item.quantity).toLocaleString()}</span>
                          {originalProduct && (
                            <button 
                              onClick={() => addToCart(originalProduct, item.variantId, 1)}
                              className="px-3 py-1.5 bg-obsidian-900 text-cream-100 hover:bg-gold-600 hover:text-obsidian-900 rounded-lg font-bold text-[11px] uppercase flex items-center gap-1 transition-all"
                            >
                              <ShoppingBag className="w-3 h-3 text-gold-400" />
                              Re-order
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
export default TrackOrderView;

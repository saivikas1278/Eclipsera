import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Search, Package, Truck, CheckCircle2, AlertCircle, ShoppingBag, RotateCcw, X, Upload, ShieldCheck, Clock, Camera } from 'lucide-react';
import { trackOrderPublicAPI, requestOrderReturnAPI } from '../../shared/services/apiService';

export const TrackOrderView: React.FC = () => {
  const { orders, addToCart, products, setCurrentView, showToast } = useUser();
  
  const [orderQuery, setOrderQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<any | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  // Return Request Modal State
  const [returnOrder, setReturnOrder] = useState<any | null>(null);
  const [returnReason, setReturnReason] = useState('Damaged or defective craft item');
  const [returnComments, setReturnComments] = useState('');
  const [returnPhotos, setReturnPhotos] = useState<string[]>([]);
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;

    setIsLoadingSearch(true);
    // Local fallback check first
    const foundLocal = orders.find(o => 
      o.orderNumber.toLowerCase() === orderQuery.trim().toLowerCase() ||
      o.id.toLowerCase() === orderQuery.trim().toLowerCase() ||
      (o.awbTrackingNumber && o.awbTrackingNumber.toLowerCase() === orderQuery.trim().toLowerCase())
    );

    if (foundLocal) {
      setSearchedOrder(foundLocal);
      setHasSearched(true);
      setIsLoadingSearch(false);
      return;
    }

    // Server API query fallback
    const remoteOrder = await trackOrderPublicAPI(orderQuery.trim());
    setSearchedOrder(remoteOrder || null);
    setHasSearched(true);
    setIsLoadingSearch(false);
  };

  const getStepProgress = (status: string) => {
    switch (status) {
      case 'PENDING_FULFILLMENT':
      case 'PENDING':
      case 'PAYMENT_CONFIRMED':
        return 1;
      case 'QUALITY_CHECK':
      case 'PACKED':
        return 2;
      case 'DISPATCHED':
      case 'IN_TRANSIT':
      case 'SHIPPED':
        return 3;
      case 'OUT_FOR_DELIVERY':
      case 'DELIVERED':
        return 4;
      case 'RETURN_REQUESTED':
      case 'RETURNED':
        return 4;
      default:
        return 1;
    }
  };

  // Cloudinary direct upload mock/simulation for damage photo
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fakeUrl = URL.createObjectURL(file);
      setReturnPhotos(prev => [...prev, fakeUrl]);
    }
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnOrder) return;

    setIsSubmittingReturn(true);
    await requestOrderReturnAPI(returnOrder.id, {
      reason: returnReason,
      photos: returnPhotos,
      comments: returnComments
    });

    returnOrder.status = 'RETURN_REQUESTED';
    returnOrder.returnReason = returnReason;
    showToast(`Return request registered for Order #${returnOrder.orderNumber}!`, 'success');
    setIsSubmittingReturn(false);
    setReturnOrder(null);
  };

  const renderSingleOrderCard = (order: any) => {
    const currentStep = getStepProgress(order.status);
    const trackingLogs = order.trackingHistory || [
      { status: order.status, location: 'Central Vault', timestamp: order.createdAt, note: 'Shipment recorded' }
    ];

    const isDelivered = order.status === 'DELIVERED';
    const isReturnRequested = order.status === 'RETURN_REQUESTED' || order.status === 'RETURNED';

    return (
      <div key={order.id} className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-sm space-y-6 text-obsidian-900 animate-fade-in">
        
        {/* Top Info Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-xl text-obsidian-900">Order #{order.orderNumber}</span>
              <span className={`px-3 py-1 font-bold rounded-full text-[10px] uppercase border ${
                isDelivered ? 'bg-emerald-500/20 text-emerald-800 border-emerald-400' :
                isReturnRequested ? 'bg-orange-500/20 text-orange-800 border-orange-400' :
                'bg-gold-500/20 text-gold-800 border-gold-400'
              }`}>
                {order.status.replace(/_/g, ' ')}
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
          <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider">
            <span className="text-gold-700">Fulfillment Pipeline State</span>
            <span className="text-obsidian-900/50 font-mono">Est Delivery: {order.estimatedDeliveryDate || '3 - 5 Business Days'}</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className={`p-3 rounded-2xl border transition-all ${currentStep >= 1 ? 'bg-gold-500/10 border-gold-500 text-obsidian-900 font-bold' : 'bg-cream-100 border-cream-300 text-obsidian-900/40'}`}>
              <span className="text-[9px] uppercase block font-bold text-gold-700">STAGE 1</span>
              <span className="text-xs font-semibold">Confirmed</span>
            </div>

            <div className={`p-3 rounded-2xl border transition-all ${currentStep >= 2 ? 'bg-gold-500/10 border-gold-500 text-obsidian-900 font-bold' : 'bg-cream-100 border-cream-300 text-obsidian-900/40'}`}>
              <span className="text-[9px] uppercase block font-bold text-gold-700">STAGE 2</span>
              <span className="text-xs font-semibold">Quality & QC</span>
            </div>

            <div className={`p-3 rounded-2xl border transition-all ${currentStep >= 3 ? 'bg-gold-500/10 border-gold-500 text-obsidian-900 font-bold' : 'bg-cream-100 border-cream-300 text-obsidian-900/40'}`}>
              <span className="text-[9px] uppercase block font-bold text-gold-700">STAGE 3</span>
              <span className="text-xs font-semibold">In Transit</span>
            </div>

            <div className={`p-3 rounded-2xl border transition-all ${currentStep >= 4 ? 'bg-gold-500/10 border-gold-500 text-obsidian-900 font-bold' : 'bg-cream-100 border-cream-300 text-obsidian-900/40'}`}>
              <span className="text-[9px] uppercase block font-bold text-gold-700">STAGE 4</span>
              <span className="text-xs font-semibold">Delivered</span>
            </div>
          </div>
        </div>

        {/* Detailed Courier Tracking Log Milestones */}
        <div className="bg-cream-100/90 p-5 rounded-3xl border border-cream-300 space-y-4">
          <div className="flex items-center justify-between border-b border-cream-300 pb-3">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-gold-600" />
              <div>
                <span className="font-serif font-bold text-sm text-obsidian-900 block">
                  {order.courierName || 'BlueDart Luxury Air Express'}
                </span>
                <span className="text-[10px] text-obsidian-900/50">Real-Time GPS Logistics Feed</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-gold-800 bg-gold-500/20 px-3 py-1 rounded-xl border border-gold-500/30">
              AWB #{order.awbTrackingNumber || order.trackingNumber || 'ECL-AWB-984210'}
            </span>
          </div>

          {/* Vertical Tracking History Timeline */}
          <div className="space-y-3 pl-2">
            {trackingLogs.map((log: any, idx: number) => (
              <div key={idx} className="flex gap-3 text-xs relative">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-gold-600 border-2 border-white ring-2 ring-gold-500/20"></div>
                  {idx < trackingLogs.length - 1 && <div className="w-0.5 h-full bg-gold-300 my-1"></div>}
                </div>
                <div className="space-y-0.5 min-w-0 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-obsidian-900">{log.status.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] font-mono text-obsidian-900/50">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-obsidian-900/70 font-semibold">{log.location} — {log.note || 'Milestone verified'}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Packing Video Link if available */}
          {order.packingVideoUrl && (
            <div className="pt-2 border-t border-cream-300 flex items-center justify-between text-xs">
              <span className="text-[10px] font-bold uppercase text-gold-700">Artisan Quality Inspection Video Recorded</span>
              <a 
                href={order.packingVideoUrl} 
                target="_blank" 
                rel="noreferrer"
                className="text-gold-800 font-bold underline hover:text-obsidian-900"
              >
                Watch Sealed Packing Video 🎥
              </a>
            </div>
          )}
        </div>

        {/* Item List & Actions */}
        <div className="space-y-3 pt-2">
          {order.items.map((item: any) => {
            const originalProduct = products.find(p => p.id === item.productId);
            return (
              <div key={item.id} className="flex items-center justify-between gap-3 p-3 bg-cream-100/60 rounded-2xl border border-cream-200 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={item.image} alt="" className="w-12 h-12 object-cover rounded-xl border border-cream-300 shrink-0" />
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
                      className="px-3 py-1.5 bg-obsidian-900 text-cream-100 hover:bg-gold-600 hover:text-obsidian-900 rounded-xl font-bold text-[10px] uppercase flex items-center gap-1 transition-all"
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

        {/* Return Request Button */}
        {isDelivered && !isReturnRequested && (
          <div className="pt-2 border-t border-cream-200 flex justify-end">
            <button
              onClick={() => setReturnOrder(order)}
              className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Request 7-Day Return / Exchange
            </button>
          </div>
        )}

      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10 pb-28 md:pb-12 animate-fade-in">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-gold-700 uppercase tracking-widest">REAL-TIME LOGISTICS & TRACKING</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-obsidian-900">
          Shipment Tracking & Order History
        </h1>
        <p className="text-xs sm:text-sm text-obsidian-900/60 leading-relaxed">
          Search by Order ID or AWB Tracking Number to view real-time courier movement and digital manifests.
        </p>
      </div>

      {/* Lookup Bar */}
      <form onSubmit={handleTrackSubmit} className="bg-white p-4 rounded-3xl border border-cream-300 shadow-md flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
        <div className="relative flex-1">
          <input 
            type="text"
            placeholder="Order ID or AWB Number (e.g. EP-10482, ECL-AWB-984210)"
            value={orderQuery}
            onChange={(e) => setOrderQuery(e.target.value)}
            className="w-full bg-cream-100 border border-cream-300 rounded-2xl pl-10 pr-3 py-3 text-xs text-obsidian-900 font-bold focus:outline-none focus:border-gold-500"
          />
          <Search className="w-4 h-4 text-obsidian-900/40 absolute left-3.5 top-3.5" />
        </div>
        <button 
          type="submit"
          disabled={isLoadingSearch}
          className="bg-obsidian-900 text-cream-100 px-6 py-3 rounded-2xl font-bold text-xs uppercase hover:bg-gold-600 hover:text-obsidian-900 transition-all shrink-0 shadow-sm"
        >
          {isLoadingSearch ? 'Tracking...' : 'Track Package'}
        </button>
      </form>

      {/* Searched Order Lookup Display */}
      {hasSearched && (
        searchedOrder ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-cream-300 pb-2">
              <span className="text-xs font-bold uppercase text-gold-700">Search Result for "{orderQuery}"</span>
              <button 
                onClick={() => setHasSearched(false)}
                className="text-xs font-bold text-obsidian-900/50 hover:text-obsidian-900 underline"
              >
                Clear Search
              </button>
            </div>
            {renderSingleOrderCard(searchedOrder)}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-3xl text-center space-y-2 border border-cream-300">
            <AlertCircle className="w-8 h-8 text-terracotta-500 mx-auto" />
            <h3 className="font-serif font-bold text-obsidian-900">No active shipment found</h3>
            <p className="text-xs text-obsidian-900/60">Double check your AWB tracking number or Order ID and try again.</p>
          </div>
        )
      )}

      {/* All Recent Orders List */}
      <div className="space-y-6">
        <h2 className="font-serif text-xl font-bold text-obsidian-900 border-b border-cream-300 pb-3">
          Your Recent Orders ({orders.length})
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
          orders.map(order => renderSingleOrderCard(order))
        )}
      </div>

      {/* RETURN / EXCHANGE REQUEST MODAL */}
      {returnOrder && (
        <div className="fixed inset-0 z-50 bg-obsidian-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative text-obsidian-900 border border-cream-300">
            
            <div className="flex items-center justify-between border-b border-cream-300 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-gold-700">7-Day Heritage Guarantee</span>
                <h3 className="font-serif font-bold text-lg text-obsidian-900">Request Return/Exchange — #{returnOrder.orderNumber}</h3>
              </div>
              <button 
                onClick={() => setReturnOrder(null)}
                className="p-1 hover:bg-cream-100 rounded-lg text-obsidian-900/50 hover:text-obsidian-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReturn} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-obsidian-900/60">Reason for Return or Exchange</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3.5 py-2.5 font-bold focus:outline-none focus:border-gold-500"
                >
                  <option value="Damaged or defective craft item">Damaged or defective craft item</option>
                  <option value="Color or size mismatch">Color or size mismatch</option>
                  <option value="Packaging seal broken during transport">Packaging seal broken during transport</option>
                  <option value="Changed mind / Exchange request">Changed mind / Exchange request</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-obsidian-900/60">Upload Photo Evidence (Optional)</label>
                <div className="flex items-center gap-3">
                  <label className="px-4 py-2.5 bg-cream-100 border border-cream-300 hover:bg-cream-200 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-2 text-obsidian-900">
                    <Camera className="w-4 h-4 text-gold-600" />
                    <span>Upload Damage Photo</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                  <span className="text-[10px] text-obsidian-900/50">{returnPhotos.length} photo(s) attached</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-obsidian-900/60">Additional Comments for Curator</label>
                <textarea 
                  rows={3}
                  value={returnComments}
                  onChange={(e) => setReturnComments(e.target.value)}
                  placeholder="Describe item condition or exchange preferences..."
                  className="w-full bg-cream-100 border border-cream-300 rounded-xl p-3 text-xs focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReturnOrder(null)}
                  className="px-4 py-2 bg-cream-200 hover:bg-cream-300 text-obsidian-900 rounded-xl font-bold uppercase text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReturn}
                  className="px-5 py-2 bg-terracotta-600 hover:bg-terracotta-700 text-white rounded-xl font-bold uppercase text-xs shadow-md"
                >
                  {isSubmittingReturn ? 'Submitting...' : 'Submit Return Request'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
export default TrackOrderView;

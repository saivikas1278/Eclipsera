import React, { useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { Truck, ArrowLeft, Package, Clock, CheckCircle2, CircleDot } from 'lucide-react';

export const OrderTrackingView: React.FC = () => {
  const { orders, selectedOrderId, setCurrentView, currentUser } = useUser();

  useEffect(() => {
    try {
      const sse = new EventSource('http://localhost:5000/api/notifications/stream');
      sse.addEventListener('ORDER_UPDATED', (e: MessageEvent) => {
        try {
          const updated = JSON.parse(e.data);
          if (updated && (updated.id === selectedOrderId || updated.orderNumber === selectedOrderId)) {
            window.location.reload();
          }
        } catch (err) {}
      });
      return () => sse.close();
    } catch (e) {}
  }, [selectedOrderId]);

  const order = orders.find(o => o.id === selectedOrderId) || orders[0];

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4 animate-fade-in text-obsidian-900">
        <h3 className="font-serif text-xl font-bold">No order selected to track</h3>
        <button 
          onClick={() => setCurrentView('account')}
          className="px-5 py-2.5 bg-obsidian-900 text-cream-100 rounded-xl font-bold text-xs uppercase"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  // Define steps
  const currentStatus = order.status;
  const isDelivered = currentStatus === 'DELIVERED';
  const isShipped = currentStatus === 'SHIPPED' || isDelivered;
  const isPacked = currentStatus === 'PROCESSING' || isShipped;
  const isConfirmed = currentStatus === 'PAYMENT_CONFIRMED' || isPacked;

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-8 animate-fade-in text-obsidian-900 pb-28 md:pb-12">
      
      {/* Back button */}
      <button 
        onClick={() => setCurrentView('account')}
        className="text-xs font-bold text-gold-700 hover:text-gold-800 transition-all flex items-center gap-1 font-sans uppercase tracking-wider"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </button>

      {/* Title */}
      <div>
        <span className="text-xs font-bold text-gold-700 uppercase tracking-widest block">REAL-TIME SHIPMENT TIMELINE</span>
        <h1 className="font-serif text-2xl font-bold">Track Shipment</h1>
        <p className="text-xs text-obsidian-900/60 font-sans mt-0.5">Order ID: {order.orderNumber} • Reference AWB: {order.trackingNumber || 'BD83910293'}</p>
      </div>

      {/* Courier details card */}
      <div className="bg-cream-100 p-5 rounded-2xl border border-cream-300 space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="text-obsidian-900/50 uppercase font-bold tracking-wider">Logistics Carrier</span>
          <span className="font-bold text-gold-700">{order.courierName || 'Blue Dart Express'}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-obsidian-900/50 uppercase font-bold tracking-wider">Estimated Delivery Date</span>
          <span className="font-bold text-obsidian-900">
            {new Date(new Date(order.createdAt).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Vertical Step Timeline */}
      <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-sm space-y-6">
        <h3 className="font-serif text-sm font-bold border-b pb-2">Status Timeline Checkpoints</h3>

        <div className="space-y-6 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-cream-200">
          
          {/* Step 5: Delivered */}
          <div className="relative">
            <span className={`absolute -left-6 top-1 w-4 h-4 rounded-full border flex items-center justify-center ${
              isDelivered ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-cream-300'
            }`}>
              {isDelivered && <CheckCircle2 className="w-3 h-3 text-white fill-current" />}
            </span>
            <div className="text-xs">
              <p className={`font-bold ${isDelivered ? 'text-emerald-700' : 'text-obsidian-900/40'}`}>Package Delivered</p>
              <p className="text-obsidian-900/60 font-sans mt-0.5">Handed over to customer with certified GI Craft mark package.</p>
            </div>
          </div>

          {/* Step 4: Out for Delivery / In Transit */}
          <div className="relative">
            <span className={`absolute -left-6 top-1 w-4 h-4 rounded-full border flex items-center justify-center ${
              isShipped && !isDelivered ? 'bg-gold-500 border-gold-500' : isDelivered ? 'bg-gold-500 border-gold-500' : 'bg-white border-cream-300'
            }`}>
              {isShipped && !isDelivered && <CircleDot className="w-3 h-3 text-obsidian-900" />}
            </span>
            <div className="text-xs">
              <p className={`font-bold ${isShipped ? 'text-obsidian-900' : 'text-obsidian-900/40'}`}>Dispatched & Shipped</p>
              <p className="text-obsidian-900/60 font-sans mt-0.5">In transit via Air Cargo Hub to regional delivery center.</p>
            </div>
          </div>

          {/* Step 3: Packed / Quality check */}
          <div className="relative">
            <span className={`absolute -left-6 top-1 w-4 h-4 rounded-full border flex items-center justify-center ${
              isPacked ? 'bg-gold-500 border-gold-500' : 'bg-white border-cream-300'
            }`} />
            <div className="text-xs">
              <p className={`font-bold ${isPacked ? 'text-obsidian-900' : 'text-obsidian-900/40'}`}>Quality Checked & Packed</p>
              <p className="text-obsidian-900/60 font-sans mt-0.5">Artisan guild completed inspection and signed GI authenticity certificate.</p>
            </div>
          </div>

          {/* Step 2: Confirmed */}
          <div className="relative">
            <span className={`absolute -left-6 top-1 w-4 h-4 rounded-full border flex items-center justify-center ${
              isConfirmed ? 'bg-gold-500 border-gold-500' : 'bg-white border-cream-300'
            }`} />
            <div className="text-xs">
              <p className={`font-bold ${isConfirmed ? 'text-obsidian-900' : 'text-obsidian-900/40'}`}>Order Confirmed</p>
              <p className="text-obsidian-900/60 font-sans mt-0.5">Inventory reserves secured with regional artisans.</p>
            </div>
          </div>

          {/* Step 1: Placed */}
          <div className="relative">
            <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-gold-500 border border-gold-500 flex items-center justify-center" />
            <div className="text-xs">
              <p className="font-bold text-obsidian-900">Order Placed Successfully</p>
              <p className="text-obsidian-900/60 font-sans mt-0.5">Secure payment transaction authenticated via gateway.</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
export default OrderTrackingView;

import React from 'react';
import { useUser } from '../context/UserContext';
import { Package, Truck, Printer, ArrowLeft, ShieldCheck, Download, AlertCircle, FileText } from 'lucide-react';

export const OrderDetailView: React.FC = () => {
  const { orders, selectedOrderId, cancelOrder, setCurrentView, products } = useUser();

  // Find selected order
  const order = orders.find(o => o.id === selectedOrderId) || orders[0];

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4 animate-fade-in text-obsidian-900">
        <h3 className="font-serif text-xl font-bold">Order not found</h3>
        <p className="text-xs text-obsidian-900/60 font-sans">Unable to retrieve details for transaction reference ID: {selectedOrderId}</p>
        <button 
          onClick={() => setCurrentView('account')}
          className="px-5 py-2.5 bg-obsidian-900 text-cream-100 rounded-xl font-bold text-xs uppercase"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Eligible helper check
  const isCancelEligible = order.status === 'PENDING' || order.status === 'PAYMENT_CONFIRMED' || order.status === 'PROCESSING';
  const isReturnEligible = order.status === 'DELIVERED';

  // Status timelines progress value
  const getTimelineStep = (status: string) => {
    switch (status) {
      case 'PENDING': return 1;
      case 'PAYMENT_CONFIRMED': return 2;
      case 'PROCESSING': return 3;
      case 'SHIPPED': return 4;
      case 'DELIVERED': return 5;
      default: return 1;
    }
  };

  const currentStepNum = getTimelineStep(order.status);

  // Status mapping color codes
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'PAYMENT_CONFIRMED':
      case 'PROCESSING':
        return <span className="bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Processing</span>;
      case 'SHIPPED':
        return <span className="bg-blue-100 text-blue-800 border border-blue-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Shipped</span>;
      case 'DELIVERED':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Delivered</span>;
      case 'CANCELLED':
        return <span className="bg-red-100 text-red-800 border border-red-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Cancelled</span>;
      default:
        return <span className="bg-orange-100 text-orange-800 border border-orange-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Return Pending</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in text-obsidian-900 pb-28 md:pb-12">
      
      {/* Back to Orders */}
      <button 
        onClick={() => setCurrentView('account')}
        className="text-xs font-bold text-gold-700 hover:text-gold-800 transition-all flex items-center gap-1 font-sans uppercase tracking-wider"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Account Dashboard
      </button>

      {/* Header Info */}
      <div className="border-b border-cream-300 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-serif text-xl sm:text-2xl font-bold">Order #{order.orderNumber}</h1>
            {renderStatusBadge(order.status)}
          </div>
          <p className="text-xs text-obsidian-900/60 font-sans mt-0.5">Placed on {new Date(order.createdAt).toLocaleDateString()} • Reference: {order.id}</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 border border-cream-300 hover:bg-cream-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm bg-white"
          >
            <Printer className="w-4 h-4 text-gold-600" />
            Download Invoice
          </button>
        </div>
      </div>

      {/* Visual Stepper Status Timeline */}
      {order.status !== 'CANCELLED' && (
        <div className="bg-white/90 p-6 rounded-3xl border border-cream-300 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gold-700">Fulfillment Progression</h3>
          
          <div className="relative">
            <div className="absolute top-4 left-4 right-4 h-1 bg-cream-200 z-0" />
            <div 
              className="absolute top-4 left-4 h-1 bg-gold-500 z-0 transition-all duration-500" 
              style={{ width: `${((currentStepNum - 1) / 4) * 100}%` }}
            />
            
            <div className="grid grid-cols-5 gap-2 relative z-10 text-center text-[10px] font-bold text-obsidian-900/40">
              {[
                { label: 'Placed', step: 1 },
                { label: 'Confirmed', step: 2 },
                { label: 'Packed', step: 3 },
                { label: 'Shipped', step: 4 },
                { label: 'Delivered', step: 5 }
              ].map(item => (
                <div key={item.step} className="space-y-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto border transition-all duration-300 font-mono ${
                    currentStepNum >= item.step 
                      ? 'bg-gold-500 border-gold-500 text-obsidian-900 font-bold shadow-sm' 
                      : 'bg-white border-cream-300 text-obsidian-900/30'
                  }`}>
                    {item.step}
                  </div>
                  <span className={currentStepNum >= item.step ? 'text-obsidian-900 font-extrabold' : ''}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-obsidian-900/70 border-t border-cream-200 pt-3 flex justify-between items-center font-sans">
            <span>Expected Delivery Date:</span>
            <span className="font-bold text-gold-700">
              {new Date(new Date(order.createdAt).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
      )}

      {/* Courier details and links */}
      {order.status === 'SHIPPED' && (
        <div className="bg-cream-100 p-4 rounded-2xl border border-cream-300 flex items-center justify-between flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-gold-600 shrink-0" />
            <div>
              <p className="font-bold">Shipment via {order.courierName || 'Blue Dart Express'}</p>
              <p className="text-[11px] text-obsidian-900/60 font-mono">AWB Tracking ID: {order.trackingNumber || 'BD83910293'}</p>
            </div>
          </div>
          <a 
            href={`https://www.bluedart.com/tracking?awb=${order.trackingNumber || 'BD83910293'}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 bg-obsidian-900 text-cream-100 hover:bg-gold-500 hover:text-obsidian-900 font-bold rounded-lg uppercase text-[10px] tracking-wider transition-all"
          >
            Track on Courier Site
          </a>
        </div>
      )}

      {/* Item List table */}
      <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-sm space-y-4">
        <h3 className="font-serif text-sm font-bold border-b border-cream-200 pb-2">Craft Items Order Summary</h3>
        
        <div className="divide-y divide-cream-100">
          {order.items.map(item => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <img src={item.image} alt="" className="w-12 h-14 object-cover rounded-lg border border-cream-300 shrink-0" />
                <div>
                  <h4 className="font-serif font-bold text-obsidian-900">{item.title}</h4>
                  <p className="text-gold-700 font-semibold text-[10px] uppercase">Shade: {item.colorName} {item.size ? `• ${item.size}` : ''}</p>
                </div>
              </div>

              <div className="text-right font-mono font-bold shrink-0">
                <p className="text-obsidian-900">₹{(item.unitPrice * item.quantity).toLocaleString()}</p>
                <p className="text-obsidian-900/50 font-normal text-[10px]">Qty: {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing totals */}
        <div className="border-t border-cream-200 pt-3 text-xs space-y-1.5 max-w-xs ml-auto text-right font-medium">
          <div className="flex justify-between"><span>Subtotal:</span><span>₹{order.subtotal.toLocaleString()}</span></div>
          {order.discountTotal > 0 && <div className="flex justify-between text-emerald-700 font-bold"><span>Savings Code Discount:</span><span>-₹{order.discountTotal.toLocaleString()}</span></div>}
          <div className="flex justify-between"><span>GST (5% Handcrafted):</span><span>₹{order.taxTotal.toLocaleString()}</span></div>
          <div className="flex justify-between"><span>Shipping:</span><span>{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span></div>
          <div className="flex justify-between font-serif text-base font-bold text-obsidian-900 pt-2 border-t border-cream-200">
            <span>Paid Grand Total:</span>
            <span className="text-gold-700">₹{order.grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Address & Payment summaries split */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans text-obsidian-900/80">
        <div className="bg-cream-100 p-5 rounded-2xl border border-cream-300 space-y-1">
          <span className="font-bold uppercase text-obsidian-900 block mb-1">Shipping Address Details</span>
          <p className="font-bold text-obsidian-900">{order.customerName}</p>
          <p>{order.shippingAddress.street}</p>
          <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
          <p className="text-obsidian-900/60 font-semibold pt-0.5">Phone: {order.customerPhone}</p>
        </div>

        <div className="bg-cream-100 p-5 rounded-2xl border border-cream-300 space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="font-bold uppercase text-obsidian-900 block mb-1">Payment Method Used</span>
            <p className="font-bold text-obsidian-900">{order.paymentMethod}</p>
            <p className="text-[11px] text-gold-700 font-semibold">• GI Mark Protection Certificate Included</p>
          </div>

          {/* Cancellation and Return Action triggers */}
          <div className="pt-2 border-t border-cream-300 flex justify-end">
            {isCancelEligible && (
              <button
                onClick={() => cancelOrder(order.id)}
                className="px-4 py-2 bg-white text-terracotta-500 hover:bg-terracotta-500 hover:text-white border border-terracotta-500/30 font-bold rounded-xl uppercase text-[10px] tracking-wider transition-all"
              >
                Cancel Order
              </button>
            )}

            {isReturnEligible && (
              <button
                onClick={() => setCurrentView('return-request')}
                className="px-4 py-2 bg-gold-500 text-obsidian-900 hover:bg-gold-400 font-bold rounded-xl uppercase text-[10px] tracking-wider transition-all"
              >
                Request Return / Refund
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
export default OrderDetailView;

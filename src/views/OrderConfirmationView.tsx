import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, Download, Printer, Truck, ShieldCheck, ArrowRight, Package } from 'lucide-react';

export const OrderConfirmationView: React.FC = () => {
  const { lastPlacedOrder, setCurrentView } = useStore();

  const order = lastPlacedOrder || {
    id: 'ord-10482',
    orderNumber: 'EP-10482',
    customerName: 'Ananya Sharma',
    customerEmail: 'ananya.sharma@example.com',
    customerPhone: '+91 98765 43210',
    shippingAddress: {
      street: '42 Lavelle Road, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India'
    },
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        variantId: 'v1-1',
        title: 'Channapatna Hand-Lathed Wooden Stacking Ring Toy',
        colorName: 'Rainbow Harvest',
        size: 'Standard (7 Rungs)',
        unitPrice: 1250,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80'
      }
    ],
    subtotal: 2500,
    discountTotal: 250,
    shippingFee: 0,
    taxTotal: 112,
    grandTotal: 2362,
    status: 'PAYMENT_CONFIRMED' as const,
    paymentMethod: 'Razorpay UPI',
    paymentId: 'pay_Nz92837482',
    createdAt: new Date().toISOString()
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8 sm:space-y-10">
      
      {/* Confirmation Banner */}
      <div className="bg-obsidian-900 text-cream-100 rounded-3xl p-6 sm:p-12 text-center space-y-4 border border-gold-500/40 relative overflow-hidden shadow-2xl">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gold-500/20 text-gold-400 rounded-full flex items-center justify-center mx-auto border border-gold-500/40">
          <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>

        <span className="text-[10px] sm:text-xs font-bold text-gold-400 uppercase tracking-widest block">ORDER SUCCESSFULLY PLACED</span>

        <h1 className="font-serif text-2xl sm:text-4xl font-bold">
          Thank You, {order.customerName}!
        </h1>

        <p className="text-xs sm:text-sm text-cream-300/80 max-w-lg mx-auto font-sans">
          Your order <span className="text-gold-400 font-bold font-mono">{order.orderNumber}</span> has been confirmed. A formal tax invoice and tracking updates have been sent to <span className="underline">{order.customerEmail}</span>.
        </p>

        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <button 
            onClick={handlePrintInvoice}
            className="bg-gold-500 text-obsidian-900 hover:bg-gold-400 font-bold text-xs tracking-wider uppercase px-5 py-3 rounded-full transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Download Tax Invoice (PDF)
          </button>

          <button 
            onClick={() => setCurrentView('track-order')}
            className="bg-obsidian-800 text-cream-100 hover:text-gold-400 border border-gold-500/40 font-semibold text-xs tracking-wider uppercase px-5 py-3 rounded-full transition-all flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            Track Order Live
          </button>
        </div>
      </div>

      {/* Order Status Timeline */}
      <div className="bg-white/90 p-6 sm:p-8 rounded-3xl border border-cream-300 space-y-4 shadow-sm">
        <h3 className="font-serif text-base sm:text-lg font-bold text-obsidian-900 border-b border-cream-300 pb-2.5">
          Order Fulfillment Progress
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-gold-500/10 border border-gold-500/30 rounded-2xl space-y-1">
            <span className="text-[9px] font-bold text-gold-700 uppercase block">STEP 1</span>
            <p className="font-bold text-xs text-obsidian-900">Payment Confirmed</p>
            <p className="text-[10px] text-obsidian-900/60">Verified via Razorpay</p>
          </div>

          <div className="p-3 bg-cream-200/50 border border-cream-300 rounded-2xl space-y-1">
            <span className="text-[9px] font-bold text-obsidian-900/40 uppercase block">STEP 2</span>
            <p className="font-bold text-xs text-obsidian-900">Artisan Quality Check</p>
            <p className="text-[10px] text-obsidian-900/60">Toy Guild</p>
          </div>

          <div className="p-3 bg-cream-200/50 border border-cream-300 rounded-2xl space-y-1">
            <span className="text-[9px] font-bold text-obsidian-900/40 uppercase block">STEP 3</span>
            <p className="font-bold text-xs text-obsidian-900">Insured Dispatch</p>
            <p className="text-[10px] text-obsidian-900/60">Blue Dart Express</p>
          </div>

          <div className="p-3 bg-cream-200/50 border border-cream-300 rounded-2xl space-y-1">
            <span className="text-[9px] font-bold text-obsidian-900/40 uppercase block">STEP 4</span>
            <p className="font-bold text-xs text-obsidian-900">Delivered</p>
            <p className="text-[10px] text-obsidian-900/60">Estimated in 3 Days</p>
          </div>
        </div>
      </div>

      {/* Invoice Detail Card */}
      <div className="bg-cream-100 p-6 sm:p-8 rounded-3xl border border-cream-300 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between border-b border-cream-300 pb-4 gap-2">
          <div>
            <h4 className="font-serif font-bold text-lg sm:text-xl text-obsidian-900">eclipsera_premium Tax Invoice</h4>
            <p className="text-xs text-obsidian-900/60">Order ID: {order.id} • Payment Ref: {order.paymentId}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs font-bold text-obsidian-900">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            <p className="text-xs text-gold-700 font-bold uppercase">{order.status}</p>
          </div>
        </div>

        {/* Shipping Address & Customer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-obsidian-900/80">
          <div>
            <span className="font-bold uppercase text-obsidian-900 block mb-1">Billed & Shipped To:</span>
            <p className="font-semibold text-obsidian-900">{order.customerName}</p>
            <p>{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            <p>Phone: {order.customerPhone}</p>
          </div>

          <div>
            <span className="font-bold uppercase text-obsidian-900 block mb-1">Payment Method:</span>
            <p className="font-semibold text-obsidian-900">{order.paymentMethod}</p>
            <p className="mt-1 text-[11px] text-gold-700 font-semibold">GI Craft Mark Certificate Included in Package</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="border-t border-cream-300 pt-4 space-y-3 overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[300px]">
            <thead>
              <tr className="border-b border-cream-300 text-obsidian-900 font-bold uppercase">
                <th className="py-2">Item Description</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Unit Price</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {order.items.map(item => (
                <tr key={item.id}>
                  <td className="py-2.5 font-semibold text-obsidian-900">
                    {item.title} <span className="text-gold-700 font-normal">({item.colorName})</span>
                  </td>
                  <td className="py-2.5 text-center">{item.quantity}</td>
                  <td className="py-2.5 text-right">₹{item.unitPrice.toLocaleString()}</td>
                  <td className="py-2.5 text-right font-bold">₹{(item.unitPrice * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total Summary */}
        <div className="border-t border-cream-300 pt-3 text-xs space-y-1 max-w-xs ml-auto text-right font-medium">
          <div className="flex justify-between"><span>Subtotal:</span><span>₹{order.subtotal.toLocaleString()}</span></div>
          {order.discountTotal > 0 && <div className="flex justify-between text-terracotta-500 font-bold"><span>Discount:</span><span>-₹{order.discountTotal.toLocaleString()}</span></div>}
          <div className="flex justify-between"><span>GST (5% Handcrafted):</span><span>₹{order.taxTotal.toLocaleString()}</span></div>
          <div className="flex justify-between"><span>Shipping:</span><span>{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span></div>
          <div className="flex justify-between font-serif text-base font-bold text-obsidian-900 pt-2 border-t border-cream-300">
            <span>Grand Total:</span>
            <span className="text-gold-700">₹{order.grandTotal.toLocaleString()}</span>
          </div>
        </div>

      </div>

    </div>
  );
};

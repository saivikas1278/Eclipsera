import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { ArrowLeft, Check, Camera, AlertCircle } from 'lucide-react';

export const ReturnRequestView: React.FC = () => {
  const { orders, selectedOrderId, requestReturnOrder, setCurrentView } = useUser();

  const order = orders.find(o => o.id === selectedOrderId) || orders[0];

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [reason, setReason] = useState('DAMAGED');
  const [comments, setComments] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4 animate-fade-in text-obsidian-900">
        <h3 className="font-serif text-xl font-bold">No order found to return</h3>
        <button 
          onClick={() => setCurrentView('account')}
          className="px-5 py-2.5 bg-obsidian-900 text-cream-100 rounded-xl font-bold text-xs uppercase"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const handleToggleItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId) 
        : [...prev, itemId]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      setErrorMsg('Please select at least one item to return');
      return;
    }
    setErrorMsg('');

    requestReturnOrder(order.id, selectedItems, reason, comments);
    setCurrentView('account');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 animate-fade-in text-obsidian-900 pb-28 md:pb-12">
      
      {/* Back button */}
      <button 
        onClick={() => setCurrentView('order-detail')}
        className="text-xs font-bold text-gold-700 hover:text-gold-800 transition-all flex items-center gap-1 font-sans uppercase tracking-wider"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Order Details
      </button>

      {/* Header */}
      <div>
        <span className="text-xs font-bold text-gold-700 uppercase tracking-widest block">POST-PURCHASE SUPPORT</span>
        <h1 className="font-serif text-2xl font-bold">Request Return / Refund</h1>
        <p className="text-xs text-obsidian-900/60 font-sans mt-0.5">For Order #{order.orderNumber} • Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 border border-cream-300 shadow-sm space-y-6">
        
        {/* Step 1: Select Items */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-obsidian-900/50">1. Select Items to Return</h3>
          
          <div className="space-y-2">
            {order.items.map(item => (
              <label 
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedItems.includes(item.id) 
                    ? 'border-gold-500 bg-gold-500/5' 
                    : 'border-cream-300 bg-cream-100/30'
                }`}
              >
                <div className="flex items-center gap-3 text-xs">
                  <input 
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleToggleItem(item.id)}
                    className="w-4.5 h-4.5 text-gold-500 accent-gold-500 rounded cursor-pointer shrink-0"
                  />
                  <img src={item.image} alt="" className="w-10 h-12 object-cover rounded-lg border border-cream-300 shrink-0" />
                  <div>
                    <p className="font-bold">{item.title}</p>
                    <p className="text-[10px] text-gold-700 font-semibold uppercase">Shade: {item.colorName} • Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-xs shrink-0">₹{item.unitPrice.toLocaleString()}</span>
              </label>
            ))}
          </div>
          {errorMsg && <p className="text-xs font-bold text-terracotta-500 mt-1">{errorMsg}</p>}
        </div>

        {/* Step 2: Reason Dropdown */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-obsidian-900/50">2. Select Reason for Return</h3>
          <select 
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-gold-500 font-bold"
          >
            <option value="DAMAGED">Product received in damaged condition</option>
            <option value="WRONG_ITEM">Wrong item sent by artisan guild</option>
            <option value="QUALITY_UNSATISFACTORY">Quality does not match expectations</option>
            <option value="NOT_AS_DESCRIBED">Item specifications differ from description</option>
          </select>
        </div>

        {/* Step 3: Comments Textarea */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-obsidian-900/50">3. Elaborate Return Request Details</h3>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            required
            rows={4}
            placeholder="Please provide details about the issue (e.g. description of damage, missing parts). This helps the artisan guild approve your request quickly."
            className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-gold-500 font-medium"
          />
        </div>

        {/* Step 4: Photo upload */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-obsidian-900/50">4. Upload Proof Image (Required for Damage claims)</h3>
          
          <div className="flex items-center gap-4">
            <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-cream-300 hover:border-gold-500 rounded-2xl cursor-pointer bg-cream-100 transition-all text-obsidian-900/40">
              <Camera className="w-5 h-5 mb-1" />
              <span className="text-[9px] font-bold uppercase">Upload Photo</span>
              <input 
                type="file" 
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>

            {photoPreview && (
              <div className="w-24 h-24 rounded-2xl overflow-hidden border border-cream-300 relative group shadow-sm">
                <img src={photoPreview} alt="Proof preview" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  className="absolute inset-0 bg-obsidian-900/70 text-white text-[9px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action button */}
        <button
          type="submit"
          className="w-full bg-obsidian-900 text-cream-100 hover:bg-gold-500 hover:text-obsidian-900 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md mt-4"
        >
          <Check className="w-4 h-4 text-gold-400" />
          Submit Return Request
        </button>

      </form>

    </div>
  );
};
export default ReturnRequestView;

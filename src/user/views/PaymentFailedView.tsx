import React from 'react';
import { useUser } from '../context/UserContext';
import { AlertTriangle, RefreshCw, PhoneCall, Mail, ArrowRight } from 'lucide-react';

export const PaymentFailedView: React.FC = () => {
  const { setCurrentView } = useUser();

  // Mocked ID or dynamic ID if order failed to log
  const referenceId = `pay_err_${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24 text-center space-y-8 animate-fade-in text-obsidian-900">
      
      {/* Failed Banner */}
      <div className="bg-white/80 rounded-3xl p-8 sm:p-12 border border-terracotta-500/30 shadow-xl space-y-5">
        <div className="w-16 h-16 bg-terracotta-500/10 text-terracotta-500 rounded-full flex items-center justify-center mx-auto border border-terracotta-500/20 animate-pulse">
          <AlertTriangle className="w-9 h-9" />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold text-terracotta-600 uppercase tracking-widest block">TRANSACTION REFUSED</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">Payment Transaction Failed</h1>
        </div>

        <p className="text-xs sm:text-sm text-obsidian-900/60 max-w-md mx-auto font-sans leading-relaxed">
          We were unable to process your payment transaction. This may be due to temporary network timeouts with your bank bank servers or insufficient credit lines.
        </p>

        {/* Reference details */}
        <div className="p-3 bg-cream-100 rounded-xl max-w-sm mx-auto border border-cream-300 font-mono text-[11px] font-bold">
          <span>Failed Txn Reference ID: </span>
          <span className="text-gold-700">{referenceId}</span>
        </div>

        {/* Stepper retry button */}
        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
          <button 
            onClick={() => setCurrentView('checkout')}
            className="px-6 py-3 bg-obsidian-900 hover:bg-gold-500 hover:text-obsidian-900 text-cream-100 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all shadow-md font-sans"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Checkout Payment
          </button>

          <button 
            onClick={() => setCurrentView('shop')}
            className="px-6 py-3 bg-white border border-cream-300 hover:bg-cream-200 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all font-sans"
          >
            <span>Continue Browsing</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Support lines */}
      <div className="bg-cream-100 p-6 rounded-2xl border border-cream-300 max-w-md mx-auto space-y-3.5 text-xs text-left">
        <h4 className="font-bold uppercase tracking-wide border-b pb-1.5 flex items-center gap-1.5">
          <PhoneCall className="w-4 h-4 text-gold-600" />
          Need Help? Contact Support
        </h4>
        <p className="text-obsidian-900/60 leading-relaxed font-sans">
          If your account has already been debited, please do not panic. Refunds for failed transactions are auto-credited back by card gateways within 2-3 business days.
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1 font-semibold">
          <a href="mailto:support@eclipsera.com" className="flex items-center gap-1 hover:underline text-gold-700">
            <Mail className="w-3.5 h-3.5" />
            support@eclipsera.com
          </a>
          <span className="hidden sm:inline text-cream-300">|</span>
          <span className="text-obsidian-900">Call Toll-Free: 1800-420-5690</span>
        </div>
      </div>

    </div>
  );
};
export default PaymentFailedView;

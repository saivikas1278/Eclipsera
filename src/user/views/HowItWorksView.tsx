import React from 'react';
import { useUser } from '../context/UserContext';
import { Search, ShoppingBag, Sliders, CreditCard, PackageCheck, HelpCircle, ArrowRight } from 'lucide-react';

export const HowItWorksView: React.FC = () => {
  const { setCurrentView } = useUser();

  const steps = [
    {
      step: '01',
      title: 'Browse Heritage Collections',
      desc: 'Explore curated GI-certified woodcrafts, studio pottery, and hand-engraved metalware crafted by verified Indian artisans.',
      icon: Search
    },
    {
      step: '02',
      title: 'Personalize Your Piece',
      desc: 'Add custom laser engraving, bespoke gift wraps, or submit blueprint specifications for custom artisan commissions.',
      icon: Sliders
    },
    {
      step: '03',
      title: 'Add to Cart & Review',
      desc: 'Review item details, apply promotional coupons, offset store credits, and preview live delivery timelines.',
      icon: ShoppingBag
    },
    {
      step: '04',
      title: 'Secure Direct Payment',
      desc: 'Checkout smoothly with encrypted cards, UPI, wallet credits, or COD. 100% of artisan revenue share is guaranteed.',
      icon: CreditCard
    },
    {
      step: '05',
      title: 'Insured Delivery to Doorstep',
      desc: 'Track your package with real-time courier updates in zero-plastic eco-friendly protective packaging.',
      icon: PackageCheck
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 animate-fade-in text-obsidian-900 font-sans">
      
      {/* Hero Title */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="px-3.5 py-1 bg-gold-500/10 text-gold-700 rounded-full text-xs font-bold uppercase tracking-widest inline-block border border-gold-500/20">
          The eclipsera Experience
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
          How Ethical Shopping Works
        </h1>
        <p className="text-xs sm:text-sm text-obsidian-900/70 leading-relaxed">
          From traditional artisan workshop lathes directly to your doorstep. Here is how we ensure cultural authenticity and seamless delivery.
        </p>
      </div>

      {/* Step by Step Visual Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="bg-white rounded-3xl p-6 border border-cream-300 shadow-sm space-y-4 relative flex flex-col justify-between hover:shadow-lg transition-all">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-serif font-bold text-2xl text-gold-600">{s.step}</span>
                  <div className="w-10 h-10 rounded-2xl bg-cream-100 text-obsidian-900 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gold-700" />
                  </div>
                </div>
                <h3 className="font-serif font-bold text-sm tracking-tight">{s.title}</h3>
                <p className="text-xs text-obsidian-900/70 leading-relaxed font-sans">{s.desc}</p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-white border border-cream-300 rounded-full p-1 shadow">
                  <ArrowRight className="w-3 h-3 text-gold-600" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ Teaser Container */}
      <div className="bg-cream-100/60 rounded-3xl p-8 border border-cream-300 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <HelpCircle className="w-5 h-5 text-gold-700" />
            <h3 className="font-serif font-bold text-lg">Have Questions About Ordering?</h3>
          </div>
          <p className="text-xs text-obsidian-900/70 max-w-lg">
            Find detailed answers about shipping policies, custom engraving rules, return guarantees, and artisan GI verification.
          </p>
        </div>

        <button
          onClick={() => setCurrentView('faqs')}
          className="px-6 py-3 bg-obsidian-900 text-cream-100 hover:bg-gold-500 hover:text-obsidian-950 font-bold uppercase text-xs rounded-2xl transition-all shadow-md shrink-0"
        >
          View Frequently Asked Questions
        </button>
      </div>

    </div>
  );
};
export default HowItWorksView;

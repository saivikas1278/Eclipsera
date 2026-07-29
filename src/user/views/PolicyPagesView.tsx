import React from 'react';
import { useUser } from '../context/UserContext';
import { ShieldCheck, Truck, RotateCcw, Lock, FileText, Cookie } from 'lucide-react';

export const PolicyPagesView: React.FC = () => {
  const { selectedPolicySlug, openPolicy } = useUser();

  const policies = [
    { id: 'shipping-policy', label: 'Shipping & Delivery Policy', icon: Truck },
    { id: 'return-policy', label: '7-Day Return & Refund Guarantee', icon: RotateCcw },
    { id: 'privacy-policy', label: 'Privacy & Data Protection Policy', icon: Lock },
    { id: 'terms-and-conditions', label: 'Terms & Conditions of Service', icon: FileText },
    { id: 'cookie-policy', label: 'Cookie Preferences Policy', icon: Cookie }
  ];

  const currentPolicy = selectedPolicySlug || 'shipping-policy';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fade-in text-obsidian-900 font-sans">
      
      {/* Page Title */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h1 className="font-serif text-3xl font-bold tracking-tight">Legal & Governance Policies</h1>
        <p className="text-xs text-obsidian-900/60 font-sans">Transparent terms governing heritage craft fulfillment, payment processing, and patron privacy.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        
        {/* Sidebar Nav */}
        <div className="md:col-span-1 bg-white p-3 rounded-2xl border border-cream-300 shadow-sm space-y-1 text-xs font-bold">
          {policies.map(p => {
            const Icon = p.icon;
            const active = currentPolicy === p.id;
            return (
              <button
                key={p.id}
                onClick={() => openPolicy(p.id)}
                className={`w-full flex items-center gap-2.5 p-3 rounded-xl transition-all text-left ${
                  active ? 'bg-obsidian-900 text-cream-100 shadow-md' : 'hover:bg-cream-100 text-obsidian-900/80'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-gold-400' : 'text-gold-700'}`} />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Policy Body */}
        <div className="md:col-span-3 bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-sm space-y-6 text-xs text-obsidian-900/80 leading-relaxed font-sans">
          
          {currentPolicy === 'shipping-policy' && (
            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-obsidian-900 border-b pb-2">Shipping & Dispatch Policy</h2>
              <p>
                All eclipsera products are handcrafted directly in artisan workshops. Standard dispatch times range between 24 to 48 business hours after order confirmation.
              </p>
              <h3 className="font-serif text-base font-bold text-obsidian-900 pt-2">Domestic Courier Partners</h3>
              <p>
                We partner exclusively with Blue Dart Express and Delhivery Air Logistics. Transit times typically span 2-4 business days for major metros and 3-6 business days for tier-2/3 regions.
              </p>
              <h3 className="font-serif text-base font-bold text-obsidian-900 pt-2">Transit Insurance</h3>
              <p>
                Every parcel is 100% insured against loss or transit damage. If a package arrives damaged, photo proof must be uploaded within 48 hours for immediate replacement dispatch.
              </p>
            </div>
          )}

          {currentPolicy === 'return-policy' && (
            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-obsidian-900 border-b pb-2">7-Day Return & Refund Guarantee</h2>
              <p>
                We stand behind the authentic craftsmanship of every artisan item. If an item fails to meet your expectations or arrives damaged, submit a claim under Account → My Orders within 7 days of delivery.
              </p>
              <h3 className="font-serif text-base font-bold text-obsidian-900 pt-2">Eligibility Criteria</h3>
              <p>
                Returned items must be unused, in original packaging with intact brand tags. Custom laser-engraved bespoke items are non-refundable unless damaged upon arrival.
              </p>
            </div>
          )}

          {currentPolicy === 'privacy-policy' && (
            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-obsidian-900 border-b pb-2">Privacy & Data Protection Policy</h2>
              <p>
                Your privacy is paramount. eclipsera encrypts all patron personal details, shipping addresses, and vault payment tokens using 256-bit SSL protocols. We never sell customer information to third parties.
              </p>
            </div>
          )}

          {currentPolicy === 'terms-and-conditions' && (
            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-obsidian-900 border-b pb-2">Terms & Conditions of Service</h2>
              <p>
                By placing an order on eclipsera, you acknowledge that handcrafted items feature natural organic variations in wood grain, clay shading, and hand lathe turning details.
              </p>
            </div>
          )}

          {currentPolicy === 'cookie-policy' && (
            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-obsidian-900 border-b pb-2">Cookie Preferences Policy</h2>
              <p>
                We use essential cookies to maintain cart states, preserve session logins, and offer tailored artisan recommendations.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
export default PolicyPagesView;

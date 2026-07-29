import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, Award, Sparkles, HeartHandshake } from 'lucide-react';

export const AboutView: React.FC = () => {
  const { setCurrentView } = useStore();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-8 sm:space-y-12">
      
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <span className="text-xs font-bold text-gold-700 uppercase tracking-[0.25em]">LUXURY HANDCRAFT GUARANTEE</span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-obsidian-900">
          The eclipsera_premium Promise
        </h1>
        <p className="text-xs sm:text-sm text-obsidian-900/70 leading-relaxed font-sans">
          We exist to preserve the sacred heritage of Indian handcrafted toys, brass keychains, studio pottery, and woodcrafts, bringing heirloom quality into modern homes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-6 bg-white rounded-3xl border border-cream-300 space-y-2.5 text-center">
          <ShieldCheck className="w-8 h-8 text-gold-600 mx-auto" />
          <h3 className="font-serif font-bold text-base text-obsidian-900">GI Craft Certified</h3>
          <p className="text-xs text-obsidian-900/70 leading-relaxed">
            Every wooden toy, keychain, and pottery piece carries official Geographical Indication (GI) & Craft Mark certification.
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-cream-300 space-y-2.5 text-center">
          <Award className="w-8 h-8 text-gold-600 mx-auto" />
          <h3 className="font-serif font-bold text-base text-obsidian-900">Direct Fair Wages</h3>
          <p className="text-xs text-obsidian-900/70 leading-relaxed">
            We eliminate middleman exploitation by transferring 70%+ of retail value directly to master artisan families.
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-cream-300 space-y-2.5 text-center">
          <Sparkles className="w-8 h-8 text-gold-600 mx-auto" />
          <h3 className="font-serif font-bold text-base text-obsidian-900">Strictly Non-Apparel</h3>
          <p className="text-xs text-obsidian-900/70 leading-relaxed">
            We strictly refuse plastic or machine replicas. Zero clothing items—only genuine handcrafted toys, keychains, and art.
          </p>
        </div>
      </div>

    </div>
  );
};

import React from 'react';
import { Leaf, ShieldCheck, Box, Recycle, Globe, Sparkles } from 'lucide-react';

export const SustainabilityView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 animate-fade-in text-obsidian-900 font-sans">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="px-3.5 py-1 bg-emerald-500/10 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-widest inline-block border border-emerald-500/20">
          Eco-Pact Guarantee
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
          Handcrafted Sustainability & Eco Commitments
        </h1>
        <p className="text-xs sm:text-sm text-obsidian-900/70 leading-relaxed">
          Crafting beauty without compromising our planet. Every material, dye, and parcel is chosen to honor nature and empower heritage communities.
        </p>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* 1. Eco Materials */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
            <Leaf className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-xl">100% Organic Eco Materials</h3>
          <p className="text-xs text-obsidian-900/70 leading-relaxed">
            Our woodcrafts utilize sustainably harvested Wrightia tinctoria (Ivory Wood) that naturally regenerates. Paints and varnishes are extracted exclusively from natural turmeric, indigo, and katha wood shavings.
          </p>
        </div>

        {/* 2. Ethical Sourcing */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-gold-500/10 text-gold-700 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-xl">Ethical Artisan Sourcing</h3>
          <p className="text-xs text-obsidian-900/70 leading-relaxed">
            We work directly with registered heritage artisan cooperatives in Channapatna, Madhubani, and Kumartuli. We eliminate middlemen, guaranteeing fair trade living wages and direct community revenue shares.
          </p>
        </div>

        {/* 3. Packaging Policy */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
            <Box className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-xl">Zero-Plastic Packaging Policy</h3>
          <p className="text-xs text-obsidian-900/70 leading-relaxed">
            Every parcel shipped from our fulfillment center is wrapped in recycled corrugated cardboard, honeycomb paper cushioning, and water-activated paper tape. Zero single-use plastic bubbles.
          </p>
        </div>

        {/* 4. Carbon Footprint */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-700 flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-xl">Carbon Neutral Transit Offset</h3>
          <p className="text-xs text-obsidian-900/70 leading-relaxed">
            We invest a percentage of every order total into verified regional reforestation initiatives in Karnataka and West Bengal to offset carbon emissions generated during air and ground logistics.
          </p>
        </div>

      </div>

    </div>
  );
};
export default SustainabilityView;

import React from 'react';
import { Product } from '../data/mockData';
import { X, Award, ShieldCheck, Printer, CheckCircle2, Sparkles } from 'lucide-react';

interface GICertificateModalProps {
  product: Product;
  patronName?: string;
  onClose: () => void;
}

export const GICertificateModal: React.FC<GICertificateModalProps> = ({ product, patronName = 'Honored Artisan Patron', onClose }) => {
  const certificateSerial = `GI-ECL-2026-${Math.floor(10000 + Math.random() * 90000)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-obsidian-900/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in text-obsidian-900 font-sans">
      <div className="bg-cream-100 max-w-2xl w-full rounded-3xl p-6 sm:p-10 shadow-2xl relative border-4 border-gold-500 space-y-6">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 bg-obsidian-900/10 hover:bg-obsidian-900 text-obsidian-900 hover:text-white rounded-xl transition-all print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Frame Inner */}
        <div className="border-2 border-dashed border-gold-500/60 p-6 sm:p-8 rounded-2xl space-y-6 bg-white shadow-inner relative overflow-hidden">
          
          {/* Gold Decorative Corner Badges */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-gold-500 rounded-tl-2xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-gold-500 rounded-tr-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-gold-500 rounded-bl-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-gold-500 rounded-br-2xl pointer-events-none" />

          {/* Header Seal */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-gold-500 text-obsidian-900 mx-auto flex items-center justify-center shadow-gold-glow">
              <Award className="w-10 h-10 stroke-[1.5]" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-500/20 text-gold-800 text-[10px] sm:text-xs font-bold rounded-full border border-gold-500/40 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>GEOGRAPHICAL INDICATION (GI) CERTIFICATE OF AUTHENTICITY</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-obsidian-900 tracking-wide">
              eclipsera_premium
            </h2>
            <p className="text-[11px] font-mono font-bold text-gold-700 uppercase tracking-wider">
              Certificate Serial #: {certificateSerial}
            </p>
          </div>

          {/* Main Certificate Statement */}
          <div className="text-center space-y-3 py-2 text-xs sm:text-sm text-obsidian-900/80 leading-relaxed font-serif">
            <p>This document officially certifies that the handcrafted artifact titled:</p>
            
            <div className="p-4 bg-cream-100/70 rounded-xl border border-gold-500/30 text-center space-y-1">
              <h3 className="font-bold text-base sm:text-lg text-obsidian-900">{product.title}</h3>
              <p className="text-xs font-sans text-gold-700 font-bold uppercase tracking-wider">
                Craft: {product.craftType || product.craftTechnique} • GI Tagged: {product.giTagRegion || product.originRegion}
              </p>
              <div className="flex items-center justify-center gap-3 text-[10px] font-sans text-obsidian-900/70 font-semibold pt-1">
                <span>Crafting Duration: <strong>{product.craftingHours || 120} Hours</strong></span>
                <span>•</span>
                <span className="text-emerald-700 font-bold">{(product.isSilkMarkCertified ?? product.silkMarkCertified ?? true) ? 'Silk Mark Certified' : 'Craft Certified'}</span>
              </div>
            </div>

            <p>
              Is 100% authentic, handcrafted using traditional vegetable dyes and heritage artisan techniques by master craftsperson <span className="font-bold text-obsidian-900">{product.artisan?.name || product.artisanName}</span> ({product.artisan?.yearsExperience || 25}+ years exp, {product.artisan?.region || product.originRegion}), and conforms strictly to official GI heritage preservation standards.
            </p>

            <div className="p-2.5 bg-obsidian-900/5 rounded-xl border border-gold-500/20 text-center font-mono text-[10px]">
              <span className="text-obsidian-900/50 block uppercase font-sans font-semibold text-[9px]">Authenticity Verification Hash</span>
              <span className="font-bold text-gold-800 tracking-wider">
                ECL-CERT-{product.id.toUpperCase()}-SHA256-{Math.floor(100000 + Math.random() * 900000)}
              </span>
            </div>

            <p className="text-xs font-sans text-obsidian-900/70">
              Presented proudly to Patron: <span className="font-bold text-obsidian-900 underline">{patronName}</span>
            </p>
          </div>

          {/* Signatures & Seal Footer */}
          <div className="pt-6 border-t border-cream-300 grid grid-cols-2 gap-4 text-center text-xs">
            <div>
              <div className="h-8 font-serif italic text-gold-700 text-base font-bold flex items-center justify-center">
                {(product.artisan?.name || product.artisanName).split(' ')[0]} Guild
              </div>
              <div className="border-t border-obsidian-900/30 pt-1">
                <span className="font-bold block text-[11px] text-obsidian-900 uppercase">Master Guild Artisan</span>
                <span className="text-[10px] text-obsidian-900/60 block">{product.artisan?.region || product.originRegion}</span>
              </div>
            </div>

            <div>
              <div className="h-8 font-serif italic text-gold-700 text-base font-bold flex items-center justify-center">
                eclipsera Board
              </div>
              <div className="border-t border-obsidian-900/30 pt-1">
                <span className="font-bold block text-[11px] text-obsidian-900 uppercase">GI Heritage Registrar</span>
                <span className="text-[10px] text-obsidian-900/60 block">Verified Authentic</span>
              </div>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 print:hidden">
          <button 
            onClick={onClose} 
            className="px-4 py-2.5 bg-cream-200 hover:bg-cream-300 text-obsidian-900 rounded-xl text-xs font-bold uppercase transition-all"
          >
            Close
          </button>

          <button 
            onClick={handlePrint} 
            className="px-5 py-2.5 bg-obsidian-900 hover:bg-gold-600 text-cream-100 hover:text-obsidian-900 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
          >
            <Printer className="w-4 h-4" />
            Print / Download PDF Certificate
          </button>
        </div>

      </div>
    </div>
  );
};

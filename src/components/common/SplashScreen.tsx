import React from 'react';
import { ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onEnter: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] text-cream-100 flex flex-col items-center justify-center p-6 select-none font-sans">
      
      <div className="flex flex-col items-center text-center max-w-sm space-y-8 animate-fade-in">
        
        {/* Clean Luxury Logo */}
        <img 
          src="/eclipsera_logo.png" 
          alt="ECLIPSERA PREMIUM" 
          className="w-56 sm:w-64 h-auto object-contain drop-shadow-2xl"
        />

        {/* Minimal Subtitle */}
        <p className="text-xs text-cream-300/70 tracking-[0.2em] uppercase font-mono">
          Handcrafted Luxury Artifacts
        </p>

        {/* Simple Clean Start Button */}
        <button
          onClick={onEnter}
          className="w-full bg-gold-500 hover:bg-gold-400 text-obsidian-900 font-extrabold py-3.5 px-6 rounded-xl text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-100"
        >
          <span>ENTER STORE</span>
          <ArrowRight className="w-4 h-4 text-obsidian-900" />
        </button>

      </div>

    </div>
  );
};

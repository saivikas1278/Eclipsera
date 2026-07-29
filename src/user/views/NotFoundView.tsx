import React from 'react';
import { useUser } from '../context/UserContext';
import { Home, ShoppingBag, Compass } from 'lucide-react';

export const NotFoundView: React.FC = () => {
  const { setCurrentView } = useUser();

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6 animate-fade-in text-obsidian-900 font-sans">
      <div className="w-20 h-20 bg-gold-500/10 text-gold-700 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-gold-500/20">
        <Compass className="w-10 h-10 animate-spin-slow" />
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gold-700 bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/20">
          404 Page Not Found
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
          This Path Has Moved to Another Lathe
        </h1>
        <p className="text-xs sm:text-sm text-obsidian-900/70 max-w-md mx-auto leading-relaxed">
          The requested page URL could not be located in our catalog index. Explore our handcrafted collections or return to the main storefront.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <button
          onClick={() => setCurrentView('home')}
          className="px-5 py-3 bg-obsidian-900 text-cream-100 hover:bg-gold-500 hover:text-obsidian-950 font-bold uppercase text-xs rounded-xl flex items-center gap-2 transition-all shadow-md"
        >
          <Home className="w-4 h-4" />
          <span>Return to Home</span>
        </button>

        <button
          onClick={() => setCurrentView('shop')}
          className="px-5 py-3 bg-cream-100 hover:bg-cream-200 border border-cream-300 font-bold uppercase text-xs rounded-xl flex items-center gap-2 transition-all"
        >
          <ShoppingBag className="w-4 h-4 text-gold-700" />
          <span>Browse Heritage Catalog</span>
        </button>
      </div>
    </div>
  );
};
export default NotFoundView;

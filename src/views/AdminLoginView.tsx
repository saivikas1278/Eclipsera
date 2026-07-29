import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Lock, Key, ArrowRight, Zap } from 'lucide-react';

export const AdminLoginView: React.FC = () => {
  const { adminLogin, setCurrentView } = useStore();
  const [password, setPassword] = useState('admin123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = adminLogin(password);
    if (success) {
      setCurrentView('admin-dashboard');
    }
  };

  const handleQuickLogin = () => {
    setPassword('admin123');
    const success = adminLogin('admin123');
    if (success) {
      setCurrentView('admin-dashboard');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-20 animate-fade-in pb-28 md:pb-12">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gold-500/30 space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-obsidian-900 text-gold-400 rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-obsidian-900">
            eclipsera<span className="text-gold-600 font-light">_admin</span>
          </h2>
          <p className="text-xs text-obsidian-900/60 font-medium">
            Administrative Control & Store Management Portal
          </p>
        </div>

        {/* 1-Tap Quick Admin Login Button */}
        <div className="p-3 bg-gold-500/10 border border-gold-500/30 rounded-2xl space-y-1.5 text-center">
          <span className="text-[11px] font-bold text-obsidian-900 block">Testing Admin Portal?</span>
          <button 
            type="button"
            onClick={handleQuickLogin}
            className="w-full py-2 bg-gold-500 text-obsidian-900 hover:bg-gold-400 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <Zap className="w-4 h-4" />
            <span>1-Tap Quick Admin Login</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-obsidian-900 uppercase block mb-1">
              Admin Access Password
            </label>
            <div className="relative">
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (admin123)"
                className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3.5 py-3 text-xs text-obsidian-900 font-bold focus:outline-none focus:border-gold-500"
              />
              <Key className="w-4 h-4 text-gold-600 absolute right-3.5 top-3" />
            </div>
            <p className="text-[11px] text-gold-700 font-semibold mt-1">Default demo password: <code className="bg-cream-200 px-1 py-0.5 rounded">admin123</code></p>
          </div>

          <button 
            type="submit"
            className="w-full bg-obsidian-900 text-cream-100 hover:bg-gold-600 hover:text-obsidian-900 py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <span>Authenticate Admin Session</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Return to Customer Storefront Link */}
        <div className="pt-2 border-t border-cream-200 text-center">
          <button 
            type="button"
            onClick={() => setCurrentView('home')}
            className="text-xs font-bold text-obsidian-900/60 hover:text-obsidian-900 hover:underline uppercase tracking-wider"
          >
            ← Return to Patron Storefront
          </button>
        </div>

      </div>
    </div>
  );
};

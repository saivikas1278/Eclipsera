import React, { useState } from 'react';
import { Wrench, Mail, CheckCircle2 } from 'lucide-react';

export const MaintenanceView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-obsidian-900 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border-2 border-gold-500/30 shadow-2xl text-center space-y-6">
        <div className="w-14 h-14 bg-gold-500/10 text-gold-700 rounded-2xl flex items-center justify-center mx-auto border border-gold-500/20">
          <Wrench className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gold-700 bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/20 inline-block">
            Store Maintenance Mode
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            Curating New Artisan Collections
          </h1>
          <p className="text-xs text-obsidian-900/70 leading-relaxed font-sans">
            Our storefront is currently undergoing scheduled maintenance while we onboard new heritage guilds. We will return online shortly!
          </p>
        </div>

        {subscribed ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs space-y-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
            <p className="font-bold">You're on the priority notification list!</p>
            <p className="text-[11px]">We will notify {email} as soon as browsing re-opens.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs font-semibold">
            <label className="block text-[10px] font-bold uppercase text-obsidian-900/60">
              Get Notified When We Re-Open
            </label>
            <div className="relative">
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="enter your email..."
                className="w-full bg-cream-100 border border-cream-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-gold-500"
              />
              <Mail className="w-4 h-4 text-gold-600 absolute left-3 top-3" />
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-obsidian-900 text-cream-100 hover:bg-gold-500 hover:text-obsidian-950 font-bold uppercase tracking-widest rounded-xl transition-all shadow-md"
            >
              Notify Me
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
export default MaintenanceView;

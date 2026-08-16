import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const VaultSection = () => {
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60 - 3600); // Start at around 23 hours

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(timeLeft / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <section className="my-16 mx-3 md:mx-0 bg-bg-base relative rounded-3xl overflow-hidden shadow-2xl border border-accent-gold/20">
      <div className="absolute inset-0 bg-accent-gold/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="relative z-10 flex flex-col md:flex-row items-center p-8 md:p-16 gap-8 md:gap-16">
        <div className="flex-1 text-center md:text-left flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border border-accent-gold/50 text-accent-gold text-xs font-bold uppercase tracking-widest bg-accent-gold/10 backdrop-blur-sm self-center md:self-start shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Exclusive Drop
          </div>
          <h2 className="text-2xl md:text-4xl font-bold font-serif text-text-primary text-center mb-8 md:mb-12 tracking-tight">The Vault</h2>
          <p className="text-text-primary/80 text-lg md:text-xl mb-10 leading-relaxed max-w-md mx-auto md:mx-0 font-light">
            Limited edition pieces crafted in extreme small batches. Once the timer ends, the vault closes forever.
          </p>
          <div className="flex items-center justify-center md:justify-start gap-4 mb-10">
            <div className="flex flex-col items-center bg-surface border border-accent-gold/30 rounded-xl p-4 min-w-[80px] shadow-inner">
              <span className="text-4xl font-bold font-serif text-accent-gold">{hours}</span>
              <span className="text-[10px] uppercase tracking-wider text-text-secondary mt-1">Hours</span>
            </div>
            <span className="text-3xl font-bold text-accent-gold animate-pulse">:</span>
            <div className="flex flex-col items-center bg-surface border border-accent-gold/30 rounded-xl p-4 min-w-[80px] shadow-inner">
              <span className="text-4xl font-bold font-serif text-accent-gold">{minutes}</span>
              <span className="text-[10px] uppercase tracking-wider text-text-secondary mt-1">Mins</span>
            </div>
            <span className="text-3xl font-bold text-accent-gold animate-pulse">:</span>
            <div className="flex flex-col items-center bg-surface border border-accent-gold/30 rounded-xl p-4 min-w-[80px] shadow-inner">
              <span className="text-4xl font-bold font-serif text-accent-gold">{seconds}</span>
              <span className="text-[10px] uppercase tracking-wider text-text-secondary mt-1">Secs</span>
            </div>
          </div>
          <Link to="/search?category=Vault" className="inline-block bg-accent-gold hover:bg-accent-gold-hover text-bg-base font-bold py-4 px-10 rounded-xl transition-all shadow-lg active:scale-95 uppercase tracking-wider self-center md:self-start">
            Unlock The Vault
          </Link>
        </div>
        <div className="flex-1 w-full relative h-[400px] md:h-[600px] rounded-2xl overflow-hidden border border-accent-gold/30 shadow-2xl group">
          <div className="absolute inset-0 bg-surface/50 flex items-center justify-center text-text-secondary">
             <div className="w-full h-full bg-accent-gold/10 flex items-center justify-center text-accent-gold font-serif font-bold text-2xl group-hover:scale-110 transition-transform duration-[10000ms]">
                Curated Collection
             </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/20 to-transparent"></div>
        </div>
      </div>
    </section>
  );
};

export default VaultSection;

import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, Lock, Mail, Phone, ArrowRight, User } from 'lucide-react';

export const RegisterView: React.FC = () => {
  const { customerRegister, customerGoogleLogin, setCurrentView } = useStore();

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) return;
    await customerRegister(regName, regEmail, regPhone, regPassword);
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 w-full font-sans">
      
      {/* Centered Register Card Wrapper */}
      <div className="w-full max-w-md space-y-4 my-auto">
        
        {/* Main Card Container */}
        <div className="bg-white rounded-3xl border border-cream-300 shadow-xl overflow-hidden w-full">
          
          {/* Header Title */}
          <div className="p-6 pb-4 border-b border-cream-200 text-center space-y-1">
            <h1 className="font-serif text-2xl font-bold text-obsidian-900">Create Account</h1>
            <p className="text-xs text-obsidian-900/60 font-sans">Join eclipsera_premium for GI-certified handcrafted artifacts.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="p-6 space-y-4 animate-fade-in">
            <div>
              <label className="text-xs font-bold text-obsidian-900 uppercase block mb-1">Full Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Ananya Sharma"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-cream-100 border border-cream-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-obsidian-900 font-medium focus:outline-none focus:border-gold-500"
                />
                <User className="w-4 h-4 text-obsidian-900/40 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-obsidian-900 uppercase block mb-1">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  required
                  placeholder="e.g. ananya.sharma@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-cream-100 border border-cream-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-obsidian-900 font-medium focus:outline-none focus:border-gold-500"
                />
                <Mail className="w-4 h-4 text-obsidian-900/40 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-obsidian-900 uppercase block mb-1">Mobile Phone Number</label>
              <div className="relative">
                <input 
                  type="tel" 
                  required
                  maxLength={10}
                  placeholder="9876543210"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full bg-cream-100 border border-cream-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-obsidian-900 font-medium focus:outline-none focus:border-gold-500"
                />
                <Phone className="w-4 h-4 text-obsidian-900/40 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-obsidian-900 uppercase block mb-1">Create Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-cream-100 border border-cream-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-obsidian-900 font-medium focus:outline-none focus:border-gold-500"
                />
                <Lock className="w-4 h-4 text-obsidian-900/40 absolute left-3 top-3" />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-gold-500 text-obsidian-900 hover:bg-gold-400 py-3 rounded-xl text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 shadow-md transition-all mt-2"
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

          {/* Dedicated Link to Sign In Page */}
          <div className="p-4 bg-cream-100 border-t border-cream-200 text-center text-xs">
            <span className="text-obsidian-900/70">Already have an account? </span>
            <button 
              onClick={() => setCurrentView('auth')}
              className="font-bold text-gold-700 hover:underline uppercase tracking-wider ml-1"
            >
              Sign In
            </button>
          </div>

        </div>

        {/* Security Trust Footnote */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px] font-semibold text-obsidian-900/60 pt-1 text-center">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
            256-Bit Encrypted Data
          </span>
          <span>•</span>
          <span>GI Craft Mark Certified</span>
          <span>•</span>
          <span>Zero Spam Policy</span>
        </div>

      </div>

    </div>
  );
};

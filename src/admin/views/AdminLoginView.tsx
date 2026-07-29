import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Lock, Key, ArrowRight, ShieldCheck, Mail, AlertCircle } from 'lucide-react';

export const AdminLoginView: React.FC = () => {
  const { adminLogin } = useAdmin();
  const [email, setEmail] = useState('admin@eclipsera.com');
  const [password, setPassword] = useState('admin123');
  const [otp, setOtp] = useState('');
  
  // Login stages
  const [stage, setStage] = useState<'LOGIN' | 'OTP'>('LOGIN');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Check credentials
    if (password.length >= 3) {
      setStage('OTP');
    } else {
      setErrorMsg('Please enter a valid administrative password.');
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (otp === '123456' || otp.length === 6 || otp.length === 4) {
      const ok = await adminLogin(password);
      if (!ok) {
        setErrorMsg('Authentication failed. Check your admin password.');
      }
    } else {
      setErrorMsg('Invalid 2FA OTP code. Enter 123456');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 text-zinc-100 font-sans animate-fade-in">
      <div className="w-full max-w-md bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-800 space-y-6 animate-scale-up">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-white">
            eclipsera<span className="text-indigo-400 font-light">_admin</span>
          </h2>
          <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-bold uppercase tracking-widest inline-block border border-indigo-500/20">
            Admin Control Panel
          </span>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {stage === 'LOGIN' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-zinc-400">
                Admin Email Address
              </label>
              <div className="relative">
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@eclipsera.com"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium"
                />
                <Mail className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3.5" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-zinc-400">
                Access Password
              </label>
              <div className="relative">
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium"
                />
                <Key className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/25"
            >
              <span>Verify Credentials</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="font-semibold">Step 2: 2FA Authentication email challenge sent.</p>
            </div>

            {/* OTP Code Input */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-center text-zinc-400">
                Enter 6-Digit OTP Code
              </label>
              <input 
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 text-center text-lg font-mono font-bold tracking-widest text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-[10px] text-zinc-400 font-semibold text-center mt-1.5">For demo enter code: <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-indigo-400 font-mono">123456</code></p>
            </div>

            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setStage('LOGIN')}
                className="px-4 py-3 border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold uppercase transition-colors"
              >
                Back
              </button>
              <button 
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-indigo-600/25"
              >
                <ShieldCheck className="w-4 h-4" />
                Authenticate
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
export default AdminLoginView;

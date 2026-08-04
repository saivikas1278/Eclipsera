import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, Lock, Mail, Phone, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';

export const AuthView: React.FC = () => {
  const { customerLogin, customerGoogleLogin, requestOTP, verifyOTP, setCurrentView } = useStore();

  const [loginMethod, setLoginMethod] = useState<'email' | 'otp'>('email');

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtpCode, setDemoOtpCode] = useState('');

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);



  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    customerLogin(email, password);
  };

  const handleRequestOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;
    const res = requestOTP(phone);
    setOtpSent(true);
    setDemoOtpCode(res.demoOTP);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    verifyOTP(phone, otp);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetSent(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 w-full font-sans">
      
      {/* Centered Auth Card Wrapper */}
      <div className="w-full max-w-md space-y-4 my-auto">
        
        {/* Main Auth Container */}
        <div className="bg-white rounded-3xl border border-cream-300 shadow-xl overflow-hidden w-full">
          
          {/* Header Title */}
          <div className="p-6 pb-4 border-b border-cream-200 text-center space-y-1">
            <h1 className="font-serif text-2xl font-bold text-obsidian-900">Sign In</h1>
            <p className="text-xs text-obsidian-900/60 font-sans">Enter your credentials to access your patron account.</p>
          </div>

          <div className="p-5 sm:p-7 space-y-5">
            
            {/* Method Toggle: Email vs Mobile OTP */}
            <div className="flex bg-cream-100 p-1 rounded-xl border border-cream-300 text-xs font-semibold">
              <button 
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all ${loginMethod === 'email' ? 'bg-obsidian-900 text-cream-100 font-bold shadow-sm' : 'text-obsidian-900/70'}`}
              >
                Email & Password
              </button>
              <button 
                onClick={() => setLoginMethod('otp')}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all ${loginMethod === 'otp' ? 'bg-obsidian-900 text-cream-100 font-bold shadow-sm' : 'text-obsidian-900/70'}`}
              >
                Instant Mobile OTP
              </button>
            </div>

            {/* Email Login Form */}
            {loginMethod === 'email' ? (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                

                <div>
                  <label className="text-xs font-bold text-obsidian-900 uppercase block mb-1">Email Address</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      required
                      placeholder="ananya.sharma@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-cream-100 border border-cream-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-obsidian-900 font-medium focus:outline-none focus:border-gold-500"
                    />
                    <Mail className="w-4 h-4 text-obsidian-900/40 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-obsidian-900 uppercase">Password</label>
                    <button 
                      type="button" 
                      onClick={() => setIsForgotModalOpen(true)}
                      className="text-[11px] font-bold text-gold-700 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-cream-100 border border-cream-300 rounded-xl pl-9 pr-9 py-2.5 text-xs text-obsidian-900 font-medium focus:outline-none focus:border-gold-500"
                    />
                    <Lock className="w-4 h-4 text-obsidian-900/40 absolute left-3 top-3" />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-obsidian-900/40 hover:text-obsidian-900"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-obsidian-900 text-cream-100 hover:bg-gold-600 hover:text-obsidian-900 py-3 rounded-xl text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* Mobile OTP Login Form */
              !otpSent ? (
                <form onSubmit={handleRequestOTP} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-obsidian-900 uppercase block mb-1">Mobile Phone Number</label>
                    <div className="flex gap-2">
                      <span className="bg-cream-200 border border-cream-300 rounded-xl px-3 py-2.5 text-xs font-bold text-obsidian-900 flex items-center shrink-0">
                        +91
                      </span>
                      <div className="relative flex-1">
                        <input 
                          type="tel" 
                          required
                          maxLength={10}
                          placeholder="9876543210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-cream-100 border border-cream-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-obsidian-900 font-bold focus:outline-none focus:border-gold-500"
                        />
                        <Phone className="w-4 h-4 text-obsidian-900/40 absolute left-3 top-3" />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-gold-500 text-obsidian-900 hover:bg-gold-400 py-3 rounded-xl text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <span>Get 4-Digit OTP Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4 animate-fade-in">
                  <div className="p-3 bg-gold-500/10 border border-gold-500/30 rounded-xl text-xs space-y-1">
                    <p className="font-bold text-obsidian-900">OTP Sent to +91 {phone}</p>
                    <p className="text-[11px] text-gold-700 font-mono font-bold">Demo OTP Code: {demoOtpCode || '4821'}</p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-obsidian-900 uppercase block mb-1">Enter 4-Digit Security OTP</label>
                    <input 
                      type="text" 
                      required
                      maxLength={4}
                      placeholder="4821"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3 py-3 text-center text-lg font-mono tracking-[0.5em] font-bold text-obsidian-900 focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <button type="button" onClick={() => setOtpSent(false)} className="text-obsidian-900/60 hover:underline">
                      Change Phone Number
                    </button>
                    <button type="button" onClick={handleRequestOTP} className="text-gold-700 font-bold hover:underline">
                      Resend OTP
                    </button>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-obsidian-900 text-cream-100 hover:bg-gold-600 hover:text-obsidian-900 py-3 rounded-xl text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <span>Verify & Login</span>
                    <CheckCircle2 className="w-4 h-4 text-gold-400" />
                  </button>
                </form>
              )
            )}



          </div>

          {/* Dedicated Link to Create Account Page */}
          <div className="p-4 bg-cream-100 border-t border-cream-200 text-center text-xs">
            <span className="text-obsidian-900/70">Don't have an account? </span>
            <button 
              onClick={() => setCurrentView('register')}
              className="font-bold text-gold-700 hover:underline uppercase tracking-wider ml-1"
            >
              Create Account
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

      {/* Forgot Password Modal Simulator */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-obsidian-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 border border-gold-500/40 shadow-2xl space-y-4 text-center relative">
            <h3 className="font-serif font-bold text-lg text-obsidian-900">Reset Your Password</h3>
            <p className="text-xs text-obsidian-900/70">
              Enter your registered email address to receive password reset instructions.
            </p>

            {resetSent ? (
              <div className="p-3 bg-emerald-500/10 text-emerald-700 rounded-xl text-xs font-bold space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <p>Password reset link sent to {resetEmail}!</p>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <input 
                  type="email" 
                  required
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3 py-2 text-xs text-obsidian-900 font-medium focus:outline-none focus:border-gold-500"
                />
                <button 
                  type="submit" 
                  className="w-full bg-obsidian-900 text-cream-100 hover:bg-gold-600 hover:text-obsidian-900 py-2.5 rounded-xl font-bold text-xs uppercase"
                >
                  Send Reset Link
                </button>
              </form>
            )}

            <button 
              onClick={() => { setIsForgotModalOpen(false); setResetSent(false); }}
              className="text-xs font-semibold text-obsidian-900/60 hover:underline block mx-auto"
            >
              Close Window
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { GoogleLogin } from '@react-oauth/google';
import { ShieldCheck, Lock, Mail, Phone, Eye, EyeOff, ArrowRight, CheckCircle2, Zap, AlertCircle, Loader2 } from 'lucide-react';
import { validateEmail, validatePhone, validatePassword } from '../../shared/utils/authValidation';

export const AuthView: React.FC = () => {
  const { customerLogin, customerGoogleLogin, requestOTP, verifyOTP, setCurrentView, showToast } = useUser();

  const [loginMethod, setLoginMethod] = useState<'email' | 'otp'>('email');

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtpCode, setDemoOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Field Errors (On Blur)
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [resetEmailError, setResetEmailError] = useState<string | null>(null);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);

  const handleFillDemo = () => {
    setEmail('ananya.sharma@example.com');
    setPassword('Patron@123');
    setEmailError(null);
    setPasswordError(null);
  };

  const handleEmailBlur = () => {
    setEmailError(validateEmail(email));
  };

  const handlePasswordBlur = () => {
    setPasswordError(validatePassword(password));
  };

  const handlePhoneBlur = () => {
    setPhoneError(validatePhone(phone));
  };

  const handleResetEmailBlur = () => {
    setResetEmailError(validateEmail(resetEmail));
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);

    if (eErr || pErr) return;

    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await customerLogin(cleanEmail, password);
      if (res && res.success) {
        showToast("Welcome back! Redirecting to your dashboard...", "success");
      }
    } catch (err: any) {
      showToast("Unable to connect to the server. Please check your internet connection and try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOTP = (e: React.FormEvent) => {
    e.preventDefault();
    const pErr = validatePhone(phone);
    setPhoneError(pErr);
    if (pErr) return;

    const cleanPhone = phone.replace(/\D/g, '');
    const res = requestOTP(cleanPhone);
    setOtpSent(true);
    setDemoOtpCode(res.demoOTP);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;

    setIsLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const res = await verifyOTP(cleanPhone, otp);
      if (res && res.success) {
        showToast("Welcome back! Redirecting to your dashboard...", "success");
      }
    } catch (err) {
      showToast("Unable to connect to the server. Please check your internet connection and try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const rErr = validateEmail(resetEmail);
    setResetEmailError(rErr);
    if (rErr) return;

    setIsResetLoading(true);
    setTimeout(() => {
      setIsResetLoading(false);
      setResetSent(true);
      showToast("Reset link sent! Please check your email inbox.", "success");
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 w-full font-sans animate-fade-in">
      
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
                type="button"
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all ${loginMethod === 'email' ? 'bg-obsidian-900 text-cream-100 font-bold shadow-sm' : 'text-obsidian-900/70'}`}
              >
                Email & Password
              </button>
              <button 
                type="button"
                onClick={() => setLoginMethod('otp')}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all ${loginMethod === 'otp' ? 'bg-obsidian-900 text-cream-100 font-bold shadow-sm' : 'text-obsidian-900/70'}`}
              >
                Instant Mobile OTP
              </button>
            </div>

            {/* Email Login Form */}
            {loginMethod === 'email' ? (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                
                {/* 1-Tap Demo Credentials Helper */}
                <div className="flex items-center justify-between p-2.5 bg-gold-500/10 border border-gold-500/30 rounded-xl text-xs">
                  <span className="font-bold text-obsidian-900 text-[11px]">Testing as patron?</span>
                  <button 
                    type="button"
                    onClick={handleFillDemo}
                    className="text-gold-700 font-bold hover:underline text-[11px] flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3 text-gold-600" />
                    Fill Demo Credentials
                  </button>
                </div>

                {/* Email Input */}
                <div>
                  <label className="text-xs font-bold text-obsidian-900 uppercase block mb-1">Email Address</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      required
                      placeholder="ananya.sharma@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={handleEmailBlur}
                      className={`w-full bg-cream-100 border ${emailError ? 'border-rose-500' : 'border-cream-300'} rounded-xl pl-9 pr-3 py-2.5 text-xs text-obsidian-900 font-medium focus:outline-none focus:border-gold-500`}
                    />
                    <Mail className="w-4 h-4 text-obsidian-900/40 absolute left-3 top-3" />
                  </div>
                  {emailError && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{emailError}</span>
                    </p>
                  )}
                </div>

                {/* Password Input */}
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
                      onBlur={handlePasswordBlur}
                      className={`w-full bg-cream-100 border ${passwordError ? 'border-rose-500' : 'border-cream-300'} rounded-xl pl-9 pr-9 py-2.5 text-xs text-obsidian-900 font-medium focus:outline-none focus:border-gold-500`}
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
                  {passwordError && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{passwordError}</span>
                    </p>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-obsidian-900 text-cream-100 hover:bg-gold-600 hover:text-obsidian-900 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
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
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          onBlur={handlePhoneBlur}
                          className={`w-full bg-cream-100 border ${phoneError ? 'border-rose-500' : 'border-cream-300'} rounded-xl pl-9 pr-3 py-2.5 text-xs text-obsidian-900 font-bold focus:outline-none focus:border-gold-500`}
                        />
                        <Phone className="w-4 h-4 text-obsidian-900/40 absolute left-3 top-3" />
                      </div>
                    </div>
                    {phoneError && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{phoneError}</span>
                      </p>
                    )}
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
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
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
                    disabled={isLoading}
                    className="w-full bg-obsidian-900 text-cream-100 hover:bg-gold-600 hover:text-obsidian-900 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify & Login</span>
                        <CheckCircle2 className="w-4 h-4 text-gold-400" />
                      </>
                    )}
                  </button>
                </form>
              )
            )}

            {/* Official Google OAuth 2.0 Login */}
            <div className="pt-3 border-t border-cream-300 space-y-2 text-center flex flex-col items-center">
              <span className="text-[10px] font-bold text-obsidian-900/40 uppercase tracking-widest block mb-1">Or Sign In With Google</span>
              <div className="w-full flex justify-center flex-col items-center gap-2">
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    if (credentialResponse.credential) {
                      customerGoogleLogin(credentialResponse.credential);
                    }
                  }}
                  onError={() => {
                    customerGoogleLogin({ email: 'patron.google@gmail.com', name: 'Google Patron' });
                  }}
                  useOneTap={false}
                  theme="outline"
                  shape="pill"
                  size="large"
                  text="signin_with"
                  width="280"
                />

                {/* Direct Google 1-Tap Fallback Button */}
                <button
                  type="button"
                  onClick={() => customerGoogleLogin({ email: 'patron.google@gmail.com', name: 'Google Patron' })}
                  className="w-full py-2.5 px-4 border border-cream-300 rounded-xl text-xs font-semibold text-obsidian-900 hover:bg-cream-200 transition-all flex items-center justify-center gap-2"
                >
                  <span className="font-bold text-red-500 text-sm">G</span>
                  <span>1-Tap Google Sign-In</span>
                </button>
              </div>
            </div>

          </div>

          {/* Dedicated Link to Create Account Page */}
          <div className="p-4 bg-cream-100 border-t border-cream-200 text-center text-xs">
            <span className="text-obsidian-900/70">Don't have an account? </span>
            <button 
              type="button"
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
                <p>Reset link sent! Please check your email inbox.</p>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <div>
                  <input 
                    type="email" 
                    required
                    placeholder="Enter your email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    onBlur={handleResetEmailBlur}
                    className={`w-full bg-cream-100 border ${resetEmailError ? 'border-rose-500' : 'border-cream-300'} rounded-xl px-3 py-2.5 text-xs text-obsidian-900 font-medium focus:outline-none focus:border-gold-500`}
                  />
                  {resetEmailError && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 text-left flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{resetEmailError}</span>
                    </p>
                  )}
                </div>
                <button 
                  type="submit" 
                  disabled={isResetLoading}
                  className="w-full bg-obsidian-900 text-cream-100 hover:bg-gold-600 hover:text-obsidian-900 disabled:opacity-50 disabled:cursor-not-allowed py-2.5 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2"
                >
                  {isResetLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-400" />
                      <span>Sending Link...</span>
                    </>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </form>
            )}

            <button 
              type="button"
              onClick={() => { setIsForgotModalOpen(false); setResetSent(false); setResetEmailError(null); }}
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
export default AuthView;

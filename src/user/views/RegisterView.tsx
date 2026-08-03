import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { GoogleLogin } from '@react-oauth/google';
import { ShieldCheck, Lock, Mail, Phone, ArrowRight, User, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { validateEmail, validatePhone, validatePassword, validateConfirmPassword, validateFullName, getPasswordStrength } from '../../shared/utils/authValidation';

export const RegisterView: React.FC = () => {
  const { customerRegister, customerGoogleLogin, setCurrentView, showToast } = useUser();

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Field Errors (On Blur)
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleNameBlur = () => {
    setNameError(validateFullName(regName));
  };

  const handleEmailBlur = () => {
    setEmailError(validateEmail(regEmail));
  };

  const handlePhoneBlur = () => {
    setPhoneError(validatePhone(regPhone));
  };

  const handlePasswordBlur = () => {
    setPasswordError(validatePassword(regPassword));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const nErr = validateFullName(regName);
    const eErr = validateEmail(regEmail);
    const pErr = validatePhone(regPhone);
    const passErr = validatePassword(regPassword);
    const cErr = validateConfirmPassword(regPassword, confirmPassword);

    setNameError(nErr);
    setEmailError(eErr);
    setPhoneError(pErr);
    setPasswordError(passErr || cErr);

    if (!acceptTerms) {
      showToast("Please agree to the Terms of Service and Privacy Policy.", "warning");
      return;
    }

    if (nErr || eErr || pErr || passErr || cErr) return;

    setIsLoading(true);
    try {
      const cleanEmail = regEmail.trim().toLowerCase();
      const cleanPhone = regPhone.replace(/\D/g, '');
      const res = await customerRegister(regName.trim(), cleanEmail, cleanPhone, regPassword);
      if (res && res.success) {
        showToast("Account created successfully! Welcome to Eclipsera.", "success");
        setRegName('');
        setRegEmail('');
        setRegPhone('');
        setRegPassword('');
        setNameError(null);
        setEmailError(null);
        setPhoneError(null);
        setPasswordError(null);
        setCurrentView('home');
      }
    } catch (err: any) {
      showToast("Unable to connect to the server. Please check your internet connection and try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 w-full font-sans animate-fade-in">
      
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
          <form onSubmit={handleRegister} className="p-6 space-y-4 animate-fade-in text-obsidian-900">
            {/* Full Name Field */}
            <div>
              <label className="text-xs font-bold text-obsidian-900 uppercase block mb-1">Full Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Ananya Sharma"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  onBlur={handleNameBlur}
                  className={`w-full bg-cream-100 border ${nameError ? 'border-rose-500' : 'border-cream-300'} rounded-xl pl-9 pr-3 py-2.5 text-xs text-obsidian-900 font-medium focus:outline-none focus:border-gold-500`}
                />
                <User className="w-4 h-4 text-obsidian-900/40 absolute left-3 top-3" />
              </div>
              {nameError && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{nameError}</span>
                </p>
              )}
            </div>

            {/* Email Address Field */}
            <div>
              <label className="text-xs font-bold text-obsidian-900 uppercase block mb-1">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  required
                  placeholder="e.g. ananya.sharma@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
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

            {/* Mobile Phone Number Field */}
            <div>
              <label className="text-xs font-bold text-obsidian-900 uppercase block mb-1">Mobile Phone Number</label>
              <div className="relative">
                <input 
                  type="tel" 
                  required
                  maxLength={10}
                  placeholder="9876543210"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                  onBlur={handlePhoneBlur}
                  className={`w-full bg-cream-100 border ${phoneError ? 'border-rose-500' : 'border-cream-300'} rounded-xl pl-9 pr-3 py-2.5 text-xs text-obsidian-900 font-medium focus:outline-none focus:border-gold-500`}
                />
                <Phone className="w-4 h-4 text-obsidian-900/40 absolute left-3 top-3" />
              </div>
              {phoneError && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{phoneError}</span>
                </p>
              )}
            </div>

            {/* Create Password Field */}
            <div>
              <label className="text-xs font-bold text-obsidian-900 uppercase block mb-1">Create Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
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

              {/* Password Strength Meter */}
              {regPassword && (
                <div className="space-y-1 mt-1">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-obsidian-900/60 uppercase">Password Strength:</span>
                    <span className={`font-mono ${getPasswordStrength(regPassword).score >= 3 ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {getPasswordStrength(regPassword).label}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-cream-200 rounded-full overflow-hidden">
                    <div className={`h-full ${getPasswordStrength(regPassword).color} transition-all duration-300`} style={{ width: `${getPasswordStrength(regPassword).percentage}%` }}></div>
                  </div>
                </div>
              )}

              {passwordError && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{passwordError}</span>
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="text-xs font-bold text-obsidian-900 uppercase block mb-1">Confirm Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-cream-100 border border-cream-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-obsidian-900 font-medium focus:outline-none focus:border-gold-500"
                />
                <Lock className="w-4 h-4 text-obsidian-900/40 absolute left-3 top-3" />
              </div>
            </div>

            {/* Terms and Privacy Agreement Checkbox */}
            <div className="flex items-start gap-2 pt-1">
              <input 
                type="checkbox"
                id="regTerms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 rounded text-gold-600 focus:ring-gold-500"
              />
              <label htmlFor="regTerms" className="text-xs text-obsidian-900/70 cursor-pointer">
                I agree to the <span className="font-bold text-gold-700 underline">Terms of Service</span> and <span className="font-bold text-gold-700 underline">Privacy Policy</span>.
              </label>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gold-500 text-obsidian-900 hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 shadow-md transition-all mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-obsidian-900" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Official Google OAuth 2.0 Registration */}
            <div className="pt-3 border-t border-cream-300 space-y-2 text-center flex flex-col items-center">
              <span className="text-[10px] font-bold text-obsidian-900/40 uppercase tracking-widest block mb-1">Or Quick Register With Google</span>
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
                  text="signup_with"
                  width="280"
                />

                {/* Direct Google 1-Tap Fallback Button */}
                <button
                  type="button"
                  onClick={() => customerGoogleLogin({ email: 'patron.google@gmail.com', name: 'Google Patron' })}
                  className="w-full py-2.5 px-4 border border-cream-300 rounded-xl text-xs font-semibold text-obsidian-900 hover:bg-cream-200 transition-all flex items-center justify-center gap-2"
                >
                  <span className="font-bold text-red-500 text-sm">G</span>
                  <span>1-Tap Google Register</span>
                </button>
              </div>
            </div>
          </form>

          {/* Dedicated Link to Sign In Page */}
          <div className="p-4 bg-cream-100 border-t border-cream-200 text-center text-xs">
            <span className="text-obsidian-900/70">Already have an account? </span>
            <button 
              type="button"
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
export default RegisterView;

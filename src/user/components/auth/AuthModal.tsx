import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { X, Lock, Mail, Phone, Eye, EyeOff, ArrowRight, ShieldCheck, Zap, AlertCircle, Loader2, CheckCircle2, User } from 'lucide-react';
import { validateEmail, validatePhone, validatePassword, validateConfirmPassword, validateFullName, getPasswordStrength } from '../../../shared/utils/authValidation';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    pendingAction, 
    customerLogin, 
    customerRegister, 
    showToast 
  } = useUser();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Sign In Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign Up Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);

  // Shared States
  const [isLoading, setIsLoading] = useState(false);
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [passErr, setPassErr] = useState<string | null>(null);
  const [nameErr, setNameErr] = useState<string | null>(null);
  const [phoneErr, setPhoneErr] = useState<string | null>(null);
  const [confirmErr, setConfirmErr] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const strength = getPasswordStrength(regPassword);

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const eError = validateEmail(loginEmail);
    const pError = validatePassword(loginPassword);
    setEmailErr(eError);
    setPassErr(pError);

    if (eError || pError) return;

    setIsLoading(true);
    try {
      const res = await customerLogin(loginEmail.trim().toLowerCase(), loginPassword);
      if (res && res.success) {
        setIsAuthModalOpen(false);
      }
    } catch (err) {
      showToast('Authentication failed. Please check your internet connection.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nError = validateFullName(regName);
    const eError = validateEmail(regEmail);
    const pError = validatePhone(regPhone);
    const passError = validatePassword(regPassword);
    const cError = validateConfirmPassword(regPassword, confirmPassword);

    setNameErr(nError);
    setEmailErr(eError);
    setPhoneErr(pError);
    setPassErr(passError);
    setConfirmErr(cError);

    if (!acceptTerms) {
      showToast('You must accept the Terms & Conditions to create an account.', 'warning');
      return;
    }

    if (nError || eError || pError || passError || cError) return;

    setIsLoading(true);
    try {
      const res = await customerRegister(
        regName.trim(), 
        regEmail.trim().toLowerCase(), 
        regPhone.replace(/\D/g, ''), 
        regPassword
      );
      if (res && res.success) {
        setIsAuthModalOpen(false);
      }
    } catch (err) {
      showToast('Account creation failed. Please check your network connection.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoLogin = () => {
    setLoginEmail('ananya.sharma@example.com');
    setLoginPassword('Patron@123');
    setEmailErr(null);
    setPassErr(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-obsidian-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="bg-white max-w-md w-full rounded-3xl border border-cream-300 shadow-2xl overflow-hidden relative animate-scale-up">
        
        {/* Close Modal Button */}
        <button 
          type="button"
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute right-4 top-4 text-obsidian-900/40 hover:text-obsidian-900 bg-cream-100 hover:bg-cream-200 p-2 rounded-full transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Action Preservation Banner */}
        {pendingAction && (
          <div className="bg-gold-500/10 border-b border-gold-500/30 p-3 px-6 text-center text-xs font-semibold text-obsidian-900 flex items-center justify-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-gold-600 shrink-0" />
            <span>Sign in or create an account to {pendingAction.label || 'complete your request'}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-6 pb-2 text-center space-y-1">
          <h2 className="font-serif text-2xl font-bold text-obsidian-900">
            {mode === 'signin' ? 'Patron Sign In' : 'Create Patron Account'}
          </h2>
          <p className="text-xs text-obsidian-900/60 font-sans">
            {mode === 'signin' ? 'Sign in to access your cart, wishlist, and orders.' : 'Join Eclipsera for GI-certified luxury craft heritage.'}
          </p>
        </div>

        {/* Toggle Mode */}
        <div className="px-6 py-2">
          <div className="flex bg-cream-100 p-1 rounded-xl border border-cream-300 text-xs font-semibold">
            <button 
              type="button"
              onClick={() => { setMode('signin'); setEmailErr(null); setPassErr(null); }}
              className={`flex-1 py-2 rounded-lg text-center transition-all ${mode === 'signin' ? 'bg-obsidian-900 text-cream-100 font-bold shadow-sm' : 'text-obsidian-900/70'}`}
            >
              Sign In
            </button>
            <button 
              type="button"
              onClick={() => { setMode('signup'); setEmailErr(null); setPassErr(null); }}
              className={`flex-1 py-2 rounded-lg text-center transition-all ${mode === 'signup' ? 'bg-obsidian-900 text-cream-100 font-bold shadow-sm' : 'text-obsidian-900/70'}`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Sign In Form */}
        {mode === 'signin' ? (
          <form onSubmit={handleSignInSubmit} className="p-6 pt-3 space-y-4">
            
            {/* Demo Login Button */}
            <div className="flex items-center justify-between p-2.5 bg-gold-500/10 border border-gold-500/30 rounded-xl text-xs">
              <span className="font-bold text-obsidian-900 text-[11px]">Quick Demo Patron?</span>
              <button 
                type="button"
                onClick={fillDemoLogin}
                className="text-gold-700 font-bold hover:underline text-[11px] flex items-center gap-1"
              >
                <Zap className="w-3 h-3 text-gold-600" />
                Fill Demo Credentials
              </button>
            </div>

            <div>
              <label className="text-[11px] font-bold text-obsidian-900 uppercase block mb-1">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  required
                  placeholder="ananya.sharma@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  onBlur={() => setEmailErr(validateEmail(loginEmail))}
                  className={`w-full bg-cream-100 border ${emailErr ? 'border-rose-500' : 'border-cream-300'} rounded-xl pl-9 pr-3 py-2.5 text-xs text-obsidian-900 focus:outline-none focus:border-gold-500`}
                />
                <Mail className="w-4 h-4 text-obsidian-900/40 absolute left-3 top-3" />
              </div>
              {emailErr && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{emailErr}</span>
                </p>
              )}
            </div>

            <div>
              <label className="text-[11px] font-bold text-obsidian-900 uppercase block mb-1">Password</label>
              <div className="relative">
                <input 
                  type={showLoginPassword ? "text" : "password"} 
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  onBlur={() => setPassErr(validatePassword(loginPassword))}
                  className={`w-full bg-cream-100 border ${passErr ? 'border-rose-500' : 'border-cream-300'} rounded-xl pl-9 pr-9 py-2.5 text-xs text-obsidian-900 focus:outline-none focus:border-gold-500`}
                />
                <Lock className="w-4 h-4 text-obsidian-900/40 absolute left-3 top-3" />
                <button 
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-3 text-obsidian-900/40 hover:text-obsidian-900"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passErr && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{passErr}</span>
                </p>
              )}
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-obsidian-900 text-cream-100 hover:bg-gold-600 hover:text-obsidian-900 disabled:opacity-50 py-3 rounded-xl text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Sign Up Form */
          <form onSubmit={handleSignUpSubmit} className="p-6 pt-3 space-y-3 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="text-[11px] font-bold text-obsidian-900 uppercase block mb-1">Full Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Ananya Sharma"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  onBlur={() => setNameErr(validateFullName(regName))}
                  className={`w-full bg-cream-100 border ${nameErr ? 'border-rose-500' : 'border-cream-300'} rounded-xl pl-9 pr-3 py-2 text-xs text-obsidian-900 focus:outline-none focus:border-gold-500`}
                />
                <User className="w-4 h-4 text-obsidian-900/40 absolute left-3 top-2.5" />
              </div>
              {nameErr && <p className="text-[11px] text-rose-600 font-semibold mt-0.5">{nameErr}</p>}
            </div>

            <div>
              <label className="text-[11px] font-bold text-obsidian-900 uppercase block mb-1">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  required
                  placeholder="ananya.sharma@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  onBlur={() => setEmailErr(validateEmail(regEmail))}
                  className={`w-full bg-cream-100 border ${emailErr ? 'border-rose-500' : 'border-cream-300'} rounded-xl pl-9 pr-3 py-2 text-xs text-obsidian-900 focus:outline-none focus:border-gold-500`}
                />
                <Mail className="w-4 h-4 text-obsidian-900/40 absolute left-3 top-2.5" />
              </div>
              {emailErr && <p className="text-[11px] text-rose-600 font-semibold mt-0.5">{emailErr}</p>}
            </div>

            <div>
              <label className="text-[11px] font-bold text-obsidian-900 uppercase block mb-1">Mobile Phone Number</label>
              <div className="relative">
                <input 
                  type="tel" 
                  required
                  maxLength={10}
                  placeholder="9876543210"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                  onBlur={() => setPhoneErr(validatePhone(regPhone))}
                  className={`w-full bg-cream-100 border ${phoneErr ? 'border-rose-500' : 'border-cream-300'} rounded-xl pl-9 pr-3 py-2 text-xs text-obsidian-900 focus:outline-none focus:border-gold-500`}
                />
                <Phone className="w-4 h-4 text-obsidian-900/40 absolute left-3 top-2.5" />
              </div>
              {phoneErr && <p className="text-[11px] text-rose-600 font-semibold mt-0.5">{phoneErr}</p>}
            </div>

            <div>
              <label className="text-[11px] font-bold text-obsidian-900 uppercase block mb-1">Create Password</label>
              <div className="relative">
                <input 
                  type={showRegPassword ? "text" : "password"} 
                  required
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  onBlur={() => setPassErr(validatePassword(regPassword))}
                  className={`w-full bg-cream-100 border ${passErr ? 'border-rose-500' : 'border-cream-300'} rounded-xl pl-9 pr-9 py-2 text-xs text-obsidian-900 focus:outline-none focus:border-gold-500`}
                />
                <Lock className="w-4 h-4 text-obsidian-900/40 absolute left-3 top-2.5" />
                <button 
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 top-2.5 text-obsidian-900/40 hover:text-obsidian-900"
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Password Strength Meter Bar */}
              {regPassword && (
                <div className="space-y-1 mt-1">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-obsidian-900/60 uppercase">Password Strength:</span>
                    <span className={`font-mono ${strength.score >= 3 ? 'text-emerald-700' : 'text-amber-700'}`}>{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-cream-200 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${strength.percentage}%` }}></div>
                  </div>
                </div>
              )}

              {passErr && <p className="text-[11px] text-rose-600 font-semibold mt-0.5">{passErr}</p>}
            </div>

            <div>
              <label className="text-[11px] font-bold text-obsidian-900 uppercase block mb-1">Confirm Password</label>
              <div className="relative">
                <input 
                  type={showRegPassword ? "text" : "password"} 
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setConfirmErr(validateConfirmPassword(regPassword, confirmPassword))}
                  className={`w-full bg-cream-100 border ${confirmErr ? 'border-rose-500' : 'border-cream-300'} rounded-xl pl-9 pr-3 py-2 text-xs text-obsidian-900 focus:outline-none focus:border-gold-500`}
                />
                <Lock className="w-4 h-4 text-obsidian-900/40 absolute left-3 top-2.5" />
              </div>
              {confirmErr && <p className="text-[11px] text-rose-600 font-semibold mt-0.5">{confirmErr}</p>}
            </div>

            {/* Terms & Conditions Agreement Checkbox */}
            <div className="flex items-start gap-2 pt-1">
              <input 
                type="checkbox"
                id="modalTerms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 rounded text-gold-600 focus:ring-gold-500"
              />
              <label htmlFor="modalTerms" className="text-[11px] text-obsidian-900/70 leading-snug cursor-pointer">
                I agree to the <span className="font-bold text-gold-700 underline">Terms of Service</span> and <span className="font-bold text-gold-700 underline">Privacy Policy</span>.
              </label>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gold-500 text-obsidian-900 hover:bg-gold-400 disabled:opacity-50 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 shadow-md transition-all mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-obsidian-900" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
export default AuthModal;

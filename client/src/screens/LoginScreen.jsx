import { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../context/StoreContext';
import { GoogleLogin } from '@react-oauth/google';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const LoginScreen = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  });

  const { setUserInfo } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();

  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  const submitHandler = async (dataForm) => {
    setLoading(true);
    setError(null);
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await axios.post('/api/users/login', dataForm, config);
      setUserInfo(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate(redirect);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  const googleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError(null);
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await axios.post(
        '/api/users/google',
        { credential: credentialResponse.credential },
        config
      );
      setUserInfo(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate(redirect);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  const googleError = () => {
    setError('Google Sign In was unsuccessful. Try again later.');
  };

  return (
    <div className="flex min-h-[85vh] rounded-3xl overflow-hidden border border-accent-gold/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-fade-in mb-8">
      {/* Left Side: Image (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface items-center justify-center overflow-hidden group">
        <img 
          src="https://images.unsplash.com/photo-1599643478514-4a4e5170d18f?q=80&w=1400&auto=format&fit=crop" 
          alt="Luxury Experience" 
          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-[10s] ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/60 to-transparent"></div>
        <div className="relative z-10 text-center px-12 pb-12 mt-auto">
          <h2 className="text-4xl font-serif text-accent-gold mb-4 tracking-wider">Elevate Your Lifestyle</h2>
          <p className="text-text-primary/90 text-lg font-light leading-relaxed">Sign in to access exclusive collections, track your premium orders, and enjoy priority support.</p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-surface/80 backdrop-blur-xl relative">
        {/* Subtle decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-gold/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-gold/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-md relative z-10">
          <div className="flex flex-col items-center justify-center mb-10 gap-3">
            <Link to="/">
              <img src="/images/logo.jpg" alt="Logo" className="h-16 w-auto object-contain rounded-lg shadow-sm hover:opacity-80 transition-opacity" />
            </Link>
            <h2 className="text-xl font-serif font-extrabold text-accent-gold tracking-[0.2em] uppercase">Eclipsera Premium</h2>
          </div>
          <h1 className="text-3xl font-serif font-extrabold text-text-primary mb-8 text-center tracking-wide">Welcome Back</h1>
          
          {error && (
            <div className="bg-red-900/20 border border-red-800/50 text-red-400 px-5 py-4 rounded-xl mb-6 font-medium text-sm flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Email Address</label>
              <input
                type="email"
                className={`w-full px-5 py-4 rounded-xl bg-bg-base border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-accent-gold/30 focus:ring-accent-gold'} focus:ring-2 outline-none transition-all duration-300 text-text-primary`}
                placeholder="Enter your email"
                {...register('email')}
              />
              {errors.email && <p className="text-red-500 text-xs mt-2 font-medium">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Password</label>
              <input
                type="password"
                className={`w-full px-5 py-4 rounded-xl bg-bg-base border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-accent-gold/30 focus:ring-accent-gold'} focus:ring-2 outline-none transition-all duration-300 text-text-primary`}
                placeholder="Enter your password"
                {...register('password')}
              />
              {errors.password && <p className="text-red-500 text-xs mt-2 font-medium">{errors.password.message}</p>}
              <div className="text-right mt-3">
                <Link to="/forgot-password" className="text-xs text-accent-gold font-bold hover:text-accent-gold-hover transition-colors tracking-wider">
                  FORGOT PASSWORD?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isValid}
              className="w-full bg-accent-gold hover:bg-accent-gold-hover active:scale-[0.99] text-bg-base font-extrabold text-sm uppercase tracking-widest py-4 rounded-xl shadow-[0_8px_20px_rgba(212,175,55,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_25px_rgba(212,175,55,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="my-8 flex items-center justify-center">
            <div className="w-full border-t border-accent-gold/10"></div>
            <span className="px-4 text-text-secondary text-xs uppercase tracking-widest whitespace-nowrap">or continue with</span>
            <div className="w-full border-t border-accent-gold/10"></div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={googleSuccess}
              onError={googleError}
              useOneTap
              shape="rectangular"
              theme="filled_black"
              size="large"
            />
          </div>

          <div className="mt-10 text-center text-text-secondary text-sm">
            Don't have an account?{' '}
            <Link to={redirect !== '/' ? `/register?redirect=${redirect}` : '/register'} className="text-accent-gold font-bold hover:underline transition-all">
              Register Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;

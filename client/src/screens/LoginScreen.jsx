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
    <div className="flex justify-center items-center min-h-[70vh] animate-fade-in">
      <div className="w-full max-w-md bg-transparent p-8 sm:p-10 rounded-3xl shadow-sm border border-accent-gold/20">
        <h1 className="text-3xl font-serif font-extrabold text-text-primary mb-8 text-center">Sign In</h1>
        
        {error && (
          <div className="bg-accent-gold/10 border border-accent-gold/20 text-accent-gold px-5 py-4 rounded-xl mb-6 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-text-primary/80 mb-2">Email Address</label>
            <input
              type="email"
              className={`w-full px-5 py-4 rounded-xl bg-surface border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-accent-gold/20 focus:ring-accent-gold'} focus:ring-2 outline-none transition-all duration-300`}
              placeholder="Enter your email"
              {...register('email')}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-primary/80 mb-2">Password</label>
            <input
              type="password"
              className={`w-full px-5 py-4 rounded-xl bg-surface border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-accent-gold/20 focus:ring-accent-gold'} focus:ring-2 outline-none transition-all duration-300`}
              placeholder="Enter your password"
              {...register('password')}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || !isValid}
            className="w-full bg-accent-gold hover:bg-accent-gold-hover active:scale-[0.98] text-white font-bold text-lg py-4 rounded-xl shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Sign In'}
          </button>
        </form>

        <div className="my-6 flex items-center justify-center">
          <div className="w-full border-t border-accent-gold/20"></div>
          <span className="px-4 text-text-primary/60 text-sm whitespace-nowrap">or continue with</span>
          <div className="w-full border-t border-accent-gold/20"></div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={googleSuccess}
            onError={googleError}
            useOneTap
            shape="rectangular"
            theme="filled_black"
          />
        </div>

        <div className="mt-8 text-center text-text-primary/70">
          New Customer?{' '}
          <Link to={redirect !== '/' ? `/register?redirect=${redirect}` : '/register'} className="text-accent-gold font-bold hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-4 focus-visible:ring-offset-bg-base rounded-sm">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;

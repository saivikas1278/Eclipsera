import { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../context/StoreContext';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { setUserInfo } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();

  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Setup the headers to tell the backend we are sending JSON
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      // Make the POST request to the backend
      const { data } = await axios.post(
        '/api/users/login',
        { email, password },
        config
      );

      // Save the returned user data (and JWT) to Context state
      setUserInfo(data);
      // Persist the user data to localStorage so they stay logged in on refresh
      localStorage.setItem('userInfo', JSON.stringify(data));

      // Route the user to the redirect path (e.g. shipping) or home
      navigate(redirect);
    } catch (err) {
      // Extract our custom error message from the backend if it exists
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh] animate-fade-in">
      <div className="w-full max-w-md bg-transparent p-8 sm:p-10 rounded-3xl shadow-sm border border-accent-gold/20">
        <h1 className="text-3xl font-serif font-extrabold text-text-primary mb-8 text-center">Sign In</h1>
        
        {/* Error Alert */}
        {error && (
          <div className="bg-accent-gold/10 border border-accent-gold/20 text-accent-gold px-5 py-4 rounded-xl mb-6 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={submitHandler} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-text-primary/80 mb-2">Email Address</label>
            <input
              type="email"
              className="w-full px-5 py-4 rounded-xl bg-surface border border-accent-gold/20 focus:ring-2 focus:ring-accent-gold focus:border-accent-gold outline-none transition-all duration-300"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-primary/80 mb-2">Password</label>
            <input
              type="password"
              className="w-full px-5 py-4 rounded-xl bg-surface border border-accent-gold/20 focus:ring-2 focus:ring-accent-gold focus:border-accent-gold outline-none transition-all duration-300"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-gold hover:bg-accent-gold-hover text-white font-bold text-lg py-4 rounded-xl shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center text-text-primary/70">
          New Customer?{' '}
          <Link to={redirect !== '/' ? `/register?redirect=${redirect}` : '/register'} className="text-accent-gold font-bold hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;

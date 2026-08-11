import { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../context/StoreContext';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { setUserInfo } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();

  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const { data } = await axios.post(
        '/api/users',
        { name, email, password },
        config
      );

      setUserInfo(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate(redirect);
    } catch (err) {
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
        <h1 className="text-3xl font-serif font-extrabold text-text-primary mb-8 text-center">Create Account</h1>

        {error && (
          <div className="bg-accent-gold/10 border border-accent-gold/20 text-accent-gold px-5 py-4 rounded-xl mb-6 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={submitHandler} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-text-primary/80 mb-2">Full Name</label>
            <input
              type="text"
              className="w-full px-5 py-4 rounded-xl bg-surface border border-accent-gold/20 focus:ring-2 focus:ring-accent-gold focus:border-accent-gold outline-none transition-all duration-300"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-primary/80 mb-2">Confirm Password</label>
            <input
              type="password"
              className="w-full px-5 py-4 rounded-xl bg-surface border border-accent-gold/20 focus:ring-2 focus:ring-accent-gold focus:border-accent-gold outline-none transition-all duration-300"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-gold hover:bg-accent-gold-hover text-white font-bold text-lg py-4 rounded-xl shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Register'}
          </button>
        </form>

        <div className="mt-8 text-center text-text-primary/70">
          Already have an account?{' '}
          <Link to={redirect !== '/' ? `/login?redirect=${redirect}` : '/login'} className="text-accent-gold font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;

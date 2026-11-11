import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const StockAlertBox = ({ productId, productName }) => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await axios.post(`/api/products/${productId}/stock-alert`, { email });
      toast.success(data.message || 'Subscribed successfully!');
      setSubscribed(true);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (subscribed) {
    return (
      <div className="bg-accent-gold/10 border border-accent-gold/30 rounded-xl p-4 my-6 text-center animate-fade-in">
        <span className="text-accent-gold font-bold text-sm block">✓ Alert Registered</span>
        <p className="text-xs text-text-secondary mt-1">
          We will notify you at <strong className="text-text-primary">{email}</strong> as soon as {productName} is back in stock.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl p-5 border border-accent-gold/20 my-6 shadow-sm animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <h4 className="text-sm font-bold text-text-primary">Notify Me When Available</h4>
      </div>
      <p className="text-xs text-text-secondary mb-3">
        This handmade piece is currently sold out. Enter your email to be the first in line when restocked.
      </p>

      <form onSubmit={handleSubscribe} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          className="flex-1 bg-bg-base border border-accent-gold/30 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold"
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-accent-gold hover:bg-accent-gold-hover text-bg-base font-bold text-xs px-4 py-2 rounded-lg transition-colors active:scale-95 whitespace-nowrap disabled:opacity-50"
        >
          {submitting ? 'Registering...' : 'Notify Me'}
        </button>
      </form>
    </div>
  );
};

export default StockAlertBox;

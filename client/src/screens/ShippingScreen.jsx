import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';

const ShippingScreen = () => {
  const { shippingAddress, saveShippingAddress, cartItems, userInfo } = useContext(StoreContext);
  const navigate = useNavigate();

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const [name, setName] = useState(shippingAddress.name || userInfo?.name || '');
  const [email, setEmail] = useState(shippingAddress.email || userInfo?.email || '');
  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
  const [country, setCountry] = useState(shippingAddress.country || '');

  const submitHandler = (e) => {
    e.preventDefault();
    // Save to context and localStorage
    saveShippingAddress({ name, email, address, city, postalCode, country });
    // Navigate to the final step
    navigate('/placeorder');
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh] animate-fade-in">
      <div className="w-full max-w-md bg-transparent p-8 sm:p-10 rounded-3xl shadow-sm border border-accent-gold/20">
        <h1 className="text-3xl font-serif font-extrabold text-text-primary mb-8 text-center">Shipping</h1>
        
        <form onSubmit={submitHandler} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-primary/80 mb-2">Full Name</label>
              <input
                type="text"
                className="w-full px-5 py-4 rounded-xl bg-surface border border-accent-gold/20 focus:ring-2 focus:ring-accent-gold outline-none transition-all duration-300"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-primary/80 mb-2">Email Address</label>
              <input
                type="email"
                className="w-full px-5 py-4 rounded-xl bg-surface border border-accent-gold/20 focus:ring-2 focus:ring-accent-gold outline-none transition-all duration-300"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary/80 mb-2">Address</label>
            <input
              type="text"
              className="w-full px-5 py-4 rounded-xl bg-surface border border-accent-gold/20 focus:ring-2 focus:ring-accent-gold outline-none transition-all duration-300"
              placeholder="Enter street address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary/80 mb-2">City</label>
            <input
              type="text"
              className="w-full px-5 py-4 rounded-xl bg-surface border border-accent-gold/20 focus:ring-2 focus:ring-accent-gold outline-none transition-all duration-300"
              placeholder="Enter city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
            <label className="block text-sm font-semibold text-text-primary/80 mb-2">Postal Code</label>
            <input
              type="text"
              className="w-full px-5 py-4 rounded-xl bg-surface border border-accent-gold/20 focus:ring-2 focus:ring-accent-gold outline-none transition-all duration-300"
              placeholder="Zip/Postal"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              required
            />
            </div>
            <div>
            <label className="block text-sm font-semibold text-text-primary/80 mb-2">Country</label>
            <input
              type="text"
              className="w-full px-5 py-4 rounded-xl bg-surface border border-accent-gold/20 focus:ring-2 focus:ring-accent-gold outline-none transition-all duration-300"
              placeholder="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-accent-gold hover:bg-accent-gold-hover text-white font-bold py-4 rounded-xl shadow-md transition-all hover:shadow-lg mt-4"
          >
            Continue to Checkout
          </button>
        </form>
      </div>
    </div>
  );
};

export default ShippingScreen;

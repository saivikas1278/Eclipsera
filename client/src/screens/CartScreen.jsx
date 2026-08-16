import { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import ProductCarousel from '../components/ProductCarousel';
import toast from 'react-hot-toast';

const CartScreen = () => {
  const { cartItems, addToCart, removeFromCart, saveForLater, savedForLaterItems, moveToCart } = useContext(StoreContext);
  const navigate = useNavigate();

  // Calculate totals
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const subtotalPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2);

  const checkoutHandler = () => {
    navigate('/shipping');
  };

  // Idle timer for abandonment nudge
  useEffect(() => {
    if (cartItems.length > 0) {
      const idleTimer = setTimeout(() => {
        toast('High demand! Checkout now to secure your items.', { icon: '🔥' });
      }, 180000); // 3 minutes

      return () => clearTimeout(idleTimer);
    }
  }, [cartItems.length]);

  return (
    <div className="py-12 animate-fade-in">
      <h1 className="text-4xl font-serif font-extrabold text-text-primary mb-8 tracking-tight">Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 md:py-16 text-center animate-fade-in">
          <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center border border-accent-gold/20 shadow-inner mb-6 text-accent-gold/50">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-3xl font-serif font-bold text-text-primary mb-4">Your cart is empty.</h2>
          <p className="text-text-secondary text-lg mb-8 max-w-md">
            Discover our latest handcrafted collections and find something extraordinary.
          </p>
          <Link to="/" className="bg-accent-gold hover:bg-accent-gold-hover text-bg-base font-bold py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2 uppercase tracking-wider mb-16">
            Explore Collection
          </Link>
          
          <div className="w-full text-left mt-8 border-t border-accent-gold/10 pt-16">
            <ProductCarousel />
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-surface rounded-3xl shadow-sm border border-accent-gold/20 overflow-hidden mb-8">
              {cartItems.map((item) => (
                <div key={item.cartItemId || item._id} className="flex flex-col sm:flex-row items-center justify-between p-6 border-b border-accent-gold/20 last:border-b-0 gap-4 hover:bg-transparent/50 transition-colors group">
                  
                  <div className="w-full sm:w-28 aspect-square flex-shrink-0 relative overflow-hidden rounded-xl border border-accent-gold/20">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                  </div>
                  
                  <div className="flex-grow min-w-0 px-2 sm:px-4">
                    <Link to={`/product/${item._id}`} className="text-xl font-serif font-semibold text-text-primary hover:text-accent-gold truncate block transition-colors mb-2">
                      {item.name}
                    </Link>
                    <div className="inline-flex items-center">
                      <select 
                        value={item.qty} 
                        onChange={(e) => addToCart(item, Number(e.target.value), item.variant, item.personalization)}
                        className="bg-transparent border border-accent-gold/20 text-text-primary rounded-lg min-h-[44px] min-w-[44px] px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-accent-gold outline-none cursor-pointer hover:bg-surface transition-colors"
                      >
                        {[...Array(item.countInStock).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>
                            Qty: {x + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="text-2xl font-bold text-text-primary w-32 text-right">
                    ₹{(item.price * item.qty).toFixed(2)}
                  </div>
                  
                  <div className="flex sm:flex-col gap-2 sm:ml-4 flex-shrink-0">
                    <button 
                      onClick={() => saveForLater(item.cartItemId || item._id)}
                      className="min-h-[44px] min-w-[44px] p-2 sm:p-3 text-accent-gold bg-accent-gold/10 hover:bg-accent-gold hover:text-bg-base rounded-xl transition-colors shadow-sm text-sm font-semibold"
                      title="Save for Later"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => removeFromCart(item.cartItemId || item._id)}
                      className="min-h-[44px] min-w-[44px] p-2 sm:p-3 text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white rounded-xl transition-colors shadow-sm flex items-center justify-center"
                      title="Remove from Cart"
                    >
                      <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Saved for Later Section */}
            {savedForLaterItems && savedForLaterItems.length > 0 && (
              <div className="mt-12 animate-fade-in">
                <h2 className="text-2xl font-serif font-bold text-text-primary mb-6">Saved for Later ({savedForLaterItems.length})</h2>
                <div className="bg-surface/50 rounded-3xl shadow-sm border border-accent-gold/20 overflow-hidden">
                  {savedForLaterItems.map((item) => (
                    <div key={item.cartItemId || item._id} className="flex flex-col sm:flex-row items-center justify-between p-6 border-b border-accent-gold/20 last:border-b-0 gap-4 opacity-75 hover:opacity-100 transition-opacity">
                      
                      <div className="w-full sm:w-20 aspect-square flex-shrink-0 relative overflow-hidden rounded-xl border border-accent-gold/20">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="flex-grow min-w-0 px-2 sm:px-4">
                        <Link to={`/product/${item._id}`} className="text-lg font-serif font-semibold text-text-primary hover:text-accent-gold truncate block transition-colors">
                          {item.name}
                        </Link>
                        <div className="text-accent-gold font-bold">₹{item.price.toFixed(2)}</div>
                      </div>
                      
                      <button 
                        onClick={() => moveToCart(item.cartItemId || item._id)}
                        className="min-h-[44px] min-w-[44px] w-full sm:w-auto px-6 py-2 bg-accent-gold hover:bg-accent-gold-hover text-bg-base font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center"
                      >
                        Move to Cart
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-surface rounded-3xl p-8 border border-accent-gold/20 shadow-sm sticky top-24">
              <h2 className="text-2xl font-serif font-bold text-text-primary mb-6 border-b border-accent-gold/20 pb-4">Order Summary</h2>
              
              <div className="flex justify-between items-center mb-4 text-text-primary/70 text-lg">
                <span>Items ({totalItems}):</span>
                <span className="font-semibold text-text-primary">₹{subtotalPrice}</span>
              </div>
              
              <div className="flex justify-between items-center mb-8 text-2xl font-bold text-text-primary border-t border-accent-gold/20 pt-6 mt-4">
                <span>Subtotal:</span>
                <span className="text-accent-gold">₹{subtotalPrice}</span>
              </div>
              
              <button 
                onClick={checkoutHandler}
                disabled={cartItems.length === 0}
                className="w-full bg-accent-gold hover:bg-accent-gold-hover text-bg-base text-lg font-bold py-4 rounded-xl shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>Proceed To Checkout</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default CartScreen;

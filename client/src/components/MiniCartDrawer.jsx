import { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';

const MiniCartDrawer = () => {
  const { cartItems, removeFromCart, isCartDrawerOpen, setIsCartDrawerOpen, userInfo } = useContext(StoreContext);
  const navigate = useNavigate();

  const closeDrawer = () => setIsCartDrawerOpen(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartDrawerOpen) closeDrawer();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartDrawerOpen]);

  const checkoutHandler = () => {
    closeDrawer();
    if (userInfo) {
      navigate('/shipping');
    } else {
      navigate('/login?redirect=/shipping');
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2);

  return (
    <>
      {/* Backdrop */}
      {isCartDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 transition-opacity backdrop-blur-sm"
          onClick={closeDrawer}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full md:w-96 bg-surface shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:border-l border-accent-gold/20 flex flex-col ${
          isCartDrawerOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 flex justify-between items-center border-b border-accent-gold/10">
          <h2 className="text-2xl font-serif text-text-primary">Your Cart</h2>
          <button onClick={closeDrawer} aria-label="Close cart" className="text-text-secondary hover:text-accent-gold transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="text-center text-text-secondary mt-10">
              Your cart is currently empty.
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item._id} className="flex gap-4 border-b border-accent-gold/5 pb-6">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md border border-accent-gold/20" />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <Link to={`/product/${item._id}`} onClick={closeDrawer} className="text-text-primary font-serif font-bold hover:text-accent-gold transition-colors line-clamp-1">
                      {item.name}
                    </Link>
                    {item.variant && <p className="text-xs text-text-secondary mt-0.5">{item.variant}</p>}
                    <p className="text-accent-gold font-bold">₹{item.price}</p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-text-secondary">Qty: {item.qty}</span>
                    <button
                      type="button"
                      className="text-text-secondary hover:text-red-500 p-2 transition-colors ml-2 flex-shrink-0"
                      onClick={() => removeFromCart(item.cartItemId || item._id)}
                      aria-label="Remove item"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-accent-gold/10 bg-bg-base">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg text-text-primary font-bold">Subtotal</span>
              <span className="text-2xl text-accent-gold font-bold font-serif">₹{subtotal}</span>
            </div>
            <p className="text-xs text-text-secondary mb-4 text-center">Shipping & taxes calculated at checkout.</p>
            <button 
              onClick={checkoutHandler}
              className="w-full bg-accent-gold hover:bg-accent-gold-hover text-bg-base font-bold py-4 rounded-xl transition-colors shadow-lg"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default MiniCartDrawer;

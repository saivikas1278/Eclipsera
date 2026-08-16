import { createContext, useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

export const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  // Initialize userInfo from localStorage (this is the only static key)
  const [userInfo, setUserInfo] = useState(() => {
    try {
      const savedUser = localStorage.getItem('userInfo');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('localStorage access denied:', error);
      return null;
    }
  });

  // Helper function to scope keys by user identity to prevent cross-contamination
  const getStorageKey = (baseKey) => {
    const identifier = userInfo?._id || userInfo?.email || 'guest';
    return `eclipsera_${baseKey}_${identifier}`;
  };

  // State variables for user data
  const [cartItems, setCartItems] = useState(() => {
    try {
      const identifier = userInfo?._id || userInfo?.email || 'guest';
      const savedCart = localStorage.getItem(`eclipsera_cart_${identifier}`);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      return [];
    }
  });

  const [shippingAddress, setShippingAddress] = useState(() => {
    try {
      const identifier = userInfo?._id || userInfo?.email || 'guest';
      const savedShipping = localStorage.getItem(`eclipsera_address_${identifier}`);
      return savedShipping ? JSON.parse(savedShipping) : {};
    } catch (e) {
      return {};
    }
  });

  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const identifier = userInfo?._id || userInfo?.email || 'guest';
      const savedWishlist = localStorage.getItem(`eclipsera_wishlist_${identifier}`);
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    } catch (e) {
      return [];
    }
  });

  const [savedForLaterItems, setSavedForLaterItems] = useState(() => {
    try {
      const identifier = userInfo?._id || userInfo?.email || 'guest';
      const savedLater = localStorage.getItem(`eclipsera_saved_${identifier}`);
      return savedLater ? JSON.parse(savedLater) : [];
    } catch (e) {
      return [];
    }
  });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Sync state when the logged-in user changes (or on initial mount)
  useEffect(() => {
    let mounted = true;
    const loadAndMergeCart = async () => {
      try {
        const savedCartStr = localStorage.getItem(getStorageKey('cart'));
        const localCart = savedCartStr ? JSON.parse(savedCartStr) : [];
        
        if (userInfo) {
          const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
          const { data } = await axios.get('/api/cart', config);
          
          const merged = [...localCart];
          data.items.forEach(serverItem => {
            const exists = merged.find(localItem => 
              (localItem.cartItemId && localItem.cartItemId === serverItem.cartItemId) || 
              (!localItem.cartItemId && localItem._id === serverItem._id)
            );
            if (!exists) merged.push(serverItem);
          });
          
          if (mounted) {
            setCartItems(merged);
            localStorage.setItem(getStorageKey('cart'), JSON.stringify(merged));
          }
        } else {
          if (mounted) setCartItems(localCart);
        }
      } catch (error) {
        console.error('Failed to load/sync cart', error);
        toast.error('Unable to sync your saved cart. Please refresh.');
      }
    };

    loadAndMergeCart();

    try {
      const savedShipping = localStorage.getItem(getStorageKey('address'));
      setShippingAddress(savedShipping ? JSON.parse(savedShipping) : {});

      const savedWishlist = localStorage.getItem(getStorageKey('wishlist'));
      setWishlistItems(savedWishlist ? JSON.parse(savedWishlist) : []);
      
      const savedLater = localStorage.getItem(getStorageKey('saved'));
      setSavedForLaterItems(savedLater ? JSON.parse(savedLater) : []);
    } catch (error) {
      console.error('Failed to load scoped user data from localStorage', error);
      setShippingAddress({});
      setWishlistItems([]);
      setSavedForLaterItems([]);
    }
    
    return () => { mounted = false; };
    // Only re-run when the user ID changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo?._id]);

  // Sync cart to backend whenever it changes
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    const syncToBackend = async () => {
      if (userInfo) {
        try {
          const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
          await axios.post('/api/cart', { items: cartItems }, config);
        } catch (error) {
          console.error('Failed to sync cart to backend', error);
        }
      }
    };
    
    const timeoutId = setTimeout(syncToBackend, 800);
    return () => clearTimeout(timeoutId);
  }, [cartItems, userInfo]);

  const addToCart = (product, qty, variant = null, personalization = '') => {
    if (qty > product.countInStock) {
      window.alert('Sorry, you cannot add more of this item than is currently in stock.');
      return;
    }

    // Generate unique ID for cart item
    const cartItemId = `${product._id}-${variant || 'default'}-${personalization || 'none'}`;

    setCartItems((prevItems) => {
      // Find existing item by cartItemId or by _id if it's an old item without cartItemId
      const existingItem = prevItems.find((item) => (item.cartItemId && item.cartItemId === cartItemId) || (!item.cartItemId && item._id === product._id));
      let updatedCart;
      
      if (existingItem) {
        updatedCart = prevItems.map((item) =>
          ((item.cartItemId && item.cartItemId === cartItemId) || (!item.cartItemId && item._id === product._id)) ? { ...item, qty: Number(qty) } : item
        );
      } else {
        updatedCart = [...prevItems, { ...product, qty: Number(qty), variant, personalization, cartItemId }];
      }

      try {
        localStorage.setItem(getStorageKey('cart'), JSON.stringify(updatedCart));
        if (!existingItem || existingItem.qty !== Number(qty)) {
          toast.success('Added to your cart');
        }
      } catch (error) {
        console.error('Failed to save scoped cart to localStorage:', error);
      }
      return updatedCart;
    });
  };

  const removeFromCart = (cartItemIdOrId) => {
    setCartItems((prevItems) => {
      const updatedCart = prevItems.filter((item) => {
        if (item.cartItemId) return item.cartItemId !== cartItemIdOrId;
        return item._id !== cartItemIdOrId;
      });
      try {
        localStorage.setItem(getStorageKey('cart'), JSON.stringify(updatedCart));
      } catch (error) {
        console.error('Failed to update scoped cart in localStorage:', error);
      }
      return updatedCart;
    });
  };

  const saveShippingAddress = (data) => {
    setShippingAddress(data);
    try {
      localStorage.setItem(getStorageKey('address'), JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save scoped shipping address to localStorage:', error);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem(getStorageKey('cart'));
    } catch (error) {
      console.error('Failed to clear scoped cart in localStorage:', error);
    }
  };

  const addToWishlist = (product) => {
    setWishlistItems((prev) => {
      const exists = prev.find((item) => item._id === product._id);
      if (exists) return prev;
      
      const newWishlist = [...prev, product];
      try {
        localStorage.setItem(getStorageKey('wishlist'), JSON.stringify(newWishlist));
        toast.success('Saved to your wishlist');
      } catch (err) {
        console.error('Failed to save scoped wishlist', err);
      }
      return newWishlist;
    });
  };

  const removeFromWishlist = (id) => {
    setWishlistItems((prev) => {
      const newWishlist = prev.filter((item) => item._id !== id);
      try {
        localStorage.setItem(getStorageKey('wishlist'), JSON.stringify(newWishlist));
        toast('Removed from wishlist', { icon: '🗑️' });
      } catch (err) {
        console.error('Failed to update scoped wishlist', err);
      }
      return newWishlist;
    });
  };

  const saveForLater = (cartItemIdOrId) => {
    const itemToSave = cartItems.find((item) => (item.cartItemId && item.cartItemId === cartItemIdOrId) || (!item.cartItemId && item._id === cartItemIdOrId));
    if (itemToSave) {
      removeFromCart(cartItemIdOrId);
      setSavedForLaterItems((prev) => {
        const newSaved = [...prev, itemToSave];
        try {
          localStorage.setItem(getStorageKey('saved'), JSON.stringify(newSaved));
          toast('Item saved for later', { icon: '🛒' });
        } catch (err) {
          console.error('Failed to save savedForLaterItems', err);
        }
        return newSaved;
      });
    }
  };

  const moveToCart = (cartItemIdOrId) => {
    const itemToMove = savedForLaterItems.find((item) => (item.cartItemId && item.cartItemId === cartItemIdOrId) || (!item.cartItemId && item._id === cartItemIdOrId));
    if (itemToMove) {
      setSavedForLaterItems((prev) => {
        const newSaved = prev.filter((item) => (item.cartItemId && item.cartItemId !== cartItemIdOrId) || (!item.cartItemId && item._id !== cartItemIdOrId));
        try {
          localStorage.setItem(getStorageKey('saved'), JSON.stringify(newSaved));
        } catch (err) {
          console.error('Failed to save savedForLaterItems', err);
        }
        return newSaved;
      });
      addToCart(itemToMove, itemToMove.qty, itemToMove.variant, itemToMove.personalization);
    }
  };

  const updateSession = (newUserData) => {
    if (newUserData && !userInfo) {
      try {
        const guestCartStr = localStorage.getItem('eclipsera_cart_guest');
        if (guestCartStr) {
          const guestCart = JSON.parse(guestCartStr);
          if (guestCart && guestCart.length > 0) {
            const newKey = `eclipsera_cart_${newUserData._id || newUserData.email}`;
            localStorage.setItem(newKey, JSON.stringify(guestCart));
          }
          localStorage.removeItem('eclipsera_cart_guest');
        }
      } catch (e) {
        console.error('Guest cart migration failed', e);
      }
    }

    setUserInfo(newUserData);
    try {
      if (newUserData) {
        localStorage.setItem('userInfo', JSON.stringify(newUserData));
      } else {
        localStorage.removeItem('userInfo');
      }
    } catch (error) {
      console.error('Failed to save session to localStorage:', error);
    }
  };

  // Explicit logout to completely wipe React memory state
  const handleLogout = () => {
    setUserInfo(null);
    setCartItems([]);
    setWishlistItems([]);
    setShippingAddress({});
    try {
      localStorage.removeItem('userInfo');
    } catch (err) {
      console.error('Failed to clear userInfo', err);
    }
  };

  const value = {
    cartItems,
    userInfo,
    setUserInfo,
    shippingAddress,
    saveShippingAddress,
    addToCart,
    removeFromCart,
    clearCart,
    updateSession,
    handleLogout,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    savedForLaterItems,
    saveForLater,
    moveToCart,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const InlineSearchBox = () => {
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (keyword.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/products?keyword=${keyword}`);
        setSuggestions((data.data ? data.data : data).slice(0, 5)); // Limit to 5 suggestions
        setShowDropdown(true);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [keyword]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      setShowDropdown(false);
      navigate(`/search?search=${keyword}`);
    }
  };

  const handleSuggestionClick = () => {
    setShowDropdown(false);
    setKeyword('');
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={containerRef}>
      <form onSubmit={submitHandler} className="relative flex items-center w-full">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onFocus={() => { if (keyword.length >= 2) setShowDropdown(true); }}
          placeholder="Search for handcrafted gifts, jewelry, decor..."
          className="w-full bg-surface border border-accent-gold/30 text-text-primary rounded-full py-3 px-6 pr-12 focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all placeholder:text-text-secondary/50 font-serif"
        />
        <button 
          type="submit" 
          aria-label="Submit search"
          className="absolute right-4 text-accent-gold hover:text-accent-gold-hover transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>

      {/* Autosuggest Dropdown */}
      {showDropdown && keyword.trim().length >= 2 && (
        <div className="absolute top-full left-0 w-full mt-2 bg-surface border border-accent-gold/20 shadow-2xl rounded-xl z-50 overflow-hidden animate-fade-in">
          {loading ? (
            <div className="p-4 text-text-secondary text-sm">Searching...</div>
          ) : suggestions.length === 0 ? (
            <div className="p-4 text-text-secondary text-sm">No products found for "{keyword}"</div>
          ) : (
            <div className="flex flex-col">
              {suggestions.map((product) => (
                <Link 
                  key={product._id} 
                  to={`/product/${product._id}`} 
                  onClick={handleSuggestionClick}
                  className="flex items-center gap-4 p-4 hover:bg-bg-base border-b border-accent-gold/5 last:border-b-0 transition-colors"
                >
                  <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded border border-accent-gold/10" />
                  <div className="flex-1">
                    <h4 className="font-serif font-bold text-text-primary line-clamp-1">{product.name}</h4>
                    <p className="text-accent-gold text-sm font-bold mt-1">₹{product.price}</p>
                  </div>
                </Link>
              ))}
              <button 
                onClick={submitHandler}
                className="p-3 text-center text-sm text-text-secondary hover:text-accent-gold bg-surface border-t border-accent-gold/10 transition-colors w-full font-bold"
              >
                See all results for "{keyword}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InlineSearchBox;

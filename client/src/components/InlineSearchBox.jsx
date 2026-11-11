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

  const submitHandler = (e, isAi = false) => {
    if (e) e.preventDefault();
    if (keyword.trim()) {
      setShowDropdown(false);
      navigate(`/search?search=${encodeURIComponent(keyword.trim())}${isAi ? '&ai=true' : ''}`);
    }
  };

  const handleSuggestionClick = () => {
    setShowDropdown(false);
    setKeyword('');
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={containerRef}>
      <form onSubmit={(e) => submitHandler(e, false)} className="relative flex items-center w-full">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onFocus={() => { if (keyword.length >= 2) setShowDropdown(true); }}
          placeholder="Search products or try 'gold ring under 2000'..."
          className="w-full bg-surface border border-accent-gold/30 text-text-primary rounded-full py-3 pl-6 pr-24 focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all placeholder:text-text-secondary/50 font-serif"
        />
        <div className="absolute right-3 flex items-center gap-1">
          <button 
            type="button"
            onClick={(e) => submitHandler(e, true)}
            title="Search with AI Assistant (Understands budget, style & materials)"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-accent-gold/15 text-accent-gold hover:bg-accent-gold hover:text-bg-base transition-colors"
          >
            <span className="text-xs">✨</span>
            <span className="hidden sm:inline">AI</span>
          </button>
          <button 
            type="submit" 
            aria-label="Submit search"
            className="p-1.5 text-accent-gold hover:text-accent-gold-hover transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </form>

      {/* Autosuggest Dropdown */}
      {showDropdown && keyword.trim().length >= 2 && (
        <div className="absolute top-full left-0 w-full mt-2 bg-surface border border-accent-gold/20 shadow-2xl rounded-xl z-50 overflow-hidden animate-fade-in">
          {/* AI Search Action Banner */}
          <div 
            onClick={(e) => submitHandler(e, true)}
            className="flex items-center justify-between p-3.5 bg-accent-gold/10 hover:bg-accent-gold/20 cursor-pointer border-b border-accent-gold/20 transition-colors"
          >
            <div className="flex items-center gap-2 text-sm text-accent-gold font-medium">
              <span className="text-base">✨</span>
              <span>Ask AI Search: <strong className="text-text-primary">"{keyword}"</strong></span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-accent-gold border border-accent-gold/30 px-2 py-0.5 rounded">Smart Filter</span>
          </div>

          {loading ? (
            <div className="p-4 text-text-secondary text-sm">Searching...</div>
          ) : suggestions.length === 0 ? (
            <div className="p-4 text-text-secondary text-sm">No standard keyword matches for "{keyword}". Try AI Search above!</div>
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
                onClick={(e) => submitHandler(e, false)}
                className="p-3 text-center text-sm text-text-secondary hover:text-accent-gold bg-surface border-t border-accent-gold/10 transition-colors w-full font-bold"
              >
                See all standard results for "{keyword}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InlineSearchBox;

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SearchBox = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/?keyword=${keyword}`);
    } else {
      navigate('/');
    }
  };

  return (
    <form onSubmit={submitHandler} className="flex items-center">
      <input
        type="text"
        name="q"
        onChange={(e) => setKeyword(e.target.value)}
        value={keyword}
        placeholder="Search Products..."
        className="w-full sm:w-64 px-4 py-2 rounded-l-md border-y border-l border-accent-gold/20 focus:ring-2 focus:ring-accent-gold focus:outline-none text-text-primary bg-surface"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-accent-gold hover:bg-accent-gold-hover text-white rounded-r-md transition-colors border-y border-r border-accent-gold hover:border-[#c63d12]"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBox;

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';

const SearchScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract query params from URL
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'All';
  const initialSearch = queryParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter States
  const [category, setCategory] = useState(initialCategory);
  const [searchKeyword, setSearchKeyword] = useState(initialSearch);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const categories = ['All', 'Jewelry', 'Home Decor', 'Candles', 'New', 'BestSellers', 'Gifts'];

  useEffect(() => {
    // If URL changes via footer links, update local state
    const currentCategory = queryParams.get('category') || 'All';
    const currentSearch = queryParams.get('search') || '';
    
    if (currentCategory !== category) setCategory(currentCategory);
    if (currentSearch !== searchKeyword) setSearchKeyword(currentSearch);
    
    fetchProducts(1, currentCategory, currentSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const fetchProducts = async (pageNumber = 1, cat = category, search = searchKeyword) => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `/api/products?page=${pageNumber}&limit=12`;
      if (cat !== 'All') url += `&category=${cat}`;
      if (search) url += `&search=${search}`;

      const { data } = await axios.get(url);
      
      setProducts(data.data);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products');
      setLoading(false);
    }
  };

  const handleFilterApply = (newCat) => {
    setCategory(newCat);
    setPage(1);
    
    // Update URL so it can be shared or refreshed
    const params = new URLSearchParams();
    if (newCat !== 'All') params.set('category', newCat);
    if (searchKeyword) params.set('search', searchKeyword);
    navigate(`/search?${params.toString()}`);
    
    setIsMobileFiltersOpen(false);
  };

  const handleSearchChange = (e) => {
    e.preventDefault();
    setPage(1);
    const params = new URLSearchParams();
    if (category !== 'All') params.set('category', category);
    if (searchKeyword) params.set('search', searchKeyword);
    navigate(`/search?${params.toString()}`);
  };

  const FilterSidebar = () => (
    <div className="space-y-8">
      {/* Search Input */}
      <div>
        <h3 className="text-lg font-bold text-accent-gold mb-4 uppercase tracking-wider text-sm">Search</h3>
        <form onSubmit={handleSearchChange} className="relative">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-bg-base border border-accent-gold/30 rounded-lg pl-4 pr-10 py-3 text-text-primary focus:outline-none focus:border-accent-gold transition-colors text-sm"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-accent-gold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
        </form>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-lg font-bold text-accent-gold mb-4 uppercase tracking-wider text-sm">Categories</h3>
        <ul className="space-y-3">
          {categories.map((c) => (
            <li key={c}>
              <button
                onClick={() => handleFilterApply(c)}
                className={`text-sm transition-colors flex items-center justify-between w-full group ${
                  category === c ? 'text-accent-gold font-bold' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <span>{c === 'BestSellers' ? 'Bestsellers' : c}</span>
                {category === c && (
                  <svg className="w-4 h-4 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in py-8 px-4 md:px-8 max-w-7xl mx-auto min-h-screen flex flex-col">
      
      {/* Header & Mobile Filter Button */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-accent-gold/20 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-extrabold text-text-primary tracking-tight">
            {category === 'All' ? (searchKeyword ? 'Search Results' : 'All Products') : category === 'BestSellers' ? 'Bestsellers' : category}
          </h1>
          {searchKeyword && (
            <p className="text-text-secondary mt-2">Showing results for "{searchKeyword}"</p>
          )}
        </div>
        
        {/* Mobile Filter Button */}
        <button 
          onClick={() => setIsMobileFiltersOpen(true)}
          className="md:hidden flex items-center justify-center gap-2 bg-surface border border-accent-gold/40 text-text-primary px-4 py-2 rounded-lg font-bold focus:outline-none"
        >
          <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
          Filters & Search
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-10 flex-grow">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 shrink-0 border-r border-accent-gold/10 pr-8">
          <FilterSidebar />
        </aside>

        {/* Product Grid */}
        <div className="flex-grow flex flex-col">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-8">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : error ? (
            <div className="flex-grow flex flex-col items-center justify-center py-20 text-center">
              <svg className="w-16 h-16 text-red-500 mb-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <h3 className="text-xl font-bold text-text-primary mb-2">Oops! Something went wrong.</h3>
              <p className="text-text-secondary">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-accent-gold/10 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-accent-gold opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <h3 className="text-2xl font-serif font-bold text-text-primary mb-2">No products found</h3>
              <p className="text-text-secondary max-w-md mx-auto mb-6">
                We couldn't find anything matching your current filters. Try removing some filters or adjusting your search.
              </p>
              <button 
                onClick={() => {
                  setSearchKeyword('');
                  handleFilterApply('All');
                }}
                className="bg-surface border border-accent-gold text-accent-gold hover:bg-accent-gold hover:text-bg-base font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-8 mb-12">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-auto flex justify-center items-center gap-2 pt-8 border-t border-accent-gold/10">
                  <button
                    onClick={() => fetchProducts(page - 1)}
                    disabled={page === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-accent-gold/30 text-accent-gold hover:bg-accent-gold hover:text-bg-base disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-accent-gold transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => fetchProducts(i + 1)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-colors ${
                        page === i + 1 
                          ? 'bg-accent-gold border-accent-gold text-bg-base font-bold' 
                          : 'border-accent-gold/30 text-text-secondary hover:text-accent-gold hover:border-accent-gold'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => fetchProducts(page + 1)}
                    disabled={page === totalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-accent-gold/30 text-accent-gold hover:bg-accent-gold hover:text-bg-base disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-accent-gold transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet Overlay */}
      {isMobileFiltersOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileFiltersOpen(false)}
          ></div>
          
          <div className="relative bg-bg-secondary w-full rounded-t-3xl p-6 shadow-2xl border-t border-accent-gold/30 animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="w-12 h-1 bg-accent-gold/30 rounded-full mx-auto mb-6"></div>
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-serif font-bold text-accent-gold">Filters & Search</h2>
              <button 
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-2 text-text-secondary hover:text-text-primary bg-surface rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <FilterSidebar />
            
            <button 
              onClick={() => setIsMobileFiltersOpen(false)}
              className="w-full mt-8 bg-accent-gold text-bg-base font-bold py-4 rounded-xl shadow-lg"
            >
              Show Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchScreen;

import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';
import { TableVirtuoso } from 'react-virtuoso';
import { useDebounce } from '../../hooks/useDebounce';

const ProductListScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false); // For create/delete operations
  
  // Inline Edit State
  const [isInlineEditMode, setIsInlineEditMode] = useState(false);
  const [modifiedProducts, setModifiedProducts] = useState({});
  const [bulkSaveLoading, setBulkSaveLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Pagination & Search
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const debouncedSearch = useDebounce(search, 500);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const { userInfo, setUserInfo, clearCart } = useContext(StoreContext);
  const navigate = useNavigate();

  // Define fetchProducts outside useEffect so we can call it after creating/deleting
  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Public route, no token needed
      const { data } = await axios.get(`/api/products?page=${page}&limit=50&search=${debouncedSearch}`);
      setProducts(data.data ? data.data : data);
      if (data.totalPages) setTotalPages(data.totalPages);
      if (data.totalCount) setTotalCount(data.totalCount);
      setLoading(false);
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, debouncedSearch]);

  const createProductHandler = async () => {
    if (window.confirm('Are you sure you want to create a new product?')) {
      try {
        setActionLoading(true);
        // Requires Admin JWT
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        // Hit the POST route we built on Day 3
        await axios.post('/api/products', {}, config);
        
        // Re-fetch to update the table immediately
        fetchProducts();
        setActionLoading(false);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setUserInfo(null);
          clearCart();
          localStorage.removeItem('userInfo');
          navigate('/login');
        } else {
          alert(
            err.response && err.response.data.message
              ? err.response.data.message
              : err.message
          );
          setActionLoading(false);
        }
      }
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setActionLoading(true);
        // Requires Admin JWT
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        // Hit the DELETE route we built on Day 3
        await axios.delete(`/api/products/${id}`, config);
        
        // Re-fetch to update the table immediately
        fetchProducts();
        setActionLoading(false);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setUserInfo(null);
          clearCart();
          localStorage.removeItem('userInfo');
          navigate('/login');
        } else {
          alert(
            err.response && err.response.data.message
              ? err.response.data.message
              : err.message
          );
          setActionLoading(false);
        }
      }
    }
  };

  const handleInputChange = (id, field, value) => {
    setModifiedProducts(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: Number(value)
      }
    }));
  };

  const handleBulkSave = async () => {
    const updates = Object.keys(modifiedProducts).map(id => ({
      _id: id,
      ...modifiedProducts[id]
    }));

    if (updates.length === 0) {
      setIsInlineEditMode(false);
      return;
    }

    try {
      setBulkSaveLoading(true);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      await axios.put('/api/products/bulk-update', { updates }, config);
      
      // Update local state instantly
      const updatedProducts = products.map(product => {
        if (modifiedProducts[product._id]) {
          return {
            ...product,
            price: modifiedProducts[product._id].price !== undefined ? modifiedProducts[product._id].price : product.price,
            countInStock: modifiedProducts[product._id].stockQuantity !== undefined ? modifiedProducts[product._id].stockQuantity : product.countInStock
          };
        }
        return product;
      });
      setProducts(updatedProducts);
      setModifiedProducts({});
      setIsInlineEditMode(false);
      setBulkSaveLoading(false);
      showToast('Inventory updated successfully!');
    } catch (err) {
      setBulkSaveLoading(false);
      alert(err.response?.data?.message || err.message);
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-xl font-medium text-accent-gold/80 animate-pulse">
        Loading inventory...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-accent-gold/10 text-accent-gold p-4 rounded-lg text-center mt-10 border border-accent-gold/20">
        {error}
      </div>
    );
  }

  return (
    <div className="py-8 animate-fade-in relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[60] bg-accent-gold text-bg-base font-bold px-6 py-3 rounded-lg shadow-xl animate-fade-in">
          {toastMessage}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-4xl font-serif font-extrabold text-text-primary tracking-tight">Products</h1>
        
        <div className="flex flex-wrap gap-4 items-center w-full sm:w-auto">
          <input 
            type="text" 
            placeholder="Search products..."
            value={search}
            onChange={(e) => {setSearch(e.target.value); setPage(1);}}
            className="bg-bg-base border border-accent-gold/40 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-gold w-full sm:w-64 flex-1"
          />
          <button 
            onClick={() => {
              setIsInlineEditMode(!isInlineEditMode);
              setModifiedProducts({});
            }}
            className={`font-bold py-3 px-6 rounded-xl shadow-sm transition-all border ${isInlineEditMode ? 'bg-bg-base border-accent-gold text-accent-gold hover:bg-accent-gold/10' : 'bg-surface border-accent-gold/20 hover:border-accent-gold text-text-primary'}`}
          >
            {isInlineEditMode ? 'Cancel Edit' : 'Inline Edit Mode'}
          </button>
          <button 
            onClick={createProductHandler}
            disabled={actionLoading || isInlineEditMode}
            className="bg-accent-gold hover:bg-accent-gold-hover text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Product
          </button>
        </div>
      </div>

      {actionLoading && <div className="text-accent-gold font-bold mb-4 animate-pulse">Processing...</div>}

      <div className="bg-surface rounded-3xl shadow-sm border border-accent-gold/20 overflow-hidden h-[600px]">
        <TableVirtuoso
          data={products}
          useWindowScroll={false}
          fixedHeaderContent={() => (
            <tr className="bg-bg-base/95 backdrop-blur-sm border-b border-accent-gold/20 shadow-sm">
                <th className="px-6 py-4 text-sm font-bold text-text-primary/80 uppercase tracking-wider z-10">ID</th>
                <th className="px-6 py-4 text-sm font-bold text-text-primary/80 uppercase tracking-wider z-10">Name</th>
                <th className="px-6 py-4 text-sm font-bold text-text-primary/80 uppercase tracking-wider z-10">Price</th>
                <th className="px-6 py-4 text-sm font-bold text-text-primary/80 uppercase tracking-wider z-10">Stock</th>
                <th className="px-6 py-4 text-sm font-bold text-text-primary/80 uppercase tracking-wider text-right z-10">Actions</th>
            </tr>
          )}
          itemContent={(index, product) => (
            <>
                  <td className="px-6 py-4 text-sm text-text-primary font-medium">
                    {product._id}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-primary/90 font-semibold truncate max-w-xs">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-primary font-bold">
                    {isInlineEditMode ? (
                      <div className="flex items-center gap-1 bg-bg-base border border-accent-gold/40 rounded px-2 w-24 focus-within:ring-1 focus-within:ring-accent-gold">
                        <span className="text-text-secondary">₹</span>
                        <input 
                          type="number"
                          className="bg-transparent w-full focus:outline-none text-text-primary"
                          defaultValue={product.price}
                          onChange={(e) => handleInputChange(product._id, 'price', e.target.value)}
                        />
                      </div>
                    ) : (
                      `₹${product.price.toFixed(2)}`
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {isInlineEditMode ? (
                      <input 
                        type="number"
                        className="bg-bg-base border border-accent-gold/40 rounded px-3 py-1 w-20 focus:outline-none focus:ring-1 focus:ring-accent-gold text-text-primary"
                        defaultValue={product.countInStock}
                        onChange={(e) => handleInputChange(product._id, 'stockQuantity', e.target.value)}
                      />
                    ) : (
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.countInStock > 0 ? 'bg-sage/20 text-green-400' : 'bg-accent-gold/10 text-accent-gold'
                      }`}>
                        {product.countInStock}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-right flex justify-end gap-3">
                    <Link to={`/admin/product/${product._id}/edit`} className="bg-surface border border-accent-gold/20 hover:border-accent-gold hover:text-accent-gold text-text-primary/80 p-2 rounded-lg transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </Link>
                    <button 
                      onClick={() => deleteHandler(product._id)}
                      disabled={actionLoading}
                      className="bg-accent-gold/10 hover:bg-accent-gold text-accent-gold hover:text-white p-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
            </>
          )}
        />
      </div>

      <div className="flex justify-between items-center mt-6 px-4">
        <button 
          disabled={page === 1} 
          onClick={() => setPage(p => p - 1)}
          className="bg-surface border border-accent-gold/40 text-text-primary font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 hover:border-accent-gold hover:text-accent-gold"
        >
          Previous
        </button>
        <span className="text-text-primary font-medium">Page {page} of {totalPages} <span className="text-text-primary/50 text-sm ml-2">(Total: {totalCount})</span></span>
        <button 
          disabled={page >= totalPages} 
          onClick={() => setPage(p => p + 1)}
          className="bg-surface border border-accent-gold/40 text-text-primary font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 hover:border-accent-gold hover:text-accent-gold"
        >
          Next
        </button>
      </div>

      {isInlineEditMode && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-surface border border-accent-gold/50 rounded-full shadow-2xl px-6 py-3 flex items-center gap-4 animate-fade-in">
          <span className="text-text-primary font-medium">
            {Object.keys(modifiedProducts).length} items modified
          </span>
          <button
            onClick={handleBulkSave}
            disabled={bulkSaveLoading}
            className="bg-accent-gold hover:bg-accent-gold-hover text-bg-base font-bold py-2 px-6 rounded-full transition-colors flex items-center gap-2"
          >
            {bulkSaveLoading ? (
              <svg className="animate-spin h-5 w-5 text-bg-base" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductListScreen;

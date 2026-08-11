import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';

const ProductEditScreen = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [countInStock, setCountInStock] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const { userInfo } = useContext(StoreContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Public route to get details
        const { data } = await axios.get(`/api/products/${productId}`);
        // Pre-fill the form with existing data
        setName(data.name);
        setPrice(data.price);
        setImage(data.image);
        setDescription(data.description);
        setCountInStock(data.countInStock);
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

    fetchProduct();
  }, [productId]);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    setUploadError(null);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.post('/api/upload', formData, config);
      setImage(data);
      setUploading(false);
    } catch (err) {
      setUploadError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
      setUploading(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`, // Must include admin token
        },
      };

      await axios.put(
        `/api/products/${productId}`,
        { name, price, image, description, countInStock },
        config
      );

      setUpdateLoading(false);
      // Navigate back to the list table
      navigate('/admin/productlist');
    } catch (err) {
      alert(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-xl font-medium text-gray-500 animate-pulse">
        Loading product details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center mt-10">
        {error}
      </div>
    );
  }

  return (
    <div className="py-8 animate-fade-in max-w-2xl mx-auto">
      <Link to="/admin/productlist" className="inline-block mb-8 text-text-primary/60 hover:text-accent-gold font-medium transition-colors">
        &larr; Back to Products
      </Link>

      <div className="bg-transparent p-8 sm:p-10 rounded-3xl shadow-sm border border-accent-gold/20">
        <h1 className="text-3xl font-serif font-extrabold text-text-primary mb-8">Edit Product</h1>

        <form onSubmit={submitHandler} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-text-primary/80 mb-2">Name</label>
            <input
              type="text"
              className="w-full px-5 py-4 rounded-xl bg-surface border border-accent-gold/20 text-text-primary focus:ring-2 focus:ring-accent-gold focus:border-accent-gold outline-none transition-all duration-300"
              placeholder="Enter product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-text-primary/80 mb-2">Price (₹)</label>
              <input
                type="number"
                step="0.01"
                className="w-full px-5 py-4 rounded-xl bg-surface border border-accent-gold/20 text-text-primary focus:ring-2 focus:ring-accent-gold focus:border-accent-gold outline-none transition-all duration-300"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-primary/80 mb-2">Count in Stock</label>
              <input
                type="number"
                className="w-full px-5 py-4 rounded-xl bg-surface border border-accent-gold/20 text-text-primary focus:ring-2 focus:ring-accent-gold focus:border-accent-gold outline-none transition-all duration-300"
                placeholder="0"
                value={countInStock}
                onChange={(e) => setCountInStock(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-primary/80 mb-2">Image URL</label>
            <input
              type="text"
              className="w-full px-5 py-4 rounded-xl bg-surface border border-accent-gold/20 text-text-primary focus:ring-2 focus:ring-accent-gold focus:border-accent-gold outline-none transition-all duration-300 mb-3"
              placeholder="Enter image url (e.g. /images/camera.jpg)"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              required
            />
            
            <label className="block text-sm font-semibold text-text-primary/80 mb-2">Upload Image File</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={uploadFileHandler}
              className="w-full text-sm text-text-primary/60
                file:mr-4 file:py-2 file:px-4
                file:rounded-xl file:border-0
                file:text-sm file:font-semibold
                file:bg-accent-gold/10 file:text-accent-gold
                hover:file:bg-accent-gold/20 transition-colors"
            />
            {uploading && (
              <div className="mt-2 text-sm text-accent-gold font-medium flex items-center">
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading image...
              </div>
            )}
            
            {uploadError && (
              <div className="bg-accent-gold/10 text-accent-gold p-3 rounded-lg mt-3 text-sm font-medium border border-accent-gold/20">
                {uploadError}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-primary/80 mb-2">Description</label>
            <textarea
              rows="4"
              className="w-full px-5 py-4 rounded-xl bg-surface border border-accent-gold/20 text-text-primary focus:ring-2 focus:ring-accent-gold focus:border-accent-gold outline-none transition-all duration-300"
              placeholder="Enter product description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={updateLoading}
            className="w-full bg-accent-gold hover:bg-accent-gold-hover text-white font-bold py-4 rounded-xl shadow-md transition-all hover:shadow-lg disabled:opacity-50 mt-4"
          >
            {updateLoading ? 'Updating Product...' : 'Update Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductEditScreen;

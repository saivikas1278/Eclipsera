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
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [paymentQRCode, setPaymentQRCode] = useState('');
  const [upiId, setUpiId] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadingMultiple, setUploadingMultiple] = useState(false);
  const [uploadMultipleError, setUploadMultipleError] = useState(null);

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
        setImages(data.images || []);
        setDescription(data.description);
        setCountInStock(data.countInStock);
        setPaymentQRCode(data.paymentQRCode || '');
        setUpiId(data.upiId || '');
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

  const uploadMultipleFilesHandler = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setUploadingMultiple(true);
    setUploadMultipleError(null);

    const uploadedUrls = [];

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file); // We use 'image' because backend upload.single expects it
        const { data } = await axios.post('/api/upload', formData, config);
        uploadedUrls.push(data);
      }

      setImages((prev) => [...prev, ...uploadedUrls]);
      setUploadingMultiple(false);
    } catch (err) {
      setUploadMultipleError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
      setUploadingMultiple(false);
    }
  };

  const removeImageHandler = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const uploadPaymentQRHandler = async (e) => {
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
      setPaymentQRCode(data);
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
        { name, price, image, images, description, countInStock, paymentQRCode, upiId },
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

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDropSingle = async (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const mockEvent = { target: { files: e.dataTransfer.files } };
      uploadFileHandler(mockEvent);
    }
  };

  const handleDropMultiple = async (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const mockEvent = { target: { files: e.dataTransfer.files } };
      uploadMultipleFilesHandler(mockEvent);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-xl font-medium text-accent-gold/80 animate-pulse">
        Loading product details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 text-red-500 p-4 rounded-lg text-center mt-10 border border-red-500/20">
        {error}
      </div>
    );
  }

  return (
    <div className="py-8 pb-32 animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link to="/admin/productlist" className="inline-flex items-center min-h-12 mb-8 text-text-primary/60 hover:text-accent-gold font-medium transition-colors">
        &larr; Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 bg-surface/80 backdrop-blur-md p-6 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-accent-gold/20">
          <h1 className="text-3xl font-serif font-extrabold text-text-primary mb-8 tracking-tight">Edit Product</h1>

          <form onSubmit={submitHandler} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Name</label>
              <input
                type="text"
                className="w-full px-5 py-4 rounded-xl bg-bg-base/50 border border-accent-gold/20 text-text-primary focus:ring-2 focus:ring-accent-gold focus:border-accent-gold outline-none transition-all duration-300"
                placeholder="Enter product name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-5 py-4 rounded-xl bg-bg-base/50 border border-accent-gold/20 text-text-primary focus:ring-2 focus:ring-accent-gold focus:border-accent-gold outline-none transition-all duration-300"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Count in Stock</label>
                <input
                  type="number"
                  className="w-full px-5 py-4 rounded-xl bg-bg-base/50 border border-accent-gold/20 text-text-primary focus:ring-2 focus:ring-accent-gold focus:border-accent-gold outline-none transition-all duration-300"
                  placeholder="0"
                  value={countInStock}
                  onChange={(e) => setCountInStock(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="pt-4 border-t border-accent-gold/10">
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">Primary Product Image</label>
              
              <div 
                className="border-2 border-dashed border-accent-gold/30 hover:border-accent-gold/70 bg-accent-gold/5 rounded-2xl p-8 text-center transition-colors relative cursor-pointer flex flex-col items-center justify-center min-h-[150px]"
                onDragOver={handleDragOver}
                onDrop={handleDropSingle}
              >
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={uploadFileHandler}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <svg className="w-10 h-10 text-accent-gold/50 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                <span className="text-text-primary font-bold text-sm">Drag and drop image here</span>
                <span className="text-text-secondary text-xs mt-1">or click to browse</span>
              </div>

              <input
                type="text"
                className="w-full mt-4 px-5 py-3 rounded-xl bg-bg-base/50 border border-accent-gold/20 text-text-primary focus:ring-2 focus:ring-accent-gold outline-none transition-all duration-300 text-sm"
                placeholder="Or paste image url directly"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />

              {uploading && (
                <div className="mt-3 text-sm text-accent-gold font-bold flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </div>
              )}
              {uploadError && (
                <div className="bg-red-500/10 text-red-500 p-3 rounded-lg mt-3 text-sm font-bold border border-red-500/20">{uploadError}</div>
              )}
            </div>

            <div className="pt-4 border-t border-accent-gold/10">
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">Additional Image Gallery</label>
              
              <div 
                className="border-2 border-dashed border-accent-gold/30 hover:border-accent-gold/70 bg-accent-gold/5 rounded-2xl p-8 text-center transition-colors relative cursor-pointer flex flex-col items-center justify-center min-h-[150px] mb-4"
                onDragOver={handleDragOver}
                onDrop={handleDropMultiple}
              >
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={uploadMultipleFilesHandler}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <svg className="w-10 h-10 text-accent-gold/50 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className="text-text-primary font-bold text-sm">Drag and drop multiple images</span>
                <span className="text-text-secondary text-xs mt-1">or click to select</span>
              </div>

              {uploadingMultiple && (
                <div className="mb-4 text-sm text-accent-gold font-bold flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading gallery...
                </div>
              )}

              {images.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-2">
                  {images.map((imgUrl, index) => (
                    <div key={index} className="relative w-24 h-24 rounded-xl overflow-hidden border border-accent-gold/20 group shadow-sm">
                      <img src={imgUrl} alt={`gallery-${index}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImageHandler(index)}
                        className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-accent-gold/10">
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Description</label>
              <textarea
                rows="6"
                className="w-full px-5 py-4 rounded-xl bg-bg-base/50 border border-accent-gold/20 text-text-primary focus:ring-2 focus:ring-accent-gold focus:border-accent-gold outline-none transition-all duration-300"
                placeholder="Enter rich product description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>

            {/* Sticky Save Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface/90 backdrop-blur-xl border-t border-accent-gold/20 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] z-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-end">
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="w-full md:w-auto md:min-w-[250px] bg-accent-gold hover:bg-accent-gold-hover text-bg-base font-black uppercase tracking-widest py-4 md:py-3 px-8 rounded-xl shadow-[0_4px_14px_rgba(212,175,55,0.4)] transition-all hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(212,175,55,0.5)] disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {updateLoading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Real-Time Mobile Preview */}
        <div className="hidden lg:block lg:col-span-1 sticky top-24">
          <div className="bg-surface/40 backdrop-blur-md rounded-3xl p-6 border border-accent-gold/10 shadow-lg mb-4 text-center">
            <h3 className="text-xs font-bold text-accent-gold uppercase tracking-widest mb-1 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              Live Mobile Preview
            </h3>
            <p className="text-text-secondary text-xs">See exactly what the customer sees.</p>
          </div>
          
          <div className="mx-auto w-[320px] h-[650px] bg-bg-base border-[8px] border-surface rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative flex flex-col ring-1 ring-white/10">
            {/* Mock iPhone Notch */}
            <div className="absolute top-0 inset-x-0 h-6 bg-surface rounded-b-3xl w-40 mx-auto z-50"></div>
            
            {/* Header Mock */}
            <div className="h-16 border-b border-accent-gold/10 flex items-center justify-between px-4 pt-4 bg-surface/90 backdrop-blur-md z-40">
              <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              <div className="font-serif font-bold text-accent-gold">ECLIPSERA</div>
              <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden pb-24 relative hide-scrollbar">
              <div className="aspect-square bg-surface flex items-center justify-center overflow-hidden">
                {image ? (
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-text-secondary/50 font-bold uppercase text-xs tracking-widest">No Image</span>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h1 className="text-lg font-serif font-bold text-text-primary leading-tight">{name || 'Product Name'}</h1>
                </div>
                <div className="text-xl font-bold text-accent-gold mb-4">₹{price || '0.00'}</div>
                
                <p className="text-text-secondary text-sm whitespace-pre-line line-clamp-4">
                  {description || 'Product description will appear here...'}
                </p>
              </div>
            </div>

            {/* Sticky Bottom Mock */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-surface border-t border-accent-gold/20 rounded-b-[32px]">
              <div className="flex justify-between items-center text-[10px] text-text-secondary font-bold uppercase mb-2">
                <span className="flex items-center gap-1"><svg className="w-3 h-3 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>Secure</span>
                <span className="flex items-center gap-1"><svg className="w-3 h-3 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>7-Day Return</span>
              </div>
              <button className="w-full bg-accent-gold text-bg-base font-bold py-2.5 rounded-lg text-sm uppercase tracking-widest shadow-md">
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductEditScreen;

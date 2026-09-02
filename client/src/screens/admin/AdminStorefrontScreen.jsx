import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { StoreContext } from '../../context/StoreContext';

const AdminStorefrontScreen = () => {
  const { userInfo } = useContext(StoreContext);

  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingObj, setUploadingObj] = useState(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/config/storefront');
      if (data && data.heroSlides && data.heroSlides.length > 0) {
        setSlides(data.heroSlides);
      } else {
        setSlides([{ image: '', heading: '', subheading: '', cta: 'Shop the Collection', link: '/search' }]);
      }
      setLoading(false);
    } catch (err) {
      toast.error('Failed to fetch storefront config');
      setLoading(false);
    }
  };

  const handleSlideChange = (index, field, value) => {
    const updatedSlides = [...slides];
    updatedSlides[index][field] = value;
    setSlides(updatedSlides);
  };

  const handleAddSlide = () => {
    setSlides([...slides, { image: '', heading: '', subheading: '', cta: 'Shop the Collection', link: '/search' }]);
  };

  const handleRemoveSlide = (index) => {
    const updatedSlides = slides.filter((_, i) => i !== index);
    setSlides(updatedSlides);
  };

  const uploadFileHandler = async (e, index) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setUploadingObj(index);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.post('/api/upload', formData, config);
      handleSlideChange(index, 'image', data);
      setUploadingObj(null);
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error('Image upload failed');
      setUploadingObj(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, index) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const mockEvent = { target: { files: e.dataTransfer.files } };
      uploadFileHandler(mockEvent, index);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.put('/api/config/storefront', { heroSlides: slides }, config);
      toast.success('Storefront updated successfully');
      setSaving(false);
    } catch (err) {
      toast.error('Failed to update storefront');
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-text-primary">Loading config...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-16 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8 bg-surface/80 backdrop-blur-md p-6 rounded-3xl border border-accent-gold/20 shadow-sm mt-8">
        <div>
          <h1 className="text-3xl font-serif font-black text-text-primary uppercase tracking-tight flex items-center gap-3">
            <svg className="w-8 h-8 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Dynamic Storefront
          </h1>
          <p className="text-text-secondary mt-1 text-sm font-medium">Manage the Hero Slider on the Home Page.</p>
        </div>
        <button
          onClick={submitHandler}
          disabled={saving}
          className="bg-accent-gold hover:bg-accent-gold-hover text-bg-base font-black px-8 py-4 rounded-xl shadow-[0_4px_14px_rgba(212,175,55,0.4)] transition-all hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(212,175,55,0.5)] uppercase tracking-widest text-sm"
        >
          {saving ? 'Saving...' : 'Publish Changes'}
        </button>
      </div>

      <div className="space-y-8">
        {slides.map((slide, index) => (
          <div key={index} className="bg-surface/80 backdrop-blur-md border border-accent-gold/20 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-accent-gold/10">
              <h3 className="text-2xl font-serif font-bold text-text-primary">Slide {index + 1}</h3>
              {slides.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveSlide(index)}
                  className="text-red-500 hover:text-bg-base hover:bg-red-500 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 border border-red-500/20"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Remove Slide
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">Slide Image</label>
                  
                  <div 
                    className="border-2 border-dashed border-accent-gold/30 hover:border-accent-gold/70 bg-bg-base/50 rounded-2xl p-6 text-center transition-colors relative cursor-pointer flex flex-col items-center justify-center min-h-[120px]"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    <input type="file" onChange={(e) => uploadFileHandler(e, index)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                    {uploadingObj === index ? (
                      <div className="flex flex-col items-center">
                        <svg className="animate-spin h-6 w-6 text-accent-gold mb-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span className="text-accent-gold text-xs font-bold">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-accent-gold/50 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        <span className="text-text-primary font-bold text-sm">Drag and drop image here</span>
                      </>
                    )}
                  </div>
                  
                  <input
                    type="text"
                    value={slide.image}
                    onChange={(e) => handleSlideChange(index, 'image', e.target.value)}
                    className="w-full bg-bg-base/50 border border-accent-gold/20 rounded-xl px-4 py-3 text-text-primary focus:border-accent-gold outline-none mt-3 text-sm"
                    placeholder="Or paste image url directly"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Heading</label>
                  <input
                    type="text"
                    value={slide.heading}
                    onChange={(e) => handleSlideChange(index, 'heading', e.target.value)}
                    className="w-full bg-bg-base border border-accent-gold/20 rounded-lg px-4 py-2 min-h-12 text-text-primary focus:border-accent-gold outline-none"
                    placeholder="Luxurious Handmade Goods"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Subheading</label>
                  <textarea
                    value={slide.subheading}
                    onChange={(e) => handleSlideChange(index, 'subheading', e.target.value)}
                    className="w-full bg-bg-base border border-accent-gold/20 rounded-lg px-4 py-2 min-h-12 text-text-primary focus:border-accent-gold outline-none h-24"
                    placeholder="Curated with precision, crafted with passion."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Button Text</label>
                    <input
                      type="text"
                      value={slide.cta}
                      onChange={(e) => handleSlideChange(index, 'cta', e.target.value)}
                      className="w-full bg-bg-base border border-accent-gold/20 rounded-lg px-4 py-2 min-h-12 text-text-primary focus:border-accent-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Button Link</label>
                    <input
                      type="text"
                      value={slide.link}
                      onChange={(e) => handleSlideChange(index, 'link', e.target.value)}
                      className="w-full bg-bg-base border border-accent-gold/20 rounded-lg px-4 py-2 min-h-12 text-text-primary focus:border-accent-gold outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-bg-base rounded-xl border border-accent-gold/10 overflow-hidden relative min-h-[300px] flex items-center justify-center">
                {slide.image ? (
                  <>
                    <img src={slide.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60"></div>
                    <div className="relative z-10 p-6 text-center">
                      <h4 className="text-3xl font-serif text-white mb-2">{slide.heading || 'Heading'}</h4>
                      <p className="text-white/80 text-sm mb-4">{slide.subheading || 'Subheading'}</p>
                      <span className="inline-block border border-accent-gold text-accent-gold px-4 py-2 text-xs uppercase tracking-widest">{slide.cta || 'Button'}</span>
                    </div>
                  </>
                ) : (
                  <span className="text-text-secondary/50 font-bold uppercase tracking-widest">Image Preview</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddSlide}
        className="mt-8 w-full border-2 border-dashed border-accent-gold/30 hover:border-accent-gold/70 text-accent-gold font-bold py-4 min-h-12 rounded-xl transition-colors uppercase tracking-widest"
      >
        + Add New Slide
      </button>
    </div>
  );
};

export default AdminStorefrontScreen;

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
    <div className="max-w-4xl mx-auto pb-16">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-black text-text-primary uppercase tracking-tight">Dynamic Storefront</h1>
          <p className="text-text-secondary mt-1 text-sm">Manage the Hero Slider on the Home Page</p>
        </div>
        <button
          onClick={submitHandler}
          disabled={saving}
          className="bg-accent-gold hover:bg-accent-gold-hover text-bg-base font-black px-6 py-3 rounded-lg shadow-md transition-all uppercase tracking-widest text-sm"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-8">
        {slides.map((slide, index) => (
          <div key={index} className="bg-surface border border-accent-gold/20 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-text-primary">Slide {index + 1}</h3>
              {slides.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveSlide(index)}
                  className="text-red-400 hover:text-red-300 text-sm font-bold uppercase"
                >
                  Remove Slide
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Image URL</label>
                  <input
                    type="text"
                    value={slide.image}
                    onChange={(e) => handleSlideChange(index, 'image', e.target.value)}
                    className="w-full bg-bg-base border border-accent-gold/20 rounded-lg px-4 py-2 text-text-primary focus:border-accent-gold outline-none"
                    placeholder="/images/hero_banner.png"
                  />
                  <div className="mt-2">
                    <label className="cursor-pointer text-xs font-bold bg-gray-800 text-white px-3 py-1.5 rounded hover:bg-gray-700 transition">
                      {uploadingObj === index ? 'Uploading...' : 'Upload Image'}
                      <input type="file" onChange={(e) => uploadFileHandler(e, index)} className="hidden" accept="image/*" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Heading</label>
                  <input
                    type="text"
                    value={slide.heading}
                    onChange={(e) => handleSlideChange(index, 'heading', e.target.value)}
                    className="w-full bg-bg-base border border-accent-gold/20 rounded-lg px-4 py-2 text-text-primary focus:border-accent-gold outline-none"
                    placeholder="Luxurious Handmade Goods"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Subheading</label>
                  <textarea
                    value={slide.subheading}
                    onChange={(e) => handleSlideChange(index, 'subheading', e.target.value)}
                    className="w-full bg-bg-base border border-accent-gold/20 rounded-lg px-4 py-2 text-text-primary focus:border-accent-gold outline-none h-24"
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
                      className="w-full bg-bg-base border border-accent-gold/20 rounded-lg px-4 py-2 text-text-primary focus:border-accent-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Button Link</label>
                    <input
                      type="text"
                      value={slide.link}
                      onChange={(e) => handleSlideChange(index, 'link', e.target.value)}
                      className="w-full bg-bg-base border border-accent-gold/20 rounded-lg px-4 py-2 text-text-primary focus:border-accent-gold outline-none"
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
        className="mt-8 w-full border-2 border-dashed border-accent-gold/30 hover:border-accent-gold/70 text-accent-gold font-bold py-4 rounded-xl transition-colors uppercase tracking-widest"
      >
        + Add New Slide
      </button>
    </div>
  );
};

export default AdminStorefrontScreen;

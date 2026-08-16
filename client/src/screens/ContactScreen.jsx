import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ContactScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/api/config/contact', formData);
      toast.success('Your message has been sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in py-12 px-4 md:px-8 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-text-primary tracking-tight mb-4">Get in Touch</h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          We'd love to hear from you. Whether you have a question about our products, shipping, or need styling advice, our team is ready to answer all your questions.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
        
        {/* Contact Information (Left Side) */}
        <div className="w-full lg:w-1/3 space-y-8">
          <div>
            <h3 className="text-xl font-bold text-accent-gold mb-6 border-b border-accent-gold/20 pb-4">Contact Information</h3>
            
            <div className="space-y-6 text-text-secondary">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-accent-gold/10 flex items-center justify-center text-accent-gold shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div>
                  <h4 className="font-bold text-text-primary mb-1">Our Studio</h4>
                  <p>123 Artisan Way</p>
                  <p>Mumbai, Maharashtra 400001</p>
                  <p>India</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-accent-gold/10 flex items-center justify-center text-accent-gold shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <h4 className="font-bold text-text-primary mb-1">Email Us</h4>
                  <p className="hover:text-accent-gold transition-colors cursor-pointer">support@eclipsera.com</p>
                  <p className="hover:text-accent-gold transition-colors cursor-pointer">press@eclipsera.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-accent-gold/10 flex items-center justify-center text-accent-gold shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                <div>
                  <h4 className="font-bold text-text-primary mb-1">Call Us</h4>
                  <p>+91 98765 43210</p>
                  <p className="text-sm opacity-80 mt-1">Mon-Fri, 10am - 6pm IST</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form (Right Side) */}
        <div className="w-full lg:w-2/3">
          <form onSubmit={submitHandler} className="bg-surface border border-accent-gold/20 rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden">
            {/* Subtle decorative background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-gold/5 rounded-bl-[100%] pointer-events-none"></div>

            <h3 className="text-2xl font-serif font-bold text-text-primary mb-8 relative z-10">Send us a Message</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 relative z-10">
              <div>
                <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-wider">Your Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-bg-base border border-accent-gold/40 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-gold transition-shadow"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-wider">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-bg-base border border-accent-gold/40 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-gold transition-shadow"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div className="mb-6 relative z-10">
              <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-wider">Subject (Optional)</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full bg-bg-base border border-accent-gold/40 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-gold transition-shadow"
                placeholder="Order inquiry, Returns, Custom Request..."
              />
            </div>

            <div className="mb-8 relative z-10">
              <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-wider">Message *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                className="w-full bg-bg-base border border-accent-gold/40 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-gold transition-shadow resize-none"
                placeholder="How can we help you?"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-accent-gold hover:bg-accent-gold-hover text-bg-base font-bold py-4 px-10 rounded-lg transition-colors shadow-md relative z-10 disabled:opacity-70 flex justify-center items-center gap-3"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-bg-base" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending Message...
                </>
              ) : (
                <>
                  Send Message
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ContactScreen;

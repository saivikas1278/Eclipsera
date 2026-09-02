import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const AboutScreen = () => {
  return (
    <div className="bg-bg-base min-h-screen pb-20">
      <SEO title="Our Story | Eclipsera" description="Learn about Eclipsera's commitment to luxury, craftsmanship, and trust." />
      
      {/* Hero Section */}
      <div className="relative w-full h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1573408301145-b98c4af06b8f?w=1600&h=900&fit=crop" 
          alt="Artisans at work" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-serif font-black text-white mb-6 tracking-tight">Our Story</h1>
          <p className="text-lg md:text-xl text-white/90 font-light max-w-2xl mx-auto">
            Redefining elegance through masterful craftsmanship and uncompromising quality.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-30">
        
        {/* Mission Card */}
        <div className="bg-surface/90 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-accent-gold/20 text-center mb-16 animate-slide-up">
          <svg className="w-12 h-12 text-accent-gold mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-text-primary mb-6">A Legacy of Excellence</h2>
          <p className="text-text-secondary leading-loose font-medium text-lg">
            Founded with a passion for the extraordinary, Eclipsera is more than a destination for luxury goods—it is a celebration of human creativity. We travel the globe to partner with master artisans, curating collections that blend timeless traditions with modern sophistication.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-accent-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent-gold/20">
              <svg className="w-8 h-8 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h3 className="font-bold text-text-primary mb-2 text-lg">Uncompromising Quality</h3>
            <p className="text-sm text-text-secondary leading-relaxed">Every piece is meticulously inspected to ensure it meets our rigorous standards for durability and beauty.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-accent-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent-gold/20">
              <svg className="w-8 h-8 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
            </div>
            <h3 className="font-bold text-text-primary mb-2 text-lg">Ethical Sourcing</h3>
            <p className="text-sm text-text-secondary leading-relaxed">We believe in sustainability and fair trade, ensuring our partners are treated with the utmost respect.</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-accent-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent-gold/20">
              <svg className="w-8 h-8 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h3 className="font-bold text-text-primary mb-2 text-lg">Secure & Trusted</h3>
            <p className="text-sm text-text-secondary leading-relaxed">Your satisfaction is guaranteed with secure transactions, verified reviews, and a hassle-free return policy.</p>
          </div>
        </div>

        {/* Founder Note */}
        <div className="flex flex-col md:flex-row gap-8 items-center bg-surface p-8 rounded-3xl border border-accent-gold/10">
          <div className="w-full md:w-1/3">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-lg border-2 border-accent-gold/20">
              <img src="https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=400&h=400&fit=crop" alt="Founder" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="w-full md:w-2/3">
            <svg className="w-10 h-10 text-accent-gold/40 mb-4" fill="currentColor" viewBox="0 0 32 32">
              <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.896 3.456-8.352 9.12-8.352 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z"></path>
            </svg>
            <p className="text-xl font-serif text-text-primary italic mb-6 leading-relaxed">
              "We didn't just want to create a store; we wanted to create an experience. Every item you find on Eclipsera has been chosen because it tells a story of passion, art, and timeless elegance."
            </p>
            <p className="font-bold text-accent-gold uppercase tracking-widest text-sm">— Eclipsera Founders</p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link to="/search" className="inline-block bg-accent-gold text-bg-base font-bold py-4 px-10 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all uppercase tracking-widest">
            Explore The Collection
          </Link>
        </div>

      </div>
    </div>
  );
};

export default AboutScreen;

import { Link } from 'react-router-dom';

const MeetTheMaker = () => {
  return (
    <section className="mb-20 bg-surface rounded-2xl overflow-hidden border border-accent-gold/10 shadow-2xl">
      <div className="flex flex-col lg:flex-row">
        {/* Image Half */}
        <div className="lg:w-1/2 h-96 lg:h-auto relative">
          <img 
            src="/images/maker_profile.png" 
            alt="Artisan Maker" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        
        {/* Content Half */}
        <div className="lg:w-1/2 p-10 md:p-16 flex flex-col justify-center bg-elevated relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor" className="text-accent-gold">
              <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z"/>
            </svg>
          </div>

          <h2 className="text-sm uppercase tracking-widest text-accent-gold font-bold mb-4">Behind the Craft</h2>
          <h3 className="text-3xl md:text-4xl font-serif text-text-primary mb-6">Meet the Maker</h3>
          <p className="text-text-secondary leading-relaxed mb-8 text-lg font-light">
            Every piece in our collection is meticulously handcrafted in our small workshop. 
            We believe in preserving traditional artisan techniques while designing for the modern home. 
            When you purchase from us, you aren't just buying a product—you're supporting a legacy of craftsmanship.
          </p>
          
          <div className="mt-auto">
            <Link 
              to="/about" 
              className="inline-block border-b-2 border-accent-gold text-accent-gold hover:text-accent-gold-hover pb-1 font-serif text-lg italic transition-colors"
            >
              Read our full story &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MeetTheMaker;

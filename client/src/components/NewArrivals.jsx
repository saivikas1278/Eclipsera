import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import OptimizedImage from './OptimizedImage';

const NewArrivals = ({ products }) => {
  // Take the last 5 items
  const recentProducts = [...products].reverse().slice(0, 5);

  if (recentProducts.length < 5) {
    // Fallback if not enough products for a bento grid
    return (
      <section className="mb-24 px-3 md:px-0">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-text-primary tracking-tight">New Arrivals</h2>
          <div className="w-24 h-px bg-accent-gold mx-auto mt-6 opacity-50"></div>
        </div>
        <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-3 md:gap-6 pb-4 lg:pb-0 snap-x snap-mandatory hide-scrollbar -mx-3 px-3 lg:mx-0 lg:px-0">
          {recentProducts.slice(0, 4).map((product) => (
            <div key={product._id} className="w-[160px] sm:w-[220px] lg:w-auto lg:min-w-0 snap-start flex-shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  const featured = recentProducts[0];
  const gridProducts = recentProducts.slice(1, 5);

  return (
    <section className="mb-24 px-3 md:px-0">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-4xl font-bold font-serif text-text-primary text-center md:text-left mb-8 md:mb-12 tracking-tight">The Latest Curation</h2>
        <p className="text-text-secondary mt-4 text-lg font-light">Fresh aesthetics for the modern home.</p>
        <div className="w-24 h-px bg-accent-gold mx-auto mt-6 opacity-50"></div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* Large Feature Card */}
        <div className="lg:col-span-5 h-[320px] md:h-[450px] lg:h-auto rounded-2xl overflow-hidden relative group shadow-xl border border-accent-gold/20">
          <Link to={`/product/${featured._id}`} className="absolute inset-0 z-20"></Link>
          <OptimizedImage 
            src={featured.image} 
            alt={featured.name} 
            className="w-full h-full object-cover transition-transform duration-[10000ms] group-hover:scale-110"
            sizes="(max-width: 1024px) 100vw, 40vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-base/90 via-bg-base/20 to-transparent pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 transform transition-transform duration-500 z-10 flex flex-col items-start">
            <div className="inline-block px-3 py-1 mb-2 md:mb-4 rounded-full border border-accent-gold/50 text-accent-gold text-[10px] font-bold uppercase tracking-widest bg-accent-gold/10 backdrop-blur-md shadow-sm">Featured</div>
            <h3 className="text-xl sm:text-2xl md:text-4xl font-serif font-bold text-text-primary mb-1 md:mb-2 line-clamp-2 leading-tight drop-shadow-md">{featured.name}</h3>
            <p className="text-lg md:text-2xl font-bold text-accent-gold mb-4 md:mb-6 drop-shadow-sm">₹{featured.price}</p>
            <span className="inline-flex items-center justify-center bg-accent-gold text-bg-base font-bold py-2 px-6 md:py-3 md:px-8 rounded-xl transition-all shadow-lg uppercase tracking-wider text-xs md:text-sm group-hover:shadow-xl group-hover:bg-accent-gold-hover group-hover:scale-105">
              Discover
            </span>
          </div>
        </div>

        {/* 2x2 Grid for other products on desktop, horizontal carousel on mobile */}
        <div className="lg:col-span-7 flex overflow-x-auto lg:grid lg:grid-cols-2 gap-3 md:gap-6 pb-4 lg:pb-0 snap-x snap-mandatory hide-scrollbar -mx-3 px-3 lg:mx-0 lg:px-0">
          {gridProducts.map((product) => (
            <div key={product._id} className="w-[160px] sm:w-[220px] lg:w-auto lg:min-w-0 snap-start flex-shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;

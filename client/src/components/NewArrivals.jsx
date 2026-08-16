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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {recentProducts.slice(0, 4).map((product) => (
            <ProductCard key={product._id} product={product} />
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
        <div className="lg:col-span-5 h-[500px] lg:h-auto rounded-2xl overflow-hidden relative group shadow-xl border border-accent-gold/20">
          <Link to={`/product/${featured._id}`} className="absolute inset-0 z-20"></Link>
          <OptimizedImage 
            src={featured.image} 
            alt={featured.name} 
            className="w-full h-full object-cover transition-transform duration-[10000ms] group-hover:scale-110"
            sizes="(max-width: 1024px) 100vw, 40vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-base/90 via-bg-base/20 to-transparent pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8 transform transition-transform duration-500 z-10">
            <div className="inline-block px-4 py-1.5 mb-4 rounded-full border border-accent-gold/50 text-accent-gold text-[10px] font-bold uppercase tracking-widest bg-accent-gold/10 backdrop-blur-md shadow-sm">Featured Arrival</div>
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-text-primary mb-2 line-clamp-2 leading-tight drop-shadow-md">{featured.name}</h3>
            <p className="text-2xl font-bold text-accent-gold mb-6 drop-shadow-sm">₹{featured.price}</p>
            <span className="inline-block bg-accent-gold text-bg-base font-bold py-3 px-8 rounded-xl transition-all shadow-lg uppercase tracking-wider text-sm group-hover:shadow-xl group-hover:bg-accent-gold-hover group-hover:scale-105">
              Discover
            </span>
          </div>
        </div>

        {/* 2x2 Grid for other products */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-3 md:gap-6">
          {gridProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;

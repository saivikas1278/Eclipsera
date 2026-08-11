import ProductCard from './ProductCard';

const NewArrivals = ({ products }) => {
  // Take the last 4 items (assuming they are the newest) and reverse them
  const recentProducts = [...products].reverse().slice(0, 4);

  if (!recentProducts.length) return null;

  return (
    <section className="mb-20">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-text-primary">New Arrivals</h2>
        <div className="w-24 h-1 bg-accent-gold mx-auto mt-4 opacity-50"></div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 px-3 md:px-0">
        {recentProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default NewArrivals;

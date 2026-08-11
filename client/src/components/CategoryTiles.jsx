import { Link } from 'react-router-dom';

const categories = [
  { name: 'Birthday', image: '/images/occasion_birthday.png', link: '/search?category=Birthday' },
  { name: 'Wedding', image: '/images/occasion_birthday.png', link: '/search?category=Wedding' },
  { name: 'Anniversary', image: '/images/occasion_birthday.png', link: '/search?category=Anniversary' },
  { name: 'Just Because', image: '/images/occasion_birthday.png', link: '/search?category=JustBecause' },
];

const CategoryTiles = () => {
  return (
    <section className="mb-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-serif font-bold text-text-primary">Shop by Occasion</h2>
        <div className="w-24 h-1 bg-accent-gold mx-auto mt-4 opacity-50"></div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {categories.map((cat, index) => (
          <Link 
            key={index} 
            to={cat.link}
            className="group relative block h-64 overflow-hidden rounded-xl bg-surface border border-accent-gold/10 hover:border-accent-gold transition-colors duration-300"
          >
            <img 
              src={cat.image} 
              alt={cat.name} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-base/90 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 w-full text-center">
              <h3 className="text-xl font-serif text-text-primary font-medium group-hover:text-accent-gold transition-colors">
                {cat.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryTiles;

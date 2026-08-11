import { Link } from 'react-router-dom';
import SearchBox from '../components/SearchBox';

const NotFoundScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center animate-fade-in">
      {/* On-Brand Minimalist SVG Illustration */}
      <div className="mb-8 text-accent-gold opacity-80">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="120" 
          height="120" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      </div>

      <h1 className="text-6xl font-serif font-bold text-text-primary mb-4 tracking-tighter">
        404
      </h1>
      
      <h2 className="text-2xl font-serif text-text-primary mb-6">
        Page Not Found
      </h2>
      
      <p className="text-text-secondary max-w-lg mb-10 text-lg font-light leading-relaxed">
        It seems you've wandered off the path. The collection you are looking for does not exist, or it may have been moved.
      </p>

      {/* Search Bar Integration */}
      <div className="w-full max-w-md mb-10">
        <p className="text-sm text-text-secondary mb-3 uppercase tracking-widest">Search our collections</p>
        <SearchBox />
      </div>

      {/* CTA Button */}
      <Link 
        to="/" 
        className="bg-accent-gold hover:bg-accent-gold-hover text-bg-base font-bold py-3 px-8 rounded-full transition-colors flex items-center shadow-lg"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="mr-2"
        >
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Back to Shop
      </Link>
    </div>
  );
};

export default NotFoundScreen;

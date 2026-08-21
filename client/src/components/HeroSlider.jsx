import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';


import axios from 'axios';

const defaultSlides = [
  {
    _id: 'default1',
    image: '/images/hero_banner.png',
    heading: 'Luxurious Handmade Goods',
    subheading: 'Curated with precision, crafted with passion. Discover the art of elegant living.',
    cta: 'Shop the Collection',
    link: '/search'
  },
  {
    _id: 'default2',
    image: '/images/category_home.png',
    heading: 'Elevate Your Space',
    subheading: 'Transform your home with our exclusive collection of artisanal decor and accents.',
    cta: 'Explore Home Decor',
    link: '/search?category=Home'
  },
  {
    _id: 'default3',
    image: '/images/category_candles.png',
    heading: 'The Art of Atmosphere',
    subheading: 'Hand-poured signature scents designed to create moments of pure tranquility.',
    cta: 'Discover Candles',
    link: '/search?category=Candles'
  }
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dynamic storefront config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await axios.get('/api/config/storefront');
        if (data && data.heroSlides && data.heroSlides.length > 0) {
          setSlides(data.heroSlides);
        } else {
          setSlides(defaultSlides);
        }
      } catch (error) {
        console.error('Failed to fetch storefront config', error);
        setSlides(defaultSlides);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // Auto-play logic
  useEffect(() => {
    let interval;
    if (!isHovered && slides.length > 0) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isHovered, slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  if (loading) {
    return (
      <div className="w-full h-[55vh] md:h-[80vh] min-h-[55vh] md:min-h-[80vh] mb-12 md:mb-16 bg-zinc-900 animate-pulse flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-accent-gold/20 border-t-accent-gold rounded-full animate-spin mb-4"></div>
        <div className="text-accent-gold font-serif tracking-widest text-sm uppercase">Loading Storefront</div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-[55vh] md:h-[80vh] min-h-[55vh] md:min-h-[80vh] overflow-hidden group mb-12 md:mb-16 flex flex-col items-center justify-center text-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides */}
      {slides.map((slide, index) => (
        <div 
          key={slide._id || index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Background Image with Parallax */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-fixed transition-transform duration-[10000ms] ease-linear"
            style={{ 
              backgroundImage: `url(${slide.image})`,
              transform: index === currentSlide ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent"></div>
          </div>
          
          {/* Content */}
          <div className="relative h-full flex flex-col justify-center items-start text-left px-6 md:px-16 lg:px-32 w-full z-20">
            <div className="max-w-2xl">
              <h1 
                className={`text-4xl md:text-6xl lg:text-8xl font-serif font-light text-text-primary mb-6 drop-shadow-md transition-all duration-1000 delay-300 transform ${
                  index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                }`}
              >
                {slide.heading}
              </h1>
              <p 
                className={`text-lg md:text-xl text-text-primary/90 mb-12 font-light tracking-wide drop-shadow-sm transition-all duration-1000 delay-500 transform ${
                  index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                }`}
              >
                {slide.subheading}
              </p>
              <Link 
                to={slide.link} 
                className={`inline-flex items-center justify-center border border-accent-gold text-accent-gold hover:bg-accent-gold hover:text-bg-base font-medium h-14 px-10 rounded-sm text-sm transition-all duration-500 transform hover:scale-105 delay-700 uppercase tracking-[0.2em] ${
                  index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                }`}
              >
                {slide.cta || 'Discover Collection'}
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-bg-base/30 hover:bg-accent-gold/80 text-text-primary p-3 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-4 group-hover:translate-x-0"
        aria-label="Previous Slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-bg-base/30 hover:bg-accent-gold/80 text-text-primary p-3 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0"
        aria-label="Next Slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center transition-all duration-300`}
            aria-label={`Go to slide ${index + 1}`}
          >
            <span className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-accent-gold scale-125' 
                : 'bg-text-primary/40 hover:bg-text-primary/80'
            }`}></span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;

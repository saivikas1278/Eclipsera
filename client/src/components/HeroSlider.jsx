import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';


const slides = [
  {
    id: 1,
    image: '/images/hero_banner.png',
    heading: 'Luxurious Handmade Goods',
    subheading: 'Curated with precision, crafted with passion. Discover the art of elegant living.',
    cta: 'Shop the Collection',
    link: '/search'
  },
  {
    id: 2,
    image: '/images/category_home.png',
    heading: 'Elevate Your Space',
    subheading: 'Transform your home with our exclusive collection of artisanal decor and accents.',
    cta: 'Explore Home Decor',
    link: '/search?category=Home'
  },
  {
    id: 3,
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

  // Auto-play logic
  useEffect(() => {
    let interval;
    if (!isHovered) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isHovered]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div 
      className="relative w-full h-[600px] overflow-hidden rounded-2xl shadow-2xl mb-16 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides */}
      {slides.map((slide, index) => (
        <div 
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-linear"
            style={{ 
              backgroundImage: `url(${slide.image})`,
              transform: index === currentSlide ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            <div className="absolute inset-0 bg-bg-base/50"></div>
          </div>
          
          {/* Content */}
          <div className="relative h-full flex flex-col justify-center items-center text-center px-4 w-full">
            <h1 
              className={`text-3xl md:text-5xl lg:text-7xl font-serif font-bold text-text-primary mb-4 md:mb-6 drop-shadow-lg transition-all duration-700 delay-300 transform ${
                index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
            >
              {slide.heading}
            </h1>
            <p 
              className={`text-base md:text-xl lg:text-2xl text-text-primary mb-8 md:mb-10 max-w-2xl font-light drop-shadow-md transition-all duration-700 delay-500 transform ${
                index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
            >
              {slide.subheading}
            </p>
            <Link 
              to={slide.link} 
              className={`bg-accent-gold hover:bg-accent-gold-hover text-bg-base font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-xl delay-700 ${
                index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
            >
              {slide.cta}
            </Link>
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
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-accent-gold scale-125' 
                : 'bg-text-primary/40 hover:bg-text-primary/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;

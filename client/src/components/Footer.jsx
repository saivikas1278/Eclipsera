import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bg-secondary pt-8 md:pt-16 pb-24 md:pb-8 border-t border-accent-gold/10 mt-auto">
      <div className="container mx-auto px-4 max-w-7xl">
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-16">
          {/* Brand Info */}
          <div className="col-span-2 lg:col-span-1">
            <h3 className="text-xl font-serif text-accent-gold mb-6 tracking-widest uppercase">Eclipsera Premium</h3>
            <p className="text-text-secondary text-sm mb-6 leading-relaxed">
              Elevating everyday living through meticulously handcrafted goods. Designed for those who appreciate the finer things in life.
            </p>
            <div className="flex space-x-4 text-accent-gold">
              {/* Social Icons (using simple text/SVG for now) */}
              <a href="#" className="hover:text-accent-gold-hover transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" className="hover:text-accent-gold-hover transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.597 0 0 .597 0 1.325v21.351C0 23.403.597 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.597 1.323-1.324V1.325C24 .597 23.403 0 22.675 0z"/></svg>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div className="col-span-1">
            <h4 className="text-text-primary font-bold mb-4 md:mb-6 tracking-wider">SHOP</h4>
            <ul className="space-y-3">
              <li><Link to="/search" className="text-text-secondary hover:text-accent-gold transition-colors">All Products</Link></li>
              <li><Link to="/search?category=New" className="text-text-secondary hover:text-accent-gold transition-colors">New Arrivals</Link></li>
              <li><Link to="/search?category=BestSellers" className="text-text-secondary hover:text-accent-gold transition-colors">Bestsellers</Link></li>
              <li><Link to="/search?category=Gifts" className="text-text-secondary hover:text-accent-gold transition-colors">Gifts</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-span-1">
            <h4 className="text-text-primary font-bold mb-4 md:mb-6 tracking-wider">SUPPORT</h4>
            <ul className="space-y-3">
              <li><Link to="/faq" className="text-text-secondary hover:text-accent-gold transition-colors">FAQ</Link></li>
              <li><Link to="/shipping-policy" className="text-text-secondary hover:text-accent-gold transition-colors">Shipping & Returns</Link></li>
              <li><Link to="/contact" className="text-text-secondary hover:text-accent-gold transition-colors">Contact Us</Link></li>
              <li><Link to="/care-guide" className="text-text-secondary hover:text-accent-gold transition-colors">Product Care</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 lg:col-span-1">
            <h4 className="text-text-primary font-bold mb-4 md:mb-6 tracking-wider">NEWSLETTER</h4>
            <p className="text-text-secondary text-sm mb-4">Subscribe for updates, access to exclusive deals, and more.</p>
            <form className="flex" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Email address" 
                className="w-full bg-bg-base border border-r-0 border-accent-gold/30 rounded-l-md px-4 py-2 text-text-primary focus:outline-none focus:border-accent-gold text-sm"
              />
              <button 
                type="submit" 
                className="bg-surface border border-accent-gold/30 border-l-0 rounded-r-md px-4 py-2 text-accent-gold hover:text-accent-gold-hover hover:bg-bg-base transition-colors text-sm font-bold"
              >
                JOIN
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-accent-gold/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-text-secondary">
          <p>&copy; {currentYear} Eclipsera Premium. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Amex</span>
            <span>Razorpay</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

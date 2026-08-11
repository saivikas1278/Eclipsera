const NewsletterSignup = () => {
  return (
    <section className="bg-surface border border-accent-gold/20 rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto my-20 shadow-2xl relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-accent-gold)_0%,_transparent_70%)] opacity-5 pointer-events-none"></div>
      
      <div className="relative z-10">
        <h2 className="text-3xl font-serif text-text-primary mb-4">Join the Inner Circle</h2>
        <p className="text-text-secondary mb-8 max-w-lg mx-auto">
          Subscribe to our newsletter to receive early access to new collections, artisan stories, and <strong className="text-accent-gold">10% off your first order</strong>.
        </p>
        
        <form className="flex flex-col md:flex-row gap-4 justify-center max-w-xl mx-auto" onSubmit={(e) => e.preventDefault()}>
          <input 
            type="email" 
            placeholder="Enter your email address" 
            className="flex-grow bg-bg-base border border-accent-gold/30 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-colors placeholder:text-text-secondary/50"
            required
          />
          <button 
            type="submit" 
            className="bg-accent-gold hover:bg-accent-gold-hover text-bg-base font-bold py-3 px-8 rounded-lg transition-colors whitespace-nowrap"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
};

export default NewsletterSignup;

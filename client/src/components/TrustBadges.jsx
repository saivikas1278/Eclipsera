const TrustBadges = () => {
  return (
    <section className="py-6 md:py-12 border-y border-accent-gold/10 bg-bg-secondary my-8 md:my-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          
          <div className="flex flex-row md:flex-col items-center md:items-center text-left md:text-center gap-4 md:gap-0 bg-surface/50 md:bg-transparent p-4 md:p-0 rounded-xl md:rounded-none">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-surface border border-accent-gold/20 flex flex-shrink-0 items-center justify-center md:mb-4">
              <svg className="w-6 h-6 md:w-8 md:h-8 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 className="text-text-primary font-serif font-bold text-base md:text-lg mb-1 md:mb-2">Handmade Guarantee</h4>
              <p className="text-text-secondary text-xs md:text-sm md:px-4">Every item is crafted with premium materials and absolute precision.</p>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-center text-left md:text-center gap-4 md:gap-0 bg-surface/50 md:bg-transparent p-4 md:p-0 rounded-xl md:rounded-none">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-surface border border-accent-gold/20 flex flex-shrink-0 items-center justify-center md:mb-4">
              <svg className="w-6 h-6 md:w-8 md:h-8 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h4 className="text-text-primary font-serif font-bold text-base md:text-lg mb-1 md:mb-2">Secure Checkout</h4>
              <p className="text-text-secondary text-xs md:text-sm md:px-4">Your payment information is processed securely via Razorpay.</p>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-center text-left md:text-center gap-4 md:gap-0 bg-surface/50 md:bg-transparent p-4 md:p-0 rounded-xl md:rounded-none">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-surface border border-accent-gold/20 flex flex-shrink-0 items-center justify-center md:mb-4">
              <svg className="w-6 h-6 md:w-8 md:h-8 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div>
              <h4 className="text-text-primary font-serif font-bold text-base md:text-lg mb-1 md:mb-2">Fast, Tracked Shipping</h4>
              <p className="text-text-secondary text-xs md:text-sm md:px-4">Complimentary tracked shipping on all orders over ₹10,000.</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TrustBadges;

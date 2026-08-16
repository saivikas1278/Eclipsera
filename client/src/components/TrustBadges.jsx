const TrustBadges = () => {
  const badges = [
    {
      title: "Handmade Guarantee",
      desc: "Crafted with absolute precision.",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
    },
    {
      title: "Secure Checkout",
      desc: "Processed securely via Razorpay.",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    },
    {
      title: "Fast Shipping",
      desc: "Tracked shipping on all orders.",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    },
    {
      title: "Artisan Quality",
      desc: "Sourced globally, perfected locally.",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    }
  ];

  return (
    <section className="py-8 md:py-12 border-y border-accent-gold/10 bg-surface my-8 md:my-16 overflow-hidden relative">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
      `}</style>
      
      {/* Gradients for fade effect on edges */}
      <div className="absolute top-0 bottom-0 left-0 w-16 md:w-32 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none"></div>
      <div className="absolute top-0 bottom-0 right-0 w-16 md:w-32 bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none"></div>
      
      <div className="flex w-max animate-marquee gap-8 md:gap-16 items-center">
        {/* Duplicate badges to ensure infinite scroll fills the screen */}
        {[...badges, ...badges, ...badges, ...badges, ...badges, ...badges].map((badge, idx) => (
          <div key={idx} className="flex items-center gap-4 w-60 md:w-80">
            <div className="w-12 h-12 rounded-full bg-bg-base border border-accent-gold/30 flex flex-shrink-0 items-center justify-center shadow-inner">
              <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {badge.icon}
              </svg>
            </div>
            <div>
              <h4 className="text-text-primary font-serif font-bold text-sm md:text-base mb-1">{badge.title}</h4>
              <p className="text-text-secondary text-[10px] md:text-xs leading-tight">{badge.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustBadges;

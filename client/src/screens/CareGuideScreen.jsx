import { useEffect } from 'react';

const CareGuideScreen = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const careCategories = [
    {
      id: 'jewelry',
      title: 'Fine Jewelry',
      icon: (
        <svg className="w-8 h-8 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3L2 12h3v8h14v-8h3L12 3zm0 2.8L16.2 10H7.8L12 5.8z" />
        </svg>
      ),
      description: 'Our jewelry is crafted from premium metals and stones. With proper care, they will maintain their brilliance for years to come.',
      dos: [
        'Store pieces individually in their original Eclipsera pouches to prevent scratching.',
        'Wipe your jewelry with a soft, lint-free cloth after every wear to remove oils and sweat.',
        'Apply perfumes, lotions, and hairspray before putting on your jewelry.'
      ],
      donts: [
        'Do not wear jewelry while swimming, showering, or exercising.',
        'Avoid contact with household cleaning products or harsh chemicals.',
        'Never use abrasive cleaners or toothpaste to polish your pieces.'
      ]
    },
    {
      id: 'leather',
      title: 'Premium Leather',
      icon: (
        <svg className="w-8 h-8 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M5 10V6a2 2 0 012-2h10a2 2 0 012 2v4M7 22h10a2 2 0 002-2V10H5v10a2 2 0 002 2z" />
        </svg>
      ),
      description: 'We use full-grain and top-grain leathers that develop a beautiful patina over time. Treat them with respect.',
      dos: [
        'Condition your leather goods every 3-6 months with a premium leather cream.',
        'If it gets wet, let it dry naturally at room temperature.',
        'Store in the provided dust bag when not in use, stuffed with tissue to maintain shape.'
      ],
      donts: [
        'Keep leather out of direct, prolonged sunlight to prevent fading and drying.',
        'Never use artificial heat (like a hairdryer or radiator) to dry wet leather.',
        'Do not overstuff wallets or bags, as leather stretches but rarely shrinks back.'
      ]
    },
    {
      id: 'apparel',
      title: 'Luxury Apparel',
      icon: (
        <svg className="w-8 h-8 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      description: 'Our fabrics are selected for their superior feel and drape. Proper washing and storage are essential.',
      dos: [
        'Always read the care label inside the garment before washing.',
        'Use a gentle, pH-neutral detergent for delicate fabrics like silk or cashmere.',
        'Fold heavy knits rather than hanging them to prevent stretching.'
      ],
      donts: [
        'Avoid wringing out delicate fabrics to remove excess water.',
        'Do not use bleach or harsh stain removers.',
        'Avoid wire hangers; use padded or wooden hangers for tailored items.'
      ]
    }
  ];

  return (
    <div className="animate-fade-in py-12 px-4 md:px-8 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-text-primary tracking-tight mb-4">Product Care Guide</h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Eclipsera Premium pieces are designed to last a lifetime. Follow these simple guidelines to keep your handcrafted goods in pristine condition.
        </p>
      </div>

      <div className="space-y-16">
        {careCategories.map((category, index) => (
          <div 
            key={category.id} 
            className={`flex flex-col ${index % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 lg:gap-12 items-center`}
          >
            {/* Visual Block */}
            <div className="w-full lg:w-1/3 bg-surface border border-accent-gold/20 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden h-full min-h-[300px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/5 rounded-bl-full"></div>
              <div className="w-20 h-20 rounded-full bg-accent-gold/10 flex items-center justify-center mb-6 z-10 border border-accent-gold/30">
                {category.icon}
              </div>
              <h2 className="text-2xl font-serif font-bold text-text-primary mb-4 z-10">{category.title}</h2>
              <p className="text-text-secondary z-10">{category.description}</p>
            </div>

            {/* Dos and Donts */}
            <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dos */}
              <div className="bg-bg-base border border-green-900/50 rounded-2xl p-6 h-full shadow-sm">
                <div className="flex items-center gap-3 mb-6 border-b border-green-900/30 pb-4">
                  <div className="w-8 h-8 rounded-full bg-green-900/50 flex items-center justify-center text-green-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-text-primary">What to do</h3>
                </div>
                <ul className="space-y-4">
                  {category.dos.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-text-secondary">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Donts */}
              <div className="bg-bg-base border border-red-900/50 rounded-2xl p-6 h-full shadow-sm">
                <div className="flex items-center gap-3 mb-6 border-b border-red-900/30 pb-4">
                  <div className="w-8 h-8 rounded-full bg-red-900/50 flex items-center justify-center text-red-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-text-primary">What to avoid</h3>
                </div>
                <ul className="space-y-4">
                  {category.donts.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-text-secondary">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-20 bg-surface border border-accent-gold/20 rounded-2xl p-8 text-center max-w-3xl mx-auto shadow-md">
        <h3 className="text-2xl font-serif font-bold text-text-primary mb-4">Professional Repair Service</h3>
        <p className="text-text-secondary mb-6">
          Accidents happen. If your Eclipsera piece requires professional restoration, our artisans are available to repair and refurbish your items to their original glory.
        </p>
        <p className="text-accent-gold font-bold">Contact us for a repair quote.</p>
      </div>
    </div>
  );
};

export default CareGuideScreen;

import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const ShippingPolicyScreen = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="animate-fade-in py-12 px-4 md:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-text-primary tracking-tight mb-4">Shipping & Returns</h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Everything you need to know about getting your Eclipsera Premium pieces and what to do if you change your mind.
        </p>
      </div>

      <div className="bg-surface border border-accent-gold/20 rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden">
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-accent-gold/40 rounded-tl-3xl opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-accent-gold/40 rounded-br-3xl opacity-50"></div>

        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-accent-gold/10 flex items-center justify-center text-accent-gold shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
            </div>
            <h2 className="text-2xl font-serif font-bold text-accent-gold">Shipping Policy</h2>
          </div>
          
          <div className="space-y-6 text-text-secondary leading-relaxed">
            <p>
              At <strong className="text-text-primary font-bold">Eclipsera Premium</strong>, we ensure that your luxury items reach you safely and promptly. All our orders are securely packaged to protect them during transit.
            </p>
            
            <h3 className="text-lg font-bold text-text-primary mt-6 mb-2">Processing Time</h3>
            <p>
              All orders are processed within <strong className="text-accent-gold">1 to 2 business days</strong> (excluding weekends and holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped.
            </p>
            <p className="text-sm italic opacity-80 border-l-2 border-accent-gold/50 pl-4 py-1">
              Note: Custom-made or personalized orders require an additional 3-5 days for crafting before they are shipped.
            </p>

            <h3 className="text-lg font-bold text-text-primary mt-6 mb-2">Shipping Rates & Estimates</h3>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-accent-gold/20 text-text-primary">
                    <th className="py-3 px-4 font-bold">Shipping Method</th>
                    <th className="py-3 px-4 font-bold">Estimated Delivery</th>
                    <th className="py-3 px-4 font-bold">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-accent-gold/10">
                  <tr>
                    <td className="py-4 px-4 font-medium text-text-primary">Standard Shipping</td>
                    <td className="py-4 px-4">3-5 Business Days</td>
                    <td className="py-4 px-4 font-bold text-accent-gold">Free</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium text-text-primary">Express Shipping</td>
                    <td className="py-4 px-4">1-2 Business Days</td>
                    <td className="py-4 px-4 font-bold text-accent-gold">₹150.00</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium text-text-primary">Cash on Delivery</td>
                    <td className="py-4 px-4">3-7 Business Days</td>
                    <td className="py-4 px-4 font-bold text-accent-gold">₹50.00 Surcharge</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-bold text-text-primary mt-6 mb-2">International Shipping</h3>
            <p>
              We currently do not offer international shipping directly through our website. If you are located outside of India and wish to place an order, please <Link to="/contact" className="text-accent-gold underline hover:text-accent-gold-hover">contact our support team</Link> to arrange custom shipping.
            </p>
          </div>
        </section>

        <hr className="border-accent-gold/20 my-12" />

        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-accent-gold/10 flex items-center justify-center text-accent-gold shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            </div>
            <h2 className="text-2xl font-serif font-bold text-accent-gold">Returns & Refunds</h2>
          </div>
          
          <div className="space-y-6 text-text-secondary leading-relaxed">
            <p>
              We stand behind the quality of our products. If you are not entirely satisfied with your purchase, we're here to help.
            </p>

            <h3 className="text-lg font-bold text-text-primary mt-6 mb-2">Returns</h3>
            <p>
              You have <strong className="text-accent-gold">7 calendar days</strong> to return an item from the date you received it.
            </p>
            <p>
              To be eligible for a return, your item must be unused, in the same condition that you received it, and in its original premium packaging with all tags attached. You must also have the receipt or proof of purchase.
            </p>
            <p className="text-red-400 font-medium">
              * Personalized, custom-made, or final sale items cannot be returned unless they arrived damaged or defective.
            </p>

            <h3 className="text-lg font-bold text-text-primary mt-6 mb-2">Refunds</h3>
            <p>
              Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item.
            </p>
            <p>
              If your return is approved, we will initiate a refund to your original method of payment. You will receive the credit within a certain amount of days, depending on your card issuer's policies (typically 5-7 business days).
            </p>

            <h3 className="text-lg font-bold text-text-primary mt-6 mb-2">Shipping Costs for Returns</h3>
            <p>
              You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.
            </p>
            
            <div className="mt-8 bg-bg-base border border-accent-gold/30 p-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="font-bold text-text-primary mb-1">Ready to initiate a return?</h4>
                <p className="text-sm">Reach out to our support team to get your return authorization.</p>
              </div>
              <Link to="/contact" className="bg-accent-gold hover:bg-accent-gold-hover text-bg-base font-bold py-3 px-8 rounded-lg transition-colors whitespace-nowrap shadow-md">
                Contact Support
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ShippingPolicyScreen;

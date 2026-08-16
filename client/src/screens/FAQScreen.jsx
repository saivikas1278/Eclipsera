import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const FAQScreen = () => {
  const [activeCategory, setActiveCategory] = useState('orders');
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = [
    { id: 'orders', label: 'Orders & Payments' },
    { id: 'shipping', label: 'Shipping & Delivery' },
    { id: 'returns', label: 'Returns & Refunds' },
    { id: 'products', label: 'Products & Care' },
  ];

  const faqs = {
    orders: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, Mastercard, American Express), Razorpay, and Cash on Delivery (subject to pin code availability). For manual PhonePe payments, we require a screenshot uploaded at checkout.'
      },
      {
        question: 'Can I change or cancel my order after placing it?',
        answer: 'You can cancel your order within 24 hours of placing it if it has not yet been processed or shipped. Once shipped, you will need to follow our returns process.'
      },
      {
        question: 'How do I know my order is confirmed?',
        answer: 'Once your payment is processed, you will receive an order confirmation email and SMS with your order details and invoice.'
      }
    ],
    shipping: [
      {
        question: 'How long does shipping take?',
        answer: 'Standard shipping takes 3-5 business days for domestic orders. Express delivery is available for select locations within 1-2 business days.'
      },
      {
        question: 'Do you ship internationally?',
        answer: 'Currently, we only ship within India. We are working on expanding our reach globally soon!'
      },
      {
        question: 'How can I track my order?',
        answer: 'Once your order is dispatched, you will receive a tracking link via email. You can also view live tracking from the "Track My Orders" section in your account dashboard.'
      }
    ],
    returns: [
      {
        question: 'What is your return policy?',
        answer: 'We offer a 7-day return policy for unused items in their original packaging. Custom-made or personalized items cannot be returned.'
      },
      {
        question: 'How do I initiate a return?',
        answer: 'Log into your account, go to your order history, and click "Request Return" on the eligible item. Alternatively, contact our support team.'
      },
      {
        question: 'When will I receive my refund?',
        answer: 'Refunds are processed within 5-7 business days after we receive and inspect the returned item. The amount will be credited back to your original payment method.'
      }
    ],
    products: [
      {
        question: 'Are your products authentically handcrafted?',
        answer: 'Yes! Every Eclipsera Premium product is meticulously handcrafted by skilled artisans using ethically sourced materials.'
      },
      {
        question: 'Does the jewelry tarnish?',
        answer: 'Our jewelry is plated with premium gold/rhodium and coated with an anti-tarnish layer. However, avoiding exposure to perfumes, water, and harsh chemicals will maximize longevity.'
      },
      {
        question: 'Do you offer a warranty?',
        answer: 'We offer a 6-month warranty against manufacturing defects on all our products. Normal wear and tear is not covered.'
      }
    ]
  };

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="animate-fade-in py-12 px-4 md:px-8 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-text-primary tracking-tight mb-4">Frequently Asked Questions</h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Find answers to common questions about our products, shipping, returns, and more.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-16 items-start">
        {/* Categories Sidebar */}
        <div className="w-full md:w-1/3 sticky top-24">
          <div className="bg-surface border border-accent-gold/20 rounded-2xl p-2 shadow-sm">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setOpenIndex(null);
                }}
                className={`w-full text-left px-6 py-4 rounded-xl font-bold transition-all duration-300 ${
                  activeCategory === cat.id 
                    ? 'bg-accent-gold text-bg-base shadow-md' 
                    : 'text-text-primary hover:bg-bg-base hover:text-accent-gold'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          
          <div className="mt-8 bg-accent-gold/10 border border-accent-gold/20 rounded-2xl p-6 text-center">
            <h3 className="font-serif font-bold text-xl text-text-primary mb-2">Still have questions?</h3>
            <p className="text-sm text-text-secondary mb-4">Our dedicated support team is here to help.</p>
            <Link to="/contact" className="inline-block bg-surface border border-accent-gold text-accent-gold hover:bg-accent-gold hover:text-bg-base font-bold py-2 px-6 rounded-lg transition-colors w-full">
              Contact Us
            </Link>
          </div>
        </div>

        {/* FAQ Accordions */}
        <div className="w-full md:w-2/3">
          <h2 className="text-2xl font-serif font-bold text-accent-gold mb-6 border-b border-accent-gold/20 pb-4">
            {categories.find(c => c.id === activeCategory)?.label}
          </h2>
          
          <div className="space-y-4">
            {faqs[activeCategory].map((faq, index) => (
              <div 
                key={index} 
                className={`bg-surface border rounded-xl overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'border-accent-gold shadow-md' : 'border-accent-gold/10 hover:border-accent-gold/50'
                }`}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none"
                >
                  <span className={`font-bold pr-8 transition-colors ${openIndex === index ? 'text-accent-gold' : 'text-text-primary'}`}>
                    {faq.question}
                  </span>
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${
                    openIndex === index ? 'bg-accent-gold border-accent-gold text-bg-base' : 'border-accent-gold/30 text-accent-gold'
                  }`}>
                    <svg className={`w-4 h-4 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </button>
                
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-6 pt-0 text-text-secondary leading-relaxed border-t border-accent-gold/10 mt-2">
                    <p className="pt-4">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQScreen;

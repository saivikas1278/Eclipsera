import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Search, ChevronDown, HelpCircle, MessageSquare } from 'lucide-react';

export const FaqsView: React.FC = () => {
  const { faqs, setCurrentView } = useUser();
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-1');

  const topics = ['ALL', 'Ordering', 'Shipping', 'Returns', 'Customization', 'Artisans'];

  const filteredFaqs = faqs.filter(f => {
    const matchesSearch = f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase());
    const matchesTopic = selectedTopic === 'ALL' || f.category === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-fade-in text-obsidian-900 font-sans">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <span className="px-3.5 py-1 bg-gold-500/10 text-gold-700 rounded-full text-xs font-bold uppercase tracking-widest inline-block border border-gold-500/20">
          Knowledge Base & Support
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-obsidian-900/70 leading-relaxed">
          Have questions about ordering, custom artisan engravings, transit insurance, or returns? Search our FAQ directory below.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input 
          type="text"
          placeholder="Search within FAQs (e.g., vegetable dyes, Blue Dart, returns)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-cream-300 rounded-2xl pl-10 pr-4 py-3.5 text-xs font-semibold shadow-sm focus:outline-none focus:border-gold-500"
        />
        <Search className="w-4 h-4 text-obsidian-900/40 absolute left-3.5 top-4" />
      </div>

      {/* Topic Filter Chips */}
      <div className="flex justify-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
        {topics.map(t => (
          <button
            key={t}
            onClick={() => setSelectedTopic(t)}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              selectedTopic === t ? 'bg-obsidian-900 text-cream-100 shadow-md' : 'bg-cream-100 border border-cream-300 hover:bg-cream-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.map(faq => {
          const isExpanded = expandedFaqId === faq.id;
          return (
            <div 
              key={faq.id}
              className="bg-white rounded-2xl border border-cream-300 overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                className="w-full p-4 sm:p-5 flex justify-between items-center text-left font-bold text-sm hover:text-gold-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-gold-500/10 text-gold-700 px-2.5 py-0.5 rounded-full shrink-0">
                    {faq.category}
                  </span>
                  <span>{faq.question}</span>
                </div>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-gold-600' : 'text-obsidian-900/40'}`} />
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-1 text-xs text-obsidian-900/70 leading-relaxed border-t border-cream-150 bg-cream-100/30">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Still need help CTA */}
      <div className="bg-obsidian-900 text-cream-100 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="space-y-1">
          <h3 className="font-serif font-bold text-base">Still Have Unanswered Questions?</h3>
          <p className="text-xs text-cream-100/70">Our concierge support team is available Monday through Saturday.</p>
        </div>
        <button
          onClick={() => setCurrentView('contact')}
          className="px-5 py-2.5 bg-gold-500 text-obsidian-950 hover:bg-gold-400 font-bold uppercase text-xs rounded-xl tracking-wider shrink-0"
        >
          Contact Customer Care
        </button>
      </div>

    </div>
  );
};
export default FaqsView;

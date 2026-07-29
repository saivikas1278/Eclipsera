import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Calendar, User, Clock, ArrowRight, BookOpen } from 'lucide-react';

export const BlogListView: React.FC = () => {
  const { blogPosts, openBlogPost } = useUser();
  const [selectedCat, setSelectedCat] = useState('ALL');

  const categories = ['ALL', 'Artisan Stories', 'Craft Techniques', 'Gift Ideas', 'Behind the Scenes'];

  const filteredPosts = blogPosts.filter(p => selectedCat === 'ALL' || p.category === selectedCat);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fade-in text-obsidian-900 font-sans">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="px-3.5 py-1 bg-gold-500/10 text-gold-700 rounded-full text-xs font-bold uppercase tracking-widest inline-block border border-gold-500/20">
          Heritage & Culture Journal
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
          Stories Behind the Craft
        </h1>
        <p className="text-xs sm:text-sm text-obsidian-900/70 leading-relaxed">
          Deep dive into centuries of Indian art traditions, master artisan interviews, sustainable lifestyle guides, and workshop highlights.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex justify-center gap-2 overflow-x-auto pb-2 text-xs font-bold">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap ${
              selectedCat === cat ? 'bg-obsidian-900 text-cream-100 shadow-md' : 'bg-cream-100 border border-cream-300 hover:bg-cream-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filteredPosts.map(post => (
          <div 
            key={post.slug}
            onClick={() => openBlogPost(post.slug)}
            className="bg-white rounded-3xl border border-cream-300 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-4 p-5">
              <div className="relative h-48 rounded-2xl overflow-hidden bg-cream-100">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-3 left-3 bg-obsidian-900/80 backdrop-blur-md text-gold-400 text-[10px] font-bold uppercase px-3 py-1 rounded-full">
                  {post.category}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-4 text-[10px] text-obsidian-900/50 font-bold">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-gold-600" /> {post.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-gold-600" /> {post.readTime}</span>
                </div>

                <h3 className="font-serif font-bold text-lg group-hover:text-gold-600 transition-colors leading-snug">{post.title}</h3>
                <p className="text-xs text-obsidian-900/70 line-clamp-2 leading-relaxed">{post.excerpt}</p>
              </div>
            </div>

            <div className="p-4 bg-cream-100/50 border-t border-cream-200 flex justify-between items-center text-xs font-bold">
              <span className="text-obsidian-900/60 font-sans">By {post.author}</span>
              <span className="text-gold-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Read Article <ArrowRight className="w-3.5 h-3.5 inline" />
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
export default BlogListView;

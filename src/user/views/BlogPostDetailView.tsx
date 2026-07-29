import React from 'react';
import { useUser } from '../context/UserContext';
import { Calendar, User, Clock, Share2, Facebook, Twitter, Linkedin, ArrowLeft, Bookmark } from 'lucide-react';

export const BlogPostDetailView: React.FC = () => {
  const { blogPosts, selectedBlogSlug, openBlogPost, setCurrentView, showToast } = useUser();

  const post = blogPosts.find(p => p.slug === selectedBlogSlug) || blogPosts[0];

  const relatedPosts = blogPosts.filter(p => p.slug !== post.slug).slice(0, 2);

  const handleShare = (platform: string) => {
    showToast(`Article link copied for ${platform} sharing!`, 'success');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-in text-obsidian-900 font-sans">
      
      {/* Back button */}
      <button 
        onClick={() => setCurrentView('blog')}
        className="text-xs font-bold text-gold-700 hover:underline flex items-center gap-1 uppercase tracking-wider"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Journal
      </button>

      {/* Hero Banner Header */}
      <div className="space-y-4 max-w-4xl mx-auto text-center">
        <span className="px-3 py-1 bg-gold-500/10 text-gold-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-gold-500/20 inline-block">
          {post.category}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
          {post.title}
        </h1>

        <div className="flex items-center justify-center gap-6 text-xs text-obsidian-900/60 font-bold border-y border-cream-250 py-3">
          <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-gold-600" /> By {post.author}</span>
          <span>•</span>
          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gold-600" /> {post.date}</span>
          <span>•</span>
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gold-600" /> {post.readTime}</span>
        </div>
      </div>

      {/* Main Image */}
      <div className="h-80 sm:h-96 rounded-3xl overflow-hidden shadow-lg border border-cream-300">
        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
      </div>

      {/* Article Content & TOC Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start max-w-5xl mx-auto">
        
        {/* Table of Contents & Social Share Sidebar */}
        <div className="lg:col-span-1 space-y-6 sticky top-24">
          <div className="bg-cream-100/60 p-5 rounded-2xl border border-cream-300 space-y-3 text-xs">
            <span className="font-serif font-bold text-sm block border-b pb-2">Table of Contents</span>
            <ul className="space-y-2 text-obsidian-900/70 font-semibold">
              <li className="hover:text-gold-700 cursor-pointer">1. Historical Craft Provenance</li>
              <li className="hover:text-gold-700 cursor-pointer">2. Natural Vegetable Dye Extractions</li>
              <li className="hover:text-gold-700 cursor-pointer">3. Hand Lathe Turning Calibration</li>
              <li className="hover:text-gold-700 cursor-pointer">4. Preserving Heritage Traditions</li>
            </ul>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-cream-300 space-y-3 text-xs">
            <span className="font-bold uppercase tracking-wider text-[10px] text-obsidian-900/50 block">Share This Story</span>
            <div className="flex gap-2">
              <button onClick={() => handleShare('Facebook')} className="p-2.5 bg-cream-100 hover:bg-gold-500/20 rounded-xl text-obsidian-900">
                <Facebook className="w-4 h-4" />
              </button>
              <button onClick={() => handleShare('Twitter')} className="p-2.5 bg-cream-100 hover:bg-gold-500/20 rounded-xl text-obsidian-900">
                <Twitter className="w-4 h-4" />
              </button>
              <button onClick={() => handleShare('LinkedIn')} className="p-2.5 bg-cream-100 hover:bg-gold-500/20 rounded-xl text-obsidian-900">
                <Linkedin className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Body Text Content */}
        <div className="lg:col-span-3 space-y-6 text-sm text-obsidian-900/80 leading-relaxed font-sans">
          <p className="text-base font-serif italic text-obsidian-900 border-l-4 border-gold-500 pl-4 py-1">
            "{post.excerpt}"
          </p>

          <p>{post.content}</p>

          <h3 className="font-serif text-xl font-bold text-obsidian-900 pt-4">Historical Craft Provenance</h3>
          <p>
            For over two centuries, Indian master craftsmen have refined eco-friendly turned wood lathe techniques. Passed down through generation after generation in regional artisan guilds, every creation represents hours of careful manual craftsmanship.
          </p>

          <h3 className="font-serif text-xl font-bold text-obsidian-900 pt-4">Natural Vegetable Dye Extractions</h3>
          <p>
            Unlike mass-manufactured plastic alternatives, heritage toys and lacquerware utilize organic vegetable dyes. Turmeric yields vibrant golden yellows, indigo provides deep azure blues, and katha wood shavings produce warm mahogany browns.
          </p>
        </div>

      </div>

      {/* Related Posts */}
      <div className="border-t border-cream-250 pt-10 space-y-6">
        <h3 className="font-serif text-xl font-bold">Related Artisan Stories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {relatedPosts.map(rel => (
            <div 
              key={rel.slug}
              onClick={() => openBlogPost(rel.slug)}
              className="bg-white p-5 rounded-3xl border border-cream-300 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all group"
            >
              <img src={rel.image} alt="" className="w-24 h-24 object-cover rounded-2xl shrink-0" />
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-gold-700">{rel.category}</span>
                <h4 className="font-serif font-bold text-sm group-hover:text-gold-600 transition-colors line-clamp-2">{rel.title}</h4>
                <span className="text-[10px] text-obsidian-900/50 font-bold block">{rel.readTime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
export default BlogPostDetailView;

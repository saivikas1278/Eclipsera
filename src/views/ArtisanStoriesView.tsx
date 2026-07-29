import React from 'react';
import { useStore } from '../context/StoreContext';
import { Award, ShieldCheck, HeartHandshake, Sparkles, ArrowRight } from 'lucide-react';

export const ArtisanStoriesView: React.FC = () => {
  const { setCurrentView } = useStore();

  const guildStories = [
    {
      id: 'g-1',
      title: 'B. Ramappa & Channapatna Toy Guild',
      region: 'Channapatna, Karnataka • Wood Lathe & Vegetable Lacquer',
      badge: 'GI Certified Toy Craftsman',
      bio: 'B. Ramappa leads a 32-artisan woodturning collective using soft Wrightia Tinctoria ivory wood and natural turmeric lacquer dyes to craft eco-friendly, child-safe wooden toys.',
      image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1000&q=85'
    },
    {
      id: 'g-2',
      title: 'Rameshwar Ji & Moradabad Metal Guild',
      region: 'Moradabad, Uttar Pradesh • Lost-Wax Brass Chiselling',
      badge: 'National Metalware Awardee',
      bio: 'Preserving 18th-century royal metalware techniques, Rameshwar Ji chisels solid brass keychains and miniature peacock sculptures finished with rich vintage patinas.',
      image: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=1000&q=85'
    },
    {
      id: 'g-3',
      title: 'Devika Devi & Blue Terracotta Guild',
      region: 'Jaipur, Rajasthan • Studio Quartz Terracotta Pottery',
      badge: 'UNESCO Heritage Craft Guild',
      bio: 'Hand-throwing low-fire terracotta clay infused with quartz powder, Devika Devi crafts decorative vases and oil diffusers hand-painted with cobalt floral motifs.',
      image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1000&q=85'
    },
    {
      id: 'g-4',
      title: 'Master Abdul Khan & Saharanpur Guild',
      region: 'Saharanpur, Uttar Pradesh • Carved Teakwood Relief',
      badge: 'Master Craftsman Guild',
      bio: 'Specializing in intricate floral jaali fretwork and solid teakwood carving, Abdul Khan’s workshop creates heirloom incense boxes and carved bookmarks.',
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=85'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 sm:space-y-16 pb-28 md:pb-12">
      
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-gold-700 uppercase tracking-[0.25em]">Direct Artisan Provenance</span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-obsidian-900 leading-tight">
          Voices Behind the Lathe, Anvil & Pottery Wheel
        </h1>
        <p className="text-xs sm:text-sm text-obsidian-900/70 leading-relaxed font-sans max-w-2xl mx-auto">
          Every toy, keychain, studio pottery vessel, and woodcraft in `eclipsera_premium` is hand-carved or wheel-thrown by certified master artisans. Meet the creators preserving centuries of craft heritage.
        </p>
      </div>

      {/* Guild Spotlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
        {guildStories.map(guild => (
          <div key={guild.id} className="bg-white rounded-3xl overflow-hidden border border-cream-300 shadow-md flex flex-col justify-between">
            <div className="h-56 sm:h-64 overflow-hidden relative">
              <img 
                src={guild.image} 
                alt={guild.title}
                className="w-full h-full object-cover" 
              />
              <div className="absolute top-4 left-4 bg-obsidian-900/90 text-gold-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md border border-gold-500/30">
                <Award className="w-4 h-4 text-gold-400 shrink-0" />
                <span>{guild.badge}</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-3">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-obsidian-900">{guild.title}</h3>
              <p className="text-xs text-gold-700 font-bold uppercase">{guild.region}</p>
              <p className="text-xs text-obsidian-900/80 leading-relaxed">
                {guild.bio}
              </p>
              <button 
                onClick={() => setCurrentView('shop')}
                className="px-4 py-2.5 bg-obsidian-900 text-cream-100 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gold-600 hover:text-obsidian-900 flex items-center gap-2 transition-all"
              >
                <span>Explore Guild Artifacts</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

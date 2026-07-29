import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Search, MapPin, Star, Award, ChevronRight, CheckCircle2, HeartHandshake } from 'lucide-react';

export const ArtisansDirectoryView: React.FC = () => {
  const { openArtisanProfile, applyForArtisan } = useUser();
  const [search, setSearch] = useState('');
  const [selectedCraft, setSelectedCraft] = useState('ALL');
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Application form state
  const [appName, setAppName] = useState('');
  const [appEmail, setAppEmail] = useState('');
  const [appCraft, setAppCraft] = useState('Wooden Craft');
  const [appLocation, setAppLocation] = useState('');
  const [appPortfolio, setAppPortfolio] = useState('');
  const [appBio, setAppBio] = useState('');

  const artisans = [
    {
      name: 'Master Craftsman B. Ramappa',
      location: 'Channapatna, Karnataka',
      craft: 'Woodcraft',
      experience: '35 Years',
      rating: 4.9,
      productsCount: 12,
      image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
      bio: '3rd generation wood lathe turning master dedicated to non-toxic vegetable dye preservation.'
    },
    {
      name: 'Smt. Radha Devi',
      location: 'Madhubani, Bihar',
      craft: 'Paintings',
      experience: '28 Years',
      rating: 4.8,
      productsCount: 8,
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      bio: 'Pioneer of natural twig and ink freehand Madhubani wall canvases.'
    },
    {
      name: 'Somnath Pal',
      location: 'Kumartuli, West Bengal',
      craft: 'Pottery',
      experience: '22 Years',
      rating: 4.9,
      productsCount: 15,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      bio: 'Master studio potter preserving natural sun-baked clay molding techniques.'
    },
    {
      name: 'Gurumayum Anand',
      location: 'Imphal, Manipur',
      craft: 'Brass Metalware',
      experience: '18 Years',
      rating: 4.7,
      productsCount: 6,
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      bio: 'Artisan co-op lead restoring bell metal hand-hammered dinnerware.'
    }
  ];

  const filteredArtisans = artisans.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.location.toLowerCase().includes(search.toLowerCase());
    const matchesCraft = selectedCraft === 'ALL' || a.craft === selectedCraft;
    return matchesSearch && matchesCraft;
  });

  const handleAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName || !appEmail) return;
    applyForArtisan({
      name: appName,
      email: appEmail,
      craft: appCraft,
      location: appLocation,
      portfolio: appPortfolio,
      bio: appBio
    });
    setShowApplyModal(false);
    setAppName(''); setAppEmail(''); setAppLocation(''); setAppPortfolio(''); setAppBio('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fade-in text-obsidian-900">
      
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="px-3.5 py-1 bg-gold-500/10 text-gold-700 rounded-full text-xs font-bold uppercase tracking-widest inline-block border border-gold-500/20">
          Geographical Indication (GI) Verified Guilds
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
          Meet Our Master Craftsmen & Artisans
        </h1>
        <p className="text-xs sm:text-sm text-obsidian-900/70 leading-relaxed font-sans">
          Every item at eclipsera is directly hand-made by verified heritage artisans. We guarantee ethical wages, direct profit sharing, and full cultural provenance.
        </p>
      </div>

      {/* Search & Craft Filter Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gold-500/20 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          
          <div className="relative flex-1 w-full">
            <input 
              type="text" 
              placeholder="Search artisans by name or regional guild..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-cream-100 border border-cream-300 rounded-2xl pl-10 pr-4 py-3 text-xs font-semibold focus:outline-none focus:border-gold-500"
            />
            <Search className="w-4 h-4 text-obsidian-900/40 absolute left-3.5 top-3.5" />
          </div>

          {/* Craft category filter chips */}
          <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-bold">
            {['ALL', 'Woodcraft', 'Paintings', 'Pottery', 'Brass Metalware'].map(craft => (
              <button
                key={craft}
                onClick={() => setSelectedCraft(craft)}
                className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                  selectedCraft === craft ? 'bg-obsidian-900 text-cream-100 shadow-md' : 'bg-cream-100 border border-cream-300 hover:bg-cream-200'
                }`}
              >
                {craft}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Artisan Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredArtisans.map((art, idx) => (
          <div 
            key={idx}
            onClick={() => openArtisanProfile(art.name)}
            className="bg-white rounded-3xl border border-cream-300 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-4 p-5">
              <div className="relative h-48 rounded-2xl overflow-hidden bg-cream-100">
                <img src={art.image} alt={art.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-obsidian-900/80 backdrop-blur-md text-gold-400 rounded-full text-[10px] font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{art.rating}</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-700 bg-gold-500/10 px-2.5 py-0.5 rounded-full inline-block">
                  {art.craft}
                </span>
                <h3 className="font-serif font-bold text-base group-hover:text-gold-600 transition-colors">{art.name}</h3>
                
                <div className="flex items-center gap-1.5 text-xs text-obsidian-900/60 font-sans">
                  <MapPin className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                  <span>{art.location}</span>
                </div>

                <p className="text-xs text-obsidian-900/70 line-clamp-2 font-sans">{art.bio}</p>
              </div>
            </div>

            <div className="p-4 bg-cream-100/50 border-t border-cream-200 flex justify-between items-center text-xs font-bold">
              <span className="text-obsidian-900/60">{art.productsCount} Heritage SKUs</span>
              <span className="text-gold-700 group-hover:translate-x-1 transition-transform flex items-center">
                Explore Guild <ChevronRight className="w-3.5 h-3.5 inline" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Become an Artisan CTA Banner */}
      <div className="bg-obsidian-900 text-cream-100 rounded-3xl p-8 sm:p-12 border border-gold-500/30 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
        <div className="space-y-3 max-w-xl text-center md:text-left z-10">
          <div className="w-10 h-10 rounded-2xl bg-gold-500/20 text-gold-400 flex items-center justify-center mx-auto md:mx-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold">Are You a Traditional Heritage Artisan?</h2>
          <p className="text-xs sm:text-sm text-cream-100/70 leading-relaxed font-sans">
            Join the eclipsera Artisan Guild. We connect authentic master craftsmen directly to global patrons while maintaining 100% fair trade pricing and zero middleman margins.
          </p>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="px-6 py-3.5 bg-gold-500 text-obsidian-950 hover:bg-gold-400 font-bold uppercase tracking-widest text-xs rounded-2xl transition-all shadow-lg shrink-0 z-10 font-sans"
        >
          Apply for Guild Membership
        </button>
      </div>

      {/* Artisan Application Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-obsidian-900/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 border-2 border-gold-500/40 space-y-5 shadow-2xl relative text-obsidian-900 animate-scale-up">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif text-lg font-bold">Artisan Guild Application</h3>
              <button onClick={() => setShowApplyModal(false)} className="p-1 hover:bg-cream-100 rounded-full font-bold">✕</button>
            </div>

            <form onSubmit={handleAppSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block mb-1 font-bold uppercase text-[10px]">Full Name</label>
                <input 
                  type="text" required value={appName} onChange={(e) => setAppName(e.target.value)} 
                  placeholder="e.g. Master Craftsman B. Ramappa"
                  className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold uppercase text-[10px]">Email / Contact Phone</label>
                  <input 
                    type="text" required value={appEmail} onChange={(e) => setAppEmail(e.target.value)} 
                    placeholder="artisan@guild.org"
                    className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold uppercase text-[10px]">Craft Specialty</label>
                  <select 
                    value={appCraft} onChange={(e) => setAppCraft(e.target.value)}
                    className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3 py-2.5 focus:outline-none font-bold"
                  >
                    <option value="Wooden Craft">Wooden Craft</option>
                    <option value="Studio Pottery">Studio Pottery</option>
                    <option value="Brass Metalware">Brass Metalware</option>
                    <option value="Handloom Textiles">Handloom Textiles</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold uppercase text-[10px]">Regional Guild Location</label>
                <input 
                  type="text" value={appLocation} onChange={(e) => setAppLocation(e.target.value)} 
                  placeholder="e.g. Channapatna, Karnataka"
                  className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold uppercase text-[10px]">Portfolio Link / Image URL</label>
                <input 
                  type="url" value={appPortfolio} onChange={(e) => setAppPortfolio(e.target.value)} 
                  placeholder="https://..."
                  className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold uppercase text-[10px]">Craft Heritage Bio</label>
                <textarea 
                  rows={3} value={appBio} onChange={(e) => setAppBio(e.target.value)} 
                  placeholder="Briefly describe your craft background..."
                  className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-gold-500 font-sans"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-obsidian-900 text-cream-100 hover:bg-gold-500 hover:text-obsidian-950 font-bold uppercase tracking-widest rounded-xl transition-all shadow-md"
              >
                Submit Application to Guild Council
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default ArtisansDirectoryView;

import React from 'react';
import { useUser } from '../context/UserContext';
import { ShieldCheck, Award, Sparkles, HeartHandshake, Leaf, Users, CheckCircle2 } from 'lucide-react';

export const AboutView: React.FC = () => {
  const { setCurrentView } = useUser();

  const values = [
    { title: '100% Handcrafted', desc: 'Zero machine replicas or plastic turning. Lathes, chisels, and freehand brushes only.', icon: Sparkles },
    { title: 'Ethical Guild Wages', desc: 'Direct revenue transfers to master artisan cooperatives with zero middleman markups.', icon: HeartHandshake },
    { title: 'Sustainable & Eco', desc: 'Organic vegetable dyes, sustainably harvested Wrightia wood, and zero-plastic packaging.', icon: Leaf },
    { title: 'Community Preservation', desc: 'Supporting 200+ heritage artisan families across Karnataka, Bihar, and Bengal.', icon: Users }
  ];

  const team = [
    { name: 'Dr. Vikramaditya Sen', role: 'Founder & Guild Steward', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
    { name: 'Master Craftsman B. Ramappa', role: 'Head of Artisan Operations', image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80' },
    { name: 'Meera Deshmukh', role: 'Lead Design Curator', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-16 animate-fade-in text-obsidian-900 font-sans">
      
      {/* Brand Mission */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-gold-700 bg-gold-500/10 px-3.5 py-1 rounded-full border border-gold-500/20 uppercase tracking-[0.2em] inline-block">
          LUXURY HERITAGE GUARANTEE
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">
          Preserving Sacred Craft Heritage
        </h1>
        <p className="text-xs sm:text-sm text-obsidian-900/70 leading-relaxed font-sans">
          eclipsera exists to preserve ancient Indian handcrafted art forms—from 200-year-old Channapatna lacquerware to Madhubani natural ink murals—connecting traditional master craftsmen directly to global patrons.
        </p>
      </div>

      {/* Our Story */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-cream-300 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <span className="text-[10px] font-bold uppercase text-gold-700 tracking-wider">Our Story</span>
          <h2 className="font-serif text-2xl font-bold">From Regional Guild Lathes to Global Living Spaces</h2>
          <p className="text-xs text-obsidian-900/70 leading-relaxed">
            Founded in Bengaluru, eclipsera began with a simple mission: protect endangered craft traditions against industrial plastic manufacturing.
          </p>
          <p className="text-xs text-obsidian-900/70 leading-relaxed">
            By auditing regional craft centers, securing Geographical Indication (GI) heritage badges, and building direct digital storefronts, we ensure ancient techniques thrive for future generations.
          </p>
        </div>

        <div className="h-64 sm:h-80 rounded-2xl overflow-hidden bg-cream-100 border border-cream-300 shadow">
          <img 
            src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80" 
            alt="Artisan Lathe Workshop" 
            className="w-full h-full object-cover" 
          />
        </div>
      </div>

      {/* Our Values Section */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[10px] font-bold uppercase text-gold-700 tracking-widest">Pillars of eclipsera</span>
          <h2 className="font-serif text-2xl font-bold">Our Four Core Values</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {values.map((v, idx) => {
            const Icon = v.icon;
            return (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-cream-300 shadow-sm space-y-3 text-center">
                <div className="w-10 h-10 rounded-2xl bg-gold-500/10 text-gold-700 flex items-center justify-center mx-auto">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-sm">{v.title}</h3>
                <p className="text-xs text-obsidian-900/70 leading-relaxed font-sans">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Meet the Team Section */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[10px] font-bold uppercase text-gold-700 tracking-widest">Leadership & Guardians</span>
          <h2 className="font-serif text-2xl font-bold">Meet the Guild Leadership</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {team.map((t, idx) => (
            <div key={idx} className="bg-white p-5 rounded-3xl border border-cream-300 text-center space-y-3 shadow-sm">
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto bg-cream-100 border-2 border-gold-500/30">
                <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base">{t.name}</h3>
                <p className="text-xs text-gold-700 font-bold uppercase tracking-wider text-[10px] mt-0.5">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
export default AboutView;

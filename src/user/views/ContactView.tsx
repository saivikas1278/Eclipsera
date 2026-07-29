import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Mail, Phone, Clock, MapPin, Send, CheckCircle2 } from 'lucide-react';

export const ContactView: React.FC = () => {
  const { showToast } = useUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Order Enquiry');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
    showToast('Your message has been sent to customer concierge!', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fade-in text-obsidian-900 font-sans">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="px-3.5 py-1 bg-gold-500/10 text-gold-700 rounded-full text-xs font-bold uppercase tracking-widest inline-block border border-gold-500/20">
          We Are Here to Assist
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
          Contact Customer Care Concierge
        </h1>
        <p className="text-xs sm:text-sm text-obsidian-900/70 leading-relaxed">
          Questions regarding your heritage order, artisan custom commissions, or bulk gifting? Reach out to our Bengaluru concierge team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        
        {/* Contact Details & Business Hours */}
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-sm space-y-6">
            <h3 className="font-serif text-xl font-bold border-b pb-3">Get in Touch Directly</h3>
            
            <div className="space-y-4 text-xs font-semibold">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-gold-500/10 text-gold-700 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-obsidian-900/50 block">Concierge Email</span>
                  <span className="text-sm font-bold text-obsidian-900 font-mono">guild@eclipsera.com</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-gold-500/10 text-gold-700 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-obsidian-900/50 block">Helpline Toll Free</span>
                  <span className="text-sm font-bold text-obsidian-900 font-mono">+91 (800) 425-9000</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-gold-500/10 text-gold-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-obsidian-900/50 block">Operating Hours</span>
                  <span>Monday - Saturday: 09:30 AM - 07:00 PM IST</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-gold-500/10 text-gold-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-obsidian-900/50 block">Guild Secretariat Address</span>
                  <span>42 Heritage Lane, Indiranagar, Bengaluru, Karnataka - 560038</span>
                </div>
              </div>
            </div>
          </div>

          {/* Map Embed Container Placeholder */}
          <div className="h-56 bg-cream-200 rounded-3xl border border-cream-300 overflow-hidden relative flex items-center justify-center text-xs font-bold text-obsidian-900/50">
            <div className="text-center space-y-1">
              <MapPin className="w-6 h-6 text-gold-600 mx-auto" />
              <span>Interactive Google Map Container</span>
              <span className="text-[10px] block font-mono">Indiranagar, Bengaluru Flagship Experience Center</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-sm space-y-6">
          <h3 className="font-serif text-xl font-bold border-b pb-3">Send Us a Direct Message</h3>

          {submitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl space-y-2 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="font-serif font-bold text-base">Message Sent Successfully!</h4>
              <p className="text-xs">Our team will respond to {email} within 24 business hours.</p>
              <button onClick={() => setSubmitted(false)} className="mt-2 text-xs font-bold underline">Send another message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block mb-1 font-bold uppercase text-[10px]">Your Full Name</label>
                <input 
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ananya Sharma"
                  className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold uppercase text-[10px]">Email Address</label>
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="ananya@example.com"
                  className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold uppercase text-[10px]">Subject Inquiry Category</label>
                <select 
                  value={subject} onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3 py-2.5 focus:outline-none font-bold"
                >
                  <option value="Order Enquiry">Order Status & Tracking</option>
                  <option value="Custom Artisan Order">Custom Artisan Commission</option>
                  <option value="Bulk Corporate Gifting">Bulk Corporate Gifting</option>
                  <option value="Return & Refund">Return or Refund Request</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-bold uppercase text-[10px]">Message Details</label>
                <textarea 
                  rows={4} required value={message} onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can our concierge help you?"
                  className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-gold-500 font-sans"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3.5 bg-obsidian-900 text-cream-100 hover:bg-gold-500 hover:text-obsidian-950 font-bold uppercase tracking-widest text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry Message</span>
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
};
export default ContactView;

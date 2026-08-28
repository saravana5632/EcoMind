import React from 'react';
import { Sprout, ShieldCheck, HeartHandshake, Leaf, ArrowRight, ArrowDown } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-12 pb-8 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Farm-to-Door Transparency Callout */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 mb-12 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-emerald-500/20">
                <Leaf className="w-3.5 h-3.5" /> Zero Middlemen Ecosystem
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Empowering Farmers. Delivering Pure Freshness.
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                By bypassing multi-layered wholesale markets, <strong>EcoMind Fresh</strong> guarantees farmers earn up to 40% higher income while consumers enjoy produce harvested just hours earlier at fair prices.
              </p>
            </div>

            {/* Model Comparison */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Traditional Chain</span>
                  <div className="text-slate-400 space-y-1 text-[11px] font-mono">
                    <p>👨‍🌾 Farmer</p>
                    <p className="text-slate-500 pl-3">↓ Wholesaler (35% cut)</p>
                    <p className="text-slate-500 pl-3">↓ Mandi / Market</p>
                    <p className="text-slate-300">🛒 Customer (Old produce)</p>
                  </div>
                </div>

                <div className="space-y-1.5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase">EcoMind Fresh</span>
                  <div className="text-emerald-300 space-y-1 text-[11px] font-mono">
                    <p className="font-semibold text-emerald-200">👨‍🌾 Farmer (App 1)</p>
                    <p className="text-emerald-400 pl-3">↓ EcoMind Logistics</p>
                    <p className="font-semibold text-emerald-200">🛒 Customer (App 2)</p>
                    <span className="inline-block text-[10px] text-emerald-400 font-sans font-medium">✨ Harvest to Door in 4 hrs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links & Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800/80 text-xs">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                <Sprout className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-white">EcoMind Fresh</span>
            </div>
            <p className="text-slate-400 leading-relaxed mb-3">
              Part of the unified EcoMind Agri & Fresh dual-application ecosystem.
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              App 2: Customer & Delivery Partner Portal
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 mb-3 uppercase tracking-wider text-[11px]">Fresh Categories</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="/customer/products?category=Fruits" className="hover:text-emerald-400 transition-colors">Fresh Orchard Fruits</a></li>
              <li><a href="/customer/products?category=Vegetables" className="hover:text-emerald-400 transition-colors">Organic Vegetables</a></li>
              <li><a href="/customer/products?category=Leafy%20Vegetables" className="hover:text-emerald-400 transition-colors">Terrace Leafy Greens</a></li>
              <li><a href="/customer/products?category=Grains" className="hover:text-emerald-400 transition-colors">Single-Origin Farm Grains</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 mb-3 uppercase tracking-wider text-[11px]">EcoMind Ecosystem</h4>
            <ul className="space-y-2 text-slate-400">
              <li><span className="text-slate-500">App 1:</span> EcoMind Agri (Farmer / Admin / Landlord)</li>
              <li><span className="text-emerald-400 font-medium">App 2:</span> EcoMind Fresh (Customer / Delivery Partner)</li>
              <li>Shared Real-Time Cloud Firestore</li>
              <li>Live Delivery Partner Routing</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 mb-3 uppercase tracking-wider text-[11px]">Our Guarantees</h4>
            <div className="space-y-2 text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Direct Farm Traceability</span>
              </div>
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Fair Remuneration to Farmers</span>
              </div>
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero Cold-Storage Preservatives</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <p>© 2026 EcoMind Fresh. Built for sustainable agriculture & direct consumer access.</p>
          <p className="flex items-center gap-2 font-mono">
            <span>Unified Firebase Database</span>
            <span>•</span>
            <span className="text-emerald-400">Live Active</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Truck, Sparkles, RefreshCw, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { forceSeedProducts } from '../../services/productService';
import { useNavigate } from 'react-router-dom';

export const DemoAccountSwitcher: React.FC = () => {
  const { userProfile, loginAsDemo, logout, demoRoleApprovedToggle } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleSwitchRole = async (targetRole: 'customer' | 'delivery_partner') => {
    setSwitching(true);
    await loginAsDemo(targetRole);
    setSwitching(false);
    if (targetRole === 'customer') {
      navigate('/customer/home');
    } else {
      navigate('/delivery/dashboard');
    }
  };

  const handleSeedData = async () => {
    setSeeding(true);
    await forceSeedProducts();
    setSeeding(false);
    setSeedSuccess(true);
    setTimeout(() => setSeedSuccess(false), 3000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isExpanded ? (
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/90 p-4 w-80 sm:w-96 text-slate-800 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                EcoMind Switcher & Seeder
              </h4>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 hover:text-slate-600 text-xs px-2 py-0.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Minimize ✕
            </button>
          </div>

          <div className="my-3 space-y-2">
            <div className="text-xs text-slate-500">
              Current Role:{' '}
              <span className="font-semibold text-emerald-700 uppercase">
                {userProfile ? userProfile.role.replace('_', ' ') : 'Guest (Logged out)'}
              </span>
              {userProfile?.role === 'delivery_partner' && (
                <span className={`ml-2 px-1.5 py-0.5 text-[10px] rounded-full font-medium ${
                  userProfile.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {userProfile.status}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={switching}
                onClick={() => handleSwitchRole('customer')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  userProfile?.role === 'customer'
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                    : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 border-slate-200'
                }`}
              >
                <User className="w-4 h-4" />
                Customer
              </button>

              <button
                disabled={switching}
                onClick={() => handleSwitchRole('delivery_partner')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  userProfile?.role === 'delivery_partner'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Truck className="w-4 h-4" />
                Delivery Partner
              </button>
            </div>

            {userProfile?.role === 'delivery_partner' && (
              <button
                onClick={demoRoleApprovedToggle}
                className="w-full text-[11px] flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors shadow-2xs"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Toggle Admin Status: Currently {userProfile.status || 'pending'} (Click to switch)
              </button>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                disabled={seeding}
                onClick={handleSeedData}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition-colors shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
                {seedSuccess ? 'Catalog Refreshed!' : 'Seed Farm Catalog'}
              </button>

              {userProfile && (
                <button
                  onClick={logout}
                  className="py-2 px-3 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors"
                >
                  Logout
                </button>
              )}
            </div>
          </div>

          <p className="text-[10px] text-slate-400 text-center">
            Shared Firestore Database with Application 1 (EcoMind Agri)
          </p>
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-900 text-white px-3.5 py-2 rounded-full shadow-lg backdrop-blur-md border border-slate-700 text-xs font-semibold transition-all hover:scale-105"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Role Switcher & Tools</span>
          <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded-full uppercase">
            {userProfile ? userProfile.role.replace('_', ' ') : 'Demo'}
          </span>
        </button>
      )}
    </div>
  );
};

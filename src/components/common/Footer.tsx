import React from 'react';
import { Sprout, ShieldCheck, MapPin, Phone, Mail, Heart } from 'lucide-react';
import { UserRole } from '../../types';

interface FooterProps {
  onOpenAuth: (role?: UserRole, isRegister?: boolean) => void;
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAuth, onNavigate }) => {
  return (
    <footer className="bg-[#081c15] text-stone-300 border-t border-[#1b4332] pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#1b4332]">
          {/* Col 1: Brand & Proximity Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#1b4332] text-white flex items-center justify-center border border-[#95d5b2]/30 shadow-sm">
                <Sprout className="w-5 h-5 text-[#95d5b2]" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">LandLink</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              The premier full-stack agricultural land rental network. Connecting landowners with verified local farmers through rigorous 20 KM proximity intelligence.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#95d5b2] font-semibold bg-[#1b4332]/60 p-2 rounded-xl border border-[#2d6a4f]">
              <ShieldCheck className="w-4 h-4 shrink-0 text-[#95d5b2]" />
              <span>Haversine 20 KM Geofence Enforced</span>
            </div>
          </div>

          {/* Col 2: For Farmers */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">For Farmers</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button onClick={() => onOpenAuth('FARMER', true)} className="hover:text-[#95d5b2] transition-colors">
                  Become a Registered Farmer
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('explore')} className="hover:text-[#95d5b2] transition-colors">
                  Find Farmland Within 20 KM
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how-it-works')} className="hover:text-[#95d5b2] transition-colors">
                  How 20 KM Radius Works
                </button>
              </li>
              <li>
                <button onClick={() => onOpenAuth('FARMER', false)} className="hover:text-[#95d5b2] transition-colors">
                  Farmer Portal Login
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: For Landlords */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">For Landlords</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button onClick={() => onOpenAuth('LANDLORD', true)} className="hover:text-[#95d5b2] transition-colors">
                  Register as Agricultural Landowner
                </button>
              </li>
              <li>
                <button onClick={() => onOpenAuth('LANDLORD', false)} className="hover:text-[#95d5b2] transition-colors">
                  List Farmland for Lease
                </button>
              </li>
              <li>
                <button onClick={() => onOpenAuth('LANDLORD', false)} className="hover:text-[#95d5b2] transition-colors">
                  Review Farmer Rental Requests
                </button>
              </li>
              <li>
                <button onClick={() => onOpenAuth('LANDLORD', false)} className="hover:text-[#95d5b2] transition-colors">
                  Landlord Dashboard Login
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Support */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">System Administration</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button onClick={() => onOpenAuth('ADMIN', false)} className="hover:text-[#95d5b2] transition-colors">
                  🛡️ Admin Security Access
                </button>
              </li>
              <li className="flex items-center gap-2 pt-1">
                <MapPin className="w-3.5 h-3.5 text-stone-500" />
                <span>Agri-Tech Zone, Chennai & Rural Belts</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-stone-500" />
                <span>support@landlink.agri</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-stone-500" />
                <span>1800-419-LAND (Toll Free)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-3">
          <p>© {new Date().getFullYear()} LandLink Agricultural Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-stone-400">
              Built with <Heart className="w-3.5 h-3.5 text-[#95d5b2] fill-[#95d5b2]" /> for Sustainable Farming
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

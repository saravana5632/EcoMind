import React, { useState, useEffect } from 'react';
import {
  Sprout,
  MapPin,
  ShieldCheck,
  Compass,
  ArrowRight,
  TrendingUp,
  Award,
  CheckCircle,
  FileText,
  Clock,
  Sparkles,
  Users,
  Tractor,
  Layers,
} from 'lucide-react';
import { UserRole, LandItem } from '../../types';
import { MapViewer } from '../common/MapViewer';
import { api } from '../../services/api';

interface LandingPageProps {
  onOpenAuth: (role?: UserRole, isRegister?: boolean) => void;
  onOpenLocationModal: () => void;
  onExploreLands: () => void;
  onSelectLand: (land: LandItem) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onOpenLocationModal,
  onExploreLands,
  onSelectLand,
}) => {
  const [featuredLands, setFeaturedLands] = useState<LandItem[]>([]);
  const [stats, setStats] = useState({
    totalAcres: '450+',
    activeFarmers: '1,200+',
    leasedLands: '85+',
    radiusEnforced: '20 KM',
  });

  useEffect(() => {
    // Fetch initial sample lands from default hub
    api.getNearbyLands({ lat: 13.0827, lng: 80.2707, maxDistanceKm: 25 })
      .then((res) => {
        if (res.success && res.data) {
          const list = res.data.lands || (Array.isArray(res.data) ? res.data : []);
          setFeaturedLands(Array.isArray(list) ? list : []);
        }
      })
      .catch((err) => {
        console.warn('Featured lands err:', err);
        setFeaturedLands([]);
      });
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#081c15] via-[#1b4332] to-[#122b20] text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 rounded-b-3xl shadow-xl border-b border-[#2d6a4f]/40">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#95d5b2]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#95d5b2]/15 border border-[#95d5b2]/30 text-[#95d5b2] text-xs font-semibold backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-[#95d5b2] animate-ping"></span>
                <span>The 20 KM Smart Agricultural Rental Guarantee</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-none text-white">
                Rent Farmland <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#95d5b2] via-[#b7e4c7] to-amber-200">
                  Within 20 KM
                </span>{' '}
                of Your Location.
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-stone-200 leading-relaxed max-w-2xl font-light">
                LandLink connects verified agricultural landowners with local farmers. Our proprietary Haversine geolocation engine strictly restricts discovery and rental reservations to within a <strong className="text-white font-semibold">20 KM radius</strong>—ensuring daily commuting viability, microclimate crop compatibility, and seamless landlord-farmer trust.
              </p>

              {/* Call to Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  id="btn-hero-explore"
                  onClick={onExploreLands}
                  className="px-6 py-3.5 bg-[#95d5b2] hover:bg-[#74c69d] text-[#081c15] font-black text-sm rounded-2xl transition-all shadow-lg hover:shadow-[#95d5b2]/30 flex items-center gap-2 cursor-pointer"
                >
                  <Sprout className="w-5 h-5 text-[#081c15]" />
                  Explore Lands Within 20 KM
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="btn-hero-landlord"
                  onClick={() => onOpenAuth('LANDLORD', true)}
                  className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-2xl border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Tractor className="w-4 h-4 text-amber-300" />
                  List Farmland (Landlord)
                </button>
              </div>

              {/* Feature Pills */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs text-stone-200">
                  <ShieldCheck className="w-4 h-4 text-[#95d5b2] shrink-0" />
                  <span>100% Verified Land Titles</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-200">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Strict 20 KM Geofence</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-200">
                  <FileText className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>Direct Rental Workflow</span>
                </div>
              </div>
            </div>

            {/* Hero Right: Live Interactive Map Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-[#0e271c]/90 rounded-3xl p-3 border border-[#2d6a4f]/50 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between px-3 py-2 border-b border-[#2d6a4f]/40 mb-2 text-xs">
                  <div className="flex items-center gap-2 text-stone-200 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#95d5b2]"></span>
                    <span>Live 20 KM Radar Preview</span>
                  </div>
                  <button
                    onClick={onOpenLocationModal}
                    className="text-[11px] font-bold text-[#95d5b2] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Compass className="w-3 h-3" /> Change Center
                  </button>
                </div>

                <MapViewer
                  center={{ latitude: 13.0827, longitude: 80.2707, district: 'Thiruvallur' }}
                  radiusKm={20}
                  showRadiusCircle={true}
                  lands={featuredLands}
                  onSelectLand={onSelectLand}
                  height="340px"
                  userType="FARMER"
                />

                <div className="mt-3 px-2 flex items-center justify-between text-[11px] text-stone-300">
                  <span>📍 Active Hub: Thiruvallur / Chennai</span>
                  <span className="text-[#95d5b2] font-semibold">{featuredLands.length} Lands within 20 KM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE 20 KM PROXIMITY DIFFERENTIATOR (Core USP) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#f0f9f4] rounded-3xl p-8 sm:p-12 border border-[#d8f3dc] shadow-sm">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-10">
            <span className="px-3 py-1 bg-[#d8f3dc] text-[#1b4332] rounded-full text-xs font-extrabold uppercase tracking-wider border border-[#95d5b2]/40">
              Why Proximity Matters
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1b4332] tracking-tight">
              The 20 KM Agricultural Geofence Standard
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              Unlike generic property websites that list distant land hundreds of kilometers away, LandLink is designed exclusively for practical farming operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-[#e2e8dc] shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#e8f5ee] text-[#1b4332] flex items-center justify-center font-bold text-xl border border-[#95d5b2]/30">
                🚜
              </div>
              <h3 className="font-bold text-stone-900 text-base">Daily Farm Commute & Logistics</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Farmers cannot travel 60+ km daily to irrigate, monitor pest outbreaks, or operate tractors. 20 KM keeps the commute under 30 minutes.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#e2e8dc] shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#e8f5ee] text-[#1b4332] flex items-center justify-center font-bold text-xl border border-[#95d5b2]/30">
                🌱
              </div>
              <h3 className="font-bold text-stone-900 text-base">Soil & Climate Familiarity</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Within a 20 KM radius, soil compositions, groundwater levels, and rainfall patterns match the farmer's established regional expertise.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#e2e8dc] shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#e8f5ee] text-[#1b4332] flex items-center justify-center font-bold text-xl border border-[#95d5b2]/30">
                🤝
              </div>
              <h3 className="font-bold text-stone-900 text-base">Rapid Verification & Trust</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Local community credibility reduces rental defaults, allows easy physical plot inspections, and promotes long-term leasing relationships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED NEARBY LANDS CAROUSEL / GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#2d6a4f] uppercase tracking-wider">Available For Immediate Lease</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">Featured Agricultural Lands</h2>
          </div>
          <button
            onClick={onExploreLands}
            className="text-xs font-bold text-[#1b4332] hover:text-[#2d6a4f] flex items-center gap-1.5 cursor-pointer"
          >
            <span>View All Nearby Lands</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(featuredLands || []).slice(0, 3).map((land) => (
            <div
              key={land.id}
              className="bg-white rounded-2xl overflow-hidden border border-[#e2e8dc] shadow-sm hover:shadow-md transition-all flex flex-col group"
            >
              <div className="h-48 relative overflow-hidden bg-stone-100">
                <img
                  src={land.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600'}
                  alt={land.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-bold uppercase rounded-lg bg-[#1b4332] text-white shadow-md">
                  {land.status}
                </span>
                <span className="absolute bottom-3 right-3 px-2.5 py-1 text-xs font-bold rounded-lg bg-stone-900/80 text-[#95d5b2] backdrop-blur-sm">
                  📍 {land.distanceKm ? `${land.distanceKm} KM away` : 'Within 20 KM'}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-stone-500 font-mono">
                    <span>{land.landCode}</span>
                    <span className="font-semibold text-stone-700">
                      {land.totalArea} {land.areaUnit}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-stone-900 mt-1 line-clamp-1">{land.name}</h3>
                  <p className="text-xs text-stone-600 mt-1 line-clamp-2">{land.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 bg-[#f8f9f5] p-2.5 rounded-xl border border-[#e2e8dc]">
                  <div>🌱 Soil: <span className="font-semibold text-stone-800">{land.soilType || 'Loamy'}</span></div>
                  <div>💧 Water: <span className="font-semibold text-stone-800">{land.waterAvailability ? land.waterAvailability.split(' ')[0] : 'Available'}</span></div>
                  <div>⚡ Power: <span className="font-semibold text-stone-800">{land.electricityAvailability ? land.electricityAvailability.split(' ')[0] : 'Available'}</span></div>
                  <div>🌾 Crops: <span className="font-semibold text-stone-800">{(land.suitableCrops || []).slice(0, 2).join(', ') || 'Multicrop'}</span></div>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-stone-400">Annual Rent</span>
                    <p className="text-lg font-black text-[#1b4332]">
                      ₹{land.rentAmount?.toLocaleString() || '0'}
                      <span className="text-xs font-normal text-stone-500">/{land.rentPeriod || 'Year'}</span>
                    </p>
                  </div>
                  <button
                    id={`btn-view-land-${land.id}`}
                    onClick={() => onSelectLand(land)}
                    className="px-4 py-2 bg-[#1b4332] hover:bg-[#143627] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. DUAL WORKFLOW EXPLANATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#2d6a4f] uppercase tracking-wider">Simple Transparent Process</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">How LandLink Works</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Farmer Workflow */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e8dc] shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#e8f5ee] text-[#1b4332] flex items-center justify-center font-bold border border-[#95d5b2]/30">
                👨🌾
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-stone-900">For Farmers (Renters)</h3>
                <p className="text-xs text-stone-500">Discover and lease farmland in 4 transparent steps</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[#1b4332] text-white flex items-center justify-center font-bold shrink-0">1</span>
                <div>
                  <h4 className="font-bold text-stone-800">Set GPS Coordinates</h4>
                  <p className="text-stone-500">System activates your unique 20 KM agricultural discovery radius.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[#1b4332] text-white flex items-center justify-center font-bold shrink-0">2</span>
                <div>
                  <h4 className="font-bold text-stone-800">Filter Soils & Water Sources</h4>
                  <p className="text-stone-500">Compare pH levels, borewells, canal water, and power infrastructure.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[#1b4332] text-white flex items-center justify-center font-bold shrink-0">3</span>
                <div>
                  <h4 className="font-bold text-stone-800">Submit Rental Proposal</h4>
                  <p className="text-stone-500">Propose rental duration, target crop, and lease rent to the landowner.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[#1b4332] text-white flex items-center justify-center font-bold shrink-0">4</span>
                <div>
                  <h4 className="font-bold text-stone-800">Landlord Approves &rarr; Reserved</h4>
                  <p className="text-stone-500">Land enters RESERVED status, preventing double bookings.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenAuth('FARMER', true)}
              className="w-full py-2.5 bg-[#f0f9f4] hover:bg-[#e2f4eb] text-[#1b4332] font-bold rounded-xl border border-[#95d5b2]/60 transition-colors cursor-pointer text-xs"
            >
              Sign Up as Farmer
            </button>
          </div>

          {/* Landlord Workflow */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e8dc] shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold border border-amber-200">
                🏠
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-stone-900">For Landowners (Lessors)</h3>
                <p className="text-xs text-stone-500">Monetize idle farmland with verified local farmers</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold shrink-0">1</span>
                <div>
                  <h4 className="font-bold text-stone-800">Register & Pin Land Coordinates</h4>
                  <p className="text-stone-500">Drop pin on interactive map, specify acreage, soil report & photos.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold shrink-0">2</span>
                <div>
                  <h4 className="font-bold text-stone-800">Instant Visibility to Nearby Farmers</h4>
                  <p className="text-stone-500">Your land is automatically surfaced to farmers within 20 KM.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold shrink-0">3</span>
                <div>
                  <h4 className="font-bold text-stone-800">Review Farmer Proposals</h4>
                  <p className="text-stone-500">Examine farmer profiles, planned crops, and rental terms with 1-click approval.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold shrink-0">4</span>
                <div>
                  <h4 className="font-bold text-stone-800">Start Lease & Collect Rent</h4>
                  <p className="text-stone-500">Transition plot to RENTED status with full digital audit trail.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenAuth('LANDLORD', true)}
              className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-xl border border-amber-200 transition-colors cursor-pointer text-xs"
            >
              Sign Up as Landlord
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LandItem,
  RentalRequest,
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { MapViewer } from '../common/MapViewer';
import { LandDetailModal } from './LandDetailModal';
import {
  MapPin,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  Map as MapIcon,
  Columns,
  Compass,
  Sprout,
  Filter,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Phone,
  Layers,
  Sparkles,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';

interface FarmerDashboardProps {
  initialTab?: 'explore' | 'my-requests' | 'reserved';
  onOpenLocationModal: () => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  initialTab = 'explore',
  onOpenLocationModal,
}) => {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'explore' | 'my-requests' | 'reserved'>(initialTab);
  const [viewLayout, setViewLayout] = useState<'split' | 'grid' | 'map'>('split');
  const [selectedLand, setSelectedLand] = useState<LandItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Discovery / Filter states
  const [lands, setLands] = useState<LandItem[]>([]);
  const [isLoadingLands, setIsLoadingLands] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [soilFilter, setSoilFilter] = useState('');
  const [waterFilter, setWaterFilter] = useState('');
  const [electricityFilter, setElectricityFilter] = useState('');
  const [maxRent, setMaxRent] = useState<number | ''>('');
  const [minArea, setMinArea] = useState<number | ''>('');
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(20); // STRICT 20 KM default ceiling
  const [sortBy, setSortBy] = useState<'distance' | 'rent_asc' | 'rent_desc' | 'area_desc'>('distance');

  // Requests state
  const [myRequests, setMyRequests] = useState<RentalRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  // Farmer Coordinates
  const farmerLat = user?.location?.latitude ?? 13.0827;
  const farmerLng = user?.location?.longitude ?? 80.2707;

  // Load Nearby Lands
  const fetchNearbyLands = useCallback(async () => {
    setIsLoadingLands(true);
    try {
      const res = await api.getNearbyLands({
        lat: farmerLat,
        lng: farmerLng,
        maxDistanceKm: maxRadiusKm,
        soilType: soilFilter,
        waterAvailability: waterFilter,
        electricityAvailability: electricityFilter,
        maxRent: maxRent !== '' ? Number(maxRent) : undefined,
        minArea: minArea !== '' ? Number(minArea) : undefined,
        search: searchQuery,
        sortBy,
      });

      if (res.success && res.data) {
        const list = res.data.lands || (Array.isArray(res.data) ? res.data : []);
        setLands(Array.isArray(list) ? list : []);
      }
    } catch (err: any) {
      console.warn('Error fetching nearby lands:', err);
      setLands([]);
    } finally {
      setIsLoadingLands(false);
    }
  }, [farmerLat, farmerLng, maxRadiusKm, soilFilter, waterFilter, electricityFilter, maxRent, minArea, searchQuery, sortBy]);

  // Load Farmer Rental Requests
  const fetchMyRequests = useCallback(async () => {
    setIsLoadingRequests(true);
    try {
      const res = await api.getMyRequests();
      if (res.success && res.data) {
        setMyRequests(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err: any) {
      console.warn('Error fetching requests:', err);
      setMyRequests([]);
    } finally {
      setIsLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    fetchNearbyLands();
  }, [fetchNearbyLands]);

  useEffect(() => {
    if (activeTab === 'my-requests' || activeTab === 'reserved') {
      fetchMyRequests();
    }
  }, [activeTab, fetchMyRequests]);

  const handleLandClick = (land: LandItem) => {
    setSelectedLand(land);
    setIsDetailModalOpen(true);
  };

  // Filtered reserved lands for 'reserved' tab
  const reservedOrActiveRequests = useMemo(() => {
    return myRequests.filter((r) => r.status === 'APPROVED' || r.status === 'ACTIVE');
  }, [myRequests]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. TOP HEADER & PROXIMITY PILL */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e2e8dc] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded-lg bg-[#e8f5ee] text-[#1b4332] border border-[#95d5b2]/40">
              Farmer Portal
            </span>
            <span className="text-xs text-stone-500 font-medium">Verified Renter Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
            Hello, {user?.name || 'Farmer'} 🌾
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Discover agricultural farmland strictly within your verified 20 KM radius.
          </p>
        </div>

        {/* 20 KM Geofence Radar Status Box */}
        <div className="bg-[#f0f9f4] p-3 sm:p-4 rounded-2xl border border-[#95d5b2]/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1b4332] text-white flex items-center justify-center font-bold shadow-xs">
              📍
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#1b4332]">20 KM Radar Active</span>
                <span className="inline-block w-2 h-2 rounded-full bg-[#2d6a4f] animate-ping"></span>
              </div>
              <p className="text-[11px] text-stone-600">
                Center: <strong>{user?.location?.district || 'Thiruvallur'}</strong> ({farmerLat.toFixed(4)}, {farmerLng.toFixed(4)})
              </p>
            </div>
          </div>

          <button
            id="btn-change-farmer-center"
            onClick={onOpenLocationModal}
            className="px-3 py-1.5 bg-white hover:bg-[#e8f5ee] text-[#1b4332] font-bold text-xs rounded-xl border border-[#95d5b2]/60 shadow-xs transition-colors cursor-pointer"
          >
            Change Center
          </button>
        </div>
      </div>

      {/* 2. TAB NAVIGATION */}
      <div className="flex items-center justify-between border-b border-[#e2e8dc] pb-2">
        <div className="flex gap-2 sm:gap-4 overflow-x-auto">
          <button
            id="tab-discover-lands"
            onClick={() => setActiveTab('explore')}
            className={`pb-3 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'explore'
                ? 'border-[#1b4332] text-[#1b4332] font-extrabold'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Sprout className="w-4 h-4" />
            Discover Farmland (&le;20 KM)
            <span className="ml-1 px-1.5 py-0.2 bg-[#e8f5ee] text-[#1b4332] rounded-full text-[10px] font-bold">
              {lands.length}
            </span>
          </button>

          <button
            id="tab-my-requests"
            onClick={() => setActiveTab('my-requests')}
            className={`pb-3 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'my-requests'
                ? 'border-[#1b4332] text-[#1b4332] font-extrabold'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            My Rental Requests
            {myRequests.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded-full text-[10px] font-bold">
                {myRequests.length}
              </span>
            )}
          </button>

          <button
            id="tab-reserved-lands"
            onClick={() => setActiveTab('reserved')}
            className={`pb-3 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'reserved'
                ? 'border-[#1b4332] text-[#1b4332] font-extrabold'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Reserved & Active Farmlands
            {reservedOrActiveRequests.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-blue-100 text-blue-900 rounded-full text-[10px] font-bold">
                {reservedOrActiveRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* View Layout Switcher (when on Explore tab) */}
        {activeTab === 'explore' && (
          <div className="hidden sm:flex items-center gap-1 bg-[#f0f9f4] p-1 rounded-xl border border-[#e2e8dc]">
            <button
              onClick={() => setViewLayout('split')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewLayout === 'split' ? 'bg-white text-[#1b4332] shadow-xs' : 'text-stone-500 hover:text-stone-900'
              }`}
              title="Split Map + Cards View"
            >
              <Columns className="w-3.5 h-3.5" />
              Split
            </button>
            <button
              onClick={() => setViewLayout('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewLayout === 'grid' ? 'bg-white text-[#1b4332] shadow-xs' : 'text-stone-500 hover:text-stone-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Cards
            </button>
            <button
              onClick={() => setViewLayout('map')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewLayout === 'map' ? 'bg-white text-[#1b4332] shadow-xs' : 'text-stone-500 hover:text-stone-900'
              }`}
              title="Full Map View"
            >
              <MapIcon className="w-3.5 h-3.5" />
              Map
            </button>
          </div>
        )}
      </div>

      {/* ================= TAB 1: DISCOVER LANDS ================= */}
      {activeTab === 'explore' && (
        <div className="space-y-4">
          {/* SEARCH & COMPREHENSIVE FILTER BAR */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#e2e8dc] shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Search input */}
              <div className="md:col-span-4 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search land, crop, soil, village..."
                  className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[#e2e8dc] focus:outline-none focus:ring-2 focus:ring-[#1b4332] bg-[#f8f9f5]"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>

              {/* Soil Filter */}
              <div className="md:col-span-2">
                <select
                  value={soilFilter}
                  onChange={(e) => setSoilFilter(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#e2e8dc] bg-[#f8f9f5]"
                >
                  <option value="">All Soils</option>
                  <option value="Clay Loam">Clay Loam</option>
                  <option value="Alluvial">Alluvial Rich</option>
                  <option value="Black Cotton">Black Cotton</option>
                  <option value="Red Sandy">Red Sandy Loam</option>
                  <option value="Laterite">Laterite</option>
                </select>
              </div>

              {/* Water Filter */}
              <div className="md:col-span-2">
                <select
                  value={waterFilter}
                  onChange={(e) => setWaterFilter(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#e2e8dc] bg-[#f8f9f5]"
                >
                  <option value="">All Water Sources</option>
                  <option value="Borewell">Borewell</option>
                  <option value="Canal">Canal Irrigation</option>
                  <option value="Drip">Drip Installed</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="md:col-span-2">
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#e2e8dc] bg-[#f8f9f5]"
                >
                  <option value="distance">📍 Distance (Nearest First)</option>
                  <option value="rent_asc">💰 Rent: Low to High</option>
                  <option value="rent_desc">💰 Rent: High to Low</option>
                  <option value="area_desc">📏 Area: Largest First</option>
                </select>
              </div>

              {/* Radius Slider / Quick selector (max 20 KM) */}
              <div className="md:col-span-2 flex items-center justify-between gap-2 px-3 py-1.5 bg-[#f0f9f4] rounded-xl border border-[#95d5b2]/60">
                <span className="text-[11px] font-bold text-[#1b4332] whitespace-nowrap">
                  Max: {maxRadiusKm} KM
                </span>
                <input
                  type="range"
                  min="3"
                  max="20"
                  step="1"
                  value={maxRadiusKm}
                  onChange={(e) => setMaxRadiusKm(Number(e.target.value))}
                  className="w-20 accent-[#1b4332] cursor-pointer"
                  title="Adjust search radius within 20 KM constraint"
                />
              </div>
            </div>

            {/* Quick Filter Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-stone-400 text-[11px]">Quick filters:</span>
              <button
                onClick={() => setSoilFilter(soilFilter === 'Clay Loam' ? '' : 'Clay Loam')}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors ${
                  soilFilter === 'Clay Loam'
                    ? 'bg-[#1b4332] text-white border-[#1b4332]'
                    : 'bg-[#f8f9f5] text-stone-600 border-[#e2e8dc] hover:bg-[#e8f5ee]'
                }`}
              >
                🌱 Clay Loam
              </button>
              <button
                onClick={() => setWaterFilter(waterFilter === 'Borewell' ? '' : 'Borewell')}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors ${
                  waterFilter === 'Borewell'
                    ? 'bg-[#1b4332] text-white border-[#1b4332]'
                    : 'bg-[#f8f9f5] text-stone-600 border-[#e2e8dc] hover:bg-[#e8f5ee]'
                }`}
              >
                💧 Borewell
              </button>
              <button
                onClick={() => setElectricityFilter(electricityFilter === '3-Phase' ? '' : '3-Phase')}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors ${
                  electricityFilter === '3-Phase'
                    ? 'bg-[#1b4332] text-white border-[#1b4332]'
                    : 'bg-[#f8f9f5] text-stone-600 border-[#e2e8dc] hover:bg-[#e8f5ee]'
                }`}
              >
                ⚡ 3-Phase Power
              </button>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSoilFilter('');
                  setWaterFilter('');
                  setElectricityFilter('');
                  setMaxRent('');
                  setMinArea('');
                  setMaxRadiusKm(20);
                }}
                className="text-[11px] text-stone-500 hover:text-[#1b4332] underline ml-auto cursor-pointer font-medium"
              >
                Reset All Filters
              </button>
            </div>
          </div>

          {/* DISCOVERY CONTENT VIEW (SPLIT, GRID, OR MAP) */}
          {isLoadingLands ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs text-stone-500">Calculating Haversine 20 KM proximity for lands...</p>
            </div>
          ) : lands.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-4">
              <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto text-2xl">
                🌾
              </div>
              <div>
                <h3 className="font-bold text-stone-800 text-base">No Farmland Found Within Your Selected Radius</h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">
                  There are currently no lands matching your filters within {maxRadiusKm} KM of your current coordinates. Try adjusting filters or expanding to the full 20 KM limit.
                </p>
              </div>
              <button
                onClick={onOpenLocationModal}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl"
              >
                Select Another Agricultural Hub Preset
              </button>
            </div>
          ) : viewLayout === 'split' ? (
            /* SPLIT VIEW (MAP ON LEFT, CARDS ON RIGHT) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Sticky Map */}
              <div className="lg:col-span-5 lg:sticky lg:top-24">
                <MapViewer
                  center={{ latitude: farmerLat, longitude: farmerLng, district: user?.location?.district }}
                  radiusKm={maxRadiusKm}
                  showRadiusCircle={true}
                  lands={lands}
                  selectedLandId={selectedLand?.id}
                  onSelectLand={handleLandClick}
                  height="580px"
                  userType="FARMER"
                />
              </div>

              {/* Cards Grid */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between text-xs text-stone-500 px-1">
                  <span>
                    Showing <strong>{lands.length}</strong> available farmlands (&le;{maxRadiusKm} KM)
                  </span>
                  <span className="font-mono text-emerald-800 font-bold">20 KM GEOFENCE ENFORCED</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {lands.map((land) => (
                    <LandCard
                      key={land.id}
                      land={land}
                      onSelect={() => handleLandClick(land)}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : viewLayout === 'grid' ? (
            /* CARDS ONLY GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {lands.map((land) => (
                <LandCard
                  key={land.id}
                  land={land}
                  onSelect={() => handleLandClick(land)}
                />
              ))}
            </div>
          ) : (
            /* FULL MAP VIEW */
            <div>
              <MapViewer
                center={{ latitude: farmerLat, longitude: farmerLng, district: user?.location?.district }}
                radiusKm={maxRadiusKm}
                showRadiusCircle={true}
                lands={lands}
                selectedLandId={selectedLand?.id}
                onSelectLand={handleLandClick}
                height="650px"
                userType="FARMER"
              />
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: MY RENTAL REQUESTS ================= */}
      {activeTab === 'my-requests' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#e2e8dc] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-stone-900">My Land Rental Requests</h2>
                <p className="text-xs text-stone-500">Track status of your rental proposals sent to landowners</p>
              </div>
              <button
                onClick={fetchMyRequests}
                className="p-2 text-stone-500 hover:text-stone-900 hover:bg-[#e8f5ee] rounded-xl"
                title="Refresh requests"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {isLoadingRequests ? (
              <div className="py-12 text-center text-xs text-stone-400">Loading requests...</div>
            ) : myRequests.length === 0 ? (
              <div className="py-12 text-center text-stone-500 space-y-2">
                <p className="text-sm font-semibold">You haven't submitted any rental requests yet.</p>
                <p className="text-xs text-stone-400">Browse nearby farmlands within 20 KM to make a reservation.</p>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="mt-2 px-4 py-2 bg-[#1b4332] text-white font-bold text-xs rounded-xl hover:bg-[#143627]"
                >
                  Discover Lands
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#e2e8dc] text-stone-400 uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Land & Location</th>
                      <th className="py-3 px-4">Landlord</th>
                      <th className="py-3 px-4">Proposed Rent / Duration</th>
                      <th className="py-3 px-4">Distance</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Submitted On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {myRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-[#f8f9f5] transition-colors">
                        <td className="py-3 px-4 font-semibold text-stone-900">
                          <div>{req.landName}</div>
                          <span className="text-[10px] text-stone-400 font-normal">
                            {req.landArea} {req.landAreaUnit} • {req.landLocation.village}, {req.landLocation.district}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-stone-800">{req.landlordName}</p>
                          <span className="text-[10px] text-stone-400">{req.landlordPhone}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-[#1b4332]">₹{req.proposedRent.toLocaleString()}</span>
                          <p className="text-[10px] text-stone-500">{req.requestedDuration}</p>
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#2d6a4f]">
                          📍 {req.distanceKm ? `${req.distanceKm} KM` : 'Within 20 KM'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg shadow-2xs ${
                              req.status === 'APPROVED'
                                ? 'bg-[#e8f5ee] text-[#1b4332] border border-[#95d5b2]/60'
                                : req.status === 'ACTIVE'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : req.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : req.status === 'COMPLETED'
                                ? 'bg-stone-100 text-stone-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {req.status === 'APPROVED' ? 'RESERVED' : req.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-stone-400">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: RESERVED & ACTIVE FARMLANDS ================= */}
      {activeTab === 'reserved' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#e2e8dc] shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-stone-900">My Reserved Farmlands & Active Leases</h2>
            <p className="text-xs text-stone-500">
              Farmlands where your rental proposal was approved by the landowner. The plot is held in RESERVED or ACTIVE status.
            </p>

            {reservedOrActiveRequests.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-xs">
                No active reservations yet. When a landlord approves your proposal, it will appear here.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reservedOrActiveRequests.map((req) => (
                  <div key={req.id} className="p-5 rounded-2xl border border-[#95d5b2]/60 bg-[#f0f9f4] space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2.5 py-1 text-xs font-bold uppercase rounded-lg ${
                          req.status === 'ACTIVE' ? 'bg-blue-600 text-white' : 'bg-[#1b4332] text-white'
                        }`}
                      >
                        {req.status === 'ACTIVE' ? 'ACTIVE LEASE' : 'RESERVED FOR YOU'}
                      </span>
                      <span className="text-xs font-semibold text-[#1b4332]">
                        📍 {req.distanceKm} KM from home
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-base text-stone-900">{req.landName}</h3>
                      <p className="text-xs text-stone-600">
                        {req.landArea} {req.landAreaUnit} • {req.landSoilType} Soil • {req.landLocation.village}, {req.landLocation.district}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-[#e2e8dc]">
                      <div>
                        <span className="text-stone-400 text-[10px]">Agreed Annual Rent</span>
                        <p className="font-bold text-[#1b4332]">₹{req.proposedRent.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-stone-400 text-[10px]">Planned Crop</span>
                        <p className="font-bold text-stone-800">{req.purposeCrop}</p>
                      </div>
                      <div>
                        <span className="text-stone-400 text-[10px]">Lease Start Date</span>
                        <p className="font-semibold text-stone-700">{req.requestedStartDate}</p>
                      </div>
                      <div>
                        <span className="text-stone-400 text-[10px]">Landlord Contact</span>
                        <p className="font-semibold text-stone-700">{req.landlordPhone}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* LAND DETAIL & RENTAL MODAL */}
      <LandDetailModal
        land={selectedLand}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onRentalSuccess={() => {
          fetchNearbyLands();
          fetchMyRequests();
          setActiveTab('my-requests');
        }}
      />
    </div>
  );
};

// Subcomponent: Land Card
const LandCard: React.FC<{ land: LandItem; onSelect: () => void }> = ({ land, onSelect }) => {
  const isWithin20Km = land.isWithin20Km ?? (land.distanceKm !== undefined ? land.distanceKm <= 20 : true);

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#e2e8dc] shadow-xs hover:shadow-md transition-all flex flex-col group">
      <div className="h-44 relative overflow-hidden bg-stone-100">
        <img
          src={land.images[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600'}
          alt={land.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e: any) => {
            e.target.src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600';
          }}
        />
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          <span
            className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md shadow-xs ${
              land.status === 'AVAILABLE'
                ? 'bg-[#1b4332] text-white'
                : land.status === 'RESERVED'
                ? 'bg-amber-600 text-white'
                : 'bg-blue-600 text-white'
            }`}
          >
            {land.status}
          </span>
          {land.verified && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#081c15]/85 text-[#95d5b2] backdrop-blur-xs flex items-center gap-1 border border-[#95d5b2]/30">
              <ShieldCheck className="w-3 h-3 text-[#95d5b2]" />
              Verified
            </span>
          )}
        </div>

        {/* Distance Badge */}
        <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-stone-950/85 text-[#95d5b2] backdrop-blur-xs shadow-xs flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-[#95d5b2]" />
          <span>{land.distanceKm !== undefined ? `${land.distanceKm} KM` : 'Within 20 KM'}</span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
            <span>{land.landCode}</span>
            <span className="font-bold text-stone-800">
              {land.totalArea} {land.areaUnit}
            </span>
          </div>
          <h3 className="font-bold text-sm text-stone-900 mt-0.5 line-clamp-1 group-hover:text-[#1b4332] transition-colors">
            {land.name}
          </h3>
          <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
            📍 {land.location.village}, {land.location.district}
          </p>
        </div>

        {/* Specs Pill */}
        <div className="grid grid-cols-2 gap-1.5 text-[11px] text-stone-600 bg-[#f8f9f5] p-2 rounded-xl border border-[#e2e8dc]">
          <div>🌱 {land.soilType || 'Loamy'}</div>
          <div>💧 {land.waterAvailability ? land.waterAvailability.split(' ')[0] : 'Available'}</div>
          <div>⚡ {land.electricityAvailability ? land.electricityAvailability.split(' ')[0] : 'Available'}</div>
          <div className="truncate">🌾 {(land.suitableCrops || []).slice(0, 2).join(', ') || 'Various'}</div>
        </div>

        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-stone-400">Rent: </span>
            <p className="font-extrabold text-[#1b4332] text-sm">
              ₹{land.rentAmount?.toLocaleString() || '0'}
              <span className="text-[10px] font-normal text-stone-500">/{land.rentPeriod || 'Year'}</span>
            </p>
          </div>

          <button
            id={`btn-card-view-${land.id}`}
            onClick={onSelect}
            className="px-3.5 py-1.5 bg-[#1b4332] hover:bg-[#143627] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

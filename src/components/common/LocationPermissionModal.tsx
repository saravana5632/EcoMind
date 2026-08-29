import React, { useState } from 'react';
import { MapPin, Navigation, Compass, X, Check, Globe } from 'lucide-react';
import { LOCATION_PRESETS } from './MapViewer';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelected?: (coords: { latitude: number; longitude: number; district?: string }) => void;
}

export const LocationPermissionModal: React.FC<LocationModalProps> = ({ isOpen, onClose, onLocationSelected }) => {
  const { user, updateLocation } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'gps' | 'presets' | 'manual'>('gps');
  const [isDetecting, setIsDetecting] = useState(false);
  const [manualLat, setManualLat] = useState<string>(user?.location?.latitude?.toString() || '13.0827');
  const [manualLng, setManualLng] = useState<string>(user?.location?.longitude?.toString() || '80.2707');
  const [manualDistrict, setManualDistrict] = useState<string>(user?.location?.district || 'Thiruvallur');
  const [manualVillage, setManualVillage] = useState<string>(user?.location?.village || 'Red Hills Belt');

  if (!isOpen) return null;

  const handleGpsDetect = () => {
    if (!navigator.geolocation) {
      toast.error('GPS Not Supported', 'Your browser does not support automatic geolocation.');
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsDetecting(false);
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lng = parseFloat(pos.coords.longitude.toFixed(4));

        await updateLocation({
          latitude: lat,
          longitude: lng,
          district: 'Current GPS Location',
          village: 'Verified Device Position',
        });

        if (onLocationSelected) {
          onLocationSelected({ latitude: lat, longitude: lng, district: 'Current GPS' });
        }
        onClose();
      },
      (err) => {
        setIsDetecting(false);
        toast.warning('GPS Permission Denied or Unavailable', 'Please select an agricultural preset or enter coordinates manually.');
        setActiveTab('presets');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectPreset = async (preset: typeof LOCATION_PRESETS[0]) => {
    await updateLocation({
      latitude: preset.lat,
      longitude: preset.lng,
      district: preset.district,
      state: preset.state,
      village: preset.name,
    });

    if (onLocationSelected) {
      onLocationSelected({ latitude: preset.lat, longitude: preset.lng, district: preset.district });
    }
    onClose();
  };

  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error('Invalid Coordinates', 'Please enter valid latitude (-90 to 90) and longitude (-180 to 180).');
      return;
    }

    await updateLocation({
      latitude: lat,
      longitude: lng,
      district: manualDistrict,
      village: manualVillage,
    });

    if (onLocationSelected) {
      onLocationSelected({ latitude: lat, longitude: lng, district: manualDistrict });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#e2e8dc] relative animate-in fade-in zoom-in duration-200">
        <button
          id="close-loc-modal"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#f0f9f4] text-[#1b4332] flex items-center justify-center border border-[#95d5b2]/40">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-stone-900">Set Your Agricultural Location</h3>
            <p className="text-xs text-stone-500">20 KM land discovery is strictly calculated from your center point.</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex rounded-xl bg-[#f8f9f5] border border-[#e2e8dc] p-1 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('gps')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'gps' ? 'bg-white text-[#1b4332] shadow-xs font-bold border border-[#e2e8dc]' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            Device GPS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'presets' ? 'bg-white text-[#1b4332] shadow-xs font-bold border border-[#e2e8dc]' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Agri Hubs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'manual' ? 'bg-white text-[#1b4332] shadow-xs font-bold border border-[#e2e8dc]' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Coordinates
          </button>
        </div>

        {/* GPS TAB */}
        {activeTab === 'gps' && (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#f0f9f4] text-[#1b4332] flex items-center justify-center border border-[#95d5b2]/40">
              <Navigation className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-stone-800">Auto-Detect Current GPS Position</h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                LandLink will request browser permission to fetch your latitude and longitude to find farmland within 20 KM.
              </p>
            </div>
            <button
              id="btn-detect-gps"
              onClick={handleGpsDetect}
              disabled={isDetecting}
              className="w-full py-3 bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Navigation className="w-4 h-4" />
              {isDetecting ? 'Detecting GPS Coordinates...' : 'Allow & Detect My Location'}
            </button>
          </div>
        )}

        {/* PRESETS TAB */}
        {activeTab === 'presets' && (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            <p className="text-xs text-stone-500 mb-2">Select a major agricultural farming zone to test proximity:</p>
            {LOCATION_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                id={`preset-btn-${idx}`}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="w-full p-3 rounded-xl border border-[#e2e8dc] hover:border-[#1b4332] hover:bg-[#f0f9f4] text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <h5 className="font-semibold text-sm text-stone-800 group-hover:text-[#1b4332]">{preset.name}</h5>
                  <p className="text-[11px] text-stone-500">
                    {preset.district}, {preset.state} • {preset.lat.toFixed(4)}, {preset.lng.toFixed(4)}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-stone-100 group-hover:bg-[#1b4332] group-hover:text-white flex items-center justify-center transition-colors text-stone-400">
                  <Check className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* MANUAL TAB */}
        {activeTab === 'manual' && (
          <form onSubmit={handleManualSave} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Latitude</label>
                <input
                  id="input-manual-lat"
                  type="number"
                  step="any"
                  required
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#e2e8dc] focus:outline-none focus:ring-2 focus:ring-[#1b4332] bg-[#f8f9f5]"
                  placeholder="e.g. 13.0827"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Longitude</label>
                <input
                  id="input-manual-lng"
                  type="number"
                  step="any"
                  required
                  value={manualLng}
                  onChange={(e) => setManualLng(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#e2e8dc] focus:outline-none focus:ring-2 focus:ring-[#1b4332] bg-[#f8f9f5]"
                  placeholder="e.g. 80.2707"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Village / Town</label>
                <input
                  id="input-manual-village"
                  type="text"
                  value={manualVillage}
                  onChange={(e) => setManualVillage(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#e2e8dc] focus:outline-none focus:ring-2 focus:ring-[#1b4332] bg-[#f8f9f5]"
                  placeholder="e.g. Puzhal Rural"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">District</label>
                <input
                  id="input-manual-district"
                  type="text"
                  value={manualDistrict}
                  onChange={(e) => setManualDistrict(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#e2e8dc] focus:outline-none focus:ring-2 focus:ring-[#1b4332] bg-[#f8f9f5]"
                  placeholder="e.g. Thiruvallur"
                />
              </div>
            </div>

            <button
              id="btn-save-manual-location"
              type="submit"
              className="w-full py-2.5 mt-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-semibold rounded-xl transition-all shadow-md cursor-pointer"
            >
              Save Custom Coordinates & Update Radius
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

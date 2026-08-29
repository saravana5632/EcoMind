import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { MapViewer } from '../common/MapViewer';
import {
  Sprout,
  MapPin,
  X,
  CheckCircle2,
  Upload,
  Compass,
  DollarSign,
  Droplets,
  Zap,
  Layers,
  FileText,
  Plus,
} from 'lucide-react';

interface AddLandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLandAdded: () => void;
}

const CROP_OPTIONS = [
  'Paddy (Rice)',
  'Sugarcane',
  'Organic Vegetables',
  'Cotton',
  'Wheat',
  'Maize',
  'Pulses & Lentils',
  'Groundnut',
  'Millets',
  'Spices & Turmeric',
  'Fruit Orchard (Mango, Guava)',
  'Floriculture & Jasmine',
];

export const AddLandModal: React.FC<AddLandModalProps> = ({ isOpen, onClose, onLandAdded }) => {
  const { user } = useAuth();
  const toast = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [totalArea, setTotalArea] = useState<number | ''>(5);
  const [areaUnit, setAreaUnit] = useState('Acres');
  const [soilType, setSoilType] = useState('Clay Loam');
  const [soilPh, setSoilPh] = useState('6.8');
  const [waterAvailability, setWaterAvailability] = useState('24/7 Borewell (350 ft depth) with Drip');
  const [electricityAvailability, setElectricityAvailability] = useState('3-Phase 24/7 Dedicated Agricultural Grid');
  const [selectedCrops, setSelectedCrops] = useState<string[]>(['Paddy (Rice)', 'Organic Vegetables']);
  const [rentAmount, setRentAmount] = useState<number | ''>(45000);
  const [rentPeriod, setRentPeriod] = useState<'Year' | 'Month' | 'Acre/Year'>('Year');
  const [securityDeposit, setSecurityDeposit] = useState<number | ''>(10000);
  const [minLeaseDuration, setMinLeaseDuration] = useState('1 Year');
  const [maxLeaseDuration, setMaxLeaseDuration] = useState('3 Years');
  const [description, setDescription] = useState('');
  const [documentUrl, setDocumentUrl] = useState('Patta & Chitta Record #7842/2024');

  // Location
  const [village, setVillage] = useState(user?.location?.village || 'Puzhal Rural');
  const [district, setDistrict] = useState(user?.location?.district || 'Thiruvallur');
  const [state, setState] = useState(user?.location?.state || 'Tamil Nadu');
  const [pincode, setPincode] = useState('600066');
  const [latitude, setLatitude] = useState(user?.location?.latitude || 13.0827);
  const [longitude, setLongitude] = useState(user?.location?.longitude || 80.2707);

  // Photos
  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
    'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=800',
  ]);
  const [customImageUrl, setCustomImageUrl] = useState('');

  if (!isOpen) return null;

  const toggleCrop = (crop: string) => {
    if (selectedCrops.includes(crop)) {
      setSelectedCrops(selectedCrops.filter((c) => c !== crop));
    } else {
      setSelectedCrops([...selectedCrops, crop]);
    }
  };

  const addPhoto = () => {
    if (customImageUrl) {
      setImageUrls([...imageUrls, customImageUrl]);
      setCustomImageUrl('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !totalArea || !rentAmount) {
      toast.error('Missing Required Fields', 'Please complete title, area, and rent.');
      return;
    }

    setIsSubmitting(true);
    try {
      const landData = {
        name,
        totalArea: Number(totalArea),
        areaUnit,
        soilType,
        soilPh: soilPh ? parseFloat(soilPh) : undefined,
        waterAvailability,
        electricityAvailability,
        suitableCrops: selectedCrops.length > 0 ? selectedCrops : ['Mixed Agriculture'],
        rentAmount: Number(rentAmount),
        rentPeriod,
        securityDeposit: Number(securityDeposit) || 0,
        minLeaseDuration,
        maxLeaseDuration,
        description: description || `Prime ${totalArea} ${areaUnit} agricultural land in ${village}, ${district}.`,
        location: {
          latitude: Number(latitude),
          longitude: Number(longitude),
          address: `${village}, ${district}, ${state}`,
          village,
          district,
          state,
          pincode,
        },
        images: imageUrls,
        documentUrl,
      };

      const res = await api.createLand(landData);
      if (res.success) {
        toast.success('Agricultural Land Listed!', 'Farmers within 20 KM can now discover and request to rent your land.');
        onLandAdded();
        onClose();
      }
    } catch (err: any) {
      toast.error('Listing Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-[#e2e8dc] relative my-6 animate-in fade-in zoom-in duration-200">
        <button
          id="close-add-land"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-700 hover:bg-[#e8f5ee] rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#f0f9f4] text-[#1b4332] border border-[#95d5b2]/40 flex items-center justify-center font-bold text-2xl">
            🏠
          </div>
          <div>
            <h2 className="text-2xl font-black text-stone-900">List Agricultural Farmland</h2>
            <p className="text-xs text-stone-500">
              Provide plot specifications and drop your precise coordinates for the 20 KM proximity engine.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 max-h-[72vh] overflow-y-auto pr-1">
          {/* 1. Basic Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">1. Farmland Overview</h3>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Land Listing Title *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 5 Acres Fertile Clay Loam Farm with High-Yield Borewell"
                className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-[#e2e8dc] bg-[#f8f9f5] focus:ring-2 focus:ring-[#1b4332] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Total Area *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={totalArea}
                  onChange={(e) => setTotalArea(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e8dc] bg-[#f8f9f5] focus:ring-2 focus:ring-[#1b4332] focus:outline-none"
                  placeholder="5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Area Unit</label>
                <select
                  value={areaUnit}
                  onChange={(e) => setAreaUnit(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e8dc] bg-[#f8f9f5] focus:ring-2 focus:ring-[#1b4332] focus:outline-none"
                >
                  <option value="Acres">Acres</option>
                  <option value="Hectares">Hectares</option>
                  <option value="Cents">Cents</option>
                  <option value="Bigha">Bigha</option>
                  <option value="Guntha">Guntha</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Annual Rent (₹) *</label>
                <input
                  type="number"
                  required
                  value={rentAmount}
                  onChange={(e) => setRentAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e8dc] bg-[#f8f9f5] font-bold text-[#1b4332] focus:ring-2 focus:ring-[#1b4332] focus:outline-none"
                  placeholder="45000"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Rent Period</label>
                <select
                  value={rentPeriod}
                  onChange={(e: any) => setRentPeriod(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e8dc] bg-[#f8f9f5] focus:ring-2 focus:ring-[#1b4332] focus:outline-none"
                >
                  <option value="Year">Per Year</option>
                  <option value="Month">Per Month</option>
                  <option value="Acre/Year">Per Acre / Year</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Soil & Infrastructure */}
          <div className="space-y-3 pt-3 border-t border-[#e2e8dc]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">2. Soil & Irrigation Infrastructure</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Soil Type</label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e8dc] bg-[#f8f9f5] focus:ring-2 focus:ring-[#1b4332] focus:outline-none"
                >
                  <option value="Clay Loam">Clay Loam (High Moisture Retention)</option>
                  <option value="Alluvial">Alluvial (River Delta / Fertile)</option>
                  <option value="Black Cotton">Black Cotton (Ideal for Cotton & Pulses)</option>
                  <option value="Red Sandy Loam">Red Sandy Loam</option>
                  <option value="Laterite">Laterite</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Soil pH</label>
                <input
                  type="number"
                  step="0.1"
                  value={soilPh}
                  onChange={(e) => setSoilPh(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e8dc] bg-[#f8f9f5] focus:ring-2 focus:ring-[#1b4332] focus:outline-none"
                  placeholder="6.5 - 7.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Water Source / Irrigation</label>
                <input
                  type="text"
                  value={waterAvailability}
                  onChange={(e) => setWaterAvailability(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e8dc] bg-[#f8f9f5] focus:ring-2 focus:ring-[#1b4332] focus:outline-none"
                  placeholder="e.g. 24/7 Borewell with 7.5 HP Submersible"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Electricity Availability</label>
                <input
                  type="text"
                  value={electricityAvailability}
                  onChange={(e) => setElectricityAvailability(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e8dc] bg-[#f8f9f5] focus:ring-2 focus:ring-[#1b4332] focus:outline-none"
                  placeholder="e.g. 3-Phase Dedicated Agricultural Power"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Suitable Crops (Click to select)</label>
              <div className="flex flex-wrap gap-1.5">
                {CROP_OPTIONS.map((crop) => {
                  const isSelected = selectedCrops.includes(crop);
                  return (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => toggleCrop(crop)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1b4332] text-white border-[#1b4332] shadow-xs'
                          : 'bg-[#f8f9f5] text-stone-600 border-[#e2e8dc] hover:bg-[#e8f5ee]'
                      }`}
                    >
                      {crop}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Interactive Location & Map Pin */}
          <div className="space-y-3 pt-3 border-t border-[#e2e8dc]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                3. Precise Location Coordinates (20 KM Geofence)
              </h3>
              <span className="text-[11px] font-bold text-[#1b4332]">
                📍 Click map to set coordinates
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="block text-stone-500 text-[10px]">Village</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#e2e8dc] bg-[#f8f9f5] focus:ring-2 focus:ring-[#1b4332] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-stone-500 text-[10px]">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#e2e8dc] bg-[#f8f9f5] focus:ring-2 focus:ring-[#1b4332] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-stone-500 text-[10px]">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#e2e8dc] bg-[#f8f9f5] font-mono focus:ring-2 focus:ring-[#1b4332] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-stone-500 text-[10px]">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#e2e8dc] bg-[#f8f9f5] font-mono focus:ring-2 focus:ring-[#1b4332] focus:outline-none"
                />
              </div>
            </div>

            {/* Interactive Map Picker */}
            <MapViewer
              center={{ latitude, longitude, district, village }}
              radiusKm={20}
              showRadiusCircle={true}
              interactivePicker={true}
              onLocationPick={(coords) => {
                setLatitude(coords.latitude);
                setLongitude(coords.longitude);
                toast.info('Pin Updated', `Plot location set to ${coords.latitude}, ${coords.longitude}`);
              }}
              height="220px"
              userType="LANDLORD"
            />
          </div>

          {/* 4. Photos & Description */}
          <div className="space-y-3 pt-3 border-t border-[#e2e8dc]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">4. Photos & Notes</h3>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Land Photos (URLs)</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="Paste image URL (https://...)"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#e2e8dc] bg-[#f8f9f5] focus:ring-2 focus:ring-[#1b4332] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addPhoto}
                  className="px-3 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Add Photo
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {imageUrls.map((img, i) => (
                  <div key={i} className="relative w-20 h-14 rounded-lg overflow-hidden border border-[#e2e8dc] shrink-0 group">
                    <img src={img} alt="preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrls(imageUrls.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-red-600 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Detailed Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention access roads, tractor turning radius, fencing, previous harvest yields, etc."
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e8dc] bg-[#f8f9f5] focus:ring-2 focus:ring-[#1b4332] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#e2e8dc] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-add-land"
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#1b4332] hover:bg-[#143627] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Publishing Farmland...' : 'Publish Farmland Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

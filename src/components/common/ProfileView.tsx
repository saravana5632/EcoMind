import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { MapPin, Navigation, User, Phone, Mail, Shield, CheckCircle2 } from 'lucide-react';
import { MapViewer } from './MapViewer';

export const ProfileView: React.FC<{ onOpenLocationModal: () => void }> = ({ onOpenLocationModal }) => {
  const { user, updateProfile, updateLocation } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [village, setVillage] = useState(user?.location?.village || '');
  const [district, setDistrict] = useState(user?.location?.district || '');
  const [state, setState] = useState(user?.location?.state || '');
  const [pincode, setPincode] = useState(user?.location?.pincode || '');
  const [latitude, setLatitude] = useState(user?.location?.latitude || 13.0827);
  const [longitude, setLongitude] = useState(user?.location?.longitude || 80.2707);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        name,
        phone,
        bio,
      });

      await updateLocation({
        latitude: Number(latitude),
        longitude: Number(longitude),
        village,
        district,
        state,
        pincode,
        address: `${village}, ${district}, ${state}`,
      });

      toast.success('Profile & Agricultural Coordinates Saved!');
    } catch (err: any) {
      toast.error('Save Failed', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e8dc] shadow-sm space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-[#e2e8dc]">
          <img
            src={user?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#1b4332]"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-stone-900">{user?.name}</h1>
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded-lg bg-[#f0f9f4] text-[#1b4332] border border-[#95d5b2]/40">
                {user?.role} Account
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Account Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#e2e8dc] bg-[#f8f9f5] focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Mobile Contact</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#e2e8dc] bg-[#f8f9f5] focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Farming / Landowner Bio</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your agricultural background, crops cultivated, or machinery available..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e8dc] bg-[#f8f9f5] focus:ring-2 focus:ring-[#1b4332]"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#e2e8dc]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Primary Agricultural Center (20 KM Search Origin)
              </h3>
              <button
                type="button"
                onClick={onOpenLocationModal}
                className="text-xs font-bold text-[#1b4332] hover:underline cursor-pointer"
              >
                Use Preset Hub / GPS
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Village/Town</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e8dc] bg-[#f8f9f5]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e8dc] bg-[#f8f9f5]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e8dc] bg-[#f8f9f5]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e8dc] bg-[#f8f9f5]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e8dc] bg-[#f8f9f5] font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e8dc] bg-[#f8f9f5] font-mono"
                />
              </div>
            </div>

            <MapViewer
              center={{ latitude, longitude, district, village }}
              radiusKm={20}
              showRadiusCircle={true}
              interactivePicker={true}
              onLocationPick={(coords) => {
                setLatitude(coords.latitude);
                setLongitude(coords.longitude);
                toast.info('Coordinates Updated', `${coords.latitude}, ${coords.longitude}`);
              }}
              height="200px"
              userType={user?.role}
            />
          </div>

          <div className="pt-4 border-t border-[#e2e8dc] flex justify-end">
            <button
              id="btn-save-profile"
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

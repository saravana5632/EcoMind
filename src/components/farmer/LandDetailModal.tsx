import React, { useState } from 'react';
import {
  LandItem,
  UserRole,
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import {
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Calendar,
  DollarSign,
  Droplets,
  Zap,
  Layers,
  Phone,
  Mail,
  User,
  Clock,
  Sparkles,
  Sprout,
} from 'lucide-react';
import { MapViewer } from '../common/MapViewer';

interface LandDetailModalProps {
  land: LandItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRentalSuccess?: () => void;
}

export const LandDetailModal: React.FC<LandDetailModalProps> = ({
  land,
  isOpen,
  onClose,
  onRentalSuccess,
}) => {
  const { user, role, isAuthenticated } = useAuth();
  const toast = useToast();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Request form state
  const [duration, setDuration] = useState('1 Year');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [purposeCrop, setPurposeCrop] = useState('Organic Multicrop & Vegetables');
  const [proposedRent, setProposedRent] = useState<string>(land?.rentAmount?.toString() || '');
  const [notes, setNotes] = useState('');

  if (!isOpen || !land) return null;

  const isWithin20Km = land.isWithin20Km ?? (land.distanceKm !== undefined ? land.distanceKm <= 20 : true);
  const distanceText = land.distanceKm !== undefined ? `${land.distanceKm} KM away` : 'Within 20 KM';

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Authentication Required', 'Please login as a Farmer to request land rentals.');
      return;
    }

    if (role !== 'FARMER') {
      toast.error('Farmer Access Only', 'Only registered Farmers can submit land rental requests.');
      return;
    }

    if (!isWithin20Km) {
      toast.error(
        '20 KM Geofence Violation',
        `This land is ${land.distanceKm} KM away. Rental requests are strictly prohibited beyond the 20 KM radius.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.submitRentalRequest({
        landId: land.id,
        requestedDuration: duration,
        requestedStartDate: startDate,
        purposeCrop,
        proposedRent: proposedRent ? parseFloat(proposedRent) : land.rentAmount,
        notes,
        farmerLatitude: user?.location?.latitude,
        farmerLongitude: user?.location?.longitude,
      });

      if (res.success) {
        toast.success(
          'Rental Request Submitted!',
          `Landlord ${land.landlordName} will review your request. Land is verified within your 20 KM zone.`
        );
        setShowRequestForm(false);
        if (onRentalSuccess) {
          onRentalSuccess();
        }
        onClose();
      }
    } catch (err: any) {
      toast.error('Request Failed', err.message || 'Could not submit rental request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-[#e2e8dc] relative my-6 animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          id="close-land-detail"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-700 hover:bg-[#f0f9f4] rounded-full transition-colors z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 20 KM Status Banner */}
        <div className="mb-4">
          {isWithin20Km ? (
            <div className="p-3 rounded-2xl bg-[#f0f9f4] border border-[#95d5b2]/60 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[#1b4332] font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#2d6a4f] shrink-0" />
                <span>
                  📍 <strong>20 KM Proximity Verified:</strong> This plot is <strong>{distanceText}</strong> from your farm center.
                </span>
              </div>
              <span className="px-2.5 py-0.5 bg-[#1b4332] text-white font-bold text-[10px] rounded-full uppercase tracking-wider">
                Eligible to Rent
              </span>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-amber-950 font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  ⚠️ <strong>Outside 20 KM Radius ({distanceText}):</strong> Land exceeds permitted 20 KM agricultural commuting boundary.
                </span>
              </div>
              <span className="px-2.5 py-0.5 bg-amber-700 text-white font-bold text-[10px] rounded-full uppercase">
                Restricted
              </span>
            </div>
          )}
        </div>

        {/* Land Photos Gallery */}
        <div className="space-y-2 mb-6">
          <div className="h-64 sm:h-80 rounded-2xl overflow-hidden relative bg-stone-100">
            <img
              src={land.images?.[activeImageIndex] || land.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'}
              alt={land.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 flex gap-2">
              <span
                className={`px-3 py-1 text-xs font-bold uppercase rounded-lg shadow-md ${
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
                <span className="px-3 py-1 text-xs font-bold rounded-lg bg-[#081c15]/90 text-[#95d5b2] backdrop-blur-sm flex items-center gap-1 border border-[#95d5b2]/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#95d5b2]" />
                  Verified Title
                </span>
              )}
            </div>

            <div className="absolute bottom-3 right-3 px-3 py-1 text-xs font-bold rounded-lg bg-stone-950/80 text-white backdrop-blur-sm font-mono">
              Code: {land.landCode}
            </div>
          </div>

          {/* Thumbnails */}
          {(land.images || []).length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {(land.images || []).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    activeImageIndex === idx ? 'border-[#1b4332] ring-2 ring-[#95d5b2]/40' : 'border-[#e2e8dc] opacity-70'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Land Details & Specs */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#e2e8dc]">
            <div>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <MapPin className="w-3.5 h-3.5 text-[#2d6a4f]" />
                <span>
                  {land.location.village}, {land.location.district}, {land.location.state}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">{land.name}</h2>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">{land.description}</p>
            </div>

            <div className="text-left sm:text-right shrink-0 bg-[#f0f9f4] p-3 rounded-2xl border border-[#95d5b2]/50">
              <span className="text-xs text-stone-500">Rental Price</span>
              <p className="text-2xl font-black text-[#1b4332]">
                ₹{land.rentAmount.toLocaleString()}
                <span className="text-xs font-normal text-stone-600">/{land.rentPeriod}</span>
              </p>
              <span className="text-[10px] text-stone-400">Negotiable via proposal</span>
            </div>
          </div>

          {/* Technical Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#f8f9f5] p-3 rounded-2xl border border-[#e2e8dc]">
              <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
                <Layers className="w-3.5 h-3.5 text-[#1b4332]" />
                <span>Total Area</span>
              </div>
              <p className="font-extrabold text-sm text-stone-900">
                {land.totalArea} {land.areaUnit}
              </p>
            </div>

            <div className="bg-[#f8f9f5] p-3 rounded-2xl border border-[#e2e8dc]">
              <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#1b4332]" />
                <span>Soil & pH</span>
              </div>
              <p className="font-extrabold text-sm text-stone-900">{land.soilType}</p>
              {land.soilPh && <span className="text-[10px] text-stone-500">pH: {land.soilPh}</span>}
            </div>

            <div className="bg-[#f8f9f5] p-3 rounded-2xl border border-[#e2e8dc]">
              <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
                <Droplets className="w-3.5 h-3.5 text-blue-600" />
                <span>Water Source</span>
              </div>
              <p className="font-extrabold text-xs text-stone-900 line-clamp-1">{land.waterAvailability}</p>
            </div>

            <div className="bg-[#f8f9f5] p-3 rounded-2xl border border-[#e2e8dc]">
              <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>Electricity</span>
              </div>
              <p className="font-extrabold text-xs text-stone-900 line-clamp-1">{land.electricityAvailability}</p>
            </div>
          </div>

          {/* Suitable Crops & Amenities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#f0f9f4] p-4 rounded-2xl border border-[#95d5b2]/40 space-y-2">
              <h4 className="text-xs font-bold text-[#1b4332] uppercase tracking-wider">Suitable Crops</h4>
              <div className="flex flex-wrap gap-1.5">
                {(land.suitableCrops || []).map((crop, i) => (
                  <span key={i} className="px-2.5 py-1 text-xs font-semibold bg-white text-[#1b4332] rounded-lg border border-[#95d5b2]/50 shadow-2xs">
                    🌱 {crop}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-[#f8f9f5] p-4 rounded-2xl border border-[#e2e8dc] space-y-2">
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">Landowner Info</h4>
              <div className="text-xs text-stone-600 space-y-1">
                <p className="font-bold text-stone-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-stone-400" /> {land.landlordName}
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-stone-400" /> {land.landlordPhone}
                </p>
                <p className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-stone-400" /> {land.landlordEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Mini Map Location Display */}
          <div>
            <h4 className="text-xs font-bold text-stone-700 mb-2">GPS Location on Agricultural Map</h4>
            <MapViewer
              center={{
                latitude: land.location.latitude,
                longitude: land.location.longitude,
                district: land.location.district,
                village: land.location.village,
              }}
              radiusKm={20}
              showRadiusCircle={true}
              lands={[land]}
              height="200px"
              userType="FARMER"
            />
          </div>

          {/* ACTION BUTTON OR RENTAL FORM */}
          {!showRequestForm ? (
            <div className="pt-4 border-t border-[#e2e8dc] flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-stone-500">Ready to begin farming on this plot?</p>
                <p className="text-xs font-semibold text-stone-800">Direct rental request submitted to landowner.</p>
              </div>

              {land.status === 'AVAILABLE' ? (
                <button
                  id="btn-open-rent-form"
                  onClick={() => {
                    if (!isWithin20Km) {
                      toast.error('20 KM Restriction', 'You cannot rent farmland situated farther than 20 KM from your location.');
                      return;
                    }
                    setShowRequestForm(true);
                  }}
                  disabled={!isWithin20Km}
                  className={`px-6 py-3 font-bold text-sm rounded-2xl transition-all shadow-md cursor-pointer ${
                    isWithin20Km
                      ? 'bg-[#1b4332] hover:bg-[#143627] text-white hover:shadow-[#1b4332]/20'
                      : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  {isWithin20Km ? 'Request to Rent Land' : 'Locked (> 20 KM Radius)'}
                </button>
              ) : (
                <span className="px-4 py-2.5 bg-amber-100 text-amber-900 font-bold text-xs rounded-xl">
                  Land is currently {land.status}
                </span>
              )}
            </div>
          ) : (
            /* RENTAL PROPOSAL FORM */
            <form onSubmit={handleRequestSubmit} className="pt-4 border-t border-[#e2e8dc] space-y-4 bg-[#f0f9f4] p-5 rounded-2xl border border-[#95d5b2]/50">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-[#1b4332]" />
                  Submit Rental Reservation Proposal
                </h3>
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Rental Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e8dc] bg-white focus:ring-2 focus:ring-[#1b4332] focus:outline-none"
                  >
                    <option value="6 Months">6 Months (Single Season / Rabi or Kharif)</option>
                    <option value="1 Year">1 Year (Annual Multi-Season)</option>
                    <option value="2 Years">2 Years Lease</option>
                    <option value="3 Years">3 Years Long-Term Lease</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Requested Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e8dc] bg-white focus:ring-2 focus:ring-[#1b4332] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Intended Crop / Farming Purpose</label>
                  <input
                    type="text"
                    required
                    value={purposeCrop}
                    onChange={(e) => setPurposeCrop(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e8dc] bg-white focus:ring-2 focus:ring-[#1b4332] focus:outline-none"
                    placeholder="e.g. Organic Paddy, Vegetables, Cotton"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Proposed Annual Rent (₹)</label>
                  <input
                    type="number"
                    value={proposedRent}
                    onChange={(e) => setProposedRent(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e8dc] bg-white focus:ring-2 focus:ring-[#1b4332] focus:outline-none"
                    placeholder={`Default: ₹${land.rentAmount}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Notes / Message to Landowner</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e8dc] bg-white focus:ring-2 focus:ring-[#1b4332] focus:outline-none"
                  placeholder="Introduce your farming experience, machinery available, or specific soil preparation requirements..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-[#e8f5ee] rounded-xl cursor-pointer"
                >
                  Back
                </button>
                <button
                  id="btn-confirm-rental-submit"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#1b4332] hover:bg-[#143627] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSubmitting ? 'Submitting Proposal...' : 'Send Rental Request to Landlord'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

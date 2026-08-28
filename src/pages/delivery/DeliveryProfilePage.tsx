import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Truck, 
  Hash, 
  FileText, 
  MapPin, 
  ShieldCheck, 
  ShieldAlert, 
  Star, 
  Check, 
  Save, 
  AlertCircle,
  TrendingUp,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DeliveryProfilePage: React.FC = () => {
  const { userProfile, updateProfileDetails, demoRoleApprovedToggle } = useAuth();

  const [name, setName] = useState(userProfile?.name || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [vehicleType, setVehicleType] = useState(userProfile?.vehicleType || 'Electric Two-Wheeler');
  const [vehicleNumber, setVehicleNumber] = useState(userProfile?.vehicleNumber || '');
  const [licenseNumber, setLicenseNumber] = useState(userProfile?.licenseNumber || '');
  const [serviceArea, setServiceArea] = useState(userProfile?.serviceArea || '');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      if (userProfile.name) setName(userProfile.name);
      if (userProfile.phone) setPhone(userProfile.phone);
      if (userProfile.vehicleType) setVehicleType(userProfile.vehicleType);
      if (userProfile.vehicleNumber) setVehicleNumber(userProfile.vehicleNumber);
      if (userProfile.licenseNumber) setLicenseNumber(userProfile.licenseNumber);
      if (userProfile.serviceArea) setServiceArea(userProfile.serviceArea);
    }
  }, [userProfile]);

  const isPending = userProfile?.status === 'pending';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    const res = await updateProfileDetails({
      name,
      phone,
      vehicleType,
      vehicleNumber,
      licenseNumber,
      serviceArea
    });

    setSaving(false);

    if (res.success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } else {
      setErrorMsg(res.error || 'Failed to update partner profile');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-800 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-2xl shadow-xl">
            <Truck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">
                {userProfile?.name || 'Delivery Partner'}
              </h1>
              {isPending ? (
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Pending Admin Approval
                </span>
              ) : (
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Verified Partner
                </span>
              )}
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              {userProfile?.email} • Vehicle: {userProfile?.vehicleNumber || 'KA-01-EQ-4421'}
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[10px] uppercase font-mono text-stone-400 block">EcoMind Agriculture Ecosystem</span>
          <span className="text-xs font-bold text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-800/40 inline-block mt-1">
            Application 2: Delivery Partner Role
          </span>
        </div>
      </div>

      {/* Admin Approval Banner if Pending */}
      {isPending && (
        <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold text-white">Account Status: Pending Approval</p>
              <p className="text-[11px] text-amber-300/80">
                In production, administrators in Application 1 review driving credentials before approving fleet access.
              </p>
            </div>
          </div>
          <button
            onClick={demoRoleApprovedToggle}
            className="px-4 py-2 rounded-xl bg-amber-400 text-stone-950 text-xs font-bold uppercase tracking-wider hover:bg-amber-300 transition-colors shrink-0"
          >
            Simulate Admin Approval (1-Click)
          </button>
        </div>
      )}

      {/* Performance Scorecard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-stone-900 rounded-2xl p-4 border border-stone-800 text-center">
          <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
            <Star className="w-4 h-4 fill-amber-400" />
            <span className="font-extrabold text-sm text-white">4.92</span>
          </div>
          <span className="text-[10px] uppercase text-stone-400 font-bold block">Customer Rating</span>
        </div>

        <div className="bg-stone-900 rounded-2xl p-4 border border-stone-800 text-center">
          <span className="font-extrabold text-sm text-white block mb-1">99.4%</span>
          <span className="text-[10px] uppercase text-stone-400 font-bold block">On-Time Rate</span>
        </div>

        <div className="bg-stone-900 rounded-2xl p-4 border border-stone-800 text-center">
          <span className="font-extrabold text-sm text-emerald-400 block mb-1">128 Trips</span>
          <span className="text-[10px] uppercase text-stone-400 font-bold block">Total Deliveries</span>
        </div>

        <div className="bg-stone-900 rounded-2xl p-4 border border-stone-800 text-center">
          <span className="font-extrabold text-sm text-emerald-400 block mb-1">Zero</span>
          <span className="text-[10px] uppercase text-stone-400 font-bold block">Produce Damage</span>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Your partner logistics profile has been updated in Firestore!</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Edit Partner Form */}
      <div className="bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-800 space-y-6">
        <h2 className="text-base font-bold text-white pb-3 border-b border-stone-800">
          Partner Logistics Credentials & Service Area
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">
                Full Legal Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-950 border border-stone-800 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-950 border border-stone-800 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">
                Vehicle Type
              </label>
              <input
                type="text"
                required
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-stone-950 border border-stone-800 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">
                Vehicle Plate Number
              </label>
              <input
                type="text"
                required
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 rounded-2xl bg-stone-950 border border-stone-800 text-xs sm:text-sm text-white uppercase focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">
                Driving License Number
              </label>
              <input
                type="text"
                required
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 rounded-2xl bg-stone-950 border border-stone-800 text-xs sm:text-sm text-white uppercase focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">
                Preferred Delivery Zone / Service Area
              </label>
              <input
                type="text"
                required
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-stone-950 border border-stone-800 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Updating...' : 'Save Partner Profile'}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 text-xs text-stone-400 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Unified Firestore Database: Accessible by App 1 Admins for KYC verification.</span>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  UserRole,
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Sprout,
  Shield,
  Home,
  Eye,
  EyeOff,
  Navigation,
  MapPin,
  X,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: UserRole;
  initialIsRegister?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'FARMER',
  initialIsRegister = false,
}) => {
  const { login, registerFarmer, registerLandlord, isLoading } = useAuth();
  const toast = useToast();

  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [isRegister, setIsRegister] = useState<boolean>(initialIsRegister);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('1994-05-12');
  const [address, setAddress] = useState('');
  const [village, setVillage] = useState('Puzhal Rural');
  const [district, setDistrict] = useState('Thiruvallur');
  const [state, setState] = useState('Tamil Nadu');
  const [pincode, setPincode] = useState('600066');
  const [photoUrl, setPhotoUrl] = useState('');
  const [latitude, setLatitude] = useState('13.0827');
  const [longitude, setLongitude] = useState('80.2707');
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  if (!isOpen) return null;

  const handleFillDemo = (role: UserRole) => {
    setSelectedRole(role);
    setIsRegister(false);
    if (role === 'FARMER') {
      setLoginEmail('farmer@landlink.com');
      setLoginPassword('farmer123');
    } else if (role === 'LANDLORD') {
      setLoginEmail('landlord@landlink.com');
      setLoginPassword('landlord123');
    } else if (role === 'ADMIN') {
      setLoginEmail('admin@landlink.com');
      setLoginPassword('admin123');
    }
  };

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      toast.warning('GPS not supported', 'Please enter latitude & longitude manually.');
      return;
    }
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingGps(false);
        setLatitude(pos.coords.latitude.toFixed(4));
        setLongitude(pos.coords.longitude.toFixed(4));
        toast.success('GPS Coordinates Captured', `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      },
      (err) => {
        setIsDetectingGps(false);
        toast.info('GPS Notice', 'Using default regional agricultural coordinates.');
      },
      { timeout: 8000 }
    );
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Missing Information', 'Please enter email and password.');
      return;
    }
    const ok = await login(loginEmail, loginPassword, selectedRole);
    if (ok) {
      onClose();
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Password Mismatch', 'Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      toast.error('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    const payload = {
      name: fullName,
      email,
      phone,
      password,
      dob,
      address,
      village,
      district,
      state,
      pincode,
      photoUrl: photoUrl || (selectedRole === 'FARMER'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'),
      location: {
        latitude: parseFloat(latitude) || 13.0827,
        longitude: parseFloat(longitude) || 80.2707,
        address: `${village}, ${district}, ${state}`,
        village,
        district,
        state,
        pincode,
      },
    };

    let ok = false;
    if (selectedRole === 'FARMER') {
      ok = await registerFarmer(payload);
    } else {
      ok = await registerLandlord(payload);
    }

    if (ok) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#e2e8dc] relative my-8 animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          id="close-auth-modal"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#f0f9f4] text-[#1b4332] mb-2 border border-[#95d5b2]/40 shadow-xs">
            <Sprout className="w-6 h-6 text-[#1b4332]" />
          </div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">
            {isRegister ? `Create ${selectedRole === 'FARMER' ? 'Farmer' : 'Landlord'} Account` : 'Welcome to LandLink'}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {isRegister
              ? 'Join the smart agricultural ecosystem with strict 20 KM proximity verification.'
              : 'Select your role to access your dedicated agricultural portal.'}
          </p>
        </div>

        {/* 1. ROLE SELECTION INTERFACE (Requirement #2) */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2 text-center">
            Select Your Platform Role
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              id="role-btn-farmer"
              type="button"
              onClick={() => {
                setSelectedRole('FARMER');
              }}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                selectedRole === 'FARMER'
                  ? 'border-[#1b4332] bg-[#f0f9f4] text-[#1b4332] font-bold ring-2 ring-[#1b4332]/20'
                  : 'border-[#e2e8dc] hover:bg-[#f8f9f5] text-stone-600'
              }`}
            >
              <span className="text-2xl">👨‍🌾</span>
              <span className="text-xs font-bold">Farmer</span>
              <span className="text-[9px] opacity-75">Rent Land</span>
            </button>

            <button
              id="role-btn-landlord"
              type="button"
              onClick={() => {
                setSelectedRole('LANDLORD');
              }}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                selectedRole === 'LANDLORD'
                  ? 'border-[#1b4332] bg-[#f0f9f4] text-[#1b4332] font-bold ring-2 ring-[#1b4332]/20'
                  : 'border-[#e2e8dc] hover:bg-[#f8f9f5] text-stone-600'
              }`}
            >
              <span className="text-2xl">🏠</span>
              <span className="text-xs font-bold">Landlord</span>
              <span className="text-[9px] opacity-75">List Land</span>
            </button>

            <button
              id="role-btn-admin"
              type="button"
              onClick={() => {
                setSelectedRole('ADMIN');
                setIsRegister(false); // Admin cannot be publicly registered
              }}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                selectedRole === 'ADMIN'
                  ? 'border-[#1b4332] bg-[#f0f9f4] text-[#1b4332] font-bold ring-2 ring-[#1b4332]/20'
                  : 'border-[#e2e8dc] hover:bg-[#f8f9f5] text-stone-600'
              }`}
            >
              <span className="text-2xl">🛡️</span>
              <span className="text-xs font-bold">Admin</span>
              <span className="text-[9px] opacity-75">System Control</span>
            </button>
          </div>
        </div>

        {/* Quick Demo Autofill Bar */}
        <div className="mb-5 p-2.5 rounded-xl bg-[#f0f9f4] border border-[#95d5b2]/50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-[#1b4332] font-semibold">
            <Sparkles className="w-4 h-4 text-[#1b4332]" />
            <span>Fill Demo Credentials:</span>
          </div>
          <button
            type="button"
            onClick={() => handleFillDemo(selectedRole)}
            className="px-2.5 py-1 text-xs font-bold bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            Auto-fill {selectedRole}
          </button>
        </div>

        {/* LOGIN FORM */}
        {!isRegister ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {selectedRole === 'ADMIN' ? 'Admin ID / Email Address' : 'Email Address / Mobile'}
              </label>
              <div className="relative">
                <input
                  id="input-login-email"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#e2e8dc] focus:outline-none focus:ring-2 focus:ring-[#1b4332] bg-[#f8f9f5]"
                  placeholder={
                    selectedRole === 'FARMER'
                      ? 'farmer@landlink.com'
                      : selectedRole === 'LANDLORD'
                      ? 'landlord@landlink.com'
                      : 'admin@landlink.com'
                  }
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-stone-700">Password</label>
                <button
                  type="button"
                  onClick={() => toast.info('Password Reset', 'Please use seeded demo password: admin123 / farmer123 / landlord123')}
                  className="text-[11px] text-[#1b4332] hover:underline cursor-pointer font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="input-login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-[#e2e8dc] focus:outline-none focus:ring-2 focus:ring-[#1b4332] bg-[#f8f9f5]"
                  placeholder="••••••••"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-stone-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#1b4332] focus:ring-[#1b4332]"
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            <button
              id="btn-submit-login"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              {isLoading ? 'Signing In...' : `Sign In as ${selectedRole}`}
            </button>

            {selectedRole !== 'ADMIN' && (
              <div className="text-center pt-3 border-t border-[#e2e8dc]">
                <p className="text-xs text-stone-500">
                  Don't have a {selectedRole.toLowerCase()} account?{' '}
                  <button
                    type="button"
                    onClick={() => setIsRegister(true)}
                    className="font-bold text-[#1b4332] hover:underline cursor-pointer"
                  >
                    Register as {selectedRole === 'FARMER' ? 'Farmer' : 'Landlord'}
                  </button>
                </p>
              </div>
            )}
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#e2e8dc] focus:ring-2 focus:ring-[#1b4332] bg-[#f8f9f5]"
                  placeholder="e.g. Arun Kumar"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#e2e8dc] focus:ring-2 focus:ring-[#1b4332] bg-[#f8f9f5]"
                  placeholder="arun@farming.in"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#e2e8dc] focus:ring-2 focus:ring-[#1b4332] bg-[#f8f9f5]"
                  placeholder="+91 98765 43210"
                />
              </div>
              {selectedRole === 'FARMER' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#e2e8dc] focus:ring-2 focus:ring-[#1b4332] bg-[#f8f9f5]"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#e2e8dc] focus:ring-2 focus:ring-[#1b4332] bg-[#f8f9f5]"
                  placeholder="Min 6 chars"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Confirm Password *</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#e2e8dc] focus:ring-2 focus:ring-[#1b4332] bg-[#f8f9f5]"
                  placeholder="Repeat password"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Village/Town</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-[#e2e8dc] bg-[#f8f9f5]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-[#e2e8dc] bg-[#f8f9f5]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-[#e2e8dc] bg-[#f8f9f5]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-[#e2e8dc] bg-[#f8f9f5]"
                />
              </div>
            </div>

            {/* GPS / Location capture block */}
            <div className="p-3 rounded-2xl bg-[#f0f9f4] border border-[#95d5b2]/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1b4332] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#1b4332]" />
                  Primary Agricultural Coordinates (20 KM Base)
                </span>
                <button
                  type="button"
                  onClick={handleDetectGps}
                  disabled={isDetectingGps}
                  className="px-2 py-1 bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Navigation className="w-3 h-3" />
                  {isDetectingGps ? 'Detecting...' : 'Detect GPS'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-stone-500 text-[10px]">Latitude</span>
                  <input
                    type="number"
                    step="any"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#95d5b2]/40 bg-white"
                  />
                </div>
                <div>
                  <span className="text-stone-500 text-[10px]">Longitude</span>
                  <input
                    type="number"
                    step="any"
                    required
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#95d5b2]/40 bg-white"
                  />
                </div>
              </div>
            </div>

            <button
              id="btn-submit-register"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isLoading ? 'Creating Account...' : `Register as ${selectedRole}`}
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-stone-500">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="font-bold text-[#1b4332] hover:underline cursor-pointer"
                >
                  Sign In to Account
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

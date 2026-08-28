import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Sprout, 
  Search, 
  MapPin, 
  ShoppingCart, 
  User as UserIcon, 
  Truck, 
  Package, 
  TrendingUp, 
  Power, 
  ChevronDown, 
  LogOut, 
  Check, 
  Menu, 
  X,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { NotificationBell } from '../common/NotificationBell';

interface NavbarProps {
  onSearchFocus?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearchFocus }) => {
  const { userProfile, logout, toggleOnlineStatus } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedCity, setSelectedCity] = useState('Chennai Central');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isDeliveryPartner = userProfile?.role === 'delivery_partner';

  const cities = [
    'Chennai Central',
    'Anna Nagar',
    'T. Nagar',
    'Adyar',
    'Velachery',
    'Tambaram',
    'Porur',
    'Guindy',
    'Mylapore',
    'Nungambakkam',
    'Egmore',
    'Perambur',
    'Ambattur',
    'Avadi',
    'Sholinganallur',
    'Thoraipakkam',
    'OMR',
    'ECR',
    'Pallavaram',
    'Chromepet',
    'Medavakkam',
    'Kolathur',
    'Mogappair',
    'Vadapalani',
    'Saidapet',
    'Besant Nagar',
    'Royapettah',
    'Kilpauk',
    'Purasawalkam',
    'Triplicane',
    'Thiruvanmiyur'
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-4">
            
            {/* Left: Brand & Ecosystem Badge */}
            <div className="flex items-center gap-3">
              <Link 
                to={isDeliveryPartner ? "/delivery/dashboard" : "/customer/home"} 
                className="flex items-center gap-2.5 group"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 flex items-center justify-center text-white shadow-sm shadow-emerald-700/20 group-hover:scale-105 transition-transform">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 block leading-tight">
                    EcoMind <span className="text-emerald-600">Fresh</span>
                  </span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-500 flex items-center gap-1">
                    {isDeliveryPartner ? (
                      <span className="text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-md border border-amber-200">
                        Delivery Partner
                      </span>
                    ) : (
                      'Direct Farm Marketplace'
                    )}
                  </span>
                </div>
              </Link>

              {/* Customer Location Selector */}
              {!isDeliveryPartner && (
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/80 hover:bg-emerald-50 border border-slate-200/90 hover:border-emerald-200 text-xs text-slate-700 hover:text-emerald-800 transition-colors shadow-2xs"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-medium truncate max-w-[150px]">{selectedCity}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              )}
            </div>

            {/* Middle: Customer Quick Search Bar */}
            {!isDeliveryPartner && (
              <div className="hidden lg:flex flex-1 max-w-md mx-4">
                <div 
                  onClick={() => {
                    if (location.pathname !== '/customer/products') {
                      navigate('/customer/products');
                    }
                    if (onSearchFocus) onSearchFocus();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 hover:border-emerald-500 hover:bg-white transition-all cursor-pointer shadow-2xs text-xs sm:text-sm"
                >
                  <Search className="w-4 h-4 text-slate-400" />
                  <span className="truncate font-normal">Search fresh fruits, vegetables, leafy greens...</span>
                </div>
              </div>
            )}

            {/* Delivery Partner Duty Status Bar */}
            {isDeliveryPartner && (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={toggleOnlineStatus}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border shadow-xs ${
                    userProfile.isOnline
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-500/20'
                      : 'bg-slate-100 text-slate-600 border-slate-300'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{userProfile.isOnline ? 'ON DUTY (Online)' : 'OFF DUTY (Offline)'}</span>
                </button>
              </div>
            )}

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              
              {/* Customer Links */}
              {!isDeliveryPartner && (
                <>
                  <Link
                    to="/customer/products"
                    className={`hidden sm:inline-flex px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      location.pathname === '/customer/products'
                        ? 'bg-emerald-50 text-emerald-800 font-bold'
                        : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
                    }`}
                  >
                    Farm Produce
                  </Link>

                  <Link
                    to="/customer/orders"
                    className={`hidden sm:inline-flex px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      location.pathname === '/customer/orders'
                        ? 'bg-emerald-50 text-emerald-800 font-bold'
                        : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
                    }`}
                  >
                    My Orders
                  </Link>

                  {/* Cart Button */}
                  <Link
                    to="/customer/cart"
                    className="relative flex items-center justify-center p-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors shadow-2xs border border-emerald-100"
                    aria-label="Shopping Cart"
                  >
                    <ShoppingCart className="w-5 h-5 text-emerald-700" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white shadow-xs ring-2 ring-white">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {/* Delivery Partner Links */}
              {isDeliveryPartner && (
                <>
                  <Link
                    to="/delivery/available"
                    className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      location.pathname === '/delivery/available'
                        ? 'bg-emerald-100 text-emerald-950 font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Package className="w-4 h-4 text-emerald-700" />
                    Available Pickups
                  </Link>

                  <Link
                    to="/delivery/orders"
                    className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      location.pathname === '/delivery/orders'
                        ? 'bg-emerald-100 text-emerald-950 font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Truck className="w-4 h-4 text-emerald-700" />
                    My Trips
                  </Link>

                  <Link
                    to="/delivery/earnings"
                    className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      location.pathname === '/delivery/earnings'
                        ? 'bg-emerald-100 text-emerald-950 font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 text-emerald-700" />
                    Earnings
                  </Link>
                </>
              )}

              {/* Real-Time Notification Bell */}
              {userProfile && <NotificationBell />}

              {/* User Dropdown / Auth Button */}
              {userProfile ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {userProfile.name.charAt(0)}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-xl border border-slate-200/80 ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{userProfile.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{userProfile.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                          {userProfile.role.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to={isDeliveryPartner ? "/delivery/profile" : "/customer/profile"}
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 font-medium transition-colors"
                        >
                          <UserIcon className="w-4 h-4" /> My Profile
                        </Link>
                        {isDeliveryPartner ? (
                          <Link
                            to="/delivery/earnings"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 font-medium transition-colors"
                          >
                            <TrendingUp className="w-4 h-4" /> Earnings & Payouts
                          </Link>
                        ) : (
                          <Link
                            to="/customer/orders"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 font-medium transition-colors"
                          >
                            <Package className="w-4 h-4" /> Order History
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={async () => {
                            setIsProfileMenuOpen(false);
                            await logout();
                            navigate('/login');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 font-medium transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Login</span>
                </Link>
              )}

              {/* Mobile menu trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 animate-in slide-in-from-top-2 duration-150">
            {isDeliveryPartner ? (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs text-slate-600">Duty Status:</span>
                  <button
                    onClick={toggleOnlineStatus}
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      userProfile.isOnline ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {userProfile.isOnline ? 'Online' : 'Offline'}
                  </button>
                </div>
                <Link
                  to="/delivery/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-emerald-50"
                >
                  Dashboard
                </Link>
                <Link
                  to="/delivery/available"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-emerald-50"
                >
                  Available Pickups
                </Link>
                <Link
                  to="/delivery/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-emerald-50"
                >
                  My Deliveries
                </Link>
                <Link
                  to="/delivery/earnings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-emerald-50"
                >
                  Earnings
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/customer/home"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-emerald-50"
                >
                  Home
                </Link>
                <Link
                  to="/customer/products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-emerald-50"
                >
                  Browse Fresh Produce
                </Link>
                <Link
                  to="/customer/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-emerald-50"
                >
                  My Orders
                </Link>
                <Link
                  to="/customer/cart"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-emerald-50"
                >
                  <span>My Basket</span>
                  {itemCount > 0 && (
                    <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </>
            )}
          </div>
        )}
      </header>

      {/* Location Picker Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200/80 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-lg">Select Delivery Hub</h3>
              </div>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 my-3">
              We connect you with direct regional farm clusters in your immediate area for harvest-to-door delivery within 4 hours.
            </p>

            <div className="space-y-2 my-4 max-h-[60vh] overflow-y-auto pr-1">
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setSelectedCity(city);
                    setIsLocationModalOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-semibold transition-all border ${
                    selectedCity === city
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300 shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>{city}</span>
                  {selectedCity === city && <Check className="w-4 h-4 text-emerald-700" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

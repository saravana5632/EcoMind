import React, { useState, useEffect } from 'react';
import {
  Sprout,
  MapPin,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Compass,
  Menu,
  X,
  Layers,
  FileText,
  PlusCircle,
  BarChart3,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationItem, UserRole } from '../../types';
import { api } from '../../services/api';

interface NavbarProps {
  onOpenAuth: (role?: UserRole, isRegister?: boolean) => void;
  onOpenLocationModal: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenLocationModal,
  currentView,
  onNavigate,
}) => {
  const { user, role, isAuthenticated, logout, quickDemoLogin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Fetch notifications
  useEffect(() => {
    if (isAuthenticated) {
      api.getNotifications()
        .then((res) => {
          if (res.success && res.data) {
            setNotifications(Array.isArray(res.data) ? res.data : []);
          }
        })
        .catch((err) => {
          console.warn('Notifications fetch error:', err);
          setNotifications([]);
        });
    }
  }, [isAuthenticated, currentView]);

  const unreadCount = (notifications || []).filter((n) => !n?.read).length;

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => (prev || []).map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e2e8dc] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1b4332] to-[#0d281e] text-white flex items-center justify-center shadow-md">
              <Sprout className="w-6 h-6 text-[#95d5b2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-[#1b4332]">LandLink</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-[#e8f5ee] text-[#1b4332] tracking-wider border border-[#95d5b2]/40">
                  Agri 20KM
                </span>
              </div>
              <p className="text-[10px] text-stone-500 hidden sm:block">Smart Agricultural Land Rental Platform</p>
            </div>
          </div>

          {/* Location Badge (Clickable to change GPS / Radius Center) */}
          <button
            id="nav-location-pill"
            type="button"
            onClick={onOpenLocationModal}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f0f9f4] hover:bg-[#e2f4eb] border border-[#95d5b2]/60 text-[#1b4332] text-xs font-semibold transition-all cursor-pointer shadow-xs"
            title="Click to view or change your agricultural search center"
          >
            <MapPin className="w-3.5 h-3.5 text-[#2d6a4f] animate-bounce" />
            <span>
              {user?.location?.district || 'Thiruvallur'}, {user?.location?.state || 'TN'}
            </span>
            <span className="px-1.5 py-0.2 bg-[#1b4332] text-white text-[10px] rounded-full font-bold">
              20 KM Active
            </span>
          </button>

          {/* Desktop Navigation Links based on Role */}
          <nav className="hidden lg:flex items-center gap-1">
            {!isAuthenticated && (
              <>
                <button
                  onClick={() => onNavigate('home')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    currentView === 'home' ? 'text-[#1b4332] bg-[#e8f5ee] font-bold' : 'text-stone-600 hover:text-[#1b4332]'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => onNavigate('explore')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    currentView === 'explore' ? 'text-[#1b4332] bg-[#e8f5ee] font-bold' : 'text-stone-600 hover:text-[#1b4332]'
                  }`}
                >
                  Explore Lands (20 KM)
                </button>
                <button
                  onClick={() => onNavigate('how-it-works')}
                  className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-[#1b4332] rounded-lg transition-colors cursor-pointer"
                >
                  How It Works
                </button>
              </>
            )}

            {/* FARMER NAV */}
            {isAuthenticated && role === 'FARMER' && (
              <>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    currentView === 'dashboard' ? 'text-[#1b4332] bg-[#e8f5ee] font-bold' : 'text-stone-600 hover:text-[#1b4332]'
                  }`}
                >
                  🌾 Nearby Lands (&le;20 KM)
                </button>
                <button
                  onClick={() => onNavigate('my-requests')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    currentView === 'my-requests' ? 'text-[#1b4332] bg-[#e8f5ee] font-bold' : 'text-stone-600 hover:text-[#1b4332]'
                  }`}
                >
                  📋 My Rental Requests
                </button>
                <button
                  onClick={() => onNavigate('reserved')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    currentView === 'reserved' ? 'text-[#1b4332] bg-[#e8f5ee] font-bold' : 'text-stone-600 hover:text-[#1b4332]'
                  }`}
                >
                  🔒 Reserved & Active Leases
                </button>
              </>
            )}

            {/* LANDLORD NAV */}
            {isAuthenticated && role === 'LANDLORD' && (
              <>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    currentView === 'dashboard' ? 'text-[#1b4332] bg-[#e8f5ee] font-bold' : 'text-stone-600 hover:text-[#1b4332]'
                  }`}
                >
                  📊 Landlord Dashboard
                </button>
                <button
                  onClick={() => onNavigate('my-lands')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    currentView === 'my-lands' ? 'text-[#1b4332] bg-[#e8f5ee] font-bold' : 'text-stone-600 hover:text-[#1b4332]'
                  }`}
                >
                  🏡 My Farmlands
                </button>
                <button
                  onClick={() => onNavigate('add-land')}
                  className="px-3 py-1.5 text-xs font-semibold bg-[#1b4332] hover:bg-[#143627] text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[#95d5b2]" />
                  Add Agricultural Land
                </button>
                <button
                  onClick={() => onNavigate('rental-requests')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    currentView === 'rental-requests' ? 'text-[#1b4332] bg-[#e8f5ee] font-bold' : 'text-stone-600 hover:text-[#1b4332]'
                  }`}
                >
                  📬 Farmer Requests
                </button>
              </>
            )}

            {/* ADMIN NAV */}
            {isAuthenticated && role === 'ADMIN' && (
              <>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    currentView === 'dashboard' ? 'text-[#1b4332] bg-[#e8f5ee] font-bold' : 'text-stone-600 hover:text-[#1b4332]'
                  }`}
                >
                  🛡️ Admin Overview
                </button>
                <button
                  onClick={() => onNavigate('admin-analytics')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    currentView === 'admin-analytics' ? 'text-[#1b4332] bg-[#e8f5ee] font-bold' : 'text-stone-600 hover:text-[#1b4332]'
                  }`}
                >
                  📈 Analytics & Reports
                </button>
                <button
                  onClick={() => onNavigate('admin-users')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    currentView === 'admin-users' ? 'text-[#1b4332] bg-[#e8f5ee] font-bold' : 'text-stone-600 hover:text-[#1b4332]'
                  }`}
                >
                  👥 Manage Farmers & Landlords
                </button>
                <button
                  onClick={() => onNavigate('admin-lands')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    currentView === 'admin-lands' ? 'text-[#1b4332] bg-[#e8f5ee] font-bold' : 'text-stone-600 hover:text-[#1b4332]'
                  }`}
                >
                  🌾 All System Lands
                </button>
              </>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                id="btn-demo-dropdown"
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
                title="Switch test accounts instantly"
              >
                <span>⚡ Demo Roles</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {demoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#e2e8dc] py-2 z-50 animate-in fade-in">
                  <div className="px-3 py-1.5 border-b border-stone-100 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                    Instant Demo Login (1-Click)
                  </div>
                  <button
                    id="demo-login-farmer"
                    onClick={() => {
                      quickDemoLogin('FARMER');
                      setDemoDropdownOpen(false);
                      onNavigate('dashboard');
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-stone-700 hover:bg-[#e8f5ee] hover:text-[#1b4332] flex items-center gap-2"
                  >
                    <span>👨🌾</span>
                    <div>
                      <p className="font-bold">Farmer (Arun Kumar)</p>
                      <p className="text-[10px] text-stone-400">farmer@landlink.com</p>
                    </div>
                  </button>
                  <button
                    id="demo-login-landlord"
                    onClick={() => {
                      quickDemoLogin('LANDLORD');
                      setDemoDropdownOpen(false);
                      onNavigate('dashboard');
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-stone-700 hover:bg-[#e8f5ee] hover:text-[#1b4332] flex items-center gap-2"
                  >
                    <span>🏠</span>
                    <div>
                      <p className="font-bold">Landlord (Rajesh Patel)</p>
                      <p className="text-[10px] text-stone-400">landlord@landlink.com</p>
                    </div>
                  </button>
                  <button
                    id="demo-login-admin"
                    onClick={() => {
                      quickDemoLogin('ADMIN');
                      setDemoDropdownOpen(false);
                      onNavigate('dashboard');
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-stone-700 hover:bg-[#e8f5ee] hover:text-[#1b4332] flex items-center gap-2"
                  >
                    <span>🛡️</span>
                    <div>
                      <p className="font-bold">Admin (Dr. Anand)</p>
                      <p className="text-[10px] text-stone-400">admin@landlink.com</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell (when authenticated) */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  id="btn-notif-bell"
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="p-2 rounded-xl text-stone-600 hover:text-[#1b4332] hover:bg-stone-100 relative transition-colors cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#e2e8dc] py-3 z-50 animate-in fade-in">
                    <div className="px-4 pb-2 border-b border-stone-100 flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[#1b4332] flex items-center gap-1.5">
                        <Bell className="w-4 h-4 text-[#2d6a4f]" /> Notifications
                      </h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-semibold text-[#2d6a4f] hover:underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-stone-100">
                      {(notifications || []).length === 0 ? (
                        <div className="py-8 text-center text-stone-400 text-xs">No notifications yet.</div>
                      ) : (
                        (notifications || []).slice(0, 5).map((n) => (
                          <div
                            key={n.id}
                            className={`p-3 text-xs transition-colors hover:bg-stone-50 ${
                              !n.read ? 'bg-[#f0f9f4] font-medium' : 'text-stone-600'
                            }`}
                          >
                            <p className="font-semibold text-stone-900">{n.title}</p>
                            <p className="text-[11px] text-stone-600 mt-0.5">{n.message}</p>
                            <p className="text-[9px] text-stone-400 mt-1">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Authenticated User Pill / Menu */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  id="btn-user-profile-menu"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-2xl bg-[#f0f9f4] hover:bg-[#e2f4eb] transition-all cursor-pointer border border-[#95d5b2]/60"
                >
                  <img
                    src={user.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={user.name}
                    className="w-7 h-7 rounded-xl object-cover ring-1 ring-[#95d5b2]"
                  />
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-stone-900 leading-tight">{(user.name || 'User').split(' ')[0]}</p>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#1b4332]">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#e2e8dc] py-2 z-50">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs font-bold text-stone-900">{user.name}</p>
                      <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-[#e8f5ee] text-[#1b4332] border border-[#95d5b2]/40">
                        {user.role} Account
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        onNavigate('profile');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-stone-400" /> My Profile & Location
                    </button>

                    <button
                      onClick={() => {
                        onOpenLocationModal();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                    >
                      <Compass className="w-3.5 h-3.5 text-[#2d6a4f]" /> Change 20 KM Center
                    </button>

                    <div className="border-t border-stone-100 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                        onNavigate('home');
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Logged-Out Actions */
              <div className="flex items-center gap-2">
                <button
                  id="btn-login-header"
                  onClick={() => onOpenAuth('FARMER', false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:text-[#1b4332] rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Login
                </button>
                <button
                  id="btn-register-header"
                  onClick={() => onOpenAuth('FARMER', true)}
                  className="px-3.5 py-1.5 text-xs font-bold bg-[#1b4332] hover:bg-[#143627] text-white rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center gap-1"
                >
                  <span>Join LandLink</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-4 bg-white border-b border-[#e2e8dc] space-y-2">
          <button
            onClick={() => {
              onOpenLocationModal();
              setMobileMenuOpen(false);
            }}
            className="w-full py-2 px-3 rounded-xl bg-[#f0f9f4] text-[#1b4332] text-xs font-semibold flex items-center justify-between border border-[#95d5b2]/50"
          >
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#2d6a4f]" />
              Center: {user?.location?.district || 'Thiruvallur'} (20 KM Radius)
            </span>
            <span className="text-[10px] font-bold text-[#2d6a4f] underline">Change</span>
          </button>

          {isAuthenticated ? (
            <div className="space-y-1">
              <button
                onClick={() => {
                  onNavigate('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 text-xs font-semibold rounded-lg hover:bg-[#f0f9f4] text-stone-800"
              >
                Dashboard
              </button>
              {role === 'FARMER' && (
                <>
                  <button
                    onClick={() => {
                      onNavigate('my-requests');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 px-3 text-xs font-semibold rounded-lg hover:bg-[#f0f9f4] text-stone-800"
                  >
                    My Rental Requests
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('reserved');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 px-3 text-xs font-semibold rounded-lg hover:bg-[#f0f9f4] text-stone-800"
                  >
                    Reserved & Active Lands
                  </button>
                </>
              )}
              {role === 'LANDLORD' && (
                <>
                  <button
                    onClick={() => {
                      onNavigate('add-land');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 px-3 text-xs font-semibold rounded-lg text-[#1b4332] bg-[#e8f5ee]"
                  >
                    + Add Agricultural Land
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('my-lands');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 px-3 text-xs font-semibold rounded-lg hover:bg-[#f0f9f4] text-stone-800"
                  >
                    My Farmlands
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('rental-requests');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 px-3 text-xs font-semibold rounded-lg hover:bg-[#f0f9f4] text-stone-800"
                  >
                    Farmer Requests
                  </button>
                </>
              )}
              {role === 'ADMIN' && (
                <>
                  <button
                    onClick={() => {
                      onNavigate('admin-analytics');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 px-3 text-xs font-semibold rounded-lg hover:bg-[#f0f9f4] text-stone-800"
                  >
                    Analytics & Reports
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('admin-users');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 px-3 text-xs font-semibold rounded-lg hover:bg-[#f0f9f4] text-stone-800"
                  >
                    Manage Users
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  onNavigate('profile');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 text-xs font-semibold rounded-lg hover:bg-stone-100"
              >
                Profile Settings
              </button>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 text-xs font-semibold text-red-600 rounded-lg hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  onOpenAuth('FARMER', false);
                  setMobileMenuOpen(false);
                }}
                className="py-2 text-center text-xs font-semibold rounded-xl bg-stone-100 text-stone-800"
              >
                Login
              </button>
              <button
                onClick={() => {
                  onOpenAuth('FARMER', true);
                  setMobileMenuOpen(false);
                }}
                className="py-2 text-center text-xs font-bold rounded-xl bg-[#1b4332] text-white"
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

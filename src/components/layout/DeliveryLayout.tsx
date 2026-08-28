import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { DemoAccountSwitcher } from '../common/DemoAccountSwitcher';
import { 
  LayoutDashboard, 
  PackageSearch, 
  Truck, 
  TrendingUp, 
  User, 
  AlertCircle, 
  ShieldAlert,
  Power
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DeliveryLayout: React.FC = () => {
  const { userProfile, toggleOnlineStatus, demoRoleApprovedToggle } = useAuth();
  const navigate = useNavigate();

  const isPendingApproval = userProfile?.status === 'pending';

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 pb-20 sm:pb-0">
      <Navbar />

      {/* Admin Approval Notice for Delivery Partner */}
      {isPendingApproval && (
        <div className="bg-amber-500 text-slate-950 px-4 py-3 text-xs font-semibold shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>
                Account Status: <strong>Pending Approval from Admin (Application 1)</strong>. You cannot accept live trips until verified.
              </span>
            </div>
            <button
              onClick={demoRoleApprovedToggle}
              className="bg-slate-950 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shrink-0 shadow-2xs"
            >
              Simulate Admin Approval (1-Click)
            </button>
          </div>
        </div>
      )}

      {/* Offline Alert */}
      {!userProfile?.isOnline && !isPendingApproval && (
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 text-xs text-slate-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
              <span>You are currently <strong>Offline</strong>. Turn ON Duty to receive new delivery assignments.</span>
            </div>
            <button
              onClick={toggleOnlineStatus}
              className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-2xs"
            >
              <Power className="w-3 h-3" /> Go Online
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar for Logistics on the Go */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-2 flex items-center justify-around">
        <NavLink
          to="/delivery/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold transition-colors ${
              isActive ? 'text-emerald-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/delivery/available"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold transition-colors ${
              isActive ? 'text-emerald-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <PackageSearch className="w-5 h-5" />
          <span>Pickups</span>
        </NavLink>

        <NavLink
          to="/delivery/orders"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold transition-colors ${
              isActive ? 'text-emerald-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Truck className="w-5 h-5" />
          <span>My Trips</span>
        </NavLink>

        <NavLink
          to="/delivery/earnings"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold transition-colors ${
              isActive ? 'text-emerald-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <TrendingUp className="w-5 h-5" />
          <span>Earnings</span>
        </NavLink>

        <NavLink
          to="/delivery/profile"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold transition-colors ${
              isActive ? 'text-emerald-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </NavLink>
      </nav>

      <DemoAccountSwitcher />
    </div>
  );
};

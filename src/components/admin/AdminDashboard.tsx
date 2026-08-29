import React, { useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  LandItem,
  RentalRequest,
  AdminAuditLog,
  DashboardStatistics,
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Shield,
  Users,
  Home,
  Sprout,
  FileText,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Search,
  RefreshCw,
  Eye,
  Trash2,
  Lock,
  Compass,
} from 'lucide-react';

const COLORS = ['#1b4332', '#40916c', '#74c69d', '#d97706', '#2563eb', '#64748b'];

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'farmers' | 'landlords' | 'lands' | 'rentals' | 'audit'>('overview');
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [farmers, setFarmers] = useState<UserProfile[]>([]);
  const [landlords, setLandlords] = useState<UserProfile[]>([]);
  const [lands, setLands] = useState<LandItem[]>([]);
  const [rentals, setRentals] = useState<RentalRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const fetchAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, farmersRes, landlordsRes, landsRes, rentalsRes, logsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminFarmers(),
        api.getAdminLandlords(),
        api.getAdminLands(),
        api.getAdminRentals(),
        api.getAdminAuditLogs(),
      ]);

      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (farmersRes.success && farmersRes.data) setFarmers(farmersRes.data);
      if (landlordsRes.success && landlordsRes.data) setLandlords(landlordsRes.data);
      if (landsRes.success && landsRes.data) setLands(landsRes.data);
      if (rentalsRes.success && rentalsRes.data) setRentals(rentalsRes.data);
      if (logsRes.success && logsRes.data) setAuditLogs(logsRes.data);
    } catch (err: any) {
      console.warn('Admin load err:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Actions
  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.updateUserStatus(userId, nextStatus as any);
      toast.success('User Updated', `Account status set to ${nextStatus}.`);
      fetchAdminData();
    } catch (err: any) {
      toast.error('Update Failed', err.message);
    }
  };

  const handleToggleLandVerify = async (landId: string, currentVerified: boolean) => {
    try {
      await api.verifyLand(landId, !currentVerified);
      toast.success('Verification Updated', `Land title verification is now ${!currentVerified}.`);
      fetchAdminData();
    } catch (err: any) {
      toast.error('Update Failed', err.message);
    }
  };

  const handleDeleteLand = async (landId: string) => {
    if (!window.confirm('Delete this land from system?')) return;
    try {
      await api.deleteLand(landId);
      toast.success('Land Deleted', 'Land removed by administrator.');
      fetchAdminData();
    } catch (err: any) {
      toast.error('Delete Failed', err.message);
    }
  };

  const handleResetDatabase = async () => {
    if (!window.confirm('Reset the LandLink database to pristine demo seed state? All test edits will be restored.')) {
      return;
    }
    try {
      await api.resetDemoSeed();
      toast.success('Database Reset', 'Demo database restored to default seed state.');
      fetchAdminData();
    } catch (err: any) {
      toast.error('Reset Failed', err.message);
    }
  };

  // Chart data
  const statusPieData = stats
    ? [
        { name: 'Available', value: stats.availableLands },
        { name: 'Reserved', value: stats.reservedLands },
        { name: 'Rented', value: stats.rentedLands },
      ]
    : [];

  const soilBarData = stats
    ? Object.entries(stats.soilDistribution).map(([name, count]) => ({ name, count }))
    : [];

  const districtBarData = stats
    ? Object.entries(stats.regionalDistribution).map(([district, count]) => ({ district, count }))
    : [];

  // Filtered lists
  const filteredFarmers = farmers.filter(
    (f) =>
      f.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      f.email.toLowerCase().includes(searchFilter.toLowerCase()) ||
      f.location.district.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredLandlords = landlords.filter(
    (l) =>
      l.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      l.email.toLowerCase().includes(searchFilter.toLowerCase()) ||
      l.location.district.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredLands = lands.filter(
    (l) =>
      l.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      l.landCode.toLowerCase().includes(searchFilter.toLowerCase()) ||
      l.landlordName.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. ADMIN HEADER */}
      <div className="bg-[#1b4332] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#2d6a4f]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded-lg bg-[#95d5b2]/20 text-[#95d5b2] border border-[#95d5b2]/30">
              Admin Control Panel
            </span>
            <span className="text-xs text-stone-300">System Monitoring & RBAC</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1 text-white">
            System Administration & Analytics 🛡️
          </h1>
          <p className="text-xs text-stone-300">
            Real-time telemetry, user management, audit logs, and 20 KM proximity health.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAdminData}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-colors cursor-pointer"
            title="Refresh statistics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            id="btn-reset-demo-db"
            onClick={handleResetDatabase}
            className="px-4 py-2.5 bg-red-900/90 hover:bg-red-800 text-red-100 font-bold text-xs rounded-xl border border-red-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Restore fresh seed data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo DB
          </button>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-[#e2e8dc] shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500">Total Farmers</span>
          <p className="text-2xl font-black text-[#1b4332] mt-0.5">{stats?.totalFarmers ?? 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#e2e8dc] shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500">Total Landlords</span>
          <p className="text-2xl font-black text-amber-800 mt-0.5">{stats?.totalLandlords ?? 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#e2e8dc] shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500">Total Farmlands</span>
          <p className="text-2xl font-black text-stone-900 mt-0.5">{stats?.totalLands ?? 0}</p>
        </div>
        <div className="bg-[#f0f9f4] p-4 rounded-2xl border border-[#95d5b2]/60 shadow-xs">
          <span className="text-[11px] font-semibold text-[#1b4332]">Available</span>
          <p className="text-2xl font-black text-[#1b4332] mt-0.5">{stats?.availableLands ?? 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#e2e8dc] shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500">Reserved / Rented</span>
          <p className="text-2xl font-black text-blue-600 mt-0.5">
            {(stats?.reservedLands ?? 0) + (stats?.rentedLands ?? 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#e2e8dc] shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500">Total Acres</span>
          <p className="text-2xl font-black text-[#1b4332] mt-0.5">{stats?.totalAcreage ?? 0} Ac</p>
        </div>
      </div>

      {/* 3. TABS NAVIGATION */}
      <div className="flex gap-2 sm:gap-4 border-b border-[#e2e8dc] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-[#1b4332] text-[#1b4332] font-extrabold'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          Analytics & Visualizations
        </button>

        <button
          onClick={() => setActiveTab('farmers')}
          className={`pb-3 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'farmers'
              ? 'border-[#1b4332] text-[#1b4332] font-extrabold'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Farmers ({farmers.length})
        </button>

        <button
          onClick={() => setActiveTab('landlords')}
          className={`pb-3 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'landlords'
              ? 'border-[#1b4332] text-[#1b4332] font-extrabold'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Home className="w-4 h-4" />
          Landlords ({landlords.length})
        </button>

        <button
          onClick={() => setActiveTab('lands')}
          className={`pb-3 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'lands'
              ? 'border-[#1b4332] text-[#1b4332] font-extrabold'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Sprout className="w-4 h-4" />
          All Lands ({lands.length})
        </button>

        <button
          onClick={() => setActiveTab('rentals')}
          className={`pb-3 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'rentals'
              ? 'border-[#1b4332] text-[#1b4332] font-extrabold'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          Rentals & Leases ({rentals.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-[#1b4332] text-[#1b4332] font-extrabold'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* TAB CONTENT 1: ANALYTICS & VISUALIZATIONS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Farmland Status Distribution */}
            <div className="bg-white p-5 rounded-3xl border border-[#e2e8dc] shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-stone-900">Farmland Availability Breakdown</h3>
              <p className="text-xs text-stone-500">Live proportion of Available, Reserved, and Rented acreage</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      label
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Soil Types Distribution */}
            <div className="bg-white p-5 rounded-3xl border border-[#e2e8dc] shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-stone-900">Soil Types Across Registered Lands</h3>
              <p className="text-xs text-stone-500">Composition of soil classifications in platform database</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={soilBarData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" textAnchor="end" interval={0} angle={-20} tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1b4332" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Regional Hub Distribution */}
            <div className="bg-white p-5 rounded-3xl border border-[#e2e8dc] shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-stone-900">Farmlands by Agricultural District</h3>
              <p className="text-xs text-stone-500">Regional density for 20 KM clusters</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={districtBarData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="district" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2d6a4f" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Platform Verification & 20 KM Compliance Health */}
            <div className="bg-white p-5 rounded-3xl border border-[#e2e8dc] shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-stone-900">Platform Integrity & Compliance</h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-[#f0f9f4] border border-[#95d5b2]/50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#1b4332] font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-[#1b4332]" />
                    <span>20 KM Haversine Geolocation Filter</span>
                  </div>
                  <span className="px-2 py-0.5 bg-[#1b4332] text-white font-bold rounded-md text-[10px]">
                    100% ENFORCED
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#f8f9f5] border border-[#e2e8dc] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-stone-800 font-semibold">
                    <Shield className="w-4 h-4 text-[#1b4332]" />
                    <span>Role-Based Access Control (RBAC)</span>
                  </div>
                  <span className="px-2 py-0.5 bg-[#1b4332] text-white font-bold rounded-md text-[10px]">
                    ACTIVE
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50/50 border border-blue-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-950 font-semibold">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span>Double-Booking Prevention Engine</span>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-700 text-white font-bold rounded-md text-[10px]">
                    PROTECTED
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: FARMERS */}
      {activeTab === 'farmers' && (
        <div className="bg-white rounded-3xl p-6 border border-[#e2e8dc] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-stone-900">Registered Farmers</h3>
              <p className="text-xs text-stone-500">Manage farmer accounts, status, and 20 KM center locations</p>
            </div>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search farmers..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#e2e8dc] bg-[#f8f9f5] focus:ring-2 focus:ring-[#1b4332] focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e2e8dc] text-stone-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Farmer</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3">Location & Coordinates</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filteredFarmers.map((farmer) => (
                  <tr key={farmer.id} className="hover:bg-stone-50">
                    <td className="py-3 px-3">
                      <div className="font-bold text-stone-900">{farmer.name}</div>
                      <span className="text-[10px] text-stone-400">ID: {farmer.id}</span>
                    </td>
                    <td className="py-3 px-3">
                      <p>{farmer.email}</p>
                      <span className="text-[10px] text-stone-400">{farmer.phone}</span>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-stone-800">{farmer.location.village}, {farmer.location.district}</p>
                      <span className="text-[10px] text-stone-400 font-mono">
                        GPS: {farmer.location.latitude.toFixed(4)}, {farmer.location.longitude.toFixed(4)}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                          farmer.status === 'ACTIVE' ? 'bg-[#f0f9f4] text-[#1b4332] border border-[#95d5b2]/40' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {farmer.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggleUserStatus(farmer.id, farmer.status)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                          farmer.status === 'ACTIVE'
                            ? 'bg-red-50 text-red-700 hover:bg-red-100'
                            : 'bg-[#f0f9f4] text-[#1b4332] hover:bg-[#e8f5ee]'
                        }`}
                      >
                        {farmer.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: LANDLORDS */}
      {activeTab === 'landlords' && (
        <div className="bg-white rounded-3xl p-6 border border-[#e2e8dc] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-stone-900">Registered Agricultural Landowners</h3>
              <p className="text-xs text-stone-500">Manage landlords listing farmlands on LandLink</p>
            </div>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search landlords..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#e2e8dc] bg-[#f8f9f5] focus:ring-2 focus:ring-[#1b4332] focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e2e8dc] text-stone-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Landowner</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3">Base Location</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filteredLandlords.map((landlord) => (
                  <tr key={landlord.id} className="hover:bg-stone-50">
                    <td className="py-3 px-3">
                      <div className="font-bold text-stone-900">{landlord.name}</div>
                      <span className="text-[10px] text-stone-400">ID: {landlord.id}</span>
                    </td>
                    <td className="py-3 px-3">
                      <p>{landlord.email}</p>
                      <span className="text-[10px] text-stone-400">{landlord.phone}</span>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-stone-800">{landlord.location.village}, {landlord.location.district}</p>
                      <span className="text-[10px] text-stone-400 font-mono">
                        GPS: {landlord.location.latitude.toFixed(4)}, {landlord.location.longitude.toFixed(4)}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                          landlord.status === 'ACTIVE' ? 'bg-[#f0f9f4] text-[#1b4332] border border-[#95d5b2]/40' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {landlord.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggleUserStatus(landlord.id, landlord.status)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                          landlord.status === 'ACTIVE'
                            ? 'bg-red-50 text-red-700 hover:bg-red-100'
                            : 'bg-[#f0f9f4] text-[#1b4332] hover:bg-[#e8f5ee]'
                        }`}
                      >
                        {landlord.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: ALL LANDS */}
      {activeTab === 'lands' && (
        <div className="bg-white rounded-3xl p-6 border border-[#e2e8dc] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-stone-900">All System Farmlands</h3>
              <p className="text-xs text-stone-500">Verify titles, inspect details, and manage availability</p>
            </div>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search lands or code..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#e2e8dc] bg-[#f8f9f5] focus:ring-2 focus:ring-[#1b4332] focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e2e8dc] text-stone-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Code & Name</th>
                  <th className="py-2.5 px-3">Landowner</th>
                  <th className="py-2.5 px-3">Area & Rent</th>
                  <th className="py-2.5 px-3">Soil & Water</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Verification</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filteredLands.map((land) => (
                  <tr key={land.id} className="hover:bg-stone-50">
                    <td className="py-3 px-3">
                      <div className="font-bold text-stone-900">{land.name}</div>
                      <span className="text-[10px] text-stone-400 font-mono">{land.landCode} • {land.location.district}</span>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-stone-800">{land.landlordName}</p>
                      <span className="text-[10px] text-stone-400">{land.landlordPhone}</span>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-[#1b4332]">₹{land.rentAmount.toLocaleString()}/yr</p>
                      <span className="text-[10px] text-stone-500">{land.totalArea} {land.areaUnit}</span>
                    </td>
                    <td className="py-3 px-3">
                      <p>{land.soilType}</p>
                      <span className="text-[10px] text-stone-400 truncate block max-w-xs">{land.waterAvailability}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${
                          land.status === 'AVAILABLE'
                            ? 'bg-[#1b4332] text-white'
                            : land.status === 'RESERVED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {land.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggleLandVerify(land.id, land.verified)}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                          land.verified ? 'bg-[#f0f9f4] text-[#1b4332] border border-[#95d5b2]/40' : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {land.verified ? '✓ Title Verified' : 'Unverified'}
                      </button>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleDeleteLand(land.id)}
                        className="p-1 text-stone-400 hover:text-red-600 rounded cursor-pointer"
                        title="Delete land"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: RENTALS & LEASES */}
      {activeTab === 'rentals' && (
        <div className="bg-white rounded-3xl p-6 border border-[#e2e8dc] shadow-sm space-y-4">
          <h3 className="font-bold text-base text-stone-900">All System Rental Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e2e8dc] text-stone-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Farmland</th>
                  <th className="py-2.5 px-3">Farmer</th>
                  <th className="py-2.5 px-3">Landowner</th>
                  <th className="py-2.5 px-3">Rent / Term</th>
                  <th className="py-2.5 px-3">Proximity</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {rentals.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50">
                    <td className="py-3 px-3 font-semibold text-stone-900">
                      <div>{r.landName}</div>
                      <span className="text-[10px] text-stone-400">{r.landArea} {r.landAreaUnit}</span>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-stone-800">{r.farmerName}</p>
                      <span className="text-[10px] text-stone-400">{r.farmerPhone}</span>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-stone-800">{r.landlordName}</p>
                      <span className="text-[10px] text-stone-400">{r.landlordPhone}</span>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-[#1b4332]">₹{r.proposedRent.toLocaleString()}</p>
                      <span className="text-[10px] text-stone-500">{r.requestedDuration}</span>
                    </td>
                    <td className="py-3 px-3 font-bold text-[#1b4332]">
                      📍 {r.distanceKm} KM
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${
                          r.status === 'APPROVED'
                            ? 'bg-[#1b4332] text-white'
                            : r.status === 'ACTIVE'
                            ? 'bg-blue-100 text-blue-800'
                            : r.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {r.status === 'APPROVED' ? 'RESERVED' : r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl p-6 border border-[#e2e8dc] shadow-sm space-y-4">
          <h3 className="font-bold text-base text-stone-900">System Audit Trail</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e2e8dc] text-stone-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Action By</th>
                  <th className="py-2.5 px-3">Action Type</th>
                  <th className="py-2.5 px-3">Target</th>
                  <th className="py-2.5 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50">
                    <td className="py-2.5 px-3 text-stone-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-stone-900">{log.userName}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#1b4332]">{log.action}</td>
                    <td className="py-2.5 px-3 text-stone-600">{log.targetType} ({log.targetId})</td>
                    <td className="py-2.5 px-3 text-stone-800">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

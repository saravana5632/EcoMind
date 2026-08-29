import React, { useState, useEffect, useCallback } from 'react';
import {
  LandItem,
  RentalRequest,
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { AddLandModal } from './AddLandModal';
import {
  Home,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Trash2,
  MapPin,
  DollarSign,
  Phone,
  Mail,
  User,
  ShieldCheck,
  RefreshCw,
  Eye,
  AlertTriangle,
  Layers,
} from 'lucide-react';

interface LandlordDashboardProps {
  initialTab?: 'my-lands' | 'rental-requests';
}

export const LandlordDashboard: React.FC<LandlordDashboardProps> = ({
  initialTab = 'my-lands',
}) => {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'my-lands' | 'rental-requests'>(initialTab);
  const [myLands, setMyLands] = useState<LandItem[]>([]);
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [isAddLandModalOpen, setIsAddLandModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLandlordData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [landsRes, reqsRes] = await Promise.all([
        api.getMyLands(),
        api.getLandlordRequests(),
      ]);

      if (landsRes.success && landsRes.data) {
        setMyLands(Array.isArray(landsRes.data) ? landsRes.data : []);
      }
      if (reqsRes.success && reqsRes.data) {
        setRequests(Array.isArray(reqsRes.data) ? reqsRes.data : []);
      }
    } catch (err: any) {
      console.warn('Error loading landlord dashboard:', err);
      setMyLands([]);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLandlordData();
  }, [fetchLandlordData]);

  // Statistics calculation
  const totalLandsCount = myLands.length;
  const availableCount = myLands.filter((l) => l.status === 'AVAILABLE').length;
  const reservedCount = myLands.filter((l) => l.status === 'RESERVED').length;
  const rentedCount = myLands.filter((l) => l.status === 'RENTED').length;
  const pendingRequestsCount = requests.filter((r) => r.status === 'PENDING').length;
  const totalAnnualRevenue = myLands
    .filter((l) => l.status === 'RENTED' || l.status === 'RESERVED')
    .reduce((acc, l) => acc + l.rentAmount, 0);

  // Land Actions
  const handleDeleteLand = async (landId: string) => {
    if (!window.confirm('Are you sure you want to delete this agricultural land listing?')) return;
    try {
      await api.deleteLand(landId);
      toast.success('Land Deleted', 'Listing removed from marketplace.');
      fetchLandlordData();
    } catch (err: any) {
      toast.error('Deletion Failed', err.message);
    }
  };

  const handleUpdateStatus = async (landId: string, status: any) => {
    try {
      await api.updateLand(landId, { status });
      toast.success('Status Updated', `Land status changed to ${status}.`);
      fetchLandlordData();
    } catch (err: any) {
      toast.error('Update Failed', err.message);
    }
  };

  // Rental Request Actions
  const handleApproveRequest = async (requestId: string) => {
    try {
      const res = await api.approveRequest(requestId, 'Rental request approved by landowner.');
      if (res.success) {
        toast.success(
          'Proposal Approved!',
          'Land is now held in RESERVED status for this farmer, preventing duplicate bookings.'
        );
        fetchLandlordData();
      }
    } catch (err: any) {
      toast.error('Approval Error', err.message);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const reason = window.prompt('Reason for declining this proposal (optional):') || undefined;
    try {
      const res = await api.rejectRequest(requestId, reason);
      if (res.success) {
        toast.info('Proposal Declined', 'Farmer has been notified.');
        fetchLandlordData();
      }
    } catch (err: any) {
      toast.error('Rejection Error', err.message);
    }
  };

  const handleStartRentalLease = async (requestId: string) => {
    try {
      const res = await api.startRentalLease(requestId);
      if (res.success) {
        toast.success('Lease Active!', 'Plot status transitioned to RENTED. Farming lease has commenced.');
        fetchLandlordData();
      }
    } catch (err: any) {
      toast.error('Lease Start Error', err.message);
    }
  };

  const handleCompleteRentalLease = async (requestId: string) => {
    if (!window.confirm('Conclude this rental lease? The land will automatically become AVAILABLE for nearby farmers.')) {
      return;
    }
    try {
      const res = await api.completeRentalLease(requestId);
      if (res.success) {
        toast.success('Lease Completed', 'Land has been returned to AVAILABLE status.');
        fetchLandlordData();
      }
    } catch (err: any) {
      toast.error('Lease Completion Error', err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. TOP STATS BAR */}
      <div className="bg-white rounded-3xl p-6 border border-[#e2e8dc] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded-lg bg-[#e8f5ee] text-[#1b4332] border border-[#95d5b2]/40">
              Landlord Portal
            </span>
            <span className="text-xs text-stone-500 font-medium">Agricultural Land Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
            Welcome, {user?.name || 'Landowner'} 🏠
          </h1>
          <p className="text-xs text-stone-500">
            Manage farmlands and approve rental proposals from verified local farmers within 20 KM.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLandlordData}
            className="p-2.5 text-stone-600 hover:text-stone-900 hover:bg-[#e8f5ee] rounded-xl border border-[#e2e8dc] transition-colors cursor-pointer"
            title="Refresh dashboard data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            id="btn-add-farmland-header"
            onClick={() => setIsAddLandModalOpen(true)}
            className="px-5 py-3 bg-[#1b4332] hover:bg-[#143627] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            + Add Agricultural Land
          </button>
        </div>
      </div>

      {/* 2. STATS CARDS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-[#e2e8dc] shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500">Total Farmlands</span>
          <p className="text-2xl font-black text-stone-900 mt-0.5">{totalLandsCount}</p>
        </div>

        <div className="bg-[#f0f9f4] p-4 rounded-2xl border border-[#95d5b2]/60 shadow-xs">
          <span className="text-[11px] font-semibold text-[#1b4332]">Available</span>
          <p className="text-2xl font-black text-[#1b4332] mt-0.5">{availableCount}</p>
        </div>

        <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-800">Reserved</span>
          <p className="text-2xl font-black text-amber-700 mt-0.5">{reservedCount}</p>
        </div>

        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-200 shadow-xs">
          <span className="text-[11px] font-semibold text-blue-800">Actively Rented</span>
          <p className="text-2xl font-black text-blue-700 mt-0.5">{rentedCount}</p>
        </div>

        <div className="bg-red-50/50 p-4 rounded-2xl border border-red-200 shadow-xs">
          <span className="text-[11px] font-semibold text-red-800">Pending Requests</span>
          <p className="text-2xl font-black text-red-600 mt-0.5">{pendingRequestsCount}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#e2e8dc] shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500">Active Lease Rent</span>
          <p className="text-xl font-black text-[#1b4332] mt-0.5">₹{totalAnnualRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* 3. TABS */}
      <div className="flex gap-4 border-b border-[#e2e8dc] pb-2">
        <button
          id="tab-my-farmlands"
          onClick={() => setActiveTab('my-lands')}
          className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'my-lands'
              ? 'border-[#1b4332] text-[#1b4332] font-extrabold'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Home className="w-4 h-4" />
          My Farmlands ({myLands.length})
        </button>

        <button
          id="tab-rental-proposals"
          onClick={() => setActiveTab('rental-requests')}
          className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer relative ${
            activeTab === 'rental-requests'
              ? 'border-[#1b4332] text-[#1b4332] font-extrabold'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          Farmer Rental Proposals ({requests.length})
          {pendingRequestsCount > 0 && (
            <span className="px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[10px] font-bold">
              {pendingRequestsCount} new
            </span>
          )}
        </button>
      </div>

      {/* TAB CONTENT: MY FARMLANDS */}
      {activeTab === 'my-lands' && (
        <div className="space-y-4">
          {myLands.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#e2e8dc] space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#f0f9f4] text-[#1b4332] flex items-center justify-center mx-auto text-2xl">
                🌾
              </div>
              <div>
                <h3 className="font-bold text-stone-800 text-base">You haven't listed any agricultural land yet.</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                  List your farmland so verified farmers within 20 KM can discover and send rental proposals.
                </p>
              </div>
              <button
                onClick={() => setIsAddLandModalOpen(true)}
                className="px-5 py-2.5 bg-[#1b4332] hover:bg-[#143627] text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                + Add Your First Farmland
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myLands.map((land) => (
                <div
                  key={land.id}
                  className="bg-white rounded-2xl overflow-hidden border border-[#e2e8dc] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="h-44 relative bg-stone-100">
                      <img
                        src={land.images[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600'}
                        alt={land.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md shadow-xs ${
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
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#081c15]/85 text-[#95d5b2] backdrop-blur-xs flex items-center gap-1 border border-[#95d5b2]/30">
                            <ShieldCheck className="w-3 h-3 text-[#95d5b2]" />
                            Verified
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-stone-950/80 text-white text-[10px] rounded-md font-mono">
                        {land.landCode}
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs text-stone-500">
                          <span>
                            {land.totalArea} {land.areaUnit}
                          </span>
                          <span className="font-bold text-[#1b4332]">₹{land.rentAmount.toLocaleString()}/yr</span>
                        </div>
                        <h3 className="font-bold text-sm text-stone-900 mt-0.5 line-clamp-1">{land.name}</h3>
                        <p className="text-xs text-stone-500 mt-0.5">
                          📍 {land.location.village}, {land.location.district}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 text-[11px] text-stone-600 bg-[#f8f9f5] p-2 rounded-xl border border-[#e2e8dc]">
                        <div>🌱 {land.soilType || 'Loamy'}</div>
                        <div className="truncate">💧 {land.waterAvailability ? land.waterAvailability.split(' ')[0] : 'Available'}</div>
                        <div className="truncate">⚡ {land.electricityAvailability ? land.electricityAvailability.split(' ')[0] : 'Available'}</div>
                        <div className="truncate">🌾 {(land.suitableCrops || []).slice(0, 2).join(', ') || 'Various'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-[#e2e8dc] mt-2 space-y-2">
                    {/* Status Changer Bar */}
                    <div className="flex items-center justify-between text-xs pt-2">
                      <span className="text-[11px] text-stone-500">Quick Status:</span>
                      <select
                        value={land.status}
                        onChange={(e) => handleUpdateStatus(land.id, e.target.value)}
                        className="px-2 py-1 text-xs rounded-lg border border-[#e2e8dc] bg-white font-semibold focus:ring-2 focus:ring-[#1b4332] focus:outline-none"
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="RESERVED">RESERVED</option>
                        <option value="RENTED">RENTED</option>
                        <option value="MAINTENANCE">MAINTENANCE</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => handleDeleteLand(land.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <span className="text-[10px] text-stone-400 font-mono">
                        GPS: {land.location.latitude.toFixed(4)}, {land.location.longitude.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: FARMER RENTAL REQUESTS */}
      {activeTab === 'rental-requests' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-[#e2e8dc] shadow-sm space-y-4">
            <div>
              <h2 className="text-xl font-bold text-stone-900">Rental Proposals from Nearby Farmers</h2>
              <p className="text-xs text-stone-500">
                Farmers within your 20 KM radius can request rental reservations. Review proposals and approve to hold plots.
              </p>
            </div>

            {requests.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-xs">
                No rental proposals received yet.
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      req.status === 'PENDING'
                        ? 'border-amber-300 bg-amber-50/40 shadow-xs'
                        : req.status === 'APPROVED'
                        ? 'border-[#95d5b2] bg-[#f0f9f4]'
                        : req.status === 'ACTIVE'
                        ? 'border-blue-300 bg-blue-50/30'
                        : 'border-[#e2e8dc] bg-[#f8f9f5] opacity-75'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e2e8dc]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 text-xs font-bold uppercase rounded-lg ${
                              req.status === 'PENDING'
                                ? 'bg-amber-600 text-white animate-pulse'
                                : req.status === 'APPROVED'
                                ? 'bg-[#1b4332] text-white'
                                : req.status === 'ACTIVE'
                                ? 'bg-blue-600 text-white'
                                : req.status === 'COMPLETED'
                                ? 'bg-stone-700 text-white'
                                : 'bg-red-600 text-white'
                            }`}
                          >
                            {req.status === 'APPROVED' ? 'RESERVED FOR FARMER' : req.status}
                          </span>
                          <span className="text-xs font-semibold text-[#1b4332]">
                            📍 20 KM Verified: <strong>{req.distanceKm} KM</strong> from farmland
                          </span>
                        </div>
                        <h3 className="font-black text-base text-stone-900 mt-1">
                          Farmland: {req.landName} ({req.landArea} {req.landAreaUnit})
                        </h3>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-stone-500">Proposed Rent:</span>
                        <p className="text-lg font-black text-[#1b4332]">₹{req.proposedRent.toLocaleString()}/yr</p>
                        <span className="text-[11px] text-stone-500">Duration: {req.requestedDuration}</span>
                      </div>
                    </div>

                    {/* Farmer details & proposal specifics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 py-3 text-xs">
                      <div className="bg-white p-3 rounded-xl border border-[#e2e8dc] space-y-1">
                        <span className="text-stone-400 text-[10px] uppercase font-bold">Farmer Profile</span>
                        <p className="font-bold text-stone-900">{req.farmerName}</p>
                        <p className="text-stone-600 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-stone-400" /> {req.farmerPhone}
                        </p>
                        <p className="text-stone-600 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-stone-400" /> {req.farmerEmail}
                        </p>
                        <p className="text-[11px] text-stone-500">
                          📍 {req.farmerLocation.village}, {req.farmerLocation.district}
                        </p>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-[#e2e8dc] space-y-1">
                        <span className="text-stone-400 text-[10px] uppercase font-bold">Crop & Schedule</span>
                        <p className="font-bold text-[#1b4332]">🌾 {req.purposeCrop}</p>
                        <p className="text-stone-600">Start Date: <strong>{req.requestedStartDate}</strong></p>
                        {req.requestedEndDate && <p className="text-stone-600">End Date: {req.requestedEndDate}</p>}
                        <p className="text-[10px] text-stone-400">Soil: {req.landSoilType}</p>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-[#e2e8dc] space-y-1">
                        <span className="text-stone-400 text-[10px] uppercase font-bold">Farmer's Message</span>
                        <p className="text-stone-700 italic text-[11px] line-clamp-3">
                          "{req.notes || 'Looking forward to a productive agricultural lease season.'}"
                        </p>
                      </div>
                    </div>

                    {/* Action Bar based on Status */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-[10px] text-stone-400">
                        Received on {new Date(req.createdAt).toLocaleString()}
                      </span>

                      <div className="flex items-center gap-2">
                        {req.status === 'PENDING' && (
                          <>
                            <button
                              id={`btn-reject-req-${req.id}`}
                              onClick={() => handleRejectRequest(req.id)}
                              className="px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                            >
                              Decline
                            </button>
                            <button
                              id={`btn-approve-req-${req.id}`}
                              onClick={() => handleApproveRequest(req.id)}
                              className="px-4 py-2 bg-[#1b4332] hover:bg-[#143627] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approve Request & Hold Plot (RESERVED)
                            </button>
                          </>
                        )}

                        {req.status === 'APPROVED' && (
                          <button
                            id={`btn-start-lease-${req.id}`}
                            onClick={() => handleStartRentalLease(req.id)}
                            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5" />
                            Commence Active Lease (Mark RENTED)
                          </button>
                        )}

                        {req.status === 'ACTIVE' && (
                          <button
                            id={`btn-complete-lease-${req.id}`}
                            onClick={() => handleCompleteRentalLease(req.id)}
                            className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Conclude Lease & Return to AVAILABLE
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Farmland Modal */}
      <AddLandModal
        isOpen={isAddLandModalOpen}
        onClose={() => setIsAddLandModalOpen(false)}
        onLandAdded={() => {
          fetchLandlordData();
          setActiveTab('my-lands');
        }}
      />
    </div>
  );
};

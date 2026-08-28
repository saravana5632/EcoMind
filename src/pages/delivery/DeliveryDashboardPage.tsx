import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Truck, 
  PackageCheck, 
  Clock, 
  IndianRupee, 
  Power, 
  MapPin, 
  Navigation, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  BarChart3
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { Order } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  subscribeToAvailableOrders, 
  subscribeToDeliveryPartnerOrders,
  updateOrderStatus
} from '../../services/orderService';
import { AcceptOrderModal } from '../../components/delivery/AcceptOrderModal';

export const DeliveryDashboardPage: React.FC = () => {
  const { userProfile, toggleOnlineStatus, demoRoleApprovedToggle } = useAuth();
  const navigate = useNavigate();

  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [selectedOrderForAccept, setSelectedOrderForAccept] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const partnerId = userProfile?.uid || 'guest_delivery_123';
  const isPending = userProfile?.status === 'pending';
  const isOnline = !!userProfile?.isOnline;

  useEffect(() => {
    const unsubAvail = subscribeToAvailableOrders((data) => {
      setAvailableOrders(data);
    });

    const unsubMy = subscribeToDeliveryPartnerOrders(partnerId, (data) => {
      setMyOrders(data);
      setLoading(false);
    });

    return () => {
      unsubAvail();
      unsubMy();
    };
  }, [partnerId]);

  // Derived metrics
  const activeOrders = myOrders.filter(
    (o) => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled'
  );
  const completedOrders = myOrders.filter((o) => o.orderStatus === 'delivered');

  // Simulated earnings: ₹55 per delivery
  const todayEarnings = completedOrders.length * 55;

  // Chart data for weekly delivery performance
  const chartData = [
    { day: 'Mon', trips: 8, earnings: 440 },
    { day: 'Tue', trips: 12, earnings: 660 },
    { day: 'Wed', trips: 10, earnings: 550 },
    { day: 'Thu', trips: 15, earnings: 825 },
    { day: 'Fri', trips: 14, earnings: 770 },
    { day: 'Sat', trips: 18, earnings: 990 },
    { day: 'Today', trips: completedOrders.length || 6, earnings: todayEarnings || 330 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Online/Offline Switch & Identity */}
      <div className="bg-stone-900 rounded-3xl p-5 sm:p-6 border border-stone-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-xl shadow-lg">
              <Truck className="w-7 h-7" />
            </div>
            <span
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-stone-900 ${
                isOnline ? 'bg-emerald-500' : 'bg-stone-500'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                {userProfile?.name || 'Logistics Partner'}
              </h1>
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                {userProfile?.vehicleType || 'Eco 2-Wheeler'}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Service Area: <strong>{userProfile?.serviceArea || 'South Bengaluru'}</strong> • Reg: {userProfile?.vehicleNumber || 'KA-01-EQ-4421'}
            </p>
          </div>
        </div>

        {/* On-Duty / Off-Duty Big Switch */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleOnlineStatus}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 ${
              isOnline
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/40 ring-2 ring-emerald-500/30'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isOnline ? 'On Duty (Online)' : 'Off Duty (Offline)'}</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Today's Deliveries */}
        <div className="bg-stone-900/90 rounded-3xl p-4 sm:p-5 border border-stone-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Today's Trips</span>
            <div className="p-2 rounded-xl bg-stone-800 text-amber-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {completedOrders.length}
            </span>
            <span className="text-[11px] text-stone-400 block mt-0.5">Dispatched & Closed</span>
          </div>
        </div>

        {/* Active Ongoing Trips */}
        <div className="bg-stone-900/90 rounded-3xl p-4 sm:p-5 border border-stone-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Active In Transit</span>
            <div className="p-2 rounded-xl bg-emerald-950/60 text-emerald-400">
              <Navigation className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
              {activeOrders.length}
            </span>
            <span className="text-[11px] text-stone-400 block mt-0.5">Assigned to you</span>
          </div>
        </div>

        {/* Available Pickups */}
        <div className="bg-stone-900/90 rounded-3xl p-4 sm:p-5 border border-stone-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Available Pickups</span>
            <div className="p-2 rounded-xl bg-amber-950/60 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {availableOrders.length}
            </span>
            <span className="text-[11px] text-stone-400 block mt-0.5">Ready for claiming</span>
          </div>
        </div>

        {/* Today's Earnings */}
        <div className="bg-gradient-to-br from-emerald-950 to-stone-900 rounded-3xl p-4 sm:p-5 border border-emerald-800/60 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Today's Earnings</span>
            <div className="p-2 rounded-xl bg-emerald-800 text-white">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              ₹{todayEarnings}
            </span>
            <span className="text-[11px] text-emerald-300/80 block mt-0.5">₹55 / completed drop</span>
          </div>
        </div>
      </div>

      {/* Active Trip Action Card (If partner has an ongoing trip) */}
      {activeOrders.length > 0 && (
        <div className="bg-gradient-to-r from-amber-950/50 via-stone-900 to-stone-900 rounded-3xl p-5 sm:p-6 border border-amber-500/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                Ongoing Active Delivery ({activeOrders.length})
              </h3>
            </div>
            <Link
              to={`/delivery/orders/${activeOrders[0].id}`}
              className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>Full Route Controls</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-stone-950/80 rounded-2xl p-4 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400">
                  #{activeOrders[0].orderId}
                </span>
                <span className="text-xs text-stone-300 font-bold">
                  {activeOrders[0].customerName}
                </span>
                <span className="bg-stone-800 text-[10px] text-stone-300 px-2 py-0.5 rounded font-mono">
                  {activeOrders[0].orderStatus.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-stone-400 truncate flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{activeOrders[0].deliveryAddress}, {activeOrders[0].city}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                to={`/delivery/orders/${activeOrders[0].id}`}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase tracking-wider text-center shadow-md active:scale-95 transition-all"
              >
                Open Trip Controller
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Available Pickups & Weekly Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Live Available Pickups Queue (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Available Farm Pickups</span>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-mono font-bold px-2 py-0.5 rounded-full">
                  {availableOrders.length} Ready
                </span>
              </h2>
              <p className="text-xs text-stone-400">Orders placed by customers awaiting transport</p>
            </div>

            <Link
              to="/delivery/available"
              className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {availableOrders.length === 0 ? (
            <div className="bg-stone-900/60 rounded-3xl p-8 border border-stone-800 text-center">
              <CheckCircle2 className="w-10 h-10 text-stone-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-stone-300">All Farm Orders Dispatched</h4>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                No orders are currently waiting. Stay online and new customer orders will appear automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableOrders.slice(0, 3).map((order) => {
                const pickupLoc = order.items[0]?.location || 'Regional Farm Hub';
                const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

                return (
                  <div
                    key={order.id}
                    className="bg-stone-900 rounded-3xl p-4 sm:p-5 border border-stone-800 hover:border-stone-700 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                      <div>
                        <span className="text-xs font-mono font-bold text-emerald-400">#{order.orderId}</span>
                        <span className="text-[11px] text-stone-400 ml-2">Slot: {order.deliverySlot}</span>
                      </div>
                      <span className="text-xs font-extrabold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-xl border border-amber-800/40">
                        ₹55 Payout
                      </span>
                    </div>

                    {/* Route Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800/80">
                        <span className="text-[10px] text-amber-400 uppercase font-semibold block">Pickup Origin</span>
                        <p className="font-bold text-stone-200 truncate">{pickupLoc}</p>
                      </div>

                      <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800/80">
                        <span className="text-[10px] text-emerald-400 uppercase font-semibold block">Drop Address</span>
                        <p className="font-bold text-stone-200 truncate">{order.deliveryAddress}</p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-stone-400 font-medium">
                        {itemCount} produce items • {order.items.length} crops
                      </span>

                      <button
                        disabled={isPending}
                        onClick={() => setSelectedOrderForAccept(order)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider shadow-md active:scale-95 transition-all"
                      >
                        Accept Trip
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Weekly Logistics Performance (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-stone-900 rounded-3xl p-5 border border-stone-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Weekly Trip Performance</h3>
              </div>
              <span className="text-[11px] text-stone-400">Last 7 Days</span>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="day" stroke="#78716c" fontSize={10} tickLine={false} />
                  <YAxis stroke="#78716c" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1c1917',
                      borderColor: '#44403c',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                  <Bar dataKey="trips" fill="#10b981" radius={[4, 4, 0, 0]} name="Deliveries" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-2 border-t border-stone-800 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2 bg-stone-950 rounded-xl">
                <span className="text-[10px] text-stone-400 uppercase block">Weekly Volume</span>
                <span className="font-bold text-white">83 Farm Trips</span>
              </div>
              <div className="p-2 bg-stone-950 rounded-xl">
                <span className="text-[10px] text-stone-400 uppercase block">Total Payout</span>
                <span className="font-bold text-emerald-400">₹4,565.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accept Modal */}
      {selectedOrderForAccept && (
        <AcceptOrderModal
          order={selectedOrderForAccept}
          isOpen={true}
          onClose={() => setSelectedOrderForAccept(null)}
          onSuccess={(orderId) => {
            setSelectedOrderForAccept(null);
            navigate(`/delivery/orders/${orderId}`);
          }}
        />
      )}
    </div>
  );
};

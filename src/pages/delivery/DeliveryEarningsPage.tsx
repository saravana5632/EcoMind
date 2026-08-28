import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, 
  TrendingUp, 
  Calendar, 
  Award, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Download,
  ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { Order } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { subscribeToDeliveryPartnerOrders } from '../../services/orderService';

export const DeliveryEarningsPage: React.FC = () => {
  const { userProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const partnerId = userProfile?.uid || 'guest_delivery_123';

  useEffect(() => {
    const unsub = subscribeToDeliveryPartnerOrders(partnerId, (data) => {
      setOrders(data);
      setLoading(false);
    });

    return () => unsub();
  }, [partnerId]);

  const completed = orders.filter((o) => o.orderStatus === 'delivered');
  const todayEarnings = completed.length * 55;
  const weeklyEarnings = 4565 + todayEarnings;
  const monthlyEarnings = 18450 + todayEarnings;

  const chartData = [
    { day: 'Mon', earnings: 440 },
    { day: 'Tue', earnings: 660 },
    { day: 'Wed', earnings: 550 },
    { day: 'Thu', earnings: 825 },
    { day: 'Fri', earnings: 770 },
    { day: 'Sat', earnings: 990 },
    { day: 'Sun (Today)', earnings: todayEarnings || 330 },
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-800 gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/40">
            Partner Payout Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Earnings & Payouts
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Transparent trip-by-trip compensation directly linked to completed farm deliveries
          </p>
        </div>

        <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-bold transition-colors self-start sm:self-auto">
          <Download className="w-3.5 h-3.5" />
          <span>Download Statement</span>
        </button>
      </div>

      {/* 3 Overview Payout Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Today */}
        <div className="bg-stone-900 rounded-3xl p-5 border border-stone-800 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-stone-400">Today's Payout</span>
            <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white">₹{todayEarnings}</span>
            <span className="text-[11px] text-emerald-400 block mt-1">
              {completed.length} completed trips today
            </span>
          </div>
        </div>

        {/* This Week */}
        <div className="bg-stone-900 rounded-3xl p-5 border border-stone-800 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-stone-400">This Week</span>
            <div className="p-2 rounded-xl bg-amber-950 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white">₹{weeklyEarnings}</span>
            <span className="text-[11px] text-stone-400 block mt-1">
              83 trips (₹55 base + speed incentive)
            </span>
          </div>
        </div>

        {/* This Month */}
        <div className="bg-stone-900 rounded-3xl p-5 border border-stone-800 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-stone-400">This Month</span>
            <div className="p-2 rounded-xl bg-purple-950 text-purple-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white">₹{monthlyEarnings}</span>
            <span className="text-[11px] text-purple-400 block mt-1">
              Direct Weekly Bank Transfer Active
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-stone-900 rounded-3xl p-6 border border-stone-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div>
            <h3 className="text-sm font-bold text-white">Weekly Earnings Trend</h3>
            <p className="text-[11px] text-stone-400">Daily breakdown for current settlement cycle</p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400">₹55.00 Avg / Order</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#78716c" fontSize={11} tickLine={false} />
              <YAxis stroke="#78716c" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1c1917',
                  borderColor: '#44403c',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Area type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#earnGrad)" name="Payout (₹)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payout Structure Breakdown */}
      <div className="bg-stone-900 rounded-3xl p-6 border border-stone-800 space-y-4">
        <h3 className="text-sm font-bold text-white pb-3 border-b border-stone-800">
          EcoMind Fresh Partner Incentive Structure
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800">
            <span className="text-stone-400 block text-[10px] uppercase font-bold">Base Delivery Fare</span>
            <span className="text-lg font-extrabold text-white mt-1 block">₹40.00</span>
            <p className="text-[11px] text-stone-500 mt-1">Guaranteed per farm pickup and customer drop.</p>
          </div>

          <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800">
            <span className="text-emerald-400 block text-[10px] uppercase font-bold">Eco EV / Zero Carbon Bonus</span>
            <span className="text-lg font-extrabold text-emerald-400 mt-1 block">+₹10.00</span>
            <p className="text-[11px] text-stone-500 mt-1">Awarded for clean energy vehicle transport.</p>
          </div>

          <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800">
            <span className="text-amber-400 block text-[10px] uppercase font-bold">Freshness Speed Reward</span>
            <span className="text-lg font-extrabold text-amber-400 mt-1 block">+₹5.00</span>
            <p className="text-[11px] text-stone-500 mt-1">For drops completed under 45 minutes.</p>
          </div>
        </div>
      </div>

      {/* Recent Payout Records */}
      <div className="bg-stone-900 rounded-3xl p-6 border border-stone-800 space-y-4">
        <h3 className="text-sm font-bold text-white pb-3 border-b border-stone-800">
          Recent Completed Trips
        </h3>

        {completed.length === 0 ? (
          <p className="text-xs text-stone-500 py-4 text-center">No completed delivery trips yet.</p>
        ) : (
          <div className="divide-y divide-stone-800 text-xs">
            {completed.map((o) => (
              <div key={o.id} className="py-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Trip #{o.orderId} • {o.customerName}</p>
                    <p className="text-[11px] text-stone-400">{o.deliveryAddress}, {o.city}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-400 text-sm block">+₹55.00</span>
                  <span className="text-[10px] text-stone-500">Credited</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

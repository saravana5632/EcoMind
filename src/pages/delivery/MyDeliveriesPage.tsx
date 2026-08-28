import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Truck, 
  PackageCheck, 
  MapPin, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  IndianRupee,
  Navigation,
  Calendar
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { subscribeToDeliveryPartnerOrders } from '../../services/orderService';

export const MyDeliveriesPage: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  const partnerId = userProfile?.uid || 'guest_delivery_123';

  useEffect(() => {
    const unsub = subscribeToDeliveryPartnerOrders(partnerId, (data) => {
      setOrders(data);
      setLoading(false);
    });

    return () => unsub();
  }, [partnerId]);

  const activeOrders = orders.filter(
    (o) => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled'
  );
  const completedOrders = orders.filter((o) => o.orderStatus === 'delivered');

  const displayedOrders = activeTab === 'active' ? activeOrders : completedOrders;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed':
        return <span className="bg-blue-950 text-blue-400 border border-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Assigned</span>;
      case 'preparing':
      case 'ready_for_pickup':
        return <span className="bg-purple-950 text-purple-400 border border-purple-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Farm Packing</span>;
      case 'picked_up':
        return <span className="bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Picked Up</span>;
      case 'out_for_delivery':
        return <span className="bg-emerald-500 text-stone-950 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full animate-pulse">Out for Delivery</span>;
      case 'delivered':
        return <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Delivered</span>;
      default:
        return <span className="bg-stone-800 text-stone-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-800 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            My Delivery Trips
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Manage your claimed farm produce routes and dispatch logs
          </p>
        </div>

        <Link
          to="/delivery/available"
          className="text-xs font-bold text-amber-400 hover:underline"
        >
          + Pick New Available Trips
        </Link>
      </div>

      {/* Tabs [ Active Trips (2) ] [ Completed Trips (14) ] */}
      <div className="p-1 rounded-2xl bg-stone-900 border border-stone-800 grid grid-cols-2 gap-1">
        <button
          onClick={() => setActiveTab('active')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'active'
              ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Active Trips ({activeOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'completed'
              ? 'bg-stone-800 text-white shadow-md font-extrabold'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Completed History ({completedOrders.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-amber-400 mb-2" />
          <p className="text-xs text-stone-400">Loading delivery records...</p>
        </div>
      ) : displayedOrders.length === 0 ? (
        <div className="py-20 text-center bg-stone-900/60 rounded-3xl border border-stone-800 p-8 max-w-md mx-auto">
          {activeTab === 'active' ? (
            <>
              <Truck className="w-12 h-12 text-stone-600 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white">No Active Trips In Progress</h3>
              <p className="text-xs text-stone-400 mt-1">Accept available orders from the queue to start delivering.</p>
              <Link
                to="/delivery/available"
                className="mt-4 inline-block px-4 py-2 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold uppercase tracking-wider"
              >
                Find Pickups
              </Link>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-12 h-12 text-stone-600 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white">No Completed Deliveries Yet</h3>
              <p className="text-xs text-stone-400 mt-1">Completed drops and payouts will be listed here.</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayedOrders.map((order) => {
            const pickupLoc = order.items[0]?.location || 'Regional Farm Hub';
            const totalItemsCount = order.items.reduce((s, i) => s + i.quantity, 0);

            return (
              <div
                key={order.id}
                onClick={() => navigate(`/delivery/orders/${order.id}`)}
                className="bg-stone-900 rounded-3xl p-5 border border-stone-800 hover:border-stone-700 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      #{order.orderId}
                    </span>
                    <span className="text-xs text-stone-300 font-bold">
                      {order.customerName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.orderStatus)}
                    <span className="text-xs font-mono font-extrabold text-emerald-400">
                      ₹55 Payout
                    </span>
                  </div>
                </div>

                {/* Locations */}
                <div className="my-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800/60 flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-[10px] text-stone-500 uppercase block font-bold">Pickup Hub</span>
                      <p className="text-stone-300 truncate">{pickupLoc}</p>
                    </div>
                  </div>

                  <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800/60 flex items-start gap-2">
                    <Navigation className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-[10px] text-stone-500 uppercase block font-bold">Destination</span>
                      <p className="text-stone-300 truncate">{order.deliveryAddress}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-stone-400">
                    Produce: <strong>{totalItemsCount} items</strong> • Slot: {order.deliverySlot}
                  </span>

                  <div className="flex items-center gap-1 text-amber-400 group-hover:translate-x-1 transition-transform font-bold">
                    <span>{activeTab === 'active' ? 'Manage Route' : 'View Summary'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

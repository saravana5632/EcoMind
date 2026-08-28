import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PackageSearch, 
  MapPin, 
  Navigation, 
  Clock, 
  IndianRupee, 
  RefreshCw, 
  ShieldAlert, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Order } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { subscribeToAvailableOrders } from '../../services/orderService';
import { AcceptOrderModal } from '../../components/delivery/AcceptOrderModal';

export const AvailableDeliveriesPage: React.FC = () => {
  const { userProfile, demoRoleApprovedToggle } = useAuth();
  const navigate = useNavigate();

  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const isPendingApproval = userProfile?.status === 'pending';

  useEffect(() => {
    const unsub = subscribeToAvailableOrders((data) => {
      setAvailableOrders(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-800 gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-800/40">
            Real-Time Logistics Pool
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Available Farm Deliveries
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Claim unassigned farm harvests and begin door delivery trips
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs text-stone-400 block">Queue Status</span>
          <span className="text-base font-extrabold text-emerald-400">
            {availableOrders.length} Trips Available
          </span>
        </div>
      </div>

      {isPendingApproval && (
        <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              Your profile is pending approval from <strong>EcoMind Agri Admin</strong>. You must be verified before accepting live trips.
            </span>
          </div>
          <button
            onClick={demoRoleApprovedToggle}
            className="px-3 py-1.5 rounded-xl bg-amber-400 text-stone-950 font-bold text-xs hover:bg-amber-300 transition-colors shrink-0"
          >
            Simulate Admin Approval
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-emerald-400 mb-2" />
          <p className="text-xs text-stone-400">Scanning Firestore orders collection for unassigned trips...</p>
        </div>
      ) : availableOrders.length === 0 ? (
        <div className="py-20 text-center bg-stone-900/60 rounded-3xl border border-stone-800 p-8 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-stone-800 text-stone-500 flex items-center justify-center mx-auto mb-3">
            <PackageSearch className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No Pending Orders in Queue</h3>
          <p className="text-xs text-stone-400 mt-1 max-w-md mx-auto leading-relaxed">
            All customer farm orders have been claimed by delivery partners. Place a new test order from the Customer interface to see it appear here instantly!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableOrders.map((order) => {
            const pickupLoc = order.items[0]?.location || 'Regional Farm Hub';
            const farmerName = order.items[0]?.farmerName || 'Partner Farmers';
            const totalItemsCount = order.items.reduce((s, i) => s + i.quantity, 0);

            return (
              <div
                key={order.id}
                className="bg-stone-900 rounded-3xl p-5 border border-stone-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <div>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        #{order.orderId}
                      </span>
                      <span className="text-[11px] text-stone-400 ml-2">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <span className="text-xs font-extrabold text-amber-400 bg-amber-950/70 border border-amber-800/40 px-2.5 py-1 rounded-xl">
                      ₹55.00 Payout
                    </span>
                  </div>

                  {/* Route points */}
                  <div className="my-3 space-y-2 text-xs">
                    <div className="flex items-start gap-2.5 bg-stone-950 p-2.5 rounded-xl border border-stone-800/70">
                      <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="text-[10px] text-amber-400/80 font-bold uppercase block">Pickup Farm</span>
                        <p className="font-bold text-white truncate">{pickupLoc}</p>
                        <p className="text-[11px] text-stone-400 truncate">Farmer: {farmerName}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 bg-stone-950 p-2.5 rounded-xl border border-stone-800/70">
                      <Navigation className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="text-[10px] text-emerald-400/80 font-bold uppercase block">Drop Customer</span>
                        <p className="font-bold text-white truncate">{order.deliveryAddress}</p>
                        <p className="text-[11px] text-stone-400 truncate">{order.city} - {order.pincode} • {order.customerName}</p>
                      </div>
                    </div>
                  </div>

                  {/* Summary bar */}
                  <div className="flex items-center justify-between text-xs text-stone-400 px-1">
                    <span>Produce: <strong>{totalItemsCount} items</strong> ({order.items.length} types)</span>
                    <span>Order Value: <strong className="text-stone-200">₹{order.totalAmount}</strong></span>
                  </div>
                </div>

                {/* Big Mobile-friendly action button */}
                <button
                  disabled={isPendingApproval}
                  onClick={() => setSelectedOrder(order)}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-950/40 active:scale-95 transition-all"
                >
                  {isPendingApproval ? 'Approval Required' : 'Accept Delivery Trip'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Accept Order Modal */}
      {selectedOrder && (
        <AcceptOrderModal
          order={selectedOrder}
          isOpen={true}
          onClose={() => setSelectedOrder(null)}
          onSuccess={(orderId) => {
            setSelectedOrder(null);
            navigate(`/delivery/orders/${orderId}`);
          }}
        />
      )}
    </div>
  );
};

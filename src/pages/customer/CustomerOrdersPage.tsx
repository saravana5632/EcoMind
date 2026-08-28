import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  MapPin, 
  ArrowRight, 
  RefreshCw, 
  Sprout, 
  Truck, 
  CheckCircle2, 
  UserCheck, 
  ChevronRight,
  ShoppingBag
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { subscribeToCustomerOrders } from '../../services/orderService';

export const CustomerOrdersPage: React.FC = () => {
  const { userProfile, currentUser } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const customerId = currentUser?.uid || userProfile?.uid || 'guest_customer_123';

  useEffect(() => {
    const unsub = subscribeToCustomerOrders(customerId, (data) => {
      setOrders(data);
      setLoading(false);
    });

    return () => unsub();
  }, [customerId]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
        return (
          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Placed
          </span>
        );
      case 'confirmed':
        return (
          <span className="bg-blue-100 text-blue-900 border border-blue-300 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" /> Partner Assigned
          </span>
        );
      case 'preparing':
      case 'ready_for_pickup':
        return (
          <span className="bg-purple-100 text-purple-900 border border-purple-300 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Package className="w-3.5 h-3.5" /> Preparing at Farm
          </span>
        );
      case 'picked_up':
      case 'out_for_delivery':
        return (
          <span className="bg-emerald-600 text-white shadow-sm text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse">
            <Truck className="w-3.5 h-3.5" /> Out for Delivery
          </span>
        );
      case 'delivered':
        return (
          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-rose-100 text-rose-900 text-xs font-bold px-2.5 py-1 rounded-full">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="bg-stone-100 text-stone-700 text-xs font-bold px-2.5 py-1 rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-950">
            My Farm Produce Orders
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time status updates synced with EcoMind delivery fleet
          </p>
        </div>

        <Link
          to="/customer/products"
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Order Fresh Harvest</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-emerald-600 mb-2" />
          <p className="text-xs text-stone-500 font-medium">Syncing with Firestore orders collection...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-stone-200 p-8 shadow-xs max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-900">No Orders Yet</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            You haven't placed any farm produce orders yet. Experience peak freshness today!
          </p>
          <Link
            to="/customer/products"
            className="mt-5 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-800/20"
          >
            <Sprout className="w-4 h-4" />
            <span>Explore Farm Catalog</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
            const dateStr = new Date(order.createdAt).toLocaleDateString(undefined, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={order.id}
                onClick={() => navigate(`/customer/orders/${order.id}`)}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 hover:border-emerald-300 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-800 shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-stone-900">
                          #{order.orderId}
                        </span>
                        <span className="text-[11px] text-stone-400">• {dateStr}</span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Slot: <strong>{order.deliverySlot}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    {getStatusBadge(order.orderStatus)}
                    <span className="text-base font-extrabold text-stone-950">
                      ₹{order.totalAmount}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {order.items.slice(0, 4).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-stone-50 px-2.5 py-1.5 rounded-xl border border-stone-200/60 shrink-0 text-xs">
                        <img
                          src={item.image}
                          alt={item.productName}
                          referrerPolicy="no-referrer"
                          className="w-6 h-6 rounded-md object-cover"
                        />
                        <span className="font-semibold text-stone-800 truncate max-w-[120px]">
                          {item.productName}
                        </span>
                        <span className="text-[11px] text-stone-400 font-bold">
                          ×{item.quantity}
                        </span>
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <span className="text-[11px] text-stone-500 bg-stone-100 px-2 py-1 rounded-lg">
                        +{order.items.length - 4} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:text-emerald-800 group-hover:translate-x-0.5 transition-all self-end sm:self-auto">
                    <span>Track Live Delivery</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Delivery partner tag if assigned */}
                {order.deliveryPartnerName && (
                  <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-600">
                    <span className="flex items-center gap-1.5 text-emerald-800 font-medium">
                      <Truck className="w-3.5 h-3.5" />
                      <span>Delivery Partner: <strong>{order.deliveryPartnerName}</strong> ({order.deliveryPartnerVehicle || 'Eco-Fleet'})</span>
                    </span>
                    <span className="text-stone-400">Live GPS Connected</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

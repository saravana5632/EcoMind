import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Navigation, 
  Phone, 
  Truck, 
  Package, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  AlertCircle, 
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { subscribeToOrder, updateOrderStatus } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';

export const ActiveDeliveryTripPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const unsub = subscribeToOrder(id, (data) => {
      setOrder(data);
      setLoading(false);
    });

    return () => unsub();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-2" />
          <p className="text-xs font-semibold text-stone-400">Loading trip telemetry...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <Truck className="w-12 h-12 text-stone-600 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white">Trip Record Not Found</h2>
        <Link
          to="/delivery/orders"
          className="mt-4 inline-block px-4 py-2 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold"
        >
          Back to My Trips
        </Link>
      </div>
    );
  }

  const handleAdvanceStatus = async (nextStatus: OrderStatus) => {
    setUpdating(true);
    setErrorMsg(null);

    const res = await updateOrderStatus(order.id, nextStatus);
    setUpdating(false);

    if (res.success) {
      if (nextStatus === 'delivered') {
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch (e) {}
      }
    } else {
      setErrorMsg(res.error || 'Failed to update order status');
    }
  };

  const isDelivered = order.orderStatus === 'delivered';
  const pickupLoc = order.items[0]?.location || 'Regional Farm Hub';
  const farmerName = order.items[0]?.farmerName || 'Partner Farmers';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-800">
        <button
          onClick={() => navigate('/delivery/orders')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Trips</span>
        </button>

        <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-xl border border-amber-800/50">
          Trip ID: #{order.orderId}
        </span>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* BIG Mobile-First Status Action Bar */}
      <div className="bg-stone-900 rounded-3xl p-6 border border-stone-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Current Trip Step</span>
            <h2 className="text-xl font-extrabold text-white mt-0.5 capitalize">
              {order.orderStatus.replace(/_/g, ' ')}
            </h2>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Partner Earnings</span>
            <p className="text-xl font-extrabold text-emerald-400">₹55.00</p>
          </div>
        </div>

        {/* Step-by-Step Action Control Buttons (Large mobile-friendly touch targets) */}
        {!isDelivered && (
          <div className="pt-2 space-y-2.5">
            {order.orderStatus === 'confirmed' && (
              <button
                disabled={updating}
                onClick={() => handleAdvanceStatus('picked_up')}
                className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-sm font-extrabold uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Package className="w-5 h-5" />
                <span>{updating ? 'Updating...' : 'Step 1: Mark as Picked Up from Farm'}</span>
              </button>
            )}

            {(order.orderStatus === 'preparing' || order.orderStatus === 'ready_for_pickup') && (
              <button
                disabled={updating}
                onClick={() => handleAdvanceStatus('picked_up')}
                className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-sm font-extrabold uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Package className="w-5 h-5" />
                <span>{updating ? 'Updating...' : 'Confirm Farm Pickup (Picked Up)'}</span>
              </button>
            )}

            {order.orderStatus === 'picked_up' && (
              <button
                disabled={updating}
                onClick={() => handleAdvanceStatus('out_for_delivery')}
                className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-sm font-extrabold uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Truck className="w-5 h-5" />
                <span>{updating ? 'Updating...' : 'Step 2: Start Delivery Route (Out for Delivery)'}</span>
              </button>
            )}

            {order.orderStatus === 'out_for_delivery' && (
              <button
                disabled={updating}
                onClick={() => handleAdvanceStatus('delivered')}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-extrabold uppercase tracking-wider shadow-lg shadow-emerald-600/30 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{updating ? 'Recording Delivery...' : 'Step 3: Confirm Dropoff (Mark as Delivered)'}</span>
              </button>
            )}
          </div>
        )}

        {isDelivered && (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-white">Trip Completed & Payout Credited!</p>
              <p className="text-[11px] text-emerald-300/80">
                Delivered at {order.completedAt ? new Date(order.completedAt).toLocaleTimeString() : 'Just now'}.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Route & Customer Contact Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Farm Origin */}
        <div className="bg-stone-900 rounded-3xl p-5 border border-stone-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              1. Farm Hub Origin
            </span>
            <span className="text-[10px] text-stone-500 font-mono">App 1 Farm</span>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-white">{pickupLoc}</h4>
              <p className="text-xs text-stone-400 mt-0.5">Grower: {farmerName}</p>
              <p className="text-[11px] text-stone-500 mt-1">
                Produce is sorted and eco-sealed for transport.
              </p>
            </div>
          </div>
        </div>

        {/* Customer Destination */}
        <div className="bg-stone-900 rounded-3xl p-5 border border-stone-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              2. Customer Destination
            </span>
            <a
              href={`tel:${order.phone}`}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/60"
            >
              <Phone className="w-3 h-3" /> Call Customer
            </a>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <Navigation className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-white">{order.customerName}</h4>
              <p className="text-xs text-stone-300 font-medium mt-0.5">{order.deliveryAddress}</p>
              <p className="text-[11px] text-stone-400">{order.city} - {order.pincode}</p>
              <p className="text-[11px] text-amber-400 mt-1 font-semibold">
                Slot: {order.deliverySlot}
              </p>
              {order.notes && (
                <p className="text-[11px] text-stone-400 bg-stone-950 p-2 rounded-xl mt-2 border border-stone-800">
                  Note: "{order.notes}"
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Package Items & Payment Mode */}
      <div className="bg-stone-900 rounded-3xl p-6 border border-stone-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <h3 className="text-sm font-bold text-white">Produce Manifest ({order.items.length} items)</h3>
          <span className="text-xs font-mono font-bold text-stone-300">
            Order Value: ₹{order.totalAmount}
          </span>
        </div>

        <div className="divide-y divide-stone-800/80 text-xs">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.productName}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div>
                  <p className="font-bold text-white">{item.productName}</p>
                  <p className="text-[11px] text-stone-400">{item.quantity} {item.unit}</p>
                </div>
              </div>
              <span className="font-bold text-stone-300">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-xs">
          <span className="text-stone-400">Payment Collection</span>
          <span className="font-bold text-white uppercase bg-stone-950 px-3 py-1 rounded-xl border border-stone-800">
            {order.paymentMethod === 'cod' ? `Collect ₹${order.totalAmount} (COD)` : 'Paid Online (No Cash)'}
          </span>
        </div>
      </div>
    </div>
  );
};

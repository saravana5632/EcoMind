import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  Phone, 
  Truck, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw,
  Navigation,
  User,
  ShoppingBag,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { subscribeToOrder } from '../../services/orderService';
import { OrderTimeline } from '../../components/customer/OrderTimeline';

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

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
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
          <p className="text-xs font-semibold text-stone-600">Connecting to real-time order stream...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-stone-900">Order Not Found</h2>
        <p className="text-xs text-stone-500 mt-1">This order might not exist in the database.</p>
        <Link
          to="/customer/orders"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Orders
        </Link>
      </div>
    );
  }

  const isDelivered = order.orderStatus === 'delivered';
  const isOutForDelivery = order.orderStatus === 'out_for_delivery' || order.orderStatus === 'picked_up';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      
      {/* Back button & Order Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-3">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/customer/orders')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-emerald-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Orders</span>
          </button>
          
          <div className="flex items-center gap-2 pt-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-950">
              Live Order #{order.orderId}
            </h1>
            <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              Live Sync
            </span>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs text-stone-400 block">Estimated Arrival</span>
          <span className="text-sm sm:text-base font-extrabold text-stone-900">
            {order.deliverySlot}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Live Status & Real-time Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Status Banner */}
          <div className={`p-5 rounded-3xl border shadow-xs ${
            isDelivered
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : isOutForDelivery
              ? 'bg-amber-50 border-amber-200 text-amber-950'
              : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-white px-2.5 py-0.5 rounded-full border border-emerald-100">
                  Current Status
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold mt-1">
                  {order.orderStatus === 'placed' && 'Order Placed & Queued for Dispatch'}
                  {order.orderStatus === 'confirmed' && 'Delivery Partner Assigned'}
                  {order.orderStatus === 'preparing' && 'Farmers Packing Fresh Harvest'}
                  {order.orderStatus === 'ready_for_pickup' && 'Ready for Hub Pickup'}
                  {order.orderStatus === 'picked_up' && 'Produce Picked Up from Regional Hub'}
                  {order.orderStatus === 'out_for_delivery' && 'Out for Delivery to Your Door'}
                  {order.orderStatus === 'delivered' && 'Farm Produce Delivered Safely!'}
                </h3>
                <p className="text-xs text-stone-600 mt-1">
                  {isDelivered
                    ? 'Enjoy your nutritious, zero-middleman harvest!'
                    : 'The state updates automatically as your delivery partner updates the route.'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white shadow-xs shrink-0">
                {isDelivered ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                ) : (
                  <Truck className="w-7 h-7 text-emerald-700 animate-pulse" />
                )}
              </div>
            </div>
          </div>

          {/* Delivery Partner Details Card if assigned */}
          {order.deliveryPartnerId && (
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">{order.deliveryPartnerName}</h4>
                    <p className="text-[11px] text-stone-500">EcoMind Verified Logistics Partner</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${order.deliveryPartnerPhone || '+919845011223'}`}
                    className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Call Partner</span>
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-stone-50">
                  <span className="text-[10px] text-stone-400 font-semibold block uppercase">Vehicle Assigned</span>
                  <span className="font-bold text-stone-800">{order.deliveryPartnerVehicle || 'Electric Two-Wheeler'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50">
                  <span className="text-[10px] text-stone-400 font-semibold block uppercase">Logistics Protocol</span>
                  <span className="font-bold text-emerald-700">Zero-Emission Cold Bag</span>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Timeline Steps */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs">
            <h3 className="text-base font-bold text-stone-900 mb-6 pb-3 border-b border-stone-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>Full Order Progression</span>
            </h3>

            <OrderTimeline
              status={order.orderStatus}
              statusTimeline={order.statusTimeline}
              deliveryPartnerName={order.deliveryPartnerName}
            />
          </div>
        </div>

        {/* Right Column: Order Items & Delivery Location (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Delivery Location Card */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <MapPin className="w-5 h-5 text-emerald-700" />
              <h3 className="text-base font-bold text-stone-900">Destination Address</h3>
            </div>

            <div className="text-xs space-y-1">
              <p className="font-bold text-stone-800">{order.customerName}</p>
              <p className="text-stone-600">{order.deliveryAddress}</p>
              <p className="text-stone-500">{order.city} - {order.pincode}</p>
              <p className="text-stone-500">Contact: {order.phone}</p>
            </div>
          </div>

          {/* Items Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-stone-900 pb-3 border-b border-stone-100 flex items-center justify-between">
              <span>Farm Produce in Order</span>
              <span className="text-xs text-stone-500 font-normal">
                {order.items.length} produce types
              </span>
            </h3>

            <div className="space-y-3 text-xs">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.image}
                      alt={item.productName}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-stone-900 truncate">{item.productName}</p>
                      <p className="text-[11px] text-stone-500">
                        {item.farmerName ? `Farmer: ${item.farmerName}` : item.location}
                      </p>
                      <p className="text-[11px] text-stone-400">
                        {item.quantity} {item.unit} × ₹{item.price}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-stone-900 shrink-0">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-stone-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-bold text-stone-900">₹{order.subtotal}</span>
              </div>
              <div className="flex items-center justify-between text-stone-600">
                <span>Farm Delivery Fee</span>
                <span className="font-bold text-stone-900">₹{order.deliveryFee}</span>
              </div>
              <div className="pt-2 border-t border-stone-100 flex items-baseline justify-between">
                <span className="text-sm font-bold text-stone-900">Total Paid / Payable</span>
                <span className="text-xl font-extrabold text-emerald-950">₹{order.totalAmount}</span>
              </div>
              <div className="pt-1 flex items-center justify-between text-[11px] text-stone-500">
                <span>Payment Mode</span>
                <span className="font-bold uppercase text-stone-800">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Paid Online (UPI)'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Demo Help Banner */}
          <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 text-xs text-stone-600 space-y-2">
            <p className="font-bold text-stone-900">💡 Evaluating the Ecosystem?</p>
            <p className="text-[11px] leading-relaxed">
              Use the <strong>"Demo Quick Switcher"</strong> at the bottom right to switch to the <strong>Delivery Partner</strong> role. You can accept this trip and progress it to <code>Picked Up</code> and <code>Delivered</code> in real time!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

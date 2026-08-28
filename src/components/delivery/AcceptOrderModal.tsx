import React, { useState } from 'react';
import { Order } from '../../types';
import { MapPin, Navigation, Package, IndianRupee, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { acceptDeliveryOrder } from '../../services/orderService';

interface AcceptOrderModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}

export const AcceptOrderModal: React.FC<AcceptOrderModalProps> = ({
  order,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { userProfile } = useAuth();
  const [accepting, setAccepting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAccept = async () => {
    if (!userProfile) return;
    setAccepting(true);
    setErrorMsg(null);

    const result = await acceptDeliveryOrder(order.id, userProfile);
    setAccepting(false);

    if (result.success) {
      onSuccess(order.id);
      onClose();
    } else {
      setErrorMsg(result.error || 'Could not accept order. It might have been taken by another partner.');
    }
  };

  const pickupLocation = order.items[0]?.location || 'Sahyadri Regional Farm Cluster';
  const farmerName = order.items[0]?.farmerName || 'Partner Farmers (App 1)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-stone-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
              Trip Dispatch #{order.orderId}
            </span>
            <h3 className="text-lg font-bold text-stone-900 mt-1">Accept Farm Produce Delivery</h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 text-sm font-bold p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="my-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Route Info */}
        <div className="my-4 space-y-3">
          
          {/* Pickup */}
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-amber-800 uppercase">Pickup Location (Farm Hub)</p>
                <span className="text-[10px] text-stone-400 font-mono">App 1 Farm</span>
              </div>
              <p className="text-xs font-bold text-stone-800 truncate">{pickupLocation}</p>
              <p className="text-[11px] text-stone-500">Farmer: {farmerName}</p>
            </div>
          </div>

          {/* Delivery */}
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
              <Navigation className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-emerald-800 uppercase">Dropoff Customer Address</p>
              <p className="text-xs font-bold text-stone-800 truncate">{order.deliveryAddress}</p>
              <p className="text-[11px] text-stone-500">{order.city} - {order.pincode} | Customer: {order.customerName}</p>
            </div>
          </div>

          {/* Trip Stats */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2.5 rounded-2xl bg-stone-100">
              <span className="text-[10px] text-stone-500 uppercase font-semibold block">Produce Items</span>
              <span className="text-xs font-bold text-stone-800">
                {order.items.reduce((sum, i) => sum + i.quantity, 0)} items ({order.items.length} types)
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-stone-100">
              <span className="text-[10px] text-stone-500 uppercase font-semibold block">Estimated Trip</span>
              <span className="text-xs font-bold text-stone-800">~3.8 km (18 mins)</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] text-emerald-800 uppercase font-bold block">Your Payout</span>
              <span className="text-sm font-extrabold text-emerald-950">₹55.00</span>
            </div>
          </div>
        </div>

        {/* Notice */}
        <div className="mb-4 p-2.5 rounded-xl bg-stone-50 text-[11px] text-stone-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Atomic delivery lock prevents multiple partners from taking this trip.</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-bold transition-colors"
          >
            Cancel
          </button>
          
          <button
            disabled={accepting}
            onClick={handleAccept}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-800/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <Package className="w-4 h-4" />
            <span>{accepting ? 'Locking Order...' : 'Confirm & Accept Trip'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

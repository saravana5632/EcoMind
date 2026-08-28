import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Package, 
  Truck, 
  MapPin, 
  ShoppingBag, 
  Sparkles,
  UserCheck,
  Check
} from 'lucide-react';
import { OrderStatus } from '../../types';

interface OrderTimelineProps {
  status: OrderStatus;
  statusTimeline?: {
    placedAt?: string;
    confirmedAt?: string;
    pickedUpAt?: string;
    outForDeliveryAt?: string;
    deliveredAt?: string;
  };
  deliveryPartnerName?: string;
}

interface StepItem {
  id: OrderStatus;
  label: string;
  subLabel: string;
  icon: React.ReactNode;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ 
  status, 
  statusTimeline,
  deliveryPartnerName 
}) => {
  const steps: StepItem[] = [
    {
      id: 'placed',
      label: 'Order Placed',
      subLabel: statusTimeline?.placedAt 
        ? new Date(statusTimeline.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Received by EcoMind',
      icon: <ShoppingBag className="w-4 h-4" />
    },
    {
      id: 'confirmed',
      label: 'Confirmed',
      subLabel: deliveryPartnerName 
        ? `Accepted by ${deliveryPartnerName}` 
        : 'Partner matching...',
      icon: <UserCheck className="w-4 h-4" />
    },
    {
      id: 'preparing',
      label: 'Preparing Produce',
      subLabel: 'Sorting & eco-packaging at farm hub',
      icon: <Sparkles className="w-4 h-4" />
    },
    {
      id: 'ready_for_pickup',
      label: 'Ready for Pickup',
      subLabel: 'Inspected for maximum freshness',
      icon: <Package className="w-4 h-4" />
    },
    {
      id: 'picked_up',
      label: 'Picked Up',
      subLabel: statusTimeline?.pickedUpAt 
        ? new Date(statusTimeline.pickedUpAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Collected from regional farm',
      icon: <Truck className="w-4 h-4" />
    },
    {
      id: 'out_for_delivery',
      label: 'Out for Delivery',
      subLabel: statusTimeline?.outForDeliveryAt 
        ? new Date(statusTimeline.outForDeliveryAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'On the way to your door',
      icon: <Truck className="w-4 h-4" />
    },
    {
      id: 'delivered',
      label: 'Delivered',
      subLabel: statusTimeline?.deliveredAt 
        ? new Date(statusTimeline.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Farm fresh at your doorstep',
      icon: <CheckCircle2 className="w-4 h-4" />
    }
  ];

  // Map status index to determine active vs completed
  const statusOrder: OrderStatus[] = [
    'placed',
    'confirmed',
    'preparing',
    'ready_for_pickup',
    'picked_up',
    'out_for_delivery',
    'delivered'
  ];

  const currentIdx = statusOrder.indexOf(status);

  return (
    <div className="relative pl-2 sm:pl-4 py-2">
      <div className="space-y-6">
        {steps.map((step, index) => {
          const isCompleted = index < currentIdx;
          const isCurrent = index === currentIdx;
          const isPending = index > currentIdx;

          return (
            <div key={step.id} className="relative flex items-start group">
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`absolute left-4 top-8 -bottom-6 w-0.5 transition-colors ${
                    isCompleted ? 'bg-emerald-600' : 'bg-stone-200'
                  }`}
                />
              )}

              {/* Step Icon Badge */}
              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-50'
                    : isCurrent
                    ? 'bg-emerald-700 text-white shadow-md ring-4 ring-emerald-100 animate-pulse-subtle'
                    : 'bg-stone-100 text-stone-400 border border-stone-200'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : isCurrent ? (
                  step.icon
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </div>

              {/* Step text info */}
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-sm font-bold ${
                      isCurrent
                        ? 'text-emerald-950 font-extrabold flex items-center gap-2'
                        : isCompleted
                        ? 'text-stone-800'
                        : 'text-stone-400 font-medium'
                    }`}
                  >
                    <span>{step.label}</span>
                    {isCurrent && (
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold tracking-wider animate-pulse">
                        In Progress
                      </span>
                    )}
                  </h4>
                </div>

                <p
                  className={`text-xs mt-0.5 leading-relaxed ${
                    isCurrent
                      ? 'text-emerald-800 font-medium'
                      : isCompleted
                      ? 'text-stone-600'
                      : 'text-stone-400'
                  }`}
                >
                  {step.subLabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

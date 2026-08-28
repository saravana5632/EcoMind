import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Sprout, 
  ShieldCheck, 
  Truck, 
  MapPin, 
  AlertCircle, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const CustomerCartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, subtotal, deliveryFee, totalAmount, savings } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4 border border-emerald-100">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900">Your Fresh Basket is Empty</h2>
        <p className="text-xs text-stone-500 mt-2 max-w-md mx-auto leading-relaxed">
          You haven't added any farm-fresh produce yet. Connect directly with local farmers and get today's harvest delivered.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/customer/products"
            className="px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-800/20 transition-all"
          >
            Browse Farm Produce
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-950">
            Fresh Produce Basket
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Direct harvest from verified farmers in Application 1
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={clearCart}
            className="text-xs text-stone-500 hover:text-rose-600 font-semibold transition-colors"
          >
            Clear Basket
          </button>
          <Link
            to="/customer/products"
            className="text-xs text-emerald-800 hover:underline font-bold"
          >
            + Add More Produce
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 items-start">
        
        {/* Left: Basket Items List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {cart.map(({ product, quantity }) => {
            const itemTotal = product.price * quantity;
            const isAtMax = quantity >= product.availableQuantity;

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Thumbnail & details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 border border-stone-100 bg-stone-50"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                      {product.category}
                    </span>
                    <Link to={`/customer/products/${product.id}`} className="block">
                      <h3 className="text-sm font-bold text-stone-900 truncate hover:text-emerald-800">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      <span>{product.farmerName} • {product.location}</span>
                    </p>
                    <p className="text-xs font-bold text-stone-800 mt-1">
                      ₹{product.price} <span className="text-[10px] text-stone-400 font-normal">/{product.unit}</span>
                    </p>
                  </div>
                </div>

                {/* Stepper, Total & Remove */}
                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
                  
                  {/* Quantity Stepper (Prevents overselling) */}
                  <div className="flex items-center bg-stone-50 rounded-2xl p-1 border border-stone-200">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-xl bg-white hover:bg-stone-100 active:scale-95 text-stone-700 shadow-xs font-bold"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    
                    <span className="w-8 text-center text-xs font-extrabold text-stone-900">
                      {quantity}
                    </span>
                    
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      disabled={isAtMax}
                      className="w-7 h-7 flex items-center justify-center rounded-xl bg-white hover:bg-stone-100 active:scale-95 text-stone-700 disabled:opacity-40 shadow-xs font-bold"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right min-w-[70px]">
                    <span className="text-sm font-extrabold text-stone-950 block">
                      ₹{itemTotal}
                    </span>
                    {isAtMax && (
                      <span className="text-[9px] text-amber-700 font-bold block">
                        Max Stock Reached
                      </span>
                    )}
                  </div>

                  {/* Remove Item */}
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Zero Middleman Impact Card */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 text-xs flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Estimated Middleman Savings: ₹{savings}</p>
              <p className="text-emerald-800 text-[11px] leading-relaxed mt-0.5">
                By purchasing straight through EcoMind Fresh, you avoided wholesale commissions, mandi cess, and extended cold storage costs.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Bill Summary (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5 sticky top-24">
            <h2 className="text-lg font-bold text-stone-950 pb-3 border-b border-stone-100">
              Order Summary
            </h2>

            {/* Breakdown */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-stone-600">
                <span>Produce Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-bold text-stone-900">₹{subtotal}</span>
              </div>

              <div className="flex items-center justify-between text-stone-600">
                <div className="flex items-center gap-1">
                  <span>Farm Dispatch & Delivery Fee</span>
                  {deliveryFee === 0 && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                      FREE
                    </span>
                  )}
                </div>
                <span className="font-bold text-stone-900">
                  {deliveryFee === 0 ? '₹0.00' : `₹${deliveryFee}`}
                </span>
              </div>

              {subtotal < 400 && (
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200">
                  Add <strong>₹{400 - subtotal}</strong> more to unlock FREE farm delivery!
                </p>
              )}

              <div className="pt-3 border-t border-stone-100 flex items-baseline justify-between">
                <div>
                  <span className="text-sm font-bold text-stone-900 block">Total Amount</span>
                  <span className="text-[10px] text-stone-400">Inclusive of all agricultural handling</span>
                </div>
                <span className="text-2xl font-extrabold text-emerald-950">
                  ₹{totalAmount}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => navigate('/customer/checkout')}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg shadow-emerald-800/20 active:scale-95 transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Assurances */}
            <div className="space-y-2 pt-2 border-t border-stone-100 text-[11px] text-stone-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Guaranteed Fresh or Instant Replacement</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Real-Time Delivery Partner Tracking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

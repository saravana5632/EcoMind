import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Check, MapPin, Calendar, User, AlertCircle, Heart } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { FreshnessBadge } from './FreshnessBadge';

interface ProductCardProps {
  product: Product;
  onOpenFarmStory?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenFarmStory }) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const cartItem = cart.find(item => item.product.id === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;
  const isSoldOut = product.status === 'sold_out' || product.availableQuantity <= 0;
  const isLowStock = product.status === 'low_stock' || (product.availableQuantity > 0 && product.availableQuantity <= 15);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = addToCart(product, 1);
    if (!result.success && result.message) {
      setToastMsg(result.message);
      setTimeout(() => setToastMsg(null), 2500);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = updateQuantity(product.id, inCartQty + 1);
    if (!result.success && result.message) {
      setToastMsg(result.message);
      setTimeout(() => setToastMsg(null), 2500);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, inCartQty - 1);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-400/80 hover:shadow-lg hover:shadow-slate-900/5 transition-all duration-250 flex flex-col overflow-hidden">
      
      {/* Product Image Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
        <Link to={`/customer/products/${product.id}`} className="block w-full h-full">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <FreshnessBadge freshness={product.freshness} />
          {product.organicCertified && (
            <span className="bg-emerald-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              Organic
            </span>
          )}
        </div>

        {/* Stock status overlay if sold out */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
              Harvest Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Low stock warning */}
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-bold text-emerald-800 uppercase tracking-wider">
              {product.category}
            </span>
            {isLowStock && !isSoldOut && (
              <span className="text-amber-800 font-bold flex items-center gap-0.5 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded-md text-[10px]">
                <AlertCircle className="w-3 h-3" /> Only {product.availableQuantity} {product.unit} left
              </span>
            )}
          </div>

          {/* Product Name */}
          <Link to={`/customer/products/${product.id}`} className="block">
            <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Farmer & Location Origin (Direct from EcoMind Agri) */}
          <div className="mt-2 pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-700 font-medium truncate">
                <User className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate">{product.farmerName}</span>
              </span>
              <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono border border-slate-200/50">
                Farmer Direct
              </span>
            </div>

            <div className="flex items-center gap-1 text-slate-500 text-[11px]">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{product.location}</span>
            </div>

            <div className="flex items-center gap-1 text-slate-500 text-[11px]">
              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">Harvest: {product.harvestDate}</span>
            </div>
          </div>
        </div>

        {/* Price & Action Section */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg sm:text-xl font-extrabold text-slate-950">
                ₹{product.price}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                /{product.unit}
              </span>
            </div>
            <p className="text-[10px] text-emerald-700 font-medium">
              Avail: {product.availableQuantity} {product.unit}
            </p>
          </div>

          {/* Add to cart / Quantity controls */}
          <div className="relative">
            {isSoldOut ? (
              <button
                disabled
                className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed border border-slate-200"
              >
                Sold Out
              </button>
            ) : inCartQty > 0 ? (
              <div className="flex items-center bg-emerald-700 text-white rounded-xl p-1 shadow-2xs">
                <button
                  onClick={handleDecrement}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-emerald-800 active:scale-95 transition-all"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-7 text-center text-xs font-extrabold">{inCartQty}</span>
                <button
                  onClick={handleIncrement}
                  disabled={inCartQty >= product.availableQuantity}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-emerald-800 disabled:opacity-40 active:scale-95 transition-all"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-2xs hover:shadow-md hover:shadow-emerald-800/15 active:scale-95 transition-all"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            )}

            {/* Error / Limit Toast */}
            {toastMsg && (
              <div className="absolute right-0 bottom-full mb-2 w-48 bg-slate-900 text-white text-[11px] p-2 rounded-xl shadow-xl z-30 animate-in fade-in zoom-in-95 border border-slate-700">
                {toastMsg}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

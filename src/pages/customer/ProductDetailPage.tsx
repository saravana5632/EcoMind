import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Sprout, 
  ArrowLeft, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Check, 
  MapPin, 
  Calendar, 
  User, 
  ShieldCheck, 
  Clock, 
  Leaf, 
  Heart,
  Share2,
  AlertCircle,
  Truck,
  Sparkles
} from 'lucide-react';
import { Product } from '../../types';
import { getProductById, subscribeToProducts } from '../../services/productService';
import { useCart } from '../../context/CartContext';
import { FreshnessBadge } from '../../components/customer/FreshnessBadge';
import { ProductCard } from '../../components/customer/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQty, setSelectedQty] = useState(1);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProductById(id).then((p) => {
      setProduct(p);
      setLoading(false);
    });

    const unsub = subscribeToProducts((all) => {
      setRelatedProducts(all.filter((item) => item.id !== id).slice(0, 4));
    });

    return () => unsub();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Sprout className="w-10 h-10 text-emerald-600 animate-bounce mx-auto mb-2" />
          <p className="text-xs font-semibold text-stone-600">Connecting to farm lot...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <Sprout className="w-12 h-12 text-stone-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-stone-800">Product Not Found</h2>
        <p className="text-xs text-stone-500 mt-1">This farm harvest may have been sold out or unlisted.</p>
        <Link
          to="/customer/products"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const isSoldOut = product.status === 'sold_out' || product.availableQuantity <= 0;
  const isLowStock = product.status === 'low_stock' || (product.availableQuantity > 0 && product.availableQuantity <= 15);

  const cartItem = cart.find((i) => i.product.id === product.id);
  const currentInCart = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
    const res = addToCart(product, selectedQty);
    if (res.success) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
    } else if (res.message) {
      setToastMsg(res.message);
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10">
      
      {/* Breadcrumb / Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-emerald-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="text-[11px] text-stone-400 font-mono">
          Lot ID: {product.id} • App 1 Farmer Verified
        </span>
      </div>

      {/* Main Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Image Showcase (5 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-4/3 w-full rounded-3xl overflow-hidden bg-stone-100 border border-stone-200 shadow-md">
            <img
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />

            {/* Badges on image */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
              <FreshnessBadge freshness={product.freshness} className="shadow-md" />
              {product.organicCertified && (
                <span className="bg-emerald-800/90 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  100% Certified Organic
                </span>
              )}
            </div>

            {isSoldOut && (
              <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center">
                <span className="bg-rose-600 text-white text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                  Harvest Sold Out
                </span>
              </div>
            )}
          </div>

          {/* Direct Farm Transparency Pill */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-emerald-950">Fast Farm-to-Door Logistics</p>
              <p className="text-stone-600">Dispatched from {product.location} directly to your home via EcoMind Delivery Partner.</p>
            </div>
          </div>
        </div>

        {/* Right Info & Buying Controls (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full">
                {product.category}
              </span>
              {isLowStock && !isSoldOut && (
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Only {product.availableQuantity} {product.unit} left!
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-950 leading-tight">
              {product.name}
            </h1>

            {/* Price & Savings */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-emerald-900">
                ₹{product.price}
              </span>
              <span className="text-sm font-bold text-stone-500">
                per {product.unit}
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                Direct Farmer Rate
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="prose prose-sm text-stone-700">
            <p className="text-sm leading-relaxed">{product.description}</p>
          </div>

          {/* Farmer Origin Card */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Farmer & Farm Traceability
              </span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                Application 1 Registered
              </span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={product.farmerAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                alt={product.farmerName}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-600"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <span>{product.farmerName}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </h4>
                <p className="text-xs text-stone-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-stone-400" />
                  <span>{product.farmName ? `${product.farmName}, ` : ''}{product.location}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-stone-600">
              <div className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-xl">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Harvest: {product.harvestDate}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-xl">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">Stock: {product.availableQuantity} {product.unit}</span>
              </div>
            </div>
          </div>

          {/* Nutrition and Storage Tips */}
          {product.nutritionFacts && (
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2 text-xs">
              <h5 className="font-bold text-stone-800">Freshness & Storage Guidelines</h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-stone-600">
                {product.nutritionFacts.calories && (
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-semibold">Energy</span>
                    <span className="font-medium text-stone-800">{product.nutritionFacts.calories}</span>
                  </div>
                )}
                {product.nutritionFacts.shelfLife && (
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-semibold">Fresh Shelf Life</span>
                    <span className="font-medium text-stone-800">{product.nutritionFacts.shelfLife}</span>
                  </div>
                )}
                {product.nutritionFacts.storageTip && (
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-semibold">Care Tip</span>
                    <span className="font-medium text-stone-800">{product.nutritionFacts.storageTip}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Toast / Notification */}
          {toastMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* Quantity Selector & Add to Cart Controls */}
          <div className="pt-2">
            {isSoldOut ? (
              <div className="p-4 rounded-2xl bg-stone-100 text-stone-500 text-center text-xs font-bold">
                This farm batch is currently sold out. Check other fresh produce below.
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                
                {/* Quantity Stepper */}
                <div className="flex items-center justify-between sm:justify-start bg-stone-100 rounded-2xl p-1.5 border border-stone-200">
                  <button
                    onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white text-stone-800 hover:bg-stone-50 active:scale-95 shadow-xs font-bold"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="px-4 text-center">
                    <span className="text-sm font-extrabold text-stone-900 block">{selectedQty}</span>
                    <span className="text-[10px] text-stone-500 font-semibold">{product.unit}</span>
                  </div>
                  <button
                    onClick={() => setSelectedQty(Math.min(product.availableQuantity, selectedQty + 1))}
                    disabled={selectedQty >= product.availableQuantity}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white text-stone-800 hover:bg-stone-50 disabled:opacity-40 active:scale-95 shadow-xs font-bold"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Basket Button */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-800/20 active:scale-95 transition-all"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>
                    {addedSuccess
                      ? `Added ${selectedQty} ${product.unit} to Basket!`
                      : `Add to Basket • ₹${product.price * selectedQty}`}
                  </span>
                </button>

                <Link
                  to="/customer/cart"
                  className="py-3.5 px-4 rounded-2xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition-colors text-center"
                >
                  Go to Basket
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Farm Harvests */}
      {relatedProducts.length > 0 && (
        <div className="pt-10 border-t border-stone-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-stone-900">More Direct Farm Produce</h3>
              <p className="text-xs text-stone-500">Other fresh harvests from our regional grower collective</p>
            </div>
            <Link
              to="/customer/products"
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              View Full Marketplace →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

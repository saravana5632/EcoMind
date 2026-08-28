import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Clock, 
  CreditCard, 
  Banknote, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  Truck,
  Building,
  Hash,
  Lock,
  QrCode
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { createCustomerOrder } from '../../services/orderService';
import confetti from 'canvas-confetti';

export const CustomerCheckoutPage: React.FC = () => {
  const { userProfile, currentUser } = useAuth();
  const { cart, subtotal, deliveryFee, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();

  const [name, setName] = useState(userProfile?.name || 'Priya Sharma');
  const [phone, setPhone] = useState(userProfile?.phone || '+91 98450 67890');
  const [deliveryAddress, setDeliveryAddress] = useState(userProfile?.address || '42, Green Glen Layout, Bellandur');
  const [city, setCity] = useState(userProfile?.city || 'Bengaluru');
  const [pincode, setPincode] = useState(userProfile?.pincode || '560103');
  const [deliverySlot, setDeliverySlot] = useState('Morning Express (7:00 AM - 10:00 AM)');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'mock_online'>('cod');
  const [orderNotes, setOrderNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showMockOnlineModal, setShowMockOnlineModal] = useState(false);

  useEffect(() => {
    if (userProfile) {
      if (userProfile.name) setName(userProfile.name);
      if (userProfile.phone) setPhone(userProfile.phone);
      if (userProfile.address) setDeliveryAddress(userProfile.address);
      if (userProfile.city) setCity(userProfile.city);
      if (userProfile.pincode) setPincode(userProfile.pincode);
    }
  }, [userProfile]);

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <h2 className="text-xl font-bold text-stone-800">Your Basket is Empty</h2>
        <p className="text-xs text-stone-500 mt-1">Please add farm produce before checking out.</p>
        <Link
          to="/customer/products"
          className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold"
        >
          Browse Produce
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (isPaidOnline = false) => {
    if (!deliveryAddress || !phone || !name || !city || !pincode) {
      setErrorMsg('Please complete all delivery address details.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const customerUid = currentUser?.uid || userProfile?.uid || 'guest_customer_123';

    const orderItems = cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      unit: item.product.unit,
      image: item.product.image,
      farmerName: item.product.farmerName,
      location: item.product.location
    }));

    const result = await createCustomerOrder({
      customerId: customerUid,
      customerName: name,
      phone,
      deliveryAddress,
      city,
      pincode,
      deliverySlot,
      items: orderItems,
      subtotal,
      deliveryFee,
      totalAmount,
      paymentMethod: isPaidOnline ? 'mock_online' : paymentMethod,
      paymentStatus: isPaidOnline ? 'paid' : 'pending',
      notes: orderNotes
    });

    setLoading(false);

    if (result.success && result.orderId) {
      // Trigger festive confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore if not supported
      }

      clearCart();
      navigate(`/customer/orders/${result.orderId}`);
    } else {
      setErrorMsg(result.error || 'Failed to place farm order. Please try again.');
    }
  };

  const slots = [
    'Morning Express (7:00 AM - 10:00 AM)',
    'Afternoon Farm Slot (12:00 PM - 3:00 PM)',
    'Evening Fresh Harvest (5:00 PM - 8:00 PM)'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-emerald-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Basket</span>
        </button>
      </div>

      <div className="pb-4 border-b border-stone-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-950">
          Delivery & Checkout
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Fast farm dispatch straight to your doorstep
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Delivery & Payment Details (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Address Details Card */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <MapPin className="w-5 h-5 text-emerald-700" />
              <h2 className="text-base font-bold text-stone-900">1. Delivery Address</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Phone Number for Delivery *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Complete House / Flat Address *
              </label>
              <textarea
                rows={2}
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="House No, Apartment name, Street, Landmark"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-emerald-600 focus:bg-white resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Pincode *
                </label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Delivery Slot Card */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <Clock className="w-5 h-5 text-emerald-700" />
              <h2 className="text-base font-bold text-stone-900">2. Select Delivery Slot</h2>
            </div>

            <div className="space-y-2">
              {slots.map((slot) => (
                <label
                  key={slot}
                  className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                    deliverySlot === slot
                      ? 'bg-emerald-50 text-emerald-950 border-emerald-300 ring-1 ring-emerald-400'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="deliverySlot"
                      checked={deliverySlot === slot}
                      onChange={() => setDeliverySlot(slot)}
                      className="text-emerald-700 focus:ring-emerald-600 h-4 w-4"
                    />
                    <span className="text-xs sm:text-sm font-semibold">{slot}</span>
                  </div>
                  <span className="text-[11px] text-emerald-800 font-bold bg-white px-2 py-0.5 rounded-full border border-stone-200">
                    Eco-Route
                  </span>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Special Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="e.g. Leave with security, ring bell twice"
                className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <CreditCard className="w-5 h-5 text-emerald-700" />
              <h2 className="text-base font-bold text-stone-900">3. Payment Option</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Cash on Delivery */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
                  paymentMethod === 'cod'
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-400 ring-2 ring-emerald-500/20'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="p-2 rounded-xl bg-white text-emerald-700 shadow-xs">
                    <Banknote className="w-5 h-5" />
                  </div>
                  {paymentMethod === 'cod' && (
                    <span className="bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold">Cash on Delivery (COD)</h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Pay cash or UPI upon receiving fresh produce at door
                  </p>
                </div>
              </button>

              {/* Mock Online Payment */}
              <button
                type="button"
                onClick={() => setPaymentMethod('mock_online')}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
                  paymentMethod === 'mock_online'
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-400 ring-2 ring-emerald-500/20'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="p-2 rounded-xl bg-white text-emerald-700 shadow-xs">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  {paymentMethod === 'mock_online' && (
                    <span className="bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold">Mock Online Payment</h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Simulate UPI / QR Code / NetBanking instantly
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Summary: Items Review & Place Order Button (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4 sticky top-24">
            <h2 className="text-base font-bold text-stone-900 pb-3 border-b border-stone-100">
              Basket Items ({cart.length})
            </h2>

            <div className="max-h-60 overflow-y-auto divide-y divide-stone-100 pr-1 text-xs space-y-2">
              {cart.map(({ product, quantity }) => (
                <div key={product.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-stone-800 truncate">{product.name}</p>
                      <p className="text-[11px] text-stone-400">
                        {quantity} {product.unit} × ₹{product.price}
                      </p>
                    </div>
                  </div>
                  <span className="font-extrabold text-stone-900 shrink-0">
                    ₹{product.price * quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="pt-3 border-t border-stone-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-bold text-stone-900">₹{subtotal}</span>
              </div>
              <div className="flex items-center justify-between text-stone-600">
                <span>Delivery Fee</span>
                <span className="font-bold text-stone-900">
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="pt-2 border-t border-stone-100 flex items-baseline justify-between">
                <span className="text-sm font-bold text-stone-900">Total Payable</span>
                <span className="text-2xl font-extrabold text-emerald-950">₹{totalAmount}</span>
              </div>
            </div>

            {/* Confirm & Place Order */}
            {paymentMethod === 'mock_online' ? (
              <button
                type="button"
                disabled={loading}
                onClick={() => setShowMockOnlineModal(true)}
                className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg shadow-emerald-800/20 active:scale-95 transition-all disabled:opacity-50"
              >
                Pay ₹{totalAmount} with Mock Online UPI
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={() => handlePlaceOrder(false)}
                className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg shadow-emerald-800/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Confirming with Farm Hub...' : `Place Order (COD) • ₹${totalAmount}`}
              </button>
            )}

            <div className="p-3 rounded-2xl bg-stone-50 text-[11px] text-stone-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Creates live record in shared <code>orders</code> collection.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mock Online Payment Modal */}
      {showMockOnlineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-stone-100 animate-in fade-in zoom-in-95 text-stone-900">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-sm text-stone-900">Mock Online Payment Gateway</h3>
              </div>
              <button
                onClick={() => setShowMockOnlineModal(false)}
                className="text-stone-400 hover:text-stone-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="my-6 text-center space-y-3">
              <div className="w-40 h-40 bg-stone-100 rounded-2xl mx-auto flex items-center justify-center p-3 border border-stone-200">
                <div className="text-center space-y-1">
                  <QrCode className="w-20 h-20 text-emerald-800 mx-auto" />
                  <p className="text-[10px] font-mono text-stone-500">ecomindfresh@upi</p>
                </div>
              </div>
              <div>
                <span className="text-xl font-extrabold text-stone-950">₹{totalAmount}.00</span>
                <p className="text-xs text-stone-500">Simulating Instant Payment Authorization</p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                disabled={loading}
                onClick={() => {
                  setShowMockOnlineModal(false);
                  handlePlaceOrder(true);
                }}
                className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider shadow-md active:scale-95 transition-all"
              >
                {loading ? 'Processing...' : 'Simulate Successful Payment'}
              </button>

              <button
                onClick={() => setShowMockOnlineModal(false)}
                className="w-full py-2 text-stone-500 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

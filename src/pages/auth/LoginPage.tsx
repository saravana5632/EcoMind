import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sprout, User, Truck, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { login, loginAsDemo, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'customer' | 'delivery_partner'>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    const res = await loginWithGoogle(activeTab);
    setLoading(false);
    if (res.success && res.role) {
      if (res.role === 'customer') {
        navigate('/customer/home');
      } else {
        navigate('/delivery/dashboard');
      }
    } else if (res.error) {
      setErrorMsg(res.error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await login(email, password);
    setLoading(false);

    if (res.success && res.role) {
      if (res.role === 'customer') {
        navigate('/customer/home');
      } else if (res.role === 'delivery_partner') {
        navigate('/delivery/dashboard');
      } else {
        // Default
        navigate('/customer/home');
      }
    } else {
      setErrorMsg(res.error || 'Invalid credentials or user not found');
    }
  };

  const handleDemoLogin = async (role: 'customer' | 'delivery_partner') => {
    setLoading(true);
    setErrorMsg(null);
    const res = await loginAsDemo(role);
    setLoading(false);
    if (res.success) {
      if (role === 'customer') {
        navigate('/customer/home');
      } else {
        navigate('/delivery/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-stone-900 to-stone-950 text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 group-hover:scale-105 transition-transform">
              <Sprout className="w-7 h-7" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-extrabold tracking-tight text-white block">
                EcoMind <span className="text-emerald-400">Fresh</span>
              </span>
              <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider block">
                Farm to Door Marketplace & Logistics
              </span>
            </div>
          </Link>
          <p className="mt-4 text-xs text-stone-400">
            Application 2 of 2 in the EcoMind Agriculture Ecosystem
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200/20 text-stone-900">
          
          {/* Role Tab Selector [ Customer ] [ Delivery Partner ] */}
          <div className="p-1 rounded-2xl bg-stone-100 grid grid-cols-2 gap-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('customer');
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'customer'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Customer</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('delivery_partner');
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'delivery_partner'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Delivery Partner</span>
            </button>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-bold text-stone-900">
              {activeTab === 'customer' ? 'Customer Sign In' : 'Delivery Partner Portal'}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {activeTab === 'customer'
                ? 'Buy fresh vegetables, fruits & grains directly from farmers'
                : 'Manage real-time farm pickups and door deliveries'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={activeTab === 'customer' ? 'e.g. priya@customer.com' : 'e.g. rajesh@delivery.com'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white text-xs font-bold uppercase tracking-wider shadow-md active:scale-95 transition-all disabled:opacity-50 ${
                activeTab === 'customer'
                  ? 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-800/20'
                  : 'bg-stone-900 hover:bg-black shadow-stone-900/20'
              }`}
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Google Sign In Option */}
          <div className="mt-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 text-xs font-bold transition-all shadow-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Quick 1-Click Demo Logins for Hackathon Evaluator Ease */}
          <div className="mt-6 pt-5 border-t border-stone-100">
            <span className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider text-center mb-2.5">
              1-Click Demo Evaluation Sign In
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('customer')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Demo Customer</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('delivery_partner')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 text-xs font-bold transition-colors"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Demo Delivery Partner</span>
              </button>
            </div>
          </div>

          {/* Registration Links */}
          <div className="mt-6 text-center text-xs text-stone-500">
            {activeTab === 'customer' ? (
              <p>
                New to EcoMind Fresh?{' '}
                <Link to="/register/customer" className="font-bold text-emerald-700 hover:underline">
                  Register as Customer
                </Link>
              </p>
            ) : (
              <p>
                Want to deliver farm produce?{' '}
                <Link to="/register/delivery" className="font-bold text-stone-900 hover:underline">
                  Register as Delivery Partner
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-stone-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Role-Based Authentication with Cloud Firestore</span>
        </div>
      </div>
    </div>
  );
};

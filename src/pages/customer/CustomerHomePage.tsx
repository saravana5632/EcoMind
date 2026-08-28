import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sprout, 
  Search, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Truck, 
  Apple, 
  Carrot, 
  Salad, 
  Wheat,
  Leaf,
  RefreshCw,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { Product, ProductCategory } from '../../types';
import { subscribeToProducts, seedProductsIfEmpty } from '../../services/productService';
import { ProductCard } from '../../components/customer/ProductCard';

export const CustomerHomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const navigate = useNavigate();

  useEffect(() => {
    // Check and seed sample farm items if DB is newly initialized
    seedProductsIfEmpty();

    const unsub = subscribeToProducts((data) => {
      setProducts(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/customer/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/customer/products');
    }
  };

  const categories = [
    { name: 'All', icon: <Sprout className="w-4 h-4" />, count: products.length },
    { name: 'Fruits', icon: <Apple className="w-4 h-4" />, count: products.filter(p => p.category === 'Fruits').length },
    { name: 'Vegetables', icon: <Carrot className="w-4 h-4" />, count: products.filter(p => p.category === 'Vegetables').length },
    { name: 'Leafy Vegetables', icon: <Salad className="w-4 h-4" />, count: products.filter(p => p.category === 'Leafy Vegetables').length },
    { name: 'Grains', icon: <Wheat className="w-4 h-4" />, count: products.filter(p => p.category === 'Grains').length },
  ];

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  // Freshness highlights (harvested today)
  const todayHarvests = products.filter(p => 
    p.freshness.toLowerCase().includes('today') || p.freshness.toLowerCase().includes('4h')
  ).slice(0, 4);

  return (
    <div className="space-y-10 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 sm:mt-6 p-6 sm:p-10 lg:p-14 shadow-xl border border-slate-800/80">
        
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-6 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Direct Farm to Doorstep • Zero Middlemen</span>
          </div>

          {/* Main Title & Subtitle */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
            Fresh From Farmers <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-200 to-amber-200">
              to Your Door
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-200 font-medium leading-relaxed max-w-2xl">
            Better prices for farmers. Fresher produce for you.
          </p>

          <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
            Harvested at dawn by regional growers, packed at farm hubs, and delivered directly to your doorstep within 4 hours.
          </p>

          {/* Search Bar on Hero */}
          <form onSubmit={handleSearchSubmit} className="mt-8 max-w-xl">
            <div className="relative flex items-center bg-white rounded-2xl p-1.5 shadow-xl ring-1 ring-black/5">
              <div className="pl-3.5 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search fresh fruits and vegetables..."
                className="w-full px-3 py-2 text-xs sm:text-sm text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400 font-medium"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs shrink-0 flex items-center gap-1.5"
              >
                <span>Search</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Quick stats pills */}
          <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-slate-300 font-medium">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-xs border border-white/10">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Harvest to Door: &lt; 4 Hours</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-xs border border-white/10">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>40% More Income to Farmers</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-xs border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Traceable Origins</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Selection Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Explore Fresh Categories</h2>
            <p className="text-xs text-slate-500">Naturally cultivated produce straight from certified growers</p>
          </div>
          <Link
            to="/customer/products"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All ({products.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/80 shadow-2xs hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-emerald-700'
                  }`}
                >
                  {cat.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-xs sm:text-sm font-bold truncate">{cat.name}</span>
                  <span className={`text-[11px] block ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                    {cat.count} produce
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Today's Dawn Harvest Spotlight */}
      {todayHarvests.length > 0 && selectedCategory === 'All' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-amber-50/60 rounded-3xl p-6 border border-amber-200/70 mb-8 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
              <div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3 text-amber-800 animate-pulse" />
                  <span>Harvested Today</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Dawn Harvest Spotlight (Morning Pickings)
                </h3>
                <p className="text-xs text-slate-600">
                  Picked at sunrise from nearby farms. Crisp, nutritious, and at peak flavor.
                </p>
              </div>

              <Link
                to="/customer/products?freshness=today"
                className="text-xs font-bold text-amber-900 hover:underline flex items-center gap-1"
              >
                <span>Browse Today's Pickings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {todayHarvests.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Farm Produce Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {selectedCategory === 'All' ? 'All Farm Fresh Produce' : selectedCategory}
            </h2>
            <p className="text-xs text-slate-500">
              Shared live from EcoMind Agri farmer catalog
            </p>
          </div>

          <div className="text-xs text-slate-500">
            Showing <strong className="text-slate-800">{filteredProducts.length}</strong> items
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-emerald-600 mb-2" />
            <p className="text-xs font-medium">Connecting to farm catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs">
            <Sprout className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No produce found in this category</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Check back soon as farmers upload fresh harvests or switch to another category.
            </p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"
            >
              Show All Produce
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Farm to Fork Transparency Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-emerald-400">
                <Leaf className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold">1. Farmer Listed</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Farmers in Application 1 set fair prices and upload real-time harvest quantities directly.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-emerald-400">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold">2. Quick Farm Dispatch</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Verified delivery partners accept orders and transport them in temperature-safe boxes.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold">3. Pure Doorstep Freshness</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                You receive wholesome greens, fruits, and grains with full farm traceability and zero preservatives.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

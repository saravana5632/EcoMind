import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  RefreshCw, 
  Sprout, 
  Sparkles, 
  MapPin, 
  User, 
  Check, 
  X,
  ArrowUpDown
} from 'lucide-react';
import { Product, ProductCategory } from '../../types';
import { subscribeToProducts, seedProductsIfEmpty } from '../../services/productService';
import { ProductCard } from '../../components/customer/ProductCard';

export const CustomerProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';
  const initialFreshness = searchParams.get('freshness') || 'All';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [freshnessFilter, setFreshnessFilter] = useState<string>(initialFreshness);
  const [maxPrice, setMaxPrice] = useState<number>(400);
  const [onlyOrganic, setOnlyOrganic] = useState<boolean>(false);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'name'>('featured');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  useEffect(() => {
    seedProductsIfEmpty();
    const unsub = subscribeToProducts((data) => {
      setProducts(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Update from URL params
  useEffect(() => {
    if (searchParams.get('category')) {
      setSelectedCategory(searchParams.get('category')!);
    }
    if (searchParams.get('search')) {
      setSearchQuery(searchParams.get('search')!);
    }
    if (searchParams.get('freshness')) {
      setFreshnessFilter(searchParams.get('freshness')!);
    }
  }, [searchParams]);

  const categories: (ProductCategory | 'All')[] = [
    'All',
    'Fruits',
    'Vegetables',
    'Leafy Vegetables',
    'Grains'
  ];

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // 1. Search filter: Name, Category, Farmer, Location
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        const matchesFarmer = item.farmerName.toLowerCase().includes(q);
        const matchesLocation = item.location.toLowerCase().includes(q);
        const matchesDesc = (item.description || '').toLowerCase().includes(q);

        if (!matchesName && !matchesCategory && !matchesFarmer && !matchesLocation && !matchesDesc) {
          return false;
        }
      }

      // 2. Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }

      // 3. Freshness filter
      if (freshnessFilter !== 'All') {
        if (freshnessFilter.toLowerCase() === 'today' && !item.freshness.toLowerCase().includes('today') && !item.freshness.toLowerCase().includes('4h')) {
          return false;
        }
      }

      // 4. Price filter
      if (item.price > maxPrice) {
        return false;
      }

      // 5. Organic filter
      if (onlyOrganic && !item.organicCertified) {
        return false;
      }

      // 6. In-Stock filter
      if (onlyInStock && (item.status === 'sold_out' || item.availableQuantity <= 0)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0; // default order
    });
  }, [products, searchQuery, selectedCategory, freshnessFilter, maxPrice, onlyOrganic, onlyInStock, sortBy]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setFreshnessFilter('All');
    setMaxPrice(400);
    setOnlyOrganic(false);
    setOnlyInStock(false);
    setSortBy('featured');
    setSearchParams({});
  };

  const hasActiveFilters = 
    searchQuery !== '' || 
    selectedCategory !== 'All' || 
    freshnessFilter !== 'All' || 
    maxPrice < 400 || 
    onlyOrganic || 
    onlyInStock;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Page Title & Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/80">
            🌱 Shared Farmer Catalog (Application 1 Source)
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">
            Direct Farm Produce Marketplace
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent pricing, zero wholesale markups, and same-day doorstep logistics
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search produce, farmer, city..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Categories Horizontal Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200/90 shadow-2xs hover:border-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        
        {/* Quick Filter Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setFreshnessFilter(freshnessFilter === 'today' ? 'All' : 'today')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold transition-all ${
              freshnessFilter === 'today'
                ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold shadow-2xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Harvested Today</span>
          </button>

          <button
            onClick={() => setOnlyOrganic(!onlyOrganic)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold transition-all ${
              onlyOrganic
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold shadow-2xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <Sprout className="w-3.5 h-3.5 text-emerald-600" />
            <span>Certified Organic</span>
          </button>

          <button
            onClick={() => setOnlyInStock(!onlyInStock)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold transition-all ${
              onlyInStock
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>In Stock Only</span>
          </button>
        </div>

        {/* Sorting & Advanced Filter Trigger */}
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1"
            >
              Reset Filters
            </button>
          )}

          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Produce Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count & Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-slate-500">
            Showing <strong className="text-slate-900">{filteredProducts.length}</strong> farm produce items
            {selectedCategory !== 'All' && <span> in <strong>{selectedCategory}</strong></span>}
            {searchQuery && <span> matching "<strong>{searchQuery}</strong>"</span>}
          </p>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-emerald-600 mb-3" />
            <p className="text-xs text-slate-500 font-medium">Loading live farm catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs">
            <Sprout className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">No farm produce matching your criteria</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Try adjusting your search keywords, lowering price constraints, or clearing specific filters.
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-4 px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

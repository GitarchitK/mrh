import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  LayoutGrid,
  List as ListIcon,
  Sparkles,
  Zap,
  Cable,
  Headphones,
  BatteryCharging,
  ShieldCheck,
  Cpu,
  Wrench,
  Check,
  Star,
  ChevronRight,
  ShoppingBag,
  Clock,
  MapPin,
  Truck,
  RotateCcw,
  Percent,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import {
  STORE_CATEGORIES,
  STORE_PRODUCTS,
  PRICE_RANGES,
  SORT_OPTIONS,
  getAllBrands,
  getStoreProducts,
} from '../../services/storeData';
import { StoreProduct, StoreCategory } from '../../types';
import { FlipkartProductCard } from '../../components/shop/FlipkartProductCard';
import { FlipkartProductModal } from '../../components/shop/FlipkartProductModal';
import { useCart } from '../../context/CartContext';
import { SeoHead } from '../../components/shared/SeoHead';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { fadeInUp, staggerContainer } from '../../lib/animations';

// Category icon map
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  all: Sparkles,
  chargers: Zap,
  cables: Cable,
  audio: Headphones,
  power_banks: BatteryCharging,
  protection: ShieldCheck,
  spares: Cpu,
  tools: Wrench,
};

export const ShopPage: React.FC = () => {
  const { category: routeCategory } = useParams<{ category?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { openCart, totalItems } = useCart();

  // Selected quick view product for modal
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);

  // Filter States
  const selectedCategory = routeCategory || searchParams.get('category') || 'all';
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [selectedBrand, setSelectedBrand] = useState<string>(searchParams.get('brand') || 'all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>(searchParams.get('price') || 'all');
  const [minRating, setMinRating] = useState<number>(Number(searchParams.get('rating')) || 0);
  const [assuredOnly, setAssuredOnly] = useState<boolean>(searchParams.get('assured') === 'true');
  const [inStockOnly, setInStockOnly] = useState<boolean>(searchParams.get('instock') === 'true');
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sort') || 'popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mobile Filter Drawer toggle
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);

  // Active Deals Banner State
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  // Promotional Banners
  const promotionalBanners = [
    {
      id: 1,
      badge: 'DUNLOP FLASH SALE',
      title: 'Grand Mobile Spares & Accessories Mela',
      subtitle: 'Flat 30% - 65% OFF on boAt Earphones, 65W Fast Chargers & Original Displays',
      cta: 'Explore Deals',
      category: 'chargers',
      gradient: 'from-[#18264B] via-[#1f356d] to-[#0f172a]',
      accent: 'text-amber-300',
    },
    {
      id: 2,
      badge: 'SAME-DAY DUNLOP PICKUP',
      title: 'Order Online & Pick Up in 15 Minutes',
      subtitle: 'Free counter collection at Bhajan Complex, 139 B.T. Road, Dunlop counter',
      cta: 'Shop Now',
      category: 'all',
      gradient: 'from-[#1e3a8a] via-[#1d4ed8] to-[#1e40af]',
      accent: 'text-emerald-300',
    },
    {
      id: 3,
      badge: 'GENUINE REPLACEMENT PARTS',
      title: 'Original Displays & Battery Packs with Warranty',
      subtitle: 'Tested high-grade screens for iPhone, Samsung, Xiaomi & OnePlus with fitting option',
      cta: 'Browse Spares',
      category: 'spares',
      gradient: 'from-[#831843] via-[#9d174d] to-[#701a75]',
      accent: 'text-pink-200',
    },
  ];

  // Rotate banner every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % promotionalBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [promotionalBanners.length]);

  // Sync state to URL params cleanly
  const updateUrlParams = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value || value === 'all' || value === '0' || value === 'false') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleCategorySelect = (catId: string) => {
    updateUrlParams('category', catId === 'all' ? null : catId);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    updateUrlParams('q', val.trim() ? val : null);
  };

  const handlePriceSelect = (rangeId: string) => {
    setSelectedPriceRange(rangeId);
    updateUrlParams('price', rangeId === 'all' ? null : rangeId);
  };

  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
    updateUrlParams('brand', brand === 'all' ? null : brand);
  };

  const handleRatingSelect = (rating: number) => {
    const nextRating = minRating === rating ? 0 : rating;
    setMinRating(nextRating);
    updateUrlParams('rating', nextRating > 0 ? String(nextRating) : null);
  };

  const handleAssuredToggle = () => {
    const nextVal = !assuredOnly;
    setAssuredOnly(nextVal);
    updateUrlParams('assured', nextVal ? 'true' : null);
  };

  const handleInStockToggle = () => {
    const nextVal = !inStockOnly;
    setInStockOnly(nextVal);
    updateUrlParams('instock', nextVal ? 'true' : null);
  };

  const handleSortChange = (sortId: string) => {
    setSortBy(sortId);
    updateUrlParams('sort', sortId);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedBrand('all');
    setSelectedPriceRange('all');
    setMinRating(0);
    setAssuredOnly(false);
    setInStockOnly(false);
    setSortBy('popular');
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const allBrands = useMemo(() => getAllBrands(), []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let priceFilter: { min?: number; max?: number } = {};
    if (selectedPriceRange !== 'all') {
      const found = PRICE_RANGES.find((r) => r.id === selectedPriceRange);
      if (found) {
        priceFilter = { min: found.min, max: found.max };
      }
    }

    return getStoreProducts({
      category: selectedCategory,
      search: searchQuery,
      brand: selectedBrand,
      minPrice: priceFilter.min,
      maxPrice: priceFilter.max,
      assuredOnly,
      inStockOnly,
      minRating: minRating > 0 ? minRating : undefined,
      sortBy: sortBy as any,
    });
  }, [
    selectedCategory,
    searchQuery,
    selectedBrand,
    selectedPriceRange,
    assuredOnly,
    inStockOnly,
    minRating,
    sortBy,
  ]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (searchQuery.trim()) count++;
    if (selectedBrand !== 'all') count++;
    if (selectedPriceRange !== 'all') count++;
    if (minRating > 0) count++;
    if (assuredOnly) count++;
    if (inStockOnly) count++;
    return count;
  }, [selectedCategory, searchQuery, selectedBrand, selectedPriceRange, minRating, assuredOnly, inStockOnly]);

  // Schema.org Structured Data
  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ElectronicsStore',
        '@id': 'https://mobilerepairinghouse.com/#store',
        name: 'Mobile Repairing House Store',
        description:
          'Official e-commerce & counter accessories store of Mobile Repairing House, Dunlop, Kolkata. Buy genuine mobile chargers, boAt earphones, display screens, tempered glass, and repair tools.',
        url: 'https://mobilerepairinghouse.com/shop',
        telephone: '+91 97327 89938',
        priceRange: '₹149 - ₹3,499',
        image: 'https://mobilerepairinghouse.com/images/logo.webp',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Bhajan Complex, 139 B.T. Road, Dunlop',
          addressLocality: 'Kolkata',
          addressRegion: 'West Bengal',
          postalCode: '700108',
          addressCountry: 'IN',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 22.6521,
          longitude: 88.3712,
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: '10:00',
            closes: '21:00',
          },
        ],
      },
      {
        '@type': 'ItemList',
        itemListElement: filteredProducts.slice(0, 12).map((prod, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            name: prod.name,
            image: prod.imageUrl || 'https://mobilerepairinghouse.com/images/logo-transparent.webp',
            description: prod.shortDesc,
            brand: {
              '@type': 'Brand',
              name: prod.brand,
            },
            offers: {
              '@type': 'Offer',
              priceCurrency: 'INR',
              price: (prod.pricePaise / 100).toFixed(2),
              itemCondition: 'https://schema.org/NewCondition',
              availability: prod.inStock
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
              seller: {
                '@type': 'Organization',
                name: 'Mobile Repairing House',
              },
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: prod.rating,
              reviewCount: prod.ratingCount,
            },
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://mobilerepairinghouse.com/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Shop & Accessories',
            item: 'https://mobilerepairinghouse.com/shop',
          },
        ],
      },
    ],
  };

  return (
    <div className="bg-[#f1f3f6] min-h-screen text-slate-800">
      <SeoHead
        title="Mobile Accessories, Chargers & Spares Online Store | Dunlop, Kolkata"
        description="Buy genuine Type-C fast chargers, boAt earphones, display screens, power banks, and smartphone accessories at Mobile Repairing House. Dunlop counter pickup & Kolkata delivery."
      />

      {/* Inject Rich Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      {/* 1. Flipkart-style Header Ticker & Deals Banner */}
      <div className="bg-[#18264B] text-white py-2 px-4 border-b border-white/10 text-xs shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-[#F15B45] text-white font-extrabold px-2 py-0.5 rounded text-[10px] tracking-wider uppercase animate-pulse">
              <Zap className="w-3 h-3 fill-white" />
              Special Offer
            </span>
            <span className="font-medium text-slate-200 text-[11px] sm:text-xs">
              ⚡ Extra 10% instant discount on In-Shop Counter Collection at Dunlop!
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-300">
            <span className="hidden sm:inline-flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              Counter Pickup in 15 Mins
            </span>
            <span className="hidden md:inline-block text-white/30">|</span>
            <span className="inline-flex items-center gap-1 text-emerald-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Genuine Brand Warranty
            </span>
          </div>
        </div>
      </div>

      {/* 2. Category Icon Horizontal Navigation Carousel */}
      <div className="bg-white border-b border-slate-200 shadow-2xs sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between overflow-x-auto no-scrollbar py-2.5 sm:py-3 gap-2 sm:gap-6">
            {STORE_CATEGORIES.map((cat) => {
              const IconComp = CATEGORY_ICONS[cat.id] || Sparkles;
              const isActive = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={cn(
                    'flex flex-col items-center justify-center shrink-0 min-w-[70px] sm:min-w-[84px] px-2 py-1.5 rounded-xl transition-all duration-200 group relative cursor-pointer',
                    isActive
                      ? 'text-[#2874f0] font-black'
                      : 'text-slate-600 hover:text-[#2874f0] font-semibold'
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-200 mb-1',
                      isActive
                        ? 'bg-[#2874f0] text-white shadow-md shadow-blue-500/25 scale-105'
                        : 'bg-slate-100 group-hover:bg-blue-50 text-slate-600 group-hover:text-[#2874f0]'
                    )}
                  >
                    <IconComp className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-[11px] sm:text-xs text-center leading-tight whitespace-nowrap">
                    {cat.name}
                  </span>
                  <span className="text-[9px] text-slate-400 font-normal">
                    {cat.count} items
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeCategoryIndicator"
                      className="absolute -bottom-2.5 w-8 h-1 bg-[#2874f0] rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* 3. Flipkart Promotional Banner Carousel */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeBannerIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
              className={cn(
                'bg-gradient-to-r p-6 sm:p-8 lg:p-10 text-white min-h-[160px] sm:min-h-[190px] flex flex-col justify-center relative overflow-hidden',
                promotionalBanners[activeBannerIndex].gradient
              )}
            >
              {/* Background decorative elements */}
              <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 bg-[radial-gradient(circle,_#fff_10%,_transparent_10%)] bg-[length:16px_16px]" />
              <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />

              <div className="relative z-10 max-w-2xl space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] sm:text-xs font-black tracking-wider uppercase">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>{promotionalBanners[activeBannerIndex].badge}</span>
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white leading-tight">
                  {promotionalBanners[activeBannerIndex].title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 max-w-xl leading-relaxed">
                  {promotionalBanners[activeBannerIndex].subtitle}
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() =>
                      handleCategorySelect(promotionalBanners[activeBannerIndex].category)
                    }
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{promotionalBanners[activeBannerIndex].cta}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] text-white/80 hidden sm:inline">
                    📍 Counter collection: Bhajan Complex, Dunlop
                  </span>
                </div>
              </div>

              {/* Dots indicator */}
              <div className="absolute bottom-3 right-4 sm:right-6 flex items-center gap-1.5">
                {promotionalBanners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveBannerIndex(i)}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300 cursor-pointer',
                      activeBannerIndex === i ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
                    )}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 4. Search, Active Filter Pills, and Sorting Toolbar */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-xl">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search chargers, boAt earphones, display screens, tempered glass..."
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2874f0] focus:ring-2 focus:ring-[#2874f0]/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* View Mode & Filter Drawer Button (Mobile/Tablet) */}
            <div className="flex items-center justify-between md:justify-end gap-2 shrink-0">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 cursor-pointer transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#2874f0]" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#2874f0] text-white text-[10px] font-black flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Grid / List View Toggles */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer',
                    viewMode === 'grid'
                      ? 'bg-white text-[#2874f0] shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer',
                    viewMode === 'list'
                      ? 'bg-white text-[#2874f0] shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                  title="List View"
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Flipkart-Style Sorting Bar (Desktop Tabs) */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs overflow-x-auto no-scrollbar gap-2">
            <div className="flex items-center gap-1 shrink-0">
              <span className="font-bold text-slate-700 uppercase tracking-wide text-[10px] mr-1.5">
                Sort By:
              </span>
              {SORT_OPTIONS.map((opt) => {
                const isSelected = sortBy === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSortChange(opt.id)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
                      isSelected
                        ? 'text-[#2874f0] bg-blue-50 font-bold border-b-2 border-[#2874f0] rounded-b-none'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <div className="text-[11px] text-slate-500 font-medium shrink-0 pl-3">
              Showing <span className="font-bold text-slate-800">{filteredProducts.length}</span>{' '}
              {filteredProducts.length === 1 ? 'product' : 'products'}
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
              <span className="text-[11px] font-bold text-slate-400 mr-1">Active Filters:</span>

              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-[#2874f0] text-xs font-bold border border-blue-200">
                  <span>Category: {STORE_CATEGORIES.find((c) => c.id === selectedCategory)?.name}</span>
                  <button onClick={() => handleCategorySelect('all')} className="hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                  <span>Query: "{searchQuery}"</span>
                  <button onClick={() => handleSearchChange('')} className="hover:text-slate-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedBrand !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                  <span>Brand: {selectedBrand}</span>
                  <button onClick={() => handleBrandSelect('all')} className="hover:text-slate-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedPriceRange !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                  <span>Price: {PRICE_RANGES.find((p) => p.id === selectedPriceRange)?.label}</span>
                  <button onClick={() => handlePriceSelect('all')} className="hover:text-slate-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {minRating > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                  <span>Rating: {minRating}★ & above</span>
                  <button onClick={() => handleRatingSelect(0)} className="hover:text-amber-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {assuredOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-[#1e3a8a] text-xs font-bold border border-blue-300">
                  <span>MRH Assured Only</span>
                  <button onClick={handleAssuredToggle} className="hover:text-blue-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {inStockOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-300">
                  <span>In Stock Only</span>
                  <button onClick={handleInStockToggle} className="hover:text-emerald-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-[#F15B45] hover:underline ml-1 cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* 5. Main Content: Sidebar Filters + Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Desktop Sidebar Faceted Filters */}
          <aside className="hidden lg:block bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-6 sticky top-40">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#2874f0]" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Filters
                </h3>
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-[#2874f0] hover:underline cursor-pointer"
                >
                  RESET
                </button>
              )}
            </div>

            {/* Filter: MRH Assured Toggle */}
            <div className="space-y-2">
              <div
                onClick={handleAssuredToggle}
                className={cn(
                  'p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all',
                  assuredOnly
                    ? 'bg-blue-50/70 border-blue-300 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center bg-white border border-slate-300 text-blue-600">
                    {assuredOnly && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 font-black italic text-xs tracking-tight bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                      MRH Assured
                    </span>
                    <p className="text-[10px] text-slate-500">Quality tested & fast counter pickup</p>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              </div>
            </div>

            {/* Filter: In Stock Only */}
            <div className="space-y-2">
              <label
                onClick={handleInStockToggle}
                className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none"
              >
                <div
                  className={cn(
                    'w-4 h-4 rounded border flex items-center justify-center transition-colors',
                    inStockOnly
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 bg-white'
                  )}
                >
                  {inStockOnly && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span>Exclude Out of Stock</span>
              </label>
            </div>

            {/* Filter: Price Range Presets */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Price Range
              </h4>
              <div className="space-y-1.5">
                {PRICE_RANGES.map((r) => {
                  const isChecked = selectedPriceRange === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => handlePriceSelect(isChecked ? 'all' : r.id)}
                      className={cn(
                        'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left',
                        isChecked
                          ? 'bg-blue-50 text-[#2874f0] font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      <span>{r.label}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-[#2874f0]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter: Customer Rating */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Customer Ratings
              </h4>
              <div className="space-y-1.5">
                {[4, 3].map((starVal) => {
                  const isChecked = minRating === starVal;
                  return (
                    <button
                      key={starVal}
                      onClick={() => handleRatingSelect(starVal)}
                      className={cn(
                        'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left',
                        isChecked
                          ? 'bg-amber-50 text-amber-900 font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="flex items-center text-amber-500 font-bold">
                          {starVal}★ & above
                        </span>
                      </div>
                      {isChecked && <Check className="w-3.5 h-3.5 text-amber-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter: Brands */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Brand
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {allBrands.map((brand) => {
                  const isChecked = selectedBrand === brand;
                  return (
                    <button
                      key={brand}
                      onClick={() => handleBrandSelect(isChecked ? 'all' : brand)}
                      className={cn(
                        'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left',
                        isChecked
                          ? 'bg-blue-50 text-[#2874f0] font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      <span>{brand}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-[#2874f0]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dunlop Location Stamp */}
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  Physical store pickup at <strong>Bhajan Complex, 139 B.T. Road, Dunlop, Kolkata 700108</strong>.
                </span>
              </div>
            </div>
          </aside>

          {/* Products Grid / List Display */}
          <div className="lg:col-span-3 space-y-6">
            {filteredProducts.length === 0 ? (
              /* Empty state */
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="text-lg font-bold text-slate-800">
                    No matching accessories or spares found
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    We couldn't find items matching your current filters. Try relaxing your price or brand filters, or search for a generic term like "charger" or "cable".
                  </p>
                </div>
                <div>
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-[#2874f0] hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  'grid gap-3 sm:gap-4',
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3'
                    : 'grid-cols-1'
                )}
              >
                {filteredProducts.map((product) => (
                  <FlipkartProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                    onOpenQuickView={(prod) => setSelectedProduct(prod)}
                  />
                ))}
              </div>
            )}

            {/* Trust Features Bar (Flipkart style) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
              <div className="bg-white rounded-xl p-3 border border-slate-200 text-center space-y-1 shadow-2xs">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2874f0] flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h5 className="text-xs font-bold text-slate-800">100% Genuine</h5>
                <p className="text-[10px] text-slate-500">Directly sourced brand items</p>
              </div>

              <div className="bg-white rounded-xl p-3 border border-slate-200 text-center space-y-1 shadow-2xs">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <MapPin className="w-4 h-4" />
                </div>
                <h5 className="text-xs font-bold text-slate-800">Dunlop Counter Pickup</h5>
                <p className="text-[10px] text-slate-500">Ready in 15 mins at B.T. Road</p>
              </div>

              <div className="bg-white rounded-xl p-3 border border-slate-200 text-center space-y-1 shadow-2xs">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <Truck className="w-4 h-4" />
                </div>
                <h5 className="text-xs font-bold text-slate-800">Express Kolkata Delivery</h5>
                <p className="text-[10px] text-slate-500">Same-day dispatch available</p>
              </div>

              <div className="bg-white rounded-xl p-3 border border-slate-200 text-center space-y-1 shadow-2xs">
                <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <h5 className="text-xs font-bold text-slate-800">Warranty Backed</h5>
                <p className="text-[10px] text-slate-500">Up to 1 year replacement</p>
              </div>
            </div>

            {/* SEO & Customer Information Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-2xs">
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900">
                  Buy Genuine Mobile Accessories & Replacement Spares in Dunlop, Kolkata
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Welcome to the online store of <strong>Mobile Repairing House</strong>, Dunlop's premier smartphone repair and accessories hub located at <strong>Bhajan Complex, 139 B.T. Road, Dunlop, Kolkata 700108</strong>. We offer high-quality 65W/33W fast chargers, braided Type-C to Lightning cables, boAt audio earphones, high-capacity power banks, edge-to-edge tempered glasses, and OEM-grade display spare parts for iPhone, Samsung, OnePlus, Xiaomi, and Realme.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>How does WhatsApp Ordering Work?</span>
                  </h4>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Click "Buy Now" or "Add to Cart" and checkout directly through WhatsApp. Our system generates a complete formatted bill sent directly to <strong>Debasish (+91 97327 89938)</strong>. You can choose to collect your items immediately at our Dunlop counter or get them delivered across Kolkata.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Need Display Replacement & Fitting?</span>
                  </h4>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Order your display or battery spare online and bring your phone to our shop. Our technicians provide same-day precision installation and testing right in front of you with 90-day warranty.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Mobile Faceted Filter Drawer (Slide up modal) */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative bg-white rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl z-10"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#2874f0]" />
                  <span className="text-sm font-bold text-slate-800">Filters & Sorting</span>
                </div>
                <div className="flex items-center gap-3">
                  {activeFilterCount > 0 && (
                    <button
                      onClick={handleResetFilters}
                      className="text-xs font-bold text-[#F15B45]"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="overflow-y-auto p-4 space-y-6">
                {/* MRH Assured */}
                <div
                  onClick={handleAssuredToggle}
                  className={cn(
                    'p-3 rounded-xl border flex items-center justify-between cursor-pointer',
                    assuredOnly
                      ? 'bg-blue-50/70 border-blue-300'
                      : 'bg-slate-50 border-slate-200'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center bg-white border border-slate-300 text-blue-600">
                      {assuredOnly && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className="font-black italic text-xs tracking-tight bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                      MRH Assured Only
                    </span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                </div>

                {/* Price Presets */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase">Price Range</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {PRICE_RANGES.map((r) => {
                      const isChecked = selectedPriceRange === r.id;
                      return (
                        <button
                          key={r.id}
                          onClick={() => handlePriceSelect(isChecked ? 'all' : r.id)}
                          className={cn(
                            'p-2 rounded-xl text-xs font-semibold border text-center transition-colors',
                            isChecked
                              ? 'bg-blue-50 border-[#2874f0] text-[#2874f0]'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          )}
                        >
                          {r.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Brands */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase">Brands</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {allBrands.map((brand) => {
                      const isChecked = selectedBrand === brand;
                      return (
                        <button
                          key={brand}
                          onClick={() => handleBrandSelect(isChecked ? 'all' : brand)}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                            isChecked
                              ? 'bg-blue-50 border-[#2874f0] text-[#2874f0]'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          )}
                        >
                          {brand}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Ratings */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase">Minimum Rating</h4>
                  <div className="flex gap-2">
                    {[4, 3].map((starVal) => {
                      const isChecked = minRating === starVal;
                      return (
                        <button
                          key={starVal}
                          onClick={() => handleRatingSelect(starVal)}
                          className={cn(
                            'flex-1 py-2 rounded-xl text-xs font-bold border text-center transition-colors',
                            isChecked
                              ? 'bg-amber-50 border-amber-500 text-amber-900'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          )}
                        >
                          {starVal}★ & above
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Apply CTA */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-3">
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full py-3 bg-[#2874f0] text-white font-bold text-xs rounded-xl shadow-md uppercase tracking-wider"
                >
                  Apply Filters ({filteredProducts.length} items)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. Flipkart Product Quick View Modal */}
      <FlipkartProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};

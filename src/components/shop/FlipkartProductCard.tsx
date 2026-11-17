import React from 'react';
import { Star, ShieldCheck, ShoppingCart, Zap, Heart, Check, Clock } from 'lucide-react';
import { StoreProduct } from '../../types';
import { formatPaiseToINR } from '../../lib/money';
import { useCart } from '../../context/CartContext';
import { cn } from '../../lib/utils';

interface FlipkartProductCardProps {
  product: StoreProduct;
  onOpenQuickView: (product: StoreProduct) => void;
  viewMode?: 'grid' | 'list';
}

export const FlipkartProductCard: React.FC<FlipkartProductCardProps> = ({
  product,
  onOpenQuickView,
  viewMode = 'grid',
}) => {
  const { addToCart } = useCart();

  const discountPercent = Math.round(
    ((product.mrpPaise - product.pricePaise) / product.mrpPaise) * 100
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  // Render Category Icon / Image placeholder if no image
  const renderProductImage = () => {
    return (
      <div className="relative w-full h-full flex items-center justify-center p-4 bg-gradient-to-b from-brand-light/30 to-white overflow-hidden group-hover:scale-105 transition-transform duration-300">
        <img
          src="/images/logo-transparent.webp"
          alt={product.name}
          className="w-24 h-24 sm:w-28 sm:h-28 object-contain opacity-90 drop-shadow-sm group-hover:rotate-1 transition-transform"
        />

        {/* Category Pill Tag */}
        <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-brand-navy/80 backdrop-blur-xs text-[10px] font-bold text-white uppercase tracking-wider">
          {product.categoryLabel}
        </span>
      </div>
    );
  };

  if (viewMode === 'list') {
    return (
      <div
        onClick={() => onOpenQuickView(product)}
        className="bg-white rounded-2xl border border-brand-border hover:border-brand-navy/30 hover:shadow-lg transition-all duration-200 p-4 sm:p-5 flex flex-col sm:flex-row gap-5 cursor-pointer group"
      >
        {/* Left: Product Thumbnail */}
        <div className="w-full sm:w-52 h-44 shrink-0 rounded-xl overflow-hidden bg-brand-light border border-brand-border/60 relative">
          {renderProductImage()}
          {discountPercent > 0 && (
            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Middle: Details & Specs */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-secondary uppercase">{product.brand}</span>
            {product.flipkartAssured && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                <ShieldCheck className="w-3 h-3 text-blue-600" />
                <span>MRH Assured</span>
              </span>
            )}
            {product.badge && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                {product.badge}
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-brand-navy group-hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h3>

          {/* Flipkart Rating Badge */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-700 text-white text-xs font-bold shadow-2xs">
              <span>{product.rating}</span>
              <Star className="w-3 h-3 fill-white text-white" />
            </div>
            <span className="text-xs font-medium text-brand-secondary">
              ({product.ratingCount} ratings)
            </span>
          </div>

          {/* Features Bullets */}
          <ul className="text-xs text-brand-text/80 space-y-1 pt-1">
            {product.features.slice(0, 3).map((feat, idx) => (
              <li key={idx} className="flex items-center gap-1.5 line-clamp-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange shrink-0" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Pricing & CTA */}
        <div className="sm:w-56 sm:border-l sm:border-brand-border sm:pl-5 flex flex-col justify-between pt-3 sm:pt-0 border-t sm:border-t-0 border-brand-border">
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-brand-navy">
                {formatPaiseToINR(product.pricePaise)}
              </span>
              <del className="text-xs text-brand-secondary font-medium">
                {formatPaiseToINR(product.mrpPaise)}
              </del>
              <span className="text-xs font-bold text-emerald-700">
                {discountPercent}% off
              </span>
            </div>

            <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Free Counter Pickup at Dunlop</span>
            </div>
            <div className="text-[10px] text-brand-secondary">
              Warranty: {product.warranty}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 py-2 px-3 rounded-xl border border-brand-border hover:bg-brand-light font-bold text-xs text-brand-navy flex items-center justify-center gap-1.5 transition-all shadow-2xs"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-brand-orange hover:brightness-105 font-bold text-xs text-white flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 fill-white text-white" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Flipkart Grid View Card
  return (
    <div
      onClick={() => onOpenQuickView(product)}
      className="bg-white rounded-3xl border border-brand-border hover:border-brand-navy/30 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer group relative"
    >
      {/* Top Banner Tag: Discount & Assured */}
      <div className="relative aspect-square w-full bg-brand-light/30 border-b border-brand-border/60 overflow-hidden">
        {renderProductImage()}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10">
          {discountPercent > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
          {product.badge && (
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-brand-navy text-[10px] font-black uppercase tracking-wider shadow-xs">
              {product.badge}
            </span>
          )}
        </div>

        {/* Assured Logo top right */}
        {product.flipkartAssured && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[10px] font-extrabold text-blue-700 shadow-sm border border-blue-100 z-10">
            <ShieldCheck className="w-3 h-3 text-blue-600" />
            <span>Assured</span>
          </span>
        )}
      </div>

      {/* Product Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">
            {product.brand}
          </div>

          <h3 className="text-sm font-bold text-brand-navy group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Star Rating Badge */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-700 text-white text-[11px] font-bold shadow-2xs">
              <span>{product.rating}</span>
              <Star className="w-2.5 h-2.5 fill-white text-white" />
            </div>
            <span className="text-[11px] font-medium text-brand-secondary">
              ({product.ratingCount})
            </span>
          </div>

          {/* Quick Highlight */}
          <p className="text-[11px] text-brand-secondary line-clamp-1 pt-0.5">
            {product.shortDesc}
          </p>
        </div>

        {/* Price & Actions */}
        <div className="pt-2 border-t border-brand-border/60 space-y-2.5">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-brand-navy">
                {formatPaiseToINR(product.pricePaise)}
              </span>
              <del className="text-xs text-brand-secondary font-medium">
                {formatPaiseToINR(product.mrpPaise)}
              </del>
              <span className="text-xs font-bold text-emerald-700">
                {discountPercent}% off
              </span>
            </div>
            <div className="text-[10px] font-bold text-emerald-800 flex items-center gap-1 mt-0.5">
              <span>Free Counter Pickup at Dunlop</span>
            </div>
          </div>

          {/* Action Button Row */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full py-2 px-2.5 rounded-xl border border-brand-border hover:bg-brand-light font-bold text-xs text-brand-navy flex items-center justify-center gap-1 transition-all shadow-2xs"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Cart</span>
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="w-full py-2 px-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-brand-orange hover:brightness-105 font-bold text-xs text-white flex items-center justify-center gap-1 transition-all shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 fill-white text-white" />
              <span>Buy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

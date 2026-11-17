import React, { useState } from 'react';
import {
  X,
  Star,
  ShieldCheck,
  ShoppingCart,
  Zap,
  MapPin,
  Tag,
  Check,
  Truck,
  RotateCcw,
  Sparkles,
  MessageSquare,
  Share2,
} from 'lucide-react';
import { StoreProduct } from '../../types';
import { formatPaiseToINR } from '../../lib/money';
import { useCart } from '../../context/CartContext';
import { createWhatsAppUrl } from '../../lib/whatsapp';
import { Button } from '../ui/Button';

interface FlipkartProductModalProps {
  product: StoreProduct | null;
  onClose: () => void;
}

export const FlipkartProductModal: React.FC<FlipkartProductModalProps> = ({
  product,
  onClose,
}) => {
  const { addToCart } = useCart();
  const [pincode, setPincode] = useState('700108');
  const [pincodeChecked, setPincodeChecked] = useState(true);
  const [selectedQty, setSelectedQty] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!product) return null;

  const discountPercent = Math.round(
    ((product.mrpPaise - product.pricePaise) / product.mrpPaise) * 100
  );

  const savingsPaise = product.mrpPaise - product.pricePaise;

  const handleAddToCart = () => {
    addToCart(product, selectedQty);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const whatsAppInquiryUrl = createWhatsAppUrl(
    `Hello Debasish, I am interested in buying *${product.name}* (Price: ${formatPaiseToINR(product.pricePaise)}) from Mobile Repairing House. Is it in stock at your Dunlop shop?`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-brand-navy/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-brand-border w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header Bar */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 bg-brand-light border-b border-brand-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary bg-white px-2.5 py-1 rounded-full border border-brand-border">
              {product.categoryLabel}
            </span>
            {product.flipkartAssured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>MRH Assured Genuine</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 rounded-xl text-brand-secondary hover:text-brand-navy hover:bg-white transition-colors"
              title="Copy share link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-brand-secondary hover:text-brand-navy hover:bg-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
          {/* Left Column: Product Showcase Photo & CTA */}
          <div className="md:col-span-5 space-y-4 sm:space-y-5">
            <div className="aspect-square rounded-2xl sm:rounded-3xl bg-brand-light/50 border border-brand-border/80 p-4 sm:p-8 flex items-center justify-center relative overflow-hidden group">
              <img
                src="/images/logo-transparent.webp"
                alt={product.name}
                className="w-40 h-40 sm:w-48 sm:h-48 object-contain drop-shadow-md group-hover:scale-105 transition-transform"
              />
              {discountPercent > 0 && (
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black uppercase tracking-wider shadow-sm">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Quick Actions Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={handleAddToCart}
                leftIcon={<ShoppingCart className="w-4 h-4" />}
                className="font-bold text-xs"
              >
                Add to Cart
              </Button>
              <a
                href={whatsAppInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <Button
                  variant="glow"
                  size="md"
                  leftIcon={<MessageSquare className="w-4 h-4" />}
                  className="w-full font-bold text-xs bg-emerald-600 hover:bg-emerald-700"
                >
                  Order via WhatsApp
                </Button>
              </a>
            </div>

            {/* In-Shop Guarantee Card */}
            <div className="p-4 rounded-2xl bg-brand-light/80 border border-brand-border space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-brand-navy">
                <Truck className="w-4 h-4 text-brand-orange" />
                <span>Dunlop Counter Pickup & Delivery</span>
              </div>
              <p className="text-[11px] text-brand-secondary leading-relaxed">
                Walk into our counter at <strong>Bhajan Complex, 139 B.T. Road, Dunlop, Kolkata 700108</strong> for free testing & counter collection.
              </p>
            </div>
          </div>

          {/* Right Column: Title, Pricing, Offers & Specs */}
          <div className="md:col-span-7 space-y-6">
            <div>
              <div className="text-xs font-bold text-brand-secondary uppercase tracking-wider">
                Brand: {product.brand}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-brand-navy tracking-tight mt-1">
                {product.name}
              </h2>

              {/* Rating Summary */}
              <div className="flex items-center gap-3 mt-2">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-700 text-white text-xs font-bold shadow-2xs">
                  <span>{product.rating}</span>
                  <Star className="w-3.5 h-3.5 fill-white text-white" />
                </div>
                <span className="text-xs font-semibold text-brand-secondary">
                  {product.ratingCount} Ratings & Verified Reviews
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  {product.inStock ? 'In Stock (Ready at Shop)' : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-brand-navy">
                  {formatPaiseToINR(product.pricePaise)}
                </span>
                <del className="text-sm font-semibold text-brand-secondary">
                  {formatPaiseToINR(product.mrpPaise)}
                </del>
                <span className="text-sm font-black text-emerald-700">
                  {discountPercent}% off
                </span>
              </div>
              {savingsPaise > 0 && (
                <div className="text-xs font-bold text-emerald-800">
                  🎉 You save {formatPaiseToINR(savingsPaise)} on this item!
                </div>
              )}
            </div>

            {/* Available Special Offers */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-brand-navy uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-brand-orange" />
                Available Offers & Counter Perks
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-brand-light border border-brand-border/60">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-brand-navy">Free In-Shop Fitting:</strong> Free professional tempered glass application & device check at Dunlop counter.
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-brand-light border border-brand-border/60">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-brand-navy">UPI Cashback / Discount:</strong> Instant 5% counter discount on direct UPI payments (GPay / PhonePe / Paytm).
                  </div>
                </div>
              </div>
            </div>

            {/* Pincode & Delivery Checker */}
            <div className="p-4 rounded-2xl bg-white border border-brand-border space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-brand-navy">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-orange" />
                  Check Delivery & Counter Pickup:
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter 6-digit Pincode"
                  className="flex-1 px-3 py-1.5 rounded-xl border border-brand-border text-xs text-brand-navy font-mono focus:outline-none focus:border-brand-navy"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPincodeChecked(true)}
                  className="text-xs"
                >
                  Check
                </Button>
              </div>
              {pincodeChecked && (
                <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    Available for {pincode === '700108' ? 'Dunlop, Kolkata' : `Pincode ${pincode}`}: Free Counter Pickup Today &bull; Local Express Delivery Tomorrow
                  </span>
                </div>
              )}
            </div>

            {/* Full Specifications Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider pb-1 border-b border-brand-border">
                Product Specifications
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="p-2.5 rounded-xl bg-brand-light/60 border border-brand-border/60">
                    <span className="text-[10px] uppercase font-bold text-brand-secondary block">
                      {key}
                    </span>
                    <span className="font-semibold text-brand-navy">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Warranty & Return Policy */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-brand-light border border-brand-border">
                <span className="text-[10px] font-bold uppercase text-brand-secondary block">Warranty</span>
                <span className="font-bold text-brand-navy">{product.warranty}</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-light border border-brand-border">
                <span className="text-[10px] font-bold uppercase text-brand-secondary block">Exchange Policy</span>
                <span className="font-bold text-brand-navy">{product.returnPolicy}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

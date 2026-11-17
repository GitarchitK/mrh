import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ShieldCheck,
  ArrowRight,
  MessageSquare,
  Truck,
  Store,
  Tag,
  Check,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPaiseToINR } from '../../lib/money';
import { Button } from '../ui/Button';

export const FlipkartCartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartSubtotalPaise,
    cartMrpPaise,
    cartSavingsPaise,
    generateWhatsAppOrderUrl,
  } = useCart();

  const [deliveryMode, setDeliveryMode] = useState<'pickup' | 'delivery'>('pickup');
  const [customerNotes, setCustomerNotes] = useState('');

  if (!isCartOpen) return null;

  const handlePlaceOrder = () => {
    const url = generateWhatsAppOrderUrl(deliveryMode, customerNotes);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-brand-navy/60 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={closeCart} />

      {/* Slide-in Drawer Container */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-slideInRight">
        {/* Cart Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-brand-navy to-brand-navy-light text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-brand-orange" />
            <h2 className="text-base font-black tracking-tight">My Cart ({cartCount})</h2>
          </div>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-[11px] font-semibold text-rose-300 hover:text-white transition-colors mr-2"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={closeCart}
              className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cart Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-brand-light flex items-center justify-center text-brand-secondary mx-auto border border-brand-border">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-brand-navy">Your Cart is Empty</h3>
              <p className="text-xs text-brand-secondary max-w-xs mx-auto">
                Explore our fast chargers, audio earphones, tempered glass, and mobile replacement parts!
              </p>
              <div className="pt-2">
                <Button variant="glow" size="sm" onClick={closeCart}>
                  Continue Shopping
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Delivery / Pickup Method Selection */}
              <div className="p-3.5 rounded-2xl bg-brand-light/70 border border-brand-border space-y-2">
                <span className="text-[11px] font-bold text-brand-navy uppercase tracking-wider block">
                  Select Fulfillment Mode:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setDeliveryMode('pickup')}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all text-left font-bold ${
                      deliveryMode === 'pickup'
                        ? 'border-brand-orange bg-brand-orange/5 text-brand-orange ring-1 ring-brand-orange/30'
                        : 'border-brand-border bg-white text-brand-navy hover:bg-brand-light'
                    }`}
                  >
                    <Store className="w-4 h-4 shrink-0" />
                    <div>
                      <div className="leading-tight">Counter Pickup</div>
                      <div className="text-[10px] font-normal text-brand-secondary">Dunlop Shop (Free)</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMode('delivery')}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all text-left font-bold ${
                      deliveryMode === 'delivery'
                        ? 'border-brand-orange bg-brand-orange/5 text-brand-orange ring-1 ring-brand-orange/30'
                        : 'border-brand-border bg-white text-brand-navy hover:bg-brand-light'
                    }`}
                  >
                    <Truck className="w-4 h-4 shrink-0" />
                    <div>
                      <div className="leading-tight">Local Delivery</div>
                      <div className="text-[10px] font-normal text-brand-secondary">Express Kolkata</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {cart.map((item) => {
                  const itemDiscount = Math.round(
                    ((item.product.mrpPaise - item.product.pricePaise) / item.product.mrpPaise) * 100
                  );

                  return (
                    <div
                      key={item.product.id}
                      className="p-3.5 rounded-2xl bg-white border border-brand-border shadow-2xs space-y-3"
                    >
                      <div className="flex gap-3">
                        {/* Thumbnail */}
                        <div className="w-16 h-16 rounded-xl bg-brand-light border border-brand-border/60 shrink-0 p-1 flex items-center justify-center">
                          <img
                            src="/images/logo-transparent.webp"
                            alt={item.product.name}
                            className="w-12 h-12 object-contain"
                          />
                        </div>

                        {/* Title & Brand */}
                        <div className="flex-1 space-y-1">
                          <div className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">
                            {item.product.brand}
                          </div>
                          <h4 className="text-xs font-bold text-brand-navy line-clamp-1 leading-snug">
                            {item.product.name}
                          </h4>
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-black text-brand-navy">
                              {formatPaiseToINR(item.product.pricePaise)}
                            </span>
                            <del className="text-[11px] text-brand-secondary">
                              {formatPaiseToINR(item.product.mrpPaise)}
                            </del>
                            <span className="text-[10px] font-bold text-emerald-700">
                              {itemDiscount}% off
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stepper & Remove */}
                      <div className="flex items-center justify-between pt-2 border-t border-brand-border/60 text-xs">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-brand-border rounded-lg overflow-hidden bg-brand-light/50">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="p-1 px-2 hover:bg-brand-navy hover:text-white transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 py-0.5 text-xs font-bold text-brand-navy bg-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="p-1 px-2 hover:bg-brand-navy hover:text-white transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Remove item */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-xs font-bold text-brand-secondary hover:text-rose-600 flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Customer Notes */}
              <div>
                <label className="block text-[11px] font-bold text-brand-navy uppercase tracking-wider mb-1">
                  Order Instructions / Preference (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please bring tempered glass for Samsung M31"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-brand-border text-xs text-brand-navy focus:outline-none focus:border-brand-navy"
                />
              </div>

              {/* Order Summary & Price Details Card */}
              <div className="p-4 rounded-2xl bg-brand-light border border-brand-border space-y-2.5 text-xs">
                <span className="font-extrabold text-[11px] uppercase tracking-wider text-brand-secondary block pb-1 border-b border-brand-border">
                  Price Details ({cartCount} Items)
                </span>

                <div className="flex justify-between items-center text-brand-secondary">
                  <span>Total MRP:</span>
                  <span className="font-medium text-brand-navy">{formatPaiseToINR(cartMrpPaise)}</span>
                </div>

                <div className="flex justify-between items-center text-emerald-700">
                  <span>Discount on MRP:</span>
                  <span className="font-bold">- {formatPaiseToINR(cartSavingsPaise)}</span>
                </div>

                <div className="flex justify-between items-center text-brand-secondary">
                  <span>Delivery Charges:</span>
                  <span className="font-bold text-emerald-700 uppercase">FREE</span>
                </div>

                <div className="pt-2 border-t border-brand-border flex justify-between items-center text-sm font-black text-brand-navy">
                  <span>Total Amount:</span>
                  <span className="text-base text-brand-orange">{formatPaiseToINR(cartSubtotalPaise)}</span>
                </div>

                {cartSavingsPaise > 0 && (
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-center text-[11px] border border-emerald-200">
                    🎉 You will save {formatPaiseToINR(cartSavingsPaise)} on this order!
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Checkout Bar */}
        {cart.length > 0 && (
          <div className="p-4 bg-white border-t border-brand-border shadow-lg space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-brand-secondary">Payable:</span>
              <span className="text-lg font-black text-brand-navy">
                {formatPaiseToINR(cartSubtotalPaise)}
              </span>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
            >
              <MessageSquare className="w-4 h-4" />
              <span>PLACE ORDER VIA WHATSAPP</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            <p className="text-[10px] text-center text-brand-secondary">
              Instant counter confirmation &bull; Cash or UPI upon handover
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

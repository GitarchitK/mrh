import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, MessageSquare, Check, Filter, Sparkles, ShoppingBag, ArrowRight, Zap } from 'lucide-react';
import { getAccessories } from '../../services/db';
import { AccessoryItem } from '../../types';
import { formatPaiseToINR } from '../../lib/money';
import { createWhatsAppUrl } from '../../lib/whatsapp';
import { Button } from '../../components/ui/Button';
import { SeoHead } from '../../components/shared/SeoHead';
import { fadeInUp, staggerContainer, cardHoverProps } from '../../lib/animations';

export const AccessoriesPage: React.FC = () => {
  const [accessories, setAccessories] = useState<AccessoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const list = await getAccessories();
      setAccessories(list);
      setLoading(false);
    };
    fetch();
  }, []);

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'chargers', label: 'Chargers & Cables' },
    { id: 'earphones', label: 'Earphones & Audio' },
    { id: 'power_banks', label: 'Power Banks' },
    { id: 'protection', label: 'Screen Protection' },
  ];

  const filtered = selectedCategory === 'all'
    ? accessories
    : accessories.filter((a) => a.category === selectedCategory);

  return (
    <div className="bg-brand-light min-h-screen py-10 sm:py-16">
      <SeoHead
        title="Mobile Accessories & Fast Chargers in Dunlop, Kolkata"
        description="Browse smartphone accessories at Mobile Repairing House in Dunlop. Type-C chargers, cables, earphones, and power banks."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10"
      >
        {/* Live E-Commerce Store Banner Link */}
        <motion.div
          variants={fadeInUp}
          className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-[#18264B] via-[#1f356d] to-[#2874f0] text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 border border-blue-400/20"
        >
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
              <Zap className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider mb-1">
                New Online Store
              </div>
              <h3 className="text-base sm:text-lg font-bold leading-tight">
                Looking for our Flipkart-Style Store with Online Ordering?
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Browse 20+ fast chargers, boAt earphones, display screens & repair tools with category filters and instant WhatsApp checkout.
              </p>
            </div>
          </div>
          <Link
            to="/shop"
            className="shrink-0 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <span>Visit Flipkart-Style Store</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div variants={fadeInUp} className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-bold uppercase tracking-wider">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Counter Essentials & Daily Hardware</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-navy tracking-tight">
            Mobile Accessories Showcase
          </h1>
          <p className="text-sm sm:text-base text-brand-secondary leading-relaxed">
            Everyday mobile accessories available directly at our shop in Bhajan Complex, Dunlop. Message us on WhatsApp to confirm stock before visiting.
          </p>
        </motion.div>

        {/* Real In-Shop Counter Display Banner */}
        <motion.div
          variants={fadeInUp}
          className="rounded-3xl overflow-hidden bg-white border border-brand-border shadow-xs p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6"
        >
          <div className="w-full md:w-56 h-44 rounded-2xl overflow-hidden shrink-0 relative border border-brand-border">
            <img
              src="/images/store/accessories-display.webp"
              alt="Actual Accessories Counter Showcase at Dunlop"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[9px] font-bold">
              Real Counter Display
            </span>
          </div>
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-orange bg-brand-orange/10 px-2.5 py-1 rounded-full">
              In-Shop Physical Stock
            </span>
            <h3 className="text-xl font-bold text-brand-navy">
              Genuine Counter Display at Bhajan Complex
            </h3>
            <p className="text-xs text-brand-secondary leading-relaxed">
              We carry boAt Rockerz earphones, neckbands, fast Type-C charging adapters, braided cables, and power banks on display. Cash and UPI payments accepted across the counter.
            </p>
            <div className="pt-1">
              <a
                href={createWhatsAppUrl('Hello Debasish, I would like to check stock for an accessory at your Dunlop shop.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>Check stock availability on WhatsApp &rarr;</span>
              </a>
            </div>
          </div>
        </motion.div>

        {/* Category Filters with layout animation */}
        <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`relative px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'text-white bg-brand-navy shadow-md'
                    : 'bg-white text-brand-secondary hover:text-brand-navy border border-brand-border'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto border border-brand-border"
          >
            <Package className="w-10 h-10 text-brand-secondary/40 mx-auto mb-3" />
            <h4 className="text-base font-bold text-brand-navy">No products in this category</h4>
            <p className="text-xs text-brand-secondary mt-1">Please select another category or check back soon.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  {...cardHoverProps}
                  className="bg-white rounded-3xl p-6 border border-brand-border shadow-xs hover:shadow-card-hover hover:border-brand-navy/30 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-navy bg-brand-light px-2.5 py-1 rounded-full border border-brand-border">
                        {item.brand || 'Accessories'}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          item.inStock
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {item.inStock && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                        {item.inStock ? 'Available In-Shop' : 'Currently Out'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-brand-navy group-hover:text-brand-orange transition-colors mb-2 leading-snug">
                      {item.name}
                    </h3>

                    <p className="text-xs text-brand-secondary leading-relaxed mb-4">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-brand-border space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-brand-secondary">Counter Price:</span>
                      <span className="text-lg font-black text-brand-navy">
                        {item.pricePaise > 0 ? formatPaiseToINR(item.pricePaise) : 'Inquire'}
                      </span>
                    </div>

                    <a
                      href={createWhatsAppUrl(`Hello Debasish, is "${item.name}" available for pickup today at your Dunlop shop?`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full"
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                        leftIcon={<MessageSquare className="w-3.5 h-3.5 text-emerald-600" />}
                      >
                        Check Availability
                      </Button>
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Counter Purchase Note */}
        <motion.div
          variants={fadeInUp}
          className="bg-white p-6 rounded-3xl border border-brand-border max-w-2xl mx-auto text-center text-xs text-brand-secondary shadow-xs space-y-1"
        >
          <p className="font-bold text-brand-navy text-sm">Direct Counter Sales Notice:</p>
          <p>
            Accessories are sold directly across the counter at Bhajan Complex, 139 B.T. Road, Dunlop. Payment methods accepted include Cash and UPI.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

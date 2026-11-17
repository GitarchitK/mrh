import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Phone,
  MessageSquare,
  ArrowRight,
  MapPin,
  ExternalLink,
  HelpCircle,
  Cpu,
  BatteryCharging,
  Zap,
  Camera,
  Volume2,
  Wifi,
  Code,
  Shield,
  Droplets,
  Package,
  Sparkles,
  Award,
  Layers,
  Wrench,
  Check,
  ChevronRight,
  Activity,
  Star,
  HeartHandshake,
  ThumbsUp,
  Eye,
  Maximize2,
  ImageIcon,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { SeoHead } from '../../components/shared/SeoHead';
import { createWhatsAppUrl } from '../../lib/whatsapp';
import { FAQ_ITEMS } from '../../services/defaultData';
import { InteractiveRepairCalculator } from '../../components/home/InteractiveRepairCalculator';
import { FaqAccordion } from '../../components/shared/FaqAccordion';
import { fadeInUp, staggerContainer, staggerFast } from '../../lib/animations';

const ICON_MAP: Record<string, React.ElementType> = {
  Smartphone,
  BatteryCharging,
  Zap,
  Cpu,
  Camera,
  Volume2,
  Wifi,
  Code,
  Shield,
  Droplets,
};

export const HomePage: React.FC = () => {
  const { settings, enabledServices } = useSettings();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSatisfactionModal, setShowSatisfactionModal] = useState(false);
  const [heroPhotoTab, setHeroPhotoTab] = useState<'storefront' | 'bench' | 'accessories'>('storefront');
  const [lightboxPhoto, setLightboxPhoto] = useState<{ src: string; title: string; subtitle: string; tag: string } | null>(null);

  const STORE_PHOTOS = [
    {
      id: 'storefront',
      src: '/images/store/storefront-day.webp',
      title: 'Mobile Repairing House Storefront',
      tag: 'Bhajan Complex, Dunlop',
      desc: 'Our real shop located on Barrackpore Trunk Road at Bhajan Complex, Dunlop, Kolkata with roadside counter intake.',
    },
    {
      id: 'bench',
      src: '/images/store/workshop-bench.webp',
      title: 'Technician Diagnostic & Repair Bench',
      tag: 'In-Shop Hardware Lab',
      desc: 'In-shop micro-soldering, IC replacement, and precision display fitting station where Debasish inspects devices.',
    },
    {
      id: 'accessories',
      src: '/images/store/accessories-display.webp',
      title: 'Shop Counter Accessories Showcase',
      tag: 'In-Stock Accessories',
      desc: 'Genuine fast chargers, boAt audio, Type-C cables, and tempered screen protection on display.',
    },
    {
      id: 'banner',
      src: '/images/store/storefront-banner.webp',
      title: 'Official Shop Banner & Slogan',
      tag: 'We Fix It All',
      desc: '"The Mobile Display Is Gone But We\'ll Make It On" — screen and motherboard repair experts.',
    },
    {
      id: 'entrance',
      src: '/images/store/storefront-entrance.webp',
      title: 'Counter Consultation & Handover',
      tag: 'Direct Counter Service',
      desc: 'Customers interact directly with Debasish for device drop-off, bench testing, and collection.',
    },
  ];

  const categories = ['all', 'Display', 'Battery', 'Charging', 'Motherboard', 'Audio'];

  const filteredServices = selectedCategory === 'all'
    ? enabledServices
    : enabledServices.filter((s) => s.title.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <div className="flex flex-col min-h-screen bg-brand-light">
      <SeoHead
        title="Expert Android & iPhone Repair in Dunlop, Kolkata"
        description="Mobile Repairing House operated by Debasish in Bhajan Complex, Dunlop, Kolkata. Transparent diagnostics, upfront estimates, display replacement, and battery repair."
      />

      {/* 5.3 HERO SECTION WITH MODERN ANIMATIONS & FLOATING BADGES */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-navy-dark via-brand-navy to-brand-navy text-white pt-16 pb-24 sm:pt-20 sm:pb-32 border-b border-brand-navy-light/40">
        {/* Subtle grid and decorative lighting mesh */}
        <div className="absolute inset-0 bg-grid-pattern-dark opacity-30 pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-orange/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-[#3B82F6]/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Animated Headline, Badges & CTAs */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              {/* Location Badge & Official Shop Slogan */}
              <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card-dark text-white text-xs font-semibold shadow-xs">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange" />
                  </span>
                  <MapPin className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                  <span>Bhajan Complex, Dunlop &bull; Debasish</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-brand-orange/20 to-amber-500/20 border border-brand-orange/40 text-brand-orange-light text-[11px] font-black uppercase tracking-wider shadow-glow-orange">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>&ldquo;The Mobile Display Is Gone But We&rsquo;ll Make It On&rdquo;</span>
                </div>
              </motion.div>

              {/* Confident Headline */}
              <motion.h1
                variants={fadeInUp}
                className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]"
              >
                Your Phone Deserves <br className="hidden sm:inline" />
                <span className="text-gradient-orange">Expert Care.</span>
              </motion.h1>

              {/* Supporting Copy */}
              <motion.p
                variants={fadeInUp}
                className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
              >
                From cracked displays to motherboard short circuits, receive honest bench testing and transparent repair estimates before any work starts.
              </motion.p>

              {/* Customer Satisfaction Trust Showcase Pill */}
              <motion.div
                variants={fadeInUp}
                onClick={() => setShowSatisfactionModal(true)}
                className="cursor-pointer inline-flex items-center gap-3.5 p-2.5 pr-4 rounded-2xl glass-card-dark border border-white/20 hover:border-brand-orange/60 hover:bg-white/10 transition-all shadow-lg group select-none text-left"
              >
                {/* Stacked Customer Avatars */}
                <div className="flex -space-x-2 shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white text-[11px] font-black ring-2 ring-brand-navy shadow-sm">
                    D
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-[11px] font-black ring-2 ring-brand-navy shadow-sm">
                    S
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white text-[11px] font-black ring-2 ring-brand-navy shadow-sm">
                    A
                  </div>
                  <div className="w-8 h-8 rounded-full bg-brand-orange flex items-center justify-center text-white text-xs font-black ring-2 ring-brand-navy shadow-sm">
                    ★
                  </div>
                </div>

                {/* Stars & Text */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs font-black text-white tracking-wide">
                      100% Customer Satisfaction Priority
                    </span>
                  </div>
                  <div className="text-[11px] text-white/75 flex items-center gap-1 group-hover:text-brand-orange-light transition-colors mt-0.5">
                    <span>Inspect device at counter before paying &bull; Zero surprise fees</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link to="/repair-request" className="w-full sm:w-auto">
                  <Button size="lg" variant="glow" className="w-full sm:w-auto text-sm sm:text-base" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Request a Repair
                  </Button>
                </Link>
                <a
                  href={createWhatsAppUrl('Hello Debasish, I would like to enquire about a phone repair at your Dunlop shop.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/25 backdrop-blur-md"
                    leftIcon={<MessageSquare className="w-4 h-4 text-emerald-400" />}
                  >
                    Chat on WhatsApp
                  </Button>
                </a>
              </motion.div>

              {/* Compact Benefits */}
              <motion.div variants={fadeInUp} className="pt-6 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-brand-orange/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-orange" />
                  </div>
                  <span className="text-xs font-semibold text-white/90">Android & iPhone Support</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-brand-orange/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-orange" />
                  </div>
                  <span className="text-xs font-semibold text-white/90">Upfront Estimates Always</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-brand-orange/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-orange" />
                  </div>
                  <span className="text-xs font-semibold text-white/90">Local Dunlop Counter Care</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column: Live Storefront & Workshop Visual Showcase */}
            <div className="lg:col-span-5 relative flex justify-center">
              {/* Floating Pill 1: Official Workshop Branding */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="absolute -top-6 -left-4 sm:-left-8 z-20 animate-float-slow hidden sm:flex items-center gap-2.5 glass-card-dark px-4 py-2.5 rounded-2xl shadow-xl border border-white/20 text-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 p-0.5 border border-white/20">
                  <img src="/images/logo-transparent.webp" alt="Mobile Repairing House Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="font-bold text-white text-[11px]">Mobile Repairing House</div>
                  <div className="text-[10px] text-white/70">Dunlop Official Workshop</div>
                </div>
              </motion.div>

              {/* Floating Pill 2: Customer Satisfaction Focus */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                onClick={() => setShowSatisfactionModal(true)}
                className="cursor-pointer absolute -bottom-6 -right-2 sm:-right-6 z-20 animate-float-reverse hidden sm:flex items-center gap-2.5 glass-card-dark px-4 py-2.5 rounded-2xl shadow-xl border border-white/20 hover:border-brand-orange/60 text-xs transition-all"
              >
                <div className="w-7 h-7 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-[11px] flex items-center gap-1">
                    <span>Satisfaction First</span>
                    <span className="text-amber-400">★★★★★</span>
                  </div>
                  <div className="text-[10px] text-white/70">Inspect Device Before Paying</div>
                </div>
              </motion.div>

              {/* Central Workbench & Real Storefront Visual Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full max-w-md glass-card-dark rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/20 relative"
              >
                {/* Photo Switcher Navigation */}
                <div className="flex items-center justify-between pb-3.5 border-b border-white/10 gap-1.5">
                  <div className="flex items-center gap-1.5">
                    {[
                      { id: 'storefront', label: 'Storefront', icon: MapPin },
                      { id: 'bench', label: 'Bench', icon: Wrench },
                      { id: 'accessories', label: 'Accessories', icon: Package },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isSelected = heroPhotoTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setHeroPhotoTab(tab.id as any)}
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-brand-orange text-white shadow-glow-orange'
                              : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/15'
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const item =
                        heroPhotoTab === 'storefront'
                          ? { src: '/images/store/storefront-day.webp', title: 'Mobile Repairing House Storefront', subtitle: 'Bhajan Complex, 139 B.T. Road, Dunlop, Kolkata', tag: 'Real Shop Front' }
                          : heroPhotoTab === 'bench'
                          ? { src: '/images/store/workshop-bench.webp', title: 'Diagnostic & Repair Workbench', subtitle: 'Component-level motherboard repair & screen replacement', tag: 'Technician Bench' }
                          : { src: '/images/store/accessories-display.webp', title: 'Shop Counter Accessories Showcase', subtitle: 'Fast chargers, neckbands, earphones & power banks', tag: 'Counter Stock' };
                      setLightboxPhoto(item);
                    }}
                    className="p-1.5 rounded-xl bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                    title="View Full Resolution Photo"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Real Store Photo Viewport */}
                <div className="py-3">
                  <div
                    className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-brand-navy-dark border border-white/15 shadow-inner group cursor-pointer"
                    onClick={() => {
                      const item =
                        heroPhotoTab === 'storefront'
                          ? { src: '/images/store/storefront-day.webp', title: 'Mobile Repairing House Storefront', subtitle: 'Bhajan Complex, 139 B.T. Road, Dunlop, Kolkata', tag: 'Real Shop Front' }
                          : heroPhotoTab === 'bench'
                          ? { src: '/images/store/workshop-bench.webp', title: 'Diagnostic & Repair Workbench', subtitle: 'Component-level motherboard repair & screen replacement', tag: 'Technician Bench' }
                          : { src: '/images/store/accessories-display.webp', title: 'Shop Counter Accessories Showcase', subtitle: 'Fast chargers, neckbands, earphones & power banks', tag: 'Counter Stock' };
                      setLightboxPhoto(item);
                    }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={heroPhotoTab}
                        src={
                          heroPhotoTab === 'storefront'
                            ? '/images/store/storefront-day.webp'
                            : heroPhotoTab === 'bench'
                            ? '/images/store/workshop-bench.webp'
                            : '/images/store/accessories-display.webp'
                        }
                        alt="Mobile Repairing House Dunlop Shop"
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </AnimatePresence>

                    {/* Gradient Overlay & Badges */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Verified Dunlop Shop Photo</span>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-left text-white">
                      <div className="font-extrabold text-xs tracking-wide text-white drop-shadow-md">
                        {heroPhotoTab === 'storefront' && 'Bhajan Complex, 139 B.T. Road, Dunlop'}
                        {heroPhotoTab === 'bench' && 'In-Shop Repair Bench & Soldering Station'}
                        {heroPhotoTab === 'accessories' && 'Actual Counter Display & Audio Accessories'}
                      </div>
                      <div className="text-[10px] text-white/80 font-medium">
                        Click to view full photo &bull; Debasish: {settings.phone}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Authentic Slogan Callout Bar */}
                <div className="p-2.5 rounded-2xl bg-gradient-to-r from-brand-orange/20 to-amber-500/10 border border-brand-orange/30 text-center">
                  <div className="text-[11px] font-black text-amber-300 uppercase tracking-wide">
                    &ldquo;The Mobile Display Is Gone But We&rsquo;ll Make It On&rdquo;
                  </div>
                  <div className="text-[10px] text-white/70 mt-0.5">
                    We Fix It All &bull; Screen &amp; Motherboard Repair Experts
                  </div>
                </div>

                {/* Counter Quick Actions */}
                <div className="pt-3 flex gap-2">
                  <Link to="/repair-request" className="flex-1">
                    <Button size="sm" variant="primary" className="w-full text-xs font-bold shadow-md">
                      Book Assessment &rarr;
                    </Button>
                  </Link>
                  <a
                    href={createWhatsAppUrl('Hello Debasish, I saw your shop photo and would like to visit Bhajan Complex for a repair.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs text-emerald-300 border-white/25 hover:bg-white/10"
                      leftIcon={<MessageSquare className="w-3.5 h-3.5 text-emerald-400" />}
                    >
                      WhatsApp
                    </Button>
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE REPAIR CALCULATOR WIDGET */}
      <section className="relative -mt-10 sm:-mt-14 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
        <InteractiveRepairCalculator />
      </section>

      {/* 5.4 SERVICE CATEGORIES GRID WITH ANIMATED CARDS & FILTER TABS */}
      <section className="py-20 sm:py-24 bg-brand-light relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold text-brand-orange uppercase tracking-wider bg-brand-orange-light/80 px-3 py-1 rounded-full">
              Full Workshop Capabilities
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-brand-navy tracking-tight">
              Comprehensive Smartphone Repair Solutions
            </h2>
            <p className="text-xs sm:text-sm text-brand-secondary leading-relaxed">
              Every repair is backed by transparent diagnostic inspection and an upfront estimate before any work begins.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-brand-navy text-white shadow-md'
                    : 'bg-white text-brand-secondary hover:text-brand-navy border border-brand-border hover:border-brand-navy/30'
                }`}
              >
                {cat === 'all' ? 'All Services (10)' : cat}
              </button>
            ))}
          </div>

          {/* Animated Services Grid */}
          <motion.div
            variants={staggerFast}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredServices.map((service) => {
              const IconComponent = ICON_MAP[service.iconName] || Smartphone;
              return (
                <motion.div
                  key={service.id}
                  variants={fadeInUp}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="bg-white rounded-3xl p-6 border border-brand-border/80 shadow-2xs hover:shadow-card-hover hover:border-brand-orange/40 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Icon & Category */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand-light text-brand-navy flex items-center justify-center group-hover:bg-brand-orange group-hover:text-white transition-all duration-300 shadow-2xs">
                        <IconComponent className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <span className="text-[10px] font-bold text-brand-secondary bg-brand-light px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {service.category}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-brand-navy group-hover:text-brand-orange transition-colors mb-2 leading-snug">
                      {service.title}
                    </h3>

                    <p className="text-xs text-brand-secondary leading-relaxed line-clamp-3 mb-4">
                      {service.shortDescription}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-brand-border/60 flex items-center justify-between text-xs">
                    <Link
                      to={`/services/${service.slug}`}
                      className="font-bold text-brand-navy group-hover:text-brand-orange inline-flex items-center gap-1 transition-colors"
                    >
                      <span>Inspection Info</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      to={`/repair-request?category=${encodeURIComponent(service.title)}`}
                      className="text-brand-orange font-semibold hover:underline text-[11px]"
                    >
                      Enquire &rarr;
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="mt-12 text-center">
            <Link to="/services">
              <Button variant="outline" size="md">
                Browse Full Service Catalog & Process &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5.5 ANDROID REPAIR SECTION */}
      <section className="py-20 bg-white border-y border-brand-border relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-6 space-y-5"
            >
              <span className="text-xs font-bold text-brand-orange uppercase tracking-wider bg-brand-orange-light/80 px-3 py-1 rounded-full">
                Android Smartphone Specialist
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-brand-navy tracking-tight">
                Android Phone Repair, Made Simple.
              </h2>
              <p className="text-xs sm:text-sm text-brand-secondary leading-relaxed">
                Whether you carry a Samsung Galaxy, Xiaomi, Redmi, POCO, Vivo, Oppo, Realme, OnePlus, or Motorola, we offer diagnostic assessments for hardware faults and software glitches.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  'Display and touch panel replacement (OLED, AMOLED, LCD)',
                  'Battery performance assessment and safe cell renewal',
                  'Charging port soldering, loose connector fix, and fast charge testing',
                  'In-call earpiece, speaker, and microphone repair',
                  'Back glass, camera module, and rear lens glass replacement',
                  'Boot loop recovery, system flashing, and software troubleshooting',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs text-brand-text">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <Link to="/android-repair">
                  <Button variant="primary" size="md">
                    Request Android Repair
                  </Button>
                </Link>
                <Link to="/repair-request?type=android">
                  <Button variant="outline" size="md">
                    Book Android Assessment
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Android Brands Pill Box */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-6 glass-card rounded-3xl p-6 sm:p-8 border border-brand-border shadow-card-hover"
            >
              <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>Supported Android Brands</span>
                <span className="text-[10px] text-brand-secondary font-medium">In-Shop Diagnostic</span>
              </h4>
              <div className="flex flex-wrap gap-2.5 mb-6">
                {settings.supportedBrands.android.map((brand) => (
                  <motion.span
                    key={brand}
                    whileHover={{ scale: 1.05 }}
                    className="px-3.5 py-2 rounded-xl bg-white border border-brand-border text-xs font-bold text-brand-navy shadow-2xs hover:border-brand-orange hover:text-brand-orange transition-colors cursor-default"
                  >
                    {brand}
                  </motion.span>
                ))}
              </div>
              <div className="bg-brand-light p-4 rounded-2xl border border-brand-border text-xs text-brand-secondary leading-relaxed">
                <p className="font-bold text-brand-navy mb-1 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-brand-orange" />
                  <span>Part Availability Notice:</span>
                </p>
                Service feasibility depends on spare part availability for your specific device model. Please message Debasish on WhatsApp or submit your exact model for quick stock verification.
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5.6 IPHONE REPAIR SECTION */}
      <section className="py-20 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* iPhone Models Box */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-6 order-2 lg:order-1 bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-card-hover"
            >
              <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>Supported iPhone Series</span>
                <span className="text-[10px] text-brand-secondary">Independent Lab</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
                {settings.supportedBrands.iphone.map((model) => (
                  <motion.div
                    key={model}
                    whileHover={{ scale: 1.03 }}
                    className="px-3 py-2.5 rounded-xl bg-brand-light text-center text-xs font-bold text-brand-navy border border-brand-border hover:border-brand-navy/40 transition-colors"
                  >
                    {model}
                  </motion.div>
                ))}
              </div>
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <p className="font-bold text-amber-950 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Transparency Statement:</span>
                </p>
                Mobile Repairing House is an independent repair facility located in Dunlop, Kolkata. We do not claim Apple authorization, Apple certification, or access to official manufacturer warranty programs. We provide quality third-party diagnostics and assessments.
              </div>
            </motion.div>

            {/* Right Copy */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-6 order-1 lg:order-2 space-y-5"
            >
              <span className="text-xs font-bold text-brand-orange uppercase tracking-wider bg-brand-orange-light/80 px-3 py-1 rounded-full">
                Independent iPhone Diagnostics
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-brand-navy tracking-tight">
                Expert Attention for Your iPhone.
              </h2>
              <p className="text-xs sm:text-sm text-brand-secondary leading-relaxed">
                From display fractures to worn batteries, we conduct careful diagnostics on supported iPhone models. Submit your model and symptoms to receive an initial assessment.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  'Display touch and glass replacement for supported models',
                  'Battery replacement for devices showing battery health degradation',
                  'Lightning and USB-C charging port cleaning and replacement',
                  'Front and rear camera glass and optical sensor service',
                  'Speaker, earpiece, and noise cancellation microphone fixes',
                  'System recovery, DFU mode assistance, and boot issue resolution',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs text-brand-text">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <Link to="/iphone-repair">
                  <Button variant="primary" size="md">
                    Request iPhone Repair
                  </Button>
                </Link>
                <Link to="/repair-request?type=iphone">
                  <Button variant="outline" size="md">
                    Submit iPhone Model
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5.7 REPAIR PROCESS WITH PROGRESSIVE CONNECTING LINE */}
      <section className="py-20 sm:py-24 bg-white border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-brand-orange uppercase tracking-wider bg-brand-orange-light/80 px-3 py-1 rounded-full">
              Transparent Workflow
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-brand-navy tracking-tight">
              Our 4-Step Repair Journey
            </h2>
            <p className="text-xs sm:text-sm text-brand-secondary">
              No surprise charges. Repair work requiring customer approval will never commence without your verified authorization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {[
              {
                step: '01',
                title: 'Tell Us About Your Phone',
                desc: 'Fill out our online repair request or message Debasish on WhatsApp with your phone model and symptoms.',
              },
              {
                step: '02',
                title: 'Bring Device to Shop',
                desc: 'Drop off your device at our shop in Bhajan Complex, Dunlop, Kolkata for in-person bench testing.',
              },
              {
                step: '03',
                title: 'Diagnosis & Estimate',
                desc: 'We inspect the issue and send you an itemized estimate explaining parts, labour, and expected completion.',
              },
              {
                step: '04',
                title: 'Approve & Collect',
                desc: 'Once you approve the quote, repair work is performed and tested. Collect your phone and receive your invoice.',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-brand-light/70 rounded-3xl p-6 border border-brand-border hover:border-brand-orange/40 hover:bg-white hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white border border-brand-border shadow-2xs flex items-center justify-center text-lg font-black font-mono text-brand-orange mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-base font-bold text-brand-navy mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-brand-secondary leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 bg-amber-50/80 border border-amber-200 rounded-2xl p-4.5 text-center max-w-2xl mx-auto shadow-2xs">
            <p className="text-xs text-amber-950 font-semibold flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span><strong>Our Promise:</strong> We will never perform unquoted repairs or initiate billable work before recording your explicit approval.</span>
            </p>
          </div>
        </div>
      </section>

      {/* 5.8 WHY CHOOSE MOBILE REPAIRING HOUSE (BENTO GRID) */}
      <section className="py-20 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold text-brand-orange uppercase tracking-wider bg-brand-orange-light/80 px-3 py-1 rounded-full">
              Local Excellence
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-brand-navy tracking-tight">
              Why Dunlop Customers Rely on Us
            </h2>
            <p className="text-xs sm:text-sm text-brand-secondary">
              Direct communication, verified shop counter on Barrackpore Trunk Road, and honest estimates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Convenient Dunlop Location',
                desc: 'Situated at Bhajan Complex, 139 B.T. Road, Dunlop, easily accessible from Baranagar, Bonhooghly, Belgharia, and Dakshineswar.',
                icon: MapPin,
              },
              {
                title: 'Android & iPhone Enquiries',
                desc: 'Hardware and software support across both platforms without confusing technical jargon.',
                icon: Smartphone,
              },
              {
                title: 'Upfront Estimates Before Work',
                desc: 'Clear communication about parts and labour costs before opening or servicing your phone.',
                icon: ShieldCheck,
              },
              {
                title: 'Online Repair Job Tracking',
                desc: 'Enter your job reference anytime at /repair-status to view diagnostic updates and collection readiness.',
                icon: Activity,
              },
              {
                title: 'Direct Shop Communication',
                desc: 'Speak directly with Debasish on call or WhatsApp for quick clarifications regarding your device.',
                icon: MessageSquare,
              },
              {
                title: 'Mobile Accessories Available',
                desc: 'Quality fast chargers, Type-C cables, earphones, power banks, and tempered glass available in-shop.',
                icon: Package,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="bg-white p-7 rounded-3xl border border-brand-border/80 shadow-2xs hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-2xl bg-brand-orange-light text-brand-orange flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-brand-navy mb-2">{item.title}</h3>
                  <p className="text-xs text-brand-secondary leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5.85 REAL STORE SHOWCASE & BRANDING GALLERY */}
      <section className="py-20 sm:py-24 bg-gradient-to-b from-brand-navy to-brand-navy-dark text-white relative overflow-hidden border-y border-white/10">
        <div className="absolute inset-0 bg-grid-pattern-dark opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
            <span className="text-xs font-black text-brand-orange uppercase tracking-wider bg-brand-orange/20 border border-brand-orange/40 px-3.5 py-1 rounded-full shadow-glow-orange inline-flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-brand-orange" />
              <span>Real Shop &bull; Bhajan Complex, Dunlop</span>
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Inside Mobile Repairing House
            </h2>
            <p className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto leading-relaxed">
              Take an authentic look inside our repair workshop, customer service counter, and technician diagnostic bench in Dunlop, Kolkata.
            </p>

            {/* Official Slogan Banner Ribbon */}
            <div className="pt-2">
              <div className="inline-block p-4 sm:px-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                <p className="text-xs sm:text-sm font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-brand-orange-light to-orange-400 uppercase">
                  &ldquo;THE MOBILE DISPLAY IS GONE BUT WE&rsquo;LL MAKE IT ON&rdquo;
                </p>
                <p className="text-[11px] text-white/80 font-semibold mt-1">
                  We Fix It All &bull; Screen &amp; Parts Replacement &bull; Motherboard Repair Experts
                </p>
                <div className="mt-2 flex items-center justify-center gap-3 text-[10px] text-white/60">
                  <span>Debasish: +91 97327 89938</span>
                  <span>&bull;</span>
                  <span>139 B.T. Road, Dunlop, Kolkata 700108</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Card 1 (Large 8 cols): Storefront Street View */}
            <motion.div
              whileHover={{ y: -4 }}
              onClick={() =>
                setLightboxPhoto({
                  src: '/images/store/storefront-day.webp',
                  title: 'Mobile Repairing House Storefront & Street View',
                  subtitle: 'Bhajan Complex, 139 B.T. Road, Dunlop, Saket Nagar, Kolkata 700108',
                  tag: 'Storefront',
                })
              }
              className="md:col-span-8 rounded-3xl overflow-hidden relative group bg-brand-navy-dark border border-white/15 shadow-xl cursor-pointer min-h-[320px] sm:min-h-[400px] flex flex-col justify-end p-6"
            >
              <img
                src="/images/store/storefront-day.webp"
                alt="Mobile Repairing House Storefront Dunlop"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-brand-orange text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                    Storefront &bull; Dunlop
                  </span>
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold border border-white/20">
                    Bhajan Complex, 139 B.T. Road
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white drop-shadow-md">
                  Roadside Counter Intake on Barrackpore Trunk Road
                </h3>
                <p className="text-xs text-white/80 max-w-xl leading-relaxed">
                  Easily accessible from Dunlop Crossing, Bonhooghly, and Baranagar Metro. Walk right up to our shop counter for immediate diagnostic assessment.
                </p>
                <div className="pt-1 flex items-center gap-2 text-brand-orange-light text-xs font-bold">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Click to view full photo</span>
                </div>
              </div>
            </motion.div>

            {/* Card 2 (4 cols): Technician Hardware Bench */}
            <motion.div
              whileHover={{ y: -4 }}
              onClick={() =>
                setLightboxPhoto({
                  src: '/images/store/workshop-bench.webp',
                  title: 'Technician Hardware Bench & Soldering Station',
                  subtitle: 'In-shop micro-soldering, IC repair, and precision screen replacement by Debasish',
                  tag: 'Hardware Lab',
                })
              }
              className="md:col-span-4 rounded-3xl overflow-hidden relative group bg-brand-navy-dark border border-white/15 shadow-xl cursor-pointer min-h-[320px] sm:min-h-[400px] flex flex-col justify-end p-6"
            >
              <img
                src="/images/store/workshop-bench.webp"
                alt="Mobile Repairing House Technician Workshop Bench"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-2">
                <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm inline-block">
                  Technician Bench
                </span>
                <h3 className="text-lg font-bold text-white drop-shadow-md">
                  In-Shop Diagnostic Bench
                </h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Equipped for component-level motherboard repairs, display fittings, and electrical inspection.
                </p>
                <div className="pt-1 flex items-center gap-2 text-brand-orange-light text-xs font-bold">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Click to view full photo</span>
                </div>
              </div>
            </motion.div>

            {/* Card 3 (4 cols): Accessories Showcase */}
            <motion.div
              whileHover={{ y: -4 }}
              onClick={() =>
                setLightboxPhoto({
                  src: '/images/store/accessories-display.webp',
                  title: 'Counter Accessories Display',
                  subtitle: 'Fast chargers, neckbands, earphones, power banks, and tempered protection in stock',
                  tag: 'Accessories',
                })
              }
              className="md:col-span-4 rounded-3xl overflow-hidden relative group bg-brand-navy-dark border border-white/15 shadow-xl cursor-pointer min-h-[280px] flex flex-col justify-end p-6"
            >
              <img
                src="/images/store/accessories-display.webp"
                alt="Mobile Repairing House Accessories Display"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-1.5">
                <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm inline-block">
                  Accessories Showcase
                </span>
                <h4 className="text-base font-bold text-white drop-shadow-md">
                  In-Stock Counter Essentials
                </h4>
                <p className="text-[11px] text-white/80 leading-relaxed">
                  boAt audio, fast charging bricks, durable Type-C cables, and tempered screen glass.
                </p>
              </div>
            </motion.div>

            {/* Card 4 (4 cols): Official Canopy Banner */}
            <motion.div
              whileHover={{ y: -4 }}
              onClick={() =>
                setLightboxPhoto({
                  src: '/images/store/storefront-banner.webp',
                  title: 'Storefront Canopy Banner & Brand Wordmark',
                  subtitle: '"The Mobile Display Is Gone But We\'ll Make It On" — Debasish: 97327 89938',
                  tag: 'Brand Wordmark',
                })
              }
              className="md:col-span-4 rounded-3xl overflow-hidden relative group bg-brand-navy-dark border border-white/15 shadow-xl cursor-pointer min-h-[280px] flex flex-col justify-end p-6"
            >
              <img
                src="/images/store/storefront-banner.webp"
                alt="Mobile Repairing House Banner"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-1.5">
                <span className="px-2.5 py-1 rounded-full bg-brand-orange text-white text-[10px] font-black uppercase tracking-wider shadow-sm inline-block">
                  Shop Identity
                </span>
                <h4 className="text-base font-bold text-white drop-shadow-md">
                  Official Storefront Banner
                </h4>
                <p className="text-[11px] text-white/80 leading-relaxed">
                  Debasish &bull; 97327 89938 &bull; The physical signage at Bhajan Complex.
                </p>
              </div>
            </motion.div>

            {/* Card 5 (4 cols): Entrance & Counter Handover */}
            <motion.div
              whileHover={{ y: -4 }}
              onClick={() =>
                setLightboxPhoto({
                  src: '/images/store/storefront-entrance.webp',
                  title: 'Counter Consultation & Handover',
                  subtitle: 'Debasish providing personalized diagnostic consultations at Bhajan Complex',
                  tag: 'Personal Service',
                })
              }
              className="md:col-span-4 rounded-3xl overflow-hidden relative group bg-brand-navy-dark border border-white/15 shadow-xl cursor-pointer min-h-[280px] flex flex-col justify-end p-6"
            >
              <img
                src="/images/store/storefront-entrance.webp"
                alt="Mobile Repairing House Counter Entrance"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-1.5">
                <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider shadow-sm inline-block">
                  Counter Service
                </span>
                <h4 className="text-base font-bold text-white drop-shadow-md">
                  Personal Technician Consultation
                </h4>
                <p className="text-[11px] text-white/80 leading-relaxed">
                  Speak directly with Debasish for immediate assessment and advice on repair feasibility.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5.9 ACCESSORIES SHOWCASE */}
      <section className="py-20 bg-white border-t border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold text-brand-orange uppercase tracking-wider bg-brand-orange-light/80 px-3 py-1 rounded-full">
                Counter Accessories
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight mt-2">
                Mobile Accessories Showcase
              </h2>
              <p className="text-xs text-brand-secondary mt-1">
                Quality charging adapters, cables, power banks, and earphones available at our Dunlop shop.
              </p>
            </div>
            <Link to="/accessories">
              <Button variant="outline" size="sm">
                View All Accessories &rarr;
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: '25W USB-C Fast Charger', category: 'Chargers', price: '₹499', desc: 'Type-C PD fast charger adapter for modern smartphones.' },
              { name: 'Braided Type-C Cable (1m)', category: 'Cables', price: '₹199', desc: 'Durable nylon braided data and fast charging cable.' },
              { name: 'In-Ear Stereo Earphones (3.5mm)', category: 'Audio', price: '₹249', desc: 'Comfortable wired earphones with inline microphone.' },
              { name: '10,000 mAh Slim Power Bank', category: 'Power', price: '₹899', desc: 'Dual USB output portable emergency battery backup.' },
            ].map((prod, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="bg-brand-light rounded-3xl p-6 border border-brand-border/80 shadow-2xs hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary bg-white px-2.5 py-1 rounded-full border border-brand-border">
                    {prod.category}
                  </span>
                  <h3 className="text-sm font-bold text-brand-navy mt-3 mb-1.5">{prod.name}</h3>
                  <p className="text-xs text-brand-secondary leading-relaxed mb-4">{prod.desc}</p>
                </div>
                <div className="pt-3.5 border-t border-brand-border flex items-center justify-between">
                  <span className="text-base font-black text-brand-navy">{prod.price}</span>
                  <a
                    href={createWhatsAppUrl(`Hello Debasish, is "${prod.name}" currently available in stock?`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Check Stock</span>
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5.10 LOCATION & MAP SECTION WITH GLASS CARD */}
      <section className="py-20 bg-brand-light border-y border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Location Info */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold text-brand-orange uppercase tracking-wider bg-brand-orange-light/80 px-3 py-1 rounded-full">
                Dunlop Workshop
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight">
                Visit Mobile Repairing House
              </h2>
              <p className="text-xs sm:text-sm text-brand-secondary leading-relaxed">
                Located on Barrackpore Trunk Road in Bhajan Complex, Saket Nagar, Bonhooghly, Dunlop.
              </p>

              <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-2xs space-y-3.5 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-brand-navy">Shop Address:</span>
                    <p className="text-brand-secondary mt-0.5 leading-relaxed">{settings.fullAddress}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-brand-border flex items-center justify-between">
                  <div>
                    <span className="font-bold text-brand-navy">Plus Code:</span>
                    <span className="text-brand-secondary ml-1.5 font-mono font-bold">{settings.plusCode}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-brand-border space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-brand-navy shrink-0" />
                    <span className="font-bold text-brand-navy">Phone:</span>
                    <a href={`tel:${settings.phone.replace(/\s+/g, '')}`} className="text-brand-orange hover:underline font-bold">
                      {settings.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-brand-navy">WhatsApp:</span>
                    <a
                      href={createWhatsAppUrl('Hello Debasish, I need directions to your Dunlop shop.')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:underline font-bold"
                    >
                      {settings.whatsapp}
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <a
                  href={settings.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-navy-light shadow-md hover:shadow-glow-navy transition-all duration-200"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Directions in Google Maps</span>
                </a>
              </div>
            </div>

            {/* Right Map Embed & Store Recognition */}
            <div className="lg:col-span-7 space-y-4">
              <div className="w-full h-80 sm:h-88 rounded-3xl overflow-hidden border border-brand-border shadow-card-hover bg-white relative">
                <iframe
                  title="Mobile Repairing House Google Map"
                  src="https://maps.google.com/maps?q=Bhajan+Complex+Dunlop+Kolkata+West+Bengal+700108&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                />
              </div>

              {/* Storefront Visual Recognition Strip */}
              <div
                onClick={() =>
                  setLightboxPhoto({
                    src: '/images/store/storefront-entrance.webp',
                    title: 'Mobile Repairing House Entrance at Bhajan Complex',
                    subtitle: '139 B.T. Road, Dunlop, Kolkata — Look for our blue & orange canopy banner',
                    tag: 'Shop Entrance',
                  })
                }
                className="p-3 bg-white rounded-2xl border border-brand-border flex items-center gap-3.5 shadow-2xs hover:border-brand-orange/40 transition-colors cursor-pointer group"
              >
                <img
                  src="/images/store/storefront-entrance.webp"
                  alt="Mobile Repairing House Entrance"
                  className="w-16 h-14 rounded-xl object-cover shrink-0 border border-brand-border group-hover:scale-105 transition-transform"
                />
                <div className="text-xs min-w-0">
                  <span className="font-bold text-brand-navy block truncate">
                    Storefront Recognition Landmark:
                  </span>
                  <p className="text-brand-secondary text-[11px] leading-snug">
                    Look for our blue canopy banner at Bhajan Complex directly on the main B.T. Road corridor.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-brand-orange ml-auto shrink-0 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Photo</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5.11 ANIMATED FAQ ACCORDION SECTION */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 space-y-3">
            <span className="text-xs font-bold text-brand-orange uppercase tracking-wider bg-brand-orange-light/80 px-3 py-1 rounded-full">
              Common Queries
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-brand-navy tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-brand-secondary">
              Direct answers regarding our diagnostic process, pricing policy, and shop location.
            </p>
          </div>

          {/* Animated Accordion Component */}
          <FaqAccordion items={FAQ_ITEMS} />

          {/* Prompt banner */}
          <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-navy to-brand-navy-dark text-white text-center sm:flex items-center justify-between gap-6 shadow-xl border border-white/10">
            <div className="text-left mb-4 sm:mb-0 space-y-1">
              <h3 className="text-base font-bold">Have an unlisted question about your device?</h3>
              <p className="text-xs text-white/70">Contact Debasish directly on WhatsApp or call our shop counter.</p>
            </div>
            <a
              href={createWhatsAppUrl('Hello Debasish, I have a repair query not listed in your FAQ.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-orange text-white text-xs font-bold hover:bg-brand-orange-hover shadow-glow-orange transition-all shrink-0"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* Customer Satisfaction Commitment Modal */}
      <Modal
        isOpen={showSatisfactionModal}
        onClose={() => setShowSatisfactionModal(false)}
        title="Our Customer Satisfaction Commitment"
        description="How Mobile Repairing House guarantees honest, reliable service at Bhajan Complex, Dunlop."
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
            <Star className="w-5 h-5 text-amber-600 fill-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-amber-900 mb-0.5">100% Transparent Local Service</h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                At Mobile Repairing House, our goal is for every customer in Dunlop, Baranagar, and Bonhooghly to feel confident and fully satisfied with their repair.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div className="p-4 rounded-2xl bg-brand-light border border-brand-border space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-brand-navy">
                <ShieldCheck className="w-4 h-4 text-brand-orange" />
                <span>Approval Before Any Work</span>
              </div>
              <p className="text-brand-secondary leading-relaxed">
                We explain the exact fault and provide a clear estimate first. No repair commences without your explicit approval.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-brand-light border border-brand-border space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-brand-navy">
                <ThumbsUp className="w-4 h-4 text-emerald-600" />
                <span>Test Before You Pay</span>
              </div>
              <p className="text-brand-secondary leading-relaxed">
                Inspect your screen touch, camera, audio, and charging directly with Debasish at our shop counter before settling your bill.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-brand-light border border-brand-border space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-brand-navy">
                <HeartHandshake className="w-4 h-4 text-indigo-600" />
                <span>Direct Counter Care</span>
              </div>
              <p className="text-brand-secondary leading-relaxed">
                You speak directly with the technician working on your handset. No third-party agents or generic call centers.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-brand-light border border-brand-border space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-brand-navy">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Invoice Warranty Tracking</span>
              </div>
              <p className="text-brand-secondary leading-relaxed">
                Eligible repairs receive documented warranty coverage, tracked directly through our shop CRM system.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-brand-secondary text-[11px]">
              Visit us at Bhajan Complex, 139 B.T. Road, Dunlop, Kolkata.
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link to="/repair-request" onClick={() => setShowSatisfactionModal(false)} className="w-full sm:w-auto">
                <Button size="sm" variant="primary" className="w-full">
                  Book a Repair
                </Button>
              </Link>
              <a
                href={createWhatsAppUrl('Hello Debasish, I would like to enquire about your customer satisfaction policy and repair services.')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button size="sm" variant="outline" className="w-full text-emerald-700 border-emerald-300">
                  WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>
      </Modal>

      {/* Real Store Photo Lightbox Modal */}
      <Modal
        isOpen={!!lightboxPhoto}
        onClose={() => setLightboxPhoto(null)}
        title={lightboxPhoto?.title || 'Mobile Repairing House Photo'}
        description={lightboxPhoto?.subtitle}
        maxWidth="2xl"
      >
        {lightboxPhoto && (
          <div className="space-y-4 text-xs">
            <div className="rounded-2xl overflow-hidden bg-black/95 border border-brand-border shadow-lg max-h-[65vh] flex items-center justify-center">
              <img
                src={lightboxPhoto.src}
                alt={lightboxPhoto.title}
                className="w-full h-auto max-h-[60vh] object-contain"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div>
                <span className="font-bold text-brand-navy text-sm block">{lightboxPhoto.title}</span>
                <p className="text-brand-secondary mt-0.5">{lightboxPhoto.subtitle}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link to="/repair-request" onClick={() => setLightboxPhoto(null)}>
                  <Button size="sm" variant="primary">
                    Book a Repair
                  </Button>
                </Link>
                <a
                  href={createWhatsAppUrl(`Hello Debasish, I am viewing your shop photo "${lightboxPhoto.title}" and would like to ask about a repair.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" variant="outline" className="text-emerald-700 border-emerald-300">
                    WhatsApp Debasish
                  </Button>
                </a>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Smartphone,
  Apple,
  Sparkles,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Wrench,
  Zap,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { createWhatsAppUrl } from '../../lib/whatsapp';

interface IssueOption {
  id: string;
  name: string;
  icon: string;
  turnaround: string;
  process: string;
  category: string;
}

const COMMON_ISSUES: IssueOption[] = [
  {
    id: 'display',
    name: 'Cracked Screen / Display',
    icon: '📱',
    turnaround: 'Same-day (subject to stock)',
    process: 'Multi-touch & display digitizer bench testing, precision thermal separation, and flush bezel seating.',
    category: 'Display and Touchscreen Replacement',
  },
  {
    id: 'battery',
    name: 'Rapid Battery Drain / Swollen',
    icon: '🔋',
    turnaround: '45 – 90 mins',
    process: 'USB ammeter current draw check, battery cycle audit, and safe adhesive pull extraction.',
    category: 'Battery Replacement',
  },
  {
    id: 'charging',
    name: 'Loose Port / Not Charging',
    icon: '⚡',
    turnaround: '1 – 2 hours',
    process: 'Microscope pin inspection, debris extraction, or sub-board/Type-C connector soldering.',
    category: 'Charging-Port Repair & Replacement',
  },
  {
    id: 'motherboard',
    name: 'Dead Phone / Water Damage',
    icon: '🔬',
    turnaround: 'Diagnostic within 24 hours',
    process: 'DC regulated power supply analysis, ultrasonic solvent bath for corrosion, and short isolation.',
    category: 'Motherboard Diagnostics and Repair',
  },
];

export const InteractiveRepairCalculator: React.FC = () => {
  const [deviceType, setDeviceType] = useState<'android' | 'iphone'>('android');
  const [selectedBrand, setSelectedBrand] = useState('Samsung');
  const [selectedIssue, setSelectedIssue] = useState<IssueOption>(COMMON_ISSUES[0]);

  const androidBrands = ['Samsung', 'Xiaomi / Redmi', 'Vivo', 'Oppo', 'Realme', 'OnePlus', 'Motorola'];
  const iphoneSeries = ['iPhone 15 / 14', 'iPhone 13 / 12', 'iPhone 11 / XR', 'iPhone SE / 8'];

  const brandsList = deviceType === 'android' ? androidBrands : iphoneSeries;

  const prefilledWhatsApp = `Hello Debasish, I need an assessment for my ${deviceType === 'iphone' ? 'iPhone' : selectedBrand} regarding ${selectedIssue.name} at your Dunlop shop.`;

  return (
    <div className="w-full glass-card rounded-3xl p-6 sm:p-8 shadow-card-hover border border-brand-border/90 relative overflow-hidden">
      {/* Decorative ambient gradient backdrop */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-navy/5 rounded-full blur-3xl pointer-events-none" />

      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-brand-border/70 gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange-light/80 text-brand-orange text-[11px] font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Diagnostic Assistant</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-brand-navy tracking-tight">
            Check Repair Assessment & Feasibility
          </h3>
          <p className="text-xs text-brand-secondary">
            Select your handset details for immediate bench guidance and turnaround insight.
          </p>
        </div>

        {/* Device Toggle Tabs */}
        <div className="flex p-1 rounded-2xl bg-brand-light border border-brand-border/80 self-start sm:self-center shrink-0">
          <button
            type="button"
            onClick={() => {
              setDeviceType('android');
              setSelectedBrand('Samsung');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              deviceType === 'android'
                ? 'bg-brand-navy text-white shadow-md'
                : 'text-brand-secondary hover:text-brand-navy'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android Phone</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setDeviceType('iphone');
              setSelectedBrand('iPhone 13 / 12');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              deviceType === 'iphone'
                ? 'bg-brand-navy text-white shadow-md'
                : 'text-brand-secondary hover:text-brand-navy'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>iPhone (iOS)</span>
          </button>
        </div>
      </div>

      {/* Brand Selection Pills */}
      <div className="py-5 space-y-2.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-brand-secondary block">
          1. Choose Your Handset Brand / Series:
        </label>
        <div className="flex flex-wrap gap-2">
          {brandsList.map((brand) => (
            <button
              key={brand}
              type="button"
              onClick={() => setSelectedBrand(brand)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                selectedBrand === brand
                  ? 'bg-brand-orange text-white shadow-sm ring-2 ring-brand-orange/30'
                  : 'bg-white text-brand-navy border border-brand-border hover:border-brand-navy/30 hover:bg-brand-light/60'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* Common Issue Cards */}
      <div className="pb-6 space-y-2.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-brand-secondary block">
          2. What issue are you experiencing?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {COMMON_ISSUES.map((issue) => {
            const isSelected = selectedIssue.id === issue.id;
            return (
              <motion.div
                key={issue.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedIssue(issue)}
                className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-brand-orange bg-brand-orange-light/30 shadow-xs'
                    : 'border-brand-border bg-white hover:border-brand-navy/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{issue.icon}</span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-brand-orange" />
                  )}
                </div>
                <div className="text-xs font-bold text-brand-navy leading-snug">
                  {issue.name}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Animated Assessment Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${deviceType}-${selectedBrand}-${selectedIssue.id}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="bg-gradient-to-br from-brand-navy to-brand-navy-dark text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-white/10"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-brand-orange text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Estimated Workshop Plan for {selectedBrand}</span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white">
                {selectedIssue.name}
              </h4>
              <p className="text-xs text-white/80 max-w-xl leading-relaxed">
                {selectedIssue.process}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-white/90">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-orange" />
                  <span>Turnaround: <strong>{selectedIssue.turnaround}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Estimate required before repair begins</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 pt-2 md:pt-0">
              <a
                href={createWhatsAppUrl(prefilledWhatsApp)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="md" variant="glow" className="w-full text-xs" leftIcon={<MessageSquare className="w-3.5 h-3.5 text-white" />}>
                  Check Parts on WhatsApp
                </Button>
              </a>

              <Link
                to={`/repair-request?type=${deviceType}&category=${encodeURIComponent(selectedIssue.category)}&brand=${encodeURIComponent(selectedBrand)}`}
              >
                <Button
                  size="md"
                  variant="outline"
                  className="w-full text-xs bg-white/10 hover:bg-white/20 text-white border-white/20"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Book In-Shop Diagnostic
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

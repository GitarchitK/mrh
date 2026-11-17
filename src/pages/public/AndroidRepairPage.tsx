import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Smartphone,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  ShieldCheck,
  Cpu,
  BatteryCharging,
  Zap,
  Wrench,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { SeoHead } from '../../components/shared/SeoHead';
import { createWhatsAppUrl } from '../../lib/whatsapp';
import { fadeInUp, staggerContainer, staggerFast, cardHoverProps } from '../../lib/animations';

export const AndroidRepairPage: React.FC = () => {
  const { settings } = useSettings();
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  const commonIssues = [
    {
      title: 'Broken or Flickering Display',
      desc: 'Cracked glass, black screens, touchscreen dead zones, or vertical lines on AMOLED and LCD panels.',
      icon: Layers,
    },
    {
      title: 'Poor Battery Backup & Sudden Power-off',
      desc: 'Rapid battery drain, phone turning off at 30%, overheating during charging, or battery swelling.',
      icon: BatteryCharging,
    },
    {
      title: 'Charging Port & Cable Connectivity',
      desc: 'Loose Type-C or Micro-USB ports, slow charging, or moisture detection warnings in system UI.',
      icon: Zap,
    },
    {
      title: 'Motherboard IC & Power Failure',
      desc: 'Short-circuit diagnostics, PMIC replacement, dead phone recovery, and micro-soldering.',
      icon: Cpu,
    },
    {
      title: 'Earpiece, Loudspeaker & Mic Faults',
      desc: 'Low in-call audio volume, crackling loudspeaker when watching media, or callers unable to hear you.',
      icon: Wrench,
    },
    {
      title: 'Boot Loop, Freezing & Software Glitches',
      desc: 'Phone stuck on brand boot logo, system recovery loops, failed updates, or slow app responsiveness.',
      icon: Smartphone,
    },
  ];

  return (
    <div className="bg-brand-light min-h-screen py-10 sm:py-16">
      <SeoHead
        title="Android Mobile Repair in Dunlop, Kolkata"
        description="Specialist Android phone repairs in Dunlop. Samsung, Xiaomi, Redmi, Vivo, Oppo, Realme, OnePlus, Motorola screen and battery repair."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12"
      >
        {/* Hero Banner with animated backdrop and glass accents */}
        <motion.div
          variants={fadeInUp}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-navy via-brand-navy to-brand-navy-dark text-white p-8 sm:p-12 lg:p-16 shadow-2xl border border-white/10"
        >
          {/* Subtle decorative glowing background blurs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-brand-orange-light">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Android Smartphone Specialist Bench</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
              Android Phone Repair,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange-light to-amber-300">
                Accurate & Transparent.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-white/80 leading-relaxed font-normal">
              Whether your screen cracked after a sudden drop, your battery drains too quickly, or your device refuses to charge, get honest diagnostic bench testing at Mobile Repairing House in Dunlop, Kolkata.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link to="/repair-request?type=android">
                <Button size="lg" variant="glow" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Book Android Assessment
                </Button>
              </Link>
              <a
                href={createWhatsAppUrl('Hello Debasish, I need an assessment for my Android smartphone at your Dunlop shop.')}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
                  leftIcon={<MessageSquare className="w-4 h-4 text-emerald-400" />}
                >
                  Chat with Debasish
                </Button>
              </a>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-white/70">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Approval Before Action</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Component-Level Soldering</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Supported Brands Grid with interactive selection */}
        <motion.div
          variants={fadeInUp}
          className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-brand-border shadow-xs"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-xs font-bold text-brand-orange uppercase tracking-wider">
                Supported Ecosystems
              </h2>
              <h3 className="text-xl font-bold text-brand-navy">
                Major Android Brands Serviced
              </h3>
            </div>
            <p className="text-xs text-brand-secondary">
              Click a brand to prefill your repair enquiry
            </p>
          </div>

          <motion.div
            variants={staggerFast}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
          >
            {settings.supportedBrands.android.map((brand) => {
              const isSelected = selectedBrand === brand;
              return (
                <motion.button
                  key={brand}
                  type="button"
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSelectedBrand(isSelected ? null : brand)}
                  className={`p-3.5 rounded-2xl text-center font-bold text-xs transition-all ${
                    isSelected
                      ? 'bg-brand-navy text-white shadow-md border-2 border-brand-orange'
                      : 'bg-brand-light hover:bg-white text-brand-navy border border-brand-border hover:border-brand-navy/30 hover:shadow-xs'
                  }`}
                >
                  {brand}
                </motion.button>
              );
            })}
          </motion.div>

          {selectedBrand && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-2xl bg-brand-light border border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-orange" />
                <span>
                  Ready to diagnose your <strong>{selectedBrand}</strong> smartphone at our Dunlop shop.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/repair-request?type=android&brand=${encodeURIComponent(selectedBrand)}`}>
                  <Button size="sm" variant="primary">
                    Book {selectedBrand} Repair
                  </Button>
                </Link>
                <a
                  href={createWhatsAppUrl(`Hello Debasish, I need repair consultation for my ${selectedBrand} phone.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" variant="outline" className="text-emerald-700 border-emerald-300">
                    WhatsApp Enquiry
                  </Button>
                </a>
              </div>
            </motion.div>
          )}

          <p className="text-[11px] text-brand-secondary mt-5 leading-normal">
            * Note: Repair feasibility and turnaround depend on component availability for your exact handset model. We do not claim that obsolete or proprietary parts are readily stocked.
          </p>
        </motion.div>

        {/* Common Problems Grid with cards and icons */}
        <motion.div variants={fadeInUp} className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-brand-orange uppercase tracking-wider">
              Bench Diagnostic Categories
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
              Common Android Problems We Inspect
            </h2>
            <p className="text-xs text-brand-secondary">
              Diagnostic inspection is carried out at our shop bench in Bhajan Complex before finalizing any replacement quote.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {commonIssues.map((issue, idx) => {
              const Icon = issue.icon;
              return (
                <motion.div
                  key={idx}
                  {...cardHoverProps}
                  className="bg-white rounded-3xl p-6 border border-brand-border shadow-xs hover:shadow-card-hover hover:border-brand-navy/30 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-10 h-10 rounded-2xl bg-brand-light text-brand-navy group-hover:bg-brand-orange group-hover:text-white transition-colors flex items-center justify-center mb-4 border border-brand-border">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-brand-navy group-hover:text-brand-orange transition-colors mb-2">
                      {issue.title}
                    </h3>
                    <p className="text-xs text-brand-secondary leading-relaxed">
                      {issue.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-brand-border flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Bench Checked
                    </span>
                    <Link
                      to={`/repair-request?type=android&problem=${encodeURIComponent(issue.title)}`}
                      className="text-xs font-bold text-brand-navy group-hover:text-brand-orange inline-flex items-center gap-1 transition-colors"
                    >
                      <span>Diagnose</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Transparent Process CTA */}
        <motion.div
          variants={fadeInUp}
          className="relative overflow-hidden bg-brand-navy text-white rounded-3xl p-8 sm:p-12 border border-brand-navy-light shadow-xl text-center max-w-4xl mx-auto space-y-4"
        >
          <div className="absolute top-0 right-1/4 w-64 h-64 bg-brand-orange/20 rounded-full blur-2xl pointer-events-none" />
          <h3 className="text-2xl font-bold tracking-tight text-white relative z-10">
            Ready to have your Android phone diagnosed?
          </h3>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl mx-auto leading-relaxed relative z-10">
            Drop off your phone at Bhajan Complex, 139 B.T. Road, Dunlop, Kolkata, or submit your device details online for an estimate range.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3 relative z-10">
            <Link to="/repair-request?type=android">
              <Button size="md" variant="glow">
                Book Android Assessment
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="md" variant="outline" className="text-white border-white/20 hover:bg-white/10">
                View Workshop Location
              </Button>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

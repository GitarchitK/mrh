import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Smartphone,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  AlertTriangle,
  Layers,
  BatteryCharging,
  Zap,
  Camera,
  Volume2,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { SeoHead } from '../../components/shared/SeoHead';
import { createWhatsAppUrl } from '../../lib/whatsapp';
import { fadeInUp, staggerContainer, staggerFast, cardHoverProps } from '../../lib/animations';

export const IPhoneRepairPage: React.FC = () => {
  const { settings } = useSettings();
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const commonIPhoneIssues = [
    {
      title: 'Display & Touchscreen Faults',
      desc: 'Cracked outer glass, touch unresponsiveness, vertical green lines, or black OLED display panels.',
      icon: Layers,
    },
    {
      title: 'Battery Health Degradation',
      desc: 'Rapid discharge, phone turning off when taking photos, Service warnings in iOS settings, or swollen back panel.',
      icon: BatteryCharging,
    },
    {
      title: 'Lightning & USB-C Charging Port',
      desc: 'Intermittent charging connection, cable not sitting flush, or lint and physical pin damage.',
      icon: Zap,
    },
    {
      title: 'Camera Shaking & Autofocus Noise',
      desc: 'Rear optical stabilization buzzing, blurry portrait photos, or broken circular camera lens glass.',
      icon: Camera,
    },
    {
      title: 'In-Call Audio & Speaker Issues',
      desc: 'Muffled earpiece during phone calls, distorted loudspeaker, or microphone not capturing voice memos.',
      icon: Volume2,
    },
    {
      title: 'System Recovery & Boot Loops',
      desc: 'Phone stuck on Apple logo, boot looping after storage filled up, or recovery mode screen.',
      icon: Smartphone,
    },
  ];

  return (
    <div className="bg-brand-light min-h-screen py-10 sm:py-16">
      <SeoHead
        title="iPhone Repair in Dunlop & Baranagar, Kolkata"
        description="Independent iPhone repair service at Bhajan Complex, 139 B.T. Road, Dunlop, Kolkata 700108. Display replacement, battery service, charging port fix, and camera repair."
        canonicalPath="/iphone-repair"
        keywords="iPhone repair Dunlop, iPhone screen replacement Kolkata, Apple iPhone battery Dunlop 700108, iPhone charging port Baranagar, iPhone camera fix Bonhooghly"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'iPhone Repair', url: '/iphone-repair' },
        ]}
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12"
      >
        {/* Hero Banner with Dark Navy Mesh Backdrop */}
        <motion.div
          variants={fadeInUp}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-navy-dark via-brand-navy to-brand-navy text-white p-5 sm:p-12 lg:p-16 shadow-2xl border border-white/10"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-brand-orange-light">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Independent iPhone Diagnostic Workshop</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
              Expert Diagnostic Care for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-brand-orange-light to-orange-400">
                Your iPhone.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-white/80 leading-relaxed font-normal">
              When your iPhone experiences a shattered display, reduced battery longevity, or charging failure, get a careful diagnostic assessment at Mobile Repairing House in Dunlop, Kolkata.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3.5">
              <Link to="/repair-request?type=iphone" className="w-full sm:w-auto">
                <Button size="lg" variant="glow" className="w-full sm:w-auto" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Request iPhone Assessment
                </Button>
              </Link>
              <a
                href={createWhatsAppUrl('Hello Debasish, I need an assessment for my iPhone at your Dunlop shop.')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
                  leftIcon={<MessageSquare className="w-4 h-4 text-emerald-400" />}
                >
                  Chat with Debasish
                </Button>
              </a>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-white/70">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Micro-screws & Bracket Retained</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Upfront Written Estimates</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mandatory Independent Repair Facility Notice */}
        <motion.div
          variants={fadeInUp}
          className="bg-white rounded-2xl p-6 border-l-4 border-amber-500 border-y border-r border-brand-border shadow-xs flex items-start gap-4"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-xs text-brand-secondary space-y-1">
            <span className="font-bold text-brand-navy uppercase tracking-wider block text-[11px]">
              Independent Repair Facility Notice:
            </span>
            <p className="leading-relaxed">
              Mobile Repairing House is an independent mobile repair shop. We do not claim Apple authorization, Apple certification, access to genuine Apple manufacturer channels, or manufacturer warranty coverage. We provide independent third-party diagnostic and component repair services.
            </p>
          </div>
        </motion.div>

        {/* Supported iPhone Models with Interactive Selection */}
        <motion.div
          variants={fadeInUp}
          className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-brand-border shadow-xs"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-xs font-bold text-brand-orange uppercase tracking-wider">
                Model Compatibility
              </h2>
              <h3 className="text-xl font-bold text-brand-navy">
                Supported iPhone Series for Diagnostics
              </h3>
            </div>
            <p className="text-xs text-brand-secondary">
              Select your iPhone model to prepare your enquiry
            </p>
          </div>

          <motion.div
            variants={staggerFast}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {settings.supportedBrands.iphone.map((model) => {
              const isSelected = selectedModel === model;
              return (
                <motion.button
                  key={model}
                  type="button"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedModel(isSelected ? null : model)}
                  className={`p-4 rounded-2xl text-center font-bold text-xs transition-all ${
                    isSelected
                      ? 'bg-brand-navy text-white shadow-md border-2 border-brand-orange'
                      : 'bg-brand-light hover:bg-white text-brand-navy border border-brand-border hover:border-brand-navy/30 hover:shadow-xs'
                  }`}
                >
                  {model}
                </motion.button>
              );
            })}
          </motion.div>

          {selectedModel && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-2xl bg-brand-light border border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-orange" />
                <span>
                  Diagnostic assessment available for <strong>{selectedModel}</strong> at our Dunlop shop.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/repair-request?type=iphone&model=${encodeURIComponent(selectedModel)}`}>
                  <Button size="sm" variant="primary">
                    Book {selectedModel} Repair
                  </Button>
                </Link>
                <a
                  href={createWhatsAppUrl(`Hello Debasish, I would like to check repair options for my ${selectedModel}.`)}
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

          <p className="text-[11px] text-brand-secondary mt-5">
            * Note: Submit your exact iPhone model number on our repair request form to receive parts verification before visiting.
          </p>
        </motion.div>

        {/* Common iPhone Issues Grid */}
        <motion.div variants={fadeInUp} className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-brand-orange uppercase tracking-wider">
              Bench Testing
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
              Common iPhone Repairs Handled
            </h2>
            <p className="text-xs text-brand-secondary">
              We inspect internal flex cables, sensors, and frame integrity prior to providing an upfront estimate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {commonIPhoneIssues.map((issue, idx) => {
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
                    <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                      Physical Inspection
                    </span>
                    <Link
                      to={`/repair-request?type=iphone&problem=${encodeURIComponent(issue.title)}`}
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

        {/* CTA */}
        <motion.div
          variants={fadeInUp}
          className="relative overflow-hidden bg-brand-navy text-white rounded-3xl p-8 sm:p-12 border border-brand-navy-light shadow-xl text-center max-w-4xl mx-auto space-y-4"
        >
          <div className="absolute top-0 right-1/4 w-64 h-64 bg-brand-orange/20 rounded-full blur-2xl pointer-events-none" />
          <h3 className="text-2xl font-bold tracking-tight text-white relative z-10">
            Need an assessment for your iPhone?
          </h3>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl mx-auto leading-relaxed relative z-10">
            Visit our shop at Bhajan Complex, Dunlop, or start by submitting your iPhone model and symptoms online.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3 relative z-10">
            <Link to="/repair-request?type=iphone">
              <Button size="md" variant="glow">
                Book iPhone Assessment
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="md" variant="outline" className="text-white border-white/20 hover:bg-white/10">
                Shop Location & Hours
              </Button>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

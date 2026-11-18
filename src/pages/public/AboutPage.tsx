import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Smartphone,
  CheckCircle2,
  MapPin,
  Phone,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Award,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { Button } from '../../components/ui/Button';
import { SeoHead } from '../../components/shared/SeoHead';
import { createWhatsAppUrl } from '../../lib/whatsapp';
import { fadeInUp, staggerContainer, cardHoverProps } from '../../lib/animations';

export const AboutPage: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div className="bg-brand-light min-h-screen py-10 sm:py-16">
      <SeoHead
        title="About Mobile Repairing House | Dunlop, Kolkata"
        description="Learn about Mobile Repairing House, operated by Debasish in Bhajan Complex, 139 B.T. Road, Dunlop, Kolkata 700108. Transparent phone diagnostics, genuine estimates, and certified technician care."
        canonicalPath="/about"
        keywords="about Mobile Repairing House, phone repair shop Dunlop, Debasish mobile technician, Bhajan Complex shop 700108"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'About Us', url: '/about' },
        ]}
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12"
      >
        {/* Intro */}
        <motion.div variants={fadeInUp} className="text-center space-y-3">
          <img
            src="/images/logo.webp"
            alt="Mobile Repairing House Logo"
            className="w-24 h-24 object-contain mx-auto rounded-3xl shadow-md border border-brand-border bg-white p-1.5"
          />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Local Smartphone Repair Workshop</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-navy tracking-tight">
            About Mobile Repairing House
          </h1>
          <p className="text-sm sm:text-base text-brand-secondary max-w-2xl mx-auto leading-relaxed">
            A dedicated smartphone diagnostic and repair workshop located on Barrackpore Trunk Road in Dunlop, Kolkata.
          </p>
        </motion.div>

        {/* Story & Philosophy */}
        <motion.div
          variants={fadeInUp}
          className="bg-white rounded-3xl p-5 sm:p-10 lg:p-12 border border-brand-border shadow-xs space-y-6 text-sm text-brand-text leading-relaxed"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-brand-navy">
            Our Commitment to Transparent Repair Care
          </h2>
          <p>
            Operating out of <strong>Bhajan Complex</strong> in Dunlop, <strong>Mobile Repairing House</strong> was established to provide local residents and commuters in Baranagar, Bonhooghly, Belgharia, and Kolkata with straightforward, reliable smartphone repairs.
          </p>
          <p>
            Run by <strong>Debasish</strong>, our workshop handles both Android smartphones and iPhones. We believe that phone repair should not be full of guesswork or hidden charges. We take the time to inspect what is actually happening with your device—whether it is a damaged display connector, a fatigued battery cell, or a corroded charging sub-board—and explain it clearly before you commit.
          </p>

          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-brand-light p-5 rounded-2xl border border-brand-border">
              <h4 className="font-bold text-brand-navy text-sm mb-1.5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Approval Before Action</span>
              </h4>
              <p className="text-xs text-brand-secondary leading-relaxed">
                We will never perform billable repair work without providing an estimate and obtaining your explicit authorization first.
              </p>
            </div>
            <div className="bg-brand-light p-5 rounded-2xl border border-brand-border">
              <h4 className="font-bold text-brand-navy text-sm mb-1.5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Direct Technician Contact</span>
              </h4>
              <p className="text-xs text-brand-secondary leading-relaxed">
                You speak directly with the person handling your phone. No call centers, no generic scripts.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Real Workshop Photos Section */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-3xl overflow-hidden bg-white border border-brand-border shadow-xs group">
            <div className="relative aspect-[16/10] overflow-hidden bg-brand-navy">
              <img
                src="/images/store/storefront-day.webp"
                alt="Mobile Repairing House Storefront"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                Bhajan Complex Storefront
              </span>
            </div>
            <div className="p-5">
              <h4 className="text-sm font-bold text-brand-navy">Roadside Counter at Bhajan Complex</h4>
              <p className="text-xs text-brand-secondary mt-1">
                Located on Barrackpore Trunk Road, easily reached by auto, bus, or metro from Dunlop Crossing.
              </p>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden bg-white border border-brand-border shadow-xs group">
            <div className="relative aspect-[16/10] overflow-hidden bg-brand-navy">
              <img
                src="/images/store/workshop-bench.webp"
                alt="Mobile Repairing House Workshop Bench"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                In-Shop Diagnostic Bench
              </span>
            </div>
            <div className="p-5">
              <h4 className="text-sm font-bold text-brand-navy">Hardware Testing &amp; Soldering Station</h4>
              <p className="text-xs text-brand-secondary mt-1">
                Where phones are opened, inspected, and repaired by Debasish with precision tools.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Shop Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            variants={fadeInUp}
            {...cardHoverProps}
            className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-xs space-y-4"
          >
            <div className="w-10 h-10 rounded-2xl bg-brand-light text-brand-orange flex items-center justify-center border border-brand-border">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-brand-navy">
              Where to Find Us
            </h3>
            <p className="text-xs text-brand-secondary leading-relaxed">
              We are situated right on the main Barrackpore Trunk Road corridor at:
            </p>
            <div className="p-4 bg-brand-light rounded-2xl border border-brand-border text-xs text-brand-text space-y-1">
              <div className="font-bold text-brand-navy">{settings.businessName}</div>
              <div className="text-brand-secondary">{settings.fullAddress}</div>
              <div className="pt-1 font-mono text-brand-navy font-semibold">Plus Code: {settings.plusCode}</div>
            </div>
            <div className="pt-2">
              <Link to="/contact">
                <Button size="sm" variant="outline" className="w-full text-xs">
                  View Map & Directions &rarr;
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            {...cardHoverProps}
            className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-xs space-y-4"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-brand-navy">
              Get in Touch Directly
            </h3>
            <p className="text-xs text-brand-secondary leading-relaxed">
              Have questions about device compatibility, turnaround times, or spare part stock? Reach out directly:
            </p>
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center gap-2 p-3 bg-brand-light rounded-2xl">
                <Phone className="w-4 h-4 text-brand-navy shrink-0" />
                <span className="font-bold text-brand-navy">Phone:</span>
                <a href={`tel:${settings.phone.replace(/\s+/g, '')}`} className="text-brand-orange hover:underline font-semibold ml-auto">
                  {settings.phone}
                </a>
              </div>
              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-2xl text-emerald-800">
                <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">WhatsApp:</span>
                <a
                  href={createWhatsAppUrl('Hello Debasish, I would like to enquire about your repair services.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline font-semibold ml-auto"
                >
                  {settings.whatsapp}
                </a>
              </div>
            </div>
            <div className="pt-2">
              <Link to="/repair-request">
                <Button size="sm" variant="primary" className="w-full text-xs">
                  Request a Repair Online
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

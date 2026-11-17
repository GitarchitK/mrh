import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  MessageSquare,
  ExternalLink,
  Copy,
  Check,
  Navigation,
  Sparkles,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { Button } from '../../components/ui/Button';
import { SeoHead } from '../../components/shared/SeoHead';
import { createWhatsAppUrl } from '../../lib/whatsapp';
import { fadeInUp, staggerContainer, cardHoverProps } from '../../lib/animations';

export const ContactPage: React.FC = () => {
  const { settings } = useSettings();
  const [copiedPlusCode, setCopiedPlusCode] = useState(false);

  const handleCopyPlusCode = () => {
    navigator.clipboard.writeText(settings.plusCode);
    setCopiedPlusCode(true);
    setTimeout(() => setCopiedPlusCode(false), 2000);
  };

  return (
    <div className="bg-brand-light min-h-screen py-10 sm:py-16">
      <SeoHead
        title="Contact & Location | Mobile Repairing House Dunlop"
        description="Location, phone, WhatsApp and directions for Mobile Repairing House at Bhajan Complex, 139 B.T. Road, Dunlop, Kolkata."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="text-center max-w-2xl mx-auto space-y-3">
          <img
            src="/images/logo.webp"
            alt="Mobile Repairing House Logo"
            className="w-20 h-20 object-contain mx-auto rounded-3xl shadow-sm border border-brand-border bg-white p-1"
          />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Visit or Connect</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-navy tracking-tight">
            Contact & Shop Location
          </h1>
          <p className="text-sm sm:text-base text-brand-secondary leading-relaxed">
            Reach out by phone, message on WhatsApp, or visit our repair counter directly in Dunlop, Kolkata.
          </p>
        </motion.div>

        {/* Contact Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Address */}
          <motion.div
            variants={fadeInUp}
            {...cardHoverProps}
            className="bg-white p-6 rounded-3xl border border-brand-border shadow-xs space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-brand-light text-brand-orange flex items-center justify-center border border-brand-border mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-brand-navy">Shop Address</h3>
              <p className="text-xs text-brand-secondary leading-relaxed mt-1">
                {settings.fullAddress}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-mono text-brand-navy bg-brand-light p-2.5 rounded-xl border border-brand-border">
              <span>{settings.plusCode}</span>
              <button
                type="button"
                onClick={handleCopyPlusCode}
                className="text-brand-orange hover:text-brand-navy p-1 transition-colors"
                title="Copy Google Plus Code"
              >
                {copiedPlusCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </motion.div>

          {/* Card 2: Phone */}
          <motion.div
            variants={fadeInUp}
            {...cardHoverProps}
            className="bg-white p-6 rounded-3xl border border-brand-border shadow-xs space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-brand-light text-brand-navy flex items-center justify-center border border-brand-border mb-3">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-brand-navy">Call Directly</h3>
              <p className="text-xs text-brand-secondary leading-relaxed mt-1">
                Contact Debasish directly for visit confirmation and urgent repair queries.
              </p>
            </div>
            <div className="pt-2">
              <a
                href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navy-light transition-colors"
              >
                Call {settings.phone}
              </a>
            </div>
          </motion.div>

          {/* Card 3: WhatsApp */}
          <motion.div
            variants={fadeInUp}
            {...cardHoverProps}
            className="bg-white p-6 rounded-3xl border border-brand-border shadow-xs space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 mb-3">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-brand-navy">WhatsApp Chat</h3>
              <p className="text-xs text-brand-secondary leading-relaxed mt-1">
                Send your phone model and photos of damage for a quick preliminary review.
              </p>
            </div>
            <div className="pt-2">
              <a
                href={createWhatsAppUrl('Hello Debasish, I would like to enquire about a phone repair.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors"
              >
                Chat on WhatsApp
              </a>
            </div>
          </motion.div>
        </div>

        {/* Map & Directions Section */}
        <motion.div
          variants={fadeInUp}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-xs space-y-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-brand-navy">
                Google Maps Location
              </h2>
              <p className="text-xs text-brand-secondary mt-1">
                Bhajan Complex, 139, Barrackpore Trunk Road, Dunlop, Saket Nagar, Bonhooghly, Baranagar.
              </p>
            </div>
            <a
              href={settings.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" variant="primary" leftIcon={<ExternalLink className="w-4 h-4" />}>
                Open Google Maps Directions
              </Button>
            </a>
          </div>

          {/* Photos & Map Embed Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 rounded-3xl overflow-hidden border border-brand-border bg-brand-navy relative group min-h-[300px] flex flex-col justify-end">
              <img
                src="/images/store/storefront-day.webp"
                alt="Mobile Repairing House Storefront at Bhajan Complex"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
              <div className="relative z-10 p-5 text-white space-y-1">
                <span className="px-2.5 py-1 rounded-full bg-brand-orange text-white text-[10px] font-bold uppercase tracking-wider inline-block">
                  Storefront Landmark
                </span>
                <div className="font-bold text-sm">Bhajan Complex, 139 B.T. Road, Dunlop</div>
                <div className="text-[11px] text-white/80 leading-relaxed">
                  Look for the blue &amp; orange canopy sign directly on the main Barrackpore Trunk Road corridor.
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 h-80 sm:h-96 rounded-3xl overflow-hidden border border-brand-border bg-brand-light shadow-inner">
              <iframe
                title="Mobile Repairing House Dunlop Map"
                src="https://maps.google.com/maps?q=Bhajan+Complex+Dunlop+Kolkata+West+Bengal+700108&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
              />
            </div>
          </div>

          <div className="p-4 bg-brand-light rounded-2xl border border-brand-border text-xs text-brand-secondary flex items-start gap-3">
            <Navigation className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-brand-navy">How to Reach:</span> Located directly on Barrackpore Trunk Road at Bhajan Complex, Dunlop, easily accessible from Dunlop Crossing, Baranagar Metro / Railway, and Bonhooghly.
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

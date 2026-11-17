import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Wrench, MapPin, Phone, MessageSquare, ExternalLink, ShieldCheck, Lock } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { createWhatsAppUrl } from '../../lib/whatsapp';

export const PublicFooter: React.FC = () => {
  const { settings, enabledServices } = useSettings();

  return (
    <footer className="bg-brand-navy text-white pt-16 pb-24 md:pb-12 border-t border-brand-navy-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">
          {/* Col 1: Brand & Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo-transparent.webp"
                alt="Mobile Repairing House"
                className="w-12 h-12 object-contain bg-white/10 rounded-2xl p-1 border border-white/15"
              />
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-white">
                  {settings.businessName}
                </span>
                <span className="text-xs text-white/70">
                  Dunlop, Baranagar, Kolkata
                </span>
              </div>
            </div>

            <p className="text-sm text-white/80 leading-relaxed">
              Professional Android and iPhone smartphone repair services in Dunlop, Kolkata. Transparent diagnostics, upfront estimates, and quality mobile accessories.
            </p>

            <div className="pt-2 text-xs text-white/70">
              <span className="font-semibold text-white">Operated by:</span> {settings.ownerContactName}
            </div>
          </div>

          {/* Col 2: Services */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-brand-orange mb-4">
              Repair Services
            </h4>
            <ul className="space-y-2.5 text-sm text-white/80">
              {enabledServices.slice(0, 6).map((service) => (
                <li key={service.id}>
                  <Link
                    to={`/services/${service.slug}`}
                    className="hover:text-white transition-colors hover:underline"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/services"
                  className="inline-flex items-center gap-1 text-brand-orange hover:text-white font-medium text-xs pt-1"
                >
                  <span>All 10 Repair Services</span>
                  <span>&rarr;</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-brand-orange mb-4">
              Explore & Shop
            </h4>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li>
                <Link to="/shop" className="hover:text-white transition-colors flex items-center gap-1.5 text-amber-300 font-bold">
                  <span>Online Store (Flipkart UI)</span>
                  <span className="text-[10px] bg-brand-orange text-white px-1.5 py-0.2 rounded-full uppercase">Hot</span>
                </Link>
              </li>
              <li>
                <Link to="/shop/chargers" className="hover:text-white transition-colors text-xs text-white/70 pl-2">
                  &bull; Fast Chargers & Adapters
                </Link>
              </li>
              <li>
                <Link to="/shop/audio" className="hover:text-white transition-colors text-xs text-white/70 pl-2">
                  &bull; boAt Audio & Earphones
                </Link>
              </li>
              <li>
                <Link to="/shop/spares" className="hover:text-white transition-colors text-xs text-white/70 pl-2">
                  &bull; Original Displays & Spare Parts
                </Link>
              </li>
              <li>
                <Link to="/android-repair" className="hover:text-white transition-colors">
                  Android Smartphone Repairs
                </Link>
              </li>
              <li>
                <Link to="/iphone-repair" className="hover:text-white transition-colors">
                  iPhone Repair Diagnostics
                </Link>
              </li>
              <li>
                <Link to="/repair-request" className="hover:text-white transition-colors font-medium text-white">
                  Book a Repair Online
                </Link>
              </li>
              <li>
                <Link to="/repair-status" className="hover:text-white transition-colors">
                  Track Existing Repair
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Our Shop
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact & Map Directions
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Shop Location & Direct Contact */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-brand-orange mb-4">
              Shop Location
            </h4>
            <div className="space-y-3 text-sm text-white/80">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-orange shrink-0 mt-1" />
                <span className="leading-snug">{settings.fullAddress}</span>
              </div>

              <div className="text-xs text-white/70 pl-6.5">
                <span className="font-semibold text-white">Plus Code:</span> {settings.plusCode}
              </div>

              <div className="pt-2">
                <a
                  href={settings.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-orange hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Google Maps</span>
                </a>
              </div>

              <div className="pt-3 space-y-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-brand-orange shrink-0" />
                  <a href={`tel:${settings.phone.replace(/\s+/g, '')}`} className="hover:text-white">
                    {settings.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a
                    href={createWhatsAppUrl('Hello Debasish, I would like to enquire about phone repair.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-emerald-300 text-emerald-400 font-medium"
                  >
                    WhatsApp: {settings.whatsapp}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Attribution */}
        <div className="pt-8 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <div>
            &copy; {new Date().getFullYear()} Mobile Repairing House. All rights reserved. Dunlop, Baranagar, Kolkata.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>&bull;</span>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <span>&bull;</span>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1 text-white/50 hover:text-brand-orange transition-colors"
              title="Staff CRM Portal"
            >
              <Lock className="w-3 h-3" />
              <span>Staff Login</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, MessageSquare, Wrench } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { createWhatsAppUrl } from '../../lib/whatsapp';

export const MobileBottomBar: React.FC = () => {
  const { settings } = useSettings();
  const location = useLocation();

  // Hide on admin routes to prevent conflict with CRM workflows
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/estimate-approval')) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-brand-border md:hidden px-3 py-2 shadow-2xl safe-area-pb">
      <div className="grid grid-cols-3 gap-2">
        {/* Call button */}
        <a
          href={`tel:${settings.phone.replace(/\s+/g, '')}`}
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-lg bg-brand-light text-brand-navy hover:bg-brand-muted transition-colors active:scale-95"
        >
          <Phone className="w-5 h-5 text-brand-navy mb-0.5" />
          <span className="text-[11px] font-bold">Call Shop</span>
        </a>

        {/* WhatsApp button */}
        <a
          href={createWhatsAppUrl('Hello Debasish, I need assistance with a mobile repair enquiry.')}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors active:scale-95 border border-emerald-200"
        >
          <MessageSquare className="w-5 h-5 text-emerald-600 mb-0.5" />
          <span className="text-[11px] font-bold">WhatsApp</span>
        </a>

        {/* Book Repair CTA */}
        <Link
          to="/repair-request"
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-lg bg-brand-orange text-white hover:bg-brand-orange-hover transition-colors active:scale-95 shadow-sm"
        >
          <Wrench className="w-5 h-5 text-white mb-0.5" />
          <span className="text-[11px] font-bold">Book Repair</span>
        </Link>
      </div>
    </div>
  );
};

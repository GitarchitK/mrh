import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  MapPin,
  Phone,
  MessageSquare,
  ChevronLeft,
  ChevronDown,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { getServiceBySlug, getServices } from '../../services/db';
import { ServiceItem } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { Button } from '../../components/ui/Button';
import { SeoHead } from '../../components/shared/SeoHead';
import { createWhatsAppUrl } from '../../lib/whatsapp';
import { fadeInUp, staggerContainer, accordionVariants, cardHoverProps } from '../../lib/animations';

export const ServiceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { settings } = useSettings();
  const [service, setService] = useState<ServiceItem | null>(null);
  const [relatedServices, setRelatedServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!slug) return;
    const fetch = async () => {
      setLoading(true);
      const found = await getServiceBySlug(slug);
      if (found) {
        setService(found);
        const all = await getServices();
        setRelatedServices(all.filter((s) => s.id !== found.id && s.enabled).slice(0, 3));
      } else {
        setService(null);
      }
      setLoading(false);
    };
    fetch();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-[60vh] bg-brand-light flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-2xl font-bold text-brand-navy mb-2">Service Not Found</h2>
        <p className="text-sm text-brand-secondary mb-6">
          The requested repair service page could not be located.
        </p>
        <Link to="/services">
          <Button variant="primary">Browse All Services</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-brand-light min-h-screen py-10 sm:py-16">
      <SeoHead
        title={service.title}
        description={service.shortDescription}
        serviceData={{ name: service.title, description: service.shortDescription }}
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6"
      >
        {/* Breadcrumb / Back button */}
        <motion.div variants={fadeInUp}>
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-secondary hover:text-brand-orange transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to All Services</span>
          </Link>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Content Column (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Header Card */}
            <motion.div
              variants={fadeInUp}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-xs"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-bold text-brand-orange uppercase tracking-wider bg-brand-orange-light/10 px-2.5 py-1 rounded-full border border-brand-orange/30">
                  {service.category}
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Bench Tested
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-brand-navy tracking-tight mb-4">
                {service.title}
              </h1>
              <p className="text-sm sm:text-base text-brand-secondary leading-relaxed font-normal">
                {service.fullDescription}
              </p>
            </motion.div>

            {/* Symptoms Section */}
            <motion.div
              variants={fadeInUp}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-xs"
            >
              <h3 className="text-lg font-bold text-brand-navy mb-2">
                Common Symptoms You May Notice
              </h3>
              <p className="text-xs text-brand-secondary mb-4">
                If your phone displays any of the following behavior, this service category is likely relevant:
              </p>
              <div className="space-y-2.5">
                {service.symptoms.map((symptom, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-brand-text p-2.5 rounded-xl bg-brand-light/60 border border-brand-border/60">
                    <CheckCircle2 className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                    <span className="leading-snug">{symptom}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Diagnostic Considerations */}
            <motion.div
              variants={fadeInUp}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-xs"
            >
              <h3 className="text-lg font-bold text-brand-navy mb-2">
                Bench Diagnostic Considerations
              </h3>
              <p className="text-xs text-brand-secondary mb-4">
                Before replacing any part, our technician inspects internal circuitry and frame tolerances:
              </p>
              <div className="space-y-2.5">
                {service.diagnosticConsiderations.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-brand-text p-2.5 rounded-xl bg-brand-light/60 border border-brand-border/60">
                    <AlertCircle className="w-4 h-4 text-brand-navy shrink-0 mt-0.5" />
                    <span className="leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Assessment Process */}
            <motion.div
              variants={fadeInUp}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-xs"
            >
              <h3 className="text-lg font-bold text-brand-navy mb-2">
                What the Assessment Process Involves
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {service.assessmentProcess.map((step, idx) => (
                  <div key={idx} className="bg-brand-light p-4 rounded-2xl border border-brand-border text-xs">
                    <span className="font-mono font-bold text-brand-orange text-sm">0{idx + 1}.</span>
                    <p className="text-brand-text font-semibold mt-1 leading-snug">{step}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Estimate & Approval Policy */}
            <motion.div
              variants={fadeInUp}
              className="bg-amber-50 p-6 rounded-3xl border border-amber-200"
            >
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wider mb-2">
                Estimate & Approval Policy
              </h3>
              <p className="text-xs text-amber-900 leading-relaxed">
                {service.estimateApprovalExplanation}
              </p>
              <p className="text-[11px] text-amber-800 font-semibold mt-3">
                * Note: We do not promise that every fault is salvageable. An honest evaluation is provided upon opening.
              </p>
            </motion.div>

            {/* Service FAQs with Animated Accordion */}
            {service.faqs && service.faqs.length > 0 && (
              <motion.div
                variants={fadeInUp}
                className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-xs space-y-4"
              >
                <h3 className="text-lg font-bold text-brand-navy">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-3">
                  {service.faqs.map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-2xl border border-brand-border overflow-hidden bg-brand-light/50 transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                          className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-brand-navy hover:text-brand-orange transition-colors gap-3"
                        >
                          <div className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-brand-orange shrink-0" />
                            <span>{faq.question}</span>
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 text-brand-secondary shrink-0 transition-transform duration-200 ${
                              isOpen ? 'rotate-180 text-brand-orange' : ''
                            }`}
                          />
                        </button>
                        <motion.div
                          variants={accordionVariants}
                          initial="collapsed"
                          animate={isOpen ? 'expanded' : 'collapsed'}
                        >
                          <div className="px-4 pb-4 pt-1 text-xs text-brand-secondary pl-10 leading-relaxed border-t border-brand-border/40">
                            {faq.answer}
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Sidebar Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Sticky Action Box */}
            <motion.div
              variants={fadeInUp}
              className="bg-white p-6 rounded-3xl border border-brand-border shadow-md sticky top-24 space-y-5"
            >
              <div>
                <span className="text-[10px] font-bold text-brand-orange uppercase tracking-wider block mb-1">
                  Workshop Booking
                </span>
                <h3 className="text-base font-bold text-brand-navy">
                  Need this repair?
                </h3>
                <p className="text-xs text-brand-secondary leading-relaxed mt-1">
                  Submit an online request with your device model, or chat directly with Debasish on WhatsApp.
                </p>
              </div>

              <div className="space-y-2.5">
                <Link
                  to={`/repair-request?category=${encodeURIComponent(service.title)}`}
                  className="block w-full"
                >
                  <Button variant="glow" size="md" className="w-full">
                    Book Repair Assessment
                  </Button>
                </Link>
                <a
                  href={createWhatsAppUrl(`Hello Debasish, I would like to enquire about ${service.title} for my smartphone.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                    leftIcon={<MessageSquare className="w-4 h-4 text-emerald-600" />}
                  >
                    Enquire on WhatsApp
                  </Button>
                </a>
              </div>

              {/* Supported Devices info */}
              <div className="pt-4 border-t border-brand-border space-y-2 text-xs">
                <span className="font-bold text-brand-navy block uppercase text-[10px] tracking-wider">
                  Supported Devices:
                </span>
                {service.supportedDevices.map((dev, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-brand-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                    <span>{dev}</span>
                  </div>
                ))}
              </div>

              {/* Shop address snippet */}
              <div className="pt-4 border-t border-brand-border text-xs text-brand-secondary space-y-1.5">
                <div className="font-bold text-brand-navy uppercase text-[10px] tracking-wider">
                  Shop Drop-off:
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-brand-orange shrink-0 mt-0.5" />
                  <span>Bhajan Complex, 139 B.T. Road, Dunlop, Kolkata</span>
                </div>
                <div className="flex items-center gap-2 pt-1 font-semibold text-brand-navy">
                  <Phone className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                  <a href={`tel:${settings.phone.replace(/\s+/g, '')}`}>{settings.phone}</a>
                </div>
              </div>
            </motion.div>

            {/* Related Services */}
            {relatedServices.length > 0 && (
              <motion.div
                variants={fadeInUp}
                className="bg-white p-5 rounded-3xl border border-brand-border shadow-xs"
              >
                <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider mb-3">
                  Other Services
                </h4>
                <div className="space-y-2">
                  {relatedServices.map((rel) => (
                    <Link
                      key={rel.id}
                      to={`/services/${rel.slug}`}
                      className="block p-3 rounded-2xl hover:bg-brand-light border border-transparent hover:border-brand-border transition-all group"
                    >
                      <div className="text-xs font-bold text-brand-navy group-hover:text-brand-orange transition-colors">
                        {rel.title}
                      </div>
                      <div className="text-[11px] text-brand-secondary truncate mt-0.5">
                        {rel.shortDescription}
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

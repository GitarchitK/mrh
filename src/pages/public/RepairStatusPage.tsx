import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Wrench,
  Clock,
  CheckCircle2,
  Phone,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  MapPin,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { getPublicRepairStatus } from '../../services/db';
import { PublicTrackingResponse } from '../../types';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SeoHead } from '../../components/shared/SeoHead';
import { formatDateTime, formatDate } from '../../lib/utils';
import { createWhatsAppUrl } from '../../lib/whatsapp';
import { triggerConfetti } from '../../lib/confetti';
import { fadeInUp, staggerContainer, scaleIn } from '../../lib/animations';

export const RepairStatusPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialJobParam = searchParams.get('job') || '';

  const [jobRef, setJobRef] = useState(initialJobParam);
  const [phoneVerification, setPhoneVerification] = useState('');
  const [loading, setLoading] = useState(false);
  const [trackingResult, setTrackingResult] = useState<PublicTrackingResponse | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!jobRef.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const result = await getPublicRepairStatus(jobRef.trim(), phoneVerification.trim() || undefined);
      setTrackingResult(result);
      setSearchParams({ job: jobRef.trim() });

      if (
        result?.valid &&
        (result.status === 'ready_for_collection' || result.status === 'completed')
      ) {
        triggerConfetti();
      }
    } catch (err) {
      console.error('Tracking query failed:', err);
      setTrackingResult({ valid: false, shopContact: {} as any });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialJobParam) {
      handleSearch();
    }
  }, []);

  return (
    <div className="bg-brand-light min-h-screen py-10 sm:py-16">
      <SeoHead
        title="Track Repair Job Status | Mobile Repairing House Dunlop"
        description="Check real-time progress of your phone repair at Mobile Repairing House. Enter your Job Reference number to see diagnostic and collection status."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Customer Self-Service Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-brand-navy">
            Track Your Repair Job
          </h1>
          <p className="text-xs sm:text-sm text-brand-secondary max-w-md mx-auto leading-relaxed">
            Enter the repair job reference from your counter intake receipt (e.g.{' '}
            <code className="bg-white px-2 py-0.5 rounded-lg border border-brand-border font-mono font-bold text-brand-navy">
              MRH-2026-XXXX
            </code>
            ).
          </p>
        </motion.div>

        {/* Search Card */}
        <motion.div
          variants={fadeInUp}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-xs"
        >
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Repair Job Reference *"
                required
                placeholder="e.g. MRH-2026-1042"
                value={jobRef}
                onChange={(e) => setJobRef(e.target.value)}
              />
              <Input
                label="Registered Mobile Number (Optional)"
                placeholder="Last 4 digits or full phone"
                value={phoneVerification}
                onChange={(e) => setPhoneVerification(e.target.value)}
                helperText="Extra verification for your privacy"
              />
            </div>

            <Button
              type="submit"
              size="md"
              variant="glow"
              className="w-full text-sm font-bold"
              isLoading={loading}
              leftIcon={<Search className="w-4 h-4" />}
            >
              Check Repair Status
            </Button>
          </form>
        </motion.div>

        {/* Search Results Display */}
        <AnimatePresence mode="wait">
          {hasSearched && !loading && (
            <motion.div
              key={trackingResult?.jobNumber || 'not-found'}
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {trackingResult && trackingResult.valid ? (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-md space-y-6">
                  {/* Result Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-border gap-3">
                    <div>
                      <span className="text-[11px] font-bold text-brand-secondary uppercase tracking-wider block">
                        Repair Reference
                      </span>
                      <h2 className="text-xl sm:text-2xl font-mono font-black text-brand-navy">
                        {trackingResult.jobNumber}
                      </h2>
                    </div>
                    <div>
                      <StatusBadge status={trackingResult.status || 'received'} size="md" />
                    </div>
                  </div>

                  {/* Device & Timestamps Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-brand-light p-5 rounded-2xl border border-brand-border text-xs">
                    <div>
                      <span className="text-brand-secondary block">Device Details:</span>
                      <span className="font-bold text-brand-navy text-sm">
                        {trackingResult.brand} {trackingResult.model}
                      </span>
                      <span className="text-brand-secondary block uppercase text-[10px] mt-0.5">
                        Platform: {trackingResult.deviceType}
                      </span>
                    </div>
                    <div>
                      <span className="text-brand-secondary block">Intake Date:</span>
                      <span className="font-semibold text-brand-navy">
                        {formatDateTime(trackingResult.receivedAt)}
                      </span>
                      {trackingResult.expectedCompletionAt && (
                        <div className="mt-1 text-emerald-800 font-medium">
                          Expected Ready: {formatDate(trackingResult.expectedCompletionAt)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Current Stage Explanation */}
                  <div className="p-4 rounded-2xl bg-brand-light/60 border border-brand-border text-xs space-y-1">
                    <span className="font-bold text-brand-navy uppercase tracking-wider text-[11px]">
                      Current Stage Update:
                    </span>
                    <p className="text-brand-secondary font-medium leading-relaxed">
                      {trackingResult.customerFacingUpdates}
                    </p>
                  </div>

                  {/* Progress Timeline with active pulse */}
                  {trackingResult.timeline && trackingResult.timeline.length > 0 && (
                    <div className="space-y-4 pt-2">
                      <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                        Repair Event Timeline
                      </h3>
                      <div className="space-y-4 relative pl-5 border-l-2 border-brand-orange/40 ml-2">
                        {trackingResult.timeline.map((item, idx) => {
                          const isLatest = idx === trackingResult.timeline!.length - 1;
                          return (
                            <div key={idx} className="relative group">
                              <div
                                className={`absolute -left-[27px] top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                                  isLatest
                                    ? 'bg-brand-orange ring-4 ring-brand-orange/20 animate-pulse'
                                    : 'bg-brand-navy'
                                }`}
                              />
                              <div className="text-xs">
                                <span className="font-bold text-brand-navy capitalize">
                                  {item.status.replace(/_/g, ' ')}
                                </span>
                                <span className="text-brand-secondary text-[11px] ml-2">
                                  {formatDateTime(item.timestamp)}
                                </span>
                              </div>
                              {item.publicNote && (
                                <p className="text-xs text-brand-secondary mt-0.5">{item.publicNote}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Warranty Active Pill */}
                  {trackingResult.warrantyActive && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>Active Warranty applies to this repair until {formatDate(trackingResult.warrantyExpiry)}.</span>
                    </div>
                  )}

                  {/* Shop Contact Action */}
                  <div className="pt-4 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-brand-secondary text-center sm:text-left">
                      <span>Questions about this repair? Message Debasish directly.</span>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <a
                        href={createWhatsAppUrl(`Hello Debasish, I am checking repair status for job ${trackingResult.jobNumber}.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto"
                      >
                        <Button size="sm" variant="outline" className="w-full text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50" leftIcon={<MessageSquare className="w-3.5 h-3.5 text-emerald-600" />}>
                          WhatsApp Debasish
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                /* Not Found Result */
                <div className="bg-white rounded-3xl p-8 border border-brand-border text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-brand-navy">
                    No Matching Repair Record Found
                  </h3>
                  <p className="text-xs text-brand-secondary max-w-md mx-auto leading-relaxed">
                    We could not find an active repair job matching &quot;{jobRef}&quot;. Please verify the reference on your counter intake receipt, or contact Debasish directly.
                  </p>
                  <div className="pt-2 flex justify-center gap-3">
                    <a
                      href={createWhatsAppUrl(`Hello Debasish, I am looking for my repair record for reference ${jobRef}.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" variant="outline" className="text-xs" leftIcon={<MessageSquare className="w-3.5 h-3.5 text-emerald-600" />}>
                        Ask on WhatsApp
                      </Button>
                    </a>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

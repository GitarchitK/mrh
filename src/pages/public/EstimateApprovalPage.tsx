import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  MessageSquare,
  AlertCircle,
  ShieldCheck,
  Check,
  Sparkles,
} from 'lucide-react';
import { getEstimateById, saveEstimate, updateRepairStatus } from '../../services/db';
import { Estimate } from '../../types';
import { formatPaiseToINR } from '../../lib/money';
import { formatDate } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import { SeoHead } from '../../components/shared/SeoHead';
import { createWhatsAppUrl } from '../../lib/whatsapp';
import { triggerSuccessConfetti } from '../../lib/confetti';
import { scaleIn, fadeInUp } from '../../lib/animations';

export const EstimateApprovalPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [decisionSuccess, setDecisionSuccess] = useState<'approved' | 'rejected' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetch = async () => {
      setLoading(true);
      const est = await getEstimateById(token);
      setEstimate(est);
      setLoading(false);
    };
    fetch();
  }, [token]);

  const handleApprove = async () => {
    if (!estimate) return;
    setActionLoading(true);
    try {
      const now = new Date().toISOString();
      const updated: Estimate = {
        ...estimate,
        status: 'approved',
        approvedAt: now,
        approvalMethod: 'online_portal',
        updatedAt: now,
      };
      await saveEstimate(updated);
      await updateRepairStatus(
        estimate.repairJobId,
        'approved',
        { id: 'customer_online', name: `Customer (${estimate.customerName})` },
        'Estimate approved online by customer through secure portal.'
      );
      setEstimate(updated);
      setDecisionSuccess('approved');
      triggerSuccessConfetti();
    } catch (err) {
      console.error('Failed to record approval:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!estimate) return;
    setActionLoading(true);
    try {
      const now = new Date().toISOString();
      const updated: Estimate = {
        ...estimate,
        status: 'rejected',
        rejectedAt: now,
        rejectionReason: rejectReason || 'Customer declined online estimate.',
        approvalMethod: 'online_portal',
        updatedAt: now,
      };
      await saveEstimate(updated);
      await updateRepairStatus(
        estimate.repairJobId,
        'on_hold',
        { id: 'customer_online', name: `Customer (${estimate.customerName})` },
        `Estimate declined by customer: ${rejectReason || 'No reason specified'}. Device on hold.`
      );
      setEstimate(updated);
      setDecisionSuccess('rejected');
      setShowRejectModal(false);
    } catch (err) {
      console.error('Failed to record rejection:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange" />
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="min-h-[70vh] bg-brand-light flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="w-12 h-12 text-rose-600 mb-3" />
        <h2 className="text-2xl font-bold text-brand-navy">Invalid or Expired Estimate Link</h2>
        <p className="text-xs text-brand-secondary max-w-sm mt-1 mb-6">
          This estimate link could not be verified. Please contact Debasish directly on WhatsApp or call our shop.
        </p>
        <Link to="/">
          <Button variant="primary">Return to Homepage</Button>
        </Link>
      </div>
    );
  }

  const isDecided = estimate.status === 'approved' || estimate.status === 'rejected';

  return (
    <div className="bg-brand-light min-h-screen py-12 sm:py-20 relative overflow-hidden">
      <SeoHead
        title="Review & Approve Repair Estimate"
        description="Review diagnostic findings and itemized estimate for your mobile phone repair at Mobile Repairing House, Dunlop."
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6 relative z-10">
        {/* Logo & Banner */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block hover:scale-105 transition-transform">
            <img
              src="/images/logo.webp"
              alt="Mobile Repairing House Logo"
              className="w-16 h-16 object-contain mx-auto rounded-2xl shadow-xs border border-brand-border bg-white p-1"
            />
          </Link>
          <div>
            <span className="text-xs font-bold text-brand-orange uppercase tracking-wider bg-brand-orange-light/80 px-3 py-1 rounded-full">
              Mobile Repairing House &bull; Dunlop
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-navy mt-2">
              Repair Estimate Review
            </h1>
            <p className="text-xs text-brand-secondary">
              Please review the parts, labour, and cost estimate prepared for your device.
            </p>
          </div>
        </div>

        {/* Success Alert if just decided */}
        <AnimatePresence>
          {decisionSuccess === 'approved' && (
            <motion.div
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              className="p-5 bg-emerald-50 border border-emerald-200 rounded-3xl flex items-center gap-3.5 text-xs text-emerald-800 shadow-sm"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-sm block text-emerald-950">Estimate Approved Successfully!</span>
                <span>Our technician has been notified and repair work will commence shortly. Thank you!</span>
              </div>
            </motion.div>
          )}

          {decisionSuccess === 'rejected' && (
            <motion.div
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              className="p-5 bg-slate-100 border border-slate-300 rounded-3xl flex items-center gap-3.5 text-xs text-slate-800 shadow-sm"
            >
              <div className="w-10 h-10 rounded-2xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-sm block text-slate-900">Estimate Declined</span>
                <span>Your decision has been recorded. Repair work will not proceed. You may collect your device at our shop.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Estimate Card */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/90 shadow-card-hover space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-brand-border">
            <div>
              <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider block">
                Estimate Number
              </span>
              <div className="text-xl font-mono font-black text-brand-navy">
                {estimate.estimateNumber}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider block">
                Repair Job Ref
              </span>
              <div className="text-sm font-mono font-bold text-brand-navy bg-brand-light px-2.5 py-1 rounded-lg border border-brand-border">
                {estimate.jobNumber}
              </div>
            </div>
          </div>

          {/* Customer info */}
          <div className="p-4 bg-brand-light rounded-2xl border border-brand-border flex justify-between items-center text-xs">
            <div>
              <span className="text-brand-secondary block">Prepared For:</span>
              <span className="font-bold text-brand-navy text-sm">{estimate.customerName}</span>
            </div>
            <div className="text-right">
              <span className="text-brand-secondary block">Status:</span>
              <span
                className={`font-bold uppercase text-[11px] px-2.5 py-0.5 rounded-full ${
                  estimate.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : estimate.status === 'rejected'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {estimate.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Line items table */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-brand-navy uppercase tracking-wider block">
              Itemized Quotation:
            </span>
            <div className="border border-brand-border rounded-2xl overflow-hidden divide-y divide-brand-border text-xs">
              {estimate.items.map((item, idx) => (
                <div key={item.id || idx} className="p-4 flex items-center justify-between bg-white hover:bg-brand-light/30 transition-colors">
                  <div>
                    <div className="font-bold text-brand-navy">{item.description}</div>
                    <div className="text-[11px] text-brand-secondary capitalize mt-0.5">
                      {item.type} &bull; Qty: {item.quantity} &times; {formatPaiseToINR(item.unitPricePaise)}
                    </div>
                  </div>
                  <div className="font-extrabold text-brand-navy text-sm">
                    {formatPaiseToINR(item.totalPaise)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-brand-light p-5 rounded-2xl border border-brand-border space-y-2 text-xs">
            <div className="flex justify-between text-brand-secondary">
              <span>Subtotal:</span>
              <span className="font-semibold text-brand-navy">{formatPaiseToINR(estimate.subtotalPaise)}</span>
            </div>
            {estimate.discountPaise > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount Applied:</span>
                <span>-{formatPaiseToINR(estimate.discountPaise)}</span>
              </div>
            )}
            {estimate.taxPaise > 0 && (
              <div className="flex justify-between text-brand-secondary">
                <span>Tax:</span>
                <span>{formatPaiseToINR(estimate.taxPaise)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-brand-border flex justify-between text-base font-black text-brand-navy">
              <span>Total Estimated Cost:</span>
              <span className="text-brand-orange text-lg">{formatPaiseToINR(estimate.totalPaise)}</span>
            </div>
          </div>

          {estimate.notes && (
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
              <span className="font-bold block mb-0.5">Technician Notes:</span>
              {estimate.notes}
            </div>
          )}

          {/* Action buttons (only if not decided) */}
          {!isDecided ? (
            <div className="pt-4 border-t border-brand-border space-y-3">
              <Button
                variant="primary"
                size="lg"
                className="w-full text-base font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 cursor-pointer"
                onClick={handleApprove}
                isLoading={actionLoading}
                leftIcon={<Check className="w-5 h-5" />}
              >
                Approve Repair Estimate ({formatPaiseToINR(estimate.totalPaise)})
              </Button>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs text-rose-700 border-rose-300 hover:bg-rose-50"
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                >
                  Decline / Request Return
                </Button>
                <a
                  href={createWhatsAppUrl(`Hello Debasish, I have a question regarding estimate ${estimate.estimateNumber} for job ${estimate.jobNumber}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button variant="outline" size="sm" className="w-full text-xs" leftIcon={<MessageSquare className="w-3.5 h-3.5 text-emerald-600" />}>
                    Discuss on WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          ) : (
            <div className="pt-4 border-t border-brand-border text-center text-xs text-brand-secondary">
              Decision recorded on {formatDate(estimate.approvedAt || estimate.rejectedAt)}.
            </div>
          )}
        </motion.div>

        {/* Modal for Reject confirmation */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-brand-border space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-brand-navy">Decline Repair Estimate</h3>
              <p className="text-xs text-brand-secondary">
                Are you sure you want to decline this estimate? Repair work will not proceed and your phone can be collected at our Dunlop counter.
              </p>
              <Textarea
                label="Reason (Optional)"
                placeholder="e.g. Cost exceeds budget, decided to replace device, etc."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => setShowRejectModal(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="danger" onClick={handleReject} isLoading={actionLoading}>
                  Confirm Decline
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

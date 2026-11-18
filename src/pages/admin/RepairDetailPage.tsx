import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  ShieldCheck,
  Phone,
  MessageSquare,
  Printer,
  ArrowLeft,
  ChevronRight,
  User,
  PlusCircle,
  History,
  Send,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import {
  getRepairJobById,
  updateRepairStatus,
  updateRepairJob,
  getRepairJobEvents,
  getEstimates,
  getInvoices,
  getWarranties,
  getBusinessSettings,
} from '../../services/db';
import {
  RepairJob,
  RepairJobEvent,
  RepairStatus,
  Estimate,
  Invoice,
  Warranty,
  BusinessSettings,
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { IntakeSheetPrint } from '../../components/print/IntakeSheetPrint';
import { formatDateTime, formatDate, formatPhoneNumber } from '../../lib/utils';
import { formatPaiseToINR } from '../../lib/money';
import { createWhatsAppUrl, WhatsAppTemplates } from '../../lib/whatsapp';
import { triggerConfetti } from '../../lib/confetti';
import { fadeInUp, staggerContainer, cardHoverProps } from '../../lib/animations';

export const RepairDetailPage: React.FC = () => {
  const { repairId } = useParams<{ repairId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [job, setJob] = useState<RepairJob | null>(null);
  const [events, setEvents] = useState<RepairJobEvent[]>([]);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [warranty, setWarranty] = useState<Warranty | null>(null);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Status Change State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<RepairStatus>('diagnosing');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Edit / Tech Diagnosis State
  const [techDiagnosis, setTechDiagnosis] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Print Sheet Modal
  const [printModalOpen, setPrintModalOpen] = useState(false);

  const loadJob = async () => {
    if (!repairId) return;
    setLoading(true);
    try {
      const foundJob = await getRepairJobById(repairId);
      if (foundJob) {
        setJob(foundJob);
        setTechDiagnosis(foundJob.diagnosis || '');
        setInternalNotes(foundJob.internalNotes || '');

        const [evs, allEsts, allInvs, allWrns, bSettings] = await Promise.all([
          getRepairJobEvents(foundJob.id),
          getEstimates(),
          getInvoices(),
          getWarranties(),
          getBusinessSettings(),
        ]);

        setEvents(evs);
        setEstimate(allEsts.find((e) => e.repairJobId === foundJob.id) || null);
        setInvoice(allInvs.find((i) => i.repairJobId === foundJob.id) || null);
        setWarranty(allWrns.find((w) => w.repairJobId === foundJob.id) || null);
        setSettings(bSettings);
      }
    } catch (err) {
      console.error('Failed to load repair details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJob();
  }, [repairId]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    setUpdatingStatus(true);
    try {
      await updateRepairStatus(
        job.id,
        targetStatus,
        {
          id: currentUser?.uid || 'owner_debasish',
          name: currentUser?.displayName || 'Debasish',
        },
        statusNote.trim() || undefined
      );

      if (targetStatus === 'ready_for_collection' || targetStatus === 'completed') {
        triggerConfetti();
      }

      setStatusModalOpen(false);
      setStatusNote('');
      await loadJob();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!job) return;
    setSavingNotes(true);
    try {
      await updateRepairJob(job.id, {
        diagnosis: techDiagnosis.trim() || undefined,
        internalNotes: internalNotes.trim() || undefined,
      });
      await loadJob();
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-16 text-center text-xs text-brand-secondary">
        Repair job not found.
      </div>
    );
  }

  const allStatuses: { value: RepairStatus; label: string }[] = [
    { value: 'received', label: 'Received' },
    { value: 'diagnosing', label: 'Diagnosing' },
    { value: 'estimate_sent', label: 'Estimate Sent' },
    { value: 'awaiting_approval', label: 'Awaiting Customer Approval' },
    { value: 'approved', label: 'Approved by Customer' },
    { value: 'in_repair', label: 'In Repair (Workbench)' },
    { value: 'ready_for_collection', label: 'Ready for Collection' },
    { value: 'completed', label: 'Completed & Returned' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'unrepairable', label: 'Unrepairable' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-5xl mx-auto"
    >
      {/* Top Header */}
      <motion.div
        variants={fadeInUp}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <Link
            to="/admin/repairs"
            className="p-2 rounded-xl border border-brand-border bg-white text-brand-secondary hover:text-brand-navy hover:bg-brand-light transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-mono font-black text-brand-navy">
                {job.jobNumber}
              </h1>
              <StatusBadge status={job.status} size="md" />
            </div>
            <p className="text-xs text-brand-secondary mt-0.5">
              Intake on {formatDateTime(job.receivedAt)} &bull; {job.brand} {job.model}
            </p>
          </div>
        </div>

        {/* Top actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Printer className="w-3.5 h-3.5" />}
            onClick={() => setPrintModalOpen(true)}
          >
            Intake Sheet
          </Button>
          <Button
            size="sm"
            variant="glow"
            onClick={() => {
              setTargetStatus(job.status);
              setStatusModalOpen(true);
            }}
          >
            Update Status
          </Button>
        </div>
      </motion.div>

      {/* Main Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Device, Customer & Diagnosis */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Device & Customer */}
          <motion.div
            variants={fadeInUp}
            className="bg-white p-6 rounded-3xl border border-brand-border shadow-xs space-y-4"
          >
            <h2 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
              Device & Customer Intake Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-brand-light rounded-2xl border border-brand-border space-y-1">
                <span className="text-brand-secondary block text-[10px] uppercase font-bold tracking-wider">
                  Customer Details
                </span>
                <div className="font-bold text-sm text-brand-navy">{job.customerName}</div>
                <div className="flex items-center gap-1.5 text-brand-text font-semibold">
                  <Phone className="w-3.5 h-3.5 text-brand-orange" />
                  <a href={`tel:${job.customerPhone.replace(/\s+/g, '')}`}>{formatPhoneNumber(job.customerPhone)}</a>
                </div>
                {job.customerEmail && <div className="text-brand-secondary">{job.customerEmail}</div>}
              </div>

              <div className="p-4 bg-brand-light rounded-2xl border border-brand-border space-y-1">
                <span className="text-brand-secondary block text-[10px] uppercase font-bold tracking-wider">
                  Device Hardware
                </span>
                <div className="font-bold text-sm text-brand-navy">
                  {job.brand} {job.model}
                </div>
                <div className="text-brand-secondary uppercase text-[10px]">
                  OS: {job.deviceType} &bull; Priority: {job.priority.toUpperCase()}
                </div>
                {job.imeiOrSerial && (
                  <div className="text-brand-secondary font-mono">IMEI: {job.imeiOrSerial}</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <span className="text-brand-secondary font-bold uppercase text-[10px] block mb-1">
                  Condition at Intake:
                </span>
                <p className="p-3 rounded-xl bg-brand-light text-brand-text border border-brand-border">
                  {job.conditionAtIntake || 'Standard wear'}
                </p>
              </div>
              <div>
                <span className="text-brand-secondary font-bold uppercase text-[10px] block mb-1">
                  Accessories Received:
                </span>
                <p className="p-3 rounded-xl bg-brand-light text-brand-text border border-brand-border">
                  {job.accessoriesReceived || 'Handset only'}
                </p>
              </div>
            </div>

            {job.devicePasscodeOrPattern && (
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
                <span className="font-bold block uppercase text-[10px] tracking-wider">Passcode / Pattern Noted:</span>
                {job.devicePasscodeOrPattern}
              </div>
            )}
          </motion.div>

          {/* Card 2: Symptoms & Diagnosis */}
          <motion.div
            variants={fadeInUp}
            className="bg-white p-6 rounded-3xl border border-brand-border shadow-xs space-y-4"
          >
            <h2 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
              Diagnostic & Technician Bench Notes
            </h2>

            <div className="space-y-1 text-xs">
              <span className="font-bold text-brand-secondary uppercase text-[10px]">
                Reported Problem:
              </span>
              <p className="p-3.5 rounded-2xl bg-brand-light font-medium text-brand-navy border border-brand-border">
                {job.reportedProblem}
              </p>
            </div>

            <div className="space-y-3">
              <Input
                label="Technician Findings & Diagnosis"
                placeholder="e.g. Display backlight IC undamaged, screen flex broken at fold"
                enableVoice
                value={techDiagnosis}
                onChange={(e) => setTechDiagnosis(e.target.value)}
              />
              <Textarea
                label="Internal Technician Notes (Private to Shop)"
                placeholder="Any confidential parts supplier notes, internal testing logs..."
                enableVoice
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
              />
              <div className="flex justify-end">
                <Button size="sm" variant="secondary" onClick={handleSaveNotes} isLoading={savingNotes}>
                  Save Diagnostic Notes
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Repair Event History (Audit Trail) */}
          <motion.div
            variants={fadeInUp}
            className="bg-white p-6 rounded-3xl border border-brand-border shadow-xs space-y-4"
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-brand-orange" />
              <h2 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                Event History & Audit Trail
              </h2>
            </div>

            <div className="space-y-4 relative pl-5 border-l-2 border-brand-orange/40 ml-2 text-xs">
              {events.map((ev) => (
                <div key={ev.id} className="relative">
                  <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-brand-orange border-2 border-white shadow-xs" />
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-navy capitalize">
                      {ev.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-brand-secondary text-[10px]">
                      &bull; {formatDateTime(ev.timestamp)}
                    </span>
                    <span className="text-brand-secondary text-[10px] bg-brand-light px-2 py-0.5 rounded-full border border-brand-border font-semibold">
                      {ev.actorName}
                    </span>
                  </div>
                  {ev.note && <p className="text-brand-secondary mt-1">{ev.note}</p>}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column (4 cols): Financial, Estimate, Invoicing, WhatsApp */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Communication Box */}
          <motion.div
            variants={fadeInUp}
            className="bg-white p-5 rounded-3xl border border-brand-border shadow-xs space-y-3 text-xs"
          >
            <h3 className="font-bold text-brand-navy uppercase text-[11px] tracking-wider">
              Customer WhatsApp Triggers
            </h3>
            <p className="text-brand-secondary leading-relaxed">
              Send fast prefilled updates to {job.customerName}:
            </p>

            <div className="space-y-2 pt-1">
              <a
                href={createWhatsAppUrl(
                  WhatsAppTemplates.repairReadyForCollection(job.jobNumber, job.customerName),
                  job.customerPhone
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <Button size="sm" variant="outline" className="w-full text-xs text-emerald-800 border-emerald-300 hover:bg-emerald-50" leftIcon={<MessageSquare className="w-3.5 h-3.5 text-emerald-600" />}>
                  Ready for Pickup WhatsApp
                </Button>
              </a>

              <a
                href={createWhatsAppUrl(
                  `Hello ${job.customerName}, this is Mobile Repairing House Dunlop regarding your device (${job.brand} ${job.model}) under job ${job.jobNumber}.`,
                  job.customerPhone
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <Button size="sm" variant="outline" className="w-full text-xs" leftIcon={<MessageSquare className="w-3.5 h-3.5 text-brand-secondary" />}>
                  General Chat WhatsApp
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Estimate Card */}
          <motion.div
            variants={fadeInUp}
            className="bg-white p-5 rounded-3xl border border-brand-border shadow-xs space-y-3 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-brand-navy uppercase text-[11px] tracking-wider">
                Repair Estimate
              </span>
              {estimate && <StatusBadge status={estimate.status} size="sm" />}
            </div>

            {estimate ? (
              <div className="space-y-3">
                <div className="p-3.5 bg-brand-light rounded-2xl border border-brand-border">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-brand-navy">{estimate.estimateNumber}</span>
                    <span className="font-black text-brand-orange text-sm">
                      {formatPaiseToINR(estimate.totalPaise)}
                    </span>
                  </div>
                  <div className="text-[10px] text-brand-secondary mt-1">
                    {estimate.items.length} line items &bull; Issued {formatDate(estimate.issuedAt)}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Link to={`/estimate-approval/${estimate.approvalToken}`} target="_blank" className="block w-full">
                    <Button size="sm" variant="outline" className="w-full text-xs">
                      Customer Public Approval Link
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-center py-2">
                <p className="text-brand-secondary">No estimate generated for this repair yet.</p>
                <Link
                  to={`/admin/estimates?newForJob=${job.id}&name=${encodeURIComponent(job.customerName)}&phone=${encodeURIComponent(job.customerPhone)}&jobNumber=${job.jobNumber}&custId=${job.customerId}`}
                  className="block w-full"
                >
                  <Button size="sm" variant="primary" className="w-full" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
                    Create Estimate
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>

          {/* Invoice Card */}
          <motion.div
            variants={fadeInUp}
            className="bg-white p-5 rounded-3xl border border-brand-border shadow-xs space-y-3 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-brand-navy uppercase text-[11px] tracking-wider">
                Invoice & Payments
              </span>
              {invoice && <StatusBadge status={invoice.status} size="sm" />}
            </div>

            {invoice ? (
              <div className="space-y-3">
                <div className="p-3.5 bg-brand-light rounded-2xl border border-brand-border space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-brand-navy">{invoice.invoiceNumber}</span>
                    <span className="font-black text-brand-navy text-sm">
                      {formatPaiseToINR(invoice.totalPaise)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-brand-secondary">Paid:</span>
                    <span className="font-semibold text-emerald-700">{formatPaiseToINR(invoice.amountPaidPaise)}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-brand-secondary">Balance Due:</span>
                    <span className={invoice.balanceDuePaise > 0 ? 'text-rose-600 font-bold' : 'text-emerald-700'}>
                      {formatPaiseToINR(invoice.balanceDuePaise)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link to={`/admin/invoices`} className="w-full">
                    <Button size="sm" variant="outline" className="w-full text-xs">
                      View Invoice
                    </Button>
                  </Link>
                  {invoice.balanceDuePaise > 0 && (
                    <Link to={`/admin/payments?invId=${invoice.id}&amount=${invoice.balanceDuePaise}`} className="w-full">
                      <Button size="sm" variant="primary" className="w-full text-xs">
                        Record Payment
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-center py-2">
                <p className="text-brand-secondary">No final invoice billed yet.</p>
                <Link
                  to={`/admin/billing?jobId=${job.id}&name=${encodeURIComponent(job.customerName)}&phone=${encodeURIComponent(job.customerPhone)}&jobNumber=${job.jobNumber}&custId=${job.customerId}`}
                  className="block w-full"
                >
                  <Button size="sm" variant="glow" className="w-full" leftIcon={<FileText className="w-3.5 h-3.5" />}>
                    Generate Bill & Receipt
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>

          {/* Warranty Card */}
          <motion.div
            variants={fadeInUp}
            className="bg-white p-5 rounded-3xl border border-brand-border shadow-xs space-y-3 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-brand-navy uppercase text-[11px] tracking-wider">
                Repair Warranty
              </span>
              {warranty && <StatusBadge status={warranty.status} size="sm" />}
            </div>

            {warranty ? (
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                <div className="font-mono font-bold text-emerald-900">{warranty.warrantyReference}</div>
                <div className="text-emerald-800">{warranty.coveredWork}</div>
                <div className="text-[10px] text-emerald-700">Expires: {formatDate(warranty.expiryDate)}</div>
              </div>
            ) : (
              <div className="space-y-2 text-center py-2">
                <p className="text-brand-secondary">No warranty issued yet.</p>
                {job.status === 'completed' && (
                  <Link
                    to={`/admin/warranties?newForJob=${job.id}&name=${encodeURIComponent(job.customerName)}&phone=${encodeURIComponent(job.customerPhone)}&jobNumber=${job.jobNumber}&custId=${job.customerId}&device=${encodeURIComponent(`${job.brand} ${job.model}`)}`}
                    className="block w-full"
                  >
                    <Button size="sm" variant="outline" className="w-full text-xs" leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}>
                      Issue Warranty Certificate
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Repair Status"
        description={`Transition ${job.jobNumber} to next workflow stage.`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <Select
            label="New Repair Status *"
            required
            value={targetStatus}
            onChange={(e) => setTargetStatus(e.target.value as RepairStatus)}
          >
            {allStatuses.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </Select>

          <Textarea
            label="Audit Event Note"
            placeholder="e.g. Ultrasonic cleaning complete, replacement display tested successfully..."
            enableVoice
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            helperText="Appended to the customer timeline & technician audit trail."
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="glow" isLoading={updatingStatus}>
              Save Status Update
            </Button>
          </div>
        </form>
      </Modal>

      {/* Print Intake Sheet Modal */}
      {printModalOpen && settings && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4 flex items-center justify-center">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl">
            <IntakeSheetPrint
              job={job}
              settings={settings}
              onClose={() => setPrintModalOpen(false)}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

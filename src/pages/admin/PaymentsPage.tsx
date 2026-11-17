import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  CreditCard,
  PlusCircle,
  Search,
  CheckCircle2,
  DollarSign,
  Calendar,
  User,
  ArrowRight,
} from 'lucide-react';
import { getPayments, recordPayment, getInvoices } from '../../services/db';
import { Payment, Invoice, PaymentMethod } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { formatPaiseToINR, rupeesToPaise } from '../../lib/money';
import { formatDate, formatDateTime } from '../../lib/utils';
import { generatePaymentReference } from '../../lib/reference';

export const PaymentsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();

  const prefillInvId = searchParams.get('invId') || '';
  const prefillAmount = searchParams.get('amount') || '';
  const prefillName = searchParams.get('name') || '';

  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [recordModalOpen, setRecordModalOpen] = useState(Boolean(prefillInvId));

  // Form State
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(prefillInvId);
  const [amountRupees, setAmountRupees] = useState(
    prefillAmount ? String(parseInt(prefillAmount) / 100) : ''
  );
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [externalReference, setExternalReference] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [pList, iList] = await Promise.all([getPayments(), getInvoices()]);
    setPayments(pList);
    setInvoices(iList);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId) {
      alert('Please select an invoice.');
      return;
    }

    const amtPaise = rupeesToPaise(amountRupees);
    if (amtPaise <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    const targetInvoice = invoices.find((i) => i.id === selectedInvoiceId);
    if (!targetInvoice) {
      alert('Selected invoice not found.');
      return;
    }

    setSaving(true);
    try {
      const now = new Date().toISOString();
      const newPayment: Payment = {
        id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        paymentReference: generatePaymentReference(),
        invoiceId: targetInvoice.id,
        repairJobId: targetInvoice.repairJobId,
        customerId: targetInvoice.customerId,
        customerName: targetInvoice.customerName,
        amountPaise: amtPaise,
        method,
        externalReference: externalReference.trim() || undefined,
        notes: notes.trim() || undefined,
        recordedBy: currentUser?.displayName || 'Debasish',
        recordedAt: now,
      };

      await recordPayment(newPayment);
      setRecordModalOpen(false);
      setAmountRupees('');
      setExternalReference('');
      setNotes('');
      await loadData();
    } catch (err) {
      console.error('Failed to record payment:', err);
      alert('Failed to record payment.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = payments.filter(
    (p) =>
      p.paymentReference.toLowerCase().includes(search.toLowerCase()) ||
      p.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (p.externalReference && p.externalReference.toLowerCase().includes(search.toLowerCase())) ||
      p.method.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-navy tracking-tight">
            Payments Received
          </h1>
          <p className="text-xs text-brand-secondary mt-0.5">
            Verified cash, UPI, and bank collections with audit tracking.
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
          onClick={() => setRecordModalOpen(true)}
        >
          Record Payment
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-xs">
        <Input
          placeholder="Search by payment reference, customer name, UPI ref..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-brand-secondary">
            No payments recorded yet. Click &quot;Record Payment&quot; when a customer settles an invoice.
          </div>
        ) : (
          <div className="divide-y divide-brand-border text-xs">
            {filtered.map((pay) => (
              <div
                key={pay.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-brand-light/40 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-sm text-brand-navy">
                      {pay.paymentReference}
                    </span>
                    <span className="px-2 py-0.5 rounded uppercase font-bold text-[10px] bg-emerald-100 text-emerald-800">
                      {pay.method.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-brand-secondary">
                      {formatDateTime(pay.recordedAt)}
                    </span>
                  </div>

                  <div className="font-bold text-sm text-brand-text">
                    {pay.customerName}
                  </div>

                  <div className="text-brand-secondary text-[11px] flex items-center gap-3">
                    {pay.externalReference && (
                      <span className="font-mono">Ref: {pay.externalReference}</span>
                    )}
                    <span>Recorded by: {pay.recordedBy}</span>
                    {pay.notes && <span>&bull; Note: {pay.notes}</span>}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xl font-black text-emerald-700">
                    +{formatPaiseToINR(pay.amountPaise)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={recordModalOpen}
        onClose={() => setRecordModalOpen(false)}
        title="Record Customer Payment"
        description="Log an authorized payment and update invoice balance."
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-navy uppercase tracking-wider mb-1">
              Select Invoice to Settle *
            </label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => {
                const invId = e.target.value;
                setSelectedInvoiceId(invId);
                const found = invoices.find((i) => i.id === invId);
                if (found && found.balanceDuePaise > 0) {
                  setAmountRupees(String(found.balanceDuePaise / 100));
                }
              }}
              className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-xs text-brand-text focus:outline-none"
              required
            >
              <option value="">-- Choose Invoice --</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} - {inv.customerName} (Bal: {formatPaiseToINR(inv.balanceDuePaise)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Payment Amount (₹) *"
              type="number"
              step="any"
              min="1"
              required
              placeholder="e.g. 1500"
              value={amountRupees}
              onChange={(e) => setAmountRupees(e.target.value)}
            />

            <Select
              label="Payment Method *"
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            >
              <option value="cash">Cash Counter</option>
              <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
              <option value="bank_transfer">Bank Transfer / NEFT</option>
              <option value="other">Other</option>
            </Select>
          </div>

          <Input
            label="Transaction / UPI Reference (Optional)"
            placeholder="e.g. 12-digit UPI transaction ID"
            value={externalReference}
            onChange={(e) => setExternalReference(e.target.value)}
          />

          <Textarea
            label="Payment Notes (Optional)"
            placeholder="Any memo or notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setRecordModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              Confirm & Record Payment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FileText,
  PlusCircle,
  Search,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  MessageSquare,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { getEstimates, saveEstimate, getRepairJobs } from '../../services/db';
import { Estimate, EstimateLineItem, RepairJob } from '../../types';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { formatPaiseToINR, rupeesToPaise, calculateTotalsPaise } from '../../lib/money';
import { formatDate, formatDateTime, formatPhoneNumber } from '../../lib/utils';
import { generateEstimateNumber, generateTrackingToken } from '../../lib/reference';
import { createWhatsAppUrl, WhatsAppTemplates } from '../../lib/whatsapp';

export const EstimatesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();

  const newForJob = searchParams.get('newForJob') || '';
  const prefillName = searchParams.get('name') || '';
  const prefillPhone = searchParams.get('phone') || '';
  const prefillJobNumber = searchParams.get('jobNumber') || '';
  const prefillCustId = searchParams.get('custId') || '';

  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [repairs, setRepairs] = useState<RepairJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(Boolean(newForJob));
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // New Estimate Form State
  const [repairJobId, setRepairJobId] = useState(newForJob);
  const [jobNumber, setJobNumber] = useState(prefillJobNumber);
  const [customerId, setCustomerId] = useState(prefillCustId);
  const [customerName, setCustomerName] = useState(prefillName);
  const [customerPhone, setCustomerPhone] = useState(prefillPhone);
  const [notes, setNotes] = useState('');
  const [discountRupees, setDiscountRupees] = useState('0');

  // Line Items
  const [items, setItems] = useState<{ id: string; description: string; type: 'part' | 'labour'; quantity: number; unitPriceRupees: string }[]>([
    { id: '1', description: 'Replacement Spare Part', type: 'part', quantity: 1, unitPriceRupees: '1200' },
    { id: '2', description: 'Bench Diagnostic & Precision Labour', type: 'labour', quantity: 1, unitPriceRupees: '350' },
  ]);

  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [eList, rList] = await Promise.all([getEstimates(), getRepairJobs()]);
    setEstimates(eList);
    setRepairs(rList);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: String(Date.now()),
        description: '',
        type: 'part',
        quantity: 1,
        unitPriceRupees: '0',
      },
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== idx));
    }
  };

  const handleItemChange = (idx: number, field: string, value: any) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    setItems(updated);
  };

  // Calculate live totals
  const subtotalPaise = items.reduce((acc, item) => {
    const pricePaise = rupeesToPaise(item.unitPriceRupees || 0);
    return acc + pricePaise * Math.max(1, item.quantity);
  }, 0);

  const discountPaise = rupeesToPaise(discountRupees || 0);
  const { totalPaise } = calculateTotalsPaise(subtotalPaise, discountPaise);

  const handleSaveEstimate = async (status: 'draft' | 'issued') => {
    if (!repairJobId) {
      alert('Please select or specify a repair job.');
      return;
    }

    setSaving(true);
    try {
      const lineItems: EstimateLineItem[] = items.map((item) => {
        const uPricePaise = rupeesToPaise(item.unitPriceRupees || 0);
        return {
          id: item.id,
          description: item.description.trim() || 'Service Item',
          type: item.type,
          quantity: item.quantity,
          unitPricePaise: uPricePaise,
          totalPaise: uPricePaise * item.quantity,
        };
      });

      const now = new Date().toISOString();
      const newEstimate: Estimate = {
        id: `est_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        estimateNumber: generateEstimateNumber(),
        repairJobId,
        jobNumber: jobNumber || 'MRH-JOB',
        customerId: customerId || 'cust_temp',
        customerName: customerName || 'Valued Customer',
        customerPhone: customerPhone || '',
        items: lineItems,
        subtotalPaise,
        discountPaise,
        taxPaise: 0,
        totalPaise,
        status,
        revision: 1,
        approvalToken: generateTrackingToken(),
        notes: notes.trim() || undefined,
        issuedAt: status === 'issued' ? now : undefined,
        validUntilDays: 7,
        createdBy: currentUser?.displayName || 'Debasish',
        createdAt: now,
        updatedAt: now,
      };

      await saveEstimate(newEstimate);
      setCreateModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to save estimate:', err);
      alert('Failed to save estimate.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/estimate-approval/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const filtered = estimates.filter(
    (e) =>
      e.estimateNumber.toLowerCase().includes(search.toLowerCase()) ||
      e.jobNumber.toLowerCase().includes(search.toLowerCase()) ||
      e.customerName.toLowerCase().includes(search.toLowerCase()) ||
      e.customerPhone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-navy tracking-tight">
            Repair Estimates
          </h1>
          <p className="text-xs text-brand-secondary mt-0.5">
            Prepare parts and labour quotes, generate public approval tokens, and record customer authorization.
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
          onClick={() => setCreateModalOpen(true)}
        >
          Create Estimate
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-xs">
        <Input
          placeholder="Search by estimate number, job ref, or customer name..."
          enableVoice
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Estimates List */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-brand-secondary">
            No estimates found. Click &quot;Create Estimate&quot; to generate an estimate for a repair job.
          </div>
        ) : (
          <div className="divide-y divide-brand-border text-xs">
            {filtered.map((est) => (
              <div
                key={est.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-brand-light/40 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-sm text-brand-navy">
                      {est.estimateNumber}
                    </span>
                    <span className="font-mono text-xs text-brand-secondary bg-brand-light px-2 py-0.5 rounded border border-brand-border">
                      Job: {est.jobNumber}
                    </span>
                    <StatusBadge status={est.status} size="sm" />
                    <span className="text-[11px] text-brand-secondary">
                      {formatDate(est.createdAt)}
                    </span>
                  </div>

                  <div className="font-bold text-sm text-brand-text">
                    {est.customerName} &bull; <span className="font-normal text-brand-secondary">{formatPhoneNumber(est.customerPhone)}</span>
                  </div>

                  <div className="text-[11px] text-brand-secondary">
                    Items: {est.items.map((i) => `${i.description} (${formatPaiseToINR(i.totalPaise)})`).join(', ')}
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-2 shrink-0">
                  <div className="text-lg font-black text-brand-navy">
                    {formatPaiseToINR(est.totalPaise)}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyLink(est.approvalToken)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-brand-border bg-white hover:bg-brand-light text-brand-navy font-semibold text-[11px]"
                      title="Copy Public Customer Approval Link"
                    >
                      {copiedToken === est.approvalToken ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>

                    <a
                      href={createWhatsAppUrl(
                        WhatsAppTemplates.estimateReady(
                          est.jobNumber,
                          est.customerName,
                          formatPaiseToINR(est.totalPaise),
                          `${window.location.origin}/estimate-approval/${est.approvalToken}`
                        ),
                        est.customerPhone
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-semibold text-[11px]"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                    </a>

                    <Link
                      to={`/estimate-approval/${est.approvalToken}`}
                      target="_blank"
                      className="p-1.5 rounded-lg border border-brand-border hover:bg-brand-light text-brand-secondary"
                      title="Preview Approval Page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Estimate Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Repair Estimate"
        description="Add itemized parts and labour for customer approval."
        maxWidth="2xl"
      >
        <div className="space-y-4">
          {/* Repair Job Selector */}
          <div>
            <label className="block text-xs font-semibold text-brand-navy uppercase tracking-wider mb-1">
              Associated Repair Job *
            </label>
            <select
              value={repairJobId}
              onChange={(e) => {
                const jId = e.target.value;
                setRepairJobId(jId);
                const found = repairs.find((r) => r.id === jId);
                if (found) {
                  setJobNumber(found.jobNumber);
                  setCustomerId(found.customerId);
                  setCustomerName(found.customerName);
                  setCustomerPhone(found.customerPhone);
                }
              }}
              className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-xs text-brand-text focus:outline-none"
            >
              <option value="">-- Select Repair Job --</option>
              {repairs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.jobNumber} - {r.customerName} ({r.brand} {r.model})
                </option>
              ))}
            </select>
          </div>

          {/* Customer summary */}
          {customerName && (
            <div className="p-3 bg-brand-light rounded-xl border border-brand-border text-xs flex justify-between">
              <div>
                <span className="text-brand-secondary block">Customer:</span>
                <span className="font-bold text-brand-navy">{customerName}</span>
              </div>
              <div className="text-right">
                <span className="text-brand-secondary block">Job Ref:</span>
                <span className="font-mono font-bold text-brand-navy">{jobNumber}</span>
              </div>
            </div>
          )}

          {/* Itemized Line Items Table */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                Quotation Line Items
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-bold text-brand-orange hover:underline inline-flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-2 bg-brand-light/60 p-2.5 rounded-xl border border-brand-border text-xs">
                  <div className="flex-1">
                    <input
                      placeholder="Item description (e.g. OLED Display, Charging Jack)"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="w-full bg-white border border-brand-border rounded-lg px-2.5 py-1.5 text-xs text-brand-text focus:outline-none"
                    />
                  </div>
                  <div className="w-24">
                    <select
                      value={item.type}
                      onChange={(e) => handleItemChange(idx, 'type', e.target.value)}
                      className="w-full bg-white border border-brand-border rounded-lg px-2 py-1.5 text-xs text-brand-text focus:outline-none"
                    >
                      <option value="part">Part</option>
                      <option value="labour">Labour</option>
                    </select>
                  </div>
                  <div className="w-16">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full bg-white border border-brand-border rounded-lg px-2 py-1.5 text-xs text-brand-text text-center focus:outline-none"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      placeholder="₹ Rate"
                      value={item.unitPriceRupees}
                      onChange={(e) => handleItemChange(idx, 'unitPriceRupees', e.target.value)}
                      className="w-full bg-white border border-brand-border rounded-lg px-2 py-1.5 text-xs text-brand-text text-right font-medium focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    disabled={items.length <= 1}
                    className="p-1.5 text-brand-secondary hover:text-rose-600 disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Discount & Totals */}
          <div className="bg-brand-light p-4 rounded-xl border border-brand-border space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-brand-secondary">Subtotal:</span>
              <span className="font-bold text-brand-navy">{formatPaiseToINR(subtotalPaise)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-brand-secondary">Discount (₹):</span>
              <div className="w-28">
                <input
                  type="number"
                  min="0"
                  value={discountRupees}
                  onChange={(e) => setDiscountRupees(e.target.value)}
                  className="w-full bg-white border border-brand-border rounded px-2 py-1 text-right text-xs"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-brand-border flex justify-between items-center text-sm font-black text-brand-navy">
              <span>Total Quotation:</span>
              <span className="text-brand-orange text-base">{formatPaiseToINR(totalPaise)}</span>
            </div>
          </div>

          <Textarea
            label="Internal Notes / Customer Advice"
            placeholder="e.g. Quoting OLED replacement with 30-day testing warranty..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSaveEstimate('draft')}
              isLoading={saving}
            >
              Save Draft
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => handleSaveEstimate('issued')}
              isLoading={saving}
            >
              Issue & Ready Approval Link
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

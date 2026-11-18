import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FileText,
  PlusCircle,
  Search,
  Printer,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Mic,
  Sparkles,
  Receipt,
  MessageSquare,
} from 'lucide-react';
import {
  getInvoices,
  saveInvoice,
  getRepairJobs,
  getBusinessSettings,
} from '../../services/db';
import { Invoice, InvoiceLineItem, RepairJob, BusinessSettings } from '../../types';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { CounterBillPrint } from '../../components/print/CounterBillPrint';
import { useAuth } from '../../context/AuthContext';
import { useVoice } from '../../context/VoiceContext';
import { SUPPORTED_VOICE_LANGUAGES } from '../../services/speechService';
import { VoiceInputButton } from '../../components/voice/VoiceInputButton';
import { formatPaiseToINR, rupeesToPaise, calculateTotalsPaise } from '../../lib/money';
import { formatDate, formatDateTime, formatPhoneNumber } from '../../lib/utils';
import { generateInvoiceNumber } from '../../lib/reference';

export const InvoicesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { registerInvoiceHandler, openAssistant, activeLanguage } = useVoice();
  const currentVoiceLang = SUPPORTED_VOICE_LANGUAGES.find((l) => l.code === activeLanguage) || SUPPORTED_VOICE_LANGUAGES[0];

  const newForJob = searchParams.get('newForJob') || '';
  const prefillName = searchParams.get('name') || '';
  const prefillPhone = searchParams.get('phone') || '';
  const prefillJobNumber = searchParams.get('jobNumber') || '';
  const prefillCustId = searchParams.get('custId') || '';

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [repairs, setRepairs] = useState<RepairJob[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [billTypeTab, setBillTypeTab] = useState<'all' | 'counter' | 'repair' | 'unpaid'>('all');
  const [createModalOpen, setCreateModalOpen] = useState(Boolean(newForJob));
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);

  // New Invoice State
  const [repairJobId, setRepairJobId] = useState(newForJob);
  const [jobNumber, setJobNumber] = useState(prefillJobNumber);
  const [customerId, setCustomerId] = useState(prefillCustId);
  const [customerName, setCustomerName] = useState(prefillName);
  const [customerPhone, setCustomerPhone] = useState(prefillPhone);
  const [discountRupees, setDiscountRupees] = useState('0');
  const [notes, setNotes] = useState('');

  // Line items
  const [items, setItems] = useState<{ id: string; description: string; type: 'part' | 'labour' | 'accessory' | 'other'; quantity: number; unitPriceRupees: string }[]>([
    { id: '1', description: 'Screen & Touch Display Replacement', type: 'part', quantity: 1, unitPriceRupees: '1600' },
    { id: '2', description: 'Installation & Quality Testing Labour', type: 'labour', quantity: 1, unitPriceRupees: '350' },
  ]);

  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [iList, rList, bSettings] = await Promise.all([
      getInvoices(),
      getRepairJobs(),
      getBusinessSettings(),
    ]);
    setInvoices(iList);
    setRepairs(rList);
    setSettings(bSettings);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Voice AI Billing Registration
  useEffect(() => {
    const unregister = registerInvoiceHandler((data) => {
      setCreateModalOpen(true);
      if (data.customerName) setCustomerName(data.customerName);
      if (data.customerPhone) setCustomerPhone(data.customerPhone);
      if (data.discountRupees) setDiscountRupees(data.discountRupees);
      if (data.notes) setNotes(data.notes);
      if (data.items && data.items.length > 0) {
        setItems(
          data.items.map((it, idx) => ({
            id: String(Date.now() + idx),
            description: it.description,
            type: it.type,
            quantity: it.quantity || 1,
            unitPriceRupees: it.unitPriceRupees || '0',
          }))
        );
      }
    });
    return unregister;
  }, [registerInvoiceHandler]);

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

  const subtotalPaise = items.reduce((acc, item) => {
    const pPaise = rupeesToPaise(item.unitPriceRupees || 0);
    return acc + pPaise * Math.max(1, item.quantity);
  }, 0);

  const discountPaise = rupeesToPaise(discountRupees || 0);
  const { totalPaise } = calculateTotalsPaise(subtotalPaise, discountPaise);

  const handleCreateInvoice = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Customer name and phone are required.');
      return;
    }

    setSaving(true);
    try {
      const lineItems: InvoiceLineItem[] = items.map((item) => {
        const uPrice = rupeesToPaise(item.unitPriceRupees || 0);
        return {
          id: item.id,
          description: item.description.trim() || 'Repair Item',
          type: item.type,
          quantity: item.quantity,
          unitPricePaise: uPrice,
          totalPaise: uPrice * item.quantity,
        };
      });

      const now = new Date().toISOString();
      const newInv: Invoice = {
        id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        invoiceNumber: generateInvoiceNumber(),
        repairJobId: repairJobId || undefined,
        jobNumber: jobNumber || undefined,
        customerId: customerId || 'cust_temp',
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        items: lineItems,
        subtotalPaise,
        discountPaise,
        taxPaise: 0,
        totalPaise,
        amountPaidPaise: 0,
        balanceDuePaise: totalPaise,
        status: 'unpaid',
        issuedAt: now,
        notes: notes.trim() || undefined,
        createdBy: currentUser?.displayName || 'Debasish',
        createdAt: now,
        updatedAt: now,
      };

      await saveInvoice(newInv);
      setCreateModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to create invoice:', err);
      alert('Failed to save invoice.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = invoices.filter((inv) => {
    // Search filter
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      (inv.jobNumber && inv.jobNumber.toLowerCase().includes(search.toLowerCase())) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerPhone.includes(search);
    if (!matchesSearch) return false;

    // Tab filter
    if (billTypeTab === 'counter') {
      return inv.invoiceNumber.startsWith('BILL-') || !inv.repairJobId;
    }
    if (billTypeTab === 'repair') {
      return Boolean(inv.repairJobId) || inv.invoiceNumber.startsWith('INV-');
    }
    if (billTypeTab === 'unpaid') {
      return inv.balanceDuePaise > 0;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-navy tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-brand-orange" />
            Bills & Invoices
          </h1>
          <p className="text-xs text-brand-secondary mt-0.5">
            Manage in-counter retail bills, workshop repair invoices, track outstanding balances, and print receipts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/admin/billing">
            <Button size="sm" variant="glow" leftIcon={<Receipt className="w-3.5 h-3.5" />}>
              New Counter Bill (+)
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Mic className="w-3.5 h-3.5 text-brand-orange" />}
            onClick={() => openAssistant('billing')}
          >
            <span>Voice Bill ({currentVoiceLang.nativeLabel})</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
            onClick={() => setCreateModalOpen(true)}
          >
            Custom Invoice
          </Button>
        </div>
      </div>

      {/* Search & Tab Filters */}
      <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-xs space-y-3">
        <Input
          placeholder="Search by bill number (BILL-...), invoice number (INV-...), job reference, or customer name..."
          enableVoice
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Tab Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => setBillTypeTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              billTypeTab === 'all'
                ? 'bg-brand-navy text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Bills & Invoices ({invoices.length})
          </button>
          <button
            type="button"
            onClick={() => setBillTypeTab('counter')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              billTypeTab === 'counter'
                ? 'bg-brand-orange text-white shadow-glow-orange'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            In-Counter Bills
          </button>
          <button
            type="button"
            onClick={() => setBillTypeTab('repair')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              billTypeTab === 'repair'
                ? 'bg-brand-navy text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Repair Invoices
          </button>
          <button
            type="button"
            onClick={() => setBillTypeTab('unpaid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              billTypeTab === 'unpaid'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Unpaid / Balance Due ({invoices.filter((i) => i.balanceDuePaise > 0).length})
          </button>
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-brand-secondary">
            No invoices generated yet. Click &quot;Generate Invoice&quot; to create a new customer bill.
          </div>
        ) : (
          <div className="divide-y divide-brand-border text-xs">
            {filtered.map((inv) => (
              <div
                key={inv.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-brand-light/40 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-sm text-brand-navy">
                      {inv.invoiceNumber}
                    </span>
                    {inv.jobNumber && (
                      <span className="font-mono text-xs text-brand-secondary bg-brand-light px-2 py-0.5 rounded border border-brand-border">
                        Job: {inv.jobNumber}
                      </span>
                    )}
                    <StatusBadge status={inv.status} size="sm" />
                    <span className="text-[11px] text-brand-secondary">
                      {formatDate(inv.issuedAt)}
                    </span>
                  </div>

                  <div className="font-bold text-sm text-brand-text">
                    {inv.customerName} &bull; <span className="font-normal text-brand-secondary">{formatPhoneNumber(inv.customerPhone)}</span>
                  </div>

                  <div className="flex items-center gap-4 text-brand-secondary text-[11px]">
                    <span>Total: {formatPaiseToINR(inv.totalPaise)}</span>
                    <span>&bull;</span>
                    <span className="text-emerald-700 font-semibold">
                      Paid: {formatPaiseToINR(inv.amountPaidPaise)}
                    </span>
                    {inv.balanceDuePaise > 0 && (
                      <>
                        <span>&bull;</span>
                        <span className="text-rose-600 font-bold">
                          Balance Due: {formatPaiseToINR(inv.balanceDuePaise)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    leftIcon={<Printer className="w-3.5 h-3.5" />}
                    onClick={() => setPrintInvoice(inv)}
                  >
                    Print
                  </Button>

                  {inv.balanceDuePaise > 0 && (
                    <Link
                      to={`/admin/payments?invId=${inv.id}&amount=${inv.balanceDuePaise}&name=${encodeURIComponent(inv.customerName)}`}
                    >
                      <Button size="sm" variant="primary" className="text-xs" leftIcon={<CreditCard className="w-3.5 h-3.5" />}>
                        Record Payment
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate Invoice Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Generate Customer Invoice"
        description="Create itemized charges and register customer payable balance."
        maxWidth="2xl"
      >
        <div className="space-y-4">
          {/* Voice Billing Bar */}
          <div className="p-3 bg-brand-light rounded-xl border border-brand-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-orange" />
              <span className="text-brand-navy font-semibold">
                Voice Fill items and prices (বাংলা / हिन्दी / English):
              </span>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              leftIcon={<Mic className="w-3.5 h-3.5 text-brand-orange" />}
              onClick={() => openAssistant('billing')}
            >
              Voice Fill
            </Button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-navy uppercase tracking-wider mb-1">
              Select Associated Repair Job (Optional)
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
              <option value="">-- Standalone or Select Job --</option>
              {repairs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.jobNumber} - {r.customerName} ({r.brand} {r.model})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Customer Full Name *"
              required
              placeholder="Customer Name"
              enableVoice
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <Input
              label="Customer Phone *"
              required
              placeholder="10-digit mobile"
              enableVoice
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>

          {/* Line items table */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                Billed Items
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
                  <div className="flex-1 flex items-center gap-1.5">
                    <input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="w-full bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs text-brand-text"
                    />
                    <VoiceInputButton
                      size="sm"
                      currentValue={item.description}
                      onTranscript={(translated) => handleItemChange(idx, 'description', translated)}
                    />
                  </div>
                  <div className="w-24">
                    <select
                      value={item.type}
                      onChange={(e) => handleItemChange(idx, 'type', e.target.value)}
                      className="w-full bg-white border border-brand-border rounded px-2 py-1.5 text-xs text-brand-text"
                    >
                      <option value="part">Part</option>
                      <option value="labour">Labour</option>
                      <option value="accessory">Accessory</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="w-16">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full bg-white border border-brand-border rounded px-2 py-1.5 text-xs text-brand-text text-center"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      placeholder="₹ Rate"
                      value={item.unitPriceRupees}
                      onChange={(e) => handleItemChange(idx, 'unitPriceRupees', e.target.value)}
                      className="w-full bg-white border border-brand-border rounded px-2 py-1.5 text-xs text-brand-text text-right font-medium"
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

          {/* Discount & Grand Total */}
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
              <span>Invoice Total:</span>
              <span className="text-brand-orange text-base">{formatPaiseToINR(totalPaise)}</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="primary" onClick={handleCreateInvoice} isLoading={saving}>
              Create Invoice
            </Button>
          </div>
        </div>
      </Modal>

      {/* Print Bill / Invoice Modal */}
      {printInvoice && settings && (
        <Modal
          isOpen={Boolean(printInvoice)}
          onClose={() => setPrintInvoice(null)}
          title="Official Receipt & Tax Invoice"
          description={`Bill No: ${printInvoice.invoiceNumber}`}
          maxWidth="4xl"
        >
          <CounterBillPrint
            invoice={printInvoice}
            settings={settings}
            onClose={() => setPrintInvoice(null)}
          />
        </Modal>
      )}
    </div>
  );
};

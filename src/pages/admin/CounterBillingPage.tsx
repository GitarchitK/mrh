import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Receipt,
  PlusCircle,
  Search,
  Printer,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Mic,
  Sparkles,
  Phone,
  User,
  ShoppingBag,
  Wrench,
  Percent,
  Share2,
  RefreshCw,
  QrCode,
  Tag,
  PackageCheck,
  Zap,
  ArrowRight,
  ShieldCheck,
  Clock,
  History,
} from 'lucide-react';
import {
  getInvoices,
  saveInvoice,
  getRepairJobs,
  getCustomers,
  getBusinessSettings,
  getInventoryProducts,
  recordPayment,
} from '../../services/db';
import {
  Invoice,
  InvoiceLineItem,
  RepairJob,
  Customer,
  BusinessSettings,
  InventoryProduct,
  PaymentMethod,
} from '../../types';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { CounterBillPrint } from '../../components/print/CounterBillPrint';
import { useAuth } from '../../context/AuthContext';
import { useVoice } from '../../context/VoiceContext';
import { SUPPORTED_VOICE_LANGUAGES } from '../../services/speechService';
import { formatPaiseToINR, rupeesToPaise, calculateTotalsPaise } from '../../lib/money';
import { formatDate, formatDateTime, formatPhoneNumber } from '../../lib/utils';
import { generateBillNumber, generatePaymentReference } from '../../lib/reference';
import { STORE_PRODUCTS } from '../../services/storeData';

// Common Quick Counter Presets
const QUICK_CATALOG_ITEMS = [
  { name: '11D Tempered Glass', type: 'accessory' as const, price: 150, category: 'Protection' },
  { name: 'UV Curved Screen Guard', type: 'accessory' as const, price: 350, category: 'Protection' },
  { name: 'Privacy Screen Protector', type: 'accessory' as const, price: 250, category: 'Protection' },
  { name: '65W Fast Charger Adapter', type: 'accessory' as const, price: 650, category: 'Chargers' },
  { name: '33W Fast Charger Adapter', type: 'accessory' as const, price: 450, category: 'Chargers' },
  { name: '6A Type-C Fast Cable', type: 'accessory' as const, price: 150, category: 'Cables' },
  { name: 'Apple Lightning Cable', type: 'accessory' as const, price: 250, category: 'Cables' },
  { name: 'Silicone Matte Back Cover', type: 'accessory' as const, price: 180, category: 'Covers' },
  { name: 'Camera Lens Protector', type: 'accessory' as const, price: 100, category: 'Protection' },
  { name: 'Screen Guard Pasting Service', type: 'labour' as const, price: 50, category: 'Service' },
  { name: 'Charging Port Dust Cleaning', type: 'labour' as const, price: 100, category: 'Service' },
  { name: 'Speaker & Mic Cleaning', type: 'labour' as const, price: 100, category: 'Service' },
  { name: 'Software Reset & Setup', type: 'labour' as const, price: 300, category: 'Software' },
  { name: 'Battery Replacement Labour', type: 'labour' as const, price: 250, category: 'Service' },
  { name: 'General Diagnostic Charge', type: 'labour' as const, price: 150, category: 'Service' },
];

export const CounterBillingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { registerInvoiceHandler, openAssistant, activeLanguage } = useVoice();
  const currentVoiceLang = SUPPORTED_VOICE_LANGUAGES.find((l) => l.code === activeLanguage) || SUPPORTED_VOICE_LANGUAGES[0];

  const prefillJobId = searchParams.get('jobId') || '';
  const prefillName = searchParams.get('name') || '';
  const prefillPhone = searchParams.get('phone') || '';
  const prefillJobNumber = searchParams.get('jobNumber') || '';
  const prefillCustId = searchParams.get('custId') || '';

  // Data Sources
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [repairs, setRepairs] = useState<RepairJob[]>([]);
  const [inventory, setInventory] = useState<InventoryProduct[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [billNumber, setBillNumber] = useState('');
  const [customerPhone, setCustomerPhone] = useState(prefillPhone);
  const [customerName, setCustomerName] = useState(prefillName);
  const [customerId, setCustomerId] = useState(prefillCustId);
  const [selectedJobId, setSelectedJobId] = useState(prefillJobId);
  const [selectedJobNumber, setSelectedJobNumber] = useState(prefillJobNumber);
  const [notes, setNotes] = useState('');

  // Items State
  const [items, setItems] = useState<
    { id: string; description: string; type: 'part' | 'labour' | 'accessory' | 'other'; quantity: number; unitPriceRupees: string }[]
  >([
    { id: '1', description: '11D Tempered Glass Installation', type: 'accessory', quantity: 1, unitPriceRupees: '150' },
  ]);

  // Payment State
  const [discountRupees, setDiscountRupees] = useState('0');
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card' | 'split' | 'pending'>('cash');
  const [amountPaidRupees, setAmountPaidRupees] = useState('');
  const [paymentRef, setPaymentRef] = useState('');

  // UI state
  const [inventorySearch, setInventorySearch] = useState('');
  const [phoneSearchMatches, setPhoneSearchMatches] = useState<Customer[]>([]);
  const [saving, setSaving] = useState(false);
  const [printModalInvoice, setPrintModalInvoice] = useState<Invoice | null>(null);
  const [showRecentDrawer, setShowRecentDrawer] = useState(false);

  // Load initial data
  const loadData = async () => {
    setLoading(true);
    try {
      const [invList, custList, repList, invProdList, bSettings] = await Promise.all([
        getInvoices(),
        getCustomers(),
        getRepairJobs(),
        getInventoryProducts(),
        getBusinessSettings(),
      ]);
      setInvoices(invList);
      setCustomers(custList);
      setRepairs(repList);
      setInventory(invProdList);
      setSettings(bSettings);

      // Generate unique bill number checking against existing bills
      setBillNumber(generateBillNumber(invList));
    } catch (err) {
      console.error('Error loading counter billing data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Voice AI Billing Assistant Listener
  useEffect(() => {
    const unregister = registerInvoiceHandler((data) => {
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

  // Customer Phone Lookup
  useEffect(() => {
    const clean = customerPhone.trim().replace(/\D/g, '');
    if (clean.length >= 3) {
      const matches = customers.filter(
        (c) => c.phone.replace(/\D/g, '').includes(clean) || c.fullName.toLowerCase().includes(customerPhone.toLowerCase())
      );
      setPhoneSearchMatches(matches.slice(0, 4));
    } else {
      setPhoneSearchMatches([]);
    }
  }, [customerPhone, customers]);

  const selectExistingCustomer = (c: Customer) => {
    setCustomerId(c.id);
    setCustomerName(c.fullName);
    setCustomerPhone(c.phone);
    setPhoneSearchMatches([]);
  };

  // Regeneration of bill number
  const handleRegenerateBillNumber = () => {
    setBillNumber(generateBillNumber(invoices));
  };

  // Item modifications
  const handleAddItem = (
    description = '',
    type: 'part' | 'labour' | 'accessory' | 'other' = 'accessory',
    price = '0'
  ) => {
    setItems((prev) => [
      ...prev,
      {
        id: String(Date.now() + Math.random()),
        description,
        type,
        quantity: 1,
        unitPriceRupees: price,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Financial calculations
  const subtotalPaise = useMemo(() => {
    return items.reduce((acc, item) => {
      const pPaise = rupeesToPaise(item.unitPriceRupees || 0);
      return acc + pPaise * Math.max(1, item.quantity);
    }, 0);
  }, [items]);

  const discountPaise = useMemo(() => {
    return rupeesToPaise(discountRupees || 0);
  }, [discountRupees]);

  const totals = useMemo(() => {
    return calculateTotalsPaise(subtotalPaise, discountPaise, taxEnabled ? 18 : 0, taxEnabled);
  }, [subtotalPaise, discountPaise, taxEnabled]);

  // Sync default amount paid when totals or payment method change
  useEffect(() => {
    if (paymentMethod === 'pending') {
      setAmountPaidRupees('0');
    } else if (paymentMethod === 'cash' || paymentMethod === 'upi' || paymentMethod === 'card') {
      setAmountPaidRupees(String(totals.totalPaise / 100));
    }
  }, [totals.totalPaise, paymentMethod]);

  const actualAmountPaidPaise = useMemo(() => {
    const parsed = rupeesToPaise(amountPaidRupees || 0);
    return Math.min(totals.totalPaise, Math.max(0, parsed));
  }, [amountPaidRupees, totals.totalPaise]);

  const balanceDuePaise = Math.max(0, totals.totalPaise - actualAmountPaidPaise);

  // Link repair job selection
  const handleSelectJob = (jobId: string) => {
    setSelectedJobId(jobId);
    const found = repairs.find((r) => r.id === jobId);
    if (found) {
      setSelectedJobNumber(found.jobNumber);
      if (!customerName) setCustomerName(found.customerName);
      if (!customerPhone) setCustomerPhone(found.customerPhone);
      if (found.customerId) setCustomerId(found.customerId);
    }
  };

  // Submit / Save Bill
  const handleGenerateBill = async (autoPrint = true) => {
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Please enter both customer name and phone number.');
      return;
    }

    if (items.some((it) => !it.description.trim())) {
      alert('All bill line items must have a valid description.');
      return;
    }

    setSaving(true);
    try {
      const lineItems: InvoiceLineItem[] = items.map((item) => {
        const uPrice = rupeesToPaise(item.unitPriceRupees || 0);
        return {
          id: item.id,
          description: item.description.trim(),
          type: item.type,
          quantity: Math.max(1, item.quantity),
          unitPricePaise: uPrice,
          totalPaise: uPrice * Math.max(1, item.quantity),
        };
      });

      const now = new Date().toISOString();
      const uniqueBillNo = billNumber || generateBillNumber(invoices);

      const status = balanceDuePaise <= 0 ? 'paid' : actualAmountPaidPaise > 0 ? 'partial' : 'unpaid';

      const newBill: Invoice = {
        id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        invoiceNumber: uniqueBillNo,
        billType: 'counter_bill',
        paymentMethod,
        repairJobId: selectedJobId || undefined,
        jobNumber: selectedJobNumber || undefined,
        customerId: customerId || 'cust_walkin',
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        items: lineItems,
        subtotalPaise: totals.subtotalPaise,
        discountPaise: totals.discountPaise,
        taxPaise: totals.taxPaise,
        totalPaise: totals.totalPaise,
        amountPaidPaise: actualAmountPaidPaise,
        balanceDuePaise,
        status,
        issuedAt: now,
        notes: notes.trim() || undefined,
        createdBy: currentUser?.displayName || 'Debasish',
        createdAt: now,
        updatedAt: now,
      };

      await saveInvoice(newBill);

      // Record payment into ledger if amount was paid
      if (actualAmountPaidPaise > 0) {
        const pMethod: PaymentMethod =
          paymentMethod === 'upi' ? 'upi' : paymentMethod === 'card' ? 'other' : 'cash';
        await recordPayment({
          id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          paymentReference: generatePaymentReference(),
          invoiceId: newBill.id,
          repairJobId: selectedJobId || undefined,
          customerId: customerId || 'cust_walkin',
          customerName: customerName.trim(),
          amountPaise: actualAmountPaidPaise,
          method: pMethod,
          externalReference: paymentRef.trim() || undefined,
          notes: `Counter sale payment (${uniqueBillNo})`,
          recordedBy: currentUser?.displayName || 'Debasish',
          recordedAt: now,
        });
      }

      // Update state
      setInvoices((prev) => [newBill, ...prev]);

      if (autoPrint) {
        setPrintModalInvoice(newBill);
      } else {
        alert(`Bill ${uniqueBillNo} saved successfully!`);
        resetForm();
      }
    } catch (err) {
      console.error('Failed to create counter bill:', err);
      alert('Error generating counter bill. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setBillNumber(generateBillNumber(invoices));
    setCustomerName('');
    setCustomerPhone('');
    setCustomerId('');
    setSelectedJobId('');
    setSelectedJobNumber('');
    setNotes('');
    setDiscountRupees('0');
    setTaxEnabled(false);
    setPaymentMethod('cash');
    setPaymentRef('');
    setItems([
      { id: '1', description: '11D Tempered Glass Installation', type: 'accessory', quantity: 1, unitPriceRupees: '150' },
    ]);
  };

  // Filtered inventory products for quick search
  const filteredInventory = useMemo(() => {
    if (!inventorySearch.trim()) return [];
    const q = inventorySearch.toLowerCase();
    return inventory
      .filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      .slice(0, 5);
  }, [inventory, inventorySearch]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-orange animate-ping" />
            <h1 className="text-2xl font-black text-brand-navy tracking-tight flex items-center gap-2">
              <Receipt className="w-6 h-6 text-brand-orange" />
              In-Counter Billing (POS)
            </h1>
          </div>
          <p className="text-xs text-brand-secondary mt-0.5">
            Instant retail accessory billing, quick counter repair jobs, unique bill numbers & modern branded receipts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Mic className="w-3.5 h-3.5 text-brand-orange" />}
            onClick={() => openAssistant('billing')}
          >
            <span>Voice Fill ({currentVoiceLang.nativeLabel})</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            leftIcon={<History className="w-3.5 h-3.5" />}
            onClick={() => setShowRecentDrawer(true)}
          >
            Recent Bills
          </Button>

          <Button size="sm" variant="outline" onClick={resetForm}>
            Clear Form
          </Button>
        </div>
      </div>

      {/* Main Billing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Bill Inputs & Line Items (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Customer & Job Info Card */}
          <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h2 className="text-sm font-bold text-brand-navy flex items-center gap-2">
                <User className="w-4 h-4 text-brand-orange" />
                Customer & Reference
              </h2>
              <span className="text-[10px] text-brand-secondary font-medium">
                Auto-lookup by phone or name
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone with Auto Lookup */}
              <div className="relative">
                <Input
                  label="Customer Phone *"
                  placeholder="e.g. 9830012345"
                  required
                  enableVoice
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
                {/* Auto Lookup Dropdown */}
                {phoneSearchMatches.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-brand-border rounded-xl shadow-xl z-20 p-1.5 space-y-1">
                    <div className="text-[10px] font-bold text-brand-secondary px-2 py-0.5">
                      Existing Customers Matched:
                    </div>
                    {phoneSearchMatches.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => selectExistingCustomer(c)}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-brand-light flex items-center justify-between text-xs transition-colors"
                      >
                        <span className="font-bold text-brand-navy">{c.fullName}</span>
                        <span className="font-mono text-brand-secondary text-[11px]">{c.phone}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Customer Name */}
              <Input
                label="Customer Name *"
                placeholder="e.g. Rahul Sharma"
                required
                enableVoice
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            {/* Optional Repair Job Association */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">
                  Link to Active Repair Job (Optional)
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => handleSelectJob(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-brand-border bg-white text-xs text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                >
                  <option value="">-- Walk-in Counter Sale (No Job) --</option>
                  {repairs.slice(0, 20).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.jobNumber} &bull; {r.brand} {r.model} ({r.customerName})
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Internal Bill Note (Optional)"
                placeholder="e.g. Walk-in customer, discount approved by Debasish"
                enableVoice
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Quick-Add Catalog Pills */}
          <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-brand-navy flex items-center gap-2">
                <Zap className="w-4 h-4 text-brand-orange" />
                Quick-Add Counter Presets (1-Click)
              </h2>
              <span className="text-[10px] text-brand-secondary">Click to append to bill</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {QUICK_CATALOG_ITEMS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleAddItem(item.name, item.type, String(item.price))}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-brand-orange/10 text-slate-700 hover:text-brand-orange border border-slate-200 hover:border-brand-orange/40 text-xs font-semibold transition-all active:scale-95 shadow-2xs group"
                >
                  <span>{item.name}</span>
                  <span className="font-mono text-brand-orange font-bold text-[11px] group-hover:scale-105 transition-transform">
                    ₹{item.price}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Inventory Search & Quick Add */}
          <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-brand-navy flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-brand-orange" />
                Add from Shop Inventory
              </h2>
              <span className="text-[10px] text-brand-secondary">Real-time stock & prices</span>
            </div>

            <div className="relative">
              <Input
                placeholder="Search inventory by accessory name, part SKU, or model..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
              />
              {filteredInventory.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-brand-border rounded-xl shadow-xl z-20 p-1.5 space-y-1">
                  {filteredInventory.map((prod) => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => {
                        const isPart =
                          prod.category === 'displays' ||
                          prod.category === 'batteries' ||
                          prod.category === 'charging_ports' ||
                          prod.category === 'back_glass' ||
                          prod.category === 'cameras';
                        handleAddItem(prod.name, isPart ? 'part' : 'accessory', String(prod.sellingPricePaise / 100));
                        setInventorySearch('');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-brand-light flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <div className="font-bold text-brand-navy">{prod.name}</div>
                        <div className="text-[10px] text-brand-secondary font-mono">
                          SKU: {prod.sku} &bull; In Stock: {prod.quantityAvailable}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-brand-orange text-xs">
                        {formatPaiseToINR(prod.sellingPricePaise)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Itemized Line Items Table */}
          <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div>
                <h2 className="text-sm font-bold text-brand-navy flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-brand-orange" />
                  Bill Line Items ({items.length})
                </h2>
              </div>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
                onClick={() => handleAddItem()}
              >
                Add Custom Row
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => {
                const rowTotalRupees = (
                  (parseFloat(item.unitPriceRupees || '0') || 0) * Math.max(1, item.quantity)
                ).toFixed(2);

                return (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50/70 rounded-2xl border border-slate-200 grid grid-cols-12 gap-3 items-center"
                  >
                    {/* Item Description (5 Cols) */}
                    <div className="col-span-12 sm:col-span-5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Item #{index + 1} Description
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 11D Tempered Glass"
                        value={item.description}
                        onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-brand-navy font-semibold focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                      />
                    </div>

                    {/* Category Type (2 Cols) */}
                    <div className="col-span-4 sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Category
                      </label>
                      <select
                        value={item.type}
                        onChange={(e) => handleUpdateItem(index, 'type', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 capitalize focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                      >
                        <option value="accessory">Accessory</option>
                        <option value="part">Part</option>
                        <option value="labour">Labour</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Qty (2 Cols) */}
                    <div className="col-span-3 sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Qty
                      </label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => handleUpdateItem(index, 'quantity', Math.max(1, item.quantity - 1))}
                          className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 rounded-l-lg text-slate-600 hover:bg-slate-100 font-bold text-xs"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-10 h-7 text-center border-y border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateItem(index, 'quantity', item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 rounded-r-lg text-slate-600 hover:bg-slate-100 font-bold text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Unit Price (2 Cols) */}
                    <div className="col-span-3 sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Rate (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={item.unitPriceRupees}
                        onChange={(e) => handleUpdateItem(index, 'unitPriceRupees', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-800 text-right focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                      />
                    </div>

                    {/* Total & Delete (1 Col) */}
                    <div className="col-span-2 sm:col-span-1 flex items-center justify-end gap-1.5 pt-4">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Bill Meta, Payment & Totals (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Unique Bill Number & Branding Card */}
          <div className="bg-gradient-to-br from-brand-navy via-brand-navy-dark to-slate-950 text-white p-5 rounded-3xl shadow-xl border border-brand-navy-light/40 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <img
                  src="/images/logo-transparent.webp"
                  alt="Logo"
                  className="w-8 h-8 object-contain bg-white/10 rounded-xl p-0.5 border border-white/15"
                />
                <div>
                  <div className="text-[10px] text-brand-orange font-bold uppercase tracking-wider">
                    Counter POS Terminal
                  </div>
                  <div className="text-xs font-bold text-white">Rajib da Mobile Repairing</div>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            {/* Unique Bill Number Display */}
            <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-[10px] text-white/60 font-semibold uppercase tracking-wider">
                <span>Unique Bill Number</span>
                <button
                  type="button"
                  onClick={handleRegenerateBillNumber}
                  className="text-brand-orange-light hover:text-white flex items-center gap-1 text-[10px]"
                  title="Generate new unique bill number"
                >
                  <RefreshCw className="w-3 h-3" />
                  Regenerate
                </button>
              </div>
              <div className="text-xl font-mono font-black text-white tracking-wide flex items-center justify-between">
                <span>{billNumber}</span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase">
                  Verified Unique
                </span>
              </div>
              <div className="text-[10px] text-white/50 pt-0.5">
                Cashier: <span className="text-white/80 font-medium">{currentUser?.displayName || 'Debasish'}</span>
              </div>
            </div>
          </div>

          {/* Payment & Calculations Card */}
          <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-brand-navy flex items-center gap-2 border-b border-brand-border pb-3">
              <CreditCard className="w-4 h-4 text-brand-orange" />
              Payment & Settlement
            </h2>

            {/* Discount & Tax Options */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-brand-text block mb-1">
                  Counter Discount (₹)
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={discountRupees}
                    onChange={(e) => setDiscountRupees(e.target.value)}
                  />
                  {/* Preset quick discount buttons */}
                  <button
                    type="button"
                    onClick={() => setDiscountRupees('50')}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-brand-orange hover:text-white text-xs font-bold text-slate-700 transition-colors"
                  >
                    ₹50
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountRupees('100')}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-brand-orange hover:text-white text-xs font-bold text-slate-700 transition-colors"
                  >
                    ₹100
                  </button>
                </div>
              </div>

              {/* Tax Toggle */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">Add 18% GST</span>
                <input
                  type="checkbox"
                  checked={taxEnabled}
                  onChange={(e) => setTaxEnabled(e.target.checked)}
                  className="w-4 h-4 text-brand-orange rounded focus:ring-brand-orange"
                />
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-bold text-slate-900">{formatPaiseToINR(totals.subtotalPaise)}</span>
              </div>
              {totals.discountPaise > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount:</span>
                  <span className="font-mono">-{formatPaiseToINR(totals.discountPaise)}</span>
                </div>
              )}
              {totals.taxPaise > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>GST (18%):</span>
                  <span className="font-mono">{formatPaiseToINR(totals.taxPaise)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-brand-navy border-t border-slate-200 pt-2">
                <span>Total Amount:</span>
                <span className="font-mono text-brand-orange">{formatPaiseToINR(totals.totalPaise)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-brand-text block">
                Payment Mode
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'cash'
                      ? 'bg-brand-navy text-white border-brand-navy shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>💵 Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'upi'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>📱 UPI QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-brand-navy text-white border-brand-navy shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>💳 Card POS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('pending')}
                  className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'pending'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>⏳ Unpaid / Credit</span>
                </button>
              </div>
            </div>

            {/* Amount Paid & Balance Due */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Amount Paid (₹)"
                type="number"
                min="0"
                value={amountPaidRupees}
                onChange={(e) => setAmountPaidRupees(e.target.value)}
              />
              <div>
                <label className="text-xs font-semibold text-brand-text block mb-1">
                  Balance Due
                </label>
                <div
                  className={`px-3 py-2 rounded-xl border font-mono font-bold text-xs flex items-center justify-between ${
                    balanceDuePaise > 0
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  <span>{formatPaiseToINR(balanceDuePaise)}</span>
                  {balanceDuePaise === 0 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <Button
                variant="glow"
                size="lg"
                className="w-full font-bold shadow-md"
                leftIcon={<Printer className="w-4 h-4" />}
                isLoading={saving}
                onClick={() => handleGenerateBill(true)}
              >
                Generate & Print Bill
              </Button>

              <Button
                variant="outline"
                size="md"
                className="w-full text-xs"
                isLoading={saving}
                onClick={() => handleGenerateBill(false)}
              >
                Save Bill without Printing
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bill Print Modal */}
      {printModalInvoice && settings && (
        <Modal
          isOpen={Boolean(printModalInvoice)}
          onClose={() => {
            setPrintModalInvoice(null);
            resetForm();
          }}
          title="Official Counter Bill Receipt"
          description={`Bill No: ${printModalInvoice.invoiceNumber}`}
          maxWidth="4xl"
        >
          <CounterBillPrint
            invoice={printModalInvoice}
            settings={settings}
            onClose={() => {
              setPrintModalInvoice(null);
              resetForm();
            }}
          />
        </Modal>
      )}

      {/* Recent Bills Modal / Drawer */}
      <Modal
        isOpen={showRecentDrawer}
        onClose={() => setShowRecentDrawer(false)}
        title="Recently Issued Counter Bills"
        description="View, reprint, or share previously generated customer bills"
        maxWidth="4xl"
      >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {invoices.length === 0 ? (
            <div className="p-8 text-center text-xs text-brand-secondary">
              No bills recorded yet. Generate your first counter bill above.
            </div>
          ) : (
            invoices.slice(0, 15).map((inv) => (
              <div
                key={inv.id}
                className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-white transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-brand-navy">{inv.invoiceNumber}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        inv.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inv.status === 'partial'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {inv.status}
                    </span>
                    <span className="text-[10px] text-brand-secondary">{formatDate(inv.issuedAt)}</span>
                  </div>
                  <div className="font-bold text-slate-800 mt-1">
                    {inv.customerName} &bull; <span className="font-normal text-slate-600">{formatPhoneNumber(inv.customerPhone)}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                    Total: <span className="font-bold text-slate-900">{formatPaiseToINR(inv.totalPaise)}</span> &bull; Paid:{' '}
                    <span className="text-emerald-700 font-bold">{formatPaiseToINR(inv.amountPaidPaise)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="primary"
                    leftIcon={<Printer className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setShowRecentDrawer(false);
                      setPrintModalInvoice(inv);
                    }}
                  >
                    View & Print
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};

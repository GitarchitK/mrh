import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt,
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
  Barcode,
  Layers,
  PauseCircle,
  PlayCircle,
  Plus,
  Minus,
  Check,
  DollarSign,
  Smartphone,
  ChevronDown,
  Volume2,
  X,
  FileSpreadsheet,
  RotateCcw,
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
import { cn, formatDate, formatDateTime, formatPhoneNumber } from '../../lib/utils';
import { generateBillNumber, generatePaymentReference } from '../../lib/reference';

interface POSCartItem {
  id: string;
  productId?: string;
  description: string;
  type: 'accessory' | 'part' | 'labour' | 'other';
  quantity: number;
  unitPricePaise: number;
  totalPaise: number;
}

interface ParkedCart {
  id: string;
  customerName: string;
  customerPhone: string;
  items: POSCartItem[];
  discountRupees: string;
  notes: string;
  createdAt: string;
}

export const CounterBillingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { registerInvoiceHandler, openAssistant, activeLanguage } = useVoice();
  const currentVoiceLang =
    SUPPORTED_VOICE_LANGUAGES.find((l) => l.code === activeLanguage) || SUPPORTED_VOICE_LANGUAGES[0];

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // URL Prefill params
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

  // POS State
  const [billNumber, setBillNumber] = useState('');
  const [customerName, setCustomerName] = useState(prefillName || '');
  const [customerPhone, setCustomerPhone] = useState(prefillPhone || '');
  const [customerId, setCustomerId] = useState(prefillCustId || '');
  const [selectedJobId, setSelectedJobId] = useState(prefillJobId);
  const [selectedJobNumber, setSelectedJobNumber] = useState(prefillJobNumber);
  const [notes, setNotes] = useState('');

  // Cart & Line Items
  const [cart, setCart] = useState<POSCartItem[]>([]);

  // Parked / Held Carts
  const [parkedCarts, setParkedCarts] = useState<ParkedCart[]>([]);
  const [showParkedModal, setShowParkedModal] = useState(false);

  // Filtering & Catalog
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [phoneSearchMatches, setPhoneSearchMatches] = useState<Customer[]>([]);

  // Settlement & Payment
  const [discountRupees, setDiscountRupees] = useState('0');
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card' | 'pending'>('cash');
  const [cashTenderedRupees, setCashTenderedRupees] = useState('');
  const [paymentRef, setPaymentRef] = useState('');

  // Modals & UI
  const [mobileTab, setMobileTab] = useState<'catalog' | 'ticket'>('catalog');
  const [saving, setSaving] = useState(false);
  const [printModalInvoice, setPrintModalInvoice] = useState<Invoice | null>(null);
  const [showRegisterSummary, setShowRegisterSummary] = useState(false);
  const [showCustomItemModal, setShowCustomItemModal] = useState(false);
  const [customItemDesc, setCustomItemDesc] = useState('');
  const [customItemType, setCustomItemType] = useState<'accessory' | 'part' | 'labour' | 'other'>('accessory');
  const [customItemPrice, setCustomItemPrice] = useState('');

  // Load Data
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

      setBillNumber(generateBillNumber(invList));
    } catch (err) {
      console.error('Error initializing POS data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Voice AI Assistant Integration
  useEffect(() => {
    const unregister = registerInvoiceHandler((data) => {
      if (data.customerName) setCustomerName(data.customerName);
      if (data.customerPhone) setCustomerPhone(data.customerPhone);
      if (data.discountRupees) setDiscountRupees(data.discountRupees);
      if (data.notes) setNotes(data.notes);
      if (data.items && data.items.length > 0) {
        setCart(
          data.items.map((it, idx) => {
            const uPrice = rupeesToPaise(it.unitPriceRupees || '0');
            const qty = it.quantity || 1;
            return {
              id: `voice-${Date.now()}-${idx}`,
              description: it.description,
              type: it.type || 'accessory',
              quantity: qty,
              unitPricePaise: uPrice,
              totalPaise: uPrice * qty,
            };
          })
        );
      }
    });
    return unregister;
  }, [registerInvoiceHandler]);

  // Customer Phone Auto-Lookup
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

  // Category metadata for POS display
  const CATEGORY_META: Record<string, { label: string; icon: string }> = {
    all: { label: 'All Items', icon: '📦' },
    displays: { label: 'Displays & Touch', icon: '📱' },
    batteries: { label: 'Batteries', icon: '🔋' },
    charging_ports: { label: 'Charging Ports', icon: '⚡' },
    cables: { label: 'Cables & Chargers', icon: '🧵' },
    earphones: { label: 'Audio & Earphones', icon: '🎧' },
    power_banks: { label: 'Power Banks', icon: '🔋' },
    back_glass: { label: 'Back Glass', icon: '🛡️' },
    cameras: { label: 'Cameras', icon: '📷' },
    protection: { label: 'Tempered & Covers', icon: '🛡️' },
    other: { label: 'Other Items', icon: '📦' },
  };

  // Unified Product Catalog for POS - Only real products from inventory
  const allPOSProducts = useMemo(() => {
    return inventory.map((inv) => ({
      id: inv.id,
      name: inv.name,
      category: inv.category,
      pricePaise: inv.sellingPricePaise,
      type: (
        inv.category === 'displays' ||
        inv.category === 'batteries' ||
        inv.category === 'charging_ports' ||
        inv.category === 'back_glass' ||
        inv.category === 'cameras'
          ? 'part'
          : 'accessory'
      ) as 'accessory' | 'part' | 'labour' | 'other',
      badge: `In Stock: ${inv.quantityAvailable}`,
      stock: inv.quantityAvailable,
      sku: inv.sku,
      brand: inv.brand,
      serialNumber: inv.serialNumber,
    }));
  }, [inventory]);

  // Dynamically compute categories that actually exist in available inventory
  const categories = useMemo(() => {
    const presentCats = new Set<string>();
    allPOSProducts.forEach((p) => {
      if (p.category) presentCats.add(p.category);
    });
    return ['all', ...Array.from(presentCats)];
  }, [allPOSProducts]);

  // Filtered Catalog by Category & Search
  const filteredCatalog = useMemo(() => {
    return allPOSProducts.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesSku = item.sku?.toLowerCase().includes(q);
        const matchesBrand = item.brand?.toLowerCase().includes(q);
        const matchesSerial = item.serialNumber?.toLowerCase().includes(q);
        if (!matchesName && !matchesSku && !matchesBrand && !matchesSerial) return false;
      }

      return true;
    });
  }, [allPOSProducts, selectedCategory, searchQuery]);

  // Add Item to POS Cart
  const addToCart = (product: {
    id: string;
    name: string;
    pricePaise: number;
    type: 'accessory' | 'part' | 'labour' | 'other';
  }) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.description === product.name);
      if (existingIndex >= 0) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + 1;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          totalPaise: updated[existingIndex].unitPricePaise * newQty,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            productId: product.id,
            description: product.name,
            type: product.type,
            quantity: 1,
            unitPricePaise: product.pricePaise,
            totalPaise: product.pricePaise,
          },
        ];
      }
    });
  };

  // Adjust Quantity
  const updateQuantity = (index: number, delta: number) => {
    setCart((prev) => {
      const copy = [...prev];
      const newQty = copy[index].quantity + delta;
      if (newQty <= 0) {
        return copy.filter((_, i) => i !== index);
      }
      copy[index] = {
        ...copy[index],
        quantity: newQty,
        totalPaise: copy[index].unitPricePaise * newQty,
      };
      return copy;
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountRupees('0');
    setCashTenderedRupees('');
    setPaymentRef('');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerId('');
    setSelectedJobId('');
    setSelectedJobNumber('');
    setNotes('');
    setBillNumber(generateBillNumber(invoices));
  };

  // Handle Barcode Scan / Fast SKU Input
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const term = barcodeInput.trim().toLowerCase();
    const matched = allPOSProducts.find(
      (p) =>
        p.sku?.toLowerCase() === term ||
        p.serialNumber?.toLowerCase() === term ||
        p.name.toLowerCase().includes(term)
    );

    if (matched) {
      addToCart(matched);
      setBarcodeInput('');
    } else {
      alert(`No product found matching barcode/SKU: ${barcodeInput}`);
    }
  };

  // Hold / Park Cart
  const handleParkCart = () => {
    if (cart.length === 0) {
      alert('Cart is empty. Add items before holding.');
      return;
    }

    const newParked: ParkedCart = {
      id: `parked-${Date.now()}`,
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim(),
      items: cart,
      discountRupees,
      notes,
      createdAt: new Date().toISOString(),
    };

    setParkedCarts((prev) => [newParked, ...prev]);
    clearCart();
  };

  const handleResumeCart = (parked: ParkedCart) => {
    setCart(parked.items);
    setCustomerName(parked.customerName);
    setCustomerPhone(parked.customerPhone);
    setDiscountRupees(parked.discountRupees);
    setNotes(parked.notes);
    setParkedCarts((prev) => prev.filter((p) => p.id !== parked.id));
    setShowParkedModal(false);
  };

  // Totals & Math
  const cartItemCount = useMemo(() => {
    return cart.reduce((acc, it) => acc + it.quantity, 0);
  }, [cart]);

  const subtotalPaise = useMemo(() => {
    return cart.reduce((acc, it) => acc + it.totalPaise, 0);
  }, [cart]);

  const discountPaise = useMemo(() => {
    return rupeesToPaise(discountRupees || 0);
  }, [discountRupees]);

  const totals = useMemo(() => {
    return calculateTotalsPaise(subtotalPaise, discountPaise, taxEnabled ? 18 : 0, taxEnabled);
  }, [subtotalPaise, discountPaise, taxEnabled]);

  // Cash change calculator
  const cashTenderedPaise = useMemo(() => {
    if (!cashTenderedRupees) return totals.totalPaise;
    return rupeesToPaise(cashTenderedRupees);
  }, [cashTenderedRupees, totals.totalPaise]);

  const cashChangeToReturnPaise = useMemo(() => {
    if (paymentMethod !== 'cash') return 0;
    return Math.max(0, cashTenderedPaise - totals.totalPaise);
  }, [cashTenderedPaise, totals.totalPaise, paymentMethod]);

  const actualAmountPaidPaise = useMemo(() => {
    if (paymentMethod === 'pending') return 0;
    return totals.totalPaise;
  }, [paymentMethod, totals.totalPaise]);

  const balanceDuePaise = Math.max(0, totals.totalPaise - actualAmountPaidPaise);

  // Dynamic UPI URL & QR
  const upiPayee = settings?.phone
    ? `${settings.phone.replace(/\D/g, '')}@upi`
    : '9732789938@upi';
  const totalRupeesStr = (totals.totalPaise / 100).toFixed(2);
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
    `upi://pay?pa=${upiPayee}&pn=Mobile%20Repairing%20House&am=${totalRupeesStr}&cu=INR&tn=POS%20${billNumber}`
  )}`;

  // Checkout / Complete Transaction
  const handleCheckout = async (openPrint = true) => {
    if (cart.length === 0) {
      alert('Cannot checkout an empty cart. Add products or services first.');
      return;
    }

    setSaving(true);
    try {
      const lineItems: InvoiceLineItem[] = cart.map((c) => ({
        id: c.id,
        productId: c.productId,
        description: c.description,
        type: c.type,
        quantity: c.quantity,
        unitPricePaise: c.unitPricePaise,
        totalPaise: c.totalPaise,
      }));

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
        customerName: customerName.trim() || 'Walk-in Customer',
        customerPhone: customerPhone.trim() || '',
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
        createdBy: currentUser?.displayName || 'Debasish (POS)',
        createdAt: now,
        updatedAt: now,
      };

      await saveInvoice(newBill);

      // Record payment into payment ledger if paid
      if (actualAmountPaidPaise > 0) {
        const pMethod: PaymentMethod =
          paymentMethod === 'upi' ? 'upi' : paymentMethod === 'card' ? 'other' : 'cash';
        await recordPayment({
          id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          paymentReference: generatePaymentReference(),
          invoiceId: newBill.id,
          repairJobId: selectedJobId || undefined,
          customerId: customerId || 'cust_walkin',
          customerName: customerName.trim() || 'Walk-in Customer',
          amountPaise: actualAmountPaidPaise,
          method: pMethod,
          externalReference: paymentRef.trim() || undefined,
          notes: `POS settlement (${uniqueBillNo}) via ${paymentMethod.toUpperCase()}`,
          recordedBy: currentUser?.displayName || 'Debasish',
          recordedAt: now,
        });
      }

      setInvoices((prev) => [newBill, ...prev]);

      if (openPrint) {
        setPrintModalInvoice(newBill);
      } else {
        alert(`Bill ${uniqueBillNo} generated successfully!`);
        clearCart();
      }
    } catch (err) {
      console.error('POS Checkout failed:', err);
      alert('Error during checkout. Please verify customer and item details.');
    } finally {
      setSaving(false);
    }
  };

  // Add Custom Item Pop-up handler
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemDesc.trim()) return;
    const priceP = rupeesToPaise(customItemPrice || '0');
    addToCart({
      id: `custom-${Date.now()}`,
      name: customItemDesc.trim(),
      pricePaise: priceP,
      type: customItemType,
    });
    setCustomItemDesc('');
    setCustomItemPrice('');
    setShowCustomItemModal(false);
  };

  // Today's Register Stats
  const todayStats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayInvoices = invoices.filter((i) => i.issuedAt && i.issuedAt.startsWith(todayStr));
    const totalSalesPaise = todayInvoices.reduce((acc, i) => acc + i.totalPaise, 0);
    const totalCollectedPaise = todayInvoices.reduce((acc, i) => acc + i.amountPaidPaise, 0);
    const totalDuePaise = todayInvoices.reduce((acc, i) => acc + i.balanceDuePaise, 0);
    return {
      count: todayInvoices.length,
      totalSalesPaise,
      totalCollectedPaise,
      totalDuePaise,
    };
  }, [invoices]);

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden gap-2 select-none">
      {/* POS Top Terminal Bar */}
      <div className="bg-slate-900 text-white px-3 sm:px-4 py-2 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between gap-2.5 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-brand-orange/20 flex items-center justify-center text-brand-orange border border-brand-orange/30 shrink-0">
            <Receipt className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-black text-white tracking-tight">
                POS Terminal
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                READY
              </span>
              <span className="font-mono font-bold text-xs text-brand-orange-light bg-white/10 px-1.5 py-0.5 rounded border border-white/10">
                {billNumber}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
              <span>Op: <strong className="text-slate-200">{currentUser?.displayName || 'Debasish'}</strong></span>
              <span>&bull;</span>
              <span>Counter 1</span>
            </div>
          </div>
        </div>

        {/* Center / Right Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile view switch tabs (visible only on < lg) */}
          <div className="flex lg:hidden items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setMobileTab('catalog')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1',
                mobileTab === 'catalog'
                  ? 'bg-brand-orange text-white'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>Catalog</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('ticket')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1',
                mobileTab === 'ticket'
                  ? 'bg-brand-orange text-white'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Ticket ({cartItemCount})</span>
            </button>
          </div>

          {/* Barcode scanner input */}
          <form onSubmit={handleBarcodeSubmit} className="relative hidden md:block">
            <Barcode className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={barcodeInputRef}
              type="text"
              placeholder="Scan Barcode / SKU [Enter]"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="pl-8 pr-2.5 py-1.5 rounded-xl border border-slate-700 text-xs w-44 lg:w-56 bg-slate-800/90 text-white placeholder-slate-400 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-orange font-mono"
            />
          </form>

          {/* Voice AI button */}
          <button
            type="button"
            onClick={() => openAssistant('billing')}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors"
            title="Voice Counter Assistant"
          >
            <Mic className="w-3.5 h-3.5 text-brand-orange" />
            <span className="hidden xl:inline">Voice</span>
            <span className="text-[9px] font-mono font-normal text-slate-400">({currentVoiceLang.nativeLabel})</span>
          </button>

          {/* Custom Item Adder */}
          <button
            type="button"
            onClick={() => setShowCustomItemModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Custom</span>
          </button>

          {/* Parked Carts */}
          <button
            type="button"
            onClick={() => setShowParkedModal(true)}
            className="relative px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Held</span>
            {parkedCarts.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                {parkedCarts.length}
              </span>
            )}
          </button>

          {/* Day Register Summary */}
          <button
            type="button"
            onClick={() => setShowRegisterSummary(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Register</span>
          </button>

          {/* Reset / Clear */}
          <button
            type="button"
            onClick={clearCart}
            title="Reset POS Terminal"
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 2-Panel POS Workspace */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-2.5 overflow-hidden">
        {/* ============================================================== */}
        {/* LEFT PANEL: PRODUCT & SERVICE CATALOG (7 COLS LG, 8 COLS XL)    */}
        {/* ============================================================== */}
        <div
          className={cn(
            'lg:col-span-7 xl:col-span-8 flex flex-col h-full min-h-0 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden',
            mobileTab !== 'catalog' && 'hidden lg:flex'
          )}
        >
          {/* Pinned Category Filter Pills & Search */}
          <div className="p-2 sm:p-2.5 bg-slate-50/80 border-b border-slate-100 space-y-2 shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter catalog by product title, brand, SKU or model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-orange"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="text-[11px] font-bold text-slate-500 shrink-0 font-mono hidden sm:block">
                {filteredCatalog.length} item{filteredCatalog.length === 1 ? '' : 's'}
              </div>
            </div>

            {/* Category Scroll Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs scrollbar-none">
              {categories.map((catKey) => {
                const meta = CATEGORY_META[catKey] || { label: catKey.replace('_', ' '), icon: '🏷️' };
                const count = catKey === 'all'
                  ? allPOSProducts.length
                  : allPOSProducts.filter((p) => p.category === catKey).length;
                const isSelected = selectedCategory === catKey;

                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setSelectedCategory(catKey)}
                    className={cn(
                      'px-2.5 py-1 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5',
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                    )}
                  >
                    <span className="text-xs">{meta.icon}</span>
                    <span>{meta.label}</span>
                    <span
                      className={cn(
                        'text-[10px] px-1.5 py-0.2 rounded-full font-mono',
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive POS Product Grid (Scrollable inside panel) */}
          <div className="flex-1 min-h-0 overflow-y-auto p-2 sm:p-2.5 scrollbar-thin">
            {allPOSProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3">
                <ShoppingBag className="w-10 h-10 text-slate-300" />
                <div className="font-bold text-slate-800 text-sm">No Products in Inventory</div>
                <p className="text-xs text-slate-500 max-w-sm">
                  No inventory items found. Add products in Inventory or use <strong>Custom Item</strong> above to bill any unlisted item or service directly.
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowCustomItemModal(true)}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Custom Item
                  </Button>
                  <Link to="/admin/inventory">
                    <Button size="sm" variant="primary">
                      Manage Inventory
                    </Button>
                  </Link>
                </div>
              </div>
            ) : filteredCatalog.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-2">
                <Search className="w-8 h-8 text-slate-300" />
                <div className="font-bold text-slate-800 text-xs">No matching products found</div>
                <p className="text-xs text-slate-500">
                  Try clearing your search query or switching category filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="text-xs text-brand-orange font-bold hover:underline"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
                {filteredCatalog.map((prod) => {
                  const inCartItem = cart.find((c) => c.description === prod.name);

                  return (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => addToCart(prod)}
                      className={cn(
                        'p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all active:scale-[0.98] group relative overflow-hidden min-h-[96px]',
                        inCartItem
                          ? 'bg-brand-orange/5 border-brand-orange/50 shadow-xs ring-1 ring-brand-orange/20'
                          : 'bg-white hover:bg-slate-50 border-slate-200/90 hover:border-slate-300 shadow-2xs'
                      )}
                    >
                      {/* In Cart Indicator Badge */}
                      {inCartItem && (
                        <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-brand-orange text-white text-[10px] font-mono font-bold flex items-center justify-center shadow-xs">
                          &times;{inCartItem.quantity}
                        </span>
                      )}

                      <div>
                        <div className="flex items-center gap-1 mb-1 flex-wrap pr-6">
                          <span className="text-[8px] font-bold uppercase tracking-wider px-1 py-0.2 rounded bg-slate-100 text-slate-600">
                            {prod.type}
                          </span>
                          {prod.brand && (
                            <span className="text-[8px] font-semibold px-1 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-100">
                              {prod.brand}
                            </span>
                          )}
                          <span
                            className={cn(
                              'text-[8px] font-semibold px-1 py-0.2 rounded',
                              prod.stock > 10
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : prod.stock > 0
                                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                : 'bg-rose-50 text-rose-700 border border-rose-100'
                            )}
                          >
                            Stock: {prod.stock}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-brand-navy">
                          {prod.name}
                        </div>
                        {prod.serialNumber && (
                          <div className="text-[9px] font-mono text-indigo-700 font-semibold truncate mt-0.5">
                            S/N: {prod.serialNumber}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                        <span className="text-xs font-black font-mono text-brand-orange">
                          {formatPaiseToINR(prod.pricePaise)}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-brand-navy flex items-center gap-0.5">
                          <Plus className="w-3 h-3" />
                          Add
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT PANEL: ACTIVE REGISTER TICKET & CHECKOUT (5 COLS LG, 4 COLS XL) */}
        {/* ============================================================== */}
        <div
          className={cn(
            'lg:col-span-5 xl:col-span-4 flex flex-col h-full min-h-0 bg-white rounded-2xl border border-slate-200/90 shadow-md overflow-hidden',
            mobileTab !== 'ticket' && 'hidden lg:flex'
          )}
        >
          {/* Pinned Ticket Header */}
          <div className="px-3 py-2 bg-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-brand-orange" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Active Ticket
              </span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-brand-orange text-white">
                {cartItemCount}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleParkCart}
                title="Park this cart to serve another customer"
                className="px-2 py-0.5 text-[11px] font-bold text-amber-300 hover:text-white bg-amber-500/20 hover:bg-amber-500/30 rounded-lg border border-amber-500/30 transition-colors flex items-center gap-1"
              >
                <PauseCircle className="w-3 h-3" />
                <span>Hold</span>
              </button>
              <button
                type="button"
                onClick={clearCart}
                title="Clear all ticket items"
                className="px-2 py-0.5 text-[11px] font-bold text-rose-300 hover:text-white bg-rose-500/20 hover:bg-rose-500/30 rounded-lg border border-rose-500/30 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Pinned Quick Customer Bar */}
          <div className="p-2 bg-slate-50 border-b border-slate-200/80 space-y-1.5 shrink-0">
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cust. Phone..."
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-orange font-mono"
                />
                {/* Auto matches dropdown */}
                {phoneSearchMatches.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-brand-border rounded-xl shadow-xl z-30 p-1 space-y-1">
                    {phoneSearchMatches.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => selectExistingCustomer(c)}
                        className="w-full text-left px-2 py-1 rounded hover:bg-slate-100 text-[11px] flex justify-between"
                      >
                        <span className="font-bold truncate">{c.fullName}</span>
                        <span className="font-mono text-slate-500">{c.phone}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-orange font-semibold"
              />
            </div>
          </div>

          {/* Ticket Line Items (Scrollable Body) */}
          <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-1.5 divide-y divide-slate-100 scrollbar-thin">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-8 text-center space-y-2">
                <ShoppingBag className="w-9 h-9 text-slate-200" />
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Ticket is Empty
                </div>
                <p className="text-[11px] text-slate-400 max-w-[200px]">
                  Click products on the left or scan barcode to add items to ticket.
                </p>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div key={item.id} className="pt-1.5 first:pt-0 flex items-center justify-between gap-1.5 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-800 truncate leading-snug">{item.description}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {formatPaiseToINR(item.unitPricePaise)} &times; {item.quantity}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center shrink-0">
                    <button
                      type="button"
                      onClick={() => updateQuantity(idx, -1)}
                      className="w-5 h-5 rounded-l bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="w-7 h-5 bg-slate-50 border-y border-slate-200 text-center flex items-center justify-center font-mono font-bold text-[11px] text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(idx, 1)}
                      className="w-5 h-5 rounded-r bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  {/* Line Total & Remove */}
                  <div className="flex items-center gap-1 shrink-0 pl-1">
                    <span className="font-mono font-bold text-slate-900 text-xs w-14 text-right">
                      {formatPaiseToINR(item.totalPaise)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(idx)}
                      className="text-slate-300 hover:text-rose-600 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Ticket Footer: Pinned Checkout Station */}
          <div className="p-2 sm:p-2.5 bg-slate-50/95 border-t border-slate-200 space-y-2 shrink-0">
            {/* Quick Discount Buttons */}
            <div className="flex items-center justify-between text-xs gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
                Discount:
              </span>
              <div className="flex items-center gap-1 flex-wrap justify-end">
                <button
                  type="button"
                  onClick={() => setDiscountRupees('0')}
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-bold transition-colors',
                    discountRupees === '0' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  )}
                >
                  None
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountRupees('50')}
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-bold transition-colors',
                    discountRupees === '50' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  )}
                >
                  ₹50
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountRupees('100')}
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-bold transition-colors',
                    discountRupees === '100' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  )}
                >
                  ₹100
                </button>
                <input
                  type="number"
                  min="0"
                  placeholder="₹ custom"
                  value={discountRupees}
                  onChange={(e) => setDiscountRupees(e.target.value)}
                  className="w-16 px-1.5 py-0.5 rounded border border-slate-300 text-right text-[10px] font-mono bg-white focus:outline-none focus:ring-1 focus:ring-brand-orange"
                />
              </div>
            </div>

            {/* Calculations Breakdown & Net Payable Banner */}
            <div className="rounded-xl bg-slate-900 text-white p-2.5 shadow-sm space-y-1">
              <div className="flex justify-between items-center text-[11px] text-slate-300">
                <span>Subtotal ({cartItemCount} items)</span>
                <span className="font-mono">{formatPaiseToINR(totals.subtotalPaise)}</span>
              </div>
              {totals.discountPaise > 0 && (
                <div className="flex justify-between items-center text-[11px] text-emerald-400 font-medium">
                  <span>Discount</span>
                  <span className="font-mono">-{formatPaiseToINR(totals.discountPaise)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1 border-t border-slate-800 text-white">
                <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                  Total Payable
                </span>
                <span className="font-mono text-lg font-black text-brand-orange">
                  {formatPaiseToINR(totals.totalPaise)}
                </span>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-4 gap-1 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={cn(
                  'py-1.5 rounded-xl border text-center transition-all',
                  paymentMethod === 'cash'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                )}
              >
                💵 Cash
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={cn(
                  'py-1.5 rounded-xl border text-center transition-all',
                  paymentMethod === 'upi'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                )}
              >
                📱 UPI
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={cn(
                  'py-1.5 rounded-xl border text-center transition-all',
                  paymentMethod === 'card'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                )}
              >
                💳 Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('pending')}
                className={cn(
                  'py-1.5 rounded-xl border text-center transition-all',
                  paymentMethod === 'pending'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                )}
              >
                ⏳ Udhar
              </button>
            </div>

            {/* Smart Cash Tender & Change Calculator */}
            {paymentMethod === 'cash' && (
              <div className="p-2 bg-white rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Tendered:</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setCashTenderedRupees(String(totals.totalPaise / 100))}
                      className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700"
                    >
                      Exact
                    </button>
                    <button
                      type="button"
                      onClick={() => setCashTenderedRupees('500')}
                      className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700"
                    >
                      ₹500
                    </button>
                    <button
                      type="button"
                      onClick={() => setCashTenderedRupees('1000')}
                      className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700"
                    >
                      ₹1000
                    </button>
                    <input
                      type="number"
                      placeholder="₹ Amount"
                      value={cashTenderedRupees}
                      onChange={(e) => setCashTenderedRupees(e.target.value)}
                      className="w-18 px-1.5 py-0.5 rounded border border-slate-300 text-right font-mono text-xs font-bold"
                    />
                  </div>
                </div>

                {cashChangeToReturnPaise > 0 && (
                  <div className="flex justify-between items-center bg-emerald-50 text-emerald-800 px-2 py-1 rounded-lg border border-emerald-200 font-bold text-xs">
                    <span>Change to Return:</span>
                    <span className="font-mono font-black">{formatPaiseToINR(cashChangeToReturnPaise)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Live UPI QR for Customer Scanning */}
            {paymentMethod === 'upi' && (
              <div className="p-2 bg-white rounded-xl border border-emerald-200 flex items-center justify-between gap-2">
                <div className="text-[11px] leading-tight">
                  <div className="font-bold text-emerald-800 flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                    Customer Scan & Pay
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    UPI: <span className="font-mono font-semibold">{upiPayee}</span>
                  </div>
                </div>
                <img src={upiQrUrl} alt="UPI QR" className="w-12 h-12 object-contain rounded border border-slate-200" />
              </div>
            )}

            {/* High-Velocity Checkout Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <Button
                variant="glow"
                size="md"
                className="w-full font-black text-xs py-2 shadow-md"
                leftIcon={<Printer className="w-4 h-4" />}
                isLoading={saving}
                onClick={() => handleCheckout(true)}
              >
                Pay & Print
              </Button>

              <Button
                variant="primary"
                size="md"
                className="w-full font-bold text-xs py-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                leftIcon={<Share2 className="w-4 h-4" />}
                isLoading={saving}
                onClick={() => handleCheckout(false)}
              >
                Quick Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODALS: RECEIPT PRINT, PARKED CARTS, REGISTER SUMMARY          */}
      {/* ============================================================== */}

      {/* Branded Bill Print Modal */}
      {printModalInvoice && settings && (
        <Modal
          isOpen={Boolean(printModalInvoice)}
          onClose={() => {
            setPrintModalInvoice(null);
            clearCart();
          }}
          title="Official Counter Bill Receipt"
          description={`Bill No: ${printModalInvoice.invoiceNumber} • A5 Paper Format`}
          maxWidth="2xl"
        >
          <CounterBillPrint
            invoice={printModalInvoice}
            settings={settings}
            onClose={() => {
              setPrintModalInvoice(null);
              clearCart();
            }}
          />
        </Modal>
      )}

      {/* Held / Parked Carts Modal */}
      <Modal
        isOpen={showParkedModal}
        onClose={() => setShowParkedModal(false)}
        title="Held / Parked POS Carts"
        description="Resume tickets that were held while serving another customer"
        maxWidth="lg"
      >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {parkedCarts.length === 0 ? (
            <div className="p-8 text-center text-xs text-brand-secondary">
              No parked carts currently on hold.
            </div>
          ) : (
            parkedCarts.map((p) => (
              <div
                key={p.id}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-brand-navy">{p.customerName}</div>
                  <div className="text-[11px] text-brand-secondary font-mono">
                    {p.customerPhone || 'Walk-in'} &bull; {p.items.length} items &bull;{' '}
                    {formatDate(p.createdAt)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    leftIcon={<PlayCircle className="w-3.5 h-3.5" />}
                    onClick={() => handleResumeCart(p)}
                  >
                    Resume
                  </Button>
                  <button
                    type="button"
                    onClick={() => setParkedCarts((prev) => prev.filter((item) => item.id !== p.id))}
                    className="p-1.5 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Day Register / Cash Drawer Shift Summary */}
      <Modal
        isOpen={showRegisterSummary}
        onClose={() => setShowRegisterSummary(false)}
        title="Today's Cash Register & Sales Summary"
        description="Shift balance and sales tally for Mobile Repairing House"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-brand-light rounded-2xl border border-brand-border space-y-3">
            <div className="flex justify-between items-center text-sm font-bold text-brand-navy">
              <span>Bills Issued Today:</span>
              <span className="font-mono text-base font-black">{todayStats.count}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Total Sales Value:</span>
              <span className="font-mono font-bold text-slate-900">
                {formatPaiseToINR(todayStats.totalSalesPaise)}
              </span>
            </div>
            <div className="flex justify-between items-center text-emerald-700">
              <span className="font-bold">Total Cash & Digital Collected:</span>
              <span className="font-mono font-bold text-emerald-800">
                {formatPaiseToINR(todayStats.totalCollectedPaise)}
              </span>
            </div>
            <div className="flex justify-between items-center text-rose-700">
              <span className="font-bold">Unpaid / Balance Due (Udhar):</span>
              <span className="font-mono font-bold text-rose-800">
                {formatPaiseToINR(todayStats.totalDuePaise)}
              </span>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 text-center">
            Register Operator: <span className="font-bold">{currentUser?.displayName || 'Debasish'}</span> &bull;{' '}
            {formatDate(new Date().toISOString())}
          </div>
        </div>
      </Modal>

      {/* Add Custom Item Modal */}
      <Modal
        isOpen={showCustomItemModal}
        onClose={() => setShowCustomItemModal(false)}
        title="Add Custom Product or Service to Ticket"
        description="Quick punch for unlisted items or special repair service charges"
        maxWidth="md"
      >
        <form onSubmit={handleAddCustomItem} className="space-y-4">
          <Input
            label="Item Description *"
            placeholder="e.g. UV Glue Drying or Special Phone Stand"
            required
            autoFocus
            value={customItemDesc}
            onChange={(e) => setCustomItemDesc(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">
                Category Type
              </label>
              <select
                value={customItemType}
                onChange={(e) => setCustomItemType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-brand-border bg-white text-xs text-slate-800 capitalize focus:outline-none"
              >
                <option value="accessory">Accessory</option>
                <option value="part">Part</option>
                <option value="labour">Labour / Service</option>
                <option value="other">Other</option>
              </select>
            </div>

            <Input
              label="Price in Rupees (₹) *"
              type="number"
              min="0"
              placeholder="0"
              required
              value={customItemPrice}
              onChange={(e) => setCustomItemPrice(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowCustomItemModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add to Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

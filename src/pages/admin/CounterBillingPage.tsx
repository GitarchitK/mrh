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
import { STORE_PRODUCTS, STORE_CATEGORIES } from '../../services/storeData';

// Counter Repair Services Catalog
const COUNTER_SERVICES = [
  { id: 'srv-screen-guard', name: 'Screen Guard Pasting Service', category: 'services', pricePaise: 5000, type: 'labour' as const, badge: 'Quick Service' },
  { id: 'srv-port-clean', name: 'Charging Port Dust Cleaning', category: 'services', pricePaise: 10000, type: 'labour' as const, badge: '5 Mins' },
  { id: 'srv-mic-speaker', name: 'Ear Speaker & Mic Deep Cleaning', category: 'services', pricePaise: 10000, type: 'labour' as const, badge: 'Audio Fix' },
  { id: 'srv-battery-labour', name: 'Battery Pasting & Replacement Labour', category: 'services', pricePaise: 25000, type: 'labour' as const, badge: 'Workshop' },
  { id: 'srv-software-reset', name: 'Software Reset & Pattern Unlock', category: 'services', pricePaise: 35000, type: 'labour' as const, badge: 'Software' },
  { id: 'srv-os-flash', name: 'OS Flashing / Bootloop Recovery', category: 'services', pricePaise: 60000, type: 'labour' as const, badge: 'Software' },
  { id: 'srv-diag', name: 'Motherboard Diagnostic Charge', category: 'services', pricePaise: 15000, type: 'labour' as const, badge: 'Inspection' },
  { id: 'srv-back-glass', name: 'Back Glass Laser Removal & Pasting', category: 'services', pricePaise: 40000, type: 'labour' as const, badge: 'Workshop' },
  { id: 'srv-camera-lens', name: 'Camera Outer Glass Replacement', category: 'services', pricePaise: 20000, type: 'labour' as const, badge: 'Quick Fix' },
];

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
  const [customerName, setCustomerName] = useState(prefillName || 'Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState(prefillPhone || '');
  const [customerId, setCustomerId] = useState(prefillCustId || '');
  const [selectedJobId, setSelectedJobId] = useState(prefillJobId);
  const [selectedJobNumber, setSelectedJobNumber] = useState(prefillJobNumber);
  const [notes, setNotes] = useState('');

  // Cart & Line Items
  const [cart, setCart] = useState<POSCartItem[]>([
    {
      id: 'cart-init-1',
      description: '11D Premium Tempered Glass',
      type: 'accessory',
      quantity: 1,
      unitPricePaise: 15000,
      totalPaise: 15000,
    },
  ]);

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
  const [saving, setSaving] = useState(false);
  const [printModalInvoice, setPrintModalInvoice] = useState<Invoice | null>(null);
  const [showRegisterSummary, setShowRegisterSummary] = useState(false);
  const [showCustomItemModal, setShowCustomItemModal] = useState(false);
  const [customItemDesc, setCustomItemDesc] = useState('');
  const [customItemType, setCustomItemType] = useState<'accessory' | 'part' | 'labour' | 'other'>('accessory');
  const [customItemPrice, setCustomItemPrice] = useState('100');

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

  // Unified Product Catalog for POS
  const allPOSProducts = useMemo(() => {
    const list: {
      id: string;
      name: string;
      category: string;
      pricePaise: number;
      type: 'accessory' | 'part' | 'labour' | 'other';
      badge?: string;
      stock?: number;
      sku?: string;
      brand?: string;
      serialNumber?: string;
    }[] = [];

    // 1. Add services
    COUNTER_SERVICES.forEach((srv) => {
      list.push({
        id: srv.id,
        name: srv.name,
        category: 'services',
        pricePaise: srv.pricePaise,
        type: srv.type,
        badge: srv.badge,
        stock: 999,
      });
    });

    // 2. Add store accessories
    STORE_PRODUCTS.forEach((prod) => {
      list.push({
        id: prod.id,
        name: prod.name,
        category: prod.category,
        pricePaise: prod.pricePaise,
        type: prod.category === 'spares' ? 'part' : 'accessory',
        badge: prod.badge,
        stock: prod.stockCount,
        sku: prod.slug,
      });
    });

    // 3. Add inventory from real DB if not duplicate
    inventory.forEach((inv) => {
      if (!list.some((l) => l.name.toLowerCase() === inv.name.toLowerCase())) {
        list.push({
          id: inv.id,
          name: inv.name,
          category: inv.category,
          pricePaise: inv.sellingPricePaise,
          type:
            inv.category === 'displays' || inv.category === 'batteries' || inv.category === 'charging_ports'
              ? 'part'
              : 'accessory',
          badge: `In Stock: ${inv.quantityAvailable}`,
          stock: inv.quantityAvailable,
          sku: inv.sku,
          brand: inv.brand,
          serialNumber: inv.serialNumber,
        });
      }
    });

    return list;
  }, [inventory]);

  // Filtered Catalog by Category & Search
  const filteredCatalog = useMemo(() => {
    return allPOSProducts.filter((item) => {
      if (selectedCategory === 'popular') {
        const isPopular =
          item.badge === 'Best Seller' ||
          item.badge === 'Quick Service' ||
          item.badge === 'Quick Fix' ||
          item.name.includes('Tempered') ||
          item.name.includes('Charger') ||
          item.name.includes('Cable');
        if (!isPopular) return false;
      } else if (selectedCategory !== 'all') {
        if (selectedCategory === 'services' && item.category !== 'services') return false;
        if (selectedCategory === 'chargers' && item.category !== 'chargers') return false;
        if (selectedCategory === 'cables' && item.category !== 'cables') return false;
        if (selectedCategory === 'protection' && item.category !== 'protection' && !item.name.includes('Tempered') && !item.name.includes('Cover')) return false;
        if (selectedCategory === 'audio' && item.category !== 'earphones' && item.category !== 'headphones') return false;
        if (selectedCategory === 'spares' && item.category !== 'spares' && item.category !== 'displays' && item.category !== 'batteries') return false;
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
    setCustomerName('Walk-in Customer');
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
      customerName: customerName || 'Walk-in Customer',
      customerPhone,
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
  const upiPayee = '9732789938@upi';
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
        customerPhone: customerPhone.trim() || '9732789938',
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
    setCustomItemPrice('100');
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
    <div className="space-y-4">
      {/* POS Top Terminal Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-brand-border shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange border border-brand-orange/20 shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-brand-navy tracking-tight">
                POS Register Terminal
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                LIVE
              </span>
            </div>
            <div className="text-xs text-brand-secondary flex items-center gap-2">
              <span>Counter: Debasish</span>
              <span>&bull;</span>
              <span className="font-mono font-semibold text-brand-orange">{billNumber}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Barcode scanner input */}
          <form onSubmit={handleBarcodeSubmit} className="relative">
            <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={barcodeInputRef}
              type="text"
              placeholder="Scan Barcode / SKU..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-xl border border-brand-border text-xs w-44 sm:w-56 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30 font-mono"
            />
          </form>

          {/* Voice AI button */}
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Mic className="w-3.5 h-3.5 text-brand-orange" />}
            onClick={() => openAssistant('billing')}
            className="text-xs"
          >
            <span className="hidden sm:inline">Voice Fill</span> ({currentVoiceLang.nativeLabel})
          </Button>

          {/* Custom Item Adder */}
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setShowCustomItemModal(true)}
            className="text-xs"
          >
            Custom Item
          </Button>

          {/* Parked Carts */}
          <button
            type="button"
            onClick={() => setShowParkedModal(true)}
            className="relative px-3 py-1.5 rounded-xl border border-brand-border bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Held Carts</span>
            {parkedCarts.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-brand-orange text-white text-[10px] flex items-center justify-center font-bold">
                {parkedCarts.length}
              </span>
            )}
          </button>

          {/* Register Shift Summary */}
          <Button
            size="sm"
            variant="outline"
            leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
            onClick={() => setShowRegisterSummary(true)}
            className="text-xs"
          >
            Day Register
          </Button>
        </div>
      </div>

      {/* Main 2-Panel POS Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ============================================================== */}
        {/* LEFT PANEL: PRODUCT & SERVICE CATALOG (7 COLS)                 */}
        {/* ============================================================== */}
        <div className="lg:col-span-7 space-y-3">
          {/* Category Filter Pills & Search */}
          <div className="bg-white p-3 rounded-2xl border border-brand-border shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter catalog by product title, brand, or model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                />
              </div>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Scroll Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-brand-navy text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Items ({allPOSProducts.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('popular')}
                className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all flex items-center gap-1 ${
                  selectedCategory === 'popular'
                    ? 'bg-brand-orange text-white shadow-glow-orange'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Zap className="w-3 h-3" />
                Popular
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('protection')}
                className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all ${
                  selectedCategory === 'protection'
                    ? 'bg-brand-navy text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🛡️ Tempered & Covers
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('chargers')}
                className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all ${
                  selectedCategory === 'chargers'
                    ? 'bg-brand-navy text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🔌 Fast Chargers
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('cables')}
                className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all ${
                  selectedCategory === 'cables'
                    ? 'bg-brand-navy text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🧵 Cables
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('services')}
                className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all ${
                  selectedCategory === 'services'
                    ? 'bg-brand-navy text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🛠️ Counter Services
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('audio')}
                className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all ${
                  selectedCategory === 'audio'
                    ? 'bg-brand-navy text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🎧 Audio
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('spares')}
                className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all ${
                  selectedCategory === 'spares'
                    ? 'bg-brand-navy text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                📱 Spares
              </button>
            </div>
          </div>

          {/* Interactive POS Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
            {filteredCatalog.map((prod) => {
              const inCartItem = cart.find((c) => c.description === prod.name);

              return (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => addToCart(prod)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all active:scale-95 group relative overflow-hidden min-h-[105px] ${
                    inCartItem
                      ? 'bg-brand-orange/5 border-brand-orange/40 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-brand-border shadow-2xs hover:border-slate-300'
                  }`}
                >
                  {/* In Cart Indicator Badge */}
                  {inCartItem && (
                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand-orange text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                      {inCartItem.quantity}
                    </span>
                  )}

                  <div>
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {prod.type}
                      </span>
                      {prod.brand && (
                        <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-100">
                          {prod.brand}
                        </span>
                      )}
                      {prod.badge && (
                        <span className="text-[9px] font-medium text-brand-orange truncate max-w-[100px]">
                          {prod.badge}
                        </span>
                      )}
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
        </div>

        {/* ============================================================== */}
        {/* RIGHT PANEL: ACTIVE REGISTER TICKET & CHECKOUT (5 COLS)        */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-brand-border shadow-md flex flex-col h-full max-h-[calc(100vh-140px)] overflow-hidden">
          {/* Ticket Header & Customer Selector */}
          <div className="p-3.5 bg-slate-50 border-b border-brand-border space-y-2 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-brand-orange" />
                <span className="text-xs font-black text-brand-navy uppercase tracking-wider">
                  Active Ticket ({cart.reduce((a, b) => a + b.quantity, 0)} Items)
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleParkCart}
                  title="Park this cart to serve another customer"
                  className="px-2 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors flex items-center gap-1"
                >
                  <PauseCircle className="w-3 h-3" />
                  Hold
                </button>
                <button
                  type="button"
                  onClick={clearCart}
                  title="Clear all ticket items"
                  className="px-2 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Quick Customer Bar */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cust. Phone (Lookup)..."
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-orange font-mono"
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
                placeholder="Customer Name..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-orange font-semibold"
              />
            </div>
          </div>

          {/* Ticket Line Items (Scrollable Body) */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <ShoppingBag className="w-10 h-10 text-slate-200 mx-auto" />
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Ticket is Empty
                </div>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Click any product or service tile from the left catalog, or scan a barcode to add.
                </p>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between gap-2 text-xs">
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
                      className="w-6 h-6 rounded-l-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 h-6 bg-slate-50 border-y border-slate-200 text-center flex items-center justify-center font-mono font-bold text-xs text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(idx, 1)}
                      className="w-6 h-6 rounded-r-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Line Total & Remove */}
                  <div className="flex items-center gap-1.5 shrink-0 pl-1">
                    <span className="font-mono font-bold text-slate-900 text-xs w-16 text-right">
                      {formatPaiseToINR(item.totalPaise)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(idx)}
                      className="text-slate-300 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Ticket Footer: Discounts, Calculations & Tender */}
          <div className="p-3.5 bg-slate-50/90 border-t border-brand-border space-y-3 shrink-0">
            {/* Quick Discount Buttons */}
            <div className="flex items-center justify-between text-xs gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
                Discount:
              </span>
              <div className="flex items-center gap-1 flex-wrap justify-end">
                <button
                  type="button"
                  onClick={() => setDiscountRupees('0')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    discountRupees === '0' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  None
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountRupees('50')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    discountRupees === '50' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  ₹50 Off
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountRupees('100')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    discountRupees === '100' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  ₹100 Off
                </button>
                <input
                  type="number"
                  min="0"
                  placeholder="₹ custom"
                  value={discountRupees}
                  onChange={(e) => setDiscountRupees(e.target.value)}
                  className="w-16 px-1.5 py-0.5 rounded border border-slate-300 text-right text-[10px] font-mono bg-white"
                />
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1 text-xs border-y border-slate-200 py-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono">{formatPaiseToINR(totals.subtotalPaise)}</span>
              </div>
              {totals.discountPaise > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount:</span>
                  <span className="font-mono">-{formatPaiseToINR(totals.discountPaise)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-brand-navy pt-1">
                <span>Total Payable:</span>
                <span className="font-mono text-brand-orange text-lg">
                  {formatPaiseToINR(totals.totalPaise)}
                </span>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-4 gap-1 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`py-1.5 rounded-xl border text-center transition-all ${
                  paymentMethod === 'cash'
                    ? 'bg-brand-navy text-white border-brand-navy shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                💵 Cash
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`py-1.5 rounded-xl border text-center transition-all ${
                  paymentMethod === 'upi'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                📱 UPI
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`py-1.5 rounded-xl border text-center transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-brand-navy text-white border-brand-navy shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                💳 Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('pending')}
                className={`py-1.5 rounded-xl border text-center transition-all ${
                  paymentMethod === 'pending'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                ⏳ Udhar
              </button>
            </div>

            {/* Smart Cash Tender & Change Calculator */}
            {paymentMethod === 'cash' && (
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Cash Tendered:</span>
                  <div className="flex items-center gap-1">
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
                      placeholder="Amount"
                      value={cashTenderedRupees}
                      onChange={(e) => setCashTenderedRupees(e.target.value)}
                      className="w-20 px-2 py-0.5 rounded border border-slate-300 text-right font-mono text-xs font-bold"
                    />
                  </div>
                </div>

                {cashChangeToReturnPaise > 0 && (
                  <div className="flex justify-between items-center bg-emerald-50 text-emerald-800 px-2 py-1 rounded-lg border border-emerald-200 font-bold">
                    <span>Change to Return:</span>
                    <span className="font-mono text-sm">{formatPaiseToINR(cashChangeToReturnPaise)}</span>
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
                    VPA: <span className="font-mono font-semibold">{upiPayee}</span>
                  </div>
                </div>
                <img src={upiQrUrl} alt="UPI QR" className="w-14 h-14 object-contain rounded border border-slate-200" />
              </div>
            )}

            {/* High-Velocity Checkout Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                variant="glow"
                size="md"
                className="w-full font-black text-xs py-2.5 shadow-md"
                leftIcon={<Printer className="w-4 h-4" />}
                isLoading={saving}
                onClick={() => handleCheckout(true)}
              >
                Pay & Print
              </Button>

              <Button
                variant="primary"
                size="md"
                className="w-full font-bold text-xs py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
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
          description={`Bill No: ${printModalInvoice.invoiceNumber}`}
          maxWidth="4xl"
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

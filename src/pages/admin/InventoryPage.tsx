import React, { useState, useEffect } from 'react';
import {
  Package,
  PlusCircle,
  Search,
  Filter,
  AlertTriangle,
  ArrowUpDown,
  History,
  CheckCircle2,
  Mic,
  Sparkles,
  Tag,
  Barcode,
  Hash,
  Edit2,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import {
  getInventoryProducts,
  saveInventoryProduct,
  updateInventoryProduct,
  deleteInventoryProduct,
  adjustInventoryStock,
  getInventoryMovements,
} from '../../services/db';
import { InventoryProduct, InventoryMovement } from '../../types';
import { useVoice } from '../../context/VoiceContext';
import { SUPPORTED_VOICE_LANGUAGES } from '../../services/speechService';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { formatPaiseToINR, rupeesToPaise } from '../../lib/money';
import { formatDate, formatDateTime } from '../../lib/utils';

const BRAND_OPTIONS = [
  { value: 'Universal', label: 'Universal / Multi-brand' },
  { value: 'Apple', label: 'Apple (iPhone / iPad)' },
  { value: 'Samsung', label: 'Samsung' },
  { value: 'Xiaomi', label: 'Xiaomi / Redmi / POCO' },
  { value: 'Realme', label: 'Realme' },
  { value: 'OnePlus', label: 'OnePlus' },
  { value: 'Vivo', label: 'Vivo' },
  { value: 'Oppo', label: 'Oppo' },
  { value: 'Motorola', label: 'Motorola' },
  { value: 'Google Pixel', label: 'Google Pixel' },
  { value: 'Nothing', label: 'Nothing Phone' },
  { value: 'Infinix', label: 'Infinix' },
  { value: 'Tecno', label: 'Tecno' },
  { value: 'iQOO', label: 'iQOO' },
  { value: 'boAt', label: 'boAt' },
  { value: 'Noise', label: 'Noise' },
  { value: 'Portronics', label: 'Portronics' },
  { value: 'Generic OEM', label: 'Generic / OEM Compatible' },
  { value: 'custom', label: 'Other (Enter Custom Brand)...' },
];

const QUICK_BRAND_PILLS = [
  'Apple',
  'Samsung',
  'Xiaomi',
  'Realme',
  'OnePlus',
  'Vivo',
  'Oppo',
  'Universal',
];

export const InventoryPage: React.FC = () => {
  const { currentUser, isOwner } = useAuth();
  const { registerStockHandler, openAssistant, activeLanguage } = useVoice();
  const currentVoiceLang = SUPPORTED_VOICE_LANGUAGES.find((l) => l.code === activeLanguage) || SUPPORTED_VOICE_LANGUAGES[0];
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);

  // Edit & Delete State (Owner Controls)
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<InventoryProduct | null>(null);
  const [deletingProduct, setDeletingProduct] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // New / Edit Product Form
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<any>('displays');
  const [brandSelection, setBrandSelection] = useState('Universal');
  const [customBrand, setCustomBrand] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [initialQty, setInitialQty] = useState('5');
  const [lowStockThresh, setLowStockThresh] = useState('2');
  const [costRupees, setCostRupees] = useState('');
  const [sellingRupees, setSellingRupees] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);

  // Adjust Form
  const [deltaQty, setDeltaQty] = useState('1');
  const [adjustType, setAdjustType] = useState<'stock_in' | 'stock_out' | 'repair_consumed' | 'adjustment'>('stock_in');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  const resetProductForm = () => {
    setEditingProduct(null);
    setName('');
    setSku('');
    setCategory('displays');
    setBrandSelection('Universal');
    setCustomBrand('');
    setSerialNumber('');
    setInitialQty('5');
    setLowStockThresh('2');
    setCostRupees('');
    setSellingRupees('');
  };

  const openEditModal = (prod: InventoryProduct) => {
    setEditingProduct(prod);
    setName(prod.name);
    setSku(prod.sku);
    setCategory(prod.category);

    const found = BRAND_OPTIONS.find(
      (b) => b.value.toLowerCase() === (prod.brand || '').toLowerCase()
    );
    if (found && found.value !== 'custom') {
      setBrandSelection(found.value);
      setCustomBrand('');
    } else if (prod.brand) {
      setBrandSelection('custom');
      setCustomBrand(prod.brand);
    } else {
      setBrandSelection('Universal');
      setCustomBrand('');
    }

    setSerialNumber(prod.serialNumber || '');
    setInitialQty(String(prod.quantityAvailable));
    setLowStockThresh(String(prod.lowStockThreshold));
    setCostRupees(prod.purchaseCostPaise ? String(Math.round(prod.purchaseCostPaise / 100)) : '');
    setSellingRupees(prod.sellingPricePaise ? String(Math.round(prod.sellingPricePaise / 100)) : '');
    setProductModalOpen(true);
  };

  const loadData = async () => {
    setLoading(true);
    const [pList, mList] = await Promise.all([getInventoryProducts(), getInventoryMovements()]);
    setProducts(pList);
    setMovements(mList);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Voice AI Stock Fill Registration
  useEffect(() => {
    const unregister = registerStockHandler((data) => {
      setProductModalOpen(true);
      if (data.name) setName(data.name);
      if (data.sku) setSku(data.sku);
      if (data.category) setCategory(data.category);
      if (data.brand) {
        const found = BRAND_OPTIONS.find(
          (b) => b.value.toLowerCase() === data.brand!.toLowerCase() || b.label.toLowerCase().includes(data.brand!.toLowerCase())
        );
        if (found && found.value !== 'custom') {
          setBrandSelection(found.value);
          setCustomBrand('');
        } else {
          setBrandSelection('custom');
          setCustomBrand(data.brand);
        }
      }
      if (data.serialNumber) setSerialNumber(data.serialNumber);
      if (data.quantity) setInitialQty(String(data.quantity));
      if (data.costRupees) setCostRupees(data.costRupees);
      if (data.sellingRupees) setSellingRupees(data.sellingRupees);
    });
    return unregister;
  }, [registerStockHandler]);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) {
      alert('Product name and SKU are required.');
      return;
    }

    const resolvedBrand = brandSelection === 'custom'
      ? customBrand.trim()
      : (brandSelection === 'Universal' ? 'Universal' : brandSelection.trim());

    const newQty = Math.max(0, parseInt(initialQty) || 0);

    setSavingProduct(true);
    try {
      const now = new Date().toISOString();

      if (editingProduct) {
        const oldQty = editingProduct.quantityAvailable;
        await updateInventoryProduct(editingProduct.id, {
          name: name.trim(),
          sku: sku.trim().toUpperCase(),
          category,
          brand: resolvedBrand || undefined,
          serialNumber: serialNumber.trim().toUpperCase() || undefined,
          quantityAvailable: newQty,
          lowStockThreshold: Math.max(0, parseInt(lowStockThresh) || 2),
          purchaseCostPaise: rupeesToPaise(costRupees || 0),
          sellingPricePaise: rupeesToPaise(sellingRupees || 0),
          active: true,
        });

        // If stock count was modified directly in the edit form, record audit movement
        if (newQty !== oldQty) {
          const delta = newQty - oldQty;
          await adjustInventoryStock({
            productId: editingProduct.id,
            delta,
            type: 'adjustment',
            reason: `Direct stock audit count updated from ${oldQty} to ${newQty} units`,
            performedBy: currentUser?.displayName || 'Debasish (Owner)',
          });
        }

        setSuccessToast(`Stock item "${name.trim()}" updated successfully!`);
        setTimeout(() => setSuccessToast(''), 4000);
      } else {
        const newProd: InventoryProduct = {
          id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: name.trim(),
          sku: sku.trim().toUpperCase(),
          category,
          brand: resolvedBrand || undefined,
          serialNumber: serialNumber.trim().toUpperCase() || undefined,
          quantityAvailable: newQty,
          lowStockThreshold: Math.max(0, parseInt(lowStockThresh) || 2),
          purchaseCostPaise: rupeesToPaise(costRupees || 0),
          sellingPricePaise: rupeesToPaise(sellingRupees || 0),
          active: true,
          createdAt: now,
          updatedAt: now,
        };

        await saveInventoryProduct(newProd);
        setSuccessToast(`"${name.trim()}" registered to inventory!`);
        setTimeout(() => setSuccessToast(''), 4000);
      }

      setProductModalOpen(false);
      resetProductForm();
      await loadData();
    } catch (err: any) {
      console.error('Failed to save product:', err);
      alert(err?.message || 'Failed to save product.');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteConfirmProduct) return;
    setDeletingProduct(true);
    try {
      await deleteInventoryProduct(deleteConfirmProduct.id);
      setSuccessToast(`Deleted "${deleteConfirmProduct.name}" from inventory.`);
      setTimeout(() => setSuccessToast(''), 4000);
      setDeleteConfirmProduct(null);
      await loadData();
    } catch (err: any) {
      console.error('Failed to delete product:', err);
      alert(err?.message || 'Failed to delete product.');
    } finally {
      setDeletingProduct(false);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const num = parseInt(deltaQty) || 0;
    if (num <= 0) {
      alert('Please enter a positive count.');
      return;
    }

    const finalDelta = adjustType === 'stock_in' ? num : -num;

    setAdjusting(true);
    try {
      await adjustInventoryStock({
        productId: selectedProduct.id,
        delta: finalDelta,
        type: adjustType,
        reason: adjustReason.trim() || undefined,
        performedBy: currentUser?.displayName || 'Debasish',
      });

      setAdjustModalOpen(false);
      setSelectedProduct(null);
      setDeltaQty('1');
      setAdjustReason('');
      await loadData();
    } catch (err) {
      console.error('Failed to adjust stock:', err);
      alert('Failed to adjust inventory.');
    } finally {
      setAdjusting(false);
    }
  };

  const filtered = products.filter((p) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.serialNumber && p.serialNumber.toLowerCase().includes(q));

    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-navy tracking-tight">
            Inventory & Spare Parts
          </h1>
          <p className="text-xs text-brand-secondary mt-0.5">
            Track replacement displays, batteries, charging ports, accessories, and serialized parts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Mic className="w-3.5 h-3.5 text-brand-orange" />}
            onClick={() => openAssistant('inventory')}
          >
            <span>Voice Add Stock ({currentVoiceLang.nativeLabel})</span>
          </Button>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
            onClick={() => {
              resetProductForm();
              setProductModalOpen(true);
            }}
          >
            Add Product / Part
          </Button>
        </div>
      </div>

      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold">{successToast}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by part name, SKU (e.g. DSP-SAM), brand, or serial / IMEI..."
            enableVoice
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-52">
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="displays">Displays & Touch</option>
            <option value="batteries">Batteries</option>
            <option value="charging_ports">Charging Ports</option>
            <option value="cables">Cables & Chargers</option>
            <option value="earphones">Earphones & Audio</option>
            <option value="power_banks">Power Banks</option>
            <option value="back_glass">Back Glass</option>
            <option value="cameras">Cameras</option>
            <option value="other">Other Components</option>
          </Select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-brand-secondary">
            No inventory items found. Click &quot;Add Product / Part&quot; to register components.
          </div>
        ) : (
          <div className="divide-y divide-brand-border text-xs">
            {filtered.map((prod) => {
              const isLow = prod.quantityAvailable <= prod.lowStockThreshold;

              return (
                <div
                  key={prod.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-brand-light/40 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-brand-light px-2 py-0.5 rounded border border-brand-border text-brand-navy">
                        {prod.sku}
                      </span>
                      {prod.brand && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                          <Tag className="w-3 h-3 text-blue-600" />
                          <span>{prod.brand}</span>
                        </span>
                      )}
                      {prod.serialNumber && (
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">
                          <Barcode className="w-3.5 h-3.5 text-indigo-600" />
                          <span>S/N: {prod.serialNumber}</span>
                        </span>
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary bg-slate-100 px-2 py-0.5 rounded">
                        {prod.category.replace('_', ' ')}
                      </span>
                      {isLow && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Low Stock</span>
                        </span>
                      )}
                    </div>

                    <div className="font-bold text-sm text-brand-navy">
                      {prod.name}
                    </div>

                    <div className="text-[11px] text-brand-secondary flex flex-wrap items-center gap-3">
                      <span>Brand: <strong className="text-brand-navy">{prod.brand || 'Universal'}</strong></span>
                      {prod.serialNumber && (
                        <>
                          <span>&bull;</span>
                          <span>Serial / IMEI: <strong className="font-mono text-indigo-700">{prod.serialNumber}</strong></span>
                        </>
                      )}
                      <span>&bull;</span>
                      <span>Selling Price: <strong className="text-brand-text font-bold">{formatPaiseToINR(prod.sellingPricePaise)}</strong></span>
                      {isOwner && (
                        <>
                          <span>&bull;</span>
                          <span className="italic">Wholesale: {formatPaiseToINR(prod.purchaseCostPaise)}</span>
                          {prod.purchaseCostPaise > 0 && prod.sellingPricePaise > prod.purchaseCostPaise && (
                            <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              +₹{Math.round((prod.sellingPricePaise - prod.purchaseCostPaise) / 100)} margin
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
                    <div className="text-right pr-1">
                      <span className="text-brand-secondary text-[10px] uppercase font-bold block">
                        In Stock:
                      </span>
                      <span
                        className={`text-xl font-black ${
                          isLow ? 'text-amber-600' : 'text-brand-navy'
                        }`}
                      >
                        {prod.quantityAvailable}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      leftIcon={<ArrowUpDown className="w-3.5 h-3.5" />}
                      onClick={() => {
                        setSelectedProduct(prod);
                        setAdjustModalOpen(true);
                      }}
                      title="Adjust stock in/out movement"
                    >
                      Adjust
                    </Button>

                    {isOwner && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="text-xs font-semibold bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200"
                        leftIcon={<Edit2 className="w-3.5 h-3.5 text-blue-600" />}
                        onClick={() => openEditModal(prod)}
                        title="Edit product details, prices, SKU and stock count"
                      >
                        Edit
                      </Button>
                    )}

                    {isOwner && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                        leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                        onClick={() => setDeleteConfirmProduct(prod)}
                        title="Delete product from inventory"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={productModalOpen}
        onClose={() => {
          setProductModalOpen(false);
          resetProductForm();
        }}
        title={editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add Inventory Product or Spare Part'}
        description={
          editingProduct
            ? 'Update part details, SKU, retail / wholesale pricing, and direct in-hand stock quantity.'
            : 'Register a new component for repair jobs or retail sale with brand & serial tracking.'
        }
      >
        <div className="mb-4 p-3 bg-brand-light rounded-xl border border-brand-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-orange" />
            <span className="text-brand-navy font-semibold">
              Fill entire form by voice in বাংলা, हिन्दी or English:
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            leftIcon={<Mic className="w-3.5 h-3.5 text-brand-orange" />}
            onClick={() => openAssistant('inventory')}
          >
            Voice Fill
          </Button>
        </div>

        <form onSubmit={handleSaveProduct} className="space-y-4">
          <Input
            label="Product / Part Name *"
            required
            placeholder="e.g. Redmi Note 10 Pro Display (AMOLED) or iPhone 13 Battery"
            enableVoice
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Brand Selector Section */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-brand-navy uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-brand-orange" />
                <span>Choose Brand / Manufacturer *</span>
              </label>
              {brandSelection !== 'custom' && (
                <span className="text-[11px] font-semibold text-slate-500">
                  Selected: <strong className="text-brand-navy">{brandSelection}</strong>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                value={brandSelection}
                onChange={(e) => setBrandSelection(e.target.value)}
              >
                {BRAND_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>

              {brandSelection === 'custom' ? (
                <Input
                  required
                  placeholder="Type custom brand (e.g. Realme, Portronics)..."
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  enableVoice
                />
              ) : (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase w-full">Quick Brand Pick:</span>
                  {QUICK_BRAND_PILLS.map((pill) => (
                    <button
                      key={pill}
                      type="button"
                      onClick={() => {
                        setBrandSelection(pill);
                        setCustomBrand('');
                      }}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                        brandSelection === pill
                          ? 'bg-brand-navy text-white border-brand-navy shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-brand-navy hover:text-brand-navy'
                      }`}
                    >
                      {pill}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SKU and Serial Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="SKU Identifier *"
              required
              placeholder="e.g. DSP-REDMI-N10P"
              enableVoice
              value={sku}
              onChange={(e) => setSku(e.target.value.toUpperCase())}
            />

            <Input
              label="Serial Number / IMEI / Batch Code (Optional)"
              placeholder="e.g. SN-A2442-998812 or 864293048123456"
              enableVoice
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
              helperText="Unique barcode / IMEI / serial for tracking warranty & replacements"
            />
          </div>

          {/* Category & Quantity in Hand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category *"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="displays">Displays & Touchscreen</option>
              <option value="batteries">Batteries</option>
              <option value="charging_ports">Charging Ports</option>
              <option value="cables">Cables & Chargers</option>
              <option value="earphones">Earphones & Audio</option>
              <option value="power_banks">Power Banks</option>
              <option value="back_glass">Back Glass</option>
              <option value="cameras">Cameras</option>
              <option value="other">Other Components</option>
            </Select>

            <Input
              label={editingProduct ? "In-Hand Stock Quantity (Units) *" : "Initial Quantity in Hand *"}
              type="number"
              min="0"
              required
              value={initialQty}
              onChange={(e) => setInitialQty(e.target.value)}
              helperText={editingProduct ? "Directly update current available stock count." : undefined}
            />
          </div>

          {/* Stock threshold & Prices */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Low Stock Alert Threshold *"
              type="number"
              min="1"
              required
              value={lowStockThresh}
              onChange={(e) => setLowStockThresh(e.target.value)}
            />

            <Input
              label="Selling Price (₹) *"
              type="number"
              placeholder="e.g. 2400"
              required
              value={sellingRupees}
              onChange={(e) => setSellingRupees(e.target.value)}
            />

            {isOwner && (
              <Input
                label="Wholesale Cost (₹) (Private)"
                type="number"
                placeholder="e.g. 1500"
                value={costRupees}
                onChange={(e) => setCostRupees(e.target.value)}
              />
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setProductModalOpen(false);
                resetProductForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={savingProduct}>
              {editingProduct ? 'Update Stock Item' : 'Save Inventory Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Product Confirmation Modal (Owner Only) */}
      {deleteConfirmProduct && (
        <Modal
          isOpen={!!deleteConfirmProduct}
          onClose={() => setDeleteConfirmProduct(null)}
          title="Delete Stock Product"
          description="Confirm permanent removal of this spare part from the shop inventory."
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-900 text-sm">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Permanently delete "{deleteConfirmProduct.name}"?</span>
              </div>
              <p>
                SKU: <strong className="font-mono text-brand-navy">{deleteConfirmProduct.sku}</strong> &bull; Current stock: <strong className="text-brand-navy">{deleteConfirmProduct.quantityAvailable} units</strong>.
              </p>
              <p className="text-rose-700">
                This item will be deleted from the database. This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteConfirmProduct(null)}
                disabled={deletingProduct}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                className="bg-rose-600 hover:bg-rose-700 text-white"
                isLoading={deletingProduct}
                onClick={handleDeleteProduct}
              >
                Yes, Delete Stock Item
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Adjust Stock Modal */}
      {selectedProduct && (
        <Modal
          isOpen={adjustModalOpen}
          onClose={() => setAdjustModalOpen(false)}
          title={`Adjust Stock: ${selectedProduct.name}`}
          description={`Current Quantity in Stock: ${selectedProduct.quantityAvailable} units.`}
        >
          <form onSubmit={handleAdjustStock} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Movement Type *"
                value={adjustType}
                onChange={(e) => setAdjustType(e.target.value as any)}
              >
                <option value="stock_in">Stock In (+ Restock)</option>
                <option value="repair_consumed">Repair Consumed (- Installed)</option>
                <option value="stock_out">Manual Stock Out (- Defective/Lost)</option>
                <option value="adjustment">Audit Count Adjustment</option>
              </Select>

              <Input
                label="Quantity Count *"
                type="number"
                min="1"
                required
                value={deltaQty}
                onChange={(e) => setDeltaQty(e.target.value)}
              />
            </div>

            <Input
              label="Audit Reason / Reference"
              placeholder="e.g. Consumed for job MRH-2026-1042, or wholesale restock"
              enableVoice
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
            />

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setAdjustModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={adjusting}>
                Confirm Stock Movement
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

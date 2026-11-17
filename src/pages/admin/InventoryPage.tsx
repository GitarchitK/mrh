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
} from 'lucide-react';
import {
  getInventoryProducts,
  saveInventoryProduct,
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

  // New Product Form
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<any>('displays');
  const [brand, setBrand] = useState('');
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
      if (data.brand) setBrand(data.brand);
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

    setSavingProduct(true);
    try {
      const now = new Date().toISOString();
      const newProd: InventoryProduct = {
        id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        category,
        brand: brand.trim() || undefined,
        quantityAvailable: Math.max(0, parseInt(initialQty) || 0),
        lowStockThreshold: Math.max(0, parseInt(lowStockThresh) || 2),
        purchaseCostPaise: rupeesToPaise(costRupees || 0),
        sellingPricePaise: rupeesToPaise(sellingRupees || 0),
        active: true,
        createdAt: now,
        updatedAt: now,
      };

      await saveInventoryProduct(newProd);
      setProductModalOpen(false);
      setName('');
      setSku('');
      setBrand('');
      setCostRupees('');
      setSellingRupees('');
      await loadData();
    } catch (err) {
      console.error('Failed to save product:', err);
      alert('Failed to save product.');
    } finally {
      setSavingProduct(false);
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
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()));

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
            Track replacement displays, batteries, charging ports, and counter accessories.
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
            onClick={() => setProductModalOpen(true)}
          >
            Add Product / Part
          </Button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by part name, SKU (e.g. DSP-SAM), or brand..."
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
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-xs bg-brand-light px-2 py-0.5 rounded border border-brand-border text-brand-navy">
                        {prod.sku}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary">
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
                      <span>Brand: {prod.brand || 'Universal'}</span>
                      <span>&bull;</span>
                      <span>Selling Price: <strong className="text-brand-text">{formatPaiseToINR(prod.sellingPricePaise)}</strong></span>
                      {isOwner && (
                        <>
                          <span>&bull;</span>
                          <span className="italic">Purchase Cost: {formatPaiseToINR(prod.purchaseCostPaise)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
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
                    >
                      Adjust Stock
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        title="Add Inventory Product or Spare Part"
        description="Register a new component for repair jobs or retail sale."
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
            placeholder="e.g. Redmi Note 10 Pro Display (AMOLED)"
            enableVoice
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="SKU Identifier *"
              required
              placeholder="e.g. DSP-REDMI-N10P"
              enableVoice
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Initial Quantity in Hand *"
              type="number"
              min="0"
              required
              value={initialQty}
              onChange={(e) => setInitialQty(e.target.value)}
            />
            <Input
              label="Low Stock Warning Threshold *"
              type="number"
              min="1"
              required
              value={lowStockThresh}
              onChange={(e) => setLowStockThresh(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setProductModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={savingProduct}>
              Save Inventory Product
            </Button>
          </div>
        </form>
      </Modal>

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

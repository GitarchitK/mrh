import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  PlusCircle,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  XCircle,
} from 'lucide-react';
import { getWarranties, saveWarranty, getRepairJobs, getBusinessSettings } from '../../services/db';
import { Warranty, RepairJob, BusinessSettings } from '../../types';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatDateTime, formatPhoneNumber } from '../../lib/utils';
import { generateWarrantyReference } from '../../lib/reference';

export const WarrantiesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();

  const prefillJobId = searchParams.get('newForJob') || '';
  const prefillName = searchParams.get('name') || '';
  const prefillPhone = searchParams.get('phone') || '';
  const prefillJobNumber = searchParams.get('jobNumber') || '';
  const prefillCustId = searchParams.get('custId') || '';
  const prefillDevice = searchParams.get('device') || '';

  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [repairs, setRepairs] = useState<RepairJob[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(Boolean(prefillJobId));

  // Form State
  const [repairJobId, setRepairJobId] = useState(prefillJobId);
  const [jobNumber, setJobNumber] = useState(prefillJobNumber);
  const [customerId, setCustomerId] = useState(prefillCustId);
  const [customerName, setCustomerName] = useState(prefillName);
  const [customerPhone, setCustomerPhone] = useState(prefillPhone);
  const [deviceInfo, setDeviceInfo] = useState(prefillDevice);
  const [coveredWork, setCoveredWork] = useState('');
  const [durationDays, setDurationDays] = useState('30');
  const [terms, setTerms] = useState(
    'Warranty covers touch unresponsiveness and display functionality defects. Any physical cracks, deep drops, liquid contact, or opening by third parties voids this warranty.'
  );
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [wList, rList, bSettings] = await Promise.all([
      getWarranties(),
      getRepairJobs(),
      getBusinessSettings(),
    ]);
    setWarranties(wList);
    setRepairs(rList);
    setSettings(bSettings);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIssueWarranty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repairJobId) {
      alert('Please select a repair job.');
      return;
    }

    setSaving(true);
    try {
      const now = new Date();
      const days = parseInt(durationDays) || 30;
      const expiry = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      const newWarranty: Warranty = {
        id: `wrn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        warrantyReference: generateWarrantyReference(),
        repairJobId,
        jobNumber: jobNumber || 'MRH-JOB',
        customerId: customerId || 'cust_temp',
        customerName: customerName || 'Valued Customer',
        customerPhone: customerPhone || '',
        deviceInfo: deviceInfo || 'Smartphone',
        coveredWork: coveredWork.trim(),
        durationDays: days,
        startDate: now.toISOString(),
        expiryDate: expiry.toISOString(),
        terms: terms.trim(),
        status: 'active',
        createdBy: currentUser?.displayName || 'Debasish',
        createdAt: now.toISOString(),
      };

      await saveWarranty(newWarranty);
      setModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to issue warranty:', err);
      alert('Failed to save warranty record.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = warranties.filter(
    (w) =>
      w.warrantyReference.toLowerCase().includes(search.toLowerCase()) ||
      w.jobNumber.toLowerCase().includes(search.toLowerCase()) ||
      w.customerName.toLowerCase().includes(search.toLowerCase()) ||
      w.customerPhone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-navy tracking-tight">
            Repair Warranties
          </h1>
          <p className="text-xs text-brand-secondary mt-0.5">
            Issue and track post-repair hardware and replacement part warranties.
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
          onClick={() => setModalOpen(true)}
        >
          Issue Warranty
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-xs">
        <Input
          placeholder="Search by warranty reference, job number, customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Warranties List */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-brand-secondary">
            No warranties recorded yet. Click &quot;Issue Warranty&quot; after completing an eligible repair.
          </div>
        ) : (
          <div className="divide-y divide-brand-border text-xs">
            {filtered.map((wrn) => {
              const isExpired = new Date(wrn.expiryDate) < new Date();

              return (
                <div
                  key={wrn.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-brand-light/40 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-sm text-brand-navy">
                        {wrn.warrantyReference}
                      </span>
                      <span className="font-mono text-xs text-brand-secondary bg-brand-light px-2 py-0.5 rounded border border-brand-border">
                        Job: {wrn.jobNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          wrn.status === 'voided'
                            ? 'bg-rose-100 text-rose-800'
                            : isExpired
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {wrn.status === 'voided' ? 'Voided' : isExpired ? 'Expired' : 'Active'}
                      </span>
                    </div>

                    <div className="font-bold text-sm text-brand-text">
                      {wrn.customerName} &bull; <span className="font-normal text-brand-secondary">{wrn.deviceInfo}</span>
                    </div>

                    <div className="text-brand-secondary text-[11px]">
                      Covered: <strong className="text-brand-text">{wrn.coveredWork}</strong> &bull; ({wrn.durationDays} Days Duration)
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[11px] text-brand-secondary">
                      Valid From: {formatDate(wrn.startDate)}
                    </div>
                    <div className="text-[11px] font-bold text-brand-navy">
                      Expires: {formatDate(wrn.expiryDate)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Issue Warranty Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Issue Repair Warranty Certificate"
        description="Specify covered parts, service duration, and warranty policy."
        maxWidth="lg"
      >
        <form onSubmit={handleIssueWarranty} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-navy uppercase tracking-wider mb-1">
              Select Completed Repair Job *
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
                  setDeviceInfo(`${found.brand} ${found.model}`);
                }
              }}
              className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-xs text-brand-text focus:outline-none"
              required
            >
              <option value="">-- Choose Repair Job --</option>
              {repairs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.jobNumber} - {r.customerName} ({r.brand} {r.model})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Covered Hardware / Work *"
              required
              placeholder="e.g. Display Assembly Replacement"
              value={coveredWork}
              onChange={(e) => setCoveredWork(e.target.value)}
            />
            <Select
              label="Warranty Duration *"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
            >
              <option value="15">15 Days Testing Warranty</option>
              <option value="30">30 Days (1 Month)</option>
              <option value="60">60 Days (2 Months)</option>
              <option value="90">90 Days (3 Months)</option>
              <option value="180">180 Days (6 Months)</option>
            </Select>
          </div>

          <Textarea
            label="Warranty Terms & Exclusions"
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              Confirm & Issue Warranty
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

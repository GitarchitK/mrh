import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  PlusCircle,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Wrench,
  Clock,
} from 'lucide-react';
import { getCustomers, createOrUpdateCustomer } from '../../services/db';
import { Customer } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { formatDateTime, formatDate, formatPhoneNumber, isValidIndianPhone } from '../../lib/utils';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // New Customer Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const list = await getCustomers();
    setCustomers(list);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setFormError('Customer name is required.');
      return;
    }
    if (!phone.trim()) {
      setFormError('Phone number is required.');
      return;
    }
    if (!isValidIndianPhone(phone)) {
      setFormError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      await createOrUpdateCustomer({
        fullName,
        phone,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
        createdBy: 'Debasish',
      });
      setModalOpen(false);
      setFullName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setNotes('');
      await loadData();
    } catch (err) {
      console.error('Failed to create customer:', err);
      setFormError('Failed to save customer record.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.address && c.address.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-navy tracking-tight">
            Customer Directory
          </h1>
          <p className="text-xs text-brand-secondary mt-0.5">
            Manage customer records, repair histories, and service contact info.
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
          onClick={() => setModalOpen(true)}
        >
          Add Customer
        </Button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-xs">
        <Input
          placeholder="Search by customer name, mobile number, or locality..."
          enableVoice
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Customers Table / Cards */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-brand-secondary">
            No customers found. Click &quot;Add Customer&quot; to create a new client record.
          </div>
        ) : (
          <div className="divide-y divide-brand-border text-xs">
            {filtered.map((cust) => (
              <div
                key={cust.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-brand-light/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-brand-navy">{cust.fullName}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-brand-secondary">
                    <span className="flex items-center gap-1 font-semibold text-brand-text">
                      <Phone className="w-3.5 h-3.5 text-brand-orange" />
                      <span>{formatPhoneNumber(cust.phone)}</span>
                    </span>
                    {cust.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{cust.email}</span>
                      </span>
                    )}
                    {cust.address && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate max-w-xs">{cust.address}</span>
                      </span>
                    )}
                  </div>
                  {cust.notes && (
                    <div className="text-[11px] text-brand-secondary italic truncate max-w-md pt-0.5">
                      Note: {cust.notes}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/admin/repairs/new?name=${encodeURIComponent(cust.fullName)}&phone=${encodeURIComponent(cust.phone)}&custId=${cust.id}`}
                  >
                    <Button size="sm" variant="outline" className="text-xs" leftIcon={<Wrench className="w-3.5 h-3.5" />}>
                      New Repair
                    </Button>
                  </Link>
                  <Link to={`/admin/customers/${cust.id}`}>
                    <Button size="sm" variant="secondary" className="text-xs">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Customer Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Customer Record"
        description="Save customer contact details for fast counter intake."
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              {formError}
            </div>
          )}

          <Input
            label="Full Name *"
            required
            placeholder="e.g. Anirban Roy"
            enableVoice
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <Input
            label="Mobile Phone *"
            required
            placeholder="10-digit mobile number"
            enableVoice
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            helperText="Indian mobile number"
          />

          <Input
            label="Email Address (Optional)"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Address / Area Locality (Optional)"
            placeholder="e.g. Bonhooghly, Dunlop"
            enableVoice
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <Textarea
            label="Internal Customer Notes (Optional)"
            placeholder="Any specific customer preferences..."
            enableVoice
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              Save Customer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

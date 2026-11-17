import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  PlusCircle,
  Phone,
  Mail,
  ChevronRight,
} from 'lucide-react';
import { getEnquiries, updateEnquiry } from '../../services/db';
import { RepairEnquiry, EnquiryStatus } from '../../types';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { formatDateTime, formatPhoneNumber } from '../../lib/utils';
import { createWhatsAppUrl } from '../../lib/whatsapp';

export const EnquiriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState<RepairEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadData = async () => {
    setLoading(true);
    const list = await getEnquiries();
    setEnquiries(list);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (id: string, newStatus: EnquiryStatus) => {
    await updateEnquiry(id, { status: newStatus });
    setEnquiries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
    );
  };

  const filtered = enquiries.filter((enq) => {
    const matchesSearch =
      enq.customerName.toLowerCase().includes(search.toLowerCase()) ||
      enq.phone.includes(search) ||
      enq.publicReference.toLowerCase().includes(search.toLowerCase()) ||
      enq.brand.toLowerCase().includes(search.toLowerCase()) ||
      enq.model.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || enq.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-navy tracking-tight">
            Customer Repair Enquiries
          </h1>
          <p className="text-xs text-brand-secondary mt-0.5">
            Review and respond to incoming requests from the public website.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by customer name, phone, or ENQ reference..."
            enableVoice
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Enquiries</option>
            <option value="new">New Only</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted to Job</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
      </div>

      {/* Enquiries List */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-brand-secondary">
            No enquiries match your search filters.
          </div>
        ) : (
          <div className="divide-y divide-brand-border text-xs">
            {filtered.map((enq) => (
              <div key={enq.id} className="p-5 sm:p-6 space-y-4 hover:bg-brand-light/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-brand-navy text-sm">
                      {enq.publicReference}
                    </span>
                    <StatusBadge status={enq.status} type="enquiry" size="sm" />
                    <span className="text-[11px] text-brand-secondary">
                      {formatDateTime(enq.createdAt)}
                    </span>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-brand-secondary text-[11px]">Mark as:</span>
                    <select
                      value={enq.status}
                      onChange={(e) => handleStatusChange(enq.id, e.target.value as EnquiryStatus)}
                      className="text-xs rounded-lg border border-brand-border bg-white px-2.5 py-1 text-brand-navy font-semibold focus:outline-none"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="converted">Converted</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-brand-light p-4 rounded-xl border border-brand-border">
                  <div>
                    <span className="text-brand-secondary block text-[11px]">Customer:</span>
                    <div className="font-bold text-brand-navy text-sm">{enq.customerName}</div>
                    <div className="text-brand-secondary flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-brand-orange" />
                      <span>{formatPhoneNumber(enq.phone)}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-brand-secondary block text-[11px]">Device:</span>
                    <div className="font-bold text-brand-navy text-sm">
                      {enq.brand} {enq.model}
                    </div>
                    <div className="text-brand-secondary uppercase text-[10px]">
                      OS: {enq.deviceType} &bull; {enq.problemCategory}
                    </div>
                  </div>

                  <div>
                    <span className="text-brand-secondary block text-[11px]">Contact Preference:</span>
                    <div className="font-bold text-brand-navy capitalize">
                      {enq.preferredContactMethod}
                    </div>
                    {enq.preferredVisitDate && (
                      <div className="text-brand-secondary text-[10px]">
                        Pref. Date: {enq.preferredVisitDate}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <span className="font-bold text-brand-navy block uppercase text-[10px] tracking-wider mb-1">
                    Reported Symptoms:
                  </span>
                  <p className="text-brand-text bg-white p-3 rounded-lg border border-brand-border leading-relaxed">
                    {enq.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <a
                      href={createWhatsAppUrl(`Hello ${enq.customerName}, this is Debasish from Mobile Repairing House regarding your repair enquiry ${enq.publicReference} for ${enq.brand} ${enq.model}.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" variant="outline" className="text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50" leftIcon={<MessageSquare className="w-3.5 h-3.5 text-emerald-600" />}>
                        WhatsApp Customer
                      </Button>
                    </a>
                    <a href={`tel:${enq.phone.replace(/\s+/g, '')}`}>
                      <Button size="sm" variant="outline" className="text-xs" leftIcon={<Phone className="w-3.5 h-3.5 text-brand-navy" />}>
                        Call
                      </Button>
                    </a>
                  </div>

                  {enq.status !== 'converted' && (
                    <Link
                      to={`/admin/repairs/new?name=${encodeURIComponent(enq.customerName)}&phone=${encodeURIComponent(enq.phone)}&brand=${encodeURIComponent(enq.brand)}&model=${encodeURIComponent(enq.model)}&deviceType=${enq.deviceType}&problem=${encodeURIComponent(enq.description)}&enquiryId=${enq.id}`}
                    >
                      <Button size="sm" variant="primary" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
                        Convert to Repair Job
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

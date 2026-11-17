import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Users,
  Phone,
  Mail,
  MapPin,
  Wrench,
  FileText,
  CreditCard,
  PlusCircle,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import {
  getCustomerById,
  getRepairJobs,
  getInvoices,
  getWarranties,
} from '../../services/db';
import { Customer, RepairJob, Invoice, Warranty } from '../../types';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { formatDate, formatDateTime, formatPhoneNumber } from '../../lib/utils';
import { formatPaiseToINR } from '../../lib/money';

export const CustomerDetailPage: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [repairs, setRepairs] = useState<RepairJob[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customerId) return;
    const fetch = async () => {
      setLoading(true);
      const cust = await getCustomerById(customerId);
      if (cust) {
        setCustomer(cust);
        const [allJobs, allInvs, allWrns] = await Promise.all([
          getRepairJobs(),
          getInvoices(),
          getWarranties(),
        ]);
        setRepairs(allJobs.filter((j) => j.customerId === cust.id || j.customerPhone === cust.phone));
        setInvoices(allInvs.filter((i) => i.customerId === cust.id || i.customerPhone === cust.phone));
        setWarranties(allWrns.filter((w) => w.customerId === cust.id || w.customerPhone === cust.phone));
      }
      setLoading(false);
    };
    fetch();
  }, [customerId]);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-12 text-center text-xs text-brand-secondary">
        Customer record not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top back button & title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/customers"
            className="p-1.5 rounded-lg border border-brand-border bg-white text-brand-secondary hover:text-brand-navy"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-brand-navy tracking-tight">
              {customer.fullName}
            </h1>
            <p className="text-xs text-brand-secondary">
              Customer Profile &bull; Added on {formatDate(customer.createdAt)}
            </p>
          </div>
        </div>

        <Link
          to={`/admin/repairs/new?name=${encodeURIComponent(customer.fullName)}&phone=${encodeURIComponent(customer.phone)}&custId=${customer.id}`}
        >
          <Button size="sm" variant="primary" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
            Intake New Repair
          </Button>
        </Link>
      </div>

      {/* Customer Info Card */}
      <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
        <div>
          <span className="text-brand-secondary block uppercase text-[10px] tracking-wider mb-1">
            Phone Number:
          </span>
          <div className="font-bold text-sm text-brand-navy flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-brand-orange" />
            <a href={`tel:${customer.phone.replace(/\s+/g, '')}`} className="hover:underline">
              {formatPhoneNumber(customer.phone)}
            </a>
          </div>
        </div>

        <div>
          <span className="text-brand-secondary block uppercase text-[10px] tracking-wider mb-1">
            Email Address:
          </span>
          <div className="font-medium text-brand-navy">
            {customer.email || 'Not provided'}
          </div>
        </div>

        <div>
          <span className="text-brand-secondary block uppercase text-[10px] tracking-wider mb-1">
            Locality / Address:
          </span>
          <div className="font-medium text-brand-navy">
            {customer.address || 'Dunlop / Kolkata'}
          </div>
        </div>

        {customer.notes && (
          <div className="sm:col-span-3 pt-4 border-t border-brand-border">
            <span className="text-brand-secondary block uppercase text-[10px] tracking-wider mb-1">
              Internal Staff Notes:
            </span>
            <p className="text-brand-text bg-brand-light p-3 rounded-lg border border-brand-border">
              {customer.notes}
            </p>
          </div>
        )}
      </div>

      {/* Repair History Section */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-brand-navy flex items-center gap-2">
          <Wrench className="w-4 h-4 text-brand-orange" />
          <span>Repair Jobs History ({repairs.length})</span>
        </h2>

        <div className="bg-white rounded-2xl border border-brand-border shadow-xs overflow-hidden">
          {repairs.length === 0 ? (
            <div className="p-8 text-center text-xs text-brand-secondary">
              No repair jobs on record for this customer.
            </div>
          ) : (
            <div className="divide-y divide-brand-border text-xs">
              {repairs.map((job) => (
                <Link
                  key={job.id}
                  to={`/admin/repairs/${job.id}`}
                  className="p-4 flex items-center justify-between hover:bg-brand-light/50 transition-colors group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-brand-navy group-hover:text-brand-orange transition-colors">
                        {job.jobNumber}
                      </span>
                      <StatusBadge status={job.status} size="sm" />
                    </div>
                    <div className="font-semibold text-brand-text">
                      {job.brand} {job.model} ({job.deviceType.toUpperCase()})
                    </div>
                    <div className="text-brand-secondary text-[11px] truncate max-w-md">
                      {job.reportedProblem}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[11px] text-brand-secondary">{formatDate(job.receivedAt)}</div>
                    <ChevronRight className="w-4 h-4 text-brand-secondary group-hover:text-brand-navy mt-1 ml-auto" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invoices History Section */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-brand-navy flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-orange" />
          <span>Invoices & Billing ({invoices.length})</span>
        </h2>

        <div className="bg-white rounded-2xl border border-brand-border shadow-xs overflow-hidden">
          {invoices.length === 0 ? (
            <div className="p-8 text-center text-xs text-brand-secondary">
              No invoices generated for this customer yet.
            </div>
          ) : (
            <div className="divide-y divide-brand-border text-xs">
              {invoices.map((inv) => (
                <div key={inv.id} className="p-4 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-brand-navy">{inv.invoiceNumber}</span>
                    <div className="text-brand-secondary text-[11px] mt-0.5">
                      Issued: {formatDate(inv.issuedAt)} &bull; Job: {inv.jobNumber || '-'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-brand-navy">{formatPaiseToINR(inv.totalPaise)}</div>
                    <StatusBadge status={inv.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

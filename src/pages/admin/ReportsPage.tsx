import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  CreditCard,
  Wrench,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import {
  getRepairJobs,
  getEnquiries,
  getInvoices,
  getPayments,
  getInventoryProducts,
} from '../../services/db';
import { RepairJob, RepairEnquiry, Invoice, Payment, InventoryProduct } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { formatPaiseToINR } from '../../lib/money';
import { formatDate } from '../../lib/utils';

export const ReportsPage: React.FC = () => {
  const [repairs, setRepairs] = useState<RepairJob[]>([]);
  const [enquiries, setEnquiries] = useState<RepairEnquiry[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [inventory, setInventory] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const [rList, eList, iList, pList, invList] = await Promise.all([
        getRepairJobs(),
        getEnquiries(),
        getInvoices(),
        getPayments(),
        getInventoryProducts(),
      ]);
      setRepairs(rList);
      setEnquiries(eList);
      setInvoices(iList);
      setPayments(pList);
      setInventory(invList);
      setLoading(false);
    };
    fetch();
  }, []);

  // Financial totals strictly calculated from real records
  const totalRevenuePaise = payments.reduce((acc, p) => acc + p.amountPaise, 0);
  const totalBilledPaise = invoices.reduce((acc, i) => acc + i.totalPaise, 0);
  const totalOutstandingPaise = invoices.reduce((acc, i) => acc + i.balanceDuePaise, 0);

  // Category breakdown
  const categoryCounts: Record<string, number> = {};
  repairs.forEach((r) => {
    const key = r.reportedProblem.slice(0, 25) || 'General Hardware';
    categoryCounts[key] = (categoryCounts[key] || 0) + 1;
  });

  // Device type breakdown
  const androidCount = repairs.filter((r) => r.deviceType === 'android').length;
  const iphoneCount = repairs.filter((r) => r.deviceType === 'iphone').length;
  const otherCount = repairs.filter((r) => r.deviceType === 'other').length;

  // Export CSV functions
  const downloadRepairsCSV = () => {
    const headers = ['Job Number', 'Customer Name', 'Phone', 'Brand', 'Model', 'Status', 'Priority', 'Received Date'];
    const rows = repairs.map((r) => [
      r.jobNumber,
      `"${r.customerName}"`,
      r.customerPhone,
      r.brand,
      r.model,
      r.status,
      r.priority,
      r.receivedAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MRH_Repairs_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPaymentsCSV = () => {
    const headers = ['Payment Ref', 'Customer', 'Amount (INR)', 'Method', 'External Ref', 'Recorded At'];
    const rows = payments.map((p) => [
      p.paymentReference,
      `"${p.customerName}"`,
      (p.amountPaise / 100).toFixed(2),
      p.method,
      p.externalReference || '-',
      p.recordedAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MRH_Payments_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-navy tracking-tight">
            Reports & Business Analytics
          </h1>
          <p className="text-xs text-brand-secondary mt-0.5">
            Operational summaries, payment audits, and CSV data export.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={downloadRepairsCSV}
          >
            Export Repairs CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<FileSpreadsheet className="w-3.5 h-3.5" />}
            onClick={downloadPaymentsCSV}
          >
            Export Payments CSV
          </Button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-secondary uppercase tracking-wider">
              Total Payments Collected
            </span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-700 mt-2">
            {formatPaiseToINR(totalRevenuePaise)}
          </div>
          <div className="text-[11px] text-brand-secondary mt-1">
            Total actual collections from {payments.length} transactions.
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-secondary uppercase tracking-wider">
              Total Invoiced Billing
            </span>
            <BarChart3 className="w-4 h-4 text-brand-navy" />
          </div>
          <div className="text-3xl font-black text-brand-navy mt-2">
            {formatPaiseToINR(totalBilledPaise)}
          </div>
          <div className="text-[11px] text-brand-secondary mt-1">
            Cumulative sum of {invoices.length} issued invoices.
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-secondary uppercase tracking-wider">
              Outstanding Receivables
            </span>
            <TrendingUp className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-black text-rose-600 mt-2">
            {formatPaiseToINR(totalOutstandingPaise)}
          </div>
          <div className="text-[11px] text-brand-secondary mt-1">
            Remaining balances due on active repair bills.
          </div>
        </div>
      </div>

      {/* Operational Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Device Platform Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider">
            Device Platform Distribution
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Android Smartphones</span>
                <span>{androidCount} jobs</span>
              </div>
              <div className="w-full bg-brand-light h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${repairs.length ? (androidCount / repairs.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>iPhone Models</span>
                <span>{iphoneCount} jobs</span>
              </div>
              <div className="w-full bg-brand-light h-2 rounded-full overflow-hidden">
                <div
                  className="bg-brand-navy h-full rounded-full"
                  style={{ width: `${repairs.length ? (iphoneCount / repairs.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Other / Feature Phones</span>
                <span>{otherCount} jobs</span>
              </div>
              <div className="w-full bg-brand-light h-2 rounded-full overflow-hidden">
                <div
                  className="bg-brand-orange h-full rounded-full"
                  style={{ width: `${repairs.length ? (otherCount / repairs.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider">
            Repair Status Distribution
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              { label: 'Received / Intake', count: repairs.filter((r) => r.status === 'received').length },
              { label: 'In Diagnosis', count: repairs.filter((r) => r.status === 'diagnosing').length },
              { label: 'Awaiting Approval', count: repairs.filter((r) => r.status === 'awaiting_approval' || r.status === 'estimate_sent').length },
              { label: 'In Repair', count: repairs.filter((r) => r.status === 'in_repair' || r.status === 'approved').length },
              { label: 'Ready for Collection', count: repairs.filter((r) => r.status === 'ready_for_collection').length },
              { label: 'Completed', count: repairs.filter((r) => r.status === 'completed').length },
            ].map((st, idx) => (
              <div key={idx} className="p-3 bg-brand-light rounded-xl border border-brand-border">
                <span className="text-[10px] text-brand-secondary uppercase font-bold block">{st.label}</span>
                <span className="text-lg font-black text-brand-navy mt-1 block">{st.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

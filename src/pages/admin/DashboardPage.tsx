import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench,
  Users,
  CreditCard,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PlusCircle,
  FileText,
  ArrowRight,
  TrendingUp,
  Inbox,
  Filter,
  Package,
  MessageSquare,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  getRepairJobs,
  getEnquiries,
  getInvoices,
  getPayments,
  getInventoryProducts,
} from '../../services/db';
import { RepairJob, RepairEnquiry, Invoice, Payment, InventoryProduct } from '../../types';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { formatPaiseToINR } from '../../lib/money';
import { formatDateTime, formatDate, formatPhoneNumber } from '../../lib/utils';
import { createWhatsAppUrl } from '../../lib/whatsapp';
import { fadeInUp, staggerContainer, staggerFast, cardHoverProps } from '../../lib/animations';

export const DashboardPage: React.FC = () => {
  const [repairs, setRepairs] = useState<RepairJob[]>([]);
  const [enquiries, setEnquiries] = useState<RepairEnquiry[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [inventory, setInventory] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const loadData = async () => {
    setLoading(true);
    try {
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
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter items by time range
  const filterByDate = (dateStr: string) => {
    if (timeFilter === 'all') return true;
    const d = new Date(dateStr);
    const now = new Date();
    if (timeFilter === 'today') {
      return d.toDateString() === now.toDateString();
    }
    if (timeFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 1000 * 60);
      return d >= weekAgo;
    }
    if (timeFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 1000 * 60);
      return d >= monthAgo;
    }
    return true;
  };

  // Filtered collections
  const filteredRepairs = repairs.filter((r) => filterByDate(r.createdAt));
  const filteredEnquiries = enquiries.filter((e) => filterByDate(e.createdAt));
  const filteredPayments = payments.filter((p) => filterByDate(p.recordedAt));

  // 8.1 KPI Calculations (from actual persisted records)
  const newEnquiriesCount = filteredEnquiries.filter((e) => e.status === 'new').length;
  const pendingDiagnosesCount = filteredRepairs.filter(
    (r) => r.status === 'received' || r.status === 'diagnosing'
  ).length;
  const awaitingApprovalCount = filteredRepairs.filter(
    (r) => r.status === 'estimate_sent' || r.status === 'awaiting_approval'
  ).length;
  const inProgressCount = filteredRepairs.filter(
    (r) => r.status === 'approved' || r.status === 'in_repair'
  ).length;
  const readyForCollectionCount = filteredRepairs.filter(
    (r) => r.status === 'ready_for_collection'
  ).length;
  const completedCount = filteredRepairs.filter((r) => r.status === 'completed').length;

  // Exact monetary calculations in Paise
  const totalPaymentsReceivedPaise = filteredPayments.reduce(
    (acc, p) => acc + p.amountPaise,
    0
  );

  // Outstanding balance across invoices
  const totalOutstandingBalancePaise = invoices.reduce(
    (acc, inv) => acc + inv.balanceDuePaise,
    0
  );

  // Low stock inventory products
  const lowStockProducts = inventory.filter(
    (p) => p.active && p.quantityAvailable <= p.lowStockThreshold
  );

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Top Welcome & Actions Bar */}
      <motion.div
        variants={fadeInUp}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight">
              Workshop Operations
            </h1>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-xs text-brand-secondary mt-0.5">
            Real-time repair shop metrics, customer intake, and financial summaries.
          </p>
        </div>

        {/* Date Filter & Fast Intake CTA */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl border border-brand-border bg-white p-1 text-xs shadow-2xs">
            {(['all', 'today', 'week', 'month'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setTimeFilter(tab)}
                className={`px-3 py-1 rounded-lg font-bold transition-all capitalize ${
                  timeFilter === tab
                    ? 'bg-brand-navy text-white shadow-xs'
                    : 'text-brand-secondary hover:text-brand-navy'
                }`}
              >
                {tab === 'all' ? 'All Time' : tab === 'today' ? 'Today' : tab === 'week' ? 'Week' : 'Month'}
              </button>
            ))}
          </div>

          <Link to="/admin/repairs/new">
            <Button size="sm" variant="glow" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
              New Intake
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* KPI Cards Grid with Interactive Motion */}
      <motion.div
        variants={staggerFast}
        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4"
      >
        {/* KPI 1: Ready for Collection */}
        <motion.div
          variants={fadeInUp}
          {...cardHoverProps}
          className="bg-white p-5 rounded-3xl border border-brand-orange/40 shadow-xs flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-orange" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-orange">
              Ready for Pickup
            </span>
            <CheckCircle2 className="w-4 h-4 text-brand-orange group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-brand-navy">
              {readyForCollectionCount}
            </span>
            <span className="text-[11px] text-brand-secondary">jobs awaiting customer</span>
          </div>
          <Link
            to="/admin/repairs?status=ready_for_collection"
            className="text-[11px] font-bold text-brand-orange hover:underline mt-3 inline-flex items-center gap-1"
          >
            <span>View list</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </motion.div>

        {/* KPI 2: In Repair */}
        <motion.div
          variants={fadeInUp}
          {...cardHoverProps}
          className="bg-white p-5 rounded-3xl border border-brand-border shadow-xs flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
              In Workbench
            </span>
            <Wrench className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-brand-navy">
              {inProgressCount}
            </span>
            <span className="text-[11px] text-brand-secondary">actively being worked</span>
          </div>
          <Link
            to="/admin/repairs?status=in_repair"
            className="text-[11px] font-bold text-indigo-700 hover:underline mt-3 inline-flex items-center gap-1"
          >
            <span>View workbench</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </motion.div>

        {/* KPI 3: Awaiting Approval */}
        <motion.div
          variants={fadeInUp}
          {...cardHoverProps}
          className="bg-white p-5 rounded-3xl border border-brand-border shadow-xs flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
              Awaiting Approval
            </span>
            <Clock className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-brand-navy">
              {awaitingApprovalCount}
            </span>
            <span className="text-[11px] text-brand-secondary">estimates issued</span>
          </div>
          <Link
            to="/admin/estimates?status=issued"
            className="text-[11px] font-bold text-amber-700 hover:underline mt-3 inline-flex items-center gap-1"
          >
            <span>View estimates</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </motion.div>

        {/* KPI 4: Pending Diagnoses */}
        <motion.div
          variants={fadeInUp}
          {...cardHoverProps}
          className="bg-white p-5 rounded-3xl border border-brand-border shadow-xs flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
              Pending Diagnosis
            </span>
            <FileText className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-brand-navy">
              {pendingDiagnosesCount}
            </span>
            <span className="text-[11px] text-brand-secondary">intake in queue</span>
          </div>
          <Link
            to="/admin/repairs?status=received"
            className="text-[11px] font-bold text-blue-700 hover:underline mt-3 inline-flex items-center gap-1"
          >
            <span>Inspect queue</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </motion.div>

        {/* KPI 5: New Enquiries */}
        <motion.div
          variants={fadeInUp}
          {...cardHoverProps}
          className="bg-white p-5 rounded-3xl border border-brand-border shadow-xs flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-orange">
              New Enquiries
            </span>
            <MessageSquare className="w-4 h-4 text-brand-orange group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-brand-navy">
              {newEnquiriesCount}
            </span>
            <span className="text-[11px] text-brand-secondary">uncontacted requests</span>
          </div>
          <Link
            to="/admin/enquiries"
            className="text-[11px] font-bold text-brand-navy hover:underline mt-3 inline-flex items-center gap-1"
          >
            <span>Process enquiries</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </motion.div>

        {/* KPI 6: Completed Repairs */}
        <motion.div
          variants={fadeInUp}
          {...cardHoverProps}
          className="bg-white p-5 rounded-3xl border border-brand-border shadow-xs flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Completed Repairs
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-brand-navy">
              {completedCount}
            </span>
            <span className="text-[11px] text-brand-secondary">devices returned</span>
          </div>
          <Link
            to="/admin/repairs?status=completed"
            className="text-[11px] font-bold text-emerald-700 hover:underline mt-3 inline-flex items-center gap-1"
          >
            <span>View completed</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </motion.div>

        {/* KPI 7: Payments Received */}
        <motion.div
          variants={fadeInUp}
          {...cardHoverProps}
          className="bg-white p-5 rounded-3xl border border-brand-border shadow-xs flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Payments Received
            </span>
            <CreditCard className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-brand-navy">
              {formatPaiseToINR(totalPaymentsReceivedPaise)}
            </div>
            <div className="text-[10px] text-brand-secondary mt-0.5">
              Verified collections ({filteredPayments.length} txns)
            </div>
          </div>
          <Link
            to="/admin/payments"
            className="text-[11px] font-bold text-emerald-700 hover:underline mt-3 inline-flex items-center gap-1"
          >
            <span>Payment ledger</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </motion.div>

        {/* KPI 8: Outstanding Balance */}
        <motion.div
          variants={fadeInUp}
          {...cardHoverProps}
          className="bg-white p-5 rounded-3xl border border-brand-border shadow-xs flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
              Outstanding Balance
            </span>
            <TrendingUp className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-600">
              {formatPaiseToINR(totalOutstandingBalancePaise)}
            </div>
            <div className="text-[10px] text-brand-secondary mt-0.5">
              Unpaid customer invoices
            </div>
          </div>
          <Link
            to="/admin/invoices?status=unpaid"
            className="text-[11px] font-bold text-rose-700 hover:underline mt-3 inline-flex items-center gap-1"
          >
            <span>View receivables</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </motion.div>
      </motion.div>

      {/* Low Stock Warning Banner if any */}
      {lowStockProducts.length > 0 && (
        <motion.div
          variants={fadeInUp}
          className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-2.5 text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold block">
                Low Inventory Alert: {lowStockProducts.length} product(s) below threshold
              </span>
              <span className="text-amber-800">
                {lowStockProducts.map((p) => `${p.name} (${p.quantityAvailable} left)`).join(', ')}
              </span>
            </div>
          </div>
          <Link to="/admin/inventory" className="shrink-0">
            <Button size="sm" variant="outline" className="text-xs bg-white text-amber-900 border-amber-300">
              Manage Stock
            </Button>
          </Link>
        </motion.div>
      )}

      {/* Recent Repairs & Enquiries Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Recent Repair Jobs */}
        <motion.div variants={fadeInUp} className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-brand-navy">Recent Repair Jobs</h2>
              <p className="text-xs text-brand-secondary">Active workbench and counter drop-offs</p>
            </div>
            <Link
              to="/admin/repairs"
              className="text-xs font-bold text-brand-orange hover:underline inline-flex items-center gap-1"
            >
              <span>View all ({repairs.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden">
            {filteredRepairs.length === 0 ? (
              <div className="p-8 text-center text-xs text-brand-secondary">
                <Inbox className="w-8 h-8 text-brand-secondary/40 mx-auto mb-2" />
                No repair jobs recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-brand-border text-xs">
                {filteredRepairs.slice(0, 5).map((job) => (
                  <Link
                    key={job.id}
                    to={`/admin/repairs/${job.id}`}
                    className="p-4 flex items-center justify-between hover:bg-brand-light transition-colors group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-brand-navy group-hover:text-brand-orange transition-colors">
                          {job.jobNumber}
                        </span>
                        <StatusBadge status={job.status} size="sm" />
                      </div>
                      <div className="font-semibold text-brand-text">
                        {job.brand} {job.model} &bull; <span className="font-normal text-brand-secondary">{job.customerName}</span>
                      </div>
                      <div className="text-[11px] text-brand-secondary truncate max-w-sm">
                        {job.reportedProblem}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[11px] text-brand-secondary">
                        {formatDate(job.receivedAt)}
                      </div>
                      <ChevronRight className="w-4 h-4 text-brand-secondary group-hover:text-brand-navy group-hover:translate-x-1 transition-all mt-1 ml-auto" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Column (5 cols): Recent Customer Enquiries */}
        <motion.div variants={fadeInUp} className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-brand-navy">Recent Enquiries</h2>
              <p className="text-xs text-brand-secondary">Incoming website requests</p>
            </div>
            <Link
              to="/admin/enquiries"
              className="text-xs font-bold text-brand-orange hover:underline inline-flex items-center gap-1"
            >
              <span>View all ({enquiries.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden">
            {filteredEnquiries.length === 0 ? (
              <div className="p-8 text-center text-xs text-brand-secondary">
                <Inbox className="w-8 h-8 text-brand-secondary/40 mx-auto mb-2" />
                No online enquiries received yet.
              </div>
            ) : (
              <div className="divide-y divide-brand-border text-xs">
                {filteredEnquiries.slice(0, 5).map((enq) => (
                  <div key={enq.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-brand-navy">
                        {enq.publicReference}
                      </span>
                      <StatusBadge status={enq.status} type="enquiry" size="sm" />
                    </div>

                    <div>
                      <div className="font-semibold text-brand-text">
                        {enq.customerName} &bull; <span className="font-normal text-brand-secondary">{formatPhoneNumber(enq.phone)}</span>
                      </div>
                      <div className="text-[11px] text-brand-secondary">
                        Device: {enq.brand} {enq.model} &bull; {enq.problemCategory}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-brand-secondary">
                        {formatDateTime(enq.createdAt)}
                      </span>
                      <div className="flex items-center gap-2">
                        <a
                          href={createWhatsAppUrl(`Hello ${enq.customerName}, this is Mobile Repairing House regarding enquiry ${enq.publicReference}.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>
                        <Link
                          to={`/admin/repairs/new?enquiryId=${enq.id}`}
                          className="text-[11px] font-bold text-brand-orange hover:underline"
                        >
                          Convert &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

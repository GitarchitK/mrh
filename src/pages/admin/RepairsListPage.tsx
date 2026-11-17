import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench,
  Search,
  PlusCircle,
  Filter,
  Phone,
  Clock,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { getRepairJobs } from '../../services/db';
import { RepairJob, RepairStatus, RepairPriority } from '../../types';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { formatDate, formatDateTime, formatPhoneNumber } from '../../lib/utils';
import { fadeInUp, staggerContainer } from '../../lib/animations';

export const RepairsListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const [repairs, setRepairs] = useState<RepairJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const loadData = async () => {
    setLoading(true);
    const list = await getRepairJobs();
    setRepairs(list);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = repairs.filter((job) => {
    const matchesSearch =
      job.jobNumber.toLowerCase().includes(search.toLowerCase()) ||
      job.customerName.toLowerCase().includes(search.toLowerCase()) ||
      job.customerPhone.includes(search) ||
      job.brand.toLowerCase().includes(search.toLowerCase()) ||
      job.model.toLowerCase().includes(search.toLowerCase()) ||
      (job.imeiOrSerial && job.imeiOrSerial.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight">
              Repair Jobs
            </h1>
            <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
          </div>
          <p className="text-xs text-brand-secondary mt-0.5">
            Workbench management, device statuses, and customer pickup tracking.
          </p>
        </div>

        <Link to="/admin/repairs/new">
          <Button size="sm" variant="glow" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
            New Counter Intake
          </Button>
        </Link>
      </motion.div>

      {/* Filter & Search Bar */}
      <motion.div
        variants={fadeInUp}
        className="bg-white p-4 rounded-3xl border border-brand-border shadow-xs flex flex-col sm:flex-row gap-3"
      >
        <div className="flex-1">
          <Input
            placeholder="Search by job number (e.g. MRH-2026-1042), customer name, phone, or model..."
            enableVoice
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-52">
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setSearchParams({ status: e.target.value });
            }}
          >
            <option value="all">All Statuses</option>
            <option value="received">Received</option>
            <option value="diagnosing">Diagnosing</option>
            <option value="estimate_sent">Estimate Sent</option>
            <option value="awaiting_approval">Awaiting Approval</option>
            <option value="approved">Approved</option>
            <option value="in_repair">In Repair</option>
            <option value="ready_for_collection">Ready for Collection</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
            <option value="unrepairable">Unrepairable</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>

        <div className="w-full sm:w-36">
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </Select>
        </div>
      </motion.div>

      {/* Jobs List */}
      <motion.div
        variants={fadeInUp}
        className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden"
      >
        {loading ? (
          <div className="p-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-xs text-brand-secondary">
            No repair jobs match your search criteria.
          </div>
        ) : (
          <div className="divide-y divide-brand-border text-xs">
            {filtered.map((job) => (
              <Link
                key={job.id}
                to={`/admin/repairs/${job.id}`}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-brand-light/50 transition-colors group"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono font-black text-brand-navy group-hover:text-brand-orange transition-colors text-sm">
                      {job.jobNumber}
                    </span>
                    <StatusBadge status={job.status} size="sm" />
                    {job.priority === 'urgent' && (
                      <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full text-[10px] uppercase">
                        Urgent
                      </span>
                    )}
                    <span className="text-[11px] text-brand-secondary">
                      Intake: {formatDate(job.receivedAt)}
                    </span>
                  </div>

                  <div className="font-bold text-sm text-brand-navy">
                    {job.brand} {job.model} &bull; <span className="font-normal text-brand-text">{job.customerName}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-brand-secondary text-[11px]">
                    <span className="flex items-center gap-1 font-semibold text-brand-text">
                      <Phone className="w-3 h-3 text-brand-orange" />
                      <span>{formatPhoneNumber(job.customerPhone)}</span>
                    </span>
                    <span>&bull;</span>
                    <span className="truncate max-w-md">Problem: {job.reportedProblem}</span>
                    {job.assignedTechnicianName && (
                      <>
                        <span>&bull;</span>
                        <span>Tech: {job.assignedTechnicianName}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 sm:text-right">
                  {job.expectedCompletionAt && (
                    <div className="text-[11px] text-brand-secondary hidden md:block">
                      <span>Ready by:</span>
                      <div className="font-semibold text-brand-navy">
                        {formatDate(job.expectedCompletionAt)}
                      </div>
                    </div>
                  )}

                  <ChevronRight className="w-5 h-5 text-brand-secondary group-hover:text-brand-navy group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

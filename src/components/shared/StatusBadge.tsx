import React from 'react';
import { cn } from '../../lib/utils';
import { RepairStatus, InvoiceStatus, EstimateStatus, EnquiryStatus } from '../../types';

interface StatusBadgeProps {
  status: RepairStatus | InvoiceStatus | EstimateStatus | EnquiryStatus | string;
  type?: 'repair' | 'invoice' | 'estimate' | 'enquiry';
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  size = 'md',
}) => {
  const getBadgeConfig = () => {
    switch (status) {
      // Repair Job Statuses
      case 'received':
        return { label: 'Received', color: 'bg-blue-50 text-blue-700 border-blue-200/80', isLive: false };
      case 'diagnosing':
        return { label: 'Diagnosing', color: 'bg-purple-50 text-purple-700 border-purple-200/80', isLive: true, dotColor: 'bg-purple-500' };
      case 'estimate_sent':
        return { label: 'Estimate Sent', color: 'bg-amber-50 text-amber-700 border-amber-200/80', isLive: false };
      case 'awaiting_approval':
        return { label: 'Awaiting Approval', color: 'bg-amber-100 text-amber-800 border-amber-300 font-semibold', isLive: true, dotColor: 'bg-amber-500' };
      case 'approved':
        return { label: 'Approved', color: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', isLive: false };
      case 'in_repair':
        return { label: 'In Repair', color: 'bg-indigo-50 text-indigo-700 border-indigo-200/90 font-semibold shadow-2xs', isLive: true, dotColor: 'bg-indigo-600' };
      case 'ready_for_collection':
        return { label: 'Ready for Collection', color: 'bg-brand-orange-light text-brand-orange border-brand-orange/40 font-bold shadow-2xs', isLive: true, dotColor: 'bg-brand-orange' };
      case 'completed':
        return { label: 'Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 font-medium', isLive: false };
      case 'on_hold':
        return { label: 'On Hold', color: 'bg-slate-100 text-slate-700 border-slate-300', isLive: false };
      case 'unrepairable':
        return { label: 'Unrepairable', color: 'bg-rose-50 text-rose-700 border-rose-200/80', isLive: false };
      case 'cancelled':
        return { label: 'Cancelled', color: 'bg-gray-100 text-gray-600 border-gray-200', isLive: false };

      // Invoices
      case 'paid':
        return { label: 'Paid in Full', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold', isLive: false };
      case 'partial':
        return { label: 'Partially Paid', color: 'bg-amber-50 text-amber-700 border-amber-200', isLive: false };
      case 'unpaid':
        return { label: 'Unpaid', color: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold', isLive: false };
      case 'draft':
        return { label: 'Draft', color: 'bg-slate-100 text-slate-700 border-slate-200', isLive: false };

      // Enquiries
      case 'new':
        return { label: 'New Enquiry', color: 'bg-brand-orange-light text-brand-orange border-brand-orange/30 font-semibold', isLive: true, dotColor: 'bg-brand-orange' };
      case 'contacted':
        return { label: 'Contacted', color: 'bg-blue-50 text-blue-700 border-blue-200', isLive: false };
      case 'converted':
        return { label: 'Converted to Job', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold', isLive: false };

      default:
        return { label: status.replace(/_/g, ' '), color: 'bg-slate-100 text-slate-700 border-slate-200', isLive: false };
    }
  };

  const { label, color, isLive, dotColor } = getBadgeConfig();
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2.5 py-0.5' : 'text-xs px-3 py-1';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium tracking-wide capitalize select-none transition-all duration-200',
        sizeClasses,
        color,
        className
      )}
    >
      {isLive && dotColor ? (
        <span className="relative flex h-2 w-2 mr-1.5">
          <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', dotColor)} />
          <span className={cn('relative inline-flex rounded-full h-2 w-2', dotColor)} />
        </span>
      ) : (
        <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      )}
      {label}
    </span>
  );
};

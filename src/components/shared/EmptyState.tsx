import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'text-center py-12 px-4 rounded-xl border border-dashed border-brand-border bg-white/50 flex flex-col items-center justify-center',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center text-brand-secondary mb-4 border border-brand-border">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-base font-bold text-brand-navy">{title}</h4>
      <p className="text-sm text-brand-secondary max-w-sm mt-1.5">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" variant="outline" className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

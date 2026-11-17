import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, glass, hoverEffect = false, children, ...props }) => (
  <div
    className={cn(
      'rounded-2xl border border-brand-border/80 overflow-hidden transition-all duration-300',
      glass ? 'glass-card shadow-premium' : 'bg-white shadow-2xs',
      hoverEffect && 'hover:shadow-card-hover hover:border-brand-navy/30 hover:-translate-y-1',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn('p-5 sm:p-6 border-b border-brand-border/60', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...props }) => (
  <h3 className={cn('text-lg font-bold text-brand-navy tracking-tight', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, children, ...props }) => (
  <p className={cn('text-sm text-brand-secondary mt-1', className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn('p-5 sm:p-6', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn('p-5 sm:p-6 pt-0 border-t border-brand-border/50 bg-brand-light/40 flex items-center', className)} {...props}>
    {children}
  </div>
);

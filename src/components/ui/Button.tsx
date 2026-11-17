import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const baseStyles = 'relative inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-xl cursor-pointer select-none overflow-hidden';

    const variants = {
      primary: 'bg-brand-orange hover:bg-brand-orange-hover text-white focus:ring-brand-orange shadow-md hover:shadow-glow-orange active:scale-[0.98]',
      glow: 'bg-gradient-to-r from-brand-orange to-[#FF7A66] text-white hover:brightness-105 focus:ring-brand-orange shadow-glow-orange animate-pulse-glow active:scale-[0.98]',
      secondary: 'bg-brand-navy hover:bg-brand-navy-light text-white focus:ring-brand-navy shadow-md hover:shadow-glow-navy active:scale-[0.98]',
      outline: 'border border-brand-border bg-white text-brand-text hover:bg-brand-muted hover:border-brand-navy/40 focus:ring-brand-navy shadow-2xs hover:shadow-xs active:scale-[0.98]',
      ghost: 'bg-transparent text-brand-navy hover:bg-brand-light/80 hover:text-brand-orange focus:ring-brand-navy',
      danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-md active:scale-[0.98]',
    };

    const sizes = {
      sm: 'text-xs px-3.5 py-1.5 gap-1.5',
      md: 'text-sm px-4.5 py-2.5 gap-2',
      lg: 'text-base px-6 py-3.5 gap-2.5 font-bold',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
        whileHover={{ y: disabled || isLoading ? 0 : -1 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...(props as unknown as HTMLMotionProps<'button'>)}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0 transition-transform duration-200">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex shrink-0 transition-transform duration-200">{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

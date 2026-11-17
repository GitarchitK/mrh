import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { createWhatsAppUrl } from '../../lib/whatsapp';
import { cn } from '../../lib/utils';

interface WhatsAppButtonProps {
  message?: string;
  label?: string;
  variant?: 'primary' | 'outline' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  message = 'Hello Debasish, I would like to enquire about phone repair at Mobile Repairing House, Dunlop.',
  label = 'Chat on WhatsApp',
  variant = 'primary',
  size = 'md',
  className,
}) => {
  const url = createWhatsAppUrl(message);

  const variants = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-emerald-500/25',
    outline: 'border border-emerald-600/70 text-emerald-700 bg-white hover:bg-emerald-50/80 shadow-2xs',
    subtle: 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100/90 border border-emerald-200/60',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-4.5 py-2.5 gap-2 font-semibold',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-bold',
  };

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 select-none cursor-pointer',
        variants[variant],
        sizes[size],
        className
      )}
    >
      <MessageSquare className="w-4 h-4 shrink-0 fill-current" />
      <span>{label}</span>
    </motion.a>
  );
};

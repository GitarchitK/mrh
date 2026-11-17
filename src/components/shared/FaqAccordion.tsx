import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { accordionVariants } from '../../lib/animations';

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
  className?: string;
}

export const FaqAccordion: React.FC<FaqAccordionProps> = ({ items, className }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className={cn('space-y-3.5', className)}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
              isOpen
                ? 'bg-white border-brand-orange/40 shadow-sm'
                : 'bg-white/80 border-brand-border hover:border-brand-navy/30 hover:bg-white'
            }`}
          >
            <button
              type="button"
              onClick={() => toggleItem(index)}
              className="w-full p-5 text-left flex items-start justify-between gap-4 cursor-pointer focus:outline-none"
            >
              <span className="font-bold text-sm sm:text-base text-brand-navy flex items-start gap-3">
                <HelpCircle className={cn('w-4 h-4 shrink-0 mt-0.5 transition-colors', isOpen ? 'text-brand-orange' : 'text-brand-secondary')} />
                <span>{item.question}</span>
              </span>

              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className={cn('p-1 rounded-lg shrink-0 transition-colors', isOpen ? 'bg-brand-orange-light text-brand-orange' : 'text-brand-secondary')}
              >
                <ChevronDown className="w-4 h-4" />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  variants={accordionVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pt-1 pl-12 text-xs sm:text-sm text-brand-secondary leading-relaxed border-t border-brand-border/40">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};

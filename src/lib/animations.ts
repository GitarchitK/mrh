import { Variants, TargetAndTransition } from 'framer-motion';

/**
 * Common Framer Motion animation variants for Mobile Repairing House.
 * Designed for high-performance 60fps hardware-accelerated transitions.
 */

// Staggered Container for Lists and Grids
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const staggerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

// Fade In and Slide Up (Hero, Section Headers, Cards)
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

// Scale In (Modals, Badges, CTA highlights)
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    transition: { duration: 0.2 },
  },
};

// Accordion Expand/Collapse for FAQs
export const accordionVariants: Variants = {
  collapsed: {
    opacity: 0,
    height: 0,
    transition: {
      height: { duration: 0.25, ease: [0.04, 0.62, 0.23, 0.98] },
      opacity: { duration: 0.2 },
    },
  },
  expanded: {
    opacity: 1,
    height: 'auto',
    transition: {
      height: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] },
      opacity: { duration: 0.25, delay: 0.05 },
    },
  },
};

// Interactive Card Hover Props
export const cardHoverProps: {
  whileHover: TargetAndTransition;
  whileTap: TargetAndTransition;
} = {
  whileHover: {
    y: -6,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
  whileTap: { scale: 0.98 },
};

// Button Press Feedback
export const buttonTapProps: {
  whileHover: TargetAndTransition;
  whileTap: TargetAndTransition;
} = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.96 },
};

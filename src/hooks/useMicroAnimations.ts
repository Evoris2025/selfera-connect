import { Variants, Transition } from 'framer-motion';

// GPU-friendly spring transitions
export const springTransitions = {
  snappy: { type: 'spring', stiffness: 500, damping: 30 } as Transition,
  bouncy: { type: 'spring', stiffness: 400, damping: 15 } as Transition,
  smooth: { type: 'spring', stiffness: 300, damping: 25 } as Transition,
  gentle: { type: 'spring', stiffness: 200, damping: 20 } as Transition,
  elastic: { type: 'spring', stiffness: 600, damping: 12, mass: 0.8 } as Transition,
};

// Button press animations
export const buttonPressVariants: Variants = {
  rest: { scale: 1 },
  pressed: { scale: 0.92 },
  hover: { scale: 1.02 },
};

export const buttonPressTransition: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 25,
  mass: 0.5,
};

// Icon button with spring back
export const iconButtonVariants: Variants = {
  rest: { scale: 1, rotate: 0 },
  pressed: { scale: 0.85 },
  hover: { scale: 1.1 },
  tap: { scale: 0.9 },
};

// Modal animations
export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalContentVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.92, 
    y: 20,
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 10,
  },
};

export const modalTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
  mass: 0.8,
};

// Carousel snap animations
export const carouselSnapTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 1,
};

// Reaction burst particles generator
export interface BurstParticle {
  id: number;
  angle: number;
  distance: number;
  scale: number;
  delay: number;
  color?: string;
}

export function generateBurstParticles(count: number = 12, color?: string): BurstParticle[] {
  const particles: BurstParticle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      id: Date.now() + i,
      angle: (360 / count) * i + (Math.random() - 0.5) * 20,
      distance: 25 + Math.random() * 15,
      scale: 0.3 + Math.random() * 0.5,
      delay: i * 0.015,
      color,
    });
  }
  return particles;
}

// Staggered children animation
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: springTransitions.snappy,
  },
  exit: { 
    opacity: 0, 
    y: -5, 
    scale: 0.98,
  },
};

// Hover scale with spring
export const hoverScaleVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.98 },
};

// Fade slide variants
export const fadeSlideUpVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const fadeSlideDownVariants: Variants = {
  hidden: { opacity: 0, y: -15 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
};

// Pulse animation for notifications/badges
export const pulseVariants: Variants = {
  pulse: {
    scale: [1, 1.15, 1],
    transition: {
      duration: 0.4,
      ease: 'easeInOut',
    },
  },
};

// Shake animation for errors
export const shakeVariants: Variants = {
  shake: {
    x: [0, -8, 8, -6, 6, -3, 3, 0],
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
};

// Success checkmark animation
export const successCheckVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { 
    pathLength: 1, 
    opacity: 1,
    transition: {
      pathLength: { duration: 0.4, ease: 'easeOut' },
      opacity: { duration: 0.1 },
    },
  },
};

// Floating animation for subtle movement
export const floatVariants: Variants = {
  float: {
    y: [0, -5, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Ring pulse for avatars/notifications
export const ringPulseVariants: Variants = {
  pulse: {
    scale: [1, 1.15, 1],
    opacity: [0.6, 0.3, 0.6],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

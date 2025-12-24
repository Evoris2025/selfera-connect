import { forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface FloatingActionBarProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  position?: 'bottom' | 'right' | 'left';
  variant?: 'glass' | 'solid' | 'transparent';
}

const FloatingActionBar = forwardRef<HTMLDivElement, FloatingActionBarProps>(
  ({ className, children, position = 'bottom', variant = 'glass', ...props }, ref) => {
    const positionClasses = {
      bottom: 'absolute bottom-4 left-4 right-4',
      right: 'absolute right-4 top-1/2 -translate-y-1/2 flex-col',
      left: 'absolute left-4 top-1/2 -translate-y-1/2 flex-col',
    };

    const variantClasses = {
      glass: 'glass-floating rounded-2xl px-4 py-3',
      solid: 'bg-card/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-elevated',
      transparent: 'bg-transparent',
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: position === 'bottom' ? 20 : 0, x: position === 'right' ? 20 : position === 'left' ? -20 : 0 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className={cn(
          'flex items-center gap-4 z-20',
          positionClasses[position],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

FloatingActionBar.displayName = 'FloatingActionBar';

export { FloatingActionBar };

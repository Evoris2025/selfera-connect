import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'heavy' | 'floating' | 'card';
  hover?: boolean;
  press?: boolean;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', hover = false, press = false, children, ...props }, ref) => {
    const variantClasses = {
      default: 'glass',
      subtle: 'glass-subtle',
      heavy: 'glass-heavy',
      floating: 'glass-floating',
      card: 'glass-card',
    };

    return (
      <div
        ref={ref}
        className={cn(
          variantClasses[variant],
          'border border-border/30',
          hover && 'hover-lift',
          press && 'press-effect',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export { GlassCard };

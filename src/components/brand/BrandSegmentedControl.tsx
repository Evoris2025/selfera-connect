import { cn } from '@/lib/utils';

export interface BrandSegmentedItem<T extends string> {
  value: T;
  label: string;
  /** Optional inline count rendered as a muted span next to the label. */
  count?: number;
  disabled?: boolean;
}

interface BrandSegmentedControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  items: BrandSegmentedItem<T>[];
  className?: string;
  ariaLabel?: string;
}

/**
 * Slim outline-only segmented control. Active tab is shown via a 1px gradient
 * outline (mask trick) plus brand-gradient text. Inactive tabs are transparent
 * with a soft white border. NO filled pills, ever.
 */
export function BrandSegmentedControl<T extends string>({
  value,
  onChange,
  items,
  className,
  ariaLabel,
}: BrandSegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn('flex items-center gap-2 mb-4', className)}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={item.disabled}
            onClick={() => onChange(item.value)}
            className={cn(
              'relative flex-1 h-9 rounded-full text-body font-semibold tracking-tight',
              'flex items-center justify-center gap-1.5',
              'transition-colors duration-150',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              !active &&
                'border border-white/10 text-white/60 hover:text-white hover:border-white/20 bg-transparent',
              active && 'bg-transparent',
            )}
            style={
              active
                ? {
                    // 1px gradient ring via background-clip mask trick
                    backgroundImage:
                      'linear-gradient(hsl(var(--background)), hsl(var(--background))), linear-gradient(90deg, hsl(var(--gradient-start)), hsl(var(--gradient-mid)), hsl(var(--gradient-end)))',
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'padding-box, border-box',
                    border: '1px solid transparent',
                  }
                : undefined
            }
          >
            <span className={cn(active && 'text-gradient-brand')}>{item.label}</span>
            {typeof item.count === 'number' && (
              <span
                className={cn(
                  'text-label font-medium tabular-nums',
                  active ? 'text-white/70' : 'text-white/40',
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

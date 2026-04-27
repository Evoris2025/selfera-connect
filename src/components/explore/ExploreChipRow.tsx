import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ExploreChip {
  id: string;
  label: string;
}

interface ExploreChipRowProps {
  chips: ExploreChip[];
  value: string;
  onChange: (id: string) => void;
  ariaLabel?: string;
}

/**
 * Quiet text-only sub-tab strip with an animated 2px gradient underline.
 * - No borders, no fills, no rings.
 * - Inactive: text-white/45. Active: text-gradient-brand + gradient underline.
 * - Horizontal scroll, scrollbar hidden.
 */
export function ExploreChipRow({ chips, value, onChange, ariaLabel }: ExploreChipRowProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = React.useState<{ left: number; width: number } | null>(null);

  const measure = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const activeBtn = container.querySelector<HTMLButtonElement>(`[data-chip-id="${value}"]`);
    if (!activeBtn) return;
    setIndicator({ left: activeBtn.offsetLeft, width: activeBtn.offsetWidth });
  }, [value]);

  React.useLayoutEffect(() => {
    measure();
  }, [measure, chips]);

  React.useEffect(() => {
    const handle = () => measure();
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, [measure]);

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label={ariaLabel}
      className="relative flex items-center gap-5 px-4 py-2.5 overflow-x-auto scrollbar-hide"
    >
      {chips.map((chip) => {
        const active = chip.id === value;
        return (
          <button
            key={chip.id}
            type="button"
            role="tab"
            aria-selected={active}
            data-chip-id={chip.id}
            onClick={() => onChange(chip.id)}
            className={cn(
              'flex-shrink-0 py-1.5 bg-transparent',
              'text-[11px] uppercase tracking-[0.1em] font-medium',
              'transition-colors duration-150',
              active ? 'text-gradient-brand' : 'text-white/45 hover:text-white/70',
            )}
          >
            {chip.label}
          </button>
        );
      })}
      <span
        aria-hidden
        className="absolute bottom-0 h-[2px] gradient-brand rounded-full pointer-events-none transition-all duration-150 ease-out"
        style={{
          left: indicator?.left ?? 0,
          width: indicator?.width ?? 0,
          opacity: indicator ? 1 : 0,
        }}
      />
    </div>
  );
}

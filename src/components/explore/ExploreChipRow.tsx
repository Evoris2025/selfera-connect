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
 * TikTok-style horizontal chip row.
 * - Always visible, horizontal scroll, no scrollbar.
 * - Outline-only chips. Active chip = brighter border + gradient text. No fill.
 */
export function ExploreChipRow({ chips, value, onChange, ariaLabel }: ExploreChipRowProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-3"
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
              'flex-shrink-0 border rounded-full px-3 py-1.5',
              'text-[11px] uppercase tracking-[0.1em] font-medium',
              'transition-colors duration-150 bg-transparent',
              active
                ? 'border-white/40 text-gradient-brand'
                : 'border-white/[0.15] text-white/55 hover:border-white/25 hover:text-white/75',
            )}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}

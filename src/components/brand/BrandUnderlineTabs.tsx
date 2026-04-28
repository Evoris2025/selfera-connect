import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BrandUnderlineTab {
  id: string;
  label: string;
}

interface BrandUnderlineTabsProps {
  tabs: BrandUnderlineTab[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
  ariaLabel?: string;
}

/**
 * Underline-style tab bar for screen-level tab contexts (Profile, Explore, etc.).
 * C2 spec:
 *   - No outer border, no pill.
 *   - Label: text-label uppercase tracking-[0.1em] text-white/45 px-3 py-2.
 *   - Active: gradient text + 2px brand-gradient underline.
 *   - 150ms transition on underline position.
 *
 * For pill-style sheet-scoped switches use <BrandSegmentedControl>.
 */
export function BrandUnderlineTabs({
  tabs,
  value,
  onChange,
  className,
  ariaLabel,
}: BrandUnderlineTabsProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = React.useState<{ left: number; width: number } | null>(null);

  const measure = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const activeBtn = container.querySelector<HTMLButtonElement>(
      `[data-tab-id="${value}"]`,
    );
    if (!activeBtn) return;
    // Use offsetLeft/offsetWidth relative to the container (which is the offsetParent
    // since it's `relative`). This avoids any padding/transform mismatch from getBoundingClientRect.
    setIndicator({ left: activeBtn.offsetLeft, width: activeBtn.offsetWidth });
  }, [value]);

  React.useLayoutEffect(() => {
    measure();
  }, [measure, tabs]);

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
      className={cn(
        'relative flex w-full items-end gap-2',
        className,
      )}
    >
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            data-tab-id={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex-1 min-w-0 justify-center inline-flex',
              // Responsive label clamp keeps the longest token (e.g. "EXPRESSIONS")
              // legible without clipping in the 28rem column. tracking-tight lets
              // uppercase nav labels breathe inside narrow flex cells.
              'px-1 py-2 text-[clamp(0.6875rem,0.625rem+0.4vw,0.8125rem)] uppercase tracking-tight font-medium truncate',
              'transition-colors duration-150',
              'outline-none focus:outline-none focus-visible:outline-none',
              active ? 'text-gradient-brand' : 'text-white/45 hover:text-white/70',
            )}
          >
            {tab.label}
          </button>
        );
      })}
      {/* Animated 2px gradient underline */}
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

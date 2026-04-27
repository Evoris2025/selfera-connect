import { cn } from '@/lib/utils';

/**
 * Round 1 — Trending topic chips for the Explore tab.
 *
 * Sits between the search bar and BrandUnderlineTabs. Single-select; tapping
 * the active chip clears it. Selection state is owned by the parent
 * (Explore.tsx) and reset on tab switch.
 *
 * Theming: chips use the active user theme color via `hsl(var(--primary))`
 * (the project's canonical theme token — there is no `--theme-primary`).
 */

export const TRENDING_TOPICS = [
  'Healing',
  'Recovery',
  'Mindfulness',
  'Self-care',
  'Anxiety',
  'Sleep',
  'Community wins',
  'Boundaries',
  'Therapy',
  'Journaling',
] as const;

export type TrendingTopic = (typeof TRENDING_TOPICS)[number];

interface ExploreTopicChipsProps {
  selected: string | null;
  onSelect: (topic: string | null) => void;
}

export function ExploreTopicChips({ selected, onSelect }: ExploreTopicChipsProps) {
  return (
    <div
      role="listbox"
      aria-label="Trending topics"
      className="flex gap-2 overflow-x-auto px-4 py-1 scrollbar-hide"
    >
      {TRENDING_TOPICS.map((topic) => {
        const active = selected === topic;
        return (
          <button
            key={topic}
            type="button"
            role="option"
            aria-selected={active}
            onClick={() => onSelect(active ? null : topic)}
            className={cn(
              'min-h-[32px] inline-flex items-center whitespace-nowrap rounded-full px-4 py-2',
              'text-xs font-medium uppercase tracking-[0.08em] transition-colors',
              active
                ? 'border border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] text-white'
                : 'border border-white/[0.08] bg-transparent text-white/70 hover:border-white/20',
            )}
          >
            <span>{topic}</span>
            {active && (
              <span
                aria-hidden
                className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))]"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

import { useState, useMemo, type ReactNode } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import {
  BrandSheetContent,
  BrandSheetTitle,
} from '@/components/ui/sheet-system';
import { BrandSectionLabel } from '@/components/brand';
import { useThemeColor } from '@/hooks/useThemeColor';
import { cn } from '@/lib/utils';
import type { VerificationTier } from './ExploreVerifiedTick';

export type ExploreTab = 'expressions' | 'videos' | 'images' | 'posts';

// Legacy exports kept for backward-compat — no longer used in the new sheet.
export type FilterType = 'trending' | 'popular' | 'viewed' | 'newest' | 'oldest';
export type DateRange = '7d' | '30d' | 'all';

// ----- Filter shape -----

export type SortBy = 'for-you' | 'following' | 'trending' | 'most-recent' | 'most-liked';
export type TimePeriod =
  | 'all-time'
  | 'today'
  | 'this-week'
  | 'this-month'
  | 'this-year'
  | 'custom';
export type Origin = 'all' | 'follow' | 'communities' | 'verified';
export type Duration = 'all' | 'under-5' | '5-20' | 'over-20';
export type Format = 'all' | 'photos' | 'illustrations';
export type CreatorTier = 'all' | VerificationTier[];

export interface ExpressionsFilters {
  sortBy: SortBy;
  timePeriod: TimePeriod;
  creatorTier: CreatorTier;
  origin: Origin;
}
export interface VideosFilters {
  sortBy: SortBy;
  timePeriod: TimePeriod;
  duration: Duration;
  creatorTier: CreatorTier;
  origin: Origin;
}
export interface ImagesFilters {
  sortBy: SortBy;
  timePeriod: TimePeriod;
  format: Format;
  origin: Origin;
}
export interface PostsFilters {
  sortBy: SortBy;
  timePeriod: TimePeriod;
  creatorTier: CreatorTier;
  origin: Origin;
}

export interface ExploreFiltersState {
  expressions: ExpressionsFilters;
  videos: VideosFilters;
  images: ImagesFilters;
  posts: PostsFilters;
}

export const DEFAULT_FILTERS: ExploreFiltersState = {
  expressions: { sortBy: 'for-you', timePeriod: 'all-time', creatorTier: 'all', origin: 'all' },
  videos: { sortBy: 'for-you', timePeriod: 'all-time', duration: 'all', creatorTier: 'all', origin: 'all' },
  images: { sortBy: 'for-you', timePeriod: 'all-time', format: 'all', origin: 'all' },
  posts: { sortBy: 'for-you', timePeriod: 'all-time', creatorTier: 'all', origin: 'all' },
};

export function isTabFiltersDefault(tab: ExploreTab, filters: ExploreFiltersState): boolean {
  return countActiveFilters(tab, filters) === 0;
}

/**
 * Number of sections set to a non-default value for the given tab.
 * Drives the funnel-icon dot, the header "{N} ACTIVE" pill, and the
 * Reset button's disabled state.
 */
export function countActiveFilters(
  tab: ExploreTab,
  filters: ExploreFiltersState,
): number {
  const a = filters[tab] as unknown as Record<string, unknown>;
  const b = DEFAULT_FILTERS[tab] as unknown as Record<string, unknown>;
  return Object.keys(b).reduce((n, k) => (a[k] !== b[k] ? n + 1 : n), 0);
}

// ----- Option lists -----

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'for-you', label: 'For you' },
  { value: 'following', label: 'Following' },
  { value: 'trending', label: 'Trending' },
  { value: 'most-recent', label: 'Most recent' },
  { value: 'most-liked', label: 'Most liked' },
];

const TIME_OPTIONS: { value: TimePeriod; label: string; disabled?: boolean }[] = [
  { value: 'all-time', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: 'this-week', label: 'This week' },
  { value: 'this-month', label: 'This month' },
  { value: 'this-year', label: 'This year' },
  { value: 'custom', label: 'Custom', disabled: true },
];

const DURATION_OPTIONS: { value: Duration; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'under-5', label: 'Under 5 min' },
  { value: '5-20', label: '5–20 min' },
  { value: 'over-20', label: 'Over 20 min' },
];

const FORMAT_OPTIONS: { value: Format; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'photos', label: 'Photos' },
  { value: 'illustrations', label: 'Illustrations' },
];

const ORIGIN_OPTIONS: { value: Origin; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'follow', label: 'From people I follow' },
  { value: 'communities', label: 'From my communities' },
  { value: 'verified', label: 'Verified creators only' },
];

const TIER_HEX: Record<VerificationTier, string> = {
  orange: '#f97316',
  purple: '#a855f7',
  blue: '#3b82f6',
  green: '#10b981',
  pink: '#ec4899',
};

const TIER_OPTIONS: { value: VerificationTier; label: string }[] = [
  { value: 'orange', label: 'Orange' },
  { value: 'purple', label: 'Purple' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'pink', label: 'Pink' },
];

const TAB_TITLE: Record<ExploreTab, string> = {
  expressions: 'EXPRESSIONS',
  videos: 'VIDEOS',
  images: 'IMAGES',
  posts: 'POSTS',
};

// ----- Chip (Sort / Time / Duration / Format / Origin / Tier) -----

interface ChipProps<T extends string> {
  option: { value: T; label: string; disabled?: boolean };
  active: boolean;
  themePrimary: string;
  onClick: () => void;
  leftDot?: ReactNode;
}

function Chip<T extends string>({ option, active, themePrimary, onClick, leftDot }: ChipProps<T>) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={option.disabled}
      aria-pressed={active}
      className={cn(
        'h-9 px-3 rounded-full text-label uppercase tracking-[0.08em] whitespace-nowrap flex items-center justify-center gap-2 transition-colors',
        active
          ? 'text-white'
          : 'border border-white/[0.15] text-white/55 bg-transparent hover:border-white/30',
        option.disabled && 'opacity-40 pointer-events-none',
      )}
      style={active ? { backgroundColor: themePrimary } : undefined}
    >
      {leftDot}
      {option.label}
    </button>
  );
}

// ----- Public component -----

interface ExploreFiltersProps {
  activeTab: ExploreTab;
  filters: ExploreFiltersState;
  onChange: (next: ExploreFiltersState) => void;
}

export function ExploreFilters({ activeTab, filters, onChange }: ExploreFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { primary: themePrimary } = useThemeColor();

  // Local draft so Reset/Apply can take effect on close.
  const [draft, setDraft] = useState<ExploreFiltersState>(filters);

  const handleOpenChange = (open: boolean) => {
    if (open) setDraft(filters);
    setIsOpen(open);
  };

  const tabSlice = draft[activeTab];

  // Funnel icon dot reflects committed state.
  const committedCount = countActiveFilters(activeTab, filters);
  // Header pill + Reset disabled state reflect the live draft.
  const draftCount = useMemo(
    () => countActiveFilters(activeTab, draft),
    [activeTab, draft],
  );

  const updateTabSlice = <K extends keyof typeof tabSlice>(
    key: K,
    value: (typeof tabSlice)[K],
  ) => {
    setDraft((prev) => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], [key]: value },
    }));
  };

  const handleReset = () => {
    setDraft((prev) => ({ ...prev, [activeTab]: DEFAULT_FILTERS[activeTab] }));
  };

  const handleHeaderPillReset = () => {
    // Header pill: reset both committed and draft for the active tab.
    const next = { ...filters, [activeTab]: DEFAULT_FILTERS[activeTab] };
    setDraft(next);
    onChange(next);
  };

  const handleApply = () => {
    onChange(draft);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Filters"
          data-testid="explore-filter-trigger"
          className="relative h-10 w-10 rounded-full border-white/15 bg-transparent text-white/80 hover:border-white/30 hover:bg-transparent"
        >
          <Filter className="h-4 w-4" />
          {committedCount > 0 && (
            <span
              aria-hidden
              data-testid="explore-filter-active-dot"
              className="absolute top-1 right-1 h-[6px] w-[6px] rounded-full"
              style={{ backgroundColor: themePrimary }}
            />
          )}
        </Button>
      </SheetTrigger>

      {/* Override BrandSheetContent's default px/overflow so we can manage
          sticky header + scrollable body + sticky footer ourselves. */}
      <BrandSheetContent
        maxHeight="90vh"
        hideHandle
        className="!px-0 !pb-0 overflow-hidden flex flex-col h-[90vh]"
      >
        {/* Sticky header */}
        <div className="shrink-0 sticky top-0 z-10 bg-background/95 backdrop-blur px-5 pt-1 pb-3">
          <div
            aria-hidden
            className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-3 mb-4 shrink-0"
          />
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <BrandSheetTitle
                setup="filter"
                emphasis={TAB_TITLE[activeTab]}
                subtitle="Tune what you see in this tab."
              />
            </div>
            {draftCount > 0 && (
              <button
                type="button"
                onClick={handleHeaderPillReset}
                aria-label={`Clear ${draftCount} active filters`}
                className="shrink-0 mt-1 text-caption uppercase tracking-[0.12em] px-2 py-1 rounded-full bg-transparent transition-opacity hover:opacity-80"
                style={{ borderWidth: 1, borderStyle: 'solid', borderColor: themePrimary, color: themePrimary }}
              >
                {draftCount} ACTIVE
              </button>
            )}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Section 1 — Sort by (chip grid, single-select) */}
          <section>
            <BrandSectionLabel className="px-5 mb-2">SORT BY</BrandSectionLabel>
            <div className="grid grid-cols-3 gap-2 px-4">
              {SORT_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  option={opt}
                  active={tabSlice.sortBy === opt.value}
                  themePrimary={themePrimary}
                  onClick={() => updateTabSlice('sortBy', opt.value)}
                />
              ))}
            </div>
          </section>

          {/* Section 2 — Time period (3-col chip grid) */}
          <section>
            <BrandSectionLabel className="px-5 mb-2">TIME PERIOD</BrandSectionLabel>
            <div className="grid grid-cols-3 gap-2 px-4">
              {TIME_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  option={opt}
                  active={tabSlice.timePeriod === opt.value}
                  themePrimary={themePrimary}
                  onClick={() => updateTabSlice('timePeriod', opt.value)}
                />
              ))}
            </div>
          </section>

          {/* Section 3 — Content type (context-aware) */}
          {activeTab === 'videos' && (
            <section>
              <BrandSectionLabel className="px-5 mb-2">DURATION</BrandSectionLabel>
              <div className="grid grid-cols-2 gap-2 px-4">
                {DURATION_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.value}
                    option={opt}
                    active={(draft.videos as VideosFilters).duration === opt.value}
                    themePrimary={themePrimary}
                    onClick={() => updateTabSlice('duration' as never, opt.value as never)}
                  />
                ))}
              </div>
            </section>
          )}
          {activeTab === 'images' && (
            <section>
              <BrandSectionLabel className="px-5 mb-2">FORMAT</BrandSectionLabel>
              <div className="grid grid-cols-3 gap-2 px-4">
                {FORMAT_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.value}
                    option={opt}
                    active={(draft.images as ImagesFilters).format === opt.value}
                    themePrimary={themePrimary}
                    onClick={() => updateTabSlice('format' as never, opt.value as never)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Section — Creator tier (multi-select chip grid). Hidden on Images. */}
          {activeTab !== 'images' && (
            <section>
              <BrandSectionLabel className="px-5 mb-2">CREATOR TIER</BrandSectionLabel>
              <div className="grid grid-cols-3 gap-2 px-4">
                <Chip
                  option={{ value: 'all', label: 'All' }}
                  active={(tabSlice as { creatorTier: CreatorTier }).creatorTier === 'all'}
                  themePrimary={themePrimary}
                  onClick={() => updateTabSlice('creatorTier' as never, 'all' as never)}
                />
                {TIER_OPTIONS.map((opt) => {
                  const current = (tabSlice as { creatorTier: CreatorTier }).creatorTier;
                  const selected = Array.isArray(current) && current.includes(opt.value);
                  return (
                    <Chip
                      key={opt.value}
                      option={opt}
                      active={selected}
                      themePrimary={themePrimary}
                      leftDot={
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: TIER_HEX[opt.value] }}
                          aria-hidden
                        />
                      }
                      onClick={() => {
                        let next: CreatorTier;
                        if (current === 'all') {
                          next = [opt.value];
                        } else {
                          const exists = current.includes(opt.value);
                          const updated = exists
                            ? current.filter((t) => t !== opt.value)
                            : [...current, opt.value];
                          next = updated.length === 0 ? 'all' : updated;
                        }
                        updateTabSlice('creatorTier' as never, next as never);
                      }}
                    />
                  );
                })}
              </div>
            </section>
          )}

          {/* Section 4 — Origin (chip grid, single-select) */}
          <section>
            <BrandSectionLabel className="px-5 mb-2">ORIGIN</BrandSectionLabel>
            <div className="grid grid-cols-3 gap-2 px-4">
              {ORIGIN_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  option={opt}
                  active={tabSlice.origin === opt.value}
                  themePrimary={themePrimary}
                  onClick={() => updateTabSlice('origin', opt.value)}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Sticky footer */}
        <div className="shrink-0 sticky bottom-0 z-10 flex items-center gap-3 px-4 py-3 border-t border-white/[0.08] bg-black pb-[calc(env(safe-area-inset-bottom)+12px)]">
          <button
            type="button"
            onClick={handleReset}
            disabled={draftCount === 0}
            className="flex-1 h-10 rounded-full border border-white/[0.15] bg-transparent text-white/55 text-label uppercase tracking-[0.1em] transition-colors hover:border-white/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-white/[0.15]"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 h-10 rounded-full text-label uppercase tracking-[0.1em] inline-flex items-center justify-center text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: themePrimary }}
          >
            Apply
          </button>
        </div>
      </BrandSheetContent>
    </Sheet>
  );
}

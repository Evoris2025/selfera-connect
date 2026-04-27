import { useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import {
  BrandSheetContent,
  BrandSheetTitle,
  BrandSheetItem,
} from '@/components/ui/sheet-system';
import { BrandSectionLabel } from '@/components/brand';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ExploreTab = 'expressions' | 'videos' | 'images' | 'posts';

// Legacy exports kept for backward-compat — no longer used in the new sheet.
export type FilterType = 'trending' | 'popular' | 'viewed' | 'newest' | 'oldest';
export type DateRange = '7d' | '30d' | 'all';

// ----- Filter shape -----

export type SortBy = 'for-you' | 'following' | 'trending' | 'most-recent' | 'most-liked';
export type TimePeriod = 'all-time' | 'today' | 'this-week' | 'this-month' | 'this-year';
export type Origin = 'all' | 'follow' | 'communities' | 'verified';
export type Duration = 'all' | 'under-5' | '5-20' | 'over-20';
export type Format = 'all' | 'photos' | 'illustrations';

export interface ExpressionsFilters {
  sortBy: SortBy;
  timePeriod: TimePeriod;
  origin: Origin;
}
export interface VideosFilters {
  sortBy: SortBy;
  timePeriod: TimePeriod;
  duration: Duration;
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
  origin: Origin;
}

export interface ExploreFiltersState {
  expressions: ExpressionsFilters;
  videos: VideosFilters;
  images: ImagesFilters;
  posts: PostsFilters;
}

export const DEFAULT_FILTERS: ExploreFiltersState = {
  expressions: { sortBy: 'for-you', timePeriod: 'all-time', origin: 'all' },
  videos: { sortBy: 'for-you', timePeriod: 'all-time', duration: 'all', origin: 'all' },
  images: { sortBy: 'for-you', timePeriod: 'all-time', format: 'all', origin: 'all' },
  posts: { sortBy: 'for-you', timePeriod: 'all-time', origin: 'all' },
};

export function isTabFiltersDefault(tab: ExploreTab, filters: ExploreFiltersState): boolean {
  const a = filters[tab] as Record<string, unknown>;
  const b = DEFAULT_FILTERS[tab] as Record<string, unknown>;
  return Object.keys(b).every((k) => a[k] === b[k]);
}

// ----- Option lists -----

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'for-you', label: 'For you' },
  { value: 'following', label: 'Following' },
  { value: 'trending', label: 'Trending' },
  { value: 'most-recent', label: 'Most recent' },
  { value: 'most-liked', label: 'Most liked' },
];

const TIME_OPTIONS: { value: TimePeriod; label: string }[] = [
  { value: 'all-time', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: 'this-week', label: 'This week' },
  { value: 'this-month', label: 'This month' },
  { value: 'this-year', label: 'This year' },
];

const DURATION_OPTIONS: { value: Duration; label: string }[] = [
  { value: 'all', label: 'All durations' },
  { value: 'under-5', label: 'Under 5 minutes' },
  { value: '5-20', label: '5–20 minutes' },
  { value: 'over-20', label: 'Over 20 minutes' },
];

const FORMAT_OPTIONS: { value: Format; label: string }[] = [
  { value: 'all', label: 'All formats' },
  { value: 'photos', label: 'Photos' },
  { value: 'illustrations', label: 'Illustrations' },
];

const ORIGIN_OPTIONS: { value: Origin; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'follow', label: 'From people I follow' },
  { value: 'communities', label: 'From my communities' },
  { value: 'verified', label: 'Verified creators only' },
];

const TAB_TITLE: Record<ExploreTab, string> = {
  expressions: 'EXPRESSIONS',
  videos: 'VIDEOS',
  images: 'IMAGES',
  posts: 'POSTS',
};

// ----- Active dot -----

function ActiveDot({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      className="inline-block h-[6px] w-[6px] rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

// ----- Section -----

interface SectionProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  themePrimary: string;
}

function FilterSection<T extends string>({
  label,
  options,
  value,
  onChange,
  themePrimary,
}: SectionProps<T>) {
  return (
    <div className="mt-5">
      <BrandSectionLabel className="px-1 mb-2">{label}</BrandSectionLabel>
      <div className="flex flex-col gap-1.5">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <BrandSheetItem
              key={opt.value}
              title={opt.label}
              onClick={() => onChange(opt.value)}
              accentColor={active ? themePrimary : 'rgba(255,255,255,0.12)'}
              right={active ? <ActiveDot color={themePrimary} /> : null}
              ariaLabel={`${label}: ${opt.label}${active ? ' (selected)' : ''}`}
            />
          );
        })}
      </div>
    </div>
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

  // Sync draft when sheet opens.
  const handleOpenChange = (open: boolean) => {
    if (open) setDraft(filters);
    setIsOpen(open);
  };

  const tabSlice = draft[activeTab];
  const hasActive = !isTabFiltersDefault(activeTab, filters);

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
          {hasActive && (
            <span
              aria-hidden
              data-testid="explore-filter-active-dot"
              className="absolute top-1 right-1 h-[6px] w-[6px] rounded-full"
              style={{ backgroundColor: themePrimary }}
            />
          )}
        </Button>
      </SheetTrigger>

      <BrandSheetContent maxHeight="85vh">
        <BrandSheetTitle
          setup="filter"
          emphasis={TAB_TITLE[activeTab]}
          subtitle="Tune what you see in this tab."
        />

        {/* Section 1 — Sort by */}
        <FilterSection
          label="SORT BY"
          options={SORT_OPTIONS}
          value={tabSlice.sortBy}
          onChange={(v) => updateTabSlice('sortBy', v)}
          themePrimary={themePrimary}
        />

        {/* Section 2 — Time period */}
        <FilterSection
          label="TIME PERIOD"
          options={TIME_OPTIONS}
          value={tabSlice.timePeriod}
          onChange={(v) => updateTabSlice('timePeriod', v)}
          themePrimary={themePrimary}
        />

        {/* Section 3 — Content type (context-aware) */}
        {activeTab === 'videos' && (
          <FilterSection
            label="DURATION"
            options={DURATION_OPTIONS}
            value={(draft.videos as VideosFilters).duration}
            onChange={(v) => updateTabSlice('duration' as never, v as never)}
            themePrimary={themePrimary}
          />
        )}
        {activeTab === 'images' && (
          <FilterSection
            label="FORMAT"
            options={FORMAT_OPTIONS}
            value={(draft.images as ImagesFilters).format}
            onChange={(v) => updateTabSlice('format' as never, v as never)}
            themePrimary={themePrimary}
          />
        )}

        {/* Section 4 — Origin */}
        <FilterSection
          label="ORIGIN"
          options={ORIGIN_OPTIONS}
          value={tabSlice.origin}
          onChange={(v) => updateTabSlice('origin', v)}
          themePrimary={themePrimary}
        />

        {/* Footer — Reset / Apply */}
        <div className="flex items-center gap-2 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="flex-1 rounded-full bg-transparent border-white/15 text-white/55 hover:bg-transparent hover:border-white/30 text-[12px] uppercase tracking-[0.1em] h-10"
          >
            Reset
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleApply}
            className="flex-1 rounded-full bg-transparent text-[12px] uppercase tracking-[0.1em] h-10 hover:bg-transparent"
            style={{ borderColor: themePrimary, color: themePrimary }}
          >
            Apply
          </Button>
        </div>
      </BrandSheetContent>
    </Sheet>
  );
}

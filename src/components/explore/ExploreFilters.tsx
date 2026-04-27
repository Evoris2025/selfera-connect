import { useState } from 'react';
import { Filter, Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import {
  BrandSheetContent,
  BrandSheetTitle,
  BrandSheetSectionLabel,
  BrandSegmentedControl,
} from '@/components/ui/sheet-system';

export type FilterType = 'trending' | 'popular' | 'viewed' | 'newest' | 'oldest';
export type DateRange = '7d' | '30d' | 'all';
export type ExploreTab = 'expressions' | 'videos' | 'images' | 'posts';

interface ExploreFiltersProps {
  activeTab: ExploreTab;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  /** Optional: label to show on the trigger (active chip label for current tab). */
  triggerLabel?: string;
}

const dateRanges: { value: DateRange; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: 'all', label: 'All time' },
];

const TAB_TITLE: Record<ExploreTab, string> = {
  expressions: 'EXPRESSIONS',
  videos: 'VIDEOS',
  images: 'IMAGES',
  posts: 'POSTS',
};

export function ExploreFilters({
  activeTab,
  dateRange,
  onDateRangeChange,
  triggerLabel,
}: ExploreFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const label = triggerLabel || 'Filter';

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-full border-white/15 bg-transparent text-white/80 hover:border-white/30 hover:bg-transparent h-10 px-3"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline text-[12px] uppercase tracking-[0.1em]">{label}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </SheetTrigger>
      <BrandSheetContent maxHeight="60vh">
        <BrandSheetTitle setup="filter" emphasis={TAB_TITLE[activeTab]} subtitle="Tune what you see and when from." />

        <BrandSheetSectionLabel>
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={11} className="text-white/40" />
            Time period
          </span>
        </BrandSheetSectionLabel>
        <BrandSegmentedControl<DateRange>
          value={dateRange}
          onChange={onDateRangeChange}
          ariaLabel="Time period"
          items={dateRanges}
        />

        <Button
          variant="outline"
          className="w-full rounded-full mt-2 bg-transparent border-white/15 text-white hover:bg-transparent hover:border-white/30 text-[12px] uppercase tracking-[0.1em] h-10"
          onClick={() => setIsOpen(false)}
        >
          Apply
        </Button>
      </BrandSheetContent>
    </Sheet>
  );
}

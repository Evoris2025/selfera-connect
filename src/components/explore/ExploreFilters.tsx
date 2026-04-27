import { useState } from 'react';
import { Filter, TrendingUp, Eye, Clock, Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import {
  BrandSheetContent,
  BrandSheetTitle,
  BrandSheetSectionLabel,
  BrandSegmentedControl,
} from '@/components/ui/sheet-system';
import { cn } from '@/lib/utils';

export type FilterType = 'trending' | 'popular' | 'viewed' | 'newest' | 'oldest';
export type DateRange = '7d' | '30d' | 'all';

interface ExploreFiltersProps {
  activeFilter: FilterType;
  dateRange: DateRange;
  onFilterChange: (filter: FilterType) => void;
  onDateRangeChange: (range: DateRange) => void;
}

const filters: { id: FilterType; label: string; icon: React.ReactNode }[] = [
  { id: 'trending', label: 'Trending', icon: <TrendingUp size={16} strokeWidth={1.6} stroke="url(#selfera-brand-gradient)" fill="none" /> },
  { id: 'popular', label: 'Most Popular', icon: <TrendingUp size={16} strokeWidth={1.6} stroke="url(#selfera-brand-gradient)" fill="none" /> },
  { id: 'viewed', label: 'Most Viewed', icon: <Eye size={16} strokeWidth={1.6} stroke="url(#selfera-brand-gradient)" fill="none" /> },
  { id: 'newest', label: 'Newest', icon: <Clock size={16} strokeWidth={1.6} stroke="url(#selfera-brand-gradient)" fill="none" /> },
  { id: 'oldest', label: 'Oldest', icon: <Clock size={16} strokeWidth={1.6} stroke="url(#selfera-brand-gradient)" fill="none" /> },
];

const dateRanges: { value: DateRange; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: 'all', label: 'All time' },
];

export function ExploreFilters({
  activeFilter,
  dateRange,
  onFilterChange,
  onDateRangeChange,
}: ExploreFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFilterLabel = filters.find((f) => f.id === activeFilter)?.label || 'Filter';

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-full border-white/15 bg-transparent text-white/80 hover:border-white/30 hover:bg-transparent h-10 px-3"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline text-[12px] uppercase tracking-[0.1em]">{activeFilterLabel}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </SheetTrigger>
      <BrandSheetContent maxHeight="80vh">
        <BrandSheetTitle setup="filter" emphasis="EXPLORE" subtitle="Tune what you see and when from." />

        <BrandSheetSectionLabel>Sort by</BrandSheetSectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {filters.map((filter) => {
            const active = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => onFilterChange(filter.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-xl text-left',
                  'bg-white/[0.03] border transition-colors',
                  active ? 'border-white/30' : 'border-white/10 hover:border-white/20',
                )}
                style={
                  active
                    ? {
                        backgroundImage:
                          'linear-gradient(hsl(var(--background)), hsl(var(--background))), linear-gradient(90deg, hsl(var(--gradient-start)), hsl(var(--gradient-mid)), hsl(var(--gradient-end)))',
                        backgroundOrigin: 'border-box',
                        backgroundClip: 'padding-box, border-box',
                        border: '1px solid transparent',
                      }
                    : undefined
                }
              >
                {filter.icon}
                <span
                  className={cn(
                    'text-sm font-semibold',
                    active ? 'text-gradient-brand' : 'text-white/80',
                  )}
                >
                  {filter.label}
                </span>
              </button>
            );
          })}
        </div>

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

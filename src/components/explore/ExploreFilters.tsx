import { useState } from 'react';
import { Filter, TrendingUp, Eye, Clock, Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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
  { id: 'trending', label: 'Trending', icon: <TrendingUp className="h-4 w-4" /> },
  { id: 'popular', label: 'Most Popular', icon: <TrendingUp className="h-4 w-4" /> },
  { id: 'viewed', label: 'Most Viewed', icon: <Eye className="h-4 w-4" /> },
  { id: 'newest', label: 'Newest', icon: <Clock className="h-4 w-4" /> },
  { id: 'oldest', label: 'Oldest', icon: <Clock className="h-4 w-4" /> },
];

const dateRanges: { id: DateRange; label: string }[] = [
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: 'all', label: 'All time' },
];

export function ExploreFilters({
  activeFilter,
  dateRange,
  onFilterChange,
  onDateRangeChange,
}: ExploreFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFilterLabel = filters.find(f => f.id === activeFilter)?.label || 'Filter';

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 rounded-xl border-border/50 bg-secondary/50"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">{activeFilterLabel}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader className="text-left">
          <SheetTitle>Filter Content</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Sort By */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Sort by</h3>
            <div className="grid grid-cols-2 gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => {
                    onFilterChange(filter.id);
                  }}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-xl border transition-all',
                    activeFilter === filter.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  {filter.icon}
                  <span className="text-sm font-medium">{filter.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Time period
            </h3>
            <div className="flex gap-2">
              {dateRanges.map((range) => (
                <button
                  key={range.id}
                  onClick={() => {
                    onDateRangeChange(range.id);
                  }}
                  className={cn(
                    'flex-1 p-3 rounded-xl border text-sm font-medium transition-all',
                    dateRange === range.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <Button 
            className="w-full rounded-xl" 
            onClick={() => setIsOpen(false)}
          >
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

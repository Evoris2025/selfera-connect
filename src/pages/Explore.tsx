import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Sparkles, Play, Image, FileText } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Input } from '@/components/ui/input';
import { PolishedTabBar, type TabItem } from '@/components/ui/PolishedTabBar';
import { 
  ExploreFilters, 
  ExploreExpressions, 
  ExploreVideos, 
  ExploreImages, 
  ExplorePosts,
  type FilterType,
  type DateRange 
} from '@/components/explore';

type ExploreTab = 'expressions' | 'videos' | 'images' | 'posts';

const exploreTabs: TabItem[] = [
  { id: 'expressions', icon: Sparkles },
  { id: 'videos', icon: Play },
  { id: 'images', icon: Image },
  { id: 'posts', icon: FileText },
];

export default function Explore() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState<ExploreTab>(
    (searchParams.get('tab') as ExploreTab) || 'expressions'
  );
  const [isLoading, setIsLoading] = useState(true);

  // Filter state per tab
  const [filters, setFilters] = useState<Record<ExploreTab, { filter: FilterType; dateRange: DateRange }>>({
    expressions: { filter: 'trending', dateRange: 'all' },
    videos: { filter: 'trending', dateRange: 'all' },
    images: { filter: 'trending', dateRange: 'all' },
    posts: { filter: 'trending', dateRange: 'all' },
  });

  // Simulate loading when tab changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Update URL when tab changes
  useEffect(() => {
    setSearchParams({ tab: activeTab }, { replace: true });
  }, [activeTab, setSearchParams]);

  const handleFilterChange = (filter: FilterType) => {
    setFilters(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], filter }
    }));
  };

  const handleDateRangeChange = (dateRange: DateRange) => {
    setFilters(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], dateRange }
    }));
  };

  const currentFilters = filters[activeTab];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'expressions':
        return <ExploreExpressions isLoading={isLoading} />;
      case 'videos':
        return <ExploreVideos isLoading={isLoading} />;
      case 'images':
        return <ExploreImages isLoading={isLoading} />;
      case 'posts':
        return <ExplorePosts isLoading={isLoading} />;
      default:
        return null;
    }
  };

  return (
    <AppLayout title={t('nav.explore')}>
      <div className="flex flex-col min-h-full">
        {/* Search + Filter Bar */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
          <div className="p-3 flex items-center gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-none h-10 rounded-xl"
              />
            </div>
            <ExploreFilters
              activeFilter={currentFilters.filter}
              dateRange={currentFilters.dateRange}
              onFilterChange={handleFilterChange}
              onDateRangeChange={handleDateRangeChange}
            />
          </div>
        </div>

        {/* Polished Tab Bar */}
        <div className="sticky top-[61px] z-10 bg-background/95 backdrop-blur px-3 py-2 border-b border-border">
          <PolishedTabBar
            tabs={exploreTabs}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as ExploreTab)}
          />
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          {renderTabContent()}
        </div>
      </div>
    </AppLayout>
  );
}

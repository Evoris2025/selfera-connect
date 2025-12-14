import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Sparkles, Play, Image, FileText } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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

        {/* Tabs */}
        <Tabs 
          value={activeTab} 
          onValueChange={(v) => setActiveTab(v as ExploreTab)} 
          className="flex-1 flex flex-col"
        >
          <TabsList className="w-full bg-transparent border-b border-border rounded-none h-12 p-0 justify-start gap-0 sticky top-[61px] z-10 bg-background/95 backdrop-blur">
            <TabsTrigger 
              value="expressions" 
              className="flex-1 rounded-none h-full data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary font-medium gap-1.5"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Expressions</span>
            </TabsTrigger>
            <TabsTrigger 
              value="videos" 
              className="flex-1 rounded-none h-full data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary font-medium gap-1.5"
            >
              <Play className="h-4 w-4" />
              <span className="hidden sm:inline">Videos</span>
            </TabsTrigger>
            <TabsTrigger 
              value="images" 
              className="flex-1 rounded-none h-full data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary font-medium gap-1.5"
            >
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Images</span>
            </TabsTrigger>
            <TabsTrigger 
              value="posts" 
              className="flex-1 rounded-none h-full data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary font-medium gap-1.5"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Posts</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="expressions" className="mt-0 flex-1">
            <ExploreExpressions isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="videos" className="mt-0 flex-1">
            <ExploreVideos isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="images" className="mt-0 flex-1">
            <ExploreImages isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="posts" className="mt-0 flex-1">
            <ExplorePosts isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/AppLayout';
import { Input } from '@/components/ui/input';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { BrandSurface, BrandIcon, BrandUnderlineTabs } from '@/components/brand';
import {
  ExploreFilters,
  ExploreChipRow,
  type ExploreChip,
  ExploreExpressions,
  ExploreVideos,
  ExploreImages,
  ExplorePosts,
  type DateRange,
  type ExploreTab,
} from '@/components/explore';

const exploreTabs = [
  { id: 'expressions', label: 'Expressions' },
  { id: 'videos', label: 'Videos' },
  { id: 'images', label: 'Images' },
  { id: 'posts', label: 'Posts' },
];

const CHIPS_PER_TAB: Record<ExploreTab, ExploreChip[]> = {
  expressions: [
    { id: 'for-you', label: 'For You' },
    { id: 'following', label: 'Following' },
    { id: 'trending', label: 'Trending' },
    { id: 'recent', label: 'Recent' },
    { id: 'community', label: 'Community' },
  ],
  videos: [
    { id: 'for-you', label: 'For You' },
    { id: 'following', label: 'Following' },
    { id: 'trending', label: 'Trending' },
    { id: 'most-watched', label: 'Most Watched' },
    { id: 'recent', label: 'Recent' },
  ],
  images: [
    { id: 'trending', label: 'Trending' },
    { id: 'popular-week', label: 'Popular This Week' },
    { id: 'community', label: 'Community' },
    { id: 'recent', label: 'Recent' },
  ],
  posts: [
    { id: 'for-you', label: 'For You' },
    { id: 'trending', label: 'Trending' },
    { id: 'most-liked', label: 'Most Liked' },
    { id: 'most-commented', label: 'Most Commented' },
    { id: 'newest', label: 'Newest' },
  ],
};

export default function Explore() {
  useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState<ExploreTab>(
    (searchParams.get('tab') as ExploreTab) || 'expressions'
  );
  const [isLoading, setIsLoading] = useState(true);

  // Active chip per tab — defaults to first chip for that tab
  const [activeChipPerTab, setActiveChipPerTab] = useState<Record<ExploreTab, string>>({
    expressions: CHIPS_PER_TAB.expressions[0].id,
    videos: CHIPS_PER_TAB.videos[0].id,
    images: CHIPS_PER_TAB.images[0].id,
    posts: CHIPS_PER_TAB.posts[0].id,
  });

  // Date range per tab (advanced filter sheet)
  const [dateRangePerTab, setDateRangePerTab] = useState<Record<ExploreTab, DateRange>>({
    expressions: 'all',
    videos: 'all',
    images: 'all',
    posts: 'all',
  });

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [activeTab]);

  useEffect(() => {
    setSearchParams({ tab: activeTab }, { replace: true });
  }, [activeTab, setSearchParams]);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  }, []);

  const chips = CHIPS_PER_TAB[activeTab];
  const activeChip = activeChipPerTab[activeTab];
  const dateRange = dateRangePerTab[activeTab];

  const triggerLabel = useMemo(() => {
    const found = chips.find((c) => c.id === activeChip);
    return found?.label ?? 'Filter';
  }, [chips, activeChip]);

  const handleChipChange = (id: string) => {
    setActiveChipPerTab((prev) => ({ ...prev, [activeTab]: id }));
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRangePerTab((prev) => ({ ...prev, [activeTab]: range }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'expressions':
        return <ExploreExpressions isLoading={isLoading} activeChip={activeChip} />;
      case 'videos':
        return <ExploreVideos isLoading={isLoading} activeChip={activeChip} />;
      case 'images':
        return <ExploreImages isLoading={isLoading} activeChip={activeChip} />;
      case 'posts':
        return <ExplorePosts isLoading={isLoading} activeChip={activeChip} />;
      default:
        return null;
    }
  };

  return (
    <AppLayout brandMark>
      <div className="flex flex-col min-h-full">
        {/* Search + Filter Bar (single filter trigger lives here) */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-white/[0.08]">
          <div className="p-3 flex items-center gap-2">
            <BrandSurface className="relative flex-1 flex items-center h-11 px-4 rounded-full">
              <BrandIcon icon={SearchIcon} size={18} />
              <Input
                placeholder="search SelfERA"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 ml-2 bg-transparent border-0 h-full px-0 text-white text-[14px] placeholder:text-white/45 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </BrandSurface>
            <ExploreFilters
              activeTab={activeTab}
              dateRange={dateRange}
              onDateRangeChange={handleDateRangeChange}
              triggerLabel={triggerLabel}
            />
          </div>
        </div>

        {/* Brand Underline Tab Bar — flex w-full, tabs flex-1 */}
        <div className="sticky top-[68px] z-10 bg-background/95 backdrop-blur px-3 border-b border-white/[0.08]">
          <BrandUnderlineTabs
            tabs={exploreTabs}
            value={activeTab}
            onChange={(tabId) => setActiveTab(tabId as ExploreTab)}
            ariaLabel="Explore content type"
          />
        </div>

        {/* TikTok-style chip row — context per tab */}
        <div className="sticky top-[110px] z-10 bg-background/95 backdrop-blur border-b border-white/[0.08]">
          <ExploreChipRow
            chips={chips}
            value={activeChip}
            onChange={handleChipChange}
            ariaLabel={`${activeTab} filters`}
          />
        </div>

        <PullToRefresh onRefresh={handleRefresh} className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${activeChip}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full"
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </PullToRefresh>
      </div>
    </AppLayout>
  );
}

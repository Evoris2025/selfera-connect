import { useState, useEffect, useCallback } from 'react';
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
  ExploreExpressions,
  ExploreVideos,
  ExploreImages,
  ExplorePosts,
  type ExploreTab,
} from '@/components/explore';
import {
  DEFAULT_FILTERS,
  type ExploreFiltersState,
} from '@/components/explore/ExploreFilters';

const exploreTabs = [
  { id: 'expressions', label: 'Expressions' },
  { id: 'videos', label: 'Videos' },
  { id: 'images', label: 'Images' },
  { id: 'posts', label: 'Posts' },
];

export default function Explore() {
  useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState<ExploreTab>(
    (searchParams.get('tab') as ExploreTab) || 'expressions'
  );
  const [isLoading, setIsLoading] = useState(true);

  // Single filter state, persisted per tab. Switching tabs preserves each
  // tab's filters; ExploreFilters operates on the active tab's slice only.
  const [filters, setFilters] = useState<ExploreFiltersState>(DEFAULT_FILTERS);

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
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'expressions':
        return <ExploreExpressions isLoading={isLoading} filters={filters.expressions} />;
      case 'videos':
        return <ExploreVideos isLoading={isLoading} filters={filters.videos} />;
      case 'images':
        return <ExploreImages isLoading={isLoading} filters={filters.images} />;
      case 'posts':
        return <ExplorePosts isLoading={isLoading} filters={filters.posts} />;
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
              filters={filters}
              onChange={setFilters}
            />
          </div>
        </div>

        {/* Brand Underline Tab Bar */}
        <div className="sticky top-[68px] z-10 bg-background/95 backdrop-blur px-3 border-b border-white/[0.08]">
          <BrandUnderlineTabs
            tabs={exploreTabs}
            value={activeTab}
            onChange={(tabId) => setActiveTab(tabId as ExploreTab)}
            ariaLabel="Explore content type"
          />
        </div>

        <PullToRefresh onRefresh={handleRefresh} className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
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

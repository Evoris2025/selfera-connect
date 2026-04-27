import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, Users, Compass, ChevronRight, TrendingUp, Eye, Upload, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { ExploreFilters, FilterType, DateRange } from './ExploreFilters';
import { BrandSectionLabel, BrandIcon } from '@/components/brand';
import { useThemeColor } from '@/hooks/useThemeColor';

// Mock video data
const forYouVideos = [
  {
    id: 'v1',
    title: 'Understanding Anxiety: A Complete Guide',
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=450&fit=crop',
    duration: '12:34',
    views: 45200,
    creator: { name: 'Dr. Sarah Mitchell', handle: 'drsarah', avatar: '', isVerified: true },
  },
  {
    id: 'v2',
    title: 'Morning Meditation for Calm',
    thumbnail: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&h=450&fit=crop',
    duration: '8:15',
    views: 23100,
    creator: { name: 'Mindful Moments', handle: 'mindfulmoments', avatar: '', isVerified: true },
  },
];

const followingVideos = [
  {
    id: 'v3',
    title: 'My Recovery Journey: 6 Month Update',
    thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&h=450&fit=crop',
    duration: '15:22',
    views: 8900,
    creator: { name: 'Jamie', handle: 'jamie_journey', avatar: '', isVerified: false },
  },
];

const trendingVideos = [
  {
    id: 'v4',
    title: 'The Science of Sleep and Mental Health',
    thumbnail: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&h=450&fit=crop',
    duration: '45:00',
    views: 67800,
    creator: { name: 'Wellness Academy', handle: 'wellnessacademy', avatar: '', isVerified: true },
  },
  {
    id: 'v5',
    title: 'Building Resilience: A Workshop',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=450&fit=crop',
    duration: '1:02:15',
    views: 34500,
    creator: { name: 'Mental Health Foundation', handle: 'mhfoundation', avatar: '', isVerified: true },
  },
];

const mostWatchedVideos = [
  {
    id: 'v6',
    title: 'How to Start Your Wellness Journey',
    thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=450&fit=crop',
    duration: '18:45',
    views: 156000,
    creator: { name: 'Wellness Guide', handle: 'wellnessguide', avatar: '', isVerified: true },
  },
];

const recentVideos = [
  {
    id: 'v7',
    title: 'Daily Check-in: How Are You Today?',
    thumbnail: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=450&fit=crop',
    duration: '5:30',
    views: 1200,
    creator: { name: 'Mind Check', handle: 'mindcheck', avatar: '', isVerified: false },
  },
];

function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}

interface VideoCardProps {
  video: typeof forYouVideos[0];
  index: number;
}

function VideoCard({ video, index }: VideoCardProps) {
  const { primary: themePrimary } = useThemeColor();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="overflow-hidden cursor-pointer group transition-all w-full bg-black border border-white/[0.08] rounded-md hover:border-white/20">
        <div className="relative aspect-video bg-black overflow-hidden">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
          <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-xs text-white font-medium">
            {video.duration}
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div
              className="w-14 h-14 rounded-full bg-black/60 flex items-center justify-center border"
              style={{ borderColor: themePrimary }}
            >
              <Play className="h-6 w-6 fill-current ml-1" style={{ color: themePrimary }} />
            </div>
          </div>
        </div>

        <div className="p-3">
          <div className="flex gap-3">
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarImage src={video.creator.avatar} alt={video.creator.name} />
              <AvatarFallback className="bg-white/[0.06] text-xs text-white/70">
                {video.creator.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm text-white line-clamp-2 leading-tight">
                {video.title}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-white/55">{video.creator.name}</span>
                {video.creator.isVerified && <VerifiedBadge size="sm" />}
              </div>
              <span className="text-xs text-white/55">{formatViews(video.views)} views</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function VideoCardSkeleton() {
  return (
    <Card className="overflow-hidden w-full">
      <Skeleton shimmer className="aspect-video" />
      <div className="p-3">
        <div className="flex gap-3">
          <Skeleton shimmer className="h-9 w-9" />
          <div className="flex-1 space-y-2">
            <Skeleton shimmer className="h-4 w-full" />
            <Skeleton shimmer className="h-3 w-24" />
          </div>
        </div>
      </div>
    </Card>
  );
}

interface VideoSectionProps {
  title: string;
  icon: React.ReactNode;
  videos: typeof forYouVideos;
  isLoading?: boolean;
}

function VideoSection({ title, icon, videos, isLoading }: VideoSectionProps) {
  if (!isLoading && videos.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="font-semibold text-foreground">{title}</h2>
        </div>
        <button className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors">
          See all
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-1 px-4">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <VideoCardSkeleton key={i} />
          ))
        ) : (
          videos.map((video, index) => (
            <VideoCard key={video.id} video={video} index={index} />
          ))
        )}
      </div>
    </section>
  );
}

interface ExploreVideosProps {
  isLoading?: boolean;
}

export function ExploreVideos({ isLoading = false }: ExploreVideosProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('trending');
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  }, []);

  const loading = isLoading || isRefreshing;

  return (
    <PullToRefresh onRefresh={handleRefresh} className="h-full">
      <div className="py-4 space-y-6">
        {/* Filter bar */}
        <div className="px-4">
          <ExploreFilters
            activeFilter={activeFilter}
            dateRange={dateRange}
            onFilterChange={setActiveFilter}
            onDateRangeChange={setDateRange}
          />
        </div>

        <VideoSection
          title="For you right now"
          icon={<Compass className="h-5 w-5 text-primary" />}
          videos={forYouVideos}
          isLoading={loading}
        />
        
        <VideoSection
          title="Creators you follow"
          icon={<Users className="h-5 w-5 text-emerald-400" />}
          videos={followingVideos}
          isLoading={loading}
        />
        
        <VideoSection
          title="Trending videos"
          icon={<TrendingUp className="h-5 w-5 text-rose-500" />}
          videos={trendingVideos}
          isLoading={loading}
        />
        
        <VideoSection
          title="Most watched"
          icon={<Eye className="h-5 w-5 text-accent" />}
          videos={mostWatchedVideos}
          isLoading={loading}
        />
        
        <VideoSection
          title="Recently uploaded"
          icon={<Upload className="h-5 w-5 text-muted-foreground" />}
          videos={recentVideos}
          isLoading={loading}
        />
      </div>
    </PullToRefresh>
  );
}

import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ExploreVerifiedTick } from './ExploreVerifiedTick';
import type { VerificationTier } from './ExploreVerifiedTick';
import { BrandIcon } from '@/components/brand';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useInfiniteList } from '@/hooks/useInfiniteList';

interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: number;
  ageLabel: string;
  creator: { name: string; handle: string; avatar: string; tier: VerificationTier | null };
}

const forYouVideos: VideoItem[] = [
  { id: 'v1', title: 'Understanding Anxiety: A Complete Guide', thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=450&fit=crop', duration: '12:34', views: 45200, ageLabel: '2D AGO', creator: { name: 'Dr. Sarah Mitchell', handle: 'drsarah', avatar: 'https://i.pravatar.cc/100?img=47', tier: 'blue' } },
  { id: 'v2', title: 'Morning Meditation for Calm', thumbnail: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&h=450&fit=crop', duration: '8:15', views: 23100, ageLabel: '4D AGO', creator: { name: 'Mindful Moments', handle: 'mindfulmoments', avatar: 'https://i.pravatar.cc/100?img=32', tier: 'green' } },
  { id: 'v3', title: 'My Recovery Journey: 6 Month Update', thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&h=450&fit=crop', duration: '15:22', views: 8900, ageLabel: '1W AGO', creator: { name: 'Jamie', handle: 'jamie_journey', avatar: 'https://i.pravatar.cc/100?img=12', tier: null } },
  { id: 'v4', title: 'The Science of Sleep and Mental Health', thumbnail: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&h=450&fit=crop', duration: '45:00', views: 67800, ageLabel: '2W AGO', creator: { name: 'Wellness Academy', handle: 'wellnessacademy', avatar: 'https://i.pravatar.cc/100?img=14', tier: 'orange' } },
  { id: 'v5', title: 'Building Resilience: A Workshop', thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=450&fit=crop', duration: '1:02:15', views: 34500, ageLabel: '3W AGO', creator: { name: 'Mental Health Foundation', handle: 'mhfoundation', avatar: 'https://i.pravatar.cc/100?img=9', tier: 'green' } },
  { id: 'v6', title: 'How to Start Your Wellness Journey', thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=450&fit=crop', duration: '18:45', views: 156000, ageLabel: '1MO AGO', creator: { name: 'Wellness Guide', handle: 'wellnessguide', avatar: 'https://i.pravatar.cc/100?img=33', tier: 'purple' } },
  { id: 'v7', title: 'Daily Check-in: How Are You Today?', thumbnail: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=450&fit=crop', duration: '5:30', views: 1200, ageLabel: '5H AGO', creator: { name: 'Mind Check', handle: 'mindcheck', avatar: 'https://i.pravatar.cc/100?img=51', tier: null } },
];

const followingVideos = forYouVideos.slice(0, 4).map((v) => ({ ...v, id: `f-${v.id}` }));
const trendingVideos = forYouVideos.map((v) => ({ ...v, id: `t-${v.id}` }));
const mostWatchedVideos = forYouVideos.slice().sort((a, b) => b.views - a.views).map((v) => ({ ...v, id: `mw-${v.id}` }));
const recentVideos = forYouVideos.slice(0, 5).map((v) => ({ ...v, id: `r-${v.id}` }));

import type { VideosFilters, SortBy } from './ExploreFilters';
import { applyCreatorTier, applyDuration } from './exploreFilterUtils';

const SORT_TO_DATA: Record<SortBy, VideoItem[]> = {
  'for-you': forYouVideos,
  'following': followingVideos,
  'trending': trendingVideos,
  'most-recent': recentVideos,
  'most-liked': mostWatchedVideos,
};

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function VideoTile({ video, index }: { video: VideoItem; index: number }) {
  const { primary: themePrimary } = useThemeColor();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.2) }}
      className="cursor-pointer group"
    >
      {/* Media */}
      <div className="relative aspect-video rounded-md overflow-hidden bg-black">
        <img
          src={video.thumbnail}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
        <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/80 text-caption text-white font-medium rounded">
          {video.duration}
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div
            className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center border"
            style={{ borderColor: themePrimary }}
          >
            <BrandIcon icon={Play} size={20} />
          </div>
        </div>
      </div>

      {/* Below: title + creator row + stats */}
      <div className="flex flex-col gap-1.5 mt-2">
        {/* Row 1 — Title (locked to 2 lines reserved height) */}
        <p className="text-white text-label font-medium leading-snug line-clamp-2 min-h-[2.25rem]">
          {video.title}
        </p>

        {/* Row 2 — Creator row (avatar + name + tier badge) */}
        <div className="flex items-center gap-2 min-w-0">
          <Avatar size="xs" className="shrink-0">
            <AvatarImage src={video.creator.avatar} alt={video.creator.name} />
            <AvatarFallback className="bg-white/[0.06] text-caption text-white/70">
              {video.creator.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-label text-white/70 truncate">{video.creator.name}</span>
          <ExploreVerifiedTick tier={video.creator.tier} className="shrink-0" />
        </div>

        {/* Row 3 — Stats row */}
        <p className="text-caption uppercase tracking-[0.08em] text-white/45">
          {formatViews(video.views)} VIEWS · {video.ageLabel}
        </p>
      </div>
    </motion.div>
  );
}

function VideoTileSkeleton() {
  return (
    <div>
      <Skeleton shimmer className="aspect-video rounded-md" />
      <div className="flex gap-2 pt-2">
        <Skeleton shimmer className="h-7 w-7 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton shimmer className="h-3 w-full" />
          <Skeleton shimmer className="h-2.5 w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function ExploreVideos({
  isLoading = false,
  filters,
}: {
  isLoading?: boolean;
  filters?: VideosFilters;
}) {
  const { primary: themePrimary } = useThemeColor();
  const sortBy = filters?.sortBy ?? 'for-you';
  const duration = filters?.duration ?? 'all';
  const creatorTier = filters?.creatorTier ?? 'all';
  const source = applyCreatorTier(
    applyDuration(SORT_TO_DATA[sortBy] ?? SORT_TO_DATA['for-you'], duration),
    creatorTier,
  );
  const tierKey = creatorTier === 'all' ? 'all' : creatorTier.slice().sort().join(',');
  const resetKey = `${sortBy}|${filters?.timePeriod ?? 'all-time'}|${duration}|${tierKey}|${filters?.origin ?? 'all'}`;
  const { items, sentinelRef, isLoadingMore, hasMore } = useInfiniteList({
    source,
    pageSize: 8,
    resetKey,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 px-3 py-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <VideoTileSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="py-3">
      <div className="grid grid-cols-2 gap-3 px-3">
        {items.map((video, index) => (
          <VideoTile key={video.__key} video={video} index={index} />
        ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="flex items-center justify-center py-6">
          {isLoadingMore && (
            <div
              className="h-6 w-6 rounded-full border-2 border-white/30 animate-spin"
              style={{ borderTopColor: themePrimary }}
            />
          )}
        </div>
      )}
    </div>
  );
}

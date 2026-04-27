import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ExploreVerifiedTick } from './ExploreVerifiedTick';
import type { VerificationTier } from '@/components/EraVerifiedTick';
import { BrandIcon } from '@/components/brand';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useInfiniteList } from '@/hooks/useInfiniteList';

interface ExpressionItem {
  id: string;
  user: { name: string; handle: string; avatar: string; tier: VerificationTier | null };
  thumbnail: string;
  views: number;
}

const forYouExpressions: ExpressionItem[] = [
  { id: 'e1', user: { name: 'Dr. Sarah', handle: 'drsarah', avatar: 'https://i.pravatar.cc/100?img=47', tier: 'blue' }, thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=700&fit=crop', views: 1240 },
  { id: 'e2', user: { name: 'Wellness Hub', handle: 'wellnesshub', avatar: 'https://i.pravatar.cc/100?img=32', tier: 'green' }, thumbnail: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=700&fit=crop', views: 890 },
  { id: 'e3', user: { name: 'Jamie', handle: 'jamie_j', avatar: 'https://i.pravatar.cc/100?img=12', tier: null }, thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=700&fit=crop', views: 456 },
  { id: 'e4', user: { name: 'Mind Matters', handle: 'mindmatters', avatar: 'https://i.pravatar.cc/100?img=14', tier: 'purple' }, thumbnail: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=700&fit=crop', views: 5670 },
  { id: 'e5', user: { name: 'Calm Space', handle: 'calmspace', avatar: 'https://i.pravatar.cc/100?img=9', tier: 'green' }, thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=700&fit=crop', views: 4320 },
  { id: 'e6', user: { name: 'Alex', handle: 'alex_wellness', avatar: 'https://i.pravatar.cc/100?img=33', tier: null }, thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=700&fit=crop', views: 123 },
  { id: 'e7', user: { name: 'Recovery Road', handle: 'recoveryroad', avatar: 'https://i.pravatar.cc/100?img=51', tier: 'pink' }, thumbnail: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=700&fit=crop', views: 234 },
  { id: 'e8', user: { name: 'Anxiety Support', handle: 'anxietysupport', avatar: 'https://i.pravatar.cc/100?img=23', tier: 'green' }, thumbnail: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=700&fit=crop', views: 890 },
];

const followingExpressions: ExpressionItem[] = [
  { id: 'ef1', user: { name: 'Calm Coach', handle: 'calmcoach', avatar: 'https://i.pravatar.cc/100?img=20', tier: 'green' }, thumbnail: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=700&fit=crop', views: 312 },
  { id: 'ef2', user: { name: 'Maya', handle: 'maya_m', avatar: 'https://i.pravatar.cc/100?img=5', tier: null }, thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=700&fit=crop', views: 102 },
  { id: 'ef3', user: { name: 'Leo', handle: 'leo_h', avatar: 'https://i.pravatar.cc/100?img=15', tier: null }, thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=700&fit=crop', views: 67 },
];

const trendingExpressions = forYouExpressions.map((e) => ({ ...e, id: `t-${e.id}` }));
const recentExpressions = forYouExpressions.slice(0, 5).map((e) => ({ ...e, id: `r-${e.id}` }));
const communityExpressions = forYouExpressions.slice(2, 7).map((e) => ({ ...e, id: `c-${e.id}` }));

import type { ExpressionsFilters, SortBy } from './ExploreFilters';

const SORT_TO_DATA: Record<SortBy, ExpressionItem[]> = {
  'for-you': forYouExpressions,
  'following': followingExpressions,
  'trending': trendingExpressions,
  'most-recent': recentExpressions,
  'most-liked': communityExpressions,
};

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function ExpressionTile({ expression, index }: { expression: ExpressionItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: Math.min(index * 0.02, 0.2) }}
      className="relative aspect-[9/16] overflow-hidden rounded-md cursor-pointer group bg-secondary"
    >
      <img
        src={expression.thumbnail}
        alt=""
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      {/* Bottom gradient for legibility */}
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

      {/* Bottom-left: avatar + handle + verified */}
      <div className="absolute bottom-2 left-2 right-12 flex items-center gap-1.5 min-w-0">
        <Avatar className="h-6 w-6 ring-1 ring-white/30 flex-shrink-0">
          <AvatarImage src={expression.user.avatar} alt={expression.user.name} />
          <AvatarFallback className="text-[9px] bg-white/[0.08] text-white/70">
            {expression.user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <span className="text-white text-[11px] font-medium truncate">@{expression.user.handle}</span>
        <ExploreVerifiedTick tier={expression.user.tier} size="sm" />
      </div>

      {/* Bottom-right: play count */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1">
        <BrandIcon icon={Play} size={10} />
        <span className="text-white text-[10px] font-medium tabular-nums">
          {formatCount(expression.views)}
        </span>
      </div>
    </motion.div>
  );
}

function TileSkeleton() {
  return <Skeleton shimmer className="aspect-[9/16] rounded-md" />;
}

export function ExploreExpressions({
  isLoading = false,
  filters,
}: {
  isLoading?: boolean;
  filters?: ExpressionsFilters;
}) {
  const { primary: themePrimary } = useThemeColor();
  const sortBy = filters?.sortBy ?? 'for-you';
  const source = SORT_TO_DATA[sortBy] ?? SORT_TO_DATA['for-you'];
  const resetKey = `${sortBy}|${filters?.timePeriod ?? 'all-time'}|${filters?.origin ?? 'all'}`;
  const { items, sentinelRef, isLoadingMore, hasMore } = useInfiniteList({
    source,
    pageSize: 10,
    resetKey,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-1 px-1 py-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <TileSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="py-3">
      <div className="grid grid-cols-2 gap-1 px-1">
        {items.map((expression, index) => (
          <ExpressionTile key={expression.__key} expression={expression} index={index} />
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

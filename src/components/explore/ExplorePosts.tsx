import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ExploreVerifiedTick } from './ExploreVerifiedTick';
import type { VerificationTier } from './ExploreVerifiedTick';
import { BrandSurface } from '@/components/brand';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useInfiniteList } from '@/hooks/useInfiniteList';

interface PostItem {
  id: string;
  content: string;
  user: { name: string; handle: string; avatar: string; tier: VerificationTier | null };
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
}

const forYouPosts: PostItem[] = [
  { id: 'p1', content: 'Remember: healing is not linear. Some days will be harder than others, and that\'s completely okay. What matters is that you keep showing up for yourself.', user: { name: 'Dr. Sarah Mitchell', handle: 'drsarah', avatar: 'https://i.pravatar.cc/100?img=47', tier: 'blue' }, likes: 2340, comments: 156, shares: 42, createdAt: '2h' },
  { id: 'p2', content: 'Today I learned that setting boundaries isn\'t selfish — it\'s self-care. Protecting your peace is a form of self-love. 💙', user: { name: 'Wellness Hub', handle: 'wellnesshub', avatar: 'https://i.pravatar.cc/100?img=32', tier: 'green' }, likes: 1890, comments: 89, shares: 31, createdAt: '4h' },
  { id: 'p3', content: 'Spent the morning journaling and it completely shifted my mindset. Sometimes we need to write it out to work it out. What\'s your go-to reflection practice?', user: { name: 'Mind Matters', handle: 'mindmatters', avatar: 'https://i.pravatar.cc/100?img=14', tier: 'green' }, likes: 5670, comments: 423, shares: 88, createdAt: '6h' },
  { id: 'p4', content: 'Six months sober today. Never thought I\'d make it this far. Thank you to everyone in this community who believed in me when I couldn\'t believe in myself.', user: { name: 'Jamie', handle: 'jamie_journey', avatar: 'https://i.pravatar.cc/100?img=12', tier: null }, likes: 12400, comments: 890, shares: 210, createdAt: '1d' },
  { id: 'p5', content: 'What\'s one small thing you did today to take care of your mental health? I\'ll start: I took a 10-minute walk outside.', user: { name: 'Calm Space', handle: 'calmspace', avatar: 'https://i.pravatar.cc/100?img=9', tier: 'pink' }, likes: 3200, comments: 1567, shares: 60, createdAt: '12h' },
  { id: 'p6', content: 'Just joined this community and feeling hopeful for the first time in a while. Looking forward to connecting with others on similar journeys.', user: { name: 'NewStart', handle: 'newstart2024', avatar: 'https://i.pravatar.cc/100?img=51', tier: null }, likes: 234, comments: 45, shares: 8, createdAt: '15m' },
];

const trendingPosts = forYouPosts.map((p) => ({ ...p, id: `t-${p.id}` }));
const mostLikedPosts = forYouPosts.slice().sort((a, b) => b.likes - a.likes).map((p) => ({ ...p, id: `ml-${p.id}` }));
const mostCommentedPosts = forYouPosts.slice().sort((a, b) => b.comments - a.comments).map((p) => ({ ...p, id: `mc-${p.id}` }));
const newestPosts = forYouPosts.slice(0, 5).map((p) => ({ ...p, id: `n-${p.id}` }));

import type { PostsFilters, SortBy } from './ExploreFilters';
import { applyCreatorTier } from './exploreFilterUtils';

const SORT_TO_DATA: Record<SortBy, PostItem[]> = {
  'for-you': forYouPosts,
  'following': forYouPosts,
  'trending': trendingPosts,
  'most-recent': newestPosts,
  'most-liked': mostLikedPosts,
};

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function PostCard({ post, index }: { post: PostItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.2) }}
    >
      <BrandSurface className="rounded-2xl border border-white/[0.08] p-4 cursor-pointer">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.user.avatar} alt={post.user.name} />
            <AvatarFallback className="bg-white/[0.06] text-white/70 text-label">
              {post.user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-body text-white truncate">{post.user.name}</span>
              <ExploreVerifiedTick tier={post.user.tier} size="sm" />
            </div>
            <p className="text-caption text-white/45 uppercase tracking-[0.08em]">
              @{post.user.handle} · {post.createdAt}
            </p>
          </div>
        </div>

        <p className="text-body text-white/85 leading-relaxed mb-3 whitespace-pre-line">
          {post.content}
        </p>

        <div className="flex items-center gap-5 text-white/55">
          <div className="flex items-center gap-1.5">
            <Heart className="h-4 w-4" />
            <span className="text-caption tabular-nums">{formatCount(post.likes)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4" />
            <span className="text-caption tabular-nums">{formatCount(post.comments)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Share2 className="h-4 w-4" />
            <span className="text-caption tabular-nums">{formatCount(post.shares)}</span>
          </div>
        </div>
      </BrandSurface>
    </motion.div>
  );
}

function PostCardSkeleton() {
  return (
    <BrandSurface className="rounded-2xl border border-white/[0.08] p-4">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton shimmer className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton shimmer className="h-4 w-32" />
          <Skeleton shimmer className="h-3 w-24" />
        </div>
      </div>
      <div className="space-y-2 mb-3">
        <Skeleton shimmer className="h-4 w-full" />
        <Skeleton shimmer className="h-4 w-3/4" />
      </div>
      <div className="flex gap-4">
        <Skeleton shimmer className="h-4 w-12" />
        <Skeleton shimmer className="h-4 w-12" />
      </div>
    </BrandSurface>
  );
}

export function ExplorePosts({
  isLoading = false,
  filters,
}: {
  isLoading?: boolean;
  filters?: PostsFilters;
}) {
  const { primary: themePrimary } = useThemeColor();
  const sortBy = filters?.sortBy ?? 'for-you';
  const creatorTier = filters?.creatorTier ?? 'all';
  const baseSource = SORT_TO_DATA[sortBy] ?? SORT_TO_DATA['for-you'];
  const source = applyCreatorTier(baseSource, creatorTier);
  const tierKey = creatorTier === 'all' ? 'all' : creatorTier.slice().sort().join(',');
  const resetKey = `${sortBy}|${filters?.timePeriod ?? 'all-time'}|${tierKey}|${filters?.origin ?? 'all'}`;
  const { items, sentinelRef, isLoadingMore, hasMore } = useInfiniteList({
    source,
    pageSize: 6,
    resetKey,
  });

  if (isLoading) {
    return (
      <div className="space-y-3 px-3 py-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="py-3">
      <div className="space-y-3 px-3">
        {items.map((post, index) => (
          <PostCard key={post.__key} post={post} index={index} />
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

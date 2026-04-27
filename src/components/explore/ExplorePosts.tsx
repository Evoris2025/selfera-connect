import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Heart, MessageCircle, Clock, ChevronRight, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { BrandSectionLabel, BrandIcon } from '@/components/brand';

const forYouPosts = [
  { id: 'p1', content: 'Remember: healing is not linear. Some days will be harder than others, and that\'s completely okay. What matters is that you keep showing up for yourself.', user: { name: 'Dr. Sarah Mitchell', handle: 'drsarah', avatar: 'https://i.pravatar.cc/100?img=47', isVerified: true }, likes: 2340, comments: 156, createdAt: '2h ago' },
  { id: 'p2', content: 'Today I learned that setting boundaries isn\'t selfish—it\'s self-care. Protecting your peace is a form of self-love. 💙', user: { name: 'Wellness Hub', handle: 'wellnesshub', avatar: 'https://i.pravatar.cc/100?img=32', isVerified: true }, likes: 1890, comments: 89, createdAt: '4h ago' },
];

const trendingPosts = [
  { id: 'p3', content: 'Spent the morning journaling and it completely shifted my mindset. Sometimes we need to write it out to work it out. What\'s your go-to reflection practice?', user: { name: 'Mind Matters', handle: 'mindmatters', avatar: 'https://i.pravatar.cc/100?img=14', isVerified: true }, likes: 5670, comments: 423, createdAt: '6h ago' },
];

const mostLikedPosts = [
  { id: 'p4', content: 'Six months sober today. Never thought I\'d make it this far. Thank you to everyone in this community who believed in me when I couldn\'t believe in myself.', user: { name: 'Jamie', handle: 'jamie_journey', avatar: 'https://i.pravatar.cc/100?img=12', isVerified: false }, likes: 12400, comments: 890, createdAt: '1d ago' },
];

const mostCommentedPosts = [
  { id: 'p5', content: 'What\'s one small thing you did today to take care of your mental health? I\'ll start: I took a 10-minute walk outside.', user: { name: 'Calm Space', handle: 'calmspace', avatar: 'https://i.pravatar.cc/100?img=9', isVerified: true }, likes: 3200, comments: 1567, createdAt: '12h ago' },
];

const newestPosts = [
  { id: 'p6', content: 'Just joined this community and feeling hopeful for the first time in a while. Looking forward to connecting with others on similar journeys.', user: { name: 'NewStart', handle: 'newstart2024', avatar: 'https://i.pravatar.cc/100?img=51', isVerified: false }, likes: 234, comments: 45, createdAt: '15m ago' },
];

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

interface PostCardProps {
  post: typeof forYouPosts[0];
  index: number;
}

function PostCard({ post, index }: PostCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="p-4 bg-black border border-white/[0.08] rounded-md hover:border-white/20 transition-colors cursor-pointer">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.user.avatar} alt={post.user.name} />
            <AvatarFallback className="bg-secondary">
              {post.user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-foreground truncate">{post.user.name}</span>
              {post.user.isVerified && <VerifiedBadge size="sm" />}
            </div>
            <p className="text-xs text-muted-foreground">@{post.user.handle} · {post.createdAt}</p>
          </div>
        </div>

        <p className="text-sm text-foreground leading-relaxed mb-3">
          {post.content}
        </p>

        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Heart className="h-4 w-4" />
            <span className="text-xs">{formatCount(post.likes)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">{formatCount(post.comments)}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function PostCardSkeleton() {
  return (
    <Card className="p-4">
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
    </Card>
  );
}

interface PostSectionProps {
  title: string;
  icon: LucideIcon;
  posts: typeof forYouPosts;
  isLoading?: boolean;
  showViewAll?: boolean;
}

function PostSection({ title, icon, posts, isLoading, showViewAll = false }: PostSectionProps) {
  if (!isLoading && posts.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <BrandIcon icon={icon} size={16} />
          <BrandSectionLabel>{title}</BrandSectionLabel>
        </div>
        {showViewAll && (
          <button className="flex items-center gap-1 text-[11px] uppercase tracking-[0.1em] text-white/55 hover:text-white/80 transition-colors">
            See all
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="px-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))
        ) : (
          posts.map((post, index) => (
            <PostCard key={post.id} post={post} index={index} />
          ))
        )}
      </div>
    </section>
  );
}

interface ExplorePostsProps {
  isLoading?: boolean;
  activeChip?: string;
}

const CHIP_TO_DATA: Record<string, { title: string; icon: LucideIcon; data: typeof forYouPosts }> = {
  'for-you': { title: 'FOR YOU', icon: Sparkles, data: forYouPosts },
  'trending': { title: 'TRENDING POSTS', icon: TrendingUp, data: trendingPosts },
  'most-liked': { title: 'MOST LIKED', icon: Heart, data: mostLikedPosts },
  'most-commented': { title: 'MOST COMMENTED', icon: MessageCircle, data: mostCommentedPosts },
  'newest': { title: 'NEWEST', icon: Clock, data: newestPosts },
};

export function ExplorePosts({ isLoading = false, activeChip = 'for-you' }: ExplorePostsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  }, []);

  const loading = isLoading || isRefreshing;
  const section = CHIP_TO_DATA[activeChip] ?? CHIP_TO_DATA['for-you'];

  return (
    <PullToRefresh onRefresh={handleRefresh} className="h-full">
      <div className="py-4 space-y-6">
        <PostSection title={section.title} icon={section.icon} posts={section.data} isLoading={loading} />
      </div>
    </PullToRefresh>
  );
}

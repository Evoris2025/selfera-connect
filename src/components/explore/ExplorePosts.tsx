import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Heart, MessageCircle, Clock, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { cn } from '@/lib/utils';

// Mock post data
const forYouPosts = [
  {
    id: 'p1',
    content: 'Remember: healing is not linear. Some days will be harder than others, and that\'s completely okay. What matters is that you keep showing up for yourself.',
    user: { name: 'Dr. Sarah Mitchell', handle: 'drsarah', avatar: '', isVerified: true },
    likes: 2340,
    comments: 156,
    createdAt: '2h ago',
  },
  {
    id: 'p2',
    content: 'Today I learned that setting boundaries isn\'t selfish—it\'s self-care. Protecting your peace is a form of self-love. 💙',
    user: { name: 'Wellness Hub', handle: 'wellnesshub', avatar: '', isVerified: true },
    likes: 1890,
    comments: 89,
    createdAt: '4h ago',
  },
];

const trendingPosts = [
  {
    id: 'p3',
    content: 'Spent the morning journaling and it completely shifted my mindset. Sometimes we need to write it out to work it out. What\'s your go-to reflection practice?',
    user: { name: 'Mind Matters', handle: 'mindmatters', avatar: '', isVerified: true },
    likes: 5670,
    comments: 423,
    createdAt: '6h ago',
  },
];

const mostLikedPosts = [
  {
    id: 'p4',
    content: 'Six months sober today. Never thought I\'d make it this far. Thank you to everyone in this community who believed in me when I couldn\'t believe in myself.',
    user: { name: 'Jamie', handle: 'jamie_journey', avatar: '', isVerified: false },
    likes: 12400,
    comments: 890,
    createdAt: '1d ago',
  },
];

const mostCommentedPosts = [
  {
    id: 'p5',
    content: 'What\'s one small thing you did today to take care of your mental health? I\'ll start: I took a 10-minute walk outside.',
    user: { name: 'Calm Space', handle: 'calmspace', avatar: '', isVerified: true },
    likes: 3200,
    comments: 1567,
    createdAt: '12h ago',
  },
];

const newestPosts = [
  {
    id: 'p6',
    content: 'Just joined this community and feeling hopeful for the first time in a while. Looking forward to connecting with others on similar journeys.',
    user: { name: 'NewStart', handle: 'newstart2024', avatar: '', isVerified: false },
    likes: 234,
    comments: 45,
    createdAt: '15m ago',
  },
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
      <Card className="p-4 hover:border-primary/30 transition-colors cursor-pointer">
        {/* Header */}
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

        {/* Content */}
        <p className="text-sm text-foreground leading-relaxed mb-3">
          {post.content}
        </p>

        {/* Stats */}
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
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="space-y-2 mb-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
      </div>
    </Card>
  );
}

interface PostSectionProps {
  title: string;
  icon: React.ReactNode;
  posts: typeof forYouPosts;
  isLoading?: boolean;
  showViewAll?: boolean;
}

function PostSection({ title, icon, posts, isLoading, showViewAll = true }: PostSectionProps) {
  if (!isLoading && posts.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="font-semibold text-foreground">{title}</h2>
        </div>
        {showViewAll && (
          <button className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors">
            See all
            <ChevronRight className="h-4 w-4" />
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
}

export function ExplorePosts({ isLoading = false }: ExplorePostsProps) {
  return (
    <div className="py-4 space-y-6">
      <PostSection
        title="For you"
        icon={<Sparkles className="h-5 w-5 text-primary" />}
        posts={forYouPosts}
        isLoading={isLoading}
      />
      
      <PostSection
        title="Trending posts"
        icon={<TrendingUp className="h-5 w-5 text-rose-500" />}
        posts={trendingPosts}
        isLoading={isLoading}
      />
      
      <PostSection
        title="Most liked"
        icon={<Heart className="h-5 w-5 text-rose-500" />}
        posts={mostLikedPosts}
        isLoading={isLoading}
      />
      
      <PostSection
        title="Most commented"
        icon={<MessageCircle className="h-5 w-5 text-accent" />}
        posts={mostCommentedPosts}
        isLoading={isLoading}
      />
      
      <PostSection
        title="Newest"
        icon={<Clock className="h-5 w-5 text-muted-foreground" />}
        posts={newestPosts}
        isLoading={isLoading}
      />
    </div>
  );
}

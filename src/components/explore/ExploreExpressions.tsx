import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Clock, Users, Heart, type LucideIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { BrandSectionLabel, BrandIcon } from '@/components/brand';

// Mock data for expressions — avatars now populated
const forYouExpressions = [
  { id: 'e1', user: { name: 'Dr. Sarah', handle: 'drsarah', avatar: 'https://i.pravatar.cc/100?img=47', isVerified: true }, preview: 'Finding peace in small moments...', thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200&h=300&fit=crop', views: 1240 },
  { id: 'e2', user: { name: 'Wellness Hub', handle: 'wellnesshub', avatar: 'https://i.pravatar.cc/100?img=32', isVerified: true }, preview: 'Morning routine that changed my life', thumbnail: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=200&h=300&fit=crop', views: 890 },
  { id: 'e3', user: { name: 'Jamie', handle: 'jamie_j', avatar: 'https://i.pravatar.cc/100?img=12', isVerified: false }, preview: 'Day 30 of my journey', thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=200&h=300&fit=crop', views: 456 },
];

const followingExpressions = [
  { id: 'ef1', user: { name: 'Calm Coach', handle: 'calmcoach', avatar: 'https://i.pravatar.cc/100?img=20', isVerified: true }, preview: 'Tonight\'s wind-down', thumbnail: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=200&h=300&fit=crop', views: 312 },
  { id: 'ef2', user: { name: 'Maya', handle: 'maya_m', avatar: 'https://i.pravatar.cc/100?img=5', isVerified: false }, preview: 'A small win today', thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=200&h=300&fit=crop', views: 102 },
];

const trendingExpressions = [
  { id: 'e4', user: { name: 'Mind Matters', handle: 'mindmatters', avatar: 'https://i.pravatar.cc/100?img=14', isVerified: true }, preview: 'Breathe with me...', thumbnail: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=200&h=300&fit=crop', views: 5670 },
  { id: 'e5', user: { name: 'Calm Space', handle: 'calmspace', avatar: 'https://i.pravatar.cc/100?img=9', isVerified: true }, preview: '5 minute meditation', thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=300&fit=crop', views: 4320 },
];

const recentExpressions = [
  { id: 'e6', user: { name: 'Alex', handle: 'alex_wellness', avatar: 'https://i.pravatar.cc/100?img=33', isVerified: false }, preview: 'Just checking in...', thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=300&fit=crop', views: 123 },
  { id: 'e7', user: { name: 'Recovery Road', handle: 'recoveryroad', avatar: 'https://i.pravatar.cc/100?img=51', isVerified: true }, preview: 'One step at a time', thumbnail: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=300&fit=crop', views: 234 },
];

const communityExpressions = [
  { id: 'e8', user: { name: 'Anxiety Support', handle: 'anxietysupport', avatar: 'https://i.pravatar.cc/100?img=23', isVerified: true }, preview: 'You are not alone', thumbnail: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=300&fit=crop', views: 890 },
];

interface ExpressionCardProps {
  expression: typeof forYouExpressions[0];
  index: number;
}

function ExpressionCard({ expression, index }: ExpressionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="flex-shrink-0 w-32 cursor-pointer group"
    >
      <div className="relative aspect-[9/16] overflow-hidden bg-secondary">
        <img
          src={expression.thumbnail}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* User info */}
        <div className="absolute bottom-2 left-2 right-2">
          <div className="flex items-center gap-1.5">
            <Avatar className="h-6 w-6 ring-2 ring-white/30">
              <AvatarImage src={expression.user.avatar} alt={expression.user.name} />
              <AvatarFallback className="text-[10px] bg-white/[0.08] text-white/70">
                {expression.user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-white text-xs font-medium truncate">
              {expression.user.name}
            </span>
            {expression.user.isVerified && <VerifiedBadge size="sm" />}
          </div>
        </div>

        <div className="absolute inset-0 ring-2 ring-inset ring-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  );
}

function ExpressionCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-32">
      <Skeleton shimmer className="aspect-[9/16]" />
    </div>
  );
}

interface ExpressionSectionProps {
  title: string;
  icon: LucideIcon;
  expressions: typeof forYouExpressions;
  isLoading?: boolean;
}

function ExpressionSection({ title, icon, expressions, isLoading }: ExpressionSectionProps) {
  if (!isLoading && expressions.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 px-4">
        <BrandIcon icon={icon} size={16} />
        <BrandSectionLabel>{title}</BrandSectionLabel>
      </div>
      <div className="flex gap-1 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <ExpressionCardSkeleton key={i} />
          ))
        ) : (
          expressions.map((expression, index) => (
            <ExpressionCard key={expression.id} expression={expression} index={index} />
          ))
        )}
      </div>
    </section>
  );
}

interface ExploreExpressionsProps {
  isLoading?: boolean;
  /** Active chip id from chip row. */
  activeChip?: string;
}

const CHIP_TO_DATA: Record<string, { title: string; icon: LucideIcon; data: typeof forYouExpressions }> = {
  'for-you': { title: 'FOR YOU', icon: Sparkles, data: forYouExpressions },
  'following': { title: 'FOLLOWING', icon: Heart, data: followingExpressions },
  'trending': { title: 'TRENDING', icon: TrendingUp, data: trendingExpressions },
  'recent': { title: 'RECENT', icon: Clock, data: recentExpressions },
  'community': { title: 'FROM COMMUNITIES', icon: Users, data: communityExpressions },
};

export function ExploreExpressions({ isLoading = false, activeChip = 'for-you' }: ExploreExpressionsProps) {
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
        <ExpressionSection title={section.title} icon={section.icon} expressions={section.data} isLoading={loading} />
      </div>
    </PullToRefresh>
  );
}

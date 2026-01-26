import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Clock, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { cn } from '@/lib/utils';

// Mock data for expressions
const forYouExpressions = [
  { id: 'e1', user: { name: 'Dr. Sarah', handle: 'drsarah', avatar: '', isVerified: true }, preview: 'Finding peace in small moments...', thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200&h=300&fit=crop', views: 1240 },
  { id: 'e2', user: { name: 'Wellness Hub', handle: 'wellnesshub', avatar: '', isVerified: true }, preview: 'Morning routine that changed my life', thumbnail: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=200&h=300&fit=crop', views: 890 },
  { id: 'e3', user: { name: 'Jamie', handle: 'jamie_j', avatar: '', isVerified: false }, preview: 'Day 30 of my journey', thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=200&h=300&fit=crop', views: 456 },
];

const trendingExpressions = [
  { id: 'e4', user: { name: 'Mind Matters', handle: 'mindmatters', avatar: '', isVerified: true }, preview: 'Breathe with me...', thumbnail: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=200&h=300&fit=crop', views: 5670 },
  { id: 'e5', user: { name: 'Calm Space', handle: 'calmspace', avatar: '', isVerified: true }, preview: '5 minute meditation', thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=300&fit=crop', views: 4320 },
];

const recentExpressions = [
  { id: 'e6', user: { name: 'Alex', handle: 'alex_wellness', avatar: '', isVerified: false }, preview: 'Just checking in...', thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=300&fit=crop', views: 123 },
  { id: 'e7', user: { name: 'Recovery Road', handle: 'recoveryroad', avatar: '', isVerified: true }, preview: 'One step at a time', thumbnail: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=300&fit=crop', views: 234 },
];

const communityExpressions = [
  { id: 'e8', user: { name: 'Anxiety Support', handle: 'anxietysupport', avatar: '', isVerified: true }, preview: 'You are not alone', thumbnail: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=300&fit=crop', views: 890 },
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
      <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-secondary">
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
              <AvatarImage src={expression.user.avatar} />
              <AvatarFallback className="text-[10px] bg-primary/80">
                {expression.user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-white text-xs font-medium truncate">
              {expression.user.name}
            </span>
            {expression.user.isVerified && <VerifiedBadge size="sm" />}
          </div>
        </div>

        {/* Ring indicator */}
        <div className="absolute inset-0 ring-2 ring-inset ring-primary/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  );
}

function ExpressionCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-32">
      <Skeleton shimmer className="aspect-[9/16] rounded-2xl" />
    </div>
  );
}

interface ExpressionSectionProps {
  title: string;
  icon: React.ReactNode;
  expressions: typeof forYouExpressions;
  isLoading?: boolean;
}

function ExpressionSection({ title, icon, expressions, isLoading }: ExpressionSectionProps) {
  if (!isLoading && expressions.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 px-4">
        {icon}
        <h2 className="font-semibold text-foreground">{title}</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
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
}

export function ExploreExpressions({ isLoading = false }: ExploreExpressionsProps) {
  return (
    <div className="py-4 space-y-6">
      <ExpressionSection
        title="For You"
        icon={<Sparkles className="h-5 w-5 text-primary" />}
        expressions={forYouExpressions}
        isLoading={isLoading}
      />
      
      <ExpressionSection
        title="Trending Expressions"
        icon={<TrendingUp className="h-5 w-5 text-rose-500" />}
        expressions={trendingExpressions}
        isLoading={isLoading}
      />
      
      <ExpressionSection
        title="Recent Expressions"
        icon={<Clock className="h-5 w-5 text-accent" />}
        expressions={recentExpressions}
        isLoading={isLoading}
      />
      
      <ExpressionSection
        title="From Communities You Follow"
        icon={<Users className="h-5 w-5 text-emerald-400" />}
        expressions={communityExpressions}
        isLoading={isLoading}
      />
    </div>
  );
}

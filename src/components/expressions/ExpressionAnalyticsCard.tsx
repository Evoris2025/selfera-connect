import { motion } from 'framer-motion';
import { Eye, Heart, MessageCircle, TrendingUp, Clock, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpressionAnalytics {
  views: number;
  reactions: number;
  replies: number;
  reactionBreakdown: Record<string, number>;
  avgViewDuration: number; // seconds
  completionRate: number; // percentage
}

interface ExpressionAnalyticsCardProps {
  analytics: ExpressionAnalytics;
  expiresAt: Date;
  className?: string;
}

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

function getTimeRemaining(expiresAt: Date): string {
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();
  
  if (diff <= 0) return 'Expired';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

export function ExpressionAnalyticsCard({ 
  analytics, 
  expiresAt,
  className 
}: ExpressionAnalyticsCardProps) {
  const topReactions = Object.entries(analytics.reactionBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-4",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="text-body font-medium text-white">Expression Analytics</span>
        </div>
        <div className="flex items-center gap-1 text-label text-white/60">
          <Clock className="w-3 h-3" />
          {getTimeRemaining(expiresAt)}
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Views */}
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <Eye className="w-5 h-5 mx-auto mb-1 text-blue-400" />
          <p className="text-title font-bold text-white">{formatCount(analytics.views)}</p>
          <p className="text-caption text-white/60">Views</p>
        </div>

        {/* Reactions */}
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <Heart className="w-5 h-5 mx-auto mb-1 text-rose-400" />
          <p className="text-title font-bold text-white">{formatCount(analytics.reactions)}</p>
          <p className="text-caption text-white/60">Reactions</p>
        </div>

        {/* Replies */}
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <MessageCircle className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
          <p className="text-title font-bold text-white">{formatCount(analytics.replies)}</p>
          <p className="text-caption text-white/60">Replies</p>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="space-y-3">
        {/* Completion Rate */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span className="text-label text-white/80">Completion Rate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${analytics.completionRate}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
              />
            </div>
            <span className="text-label font-medium text-white">{analytics.completionRate}%</span>
          </div>
        </div>

        {/* Avg View Duration */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="text-label text-white/80">Avg. Watch Time</span>
          </div>
          <span className="text-label font-medium text-white">{analytics.avgViewDuration}s</span>
        </div>
      </div>

      {/* Reaction Breakdown */}
      {topReactions.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/10">
          <p className="text-caption text-white/60 uppercase tracking-wide mb-2">Top Reactions</p>
          <div className="flex items-center gap-3">
            {topReactions.map(([emoji, count]) => (
              <div key={emoji} className="flex items-center gap-1">
                <span className="text-title">{emoji}</span>
                <span className="text-label text-white/80">{formatCount(count)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Hook to generate mock analytics for simulation mode
export function useExpressionAnalytics(expressionId: string) {
  // In simulation mode, generate consistent mock data based on expression ID
  const seed = expressionId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const analytics: ExpressionAnalytics = {
    views: 500 + (seed % 10000),
    reactions: 50 + (seed % 500),
    replies: 10 + (seed % 100),
    reactionBreakdown: {
      '❤️': 20 + (seed % 200),
      '🔥': 15 + (seed % 100),
      '😍': 10 + (seed % 80),
      '👏': 5 + (seed % 50),
      '💯': 3 + (seed % 30),
    },
    avgViewDuration: 3 + (seed % 5),
    completionRate: 65 + (seed % 30),
  };
  
  return { analytics, loading: false };
}

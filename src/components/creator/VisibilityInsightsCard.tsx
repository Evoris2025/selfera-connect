import { motion } from 'framer-motion';
import {
  Eye,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { VisibilityInsights } from '@/hooks/useCreatorScore';

const springGentle = { type: "spring" as const, stiffness: 200, damping: 25 };

interface VisibilityInsightsCardProps {
  insights: VisibilityInsights | null;
  loading?: boolean;
}

const VISIBILITY_TIER_CONFIG = {
  low: {
    label: 'Limited',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/30',
    description: 'Build your profile to increase visibility',
  },
  standard: {
    label: 'Standard',
    color: 'text-foreground',
    bgColor: 'bg-primary/10',
    description: 'Normal visibility in discovery',
  },
  boosted: {
    label: 'Boosted',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    description: 'Enhanced visibility in discovery',
  },
  premium: {
    label: 'Premium',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    description: 'Maximum visibility in discovery',
  },
};

export function VisibilityInsightsCard({ insights, loading }: VisibilityInsightsCardProps) {
  if (loading || !insights) {
    return (
      <GlassCard variant="subtle" className="p-5 animate-pulse">
        <div className="h-6 bg-muted/30 rounded w-1/3 mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-muted/20 rounded-xl" />
          <div className="h-20 bg-muted/20 rounded-xl" />
        </div>
      </GlassCard>
    );
  }

  const tierConfig = VISIBILITY_TIER_CONFIG[insights.visibilityTier];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springGentle}
    >
      <GlassCard variant="subtle" className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Visibility Insights
          </h3>
          <Badge 
            variant="secondary" 
            className={`${tierConfig.bgColor} ${tierConfig.color} border-0`}
          >
            <Eye className="w-3 h-3 mr-1" />
            {tierConfig.label}
          </Badge>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Estimated Reach */}
          <div className="rounded-xl bg-card/40 border border-white/[0.06] p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Est. Reach</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              {insights.estimatedReach.toLocaleString()}
            </p>
          </div>

          {/* Profile Views */}
          <div className="rounded-xl bg-card/40 border border-white/[0.06] p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Profile Views</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              {insights.profileViews.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground">Last 30 days</span>
          </div>

          {/* Interaction Views */}
          <div className="rounded-xl bg-card/40 border border-white/[0.06] p-3">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Interaction Views</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              {insights.interactionViews.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground">Last 30 days</span>
          </div>

          {/* Completion Rate */}
          <div className="rounded-xl bg-card/40 border border-white/[0.06] p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Completion</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              {insights.completionRate}%
            </p>
            <Progress 
              value={insights.completionRate} 
              className="h-1 mt-1" 
            />
          </div>
        </div>

        {/* Visibility Tier Info */}
        <div className={`rounded-xl ${tierConfig.bgColor} p-3 mb-4`}>
          <p className={`text-sm font-medium ${tierConfig.color} mb-1`}>
            {tierConfig.label} Visibility
          </p>
          <p className="text-xs text-muted-foreground">
            {tierConfig.description}
          </p>
        </div>

        {/* Eligibility Status */}
        <div className="flex items-start gap-3 rounded-xl bg-card/30 border border-white/5 p-3">
          {insights.eligibleForEarnings ? (
            <>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-400">
                  Earning Ready
                </p>
                <p className="text-xs text-muted-foreground">
                  Your account meets all eligibility requirements
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Building Eligibility
                </p>
                <p className="text-xs text-muted-foreground">
                  {insights.eligibilityReason || 'Continue building your profile'}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-muted-foreground/60 text-center mt-4">
          Metrics are estimates based on platform activity. Earnings features coming soon.
        </p>
      </GlassCard>
    </motion.div>
  );
}

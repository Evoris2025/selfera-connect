import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Users,
  Clock,
  Check,
  ArrowRight,
  Eye,
  LayoutGrid,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EraTier, ERA_TIER_CONFIG } from '@/lib/eraTiers';
import { VisibilityInsightsCard } from '@/components/creator/VisibilityInsightsCard';
import { useCreatorScore } from '@/hooks/useCreatorScore';

const springGentle = { type: "spring" as const, stiffness: 260, damping: 28 };

interface CreatorViewProps {
  subscriberCount: number;
  pendingInteractions: number;
  confirmedInteractions: number;
  tierColour: EraTier | null;
  isVerified: boolean;
}

export function CreatorView({
  subscriberCount,
  pendingInteractions,
  confirmedInteractions,
  tierColour,
  isVerified,
}: CreatorViewProps) {
  const navigate = useNavigate();
  const tierConfig = tierColour ? ERA_TIER_CONFIG[tierColour] : ERA_TIER_CONFIG.green;
  
  // Creator score and visibility insights
  const { 
    score, 
    loading: scoreLoading, 
    recalculateScore, 
    getVisibilityInsights 
  } = useCreatorScore();

  // Recalculate score when tier changes
  useEffect(() => {
    if (tierColour && score) {
      recalculateScore(tierColour);
    }
  }, [tierColour, recalculateScore, score]);

  const insights = getVisibilityInsights();

  return (
    <motion.section
      className="px-4 mt-6 space-y-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springGentle, delay: 0.2 }}
    >
      {/* Creator Dashboard Header */}
      <motion.div
        className="relative overflow-hidden bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-card/40 backdrop-blur-lg border border-amber-500/20 p-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.25 }}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-title font-semibold text-foreground mb-1">
              Your Creator Dashboard
            </h3>
            <p className="text-body text-muted-foreground">
              Grow your community and connect with supporters
            </p>
          </div>
          {isVerified && (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-label">
              <Check className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-2 gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.3 }}
      >
        {/* Subscriber Count */}
        <div className="bg-card/40 border border-white/[0.06] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-label text-muted-foreground">Subscribers</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{subscriberCount.toLocaleString()}</p>
        </div>

        {/* Visibility Tier */}
        <div className="bg-card/40 border border-white/[0.06] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-primary" />
            <span className="text-label text-muted-foreground">Visibility Tier</span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: tierConfig.color }}
            />
            <span className="text-title font-semibold text-foreground capitalize">
              {tierColour || 'Green'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Interaction Requests */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.35 }}
      >
        <h3 className="text-body font-medium text-foreground flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-primary" />
          Interaction Requests
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {/* Pending */}
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 text-center">
            <Clock className="w-5 h-5 mx-auto mb-1 text-amber-400" />
            <p className="text-headline font-bold text-foreground">{pendingInteractions}</p>
            <p className="text-label text-muted-foreground">Pending</p>
          </div>

          {/* Confirmed */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
            <Check className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
            <p className="text-headline font-bold text-foreground">{confirmedInteractions}</p>
            <p className="text-label text-muted-foreground">Confirmed</p>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.4 }}
      >
        <Button
          className="w-full rounded-full h-11"
          onClick={() => navigate('/profile')}
        >
          <LayoutGrid className="w-4 h-4 mr-2" />
          Manage your content
          <ArrowRight className="w-4 h-4 ml-auto" />
        </Button>

        <Button
          variant="secondary"
          className="w-full rounded-full h-11"
          onClick={() => navigate('/provider-dashboard')}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          View your interactions
          <ArrowRight className="w-4 h-4 ml-auto" />
        </Button>
      </motion.div>

      {/* Visibility Insights - Phase H */}
      <VisibilityInsightsCard 
        insights={insights} 
        loading={scoreLoading} 
      />

      {/* Tier Info */}
      <motion.div
        className="bg-card/30 border border-white/5 p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 flex items-center justify-center"
            style={{ backgroundColor: `${tierConfig.color}20` }}
          >
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: tierConfig.color }}
            />
          </div>
          <div className="flex-1">
            <p className="text-body font-medium text-foreground">
              {tierConfig.label} Tier
            </p>
            <p className="text-label text-muted-foreground">
              Interaction cap: ${tierConfig.interactionCap.toFixed(2)}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}

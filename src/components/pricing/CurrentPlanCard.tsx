import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ChevronRight, 
  Check,
  Calendar,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription, PLAN_DETAILS } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const springGentle = { type: "spring" as const, stiffness: 200, damping: 25 };

const planGradients: Record<string, string> = {
  free: 'from-emerald-500/10 via-teal-500/10 to-cyan-500/10',
  creator: 'from-amber-500/10 via-orange-500/10 to-rose-500/10',
  professional: 'from-blue-500/10 via-indigo-500/10 to-violet-500/10',
  organization: 'from-violet-500/10 via-purple-500/10 to-fuchsia-500/10',
};

const planAccentBadge: Record<string, string> = {
  free: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  creator: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  professional: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  organization: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
};

export function CurrentPlanCard() {
  const navigate = useNavigate();
  const { subscription, currentPlan, loading } = useSubscription();

  if (loading) {
    return (
      <Skeleton className="h-40 rounded-2xl" />
    );
  }

  const planDetails = PLAN_DETAILS.find(p => p.id === currentPlan);
  const isPaid = currentPlan !== 'free';

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${planGradients[currentPlan]} backdrop-blur-sm`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springGentle}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Gradient accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500" />
      
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-foreground">
                  {planDetails?.name} Plan
                </h3>
                <Badge className={`${planAccentBadge[currentPlan]} text-[10px] px-1.5`}>
                  Active
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {planDetails?.description}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Current period</p>
              {isPaid && subscription?.current_period_end ? (
                <div className="flex items-center gap-1.5 text-sm text-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Renews {format(new Date(subscription.current_period_end), 'MMM d, yyyy')}</span>
                </div>
              ) : (
                <p className="text-sm text-foreground">Forever free</p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-white/10 hover:bg-white/5"
              onClick={() => navigate('/settings?view=billing')}
            >
              {currentPlan === 'free' ? 'View plans' : 'Manage'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

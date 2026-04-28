import { motion } from 'framer-motion';
import { Check, Sparkles, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { PlanDetails, SubscriptionPlan, BillingPeriod } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';

interface PlanCardProps {
  plan: PlanDetails;
  currentPlan: SubscriptionPlan;
  billingPeriod: BillingPeriod;
  onSelect?: (planId: SubscriptionPlan) => void;
  isAvailable: boolean;
  className?: string;
}

const springGentle = { type: "spring" as const, stiffness: 200, damping: 25 };

export function PlanCard({
  plan,
  currentPlan,
  billingPeriod,
  onSelect,
  isAvailable,
  className,
}: PlanCardProps) {
  const isCurrent = currentPlan === plan.id;
  const price = billingPeriod === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
  const savingsPercent = plan.monthlyPrice && plan.yearlyPrice 
    ? Math.round((1 - (plan.yearlyPrice / 12) / plan.monthlyPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springGentle}
      className={className}
    >
      <GlassCard
        variant="card"
        className={cn(
          'relative p-5 h-full flex flex-col',
          plan.popular && 'ring-2 ring-primary/50',
          isCurrent && 'ring-2 ring-emerald-500/50'
        )}
      >
        {/* Popular badge */}
        {plan.popular && !isCurrent && (
          <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-label">
            Most popular
          </Badge>
        )}

        {/* Current badge */}
        {isCurrent && (
          <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-label">
            Current plan
          </Badge>
        )}

        {/* Header */}
        <div className="mb-4">
          <h3 className="text-title font-semibold text-foreground">{plan.name}</h3>
          <p className="text-body text-muted-foreground mt-1">{plan.description}</p>
        </div>

        {/* Price */}
        <div className="mb-5">
          {price !== null ? (
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">${price}</span>
              <span className="text-body text-muted-foreground">
                /{billingPeriod === 'yearly' ? 'year' : 'month'}
              </span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">Free</span>
              <span className="text-body text-muted-foreground">forever</span>
            </div>
          )}

          {billingPeriod === 'yearly' && savingsPercent > 0 && (
            <p className="text-label text-emerald-400 mt-1">
              Save {savingsPercent}% with yearly billing
            </p>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-2.5 flex-1 mb-5">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <Check className={cn(
                'w-4 h-4 mt-0.5 shrink-0',
                feature.highlight ? 'text-primary' : 'text-emerald-400'
              )} />
              <span className={cn(
                'text-body',
                feature.highlight ? 'text-foreground font-medium' : 'text-muted-foreground'
              )}>
                {feature.name}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Button
          variant={isCurrent ? 'secondary' : plan.popular ? 'default' : 'outline'}
          className="w-full rounded-xl"
          disabled={isCurrent || !isAvailable}
          onClick={() => !isCurrent && isAvailable && onSelect?.(plan.id)}
        >
          {isCurrent ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Current plan
            </>
          ) : !isAvailable ? (
            <>
              <Clock className="w-4 h-4 mr-2" />
              Coming soon
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade
            </>
          )}
        </Button>
      </GlassCard>
    </motion.div>
  );
}

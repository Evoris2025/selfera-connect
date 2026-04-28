import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSubscription, SubscriptionPlan, BillingPeriod } from '@/hooks/useSubscription';
import { PlanCard } from './PlanCard';
import { TransparencyPanel } from './TransparencyPanel';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

const springGentle = { type: "spring" as const, stiffness: 200, damping: 25 };

interface PricingSectionProps {
  showTransparency?: boolean;
}

export function PricingSection({ showTransparency = true }: PricingSectionProps) {
  const { currentPlan, loading, allPlans, isPlanAvailable } = useSubscription();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');

  const handleSelectPlan = (planId: SubscriptionPlan) => {
    // When Stripe is integrated, this will trigger the upgrade flow
    console.log('Selected plan:', planId);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-96 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springGentle}
      >
        <h2 className="text-headline font-semibold text-foreground mb-2">
          Choose your path
        </h2>
        <p className="text-body text-muted-foreground max-w-md mx-auto">
          Core social features are free forever. Upgrade for professional tools.
        </p>
      </motion.div>

      {/* Billing toggle */}
      <motion.div 
        className="flex justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.05 }}
      >
        <Tabs value={billingPeriod} onValueChange={(v) => setBillingPeriod(v as BillingPeriod)}>
          <TabsList className="rounded-full">
            <TabsTrigger value="monthly" className="rounded-full px-6">
              Monthly
            </TabsTrigger>
            <TabsTrigger value="yearly" className="rounded-full px-6">
              Yearly
              <span className="ml-2 text-label text-emerald-400">Save up to 26%</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {allPlans.map((plan, idx) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            currentPlan={currentPlan}
            billingPeriod={billingPeriod}
            onSelect={handleSelectPlan}
            isAvailable={isPlanAvailable(plan.id)}
            className={`transition-all duration-200 ${idx > 0 ? 'delay-' + (idx * 50) : ''}`}
          />
        ))}
      </div>

      {/* Transparency panel */}
      {showTransparency && <TransparencyPanel />}
    </div>
  );
}

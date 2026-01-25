import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Sparkles,
  Shield,
  Building2,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useSubscription } from '@/hooks/useSubscription';
import { 
  ERA_TIER_CONFIG, 
  ERA_TIER_PRICES, 
  formatPrice,
  EraTier,
  PlanType,
  CLIENT_BASE_PRICE,
} from '@/lib/eraTiers';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const springGentle = { type: "spring" as const, stiffness: 260, damping: 28 };

// Plan options for selection
const PLAN_OPTIONS = [
  {
    id: 'free',
    planType: 'free' as PlanType,
    tierColour: null,
    name: 'Free',
    description: 'Full social access, forever free',
    price: 0,
    icon: Users,
    features: ['Post content & expressions', 'Join communities', 'Message peers', 'Discover providers'],
  },
  {
    id: 'client',
    planType: 'client' as PlanType,
    tierColour: 'pink' as EraTier,
    name: 'Client Paid',
    description: 'Unlock interactions with verified providers',
    price: CLIENT_BASE_PRICE,
    icon: Sparkles,
    features: ['Everything in Free', 'Request interactions', 'Pink ERA Verified tick', 'Priority support'],
  },
  {
    id: 'provider_green',
    planType: 'provider' as PlanType,
    tierColour: 'green' as EraTier,
    name: 'Verified Provider',
    description: 'For verified mental health professionals',
    price: ERA_TIER_PRICES.green,
    icon: Shield,
    features: ['Directory listing', 'Receive interaction requests', 'Green ERA Verified tick', 'Provider dashboard'],
  },
];

interface BillingSettingsViewProps {
  className?: string;
}

export function BillingSettingsView({ className }: BillingSettingsViewProps) {
  const { user } = useAuth();
  const { subscription, loading, refresh } = useSubscription();
  const [upgrading, setUpgrading] = useState(false);
  
  // Extract subscription details with fallbacks
  const currentPlanType = (subscription as any)?.plan_type || 'free';
  const currentTierColour = (subscription as any)?.tier_colour || null;
  const currentStatus = subscription?.status || 'active';
  const currentPeriodEnd = subscription?.current_period_end || null;
  const amountDue = (subscription as any)?.amount_due || 0;
  
  // Get billing status
  const getBillingStatus = () => {
    if (currentStatus === 'past_due') return 'overdue';
    if (!currentPeriodEnd) return 'up_to_date';
    
    const now = new Date();
    const dueDate = new Date(currentPeriodEnd);
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue < 0) return 'overdue';
    if (daysUntilDue <= 7) return 'due_soon';
    return 'up_to_date';
  };
  
  const billingStatus = getBillingStatus();
  const tierConfig = currentTierColour ? ERA_TIER_CONFIG[currentTierColour as EraTier] : null;
  
  // Simulated plan change (for testing)
  const handlePlanChange = async (planType: PlanType, tierColour: EraTier | null) => {
    if (!user) return;
    
    setUpgrading(true);
    try {
      // Calculate dates for simulation
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          plan_type: planType,
          tier_colour: tierColour,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          status: 'active',
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast.success(`Plan updated to ${planType === 'free' ? 'Free' : tierConfig?.label || planType}`);
      refresh();
    } catch (err) {
      console.error('Error updating plan:', err);
      toast.error('Failed to update plan');
    } finally {
      setUpgrading(false);
    }
  };
  
  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="h-48 bg-muted/20 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Plan Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springGentle}
      >
        <Card className="bg-card/40 backdrop-blur-lg border-white/[0.06]">
          <CardHeader>
            <CardTitle className="text-lg">Current Plan</CardTitle>
            <CardDescription>Your active subscription and billing details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Plan Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tierConfig?.bgClass || 'bg-muted/20'
                }`}>
                  <Shield className={`w-5 h-5 ${tierConfig?.colorClass || 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {currentPlanType === 'free' ? 'Free' : tierConfig?.label || currentPlanType}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentPlanType === 'free' 
                      ? 'No billing' 
                      : formatPrice(currentTierColour ? ERA_TIER_PRICES[currentTierColour as EraTier] : 0) + '/month'
                    }
                  </p>
                </div>
              </div>
              {tierConfig && (
                <Badge 
                  variant="outline" 
                  className={`${tierConfig.bgClass} ${tierConfig.colorClass} ${tierConfig.borderClass}`}
                >
                  {tierConfig.label}
                </Badge>
              )}
            </div>
            
            <Separator className="bg-white/[0.06]" />
            
            {/* Billing Status */}
            {currentPlanType !== 'free' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Status</p>
                    <div className={`flex items-center gap-1.5 ${
                      billingStatus === 'overdue' ? 'text-red-500' : 
                      billingStatus === 'due_soon' ? 'text-amber-500' : 'text-green-500'
                    }`}>
                      {billingStatus === 'overdue' ? <AlertCircle className="w-4 h-4" /> :
                       billingStatus === 'due_soon' ? <Clock className="w-4 h-4" /> : 
                       <CheckCircle className="w-4 h-4" />}
                      <span className="text-sm font-medium capitalize">{billingStatus.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Next Billing</p>
                    <p className="text-sm font-medium text-foreground">
                      {currentPeriodEnd ? format(new Date(currentPeriodEnd), 'MMM d, yyyy') : '—'}
                    </p>
                  </div>
                </div>
                
                {amountDue > 0 && billingStatus === 'overdue' && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="text-sm text-red-500 font-medium">
                      Amount due: {formatPrice(amountDue)}
                    </p>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      className="mt-2"
                      onClick={() => toast.info('Payment processing coming soon')}
                    >
                      Pay now
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Available Plans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.1 }}
      >
        <Card className="bg-card/40 backdrop-blur-lg border-white/[0.06]">
          <CardHeader>
            <CardTitle className="text-lg">Available Plans</CardTitle>
            <CardDescription>Choose a plan that fits your needs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {PLAN_OPTIONS.map((plan) => {
              const isCurrentPlan = currentPlanType === plan.planType && 
                (plan.tierColour === null || currentTierColour === plan.tierColour);
              const PlanIcon = plan.icon;
              const planTierConfig = plan.tierColour ? ERA_TIER_CONFIG[plan.tierColour] : null;
              
              return (
                <div
                  key={plan.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrentPlan 
                      ? 'border-primary/50 bg-primary/5' 
                      : 'border-white/[0.06] hover:border-white/[0.12] bg-card/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        planTierConfig?.bgClass || 'bg-muted/20'
                      }`}>
                        <PlanIcon className={`w-4 h-4 ${planTierConfig?.colorClass || 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{plan.name}</p>
                          {isCurrentPlan && (
                            <Badge variant="secondary" className="text-xs">Current</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                        <p className="text-lg font-bold text-foreground mt-1">
                          {plan.price === 0 ? 'Free' : `${formatPrice(plan.price)}/mo`}
                        </p>
                      </div>
                    </div>
                    
                    {!isCurrentPlan && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={upgrading}
                        onClick={() => handlePlanChange(plan.planType, plan.tierColour)}
                      >
                        {upgrading ? 'Updating...' : 'Select'}
                      </Button>
                    )}
                  </div>
                  
                  {/* Features */}
                  <div className="mt-3 pt-3 border-t border-white/[0.06]">
                    <ul className="grid grid-cols-2 gap-1">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Simulation Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
      >
        <p className="text-sm text-amber-500">
          <strong>Testing Mode:</strong> Plan changes are simulated and persisted to the database for testing. 
          Payment processing is not yet connected.
        </p>
      </motion.div>
    </div>
  );
}

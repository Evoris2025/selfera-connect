import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ERA_TIER_CONFIG, 
  ERA_TIER_PRICES, 
  formatPrice,
  EraTier,
  PlanType,
} from '@/lib/eraTiers';

const springGentle = { type: "spring" as const, stiffness: 260, damping: 28 };

type BillingStatus = 'up_to_date' | 'due_soon' | 'overdue';

interface EraAccountStatusCardProps {
  planType: PlanType;
  tierColour: EraTier | null;
  status: string;
  currentPeriodEnd: string | null;
  amountDue: number;
  isVerified: boolean;
}

function getBillingStatus(
  periodEnd: string | null,
  status: string
): BillingStatus {
  if (status === 'past_due') return 'overdue';
  if (!periodEnd) return 'up_to_date';
  
  const now = new Date();
  const dueDate = new Date(periodEnd);
  const daysUntilDue = Math.ceil(
    (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue <= 7) return 'due_soon';
  return 'up_to_date';
}

const billingStatusConfig = {
  up_to_date: {
    label: 'Up to date',
    icon: CheckCircle,
    colorClass: 'text-green-500',
    bgClass: 'bg-green-500/10',
  },
  due_soon: {
    label: 'Due soon',
    icon: Clock,
    colorClass: 'text-amber-500',
    bgClass: 'bg-amber-500/10',
  },
  overdue: {
    label: 'Overdue',
    icon: AlertCircle,
    colorClass: 'text-red-500',
    bgClass: 'bg-red-500/10',
  },
};

export function EraAccountStatusCard({
  planType,
  tierColour,
  status,
  currentPeriodEnd,
  amountDue,
  isVerified,
}: EraAccountStatusCardProps) {
  const navigate = useNavigate();
  
  const billingStatus = planType !== 'free' 
    ? getBillingStatus(currentPeriodEnd, status) 
    : 'up_to_date';
  
  const billingConfig = billingStatusConfig[billingStatus];
  const BillingIcon = billingConfig.icon;
  
  const tierConfig = tierColour ? ERA_TIER_CONFIG[tierColour] : null;
  const tierPrice = tierColour ? ERA_TIER_PRICES[tierColour] : 0;
  
  // Determine account type label
  const getAccountTypeLabel = () => {
    if (planType === 'free') return 'Free Account';
    if (planType === 'client') return 'Client Paid';
    if (planType === 'provider') return 'Verified Provider';
    return 'Free Account';
  };
  
  // Determine CTA
  const getCTA = () => {
    if (planType === 'free') {
      return { label: 'View plans', action: () => navigate('/settings?view=billing') };
    }
    if (billingStatus === 'overdue') {
      return { label: 'Pay now', action: () => navigate('/settings?view=billing') };
    }
    if (billingStatus === 'due_soon') {
      return { label: 'Update payment', action: () => navigate('/settings?view=billing') };
    }
    return { label: 'Manage plan', action: () => navigate('/settings?view=billing') };
  };
  
  const cta = getCTA();

  return (
    <motion.div
      className="bg-card/40 backdrop-blur-lg border border-white/[0.06] p-4 flex flex-col gap-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springGentle}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
            <Shield className="w-3.5 h-3.5 text-primary" />
          </div>
          <h3 className="text-body font-semibold text-foreground truncate">ERA Account Status</h3>
        </div>
        {tierConfig && (
          <Badge
            variant="outline"
            className={`${tierConfig.bgClass} ${tierConfig.colorClass} ${tierConfig.borderClass} text-caption flex-shrink-0`}
          >
            {tierConfig.label}
          </Badge>
        )}
      </div>

      {/* Account Type */}
      <div>
        <p className="text-caption text-muted-foreground uppercase tracking-wide">Account Type</p>
        <p className="text-body font-semibold text-foreground">{getAccountTypeLabel()}</p>
        {tierConfig && (
          <p className="text-caption text-muted-foreground mt-0.5 line-clamp-1">{tierConfig.description}</p>
        )}
      </div>

      {/* Billing Status - Only show for paid plans */}
      {planType !== 'free' && (
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/[0.06]">
          {/* Status */}
          <div>
            <p className="text-caption text-muted-foreground uppercase tracking-wide">Billing Status</p>
            <div className={`flex items-center gap-1 ${billingConfig.colorClass}`}>
              <BillingIcon className="w-3.5 h-3.5" />
              <span className="text-label font-medium">{billingConfig.label}</span>
            </div>
          </div>

          {/* Next Billing */}
          <div>
            <p className="text-caption text-muted-foreground uppercase tracking-wide">
              {billingStatus === 'overdue' ? 'Amount Due' : 'Next Billing'}
            </p>
            <p className={`text-label font-medium ${billingStatus === 'overdue' ? 'text-red-500' : 'text-foreground'}`}>
              {billingStatus === 'overdue'
                ? formatPrice(amountDue > 0 ? amountDue : tierPrice)
                : currentPeriodEnd
                  ? format(new Date(currentPeriodEnd), 'MMM d, yyyy')
                  : '—'
              }
            </p>
          </div>
        </div>
      )}

      {/* Monthly Amount - For paid plans */}
      {planType !== 'free' && (
        <div className="pt-2 border-t border-white/[0.06]">
          <p className="text-caption text-muted-foreground uppercase tracking-wide">Monthly Amount</p>
          <p className="text-title font-bold text-foreground">{formatPrice(tierPrice)}</p>
        </div>
      )}

      {/* CTA Button */}
      <Button
        variant={billingStatus === 'overdue' ? 'destructive' : 'secondary'}
        size="sm"
        className="w-full rounded-xl mt-1"
        onClick={cta.action}
      >
        {cta.label}
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </motion.div>
  );
}

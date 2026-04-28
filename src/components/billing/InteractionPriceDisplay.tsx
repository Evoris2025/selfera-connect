import { motion } from 'framer-motion';
import { Info, ArrowRight } from 'lucide-react';
import { 
  calculateInteractionAmountDue, 
  formatPrice, 
  EraTier, 
  ERA_TIER_PRICES,
  CLIENT_BASE_PRICE,
  ERA_TIER_CONFIG,
} from '@/lib/eraTiers';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface InteractionPriceDisplayProps {
  providerTier: EraTier;
  className?: string;
  showBreakdown?: boolean;
}

/**
 * Displays the interaction price with optional breakdown
 * Shows the "pay the difference" calculation clearly
 */
export function InteractionPriceDisplay({
  providerTier,
  className = '',
  showBreakdown = true,
}: InteractionPriceDisplayProps) {
  const tierPrice = ERA_TIER_PRICES[providerTier];
  const amountDue = calculateInteractionAmountDue(providerTier);
  const tierConfig = ERA_TIER_CONFIG[providerTier];
  
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Main Price */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-body text-muted-foreground">Interaction Fee</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-label">
                  As a Client Paid subscriber ({formatPrice(CLIENT_BASE_PRICE)}/mo), 
                  you only pay the difference to interact with this provider.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <motion.span
          className="text-title font-bold text-foreground"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {amountDue === 0 ? 'Included' : formatPrice(amountDue)}
        </motion.span>
      </div>
      
      {/* Breakdown */}
      {showBreakdown && amountDue > 0 && (
        <motion.div
          className="p-3 rounded-xl bg-muted/10 border border-white/[0.06] space-y-1.5"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <div className="flex items-center justify-between text-label">
            <span className="text-muted-foreground">Provider tier price</span>
            <span className={`font-medium ${tierConfig.colorClass}`}>
              {formatPrice(tierPrice)}
            </span>
          </div>
          <div className="flex items-center justify-between text-label">
            <span className="text-muted-foreground">Your subscription covers</span>
            <span className="font-medium text-green-500">
              -{formatPrice(CLIENT_BASE_PRICE)}
            </span>
          </div>
          <div className="flex items-center justify-between text-label pt-1.5 border-t border-white/[0.06]">
            <span className="text-muted-foreground">You pay</span>
            <span className="font-bold text-foreground">
              {formatPrice(amountDue)}
            </span>
          </div>
        </motion.div>
      )}
      
      {/* Included Message for Green Tier */}
      {amountDue === 0 && (
        <motion.div
          className="p-3 rounded-xl bg-green-500/10 border border-green-500/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-label text-green-500">
            ✓ Included with your Client Paid subscription
          </p>
        </motion.div>
      )}
    </div>
  );
}

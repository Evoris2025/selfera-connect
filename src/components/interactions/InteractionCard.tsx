// Phase F - Interaction Card Component
// Displays an interaction with actions based on status and user role

import { motion } from 'framer-motion';
import {
  Check,
  X,
  Clock,
  MessageCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CinematicAvatar } from '@/components/ui/CinematicAvatar';
import { FlagInteractionButton } from './FlagInteractionButton';
import { formatPrice } from '@/lib/eraTiers';
import type { Interaction, InteractionStatus } from '@/hooks/useInteractionLifecycle';

const springGentle = { type: "spring" as const, stiffness: 260, damping: 28 };

interface InteractionCardProps {
  interaction: Interaction;
  userRole: 'client' | 'provider';
  onAccept?: () => void;
  onDecline?: () => void;
  onConfirm?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
  onMessage?: () => void;
}

const statusConfig: Record<InteractionStatus, {
  label: string;
  icon: typeof Clock;
  colorClass: string;
  bgClass: string;
}> = {
  draft: {
    label: 'Draft',
    icon: Clock,
    colorClass: 'text-muted-foreground',
    bgClass: 'bg-muted/20',
  },
  requested: {
    label: 'Pending',
    icon: Clock,
    colorClass: 'text-amber-400',
    bgClass: 'bg-amber-500/10',
  },
  accepted: {
    label: 'Accepted',
    icon: CheckCircle2,
    colorClass: 'text-blue-400',
    bgClass: 'bg-blue-500/10',
  },
  declined: {
    label: 'Declined',
    icon: XCircle,
    colorClass: 'text-red-400',
    bgClass: 'bg-red-500/10',
  },
  confirmed: {
    label: 'Confirmed',
    icon: Check,
    colorClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500/10',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    colorClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500/10',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    colorClass: 'text-muted-foreground',
    bgClass: 'bg-muted/20',
  },
};

export function InteractionCard({
  interaction,
  userRole,
  onAccept,
  onDecline,
  onConfirm,
  onComplete,
  onCancel,
  onMessage,
}: InteractionCardProps) {
  const status = statusConfig[interaction.status];
  const StatusIcon = status.icon;
  
  // Determine who to display based on user role
  const otherParty = userRole === 'client' ? interaction.provider : interaction.client;
  const displayName = otherParty?.display_name || 'User';
  const handle = otherParty?.handle || 'user';
  const avatarUrl = otherParty?.avatar_url;

  // Format date
  const createdDate = new Date(interaction.created_at);
  const dateStr = createdDate.toLocaleDateString('en-AU', { 
    day: 'numeric', 
    month: 'short' 
  });

  // Determine available actions based on status and role
  const showAcceptDecline = userRole === 'provider' && interaction.status === 'requested';
  const showConfirm = userRole === 'client' && interaction.status === 'accepted';
  const showComplete = interaction.status === 'confirmed';
  const showCancel = ['requested', 'accepted', 'confirmed'].includes(interaction.status);
  const showMessage = ['accepted', 'confirmed'].includes(interaction.status);
  const isReadOnly = ['completed', 'cancelled', 'declined'].includes(interaction.status);

  return (
    <motion.div
      className={`border p-4 ${
        isReadOnly ? 'bg-card/30 border-white/5 opacity-70' : 'bg-card/50 border-white/[0.06]'
      }`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springGentle}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <CinematicAvatar
          src={avatarUrl || undefined}
          alt={displayName}
          fallback={displayName[0] || 'U'}
          size="md"
          ring={interaction.status === 'confirmed' ? 'gradient' : 'muted'}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-body font-medium text-foreground truncate">
              {displayName}
            </span>
            {otherParty?.is_verified && (
              <span className="text-primary text-label">✓</span>
            )}
          </div>
          <p className="text-label text-muted-foreground mb-2">
            @{handle} • {dateStr}
          </p>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge className={`${status.bgClass} ${status.colorClass} border-0 text-label`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {status.label}
            </Badge>
            {interaction.amount_due > 0 && (
              <span className="text-label text-muted-foreground">
                {formatPrice(interaction.amount_due)}
              </span>
            )}
          </div>

          {/* Notes */}
          {interaction.notes && (
            <p className="text-label text-muted-foreground mt-2 line-clamp-2">
              {interaction.notes}
            </p>
          )}
        </div>

        {/* Actions */}
        {!isReadOnly && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {showAcceptDecline && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={onDecline}
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  className="h-8"
                  onClick={onAccept}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Accept
                </Button>
              </>
            )}

            {showConfirm && (
              <Button
                size="sm"
                className="h-8"
                onClick={onConfirm}
              >
                <Check className="w-4 h-4 mr-1" />
                Confirm
              </Button>
            )}

            {showMessage && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={onMessage}
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
            )}

            {showComplete && (
              <Button
                size="sm"
                variant="secondary"
                className="h-8"
                onClick={onComplete}
              >
                Complete
              </Button>
            )}
          </div>
        )}

        {isReadOnly && (
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </div>

      {/* Cancel and Flag options - shown subtly */}
      {showCancel && (
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
          <button
            className="text-label text-muted-foreground hover:text-destructive transition-colors"
            onClick={onCancel}
          >
            Cancel interaction
          </button>
          <FlagInteractionButton 
            interactionId={interaction.id} 
            variant="ghost" 
            size="sm" 
          />
        </div>
      )}

      {/* Flag only for read-only states */}
      {isReadOnly && (
        <div className="mt-3 pt-3 border-t border-white/5 flex justify-end">
          <FlagInteractionButton 
            interactionId={interaction.id} 
            variant="ghost" 
            size="sm" 
          />
        </div>
      )}
    </motion.div>
  );
}

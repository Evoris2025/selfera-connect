// Phase F - Interaction List Component
// Displays grouped interactions with section headers

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, Check, History, XCircle } from 'lucide-react';
import { InteractionCard } from './InteractionCard';
import type { Interaction } from '@/hooks/useInteractionLifecycle';

const springGentle = { type: "spring" as const, stiffness: 260, damping: 28 };

interface InteractionListProps {
  pending: Interaction[];
  active: Interaction[];
  completed: Interaction[];
  cancelled?: Interaction[];
  userRole: 'client' | 'provider';
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onConfirm?: (id: string) => void;
  onComplete?: (id: string) => void;
  onCancel?: (id: string) => void;
  showCancelled?: boolean;
}

export function InteractionList({
  pending,
  active,
  completed,
  cancelled = [],
  userRole,
  onAccept,
  onDecline,
  onConfirm,
  onComplete,
  onCancel,
  showCancelled = false,
}: InteractionListProps) {
  const navigate = useNavigate();

  const handleMessage = (interaction: Interaction) => {
    const otherUserId = userRole === 'client' 
      ? interaction.provider_user_id 
      : interaction.client_user_id;
    navigate(`/messages?user=${otherUserId}`);
  };

  const isEmpty = pending.length === 0 && active.length === 0 && completed.length === 0;

  if (isEmpty) {
    return (
      <motion.div
        className="rounded-2xl bg-card/30 border border-white/5 p-8 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springGentle}
      >
        <History className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">
          No interactions yet
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          {userRole === 'client' 
            ? 'Request an interaction with a verified provider'
            : 'Interactions will appear here when clients request them'}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending / Incoming Requests */}
      {pending.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springGentle}
        >
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            {userRole === 'provider' ? 'Incoming Requests' : 'Pending Response'}
            <span className="text-xs text-muted-foreground">({pending.length})</span>
          </h3>
          <div className="space-y-3">
            {pending.map((interaction) => (
              <InteractionCard
                key={interaction.id}
                interaction={interaction}
                userRole={userRole}
                onAccept={onAccept ? () => onAccept(interaction.id) : undefined}
                onDecline={onDecline ? () => onDecline(interaction.id) : undefined}
                onConfirm={onConfirm ? () => onConfirm(interaction.id) : undefined}
                onCancel={onCancel ? () => onCancel(interaction.id) : undefined}
                onMessage={() => handleMessage(interaction)}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Active Interactions */}
      {active.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.05 }}
        >
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            Active Interactions
            <span className="text-xs text-muted-foreground">({active.length})</span>
          </h3>
          <div className="space-y-3">
            {active.map((interaction) => (
              <InteractionCard
                key={interaction.id}
                interaction={interaction}
                userRole={userRole}
                onComplete={onComplete ? () => onComplete(interaction.id) : undefined}
                onCancel={onCancel ? () => onCancel(interaction.id) : undefined}
                onMessage={() => handleMessage(interaction)}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Completed Interactions */}
      {completed.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.1 }}
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <History className="w-4 h-4" />
            Past Interactions
            <span className="text-xs">({completed.length})</span>
          </h3>
          <div className="space-y-3">
            {completed.slice(0, 5).map((interaction) => (
              <InteractionCard
                key={interaction.id}
                interaction={interaction}
                userRole={userRole}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Cancelled/Declined (optional) */}
      {showCancelled && cancelled.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.15 }}
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Cancelled
            <span className="text-xs">({cancelled.length})</span>
          </h3>
          <div className="space-y-3">
            {cancelled.slice(0, 3).map((interaction) => (
              <InteractionCard
                key={interaction.id}
                interaction={interaction}
                userRole={userRole}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

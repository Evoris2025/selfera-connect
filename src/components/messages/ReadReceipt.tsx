import { Check, CheckCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ReadReceiptProps {
  isSent: boolean;
  isDelivered?: boolean;
  isRead: boolean;
  readAt?: Date;
  showTimestamp?: boolean;
}

const springPop = { type: 'spring' as const, stiffness: 600, damping: 12 };

export function ReadReceipt({ 
  isSent, 
  isDelivered = true, 
  isRead, 
  readAt,
  showTimestamp = false 
}: ReadReceiptProps) {
  if (!isSent) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springPop}
      className="flex items-center gap-1"
    >
      {isRead ? (
        <CheckCheck 
          className={cn(
            "h-3.5 w-3.5 transition-colors duration-300",
            "text-primary"
          )} 
        />
      ) : isDelivered ? (
        <CheckCheck className="h-3.5 w-3.5 text-muted-foreground/50" />
      ) : (
        <Check className="h-3.5 w-3.5 text-muted-foreground/50" />
      )}
      
      {showTimestamp && isRead && readAt && (
        <span className="text-[10px] text-muted-foreground/60">
          Seen {formatDistanceToNow(readAt, { addSuffix: true })}
        </span>
      )}
    </motion.div>
  );
}

// Compact version for message list
export function ReadReceiptCompact({ isRead }: { isRead: boolean }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-[11px] text-muted-foreground/70 flex items-center gap-1 font-medium"
    >
      <CheckCheck 
        className={cn(
          "h-3.5 w-3.5",
          isRead ? "text-primary" : "text-muted-foreground/50"
        )} 
      />
      {isRead ? 'Seen' : 'Delivered'}
    </motion.span>
  );
}

import { ShieldOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useSafety } from '@/contexts/SafetyContext';

interface BlockedProfileStateProps {
  userId: string;
  isBlockedByMe: boolean;
}

export function BlockedProfileState({ userId, isBlockedByMe }: BlockedProfileStateProps) {
  const { unblockUser, isBlocking } = useSafety();

  const handleUnblock = async () => {
    await unblockUser(userId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6"
      >
        <ShieldOff className="w-10 h-10 text-muted-foreground" />
      </motion.div>
      
      <h2 className="text-xl font-semibold text-foreground mb-2">
        {isBlockedByMe ? "You've blocked this user" : "You can't view this profile"}
      </h2>
      
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        {isBlockedByMe 
          ? "You won't see their posts, comments, or be able to message them."
          : "This user has blocked you. You can't view their profile or content."
        }
      </p>
      
      {isBlockedByMe && (
        <Button
          variant="outline"
          onClick={handleUnblock}
          disabled={isBlocking}
          className="rounded-full px-6"
        >
          {isBlocking ? 'Unblocking...' : 'Unblock User'}
        </Button>
      )}
    </motion.div>
  );
}

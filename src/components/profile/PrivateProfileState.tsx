import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FollowButton } from '@/components/interactions';

interface PrivateProfileStateProps {
  displayName: string;
  isFollowing: boolean;
  isPending?: boolean;
  onFollow: () => void;
}

export function PrivateProfileState({ 
  displayName, 
  isFollowing,
  isPending,
  onFollow 
}: PrivateProfileStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-16 h-16 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center mb-4"
      >
        <Lock className="w-7 h-7 text-muted-foreground" />
      </motion.div>
      
      <h3 className="text-lg font-semibold text-foreground mb-1">
        This account is private
      </h3>
      
      <p className="text-sm text-muted-foreground max-w-xs mb-5">
        Follow {displayName} to see their posts, expressions, and reels.
      </p>
      
      {!isFollowing && !isPending && (
        <FollowButton
          isFollowing={false}
          onToggle={onFollow}
          size="md"
          variant="gradient"
          className="rounded-full px-8"
        />
      )}
      
      {isPending && (
        <Button
          variant="outline"
          disabled
          className="rounded-full px-8"
        >
          Request Pending
        </Button>
      )}
    </motion.div>
  );
}

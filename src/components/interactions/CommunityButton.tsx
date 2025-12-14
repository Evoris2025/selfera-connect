import { useState, useEffect } from 'react';
import { Users, UserPlus, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { usePersonalCommunity } from '@/hooks/usePersonalCommunity';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface CommunityButtonProps {
  authorId: string;
  authorName: string;
  size?: 'sm' | 'md' | 'lg';
}

const springConfig = { type: "spring" as const, stiffness: 500, damping: 25 };

export function CommunityButton({ authorId, authorName, size = 'md' }: CommunityButtonProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isInCommunity, isLoading, toggleCommunityMember } = usePersonalCommunity(authorId);
  const [showSuccess, setShowSuccess] = useState(false);

  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-7 w-7',
  };

  const handleClick = async () => {
    if (!user) {
      toast({
        title: t('auth.required'),
        description: t('community.loginToAdd'),
        variant: 'destructive',
      });
      return;
    }

    // Prevent adding yourself
    if (user.id === authorId) {
      toast({
        title: t('community.cannotAddSelf'),
        description: t('community.cannotAddSelfDesc'),
        variant: 'destructive',
      });
      return;
    }

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    const wasAdded = await toggleCommunityMember(authorId);
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 400);

    toast({
      title: wasAdded ? t('community.added') : t('community.removed'),
      description: wasAdded 
        ? t('community.addedDesc', { name: authorName })
        : t('community.removedDesc', { name: authorName }),
    });
  };

  // Determine which icon to show
  const IconComponent = isInCommunity ? UserCheck : Users;

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      transition={springConfig}
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        'flex items-center transition-colors relative',
        isInCommunity 
          ? 'text-primary' 
          : 'text-foreground hover:text-muted-foreground',
        isLoading && 'opacity-50'
      )}
    >
      <motion.div
        animate={showSuccess ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <IconComponent 
          className={cn(
            sizeClasses[size],
            isInCommunity && 'fill-primary/20'
          )} 
        />
      </motion.div>
      
      {/* Success burst effect */}
      <AnimatePresence>
        {showSuccess && isInCommunity && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-full h-full rounded-full border-2 border-primary/50" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

import { useState, useEffect, useRef } from 'react';
import { Users, UserCheck } from 'lucide-react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useFeedCommunity } from '@/hooks/useFeedCommunity';
import { useAuth } from '@/contexts/AuthContext';
import { instagramAnimations, useReducedMotion, triggerHaptic } from '@/hooks/useInstagramAnimation';

// UUID validation helper
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

interface CommunityButtonProps {
  authorId?: string;
  authorName: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CommunityButton({ authorId, authorName, size = 'md' }: CommunityButtonProps) {
  // Don't render if authorId is invalid
  if (!authorId) {
    return null;
  }
  const { t } = useTranslation();
  const { user } = useAuth();
  const controls = useAnimationControls();
  const prefersReducedMotion = useReducedMotion();
  const { isInCommunity, isLoading, toggleCommunityMember } = useFeedCommunity(authorId);
  const [showSuccess, setShowSuccess] = useState(false);
  const prevInCommunityRef = useRef(isInCommunity);
  const isFirstRender = useRef(true);

  const sizeClasses = { sm: 'h-[18px] w-[18px]', md: 'h-6 w-6', lg: 'h-7 w-7' };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevInCommunityRef.current = isInCommunity;
      return;
    }

    if (isInCommunity && !prevInCommunityRef.current) {
      if (!prefersReducedMotion) controls.start(instagramAnimations.like);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 400);
    } else if (!isInCommunity && prevInCommunityRef.current) {
      if (!prefersReducedMotion) controls.start(instagramAnimations.unlike);
    }
    prevInCommunityRef.current = isInCommunity;
  }, [isInCommunity, controls, prefersReducedMotion]);

  const handlePointerDown = async (e: React.PointerEvent) => {
    e.preventDefault();
    if (!user) {
      return;
    }
    if (user.id === authorId) {
      return;
    }
    triggerHaptic('light');
    await toggleCommunityMember(authorId);
  };

  const IconComponent = isInCommunity ? UserCheck : Users;

  return (
    <motion.button
      animate={controls}
      onPointerDown={handlePointerDown}
      disabled={isLoading}
      className={cn('flex items-center relative touch-none select-none p-1', isInCommunity ? 'text-primary' : 'text-foreground hover:text-foreground/70', isLoading && 'opacity-50')}
      aria-label={isInCommunity ? 'Remove from community' : 'Add to community'}
    >
      <IconComponent className={cn(sizeClasses[size], isInCommunity && 'fill-current opacity-30')} />
      <AnimatePresence>
        {showSuccess && isInCommunity && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
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

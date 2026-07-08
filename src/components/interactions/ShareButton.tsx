import { useState } from 'react';
import { Send } from 'lucide-react';
import { motion, useAnimationControls } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ShareSheet } from './ShareSheet';
import { instagramAnimations, useReducedMotion, triggerHaptic } from '@/hooks/useInstagramAnimation';

interface ShareButtonProps {
  postId: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ShareButton({ postId, size = 'md' }: ShareButtonProps) {
  const controls = useAnimationControls();
  const prefersReducedMotion = useReducedMotion();
  const [showSheet, setShowSheet] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const sizeClasses = { sm: 'h-[18px] w-[18px]', md: 'h-6 w-6', lg: 'h-7 w-7' };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    triggerHaptic('light');
    if (!prefersReducedMotion) controls.start(instagramAnimations.shareTap);
    setShowSheet(true);
  };

  const handleShareSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 400);
  };

  return (
    <>
      <motion.button
        animate={controls}
        onPointerDown={handlePointerDown}
        className="flex items-center touch-none select-none p-1"
        aria-label="Share"
      >
        <Send className={cn(sizeClasses[size], 'text-foreground hover:text-foreground/70', showSuccess && 'text-primary')} />
      </motion.button>
      <ShareSheet open={showSheet} onOpenChange={setShowSheet} postId={postId} onSuccess={handleShareSuccess} />
    </>
  );
}

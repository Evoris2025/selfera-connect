import { useState } from 'react';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ShareSheet } from './ShareSheet';

interface ShareButtonProps {
  postId: string;
  size?: 'sm' | 'md' | 'lg';
}

const springConfig = { type: "spring" as const, stiffness: 500, damping: 25 };

export function ShareButton({ postId, size = 'md' }: ShareButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-7 w-7',
  };

  const handleClick = () => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(5);
    }
    
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 150);
    setShowSheet(true);
  };

  const handleShareSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 400);
  };

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.9 }}
        transition={springConfig}
        onClick={handleClick}
        className="flex items-center"
      >
        <motion.div
          animate={isAnimating ? { x: [0, 3, 0] } : {}}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <Send 
            className={cn(
              sizeClasses[size],
              'text-foreground hover:text-muted-foreground transition-colors',
              showSuccess && 'animate-icon-glow text-primary'
            )} 
          />
        </motion.div>
      </motion.button>

      <ShareSheet 
        open={showSheet} 
        onOpenChange={setShowSheet}
        postId={postId}
        onSuccess={handleShareSuccess}
      />
    </>
  );
}

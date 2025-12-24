import { forwardRef, useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Play } from 'lucide-react';

export interface ImmersiveMediaProps {
  src: string;
  alt?: string;
  type?: 'image' | 'video';
  poster?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'auto';
  overlay?: 'none' | 'subtle' | 'gradient' | 'full';
  className?: string;
  children?: ReactNode;
  onDoubleTap?: () => void;
  showHeartOnDoubleTap?: boolean;
}

const aspectClasses = {
  square: 'aspect-square',
  portrait: 'aspect-[4/5]',
  landscape: 'aspect-video',
  auto: '',
};

const overlayClasses = {
  none: '',
  subtle: 'after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:via-transparent after:to-background/40',
  gradient: 'fade-all',
  full: 'after:absolute after:inset-0 after:bg-gradient-to-b after:from-background/30 after:via-transparent after:to-background/90',
};

const ImmersiveMedia = forwardRef<HTMLDivElement, ImmersiveMediaProps>(
  ({ 
    src, 
    alt, 
    type = 'image', 
    poster,
    aspectRatio = 'square', 
    overlay = 'gradient',
    className, 
    children,
    onDoubleTap,
    showHeartOnDoubleTap = true,
  }, ref) => {
    const [showHeart, setShowHeart] = useState(false);
    const [lastTap, setLastTap] = useState(0);

    const handleTap = () => {
      const now = Date.now();
      if (now - lastTap < 300) {
        // Double tap
        if (showHeartOnDoubleTap) {
          setShowHeart(true);
          setTimeout(() => setShowHeart(false), 1000);
        }
        onDoubleTap?.();
        if (navigator.vibrate) {
          navigator.vibrate([10, 50, 10]);
        }
      }
      setLastTap(now);
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden w-full',
          aspectClasses[aspectRatio],
          overlayClasses[overlay],
          className
        )}
        onClick={handleTap}
      >
        {type === 'image' ? (
          <motion.img
            src={src}
            alt={alt || ''}
            className="w-full h-full object-cover img-cinematic"
            initial={{ scale: 1.02 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        ) : (
          <div className="relative w-full h-full">
            <video
              src={src}
              poster={poster}
              className="w-full h-full object-cover"
              playsInline
              muted
              loop
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-16 h-16 rounded-full bg-background/30 backdrop-blur-md flex items-center justify-center">
                <Play className="w-7 h-7 text-foreground fill-current ml-1" />
              </div>
            </motion.div>
          </div>
        )}

        {/* Double-tap heart animation */}
        <AnimatePresence>
          {showHeart && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ 
                type: 'spring',
                stiffness: 300,
                damping: 15,
              }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
            >
              <Heart className="h-28 w-28 fill-current text-primary drop-shadow-2xl" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay content */}
        {children && (
          <div className="absolute inset-0 z-10">
            {children}
          </div>
        )}
      </div>
    );
  }
);

ImmersiveMedia.displayName = 'ImmersiveMedia';

export { ImmersiveMedia };

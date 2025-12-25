import { forwardRef, useState, useRef, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Play, Pause, Volume2, VolumeX } from 'lucide-react';

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
  onClick?: () => void;
  showHeartOnDoubleTap?: boolean;
  autoPlay?: boolean;
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
    onClick,
    showHeartOnDoubleTap = true,
    autoPlay = true,
  }, ref) => {
    const [showHeart, setShowHeart] = useState(false);
    const [lastTap, setLastTap] = useState(0);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [isMuted, setIsMuted] = useState(true);
    const [showControls, setShowControls] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Auto-play video when in viewport
    useEffect(() => {
      if (type !== 'video' || !videoRef.current) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && autoPlay) {
              videoRef.current?.play().catch(() => {});
              setIsPlaying(true);
            } else {
              videoRef.current?.pause();
              setIsPlaying(false);
            }
          });
        },
        { threshold: 0.5 }
      );

      observer.observe(videoRef.current);
      return () => observer.disconnect();
    }, [type, autoPlay]);

    const handleTap = (e: React.MouseEvent) => {
      const now = Date.now();
      if (now - lastTap < 300) {
        // Double tap
        e.stopPropagation();
        if (showHeartOnDoubleTap) {
          setShowHeart(true);
          setTimeout(() => setShowHeart(false), 1000);
        }
        onDoubleTap?.();
        if (navigator.vibrate) {
          navigator.vibrate([10, 50, 10]);
        }
      } else {
        // Single tap - show controls for video, or call onClick
        if (type === 'video') {
          setShowControls(true);
          setTimeout(() => setShowControls(false), 3000);
        } else {
          onClick?.();
        }
      }
      setLastTap(now);
    };

    const togglePlay = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          videoRef.current.play().catch(() => {});
        }
        setIsPlaying(!isPlaying);
      }
    };

    const toggleMute = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (videoRef.current) {
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
      }
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
          <img
            src={src}
            alt={alt || ''}
            className="w-full h-full object-cover img-cinematic"
          />
        ) : (
          <div className="relative w-full h-full group">
            <video
              ref={videoRef}
              src={src}
              poster={poster}
              className="w-full h-full object-cover"
              playsInline
              muted={isMuted}
              loop
              preload="metadata"
            />
            
            {/* Video controls overlay */}
            <AnimatePresence>
              {(showControls || !isPlaying) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/20 z-20"
                >
                  <motion.button
                    onClick={togglePlay}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-16 h-16 rounded-full bg-background/30 backdrop-blur-md flex items-center justify-center"
                  >
                    {isPlaying ? (
                      <Pause className="w-7 h-7 text-foreground fill-current" />
                    ) : (
                      <Play className="w-7 h-7 text-foreground fill-current ml-1" />
                    )}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mute button - always visible on hover */}
            <motion.button
              onClick={toggleMute}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-background/40 backdrop-blur-sm flex items-center justify-center z-30 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-foreground" />
              ) : (
                <Volume2 className="w-4 h-4 text-foreground" />
              )}
            </motion.button>
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

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Heart, MessageCircle, Share2, Music2, Volume2, VolumeX, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { useFeedData, FeedExpression } from '@/contexts/FeedDataContext';
import { cn } from '@/lib/utils';

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

interface ExpressionViewerProps {
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export function ExpressionViewer({ isOpen, onClose, initialIndex = 0 }: ExpressionViewerProps) {
  const { expressions, markExpressionSeen } = useFeedData();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isMuted, setIsMuted] = useState(true);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [showHeart, setShowHeart] = useState(false);
  const lastTapRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentExpression = expressions[currentIndex];

  // Reset index when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  // Mark expression as seen when viewing
  useEffect(() => {
    if (isOpen && currentExpression) {
      markExpressionSeen(currentExpression.id);
    }
  }, [isOpen, currentExpression?.id, markExpressionSeen]);

  // Handle video playback
  useEffect(() => {
    if (videoRef.current && currentExpression?.mediaType === 'video') {
      videoRef.current.muted = isMuted;
      videoRef.current.play().catch(() => {});
    }
  }, [currentIndex, isMuted, currentExpression?.mediaType]);

  const handleSwipe = useCallback((direction: 'up' | 'down') => {
    if (direction === 'up' && currentIndex < expressions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      if (navigator.vibrate) navigator.vibrate(10);
    } else if (direction === 'down' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      if (navigator.vibrate) navigator.vibrate(10);
    }
  }, [currentIndex, expressions.length]);

  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.y < -threshold) {
      handleSwipe('up');
    } else if (info.offset.y > threshold) {
      handleSwipe('down');
    }
  }, [handleSwipe]);

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap - like
      if (currentExpression && !liked[currentExpression.id]) {
        setLiked(prev => ({ ...prev, [currentExpression.id]: true }));
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 800);
        if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
      }
    }
    lastTapRef.current = now;
  }, [currentExpression, liked]);

  const handleLike = useCallback(() => {
    if (!currentExpression) return;
    setLiked(prev => ({ 
      ...prev, 
      [currentExpression.id]: !prev[currentExpression.id] 
    }));
    if (navigator.vibrate) navigator.vibrate(10);
  }, [currentExpression]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        handleSwipe('down');
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        handleSwipe('up');
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleSwipe, onClose]);

  if (!isOpen || !currentExpression) return null;

  // Mock stats for expressions
  const stats = {
    likes: Math.floor(Math.random() * 50000) + 1000,
    comments: Math.floor(Math.random() * 3000) + 100,
    shares: Math.floor(Math.random() * 1000) + 50,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentExpression.id}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative h-full w-full touch-none"
          onClick={handleDoubleTap}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
        >
          {/* Background Media */}
          {currentExpression.mediaType === 'video' ? (
            <video
              ref={videoRef}
              src={currentExpression.mediaUrl}
              className="absolute inset-0 w-full h-full object-cover"
              loop
              playsInline
              muted={isMuted}
              autoPlay
            />
          ) : (
            <img
              src={currentExpression.mediaUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

          {/* Double-tap heart animation */}
          <AnimatePresence>
            {showHeart && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <Heart className="h-32 w-32 fill-white text-white drop-shadow-2xl" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Close button */}
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute top-4 left-4 z-10 p-2 rounded-full bg-black/40 backdrop-blur"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          {/* Navigation hints */}
          {currentIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); handleSwipe('down'); }}
              className="absolute top-20 left-1/2 -translate-x-1/2 text-white/60 animate-bounce"
            >
              <ChevronUp className="h-8 w-8" />
            </button>
          )}
          {currentIndex < expressions.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); handleSwipe('up'); }}
              className="absolute bottom-32 left-1/2 -translate-x-1/2 text-white/60 animate-bounce"
            >
              <ChevronDown className="h-8 w-8" />
            </button>
          )}

          {/* Right side actions - TikTok style */}
          <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6">
            {/* Avatar */}
            <motion.div whileTap={{ scale: 0.9 }} className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-white">
                <AvatarImage src={currentExpression.userAvatar} />
                <AvatarFallback className="bg-primary text-white">
                  {currentExpression.userName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center">
                <span className="text-white text-xs">+</span>
              </div>
            </motion.div>

            {/* Like */}
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={(e) => { e.stopPropagation(); handleLike(); }}
              className="flex flex-col items-center gap-1"
            >
              <Heart className={cn(
                'h-8 w-8 transition-all',
                liked[currentExpression.id] 
                  ? 'fill-rose-500 text-rose-500 animate-heart-pop' 
                  : 'text-white'
              )} />
              <span className="text-white text-xs font-semibold">
                {formatCount(stats.likes + (liked[currentExpression.id] ? 1 : 0))}
              </span>
            </motion.button>

            {/* Comment */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="flex flex-col items-center gap-1"
            >
              <MessageCircle className="h-8 w-8 text-white" />
              <span className="text-white text-xs font-semibold">{formatCount(stats.comments)}</span>
            </motion.button>

            {/* Share */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="flex flex-col items-center gap-1"
            >
              <Share2 className="h-8 w-8 text-white" />
              <span className="text-white text-xs font-semibold">{formatCount(stats.shares)}</span>
            </motion.button>

            {/* Audio toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
              className="w-10 h-10 rounded-full bg-secondary/80 backdrop-blur flex items-center justify-center"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5 text-white" />
              ) : (
                <Volume2 className="h-5 w-5 text-white" />
              )}
            </motion.button>
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-8 left-4 right-20">
            {/* User info */}
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-white">@{currentExpression.userName.toLowerCase().replace(/\s+/g, '_')}</span>
            </div>

            {/* Time remaining */}
            <p className="text-white/80 text-sm mb-2">
              {getTimeRemaining(currentExpression.expiresAt)}
            </p>

            {/* Audio indicator */}
            <div className="flex items-center gap-2">
              <Music2 className="h-4 w-4 text-white animate-pulse" />
              <span className="text-white text-sm">Original Sound</span>
            </div>
          </div>

          {/* Progress dots */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1">
            {expressions.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'h-1 rounded-full transition-all duration-300',
                  index === currentIndex ? 'w-6 bg-white' : 'w-1 bg-white/40'
                )}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

function getTimeRemaining(expiresAt: Date): string {
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();
  
  if (diff <= 0) return 'Expired';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  return `${minutes}m remaining`;
}

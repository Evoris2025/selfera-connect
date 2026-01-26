import { useState, useRef, useEffect, useCallback } from 'react';
import { X, MessageCircle, Share2, Music2, Volume2, VolumeX, ChevronUp, ChevronDown, Bookmark, Heart } from 'lucide-react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFeedData } from '@/contexts/FeedDataContext';
import { ExpressionProgressBar } from '@/components/expressions/ExpressionProgressBar';
import { PauseOverlay } from '@/components/expressions/PauseOverlay';
import { AddToHighlightSheet } from '@/components/expressions/AddToHighlightSheet';
import { HeartButton } from '@/components/interactions/HeartButton';
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
  const [isPaused, setIsPaused] = useState(false);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [showHeart, setShowHeart] = useState(false);
  const [highlightSheetOpen, setHighlightSheetOpen] = useState(false);
  const lastTapRef = useRef<number>(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentExpression = expressions[currentIndex];
  const expressionDuration = currentExpression?.mediaType === 'video' ? 15 : 5; // 15s for video, 5s for image

  // Reset index when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsPaused(false);
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
      if (isPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [currentIndex, isMuted, currentExpression?.mediaType, isPaused]);

  const handleSwipe = useCallback((direction: 'up' | 'down') => {
    if (direction === 'up' && currentIndex < expressions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsPaused(false);
      if (navigator.vibrate) navigator.vibrate(10);
    } else if (direction === 'down' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsPaused(false);
      if (navigator.vibrate) navigator.vibrate(10);
    } else if (direction === 'up' && currentIndex === expressions.length - 1) {
      onClose();
    }
  }, [currentIndex, expressions.length, onClose]);

  const handleAutoAdvance = useCallback(() => {
    if (currentIndex < expressions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      if (navigator.vibrate) navigator.vibrate(10);
    } else {
      onClose();
    }
  }, [currentIndex, expressions.length, onClose]);

  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.y < -threshold) {
      handleSwipe('up');
    } else if (info.offset.y > threshold) {
      handleSwipe('down');
    }
  }, [handleSwipe]);

  // Tap to pause, double-tap to like
  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap - like
      if (currentExpression && !liked[currentExpression.id]) {
        setLiked(prev => ({ ...prev, [currentExpression.id]: true }));
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 800);
        if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
      }
    } else {
      // Single tap - toggle pause
      setIsPaused(prev => !prev);
    }
    lastTapRef.current = now;
  }, [currentExpression, liked]);

  // Long press to pause (hold)
  const handlePointerDown = useCallback(() => {
    holdTimerRef.current = setTimeout(() => {
      setIsPaused(true);
    }, 200);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

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
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(prev => !prev);
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
      {/* Progress Bar */}
      <ExpressionProgressBar
        totalSegments={expressions.length}
        currentSegment={currentIndex}
        duration={expressionDuration}
        isPaused={isPaused}
        onSegmentComplete={handleAutoAdvance}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentExpression.id}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative h-full w-full touch-none"
          onClick={handleTap}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
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

          {/* Pause Overlay */}
          <PauseOverlay isPaused={isPaused} />

          {/* Double-tap heart animation */}
          <AnimatePresence>
            {showHeart && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <Heart className="h-32 w-32 fill-red-500 text-red-500 drop-shadow-2xl" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Close button */}
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute top-12 left-4 z-10 p-2 rounded-full bg-black/40 backdrop-blur"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          {/* Navigation hints */}
          {currentIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); handleSwipe('down'); }}
              className="absolute top-24 left-1/2 -translate-x-1/2 text-white/60 animate-bounce"
            >
              <ChevronUp className="h-8 w-8" />
            </button>
          )}
          {currentIndex < expressions.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); handleSwipe('up'); }}
              className="absolute bottom-36 left-1/2 -translate-x-1/2 text-white/60 animate-bounce"
            >
              <ChevronDown className="h-8 w-8" />
            </button>
          )}

          {/* Right side actions - TikTok style */}
          <div className="absolute right-4 bottom-36 flex flex-col items-center gap-6">
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

            {/* Like - Using HeartButton like feed */}
            <div onClick={(e) => e.stopPropagation()}>
              <HeartButton
                count={stats.likes + (liked[currentExpression.id] ? 1 : 0)}
                active={liked[currentExpression.id] || false}
                onClick={handleLike}
                size="lg"
                layout="vertical"
              />
            </div>

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

            {/* Save to Highlight */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); setHighlightSheetOpen(true); }}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center"
            >
              <Bookmark className="h-5 w-5 text-white" />
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
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-white">@{currentExpression.userName.toLowerCase().replace(/\s+/g, '_')}</span>
            </div>

            {/* Caption/Description */}
            {currentExpression.caption && (
              <p className="text-white text-sm mb-2 line-clamp-3">
                {currentExpression.caption}
              </p>
            )}

            {/* Time remaining */}
            <p className="text-white/70 text-xs mb-3">
              {getTimeRemaining(currentExpression.expiresAt)}
            </p>

            {/* Audio indicator */}
            <div className="flex items-center gap-2">
              <Music2 className="h-4 w-4 text-white/80" />
              <span className="text-white/80 text-sm">Original Sound</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Add to Highlight Sheet */}
      <AddToHighlightSheet
        isOpen={highlightSheetOpen}
        onClose={() => setHighlightSheetOpen(false)}
        expressionId={currentExpression.id}
        expressionThumbnail={currentExpression.mediaUrl}
      />
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

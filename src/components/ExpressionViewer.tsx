import { useState, useRef, useEffect, useCallback } from 'react';
import { X, MessageCircle, Share2, Music2, Volume2, VolumeX, ChevronUp, ChevronDown, Bookmark, Heart, Send, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useFeedData } from '@/contexts/FeedDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { ExpressionProgressBar } from '@/components/expressions/ExpressionProgressBar';
import { PauseOverlay } from '@/components/expressions/PauseOverlay';
import { AddToHighlightSheet } from '@/components/expressions/AddToHighlightSheet';
import { ExpressionReactionPicker } from '@/components/expressions/ExpressionReactionPicker';
import { ExpressionAnalyticsCard, useExpressionAnalytics } from '@/components/expressions/ExpressionAnalyticsCard';
import { HeartButton } from '@/components/interactions/HeartButton';
import { HashtagText } from '@/components/HashtagText';
import { useExpressionInteractions } from '@/hooks/useExpressionInteractions';
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
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [showHeart, setShowHeart] = useState(false);
  const [highlightSheetOpen, setHighlightSheetOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [sentReaction, setSentReaction] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const lastTapRef = useRef<number>(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const replyInputRef = useRef<HTMLInputElement>(null);

  const currentExpression = expressions[currentIndex];
  const expressionDuration = currentExpression?.mediaType === 'video' ? 15 : 5; // 15s for video, 5s for image
  
  // Check if current user is the creator of this expression
  const isCreator = user?.id === currentExpression?.userId || 
    user?.email?.split('@')[0]?.toLowerCase() === currentExpression?.userName?.toLowerCase();
  
  // Get analytics for the current expression
  const { analytics } = useExpressionAnalytics(currentExpression?.id || '');
  
  // Get interaction methods for persisting replies
  const { addReply, recordView } = useExpressionInteractions(currentExpression?.id || '');

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

  const handleSendReply = useCallback(async () => {
    if (!replyText.trim() || !currentExpression) return;
    
    // Persist reply to database
    try {
      await addReply.mutateAsync(replyText.trim());
    } catch (error) {
      console.error('Failed to save reply:', error);
    }
    
    setReplyText('');
    setShowReplyInput(false);
    if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
  }, [replyText, currentExpression, addReply]);

  const handleReaction = useCallback((emoji: string) => {
    setSentReaction(emoji);
    setTimeout(() => setSentReaction(null), 1500);
  }, []);

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

            {/* Save to Highlight - More prominent */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); setHighlightSheetOpen(true); }}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <Bookmark className="h-5 w-5 text-white" />
              </div>
              <span className="text-white text-[10px] font-medium">Save</span>
            </motion.button>

            {/* Analytics toggle - Only for creator */}
            {isCreator && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setShowAnalytics(prev => !prev);
                  setIsPaused(true);
                }}
                className={cn(
                  "flex flex-col items-center gap-1",
                  showAnalytics && "text-primary"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full backdrop-blur flex items-center justify-center transition-colors",
                  showAnalytics ? "bg-primary/30" : "bg-white/20"
                )}>
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <span className="text-white text-[10px] font-medium">Insights</span>
              </motion.button>
            )}

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

          {/* Analytics Overlay - Only for creator */}
          <AnimatePresence>
            {showAnalytics && isCreator && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute top-20 left-4 right-4 z-20"
              >
                <ExpressionAnalyticsCard
                  analytics={analytics}
                  expiresAt={currentExpression.expiresAt}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom info */}
          <div className="absolute bottom-8 left-4 right-20">
            {/* User info */}
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-white">@{currentExpression.userName.toLowerCase().replace(/\s+/g, '_')}</span>
            </div>

            {/* Caption/Description with clickable hashtags */}
            {currentExpression.caption && (
              <HashtagText
                text={currentExpression.caption}
                className="text-white text-sm mb-2 line-clamp-3 block"
                hashtagClassName="text-primary font-medium"
              />
            )}

            {/* Time remaining */}
            <p className="text-white/70 text-xs mb-3">
              {getTimeRemaining(currentExpression.expiresAt)}
            </p>

            {/* Audio indicator */}
            <div className="flex items-center gap-2 mb-4">
              <Music2 className="h-4 w-4 text-white/80" />
              <span className="text-white/80 text-sm">Original Sound</span>
            </div>

            {/* Emoji Reaction Picker */}
            <div onClick={(e) => e.stopPropagation()} className="mb-4">
              <ExpressionReactionPicker
                expressionId={currentExpression.id}
                authorName={currentExpression.userName}
                onReact={handleReaction}
              />
            </div>

            {/* Reply Input */}
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="flex items-center gap-2"
            >
              <Input
                ref={replyInputRef}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onFocus={() => {
                  setShowReplyInput(true);
                  setIsPaused(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendReply();
                }}
                placeholder={`Reply to @${currentExpression.userName.toLowerCase().replace(/\s+/g, '_')}...`}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-full h-10"
              />
              {replyText.trim() && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSendReply}
                  className="p-2 rounded-full bg-primary text-primary-foreground"
                >
                  <Send className="h-5 w-5" />
                </motion.button>
              )}
            </div>
          </div>

          {/* Floating sent reaction animation */}
          <AnimatePresence>
            {sentReaction && (
              <motion.div
                initial={{ opacity: 1, scale: 1, y: 0 }}
                animate={{ 
                  opacity: 0, 
                  scale: 3, 
                  y: -200,
                  x: 100,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="absolute bottom-40 left-1/2 -translate-x-1/2 text-6xl pointer-events-none z-50"
              >
                {sentReaction}
              </motion.div>
            )}
          </AnimatePresence>
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

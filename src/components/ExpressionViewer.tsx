import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Heart, MessageCircle, Share2, Music2, Volume2, VolumeX, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { Hashtag } from '@/components/Hashtag';
import { cn } from '@/lib/utils';

interface Expression {
  id: string;
  user: {
    name: string;
    handle: string;
    avatar: string;
    isVerified: boolean;
  };
  mediaUrl: string;
  caption: string;
  hashtags: string[];
  audio?: string;
  likes: number;
  comments: number;
  shares: number;
}

const mockExpressions: Expression[] = [
  {
    id: '1',
    user: { name: 'Jamie', handle: 'jamie_journey', avatar: '', isVerified: false },
    mediaUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=1000&fit=crop',
    caption: '1 year of recovery. Still here, still fighting. 💙',
    hashtags: ['recovery', 'mentalhealth', 'oneyear'],
    audio: 'Healing - Original Sound',
    likes: 45600,
    comments: 1234,
    shares: 567,
  },
  {
    id: '2',
    user: { name: 'Dr. Sarah', handle: 'drsarah', avatar: '', isVerified: true },
    mediaUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&h=1000&fit=crop',
    caption: 'Quick anxiety tip: The 5-4-3-2-1 technique really works!',
    hashtags: ['anxiety', 'mentalhealth', 'therapytips'],
    audio: 'Calm Piano - Wellness',
    likes: 89200,
    comments: 3456,
    shares: 1234,
  },
  {
    id: '3',
    user: { name: 'MindfulMoments', handle: 'mindful', avatar: '', isVerified: true },
    mediaUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&h=1000&fit=crop',
    caption: 'Morning meditation vibes ✨ Who else starts their day with stillness?',
    hashtags: ['meditation', 'mindfulness', 'morningroutine'],
    audio: 'Peaceful Morning - Mindful',
    likes: 67800,
    comments: 2345,
    shares: 890,
  },
];

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
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isMuted, setIsMuted] = useState(false);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [showHeart, setShowHeart] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);

  const currentExpression = mockExpressions[currentIndex];

  const handleSwipe = (direction: 'up' | 'down') => {
    if (direction === 'up' && currentIndex < mockExpressions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(10);
    } else if (direction === 'down' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      if (navigator.vibrate) navigator.vibrate(10);
    }
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap - like
      if (!liked[currentExpression.id]) {
        setLiked(prev => ({ ...prev, [currentExpression.id]: true }));
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 800);
        if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
      }
    }
    lastTapRef.current = now;
  };

  const handleLike = () => {
    setLiked(prev => ({ 
      ...prev, 
      [currentExpression.id]: !prev[currentExpression.id] 
    }));
    if (navigator.vibrate) navigator.vibrate(10);
  };

  if (!isOpen) return null;

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
          className="relative h-full w-full"
          onClick={handleDoubleTap}
        >
          {/* Background Image */}
          <img
            src={currentExpression.mediaUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />

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
            onClick={onClose}
            className="absolute top-4 left-4 z-10 p-2 rounded-full bg-black/40 backdrop-blur"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          {/* Navigation hints */}
          {currentIndex > 0 && (
            <button
              onClick={() => handleSwipe('down')}
              className="absolute top-20 left-1/2 -translate-x-1/2 text-white/60 animate-bounce"
            >
              <ChevronUp className="h-8 w-8" />
            </button>
          )}
          {currentIndex < mockExpressions.length - 1 && (
            <button
              onClick={() => handleSwipe('up')}
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
                <AvatarImage src={currentExpression.user.avatar} />
                <AvatarFallback className="bg-primary text-white">
                  {currentExpression.user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center">
                <span className="text-white text-xs">+</span>
              </div>
            </motion.div>

            {/* Like */}
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleLike}
              className="flex flex-col items-center gap-1"
            >
              <Heart className={cn(
                'h-8 w-8 transition-all',
                liked[currentExpression.id] 
                  ? 'fill-rose-500 text-rose-500 animate-heart-pop' 
                  : 'text-white'
              )} />
              <span className="text-white text-xs font-semibold">
                {formatCount(currentExpression.likes + (liked[currentExpression.id] ? 1 : 0))}
              </span>
            </motion.button>

            {/* Comment */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center gap-1"
            >
              <MessageCircle className="h-8 w-8 text-white" />
              <span className="text-white text-xs font-semibold">{formatCount(currentExpression.comments)}</span>
            </motion.button>

            {/* Share */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center gap-1"
            >
              <Share2 className="h-8 w-8 text-white" />
              <span className="text-white text-xs font-semibold">{formatCount(currentExpression.shares)}</span>
            </motion.button>

            {/* Audio */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMuted(!isMuted)}
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
              <span className="font-bold text-white">@{currentExpression.user.handle}</span>
              {currentExpression.user.isVerified && <VerifiedBadge className="text-white" />}
            </div>

            {/* Caption */}
            <p className="text-white text-sm mb-2">{currentExpression.caption}</p>

            {/* Hashtags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {currentExpression.hashtags.map(tag => (
                <span key={tag} className="text-white/80 text-sm font-medium">#{tag}</span>
              ))}
            </div>

            {/* Audio */}
            {currentExpression.audio && (
              <div className="flex items-center gap-2">
                <Music2 className="h-4 w-4 text-white animate-pulse" />
                <span className="text-white text-sm">{currentExpression.audio}</span>
              </div>
            )}
          </div>

          {/* Progress dots */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1">
            {mockExpressions.map((_, index) => (
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
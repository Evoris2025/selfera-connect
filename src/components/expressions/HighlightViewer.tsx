import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Share2 } from 'lucide-react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ExpressionProgressBar } from './ExpressionProgressBar';
import { PauseOverlay } from './PauseOverlay';
import { Highlight } from '@/components/profile/HighlightCircle';
import { cn } from '@/lib/utils';

interface HighlightItem {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
}

interface HighlightViewerProps {
  isOpen: boolean;
  onClose: () => void;
  highlight: Highlight | null;
}

// Mock items for the highlight
const mockHighlightItems: HighlightItem[] = [
  { id: '1', mediaUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop', mediaType: 'image' },
  { id: '2', mediaUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&h=1200&fit=crop', mediaType: 'image' },
  { id: '3', mediaUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&h=1200&fit=crop', mediaType: 'image' },
];

export function HighlightViewer({ isOpen, onClose, highlight }: HighlightViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [items] = useState<HighlightItem[]>(mockHighlightItems);

  const duration = 5; // 5 seconds per item

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setIsPaused(false);
    }
  }, [isOpen]);

  const handleNext = useCallback(() => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
      if (navigator.vibrate) navigator.vibrate(10);
    } else {
      onClose();
    }
  }, [currentIndex, items.length, onClose]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      if (navigator.vibrate) navigator.vibrate(10);
    }
  }, [currentIndex]);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    if (info.offset.x < -50) {
      handleNext();
    } else if (info.offset.x > 50) {
      handlePrev();
    }
  }, [handleNext, handlePrev]);

  const handleTap = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'Escape') onClose();
      else if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen || !highlight) return null;

  const currentItem = items[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black"
    >
      {/* Progress Bar */}
      <ExpressionProgressBar
        totalSegments={items.length}
        currentSegment={currentIndex}
        duration={duration}
        isPaused={isPaused}
        onSegmentComplete={handleNext}
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-12 right-4 z-30 p-2 rounded-full bg-black/40 backdrop-blur"
      >
        <X className="h-6 w-6 text-white" />
      </button>

      {/* Highlight name */}
      <div className="absolute top-12 left-4 z-30">
        <p className="text-white font-semibold text-title">{highlight.name}</p>
        <p className="text-white/60 text-body">{items.length} items</p>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 touch-none"
          onClick={handleTap}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
        >
          <img
            src={currentItem.mediaUrl}
            alt=""
            className="w-full h-full object-cover"
          />

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40" />
        </motion.div>
      </AnimatePresence>

      {/* Pause Overlay */}
      <PauseOverlay isPaused={isPaused} />

      {/* Navigation hints */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 backdrop-blur z-20"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
      )}
      {currentIndex < items.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 backdrop-blur z-20"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>
      )}

      {/* Bottom actions */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-8 z-20">
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center gap-1"
        >
          <Heart className="h-7 w-7 text-white" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center gap-1"
        >
          <Share2 className="h-7 w-7 text-white" />
        </motion.button>
      </div>
    </motion.div>
  );
}

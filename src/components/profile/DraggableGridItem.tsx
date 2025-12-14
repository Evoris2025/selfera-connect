import { memo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Heart, MessageCircle, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Post {
  id: string;
  thumbnail: string;
  likes: number;
  comments: number;
  isVideo: boolean;
}

interface DraggableGridItemProps {
  post: Post;
  index: number;
  isRearrangeMode: boolean;
  isDragging: boolean;
  dragOverIndex: number | null;
  onLongPress: () => void;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDragEnd: () => void;
  onTouchStart: (e: React.TouchEvent, index: number) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export const DraggableGridItem = memo(function DraggableGridItem({
  post,
  index,
  isRearrangeMode,
  isDragging,
  dragOverIndex,
  onLongPress,
  onDragStart,
  onDragOver,
  onDragEnd,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: DraggableGridItemProps) {
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPressing = useRef(false);

  const handleMouseDown = () => {
    if (isRearrangeMode) return;
    
    isLongPressing.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPressing.current = true;
      onLongPress();
      // Haptic-like visual feedback
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    }, 5000); // 5 seconds
  };

  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleMouseLeave = () => {
    handleMouseUp();
  };

  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  const isBeingDraggedOver = dragOverIndex === index && !isDragging;

  return (
    <motion.div
      layout
      layoutId={post.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: isDragging ? 0.5 : 1, 
        scale: isDragging ? 1.05 : isBeingDraggedOver ? 0.95 : 1,
        zIndex: isDragging ? 50 : 1,
      }}
      transition={{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 30,
        layout: { type: 'spring', stiffness: 400, damping: 30 }
      }}
      className={cn(
        'aspect-square relative group cursor-pointer overflow-hidden',
        isRearrangeMode && 'cursor-grab active:cursor-grabbing animate-jiggle',
        isDragging && 'shadow-2xl ring-2 ring-primary animate-none',
        isBeingDraggedOver && 'ring-2 ring-primary/50'
      )}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={(e) => {
        if (!isRearrangeMode) {
          handleMouseDown();
        }
        onTouchStart(e, index);
      }}
      onTouchMove={onTouchMove}
      onTouchEnd={() => {
        handleMouseUp();
        onTouchEnd();
      }}
      draggable={isRearrangeMode}
      onDragStart={() => {
        if (isRearrangeMode) {
          onDragStart(index);
        }
      }}
      onDragOver={(e) => {
        if (isRearrangeMode) {
          e.preventDefault();
          onDragOver(index);
        }
      }}
      onDragEnd={onDragEnd}
    >
      {/* Image */}
      <img 
        src={post.thumbnail} 
        alt="" 
        className={cn(
          'w-full h-full object-cover transition-transform duration-300',
          !isRearrangeMode && 'group-hover:scale-105'
        )}
        draggable={false}
      />

      {/* Video indicator */}
      {post.isVideo && (
        <div className="absolute top-2 right-2">
          <Play className="h-4 w-4 text-white drop-shadow-lg fill-current" />
        </div>
      )}

      {/* Rearrange mode overlay */}
      {isRearrangeMode && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/30 flex items-center justify-center"
        >
          <GripVertical className="h-8 w-8 text-white drop-shadow-lg" />
        </motion.div>
      )}

      {/* Hover overlay with stats (only when not in rearrange mode) */}
      {!isRearrangeMode && (
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
          <div className="flex items-center gap-1 text-white font-semibold">
            <Heart className="h-5 w-5 fill-current" />
            {formatCount(post.likes)}
          </div>
          <div className="flex items-center gap-1 text-white font-semibold">
            <MessageCircle className="h-5 w-5 fill-current" />
            {formatCount(post.comments)}
          </div>
        </div>
      )}

      {/* Skeleton placeholder when being dragged over */}
      {isBeingDraggedOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-muted animate-pulse"
        />
      )}
    </motion.div>
  );
});
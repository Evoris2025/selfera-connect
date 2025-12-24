import { memo, useRef, useEffect, forwardRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GripVertical } from 'lucide-react';
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

const LONG_PRESS_DURATION = 500; // ms
const MOVE_THRESHOLD = 10; // px

export const DraggableGridItem = memo(forwardRef<HTMLDivElement, DraggableGridItemProps>(function DraggableGridItem({
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
}, ref) {
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const isLongPressTriggered = useRef(false);

  // Cancel long press
  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // Start long press timer
  const startLongPress = useCallback((x: number, y: number) => {
    if (isRearrangeMode) return;
    
    touchStartPos.current = { x, y };
    isLongPressTriggered.current = false;
    
    longPressTimer.current = setTimeout(() => {
      isLongPressTriggered.current = true;
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      onLongPress();
    }, LONG_PRESS_DURATION);
  }, [isRearrangeMode, onLongPress]);

  // Handle pointer/touch move - cancel if moved too far
  const handleMove = useCallback((x: number, y: number) => {
    if (!touchStartPos.current) return;
    
    const dx = Math.abs(x - touchStartPos.current.x);
    const dy = Math.abs(y - touchStartPos.current.y);
    
    if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
      cancelLongPress();
    }
  }, [cancelLongPress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelLongPress();
    };
  }, [cancelLongPress]);

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
        'w-full h-full relative group cursor-pointer overflow-hidden',
        isRearrangeMode && 'cursor-grab active:cursor-grabbing animate-jiggle',
        isDragging && 'shadow-2xl ring-2 ring-primary animate-none',
        isBeingDraggedOver && 'ring-2 ring-primary/50'
      )}
      style={{
        WebkitTouchCallout: 'none',
        userSelect: 'none',
        touchAction: isRearrangeMode ? 'none' : 'auto',
      }}
      // Block browser context menu
      onContextMenu={(e) => e.preventDefault()}
      // Long press handling for touch
      onTouchStart={(e) => {
        const touch = e.touches[0];
        startLongPress(touch.clientX, touch.clientY);
        if (isRearrangeMode) {
          onTouchStart(e, index);
        }
      }}
      onTouchMove={(e) => {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
        if (isRearrangeMode) {
          onTouchMove(e);
        }
      }}
      onTouchEnd={() => {
        cancelLongPress();
        touchStartPos.current = null;
        if (isRearrangeMode) {
          onTouchEnd();
        }
      }}
      onTouchCancel={() => {
        cancelLongPress();
        touchStartPos.current = null;
      }}
      // Long press handling for mouse
      onMouseDown={(e) => {
        startLongPress(e.clientX, e.clientY);
      }}
      onMouseMove={(e) => {
        handleMove(e.clientX, e.clientY);
      }}
      onMouseUp={() => {
        cancelLongPress();
        touchStartPos.current = null;
      }}
      onMouseLeave={() => {
        cancelLongPress();
        touchStartPos.current = null;
      }}
      // Drag handlers for rearrange mode
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
      {/* Image - block context menu */}
      <img 
        src={post.thumbnail} 
        alt="" 
        className={cn(
          'w-full h-full object-cover transition-transform duration-300',
          !isRearrangeMode && 'group-hover:scale-105'
        )}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          WebkitTouchCallout: 'none',
          userSelect: 'none',
        }}
      />

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
}));
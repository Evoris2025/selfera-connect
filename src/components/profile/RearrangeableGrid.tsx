import { useState, useCallback, useRef, memo, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Check, X, Move, Play, Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DraggableGridItem } from './DraggableGridItem';
import { useProfileGridOrder } from '@/hooks/useProfileGridOrder';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GridLayoutStyle } from '@/hooks/useGridLayout';

interface Post {
  id: string;
  thumbnail: string;
  likes: number;
  comments: number;
  isVideo: boolean;
}

interface RearrangeableGridProps {
  posts: Post[];
  isOwnProfile: boolean;
  layoutStyle?: GridLayoutStyle;
}

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

// Mosaic pattern definitions - each pattern repeats cyclically
const MOSAIC_PATTERNS: Record<string, { colSpan: number; rowSpan: number }[]> = {
  // Mosaic 4: Wide banner on top + 4 squares below (repeats every 5)
  mosaic4: [
    { colSpan: 3, rowSpan: 1 },  // wide banner
    { colSpan: 1, rowSpan: 1 },  // square
    { colSpan: 1, rowSpan: 1 },  // square
    { colSpan: 1, rowSpan: 1 },  // square
  ],
  // Mosaic 5: Tall left + 4 squares on right (repeats every 5)
  mosaic5: [
    { colSpan: 1, rowSpan: 2 },  // tall left
    { colSpan: 1, rowSpan: 1 },  // top mid
    { colSpan: 1, rowSpan: 1 },  // top right
    { colSpan: 1, rowSpan: 1 },  // bottom mid
    { colSpan: 1, rowSpan: 1 },  // bottom right
  ],
  // Mosaic 6: Tall left + 2 wide right stacked (repeats every 3)
  mosaic6: [
    { colSpan: 1, rowSpan: 2 },  // tall left
    { colSpan: 2, rowSpan: 1 },  // wide top right
    { colSpan: 2, rowSpan: 1 },  // wide bottom right
  ],
  // Mosaic 7: Wide banner + large left + 2 squares right (repeats every 4)
  mosaic7: [
    { colSpan: 3, rowSpan: 1 },  // wide banner
    { colSpan: 2, rowSpan: 2 },  // large left
    { colSpan: 1, rowSpan: 1 },  // top right
    { colSpan: 1, rowSpan: 1 },  // bottom right
  ],
  // Mosaic 8: Complex mixed pattern (repeats every 5)
  mosaic8: [
    { colSpan: 1, rowSpan: 2 },  // tall left
    { colSpan: 1, rowSpan: 1 },  // top mid
    { colSpan: 1, rowSpan: 1 },  // top right
    { colSpan: 2, rowSpan: 1 },  // wide bottom
  ],
};

// Get mosaic spans for a post at a given index
function getMosaicSpans(layoutStyle: GridLayoutStyle, index: number): { colSpan: number; rowSpan: number } {
  const pattern = MOSAIC_PATTERNS[layoutStyle];
  if (!pattern) {
    return { colSpan: 1, rowSpan: 1 }; // Default for uniform
  }
  return pattern[index % pattern.length];
}

export const RearrangeableGrid = memo(function RearrangeableGrid({ 
  posts, 
  isOwnProfile,
  layoutStyle = 'uniform',
}: RearrangeableGridProps) {
  const { orderedPosts, loading, saving, reorderPosts, saveOrder } = useProfileGridOrder(posts);
  const [isRearrangeMode, setIsRearrangeMode] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [originalOrder, setOriginalOrder] = useState<Post[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevLayoutRef = useRef(layoutStyle);
  // Touch handling
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const touchCurrentIndex = useRef<number | null>(null);

  // Trigger transition animation when layout changes
  useEffect(() => {
    if (prevLayoutRef.current !== layoutStyle) {
      setIsTransitioning(true);
      prevLayoutRef.current = layoutStyle;
      const timer = setTimeout(() => setIsTransitioning(false), 500);
      return () => clearTimeout(timer);
    }
  }, [layoutStyle]);

  const enterRearrangeMode = useCallback(() => {
    if (!isOwnProfile) return;
    setOriginalOrder([...orderedPosts]);
    setIsRearrangeMode(true);
    // Visual feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }, [isOwnProfile, orderedPosts]);

  const exitRearrangeMode = useCallback(async (save: boolean) => {
    if (save) {
      const success = await saveOrder();
      if (!success) {
        toast({ 
          title: 'Error',
          description: 'Failed to save order',
          variant: 'destructive',
        });
      }
    }
    // Revert to original will be handled by the hook's fallback
    setIsRearrangeMode(false);
    setDraggingIndex(null);
    setDragOverIndex(null);
  }, [saveOrder]);

  const handleDragStart = useCallback((index: number) => {
    setDraggingIndex(index);
  }, []);

  const handleDragOver = useCallback((index: number) => {
    if (draggingIndex === null || draggingIndex === index) return;
    setDragOverIndex(index);
    reorderPosts(draggingIndex, index);
    setDraggingIndex(index);
  }, [draggingIndex, reorderPosts]);

  const handleDragEnd = useCallback(() => {
    setDraggingIndex(null);
    setDragOverIndex(null);
  }, []);

  // Touch handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent, index: number) => {
    if (!isRearrangeMode) return;
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    touchCurrentIndex.current = index;
    setDraggingIndex(index);
  }, [isRearrangeMode]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isRearrangeMode || draggingIndex === null) return;
    
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element) {
      const gridItem = element.closest('[data-grid-index]');
      if (gridItem) {
        const index = parseInt(gridItem.getAttribute('data-grid-index') || '-1', 10);
        if (index >= 0 && index !== draggingIndex) {
          handleDragOver(index);
        }
      }
    }
  }, [isRearrangeMode, draggingIndex, handleDragOver]);

  const handleTouchEnd = useCallback(() => {
    touchStartPos.current = null;
    touchCurrentIndex.current = null;
    handleDragEnd();
  }, [handleDragEnd]);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-[1px]">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="aspect-square bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  // Spring config for smooth layout transitions
  const layoutTransition = {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
    mass: 0.8,
  };

  const isMosaicLayout = layoutStyle.startsWith('mosaic');

  return (
    <LayoutGroup>
    <div className="relative">
      {/* Rearrange mode header */}
      <AnimatePresence>
        {isRearrangeMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="sticky top-0 z-20 glass-heavy px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Move className="h-4 w-4" />
              <span>Drag to rearrange</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => exitRearrangeMode(false)}
                disabled={saving}
                className="rounded-xl"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => exitRearrangeMode(true)}
                disabled={saving}
                className="rounded-xl"
              >
                {saving ? (
                  <span className="animate-pulse">Saving...</span>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Done
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid with layout styles */}
      <motion.div 
        layout
        layoutId="grid-container"
        className={cn(
          'bg-border/20',
          isRearrangeMode && 'pb-20',
          isTransitioning && 'overflow-hidden',
          // All layouts use CSS Grid with 3 columns
          'grid grid-cols-3 gap-[1px]'
        )}
        style={isMosaicLayout ? {
          gridAutoRows: '120px',
          gridAutoFlow: 'dense'
        } : undefined}
        transition={layoutTransition}
      >
        <AnimatePresence mode="sync">
          {orderedPosts.map((post, index) => {
            // Get mosaic spans for this position
            const { colSpan, rowSpan } = getMosaicSpans(layoutStyle, index);
            
            // Build dynamic class for grid spans
            const spanClasses = isMosaicLayout 
              ? cn(
                  colSpan === 2 && 'col-span-2',
                  colSpan === 3 && 'col-span-3',
                  rowSpan === 2 && 'row-span-2',
                  rowSpan === 3 && 'row-span-3'
                )
              : '';
            
            return (
              <motion.div 
                key={post.id} 
                layout
                layoutId={`grid-item-${post.id}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ 
                  layout: layoutTransition,
                  opacity: { duration: 0.2 },
                  scale: { duration: 0.2 },
                }}
                data-grid-index={index}
                className={cn(
                  'relative overflow-hidden border border-white/[0.08] rounded-md',
                  layoutStyle === 'uniform' && 'aspect-square',
                  spanClasses
                )}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <DraggableGridItem
                  post={post}
                  index={index}
                  isRearrangeMode={isRearrangeMode}
                  isDragging={draggingIndex === index}
                  dragOverIndex={dragOverIndex}
                  onLongPress={enterRearrangeMode}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                />
                
                {/* Video Indicator */}
                {post.isVideo && !isRearrangeMode && (
                  <motion.div 
                    className="absolute top-2 right-2 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Play className="h-4 w-4 text-white drop-shadow-lg fill-current" />
                  </motion.div>
                )}
                
                {/* Hover Overlay with Stats */}
                <AnimatePresence>
                  {hoveredIndex === index && !isRearrangeMode && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center gap-4 pointer-events-none"
                    >
                      <div className="flex items-center gap-1.5 text-white font-semibold text-sm">
                        <Heart className="h-4 w-4 fill-current" />
                        {formatCount(post.likes)}
                      </div>
                      <div className="flex items-center gap-1.5 text-white font-semibold text-sm">
                        <MessageCircle className="h-4 w-4 fill-current" />
                        {formatCount(post.comments)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Long-press hint for own profile */}
      {isOwnProfile && !isRearrangeMode && orderedPosts.length > 1 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-xs text-muted-foreground py-4"
        >
          Long-press to rearrange your grid
        </motion.p>
      )}
    </div>
    </LayoutGroup>
  );
});

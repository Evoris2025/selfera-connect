import { useRef, useEffect, useState, memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HorizontalLaneProps<T extends { id: string }> {
  items: T[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  /** Number of items to render on each side of activeIndex (default: 1) */
  renderWindow?: number;
}

function HorizontalLaneBase<T extends { id: string }>({
  items,
  activeIndex,
  onIndexChange,
  renderItem,
  className,
  renderWindow = 1,
}: HorizontalLaneProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if an item is within the render window
  const isInRenderWindow = useCallback((index: number) => {
    return Math.abs(index - activeIndex) <= renderWindow;
  }, [activeIndex, renderWindow]);

  // Scroll to activeIndex when it changes (from parent or arrows)
  useEffect(() => {
    if (!scrollRef.current || isScrolling) return;
    const itemWidth = scrollRef.current.clientWidth;
    const targetScroll = activeIndex * itemWidth;
    
    // Only scroll if we're not already at the target
    if (Math.abs(scrollRef.current.scrollLeft - targetScroll) > 2) {
      scrollRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      });
    }
  }, [activeIndex, isScrolling]);

  // Handle scroll end to sync index with scroll position
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    
    setIsScrolling(true);
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (!scrollRef.current) return;
      
      const itemWidth = scrollRef.current.clientWidth;
      const scrollLeft = scrollRef.current.scrollLeft;
      const newIndex = Math.round(scrollLeft / itemWidth);
      const snappedPosition = newIndex * itemWidth;
      
      // Only update if we're snapped (within 4px tolerance)
      if (Math.abs(scrollLeft - snappedPosition) < 4) {
        const clampedIndex = Math.max(0, Math.min(newIndex, items.length - 1));
        if (clampedIndex !== activeIndex) {
          onIndexChange(clampedIndex);
        }
      }
      
      setIsScrolling(false);
    }, 150);
  }, [activeIndex, items.length, onIndexChange]);

  // Arrow navigation - imperatively scroll then update state
  const navigateTo = useCallback((targetIndex: number) => {
    if (!scrollRef.current) return;
    
    const clampedIndex = Math.max(0, Math.min(targetIndex, items.length - 1));
    const itemWidth = scrollRef.current.clientWidth;
    
    // Imperatively scroll first
    scrollRef.current.scrollTo({
      left: clampedIndex * itemWidth,
      behavior: 'smooth',
    });
    
    // Update parent state
    onIndexChange(clampedIndex);
  }, [items.length, onIndexChange]);

  const handlePrevious = useCallback((e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (activeIndex > 0) {
      navigateTo(activeIndex - 1);
    }
  }, [activeIndex, navigateTo]);

  const handleNext = useCallback((e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (activeIndex < items.length - 1) {
      navigateTo(activeIndex + 1);
    }
  }, [activeIndex, items.length, navigateTo]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  if (items.length <= 1) {
    return items.length === 1 ? <>{renderItem(items[0], 0)}</> : null;
  }

  const canGoLeft = activeIndex > 0;
  const canGoRight = activeIndex < items.length - 1;

  return (
    <div className={cn('relative w-full h-full group', className)}>
      {/* Scrollable lane */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {items.map((item, index) => {
          const inWindow = isInRenderWindow(index);
          
          return (
            <motion.div
              key={item.id}
              className="flex-none w-full h-full snap-center origin-center"
              style={{ scrollSnapAlign: 'center' }}
              initial={false}
              animate={{
                scale: index === activeIndex ? 1 : 0.95,
                opacity: index === activeIndex ? 1 : 0.7,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
            >
              {inWindow ? (
                renderItem(item, index)
              ) : (
                // Placeholder: maintains scroll width without loading content
                <div className="w-full h-full bg-transparent" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Arrow overlay - sits above content, only buttons receive clicks */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none z-40">
        {/* Left arrow */}
        {canGoLeft ? (
          <button
            onClick={handlePrevious}
            onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
            className="pointer-events-auto p-2 rounded-full bg-background/80 backdrop-blur-sm text-foreground/80 hover:bg-background hover:text-foreground transition-all shadow-md opacity-0 group-hover:opacity-100 focus:opacity-100 z-50"
            aria-label="Previous post"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        ) : (
          <div />
        )}

        {/* Right arrow */}
        {canGoRight ? (
          <button
            onClick={handleNext}
            onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
            className="pointer-events-auto p-2 rounded-full bg-background/80 backdrop-blur-sm text-foreground/80 hover:bg-background hover:text-foreground transition-all shadow-md opacity-0 group-hover:opacity-100 focus:opacity-100 z-50"
            aria-label="Next post"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const HorizontalLane = memo(HorizontalLaneBase) as typeof HorizontalLaneBase;

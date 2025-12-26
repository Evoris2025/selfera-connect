import { useRef, useEffect, useState, memo, useCallback } from 'react';
import { motion } from 'framer-motion';
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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  // Scroll to active item with smooth animation
  useEffect(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const itemWidth = container.clientWidth;
    
    container.scrollTo({
      left: activeIndex * itemWidth,
      behavior: 'smooth',
    });
  }, [activeIndex]);

  // Handle scroll end detection for snap
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      updateScrollState();
      clearTimeout(scrollTimeout);
      
      scrollTimeout = setTimeout(() => {
        const itemWidth = container.clientWidth;
        const newIndex = Math.round(container.scrollLeft / itemWidth);
        if (newIndex !== activeIndex && newIndex >= 0 && newIndex < items.length) {
          onIndexChange(newIndex);
        }
      }, 100);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    updateScrollState();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [activeIndex, items.length, onIndexChange, updateScrollState]);

  // Check if an item is within the render window
  const isInRenderWindow = useCallback((index: number) => {
    return Math.abs(index - activeIndex) <= renderWindow;
  }, [activeIndex, renderWindow]);

  if (items.length <= 1) {
    return items.length === 1 ? <>{renderItem(items[0], 0)}</> : null;
  }

  // Limit dots to show (max 7 with ellipsis for large sets)
  const maxDots = 7;
  const showEllipsis = items.length > maxDots;
  const halfMax = Math.floor(maxDots / 2);
  
  const getVisibleDotIndices = () => {
    if (!showEllipsis) {
      return items.map((_, i) => i);
    }
    
    // Show dots around activeIndex
    let start = Math.max(0, activeIndex - halfMax);
    let end = Math.min(items.length - 1, activeIndex + halfMax);
    
    // Adjust if near edges
    if (start === 0) {
      end = Math.min(maxDots - 1, items.length - 1);
    } else if (end === items.length - 1) {
      start = Math.max(0, items.length - maxDots);
    }
    
    const indices: number[] = [];
    for (let i = start; i <= end; i++) {
      indices.push(i);
    }
    return indices;
  };

  const visibleDots = getVisibleDotIndices();

  return (
    <div className={cn('relative group', className)}>
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {items.map((item, index) => {
          const inWindow = isInRenderWindow(index);
          
          return (
            <motion.div
              key={item.id}
              className="flex-none w-full snap-center origin-center"
              style={{ scrollSnapAlign: 'center' }}
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
                <div className="aspect-[4/5] bg-transparent" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-background/60 backdrop-blur-sm">
        {showEllipsis && visibleDots[0] > 0 && (
          <span className="text-muted-foreground/60 text-xs px-0.5">…</span>
        )}
        {visibleDots.map((dotIndex) => (
          <button
            key={dotIndex}
            onClick={() => onIndexChange(dotIndex)}
            className={cn(
              'rounded-full transition-all duration-200',
              dotIndex === activeIndex
                ? 'w-2 h-2 bg-primary'
                : 'w-1.5 h-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/60'
            )}
            aria-label={`Go to post ${dotIndex + 1}`}
          />
        ))}
        {showEllipsis && visibleDots[visibleDots.length - 1] < items.length - 1 && (
          <span className="text-muted-foreground/60 text-xs px-0.5">…</span>
        )}
      </div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const HorizontalLane = memo(HorizontalLaneBase) as typeof HorizontalLaneBase;

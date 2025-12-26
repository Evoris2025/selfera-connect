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
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const HorizontalLane = memo(HorizontalLaneBase) as typeof HorizontalLaneBase;

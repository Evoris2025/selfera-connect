import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HorizontalLaneProps<T> {
  items: T[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  showNavigation?: boolean;
}

export function HorizontalLane<T>({
  items,
  activeIndex,
  onIndexChange,
  renderItem,
  className,
  showNavigation = true,
}: HorizontalLaneProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll state
  const updateScrollState = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

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
  }, [activeIndex, items.length, onIndexChange]);

  const scrollPrev = () => {
    if (activeIndex > 0) {
      onIndexChange(activeIndex - 1);
    }
  };

  const scrollNext = () => {
    if (activeIndex < items.length - 1) {
      onIndexChange(activeIndex + 1);
    }
  };

  if (items.length <= 1) {
    return items.length === 1 ? <>{renderItem(items[0], 0)}</> : null;
  }

  return (
    <div className={cn('relative group', className)}>
      {/* Scroll container with snap */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {items.map((item, index) => (
          <motion.div
            key={index}
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
            {renderItem(item, index)}
          </motion.div>
        ))}
      </div>

      {/* Navigation arrows - desktop buttons, mobile floating indicators */}
      {showNavigation && (
        <>
          <AnimatePresence>
            {canScrollLeft && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30"
              >
                {/* Desktop: clickable button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={scrollPrev}
                  className="hidden md:flex h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background/90"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                {/* Mobile: floating indicator */}
                <div className="md:hidden w-9 h-9 rounded-full glass-floating flex items-center justify-center shadow-elevated pointer-events-none">
                  <ChevronLeft className="h-4 w-4 text-foreground" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {canScrollRight && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30"
              >
                {/* Desktop: clickable button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={scrollNext}
                  className="hidden md:flex h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background/90"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
                {/* Mobile: floating indicator */}
                <div className="md:hidden w-9 h-9 rounded-full glass-floating flex items-center justify-center shadow-elevated pointer-events-none">
                  <ChevronRight className="h-4 w-4 text-foreground" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
        {items.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => onIndexChange(index)}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              index === activeIndex
                ? 'w-6 bg-primary'
                : 'w-1.5 bg-foreground/40 hover:bg-foreground/60'
            )}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>
    </div>
  );
}

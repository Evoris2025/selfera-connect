import { useRef, useEffect, useState } from 'react';
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
          <div
            key={index}
            className="flex-none w-full snap-center"
            style={{ scrollSnapAlign: 'center' }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

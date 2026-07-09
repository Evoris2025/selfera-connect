import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCurrentUserAvatar } from '@/hooks/useCurrentUserAvatar';
import { useFeedData } from '@/contexts/FeedDataContext';
import { useNavbar } from '@/contexts/NavbarContext';
import { ExpressionViewer } from '@/components/ExpressionViewer';
import { CreatorStudio } from '@/components/creator';
import { BrandIcon } from '@/components/brand';
import { useThemeColor } from '@/hooks/useThemeColor';

const BATCH_SIZE = 8;
const INITIAL_VISIBLE = 8;

export function ExpressionsRow() {
  const { avatarUrl, displayName } = useCurrentUserAvatar();
  const { expressions, markExpressionSeen } = useFeedData();
  const { hideNavbar, showNavbar } = useNavbar();
  const themePrimary = useThemeColor().primary;
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset visible count if expressions change significantly
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [expressions.length]);

  // Hide navbar when expression viewer is open
  useEffect(() => {
    if (viewerOpen) {
      hideNavbar();
    } else {
      showNavbar();
    }
  }, [viewerOpen, hideNavbar, showNavbar]);

  const handleExpressionClick = (index: number) => {
    const realIndex = expressions.length > 0 ? index % expressions.length : 0;
    setViewerInitialIndex(realIndex);
    setViewerOpen(true);
    const expression = expressions[realIndex];
    if (expression) {
      markExpressionSeen(expression.id);
    }
  };

  const handleCreateClick = () => {
    setCreatorOpen(true);
  };

  const updateScrollState = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollWidth - scrollLeft - clientWidth > 8);
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    if (scrollWidth - scrollLeft - clientWidth < 200 && expressions.length > 0) {
      setVisibleCount(prev => prev + BATCH_SIZE);
    }
    updateScrollState();
  }, [expressions.length, updateScrollState]);

  useEffect(() => {
    updateScrollState();
  }, [visibleCount, updateScrollState]);

  const scrollBy = useCallback((delta: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: delta, behavior: 'smooth' });
    }
  }, []);

  // Infinite scroll: cycle through the expressions list
  const renderedCount = expressions.length > 0 ? visibleCount : 0;

  return (
    <>
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="w-full overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex gap-3 px-4 py-2">
            {/* Create Expression Card */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCreateClick}
              className="flex-shrink-0 flex flex-col items-center gap-2"
            >
              <div className="relative">
                <Avatar
                  className="h-16 w-16"
                  style={{ boxShadow: `0 0 0 2px ${themePrimary}` }}
                >
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback className="bg-white/[0.06] text-white">
                    {(displayName ?? '?').charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center border border-black"
                  style={{ backgroundColor: themePrimary }}
                >
                  <Plus className="h-3 w-3 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <span className="text-caption text-white/55 truncate max-w-[72px]">Express Yourself</span>
            </motion.button>

            {/* Expression Cards from FeedDataContext (cycled for infinite scroll) */}
            {Array.from({ length: renderedCount }).map((_, index) => {
              const expression = expressions[index % expressions.length];
              return (
                <motion.button
                  key={`${expression.id}-${index}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(index + 1, 8) * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleExpressionClick(index)}
                  className="flex-shrink-0 flex flex-col items-center gap-2"
                >
                  <Avatar className="h-16 w-16 border border-white/[0.15]">
                    <AvatarImage src={expression.userAvatar} alt={expression.userName} />
                    <AvatarFallback className="bg-white/[0.06] text-white">
                      {expression.userName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-caption text-white/55 truncate max-w-[72px]">
                    {expression.userName}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Scroll arrows — plain, no background */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.button
              key="left-arrow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => scrollBy(-260)}
              aria-label="Scroll left"
              className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center cursor-pointer text-white/90"
            >
              <BrandIcon icon={ChevronLeft} size={18} />
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {canScrollRight && (
            <motion.button
              key="right-arrow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => scrollBy(260)}
              aria-label="Scroll right"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center cursor-pointer text-white/90"
            >
              <BrandIcon icon={ChevronRight} size={18} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Expression Viewer Modal */}
      <ExpressionViewer
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        initialIndex={viewerInitialIndex}
      />

      {/* Creator Studio for creating expressions */}
      <CreatorStudio
        open={creatorOpen}
        onOpenChange={setCreatorOpen}
        initialMode="expression"
      />
    </>
  );
}

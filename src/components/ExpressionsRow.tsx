import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCurrentUserAvatar } from '@/hooks/useCurrentUserAvatar';
import { useFeedData } from '@/contexts/FeedDataContext';
import { useNavbar } from '@/contexts/NavbarContext';
import { ExpressionViewer } from '@/components/ExpressionViewer';
import { CreatorStudio } from '@/components/creator';
import { BrandIcon } from '@/components/brand';
import { useThemeColor } from '@/hooks/useThemeColor';

const BATCH_SIZE = 5;
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
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset visible count if expressions change significantly
  useEffect(() => {
    setVisibleCount(Math.min(INITIAL_VISIBLE, expressions.length));
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
    setViewerInitialIndex(index);
    setViewerOpen(true);
    // Mark expression as seen
    const expression = expressions[index];
    if (expression) {
      markExpressionSeen(expression.id);
    }
  };

  const handleCreateClick = () => {
    setCreatorOpen(true);
  };

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    if (scrollWidth - scrollLeft - clientWidth < 120) {
      setVisibleCount(prev => Math.min(prev + BATCH_SIZE, expressions.length));
    }
  }, [expressions.length]);

  const scrollRight = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  }, []);

  const hasMore = visibleCount < expressions.length;

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
                  className="h-20 w-20"
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
              <span className="text-caption text-white/55 truncate max-w-[80px]">your story</span>
            </motion.button>

            {/* Expression Cards from FeedDataContext */}
            {expressions.slice(0, visibleCount).map((expression, index) => (
              <motion.button
                key={expression.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (index + 1) * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleExpressionClick(index)}
                className="flex-shrink-0 flex flex-col items-center gap-2"
              >
                <Avatar className="h-20 w-20 border border-white/[0.15]">
                  <AvatarImage src={expression.userAvatar} alt={expression.userName} />
                  <AvatarFallback className="bg-white/[0.06] text-white">
                    {expression.userName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-caption text-white/55 truncate max-w-[80px]">
                  {expression.userName}
                </span>
              </motion.button>
            ))}

            {/* Loading indicator */}
            {hasMore && (
              <div className="flex-shrink-0 flex items-center justify-center w-20">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Right scroll indicator */}
        {hasMore && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            onClick={scrollRight}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/[0.12] flex items-center justify-center cursor-pointer"
          >
            <BrandIcon icon={ChevronRight} size={16} />
          </motion.button>
        )}
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

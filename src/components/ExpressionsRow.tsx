import { useState, useEffect } from 'react';
import { Plus, ChevronRight } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { CinematicAvatar } from '@/components/ui/CinematicAvatar';
import { useCurrentUserAvatar } from '@/hooks/useCurrentUserAvatar';
import { useFeedData } from '@/contexts/FeedDataContext';
import { useNavbar } from '@/contexts/NavbarContext';
import { ExpressionViewer } from '@/components/ExpressionViewer';
import { CreatorStudio } from '@/components/creator';

export function ExpressionsRow() {
  const { avatarUrl, displayName } = useCurrentUserAvatar();
  const { expressions, markExpressionSeen } = useFeedData();
  const { hideNavbar, showNavbar } = useNavbar();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);
  const [creatorOpen, setCreatorOpen] = useState(false);

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

  return (
    <>
      <div className="relative">
        <ScrollArea className="w-full">
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
                <CinematicAvatar
                  src={avatarUrl}
                  alt={displayName}
                  size="xl"
                  ring="muted"
                />
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full gradient-brand flex items-center justify-center ring-3 ring-background shadow-glow">
                  <Plus className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
              <span className="text-xs text-muted-foreground font-medium">Create Expression</span>
            </motion.button>

            {/* Expression Cards from FeedDataContext */}
            {expressions.map((expression, index) => (
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
                <CinematicAvatar
                  src={expression.userAvatar}
                  alt={expression.userName}
                  fallback={expression.userName.charAt(0)}
                  size="xl"
                  ring={expression.hasUnseenExpression ? 'gradient' : 'muted'}
                />
                <span className="text-xs text-foreground/80 font-medium max-w-[72px] truncate">
                  {expression.userName}
                </span>
              </motion.button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>

        {/* Right scroll indicator */}
        <motion.button 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary/15 backdrop-blur-md border border-primary/25 flex items-center justify-center shadow-lg hover:bg-primary/20 hover:border-primary/30 transition-all duration-300"
        >
          <ChevronRight className="h-4 w-4 text-primary" />
        </motion.button>
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

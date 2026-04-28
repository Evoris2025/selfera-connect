import { useState } from 'react';
import { motion } from 'framer-motion';
import { HighlightCircle, Highlight } from './HighlightCircle';
import { CreateHighlightModal } from '@/components/expressions/CreateHighlightModal';
import { HighlightViewer } from '@/components/expressions/HighlightViewer';

interface HighlightRowProps {
  highlights: Highlight[];
  isOwnProfile?: boolean;
  onCreateHighlight?: () => void;
}

export function HighlightRow({ 
  highlights, 
  isOwnProfile = false,
  onCreateHighlight,
}: HighlightRowProps) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);

  const handleHighlightClick = (highlight: Highlight) => {
    setSelectedHighlight(highlight);
    setViewerOpen(true);
  };

  const handleCreate = () => {
    setCreateModalOpen(true);
    onCreateHighlight?.();
  };

  // Don't render if no highlights and not own profile
  if (highlights.length === 0 && !isOwnProfile) {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full"
      >
        <div
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory rail-fade-right -mx-4 pl-4 pr-10 py-3"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Create button - only for own profile */}
          {isOwnProfile && (
            <div className="flex-shrink-0 snap-start">
              <HighlightCircle
                isCreateButton
                onClick={handleCreate}
              />
            </div>
          )}

          {/* Highlight circles */}
          {highlights.map((highlight, index) => (
            <motion.div
              key={highlight.id}
              className="flex-shrink-0 snap-start"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <HighlightCircle
                highlight={highlight}
                onClick={() => handleHighlightClick(highlight)}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Create Modal */}
      <CreateHighlightModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {/* Viewer */}
      <HighlightViewer
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        highlight={selectedHighlight}
      />
    </>
  );
}

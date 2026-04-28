import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Highlight } from '@/components/profile/HighlightCircle';

interface AddToHighlightSheetProps {
  isOpen: boolean;
  onClose: () => void;
  expressionId: string;
  expressionThumbnail: string;
}

// Mock existing highlights
const mockHighlights: Highlight[] = [
  { id: '1', name: 'Travel', coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop', itemCount: 5 },
  { id: '2', name: 'Wellness', coverUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=200&h=200&fit=crop', itemCount: 8 },
  { id: '3', name: 'Gratitude', coverUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=200&h=200&fit=crop', itemCount: 12 },
];

export function AddToHighlightSheet({ 
  isOpen, 
  onClose, 
  expressionId,
  expressionThumbnail,
}: AddToHighlightSheetProps) {
  const [highlights] = useState<Highlight[]>(mockHighlights);
  const [showNewHighlight, setShowNewHighlight] = useState(false);
  const [newHighlightName, setNewHighlightName] = useState('');

  const handleAddToHighlight = (highlight: Highlight) => {
    toast({
      description: `Added to "${highlight.name}"`,
    });
    if (navigator.vibrate) navigator.vibrate(10);
    onClose();
  };

  const handleCreateNew = () => {
    if (!newHighlightName.trim()) return;
    
    toast({
      description: `Created "${newHighlightName}" and added expression`,
    });
    if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
    setNewHighlightName('');
    setShowNewHighlight(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="fixed inset-x-0 bottom-0 max-h-[70vh] bg-background rounded-t-3xl z-50"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Bookmark className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Save to Highlight</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-full hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <ScrollArea className="max-h-[50vh]">
              <div className="p-4 space-y-3">
                {/* Create New */}
                {!showNewHighlight ? (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowNewHighlight(true)}
                    className="w-full flex items-center gap-4 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <Plus className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">New Highlight</p>
                      <p className="text-body text-muted-foreground">Create a new collection</p>
                    </div>
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 rounded-xl bg-secondary/50 space-y-3"
                  >
                    <Input
                      value={newHighlightName}
                      onChange={(e) => setNewHighlightName(e.target.value)}
                      placeholder="Highlight name..."
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowNewHighlight(false);
                          setNewHighlightName('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleCreateNew}
                        disabled={!newHighlightName.trim()}
                      >
                        Create & Add
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Existing Highlights */}
                {highlights.map((highlight) => (
                  <motion.button
                    key={highlight.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAddToHighlight(highlight)}
                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-muted">
                      <img
                        src={highlight.coverUrl}
                        alt={highlight.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-medium">{highlight.name}</p>
                      <p className="text-body text-muted-foreground">{highlight.itemCount} items</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

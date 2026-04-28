import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Check, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface Highlight {
  id: string;
  name: string;
  coverUrl?: string;
  expressionCount: number;
}

interface HighlightSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToHighlight: (highlightId: string) => void;
  onCreateNew: (name: string) => void;
  existingHighlights: Highlight[];
}

export function HighlightSelector({
  isOpen,
  onClose,
  onAddToHighlight,
  onCreateNew,
  existingHighlights,
}: HighlightSelectorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleCreate = () => {
    if (!newName.trim()) return;
    onCreateNew(newName.trim());
    setNewName('');
    setIsCreating(false);
    onClose();
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    onAddToHighlight(id);
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

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed inset-x-4 bottom-4 max-w-md mx-auto bg-background rounded-2xl z-50 overflow-hidden shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Add to Highlight</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-full hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {isCreating ? (
                <div className="space-y-4">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Highlight name..."
                    maxLength={30}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setIsCreating(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={handleCreate}
                      disabled={!newName.trim()}
                    >
                      Create
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Create New Button */}
                  <button
                    onClick={() => setIsCreating(true)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors mb-4"
                  >
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <Plus className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">New Highlight</p>
                      <p className="text-body text-muted-foreground">Create a new highlight</p>
                    </div>
                  </button>

                  {/* Existing Highlights */}
                  {existingHighlights.length > 0 && (
                    <ScrollArea className="max-h-[300px]">
                      <div className="space-y-2">
                        <p className="text-body font-medium text-muted-foreground mb-2">
                          Your Highlights
                        </p>
                        {existingHighlights.map((highlight) => (
                          <motion.button
                            key={highlight.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelect(highlight.id)}
                            className={cn(
                              "w-full flex items-center gap-3 p-3 rounded-xl transition-colors",
                              selectedId === highlight.id 
                                ? "bg-primary/10 border border-primary" 
                                : "bg-secondary/30 hover:bg-secondary/50"
                            )}
                          >
                            <div 
                              className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center overflow-hidden"
                              style={highlight.coverUrl ? { 
                                backgroundImage: `url(${highlight.coverUrl})`,
                                backgroundSize: 'cover',
                              } : undefined}
                            >
                              {!highlight.coverUrl && (
                                <Bookmark className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div className="text-left flex-1">
                              <p className="font-semibold">{highlight.name}</p>
                              <p className="text-body text-muted-foreground">
                                {highlight.expressionCount} expression{highlight.expressionCount !== 1 ? 's' : ''}
                              </p>
                            </div>
                            {selectedId === highlight.id && (
                              <Check className="w-5 h-5 text-primary" />
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </ScrollArea>
                  )}

                  {existingHighlights.length === 0 && (
                    <p className="text-center text-muted-foreground text-body py-4">
                      No highlights yet. Create your first one!
                    </p>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Post-share prompt component
interface AddToHighlightPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToHighlight: () => void;
  onSkip: () => void;
}

export function AddToHighlightPrompt({
  isOpen,
  onClose,
  onAddToHighlight,
  onSkip,
}: AddToHighlightPromptProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-x-4 bottom-4 max-w-sm mx-auto bg-background rounded-2xl z-50 p-6 text-center shadow-xl"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-title font-semibold mb-2">Save to Highlight?</h3>
            <p className="text-muted-foreground text-body mb-6">
              Keep this expression on your profile permanently by adding it to a highlight.
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={onSkip}
              >
                Skip
              </Button>
              <Button 
                className="flex-1"
                onClick={onAddToHighlight}
              >
                Add to Highlight
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ImageIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CreateHighlightModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock expressions to select from
const mockExpressions = [
  { id: '1', thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop' },
  { id: '2', thumbnailUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=200&h=200&fit=crop' },
  { id: '3', thumbnailUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=200&h=200&fit=crop' },
  { id: '4', thumbnailUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=200&h=200&fit=crop' },
  { id: '5', thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
  { id: '6', thumbnailUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' },
];

export function CreateHighlightModal({ isOpen, onClose }: CreateHighlightModalProps) {
  const [name, setName] = useState('');
  const [selectedExpressions, setSelectedExpressions] = useState<string[]>([]);
  const [coverExpression, setCoverExpression] = useState<string | null>(null);

  const toggleExpression = (id: string) => {
    setSelectedExpressions(prev => {
      if (prev.includes(id)) {
        // If removing the cover, clear it
        if (coverExpression === id) {
          setCoverExpression(null);
        }
        return prev.filter(e => e !== id);
      } else {
        // Auto-set first selected as cover
        if (prev.length === 0) {
          setCoverExpression(id);
        }
        return [...prev, id];
      }
    });
  };

  const handleCreate = () => {
    if (!name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a name for your highlight.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedExpressions.length === 0) {
      toast({
        title: 'Select expressions',
        description: 'Please select at least one expression.',
        variant: 'destructive',
      });
      return;
    }

    // In real implementation, this would save to database
    toast({
      title: 'Highlight created!',
      description: `"${name}" has been added to your profile.`,
    });

    // Reset and close
    setName('');
    setSelectedExpressions([]);
    setCoverExpression(null);
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
            className="fixed inset-x-4 top-[10%] bottom-[10%] max-w-lg mx-auto bg-background rounded-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">New Highlight</h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-full hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Name Input */}
              <div className="p-4 border-b border-border">
                <label className="text-sm font-medium mb-2 block">Highlight Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Travel, Wellness, Gratitude..."
                  maxLength={30}
                />
              </div>

              {/* Expression Selection */}
              <div className="flex-1 overflow-hidden">
                <div className="p-4 pb-2">
                  <label className="text-sm font-medium">
                    Select Expressions ({selectedExpressions.length} selected)
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tap to select. Long-press to set as cover.
                  </p>
                </div>
                
                <ScrollArea className="h-[calc(100%-60px)]">
                  <div className="grid grid-cols-3 gap-2 p-4 pt-0">
                    {mockExpressions.map((expr) => {
                      const isSelected = selectedExpressions.includes(expr.id);
                      const isCover = coverExpression === expr.id;
                      
                      return (
                        <motion.button
                          key={expr.id}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleExpression(expr.id)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            if (isSelected) {
                              setCoverExpression(expr.id);
                            }
                          }}
                          className={cn(
                            "aspect-[3/4] rounded-xl overflow-hidden relative",
                            isSelected && "ring-2 ring-primary",
                            isCover && "ring-2 ring-primary ring-offset-2"
                          )}
                        >
                          <img
                            src={expr.thumbnailUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          
                          {/* Selection indicator */}
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                            >
                              <Check className="w-4 h-4 text-primary-foreground" />
                            </motion.div>
                          )}
                          
                          {/* Cover badge */}
                          {isCover && (
                            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                              Cover
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border">
              <Button
                onClick={handleCreate}
                disabled={!name.trim() || selectedExpressions.length === 0}
                className="w-full"
              >
                Create Highlight
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

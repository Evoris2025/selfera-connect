import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { CharacterCounter } from './CharacterCounter';

export interface ThreadItem {
  id: string;
  content: string;
}

interface ThreadComposerProps {
  items: ThreadItem[];
  onItemsChange: (items: ThreadItem[]) => void;
  maxCharacters?: number;
}

export function ThreadComposer({
  items,
  onItemsChange,
  maxCharacters = 500,
}: ThreadComposerProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const updateItem = (id: string, content: string) => {
    onItemsChange(
      items.map((item) =>
        item.id === id ? { ...item, content } : item
      )
    );
  };

  const addItem = () => {
    const newItem: ThreadItem = {
      id: `thread-${Date.now()}`,
      content: '',
    };
    onItemsChange([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    onItemsChange(items.filter((item) => item.id !== id));
  };

  const handleReorder = (newOrder: ThreadItem[]) => {
    onItemsChange(newOrder);
  };

  return (
    <div className="space-y-3">
      <Reorder.Group
        axis="y"
        values={items}
        onReorder={handleReorder}
        className="space-y-3"
      >
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <Reorder.Item
              key={item.id}
              value={item}
              onDragStart={() => setDraggedId(item.id)}
              onDragEnd={() => setDraggedId(null)}
              className={cn(
                'relative group',
                draggedId === item.id && 'z-10'
              )}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={cn(
                  'relative rounded-xl border border-border bg-card transition-shadow',
                  draggedId === item.id && 'shadow-lg'
                )}
              >
                {/* Thread connector line */}
                {index > 0 && (
                  <div className="absolute -top-3 left-6 w-0.5 h-3 bg-border" />
                )}
                {index < items.length - 1 && (
                  <div className="absolute -bottom-3 left-6 w-0.5 h-3 bg-border" />
                )}

                {/* Drag handle */}
                <div
                  className={cn(
                    'absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing',
                    'opacity-0 group-hover:opacity-100 transition-opacity'
                  )}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>

                {/* Thread number indicator */}
                <div className="absolute left-3 top-3 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">
                    {index + 1}
                  </span>
                </div>

                {/* Content area */}
                <div className="pl-12 pr-3 py-3">
                  <Textarea
                    value={item.content}
                    onChange={(e) => updateItem(item.id, e.target.value)}
                    placeholder={
                      index === 0
                        ? "Start your thread..."
                        : "Continue your thought..."
                    }
                    className="min-h-[80px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0"
                    maxLength={maxCharacters}
                  />

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                    <CharacterCounter
                      current={item.content.length}
                      max={maxCharacters}
                    />

                    {items.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>

      {/* Add thread button */}
      <Button
        variant="outline"
        size="sm"
        onClick={addItem}
        className="w-full gap-2 border-dashed"
      >
        <Plus className="h-4 w-4" />
        Add to thread
      </Button>

      {/* Thread summary */}
      <div className="text-xs text-muted-foreground text-center">
        {items.length} {items.length === 1 ? 'post' : 'posts'} in thread •{' '}
        {items.reduce((acc, item) => acc + item.content.length, 0)} total characters
      </div>
    </div>
  );
}

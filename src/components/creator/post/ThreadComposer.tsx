import { useState } from 'react';
import { Plus, Trash2, GripVertical, Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { CharacterCounter } from './CharacterCounter';
import { insertThreadAt, removeThreadAt } from './threadReorder';

export interface ThreadItem {
  id: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'gif';
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
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const updateItem = (id: string, patch: Partial<ThreadItem>) => {
    onItemsChange(items.map(it => (it.id === id ? { ...it, ...patch } : it)));
  };

  const addAt = (index: number) => {
    onItemsChange(insertThreadAt(items, index, { id: `thread-${Date.now()}`, content: '' }));
  };

  const remove = (index: number) => onItemsChange(removeThreadAt(items, index));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = items.findIndex(i => i.id === active.id);
    const to = items.findIndex(i => i.id === over.id);
    if (from === -1 || to === -1) return;
    onItemsChange(arrayMove(items, from, to));
  };

  return (
    <div className="space-y-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => (
              <SortableThread
                key={item.id}
                item={item}
                index={index}
                total={items.length}
                maxCharacters={maxCharacters}
                onUpdate={(patch) => updateItem(item.id, patch)}
                onRemove={() => remove(index)}
                onInsertAfter={() => addAt(index + 1)}
              />
            ))}
          </AnimatePresence>
        </SortableContext>
      </DndContext>

      <Button
        variant="outline"
        size="sm"
        onClick={() => addAt(items.length)}
        className="w-full gap-2 border-dashed"
      >
        <Plus className="h-4 w-4" />
        Add to thread
      </Button>

      <div className="text-xs text-muted-foreground text-center">
        {items.length} {items.length === 1 ? 'post' : 'posts'} in thread •{' '}
        {items.reduce((acc, it) => acc + it.content.length, 0)} total characters
      </div>
    </div>
  );
}

interface SortableThreadProps {
  item: ThreadItem;
  index: number;
  total: number;
  maxCharacters: number;
  onUpdate: (patch: Partial<ThreadItem>) => void;
  onRemove: () => void;
  onInsertAfter: () => void;
}

function SortableThread({ item, index, total, maxCharacters, onUpdate, onRemove, onInsertAfter }: SortableThreadProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const [hovered, setHovered] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onUpdate({
      mediaUrl: url,
      mediaType: file.type.startsWith('video') ? 'video' : 'image',
    });
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn('relative group', isDragging && 'z-10 opacity-70')}
    >
      <div className={cn(
        'relative rounded-xl border border-border bg-card transition-shadow',
        isDragging && 'shadow-lg'
      )}>
        {/* Connector lines */}
        {index > 0 && <div className="absolute -top-2 left-6 w-0.5 h-2 bg-border" />}

        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          className="absolute left-1 top-1 p-1.5 rounded opacity-50 hover:opacity-100 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Index badge */}
        <div className="absolute left-8 top-3 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-xs font-medium text-primary">{index + 1}</span>
        </div>

        <div className="pl-16 pr-3 py-3">
          <Textarea
            value={item.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder={index === 0 ? 'Start your thread…' : 'Continue your thought…'}
            className="min-h-[80px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0"
            maxLength={maxCharacters}
          />

          {item.mediaUrl && (
            <div className="relative mt-2 rounded-lg overflow-hidden bg-secondary">
              {item.mediaType === 'video' ? (
                <video src={item.mediaUrl} className="w-full max-h-48 object-cover" controls={false} />
              ) : (
                <img src={item.mediaUrl} alt="" className="w-full max-h-48 object-cover" />
              )}
              <button
                onClick={() => onUpdate({ mediaUrl: undefined, mediaType: undefined })}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 hover:bg-black/80"
                aria-label="Remove media"
              >
                <X className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <CharacterCounter current={item.content.length} max={maxCharacters} />
              <label className="p-1.5 rounded hover:bg-secondary cursor-pointer text-muted-foreground hover:text-foreground" aria-label="Attach media">
                <ImageIcon className="h-3.5 w-3.5" />
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaSelect}
                  className="hidden"
                />
              </label>
            </div>

            {total > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onRemove}
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                aria-label="Remove thread item"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Insert-between affordance */}
      {index < total - 1 && (
        <div
          className={cn(
            'relative h-3 flex items-center justify-center transition-opacity',
            hovered ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-border/60" />
          <button
            onClick={onInsertAfter}
            className="relative z-10 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow"
            aria-label="Insert thread item here"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      )}
    </motion.div>
  );
}

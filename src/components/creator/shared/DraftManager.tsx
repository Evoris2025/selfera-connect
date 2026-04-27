import { useState, useEffect, useCallback } from 'react';
import { FileText, Trash2, Clock, ChevronRight, Sparkles, Video, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import {
  BrandSheetContent,
  BrandSheetTitle,
  BrandSheetSectionLabel,
  BrandSheetItem,
} from '@/components/ui/sheet-system';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export type ContentType = 'expression' | 'video' | 'image' | 'post';

export interface Draft {
  id: string;
  contentType: ContentType;
  data: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  title?: string;
}

const STORAGE_KEY = 'selfera-drafts';

// Hook for managing drafts
export function useDrafts() {
  const [drafts, setDrafts] = useState<Draft[]>([]);

  // Load drafts from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setDrafts(parsed.map((d: Draft) => ({
          ...d,
          createdAt: new Date(d.createdAt),
          updatedAt: new Date(d.updatedAt),
        })));
      }
    } catch (error) {
      console.error('Failed to load drafts:', error);
    }
  }, []);

  // Save drafts to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    } catch (error) {
      console.error('Failed to save drafts:', error);
    }
  }, [drafts]);

  const saveDraft = useCallback((contentType: ContentType, data: Record<string, unknown>, existingId?: string) => {
    const now = new Date();
    const title = generateDraftTitle(contentType, data);

    setDrafts(prev => {
      if (existingId) {
        return prev.map(d => 
          d.id === existingId 
            ? { ...d, data, updatedAt: now, title }
            : d
        );
      }
      
      const newDraft: Draft = {
        id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        contentType,
        data,
        createdAt: now,
        updatedAt: now,
        title,
      };
      return [newDraft, ...prev];
    });
  }, []);

  const deleteDraft = useCallback((id: string) => {
    setDrafts(prev => prev.filter(d => d.id !== id));
  }, []);

  const getDraftsByType = useCallback((type: ContentType) => {
    return drafts.filter(d => d.contentType === type);
  }, [drafts]);

  const clearAllDrafts = useCallback(() => {
    setDrafts([]);
  }, []);

  return {
    drafts,
    saveDraft,
    deleteDraft,
    getDraftsByType,
    clearAllDrafts,
  };
}

function generateDraftTitle(type: ContentType, data: Record<string, unknown>): string {
  // Try to extract a meaningful title from the data
  const content = data.content as string || data.title as string || '';
  if (content) {
    return content.slice(0, 50) + (content.length > 50 ? '...' : '');
  }
  
  const typeLabels: Record<ContentType, string> = {
    expression: 'Expression Draft',
    video: 'Video Draft',
    image: 'Photo Draft',
    post: 'Post Draft',
  };
  
  return typeLabels[type];
}

const typeIconMap: Record<ContentType, typeof Sparkles> = {
  expression: Sparkles,
  video: Video,
  image: ImageIcon,
  post: FileText,
};

const ROW_ACCENT = 'hsl(271 91% 65%)'; // brand purple — matches "Your work" rows

interface DraftManagerProps {
  onSelectDraft?: (draft: Draft) => void;
  filterType?: ContentType;
  className?: string;
}

export function DraftManager({ onSelectDraft, filterType, className }: DraftManagerProps) {
  const { drafts, deleteDraft, clearAllDrafts } = useDrafts();
  const [open, setOpen] = useState(false);

  const filteredDrafts = filterType 
    ? drafts.filter(d => d.contentType === filterType)
    : drafts;

  const handleSelect = (draft: Draft) => {
    onSelectDraft?.(draft);
    setOpen(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteDraft(id);
  };

  if (filteredDrafts.length === 0) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('gap-2 text-muted-foreground', className)}
        >
          <FileText className="h-4 w-4" />
          Drafts ({filteredDrafts.length})
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader className="flex-row items-center justify-between pr-8">
          <SheetTitle>Your Drafts</SheetTitle>
          {filteredDrafts.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllDrafts}
              className="text-destructive hover:text-destructive"
            >
              Clear All
            </Button>
          )}
        </SheetHeader>

        <div className="mt-4 space-y-2 overflow-y-auto max-h-[calc(70vh-100px)]">
          <AnimatePresence>
            {filteredDrafts.map((draft, index) => (
              <motion.button
                key={draft.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelect(draft)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-left group"
              >
                {/* Type indicator */}
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-lg', typeColors[draft.contentType])}>
                  {typeIcons[draft.contentType]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {draft.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(draft.updatedAt, { addSuffix: true })}
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={(e) => handleDelete(e, draft.id)}
                  className="p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/20 transition-all"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
}

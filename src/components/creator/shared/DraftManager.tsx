import { useState, useEffect, useCallback } from 'react';
import { ICON_SIZE } from "@/lib/scale";
import { FileText, Trash2, Clock, ChevronRight, Sparkles } from 'lucide-react';
import {
  ExpressionIcon,
  VideoIcon,
  ImagesIcon,
  PostsIcon,
} from '@/components/icons/contentTypeIcons';
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

const typeIconMap: Record<ContentType, React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number | string }>> = {
  expression: ExpressionIcon,
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
      <BrandSheetContent maxHeight="70vh" className="flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <BrandSheetTitle setup="your" emphasis="DRAFTS" srDescription="Saved drafts" />
          {filteredDrafts.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllDrafts}
              className="h-7 px-2 text-label text-white/50 hover:text-destructive shrink-0 mt-2"
            >
              Clear all
            </Button>
          )}
        </div>

        <BrandSheetSectionLabel>Recent</BrandSheetSectionLabel>

        <div className="flex-1 overflow-y-auto space-y-2 pb-2">
          <AnimatePresence>
            {filteredDrafts.map((draft, index) => {
              const Icon = typeIconMap[draft.contentType];
              return (
                <motion.div
                  key={draft.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <BrandSheetItem
                    icon={
                      <Icon
                        size={22}
                        strokeWidth={1.6}
                        stroke="url(#selfera-brand-gradient)"
                        fill="none"
                        aria-hidden
                        style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.35))' }}
                      />
                    }
                    title={draft.title}
                    meta={
                      <span className="inline-flex items-center gap-1">
                        <Clock size={11} className="text-white/40" />
                        {formatDistanceToNow(draft.updatedAt, { addSuffix: true })}
                      </span>
                    }
                    right={
                      <span className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, draft.id)}
                          aria-label="Delete draft"
                          className="p-1.5 rounded-full text-white/30 hover:text-destructive hover:bg-destructive/10 transition"
                        >
                          <Trash2 size={ICON_SIZE.sm} />
                        </button>
                        <ChevronRight size={16} className="text-white/40" />
                      </span>
                    }
                    accentColor={ROW_ACCENT}
                    onClick={() => handleSelect(draft)}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </BrandSheetContent>
    </Sheet>
  );
}

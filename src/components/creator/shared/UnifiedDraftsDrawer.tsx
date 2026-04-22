import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Trash2, ChevronRight, Clock, Sparkles, Video, Image as ImageIcon, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFeedData, type StudioContentKind, type StudioDraft, type ScheduledItem } from '@/contexts/FeedDataContext';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

type Tab = 'drafts' | 'scheduled';

interface UnifiedDraftsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: Tab;
}

const KIND_META: Record<StudioContentKind, { label: string; icon: typeof Sparkles; color: string; route: string }> = {
  expression: { label: 'Expression', icon: Sparkles, color: 'text-rose-400 bg-rose-500/15', route: '/studio/expression' },
  video:      { label: 'Video',      icon: Video,    color: 'text-blue-400 bg-blue-500/15', route: '/studio/video' },
  photo:      { label: 'Photo',      icon: ImageIcon,color: 'text-amber-400 bg-amber-500/15', route: '/studio/photo' },
  post:       { label: 'Post',       icon: FileText, color: 'text-emerald-400 bg-emerald-500/15', route: '/studio/post' },
};

export function UnifiedDraftsDrawer({ open, onOpenChange, initialTab = 'drafts' }: UnifiedDraftsDrawerProps) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const navigate = useNavigate();
  const { drafts, deleteDraft, scheduled, cancelScheduled } = useFeedData();

  const handleResume = (draft: StudioDraft) => {
    onOpenChange(false);
    const meta = KIND_META[draft.kind];
    navigate(`${meta.route}?draftId=${draft.id}`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] flex flex-col">
        <SheetHeader className="text-left">
          <SheetTitle>Your work</SheetTitle>
        </SheetHeader>

        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            variant={tab === 'drafts' ? 'default' : 'outline'}
            onClick={() => setTab('drafts')}
            className="flex-1"
          >
            Drafts ({drafts.length})
          </Button>
          <Button
            size="sm"
            variant={tab === 'scheduled' ? 'default' : 'outline'}
            onClick={() => setTab('scheduled')}
            className="flex-1"
          >
            Scheduled ({scheduled.length})
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto mt-4 space-y-2 pb-6">
          {tab === 'drafts' && (
            drafts.length === 0 ? (
              <EmptyState message="No saved drafts yet. Auto-saved drafts from any creator will appear here." />
            ) : (
              drafts.map(d => (
                <DraftRow
                  key={d.id}
                  draft={d}
                  onResume={() => handleResume(d)}
                  onDelete={() => deleteDraft(d.id)}
                />
              ))
            )
          )}

          {tab === 'scheduled' && (
            scheduled.length === 0 ? (
              <EmptyState message="No scheduled posts. Schedule something from any creator to see it here." />
            ) : (
              scheduled
                .slice()
                .sort((a, b) => a.scheduledAt - b.scheduledAt)
                .map(s => (
                  <ScheduledRow key={s.id} item={s} onCancel={() => cancelScheduled(s.id)} />
                ))
            )
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DraftRow({ draft, onResume, onDelete }: { draft: StudioDraft; onResume: () => void; onDelete: () => void }) {
  const meta = KIND_META[draft.kind];
  const Icon = meta.icon;
  return (
    <button
      onClick={onResume}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/70 text-left transition-colors group"
    >
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', meta.color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{draft.title || `${meta.label} draft`}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          <Clock className="h-3 w-3" />
          {formatDistanceToNow(draft.updatedAt, { addSuffix: true })}
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/15 transition"
        aria-label="Delete draft"
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </button>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

function ScheduledRow({ item, onCancel }: { item: ScheduledItem; onCancel: () => void }) {
  const meta = KIND_META[item.kind];
  const Icon = meta.icon;
  const isPast = item.scheduledAt < Date.now();
  return (
    <div className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/40">
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', meta.color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{meta.label}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          <Clock className="h-3 w-3" />
          {isPast ? 'Publishing…' : format(item.scheduledAt, 'MMM d, h:mm a')}
        </div>
      </div>
      <Button size="sm" variant="ghost" onClick={onCancel} className="text-destructive hover:text-destructive">
        Cancel
      </Button>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

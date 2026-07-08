import { useState } from 'react';
import { ICON_SIZE } from "@/lib/scale";
import { Sheet } from '@/components/ui/sheet';
import {
  BrandSheetContent,
  BrandSheetTitle,
  BrandSegmentedControl,
  BrandSheetSectionLabel,
  BrandSheetItem,
} from '@/components/ui/sheet-system';
import { Button } from '@/components/ui/button';
import {
  Trash2,
  ChevronRight,
  Clock,
  Sparkles,
  Video,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';
import { ExpressionIcon } from '@/components/icons/ExpressionIcon';
import { useNavigate } from 'react-router-dom';
import {
  useFeedData,
  type StudioContentKind,
  type StudioDraft,
  type ScheduledItem,
} from '@/contexts/FeedDataContext';
import { formatDistanceToNow, format } from 'date-fns';

type Tab = 'drafts' | 'scheduled';

interface UnifiedDraftsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: Tab;
}

const KIND_META: Record<
  StudioContentKind,
  { label: string; icon: typeof Sparkles; route: string }
> = {
  expression: { label: 'Expression', icon: Sparkles, route: '/studio/expression' },
  video: { label: 'Video', icon: Video, route: '/studio/video' },
  photo: { label: 'Photo', icon: ImageIcon, route: '/studio/photo' },
  post: { label: 'Post', icon: FileText, route: '/studio/post' },
};

// "Your work" rows use a magenta accent — the brand stop tied to personal expression.
const ROW_ACCENT = 'hsl(271 91% 65%)'; // matches --gradient-mid (purple)

function gradientIcon(Icon: typeof Sparkles) {
  return (
    <Icon
      size={22}
      strokeWidth={1.6}
      stroke="url(#selfera-brand-gradient)"
      fill="none"
      aria-hidden
      style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.35))' }}
    />
  );
}

export function UnifiedDraftsDrawer({
  open,
  onOpenChange,
  initialTab = 'drafts',
}: UnifiedDraftsDrawerProps) {
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
      <BrandSheetContent maxHeight="80vh" className="flex flex-col">
        <BrandSheetTitle setup="your" emphasis="WORK" srDescription="Your drafts and scheduled posts" />

        <BrandSegmentedControl<Tab>
          value={tab}
          onChange={setTab}
          ariaLabel="Drafts or scheduled"
          items={[
            { value: 'drafts', label: 'Drafts', count: drafts.length },
            { value: 'scheduled', label: 'Scheduled', count: scheduled.length },
          ]}
        />

        <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-2 pb-2">
          {tab === 'drafts' &&
            (drafts.length === 0 ? (
              <EmptyState message="No saved drafts yet. Auto-saved drafts from any creator will appear here." />
            ) : (
              <>
                <BrandSheetSectionLabel>Recent drafts</BrandSheetSectionLabel>
                {drafts.map((d) => {
                  const meta = KIND_META[d.kind];
                  return (
                    <BrandSheetItem
                      key={d.id}
                      icon={gradientIcon(meta.icon)}
                      title={d.title || `${meta.label} draft`}
                      meta={
                        <span className="inline-flex items-center gap-1">
                          <Clock size={11} className="text-white/40" />
                          {formatDistanceToNow(d.updatedAt, { addSuffix: true })}
                        </span>
                      }
                      right={
                        <span className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDraft(d.id);
                            }}
                            aria-label="Delete draft"
                            className="p-1.5 rounded-full text-white/30 hover:text-destructive hover:bg-destructive/10 transition"
                          >
                            <Trash2 size={ICON_SIZE.sm} />
                          </button>
                          <ChevronRight size={16} className="text-white/40" />
                        </span>
                      }
                      accentColor={ROW_ACCENT}
                      onClick={() => handleResume(d)}
                      ariaLabel={`Resume ${meta.label} draft`}
                    />
                  );
                })}
              </>
            ))}

          {tab === 'scheduled' &&
            (scheduled.length === 0 ? (
              <EmptyState message="No scheduled posts. Schedule something from any creator to see it here." />
            ) : (
              <>
                <BrandSheetSectionLabel>Upcoming</BrandSheetSectionLabel>
                {scheduled
                  .slice()
                  .sort((a, b) => a.scheduledAt - b.scheduledAt)
                  .map((s) => {
                    const meta = KIND_META[s.kind];
                    const isPast = s.scheduledAt < Date.now();
                    return (
                      <BrandSheetItem
                        key={s.id}
                        icon={gradientIcon(meta.icon)}
                        title={meta.label}
                        meta={
                          <span className="inline-flex items-center gap-1">
                            <Clock size={11} className="text-white/40" />
                            {isPast ? 'Publishing…' : format(s.scheduledAt, 'MMM d, h:mm a')}
                          </span>
                        }
                        right={
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => cancelScheduled(s.id)}
                            className="h-7 px-2 text-label text-white/50 hover:text-destructive"
                          >
                            Cancel
                          </Button>
                        }
                        accentColor={ROW_ACCENT}
                      />
                    );
                  })}
              </>
            ))}
        </div>
      </BrandSheetContent>
    </Sheet>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center text-body text-white/40">
      {message}
    </div>
  );
}

// Re-export type to avoid breaking imports
export type { ScheduledItem };

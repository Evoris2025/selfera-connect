import { useMemo, useState } from 'react';
import { Sheet } from '@/components/ui/sheet';
import {
  BrandSheetContent,
  BrandSheetTitle,
  BrandSheetSectionLabel,
  BrandSheetItem,
} from '@/components/ui/sheet-system';
import {
  Sparkles,
  Clock,
  ChevronRight,
} from 'lucide-react';
import {
  ExpressionIcon,
  VideoIcon,
  ImagesIcon,
  PostsIcon,
} from '@/components/icons/contentTypeIcons';
import { useNavigate } from 'react-router-dom';
import {
  useFeedData,
  type StudioContentKind,
  type StudioDraft,
  type ScheduledItem,
} from '@/contexts/FeedDataContext';
import { formatDistanceToNow, format } from 'date-fns';
import {
  ACCENT,
  CONTENT_TYPE_LABEL,
  kindToContentType,
  type ContentType,
} from './contentTypeAccents';

interface ContinueWorkingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  todayPrompt: string;
}

const KIND_META: Record<
  StudioContentKind,
  { icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number | string }>; route: string }
> = {
  expression: { icon: ExpressionIcon, route: '/studio/expression' },
  video: { icon: VideoIcon, route: '/studio/video' },
  photo: { icon: ImagesIcon, route: '/studio/photo' },
  post: { icon: PostsIcon, route: '/studio/post' },
};

function gradientIcon(
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number | string }>,
  size = 22
) {
  return (
    <Icon
      size={size}
      strokeWidth={1.6}
      stroke="url(#selfera-brand-gradient)"
      fill="none"
      aria-hidden
      style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.35))' }}
    />
  );
}


function draftTitle(d: StudioDraft): string {
  const t = (d.title || '').trim();
  if (t) return t;
  return `Untitled ${CONTENT_TYPE_LABEL[kindToContentType(d.kind)]}`;
}

function scheduledTitle(s: ScheduledItem): string {
  const raw = (s.payload?.title as string) || (s.payload?.caption as string) || '';
  const t = raw.trim();
  if (t) return t.length > 60 ? `${t.slice(0, 60)}…` : t;
  return `Untitled ${CONTENT_TYPE_LABEL[kindToContentType(s.kind)]}`;
}

export function ContinueWorkingSheet({
  open,
  onOpenChange,
  todayPrompt,
}: ContinueWorkingSheetProps) {
  const navigate = useNavigate();
  const { drafts, scheduled } = useFeedData();
  const [pickerOpen, setPickerOpen] = useState(false);

  const sortedDrafts = useMemo(
    () => [...drafts].sort((a, b) => b.updatedAt - a.updatedAt),
    [drafts],
  );
  const sortedScheduled = useMemo(
    () => [...scheduled].sort((a, b) => a.scheduledAt - b.scheduledAt),
    [scheduled],
  );

  const openDraft = (d: StudioDraft) => {
    const slug = d.kind === 'photo' ? 'photo' : d.kind;
    navigate(`/studio/${slug}?draftId=${d.id}`);
    onOpenChange(false);
  };

  const openScheduled = (s: ScheduledItem) => {
    const slug = s.kind === 'photo' ? 'photo' : s.kind;
    navigate(`/studio/${slug}?scheduledId=${s.id}`);
    onOpenChange(false);
  };

  const openPromptIn = (kind: ContentType) => {
    const slug = kind === 'image' ? 'photo' : kind;
    navigate(`/studio/${slug}?prompt=${encodeURIComponent(todayPrompt)}`);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <BrandSheetContent>
        <BrandSheetTitle
          setup="continue"
          emphasis="WORKING"
          srDescription="Resume drafts, see scheduled posts, or use today's prompt"
        />

        {/* RESUME — drafts */}
        {sortedDrafts.length > 0 && (
          <>
            <BrandSheetSectionLabel>Resume</BrandSheetSectionLabel>
            <div className="flex flex-col gap-2">
              {sortedDrafts.map((d) => {
                const ct = kindToContentType(d.kind);
                const Icon = KIND_META[d.kind].icon;
                return (
                  <BrandSheetItem
                    key={d.id}
                    icon={gradientIcon(Icon)}
                    title={draftTitle(d)}
                    meta={`${CONTENT_TYPE_LABEL[ct]} · last edited ${formatDistanceToNow(d.updatedAt, { addSuffix: true })}`}
                    accentColor={ACCENT[ct]}
                    onClick={() => openDraft(d)}
                    right={<ChevronRight size={16} className="text-white/40" />}
                  />
                );
              })}
            </div>
          </>
        )}

        {/* SCHEDULED */}
        {sortedScheduled.length > 0 && (
          <>
            <BrandSheetSectionLabel>Scheduled</BrandSheetSectionLabel>
            <div className="flex flex-col gap-2">
              {sortedScheduled.map((s) => {
                const ct = kindToContentType(s.kind);
                const Icon = KIND_META[s.kind].icon;
                return (
                  <BrandSheetItem
                    key={s.id}
                    icon={gradientIcon(Icon)}
                    title={scheduledTitle(s)}
                    meta={
                      <span className="inline-flex items-center gap-1">
                        <Clock size={11} className="text-white/50" />
                        {format(s.scheduledAt, "MMM d 'at' h:mm a")}
                      </span>
                    }
                    accentColor={ACCENT[ct]}
                    onClick={() => openScheduled(s)}
                    right={<ChevronRight size={16} className="text-white/40" />}
                  />
                );
              })}
            </div>
          </>
        )}

        {/* TODAY'S PROMPT */}
        {todayPrompt && (
          <>
            <BrandSheetSectionLabel>Today's prompt</BrandSheetSectionLabel>
            <div
              className="rounded-xl border bg-white/[0.03] px-4 py-3.5"
              style={{
                borderColor: `color-mix(in oklab, ${ACCENT.post} 30%, transparent)`,
              }}
            >
              <div className="flex items-start gap-3">
                {gradientIcon(Sparkles, 20)}
                <p className="text-body text-white/85 leading-snug flex-1">
                  {todayPrompt}
                </p>
              </div>

              {!pickerOpen ? (
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="mt-3 w-full text-caption font-semibold tracking-wider uppercase text-white/70 hover:text-white transition-colors py-2 rounded-lg border border-white/10 hover:border-white/20"
                >
                  Generate prompt
                </button>
              ) : (
                <div className="mt-3">
                  <p className="text-caption font-medium tracking-wider uppercase text-white/40 mb-2 px-1">
                    Create as
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {(['post', 'expression', 'image', 'video'] as ContentType[]).map((ct) => {
                      const Icon =
                        ct === 'post' ? FileText
                        : ct === 'expression' ? ExpressionIcon
                        : ct === 'image' ? ImageIcon
                        : Video;
                      return (
                        <button
                          key={ct}
                          type="button"
                          onClick={() => openPromptIn(ct)}
                          className="flex flex-col items-center gap-1.5 py-3 rounded-lg border bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                          style={{
                            borderColor: `color-mix(in oklab, ${ACCENT[ct]} 30%, transparent)`,
                          }}
                          aria-label={`Use prompt for ${CONTENT_TYPE_LABEL[ct]}`}
                        >
                          {gradientIcon(Icon, 18)}
                          <span className="text-caption font-semibold tracking-wider uppercase text-white/70">
                            {CONTENT_TYPE_LABEL[ct]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Empty state — only fires if no drafts, no scheduled, no prompt (rare) */}
        {sortedDrafts.length === 0 && sortedScheduled.length === 0 && !todayPrompt && (
          <p className="text-body text-white/50 text-center py-8">
            Nothing in progress yet. Pick a format below to begin.
          </p>
        )}
      </BrandSheetContent>
    </Sheet>
  );
}

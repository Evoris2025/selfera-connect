import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Video,
  Image as ImageIcon,
  FileText,
  Clock,
  ArrowLeft,
  X,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useFeedData } from '@/contexts/FeedDataContext';
import { UnifiedDraftsDrawer } from './shared/UnifiedDraftsDrawer';
import { BrandMark } from '@/components/BrandMark';
import { getTodayPrompt } from '@/lib/dailyPrompts';

export type ContentType = 'expression' | 'video' | 'image' | 'post';

interface ContentTypeCard {
  id: ContentType;
  icon: typeof Sparkles;
  title: string;
  description: string;
}

const contentTypes: ContentTypeCard[] = [
  { id: 'expression', icon: Sparkles, title: 'Expression', description: 'Moments that fade in 24h' },
  { id: 'video', icon: Video, title: 'Video', description: 'Long-form content' },
  { id: 'image', icon: ImageIcon, title: 'Photo', description: 'Share with style' },
  { id: 'post', icon: FileText, title: 'Post', description: 'Thoughts & polls' },
];

interface ContentTypeDashboardProps {
  onSelect: (type: ContentType) => void;
  onClose: () => void;
}

// Fixed SelfERA brand gradient — used only for the page hero typography.
// Never used for tile borders (those follow the user's theme color).
const BRAND_GRADIENT = 'linear-gradient(135deg, #d946ef, #8b5cf6, #2dd4bf)';

// Single-hue gradient built from the user's theme color (--primary).
// HSL CSS vars + the modern hsl(...) syntax let us add alpha on the fly.
const themeBorderGradient =
  'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.4), hsl(var(--primary) / 0.7), hsl(var(--primary)))';

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.round(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

function CreateTile({
  type,
  index,
  onClick,
  contextLine,
}: {
  type: ContentTypeCard;
  index: number;
  onClick: () => void;
  contextLine?: string;
}) {
  const Icon = type.icon;
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.06, type: 'spring', stiffness: 280, damping: 24 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl p-5 aspect-[4/5]',
        'bg-white/[0.03] hover:bg-white/[0.05] active:bg-white/[0.06]',
        'transition-colors text-left flex flex-col items-center justify-center',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]/40'
      )}
      style={{
        backgroundImage: `linear-gradient(hsl(var(--background)), hsl(var(--background))), ${themeBorderGradient}`,
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
        border: '1px solid transparent',
      }}
      aria-label={`Create ${type.title}`}
    >
      {/* Sheen overlay */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[700ms] ease-out"
        style={{
          background:
            'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%)',
        }}
      />

      <Icon
        size={36}
        strokeWidth={1.75}
        style={{ color: 'hsl(var(--primary))' }}
        aria-hidden
      />

      <span className="relative mt-4 text-lg font-semibold text-white tracking-tight">
        {type.title}
      </span>
      <span className="relative mt-1 text-xs text-white/55 text-center">
        {type.description}
      </span>
      {contextLine && (
        <span className="relative mt-2 text-[11px] text-white/45 text-center">
          {contextLine}
        </span>
      )}
    </motion.button>
  );
}

export function ContentTypeDashboard({ onSelect, onClose }: ContentTypeDashboardProps) {
  const navigate = useNavigate();
  const { drafts, scheduled } = useFeedData();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'drafts' | 'scheduled'>('drafts');

  const draftCount = drafts.length;
  const scheduledCount = scheduled.length;

  // Most-recent draft of any kind for the "continue where you left off" banner
  const latestDraft = useMemo(
    () => (drafts.length ? [...drafts].sort((a, b) => b.updatedAt - a.updatedAt)[0] : null),
    [drafts]
  );

  // Per-tile context lines — only render when we have real data; never fabricate.
  const draftsByKind = useMemo(() => {
    const map: Partial<Record<ContentType, number>> = {};
    for (const d of drafts) {
      const k = d.kind as ContentType;
      map[k] = (map[k] ?? 0) + 1;
    }
    return map;
  }, [drafts]);

  const tileContext = (id: ContentType): string | undefined => {
    const c = draftsByKind[id];
    if (c && c > 0) return `${c} draft${c === 1 ? '' : 's'} waiting`;
    return undefined;
  };

  const todayPrompt = useMemo(() => getTodayPrompt(), []);

  const openDraft = () => {
    if (!latestDraft) return;
    const slug = latestDraft.kind === 'image' ? 'photo' : latestDraft.kind;
    navigate(`/studio/${slug}?draftId=${latestDraft.id}`);
  };

  const openPromptComposer = () => {
    navigate(`/studio/post?prompt=${encodeURIComponent(todayPrompt)}`);
  };

  return (
    <div className="flex flex-col min-h-dvh bg-background pb-[calc(env(safe-area-inset-bottom)+72px)]">
      {/* Header — back · logo · close */}
      <div className="flex items-center justify-between h-14 px-3 shrink-0">
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/5 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <BrandMark className="h-7 w-[120px]" />
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/5 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Page hero (moved out of header) */}
      <div className="px-5 pt-4 pb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="font-medium text-white">what will you </span>
          <span
            style={{
              backgroundImage: BRAND_GRADIENT,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            CREATE.
          </span>
        </h1>
        <p className="text-sm text-white/50 mt-1">Pick a format to begin</p>
      </div>

      <div className="px-5">
        {/* Continue-where-you-left-off banner — only when a draft exists */}
        {latestDraft && (
          <button
            onClick={openDraft}
            className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 mb-4 flex items-center justify-between hover:bg-white/[0.06] hover:border-white/[0.15] transition"
          >
            <span className="flex items-center gap-2 min-w-0">
              <RefreshCw className="h-4 w-4 shrink-0" style={{ color: 'hsl(var(--primary))' }} />
              <span className="text-sm text-white/85 truncate">
                Pick up where you left off
                <span className="text-white/45"> · {relativeTime(latestDraft.updatedAt)}</span>
              </span>
            </span>
            <span className="text-xs text-white/70 shrink-0 ml-3 flex items-center gap-1">
              Continue <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </button>
        )}

        {/* Today's prompt */}
        <button
          onClick={openPromptComposer}
          className="w-full text-left rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.05] p-4 mb-5 transition flex items-start gap-3"
          aria-label="Use today's prompt"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" style={{ color: 'hsl(var(--primary))' }} />
              <span className="text-[11px] uppercase tracking-wider text-white/40">
                Today's prompt
              </span>
            </div>
            <p className="mt-1.5 text-sm text-white/85 leading-snug">{todayPrompt}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-white/40 mt-1 shrink-0" />
        </button>

        {/* 2x2 tile grid */}
        <div className="grid grid-cols-2 gap-3">
          {contentTypes.map((type, i) => (
            <CreateTile
              key={type.id}
              type={type}
              index={i}
              onClick={() => onSelect(type.id)}
              contextLine={tileContext(type.id)}
            />
          ))}
        </div>

        {/* Drafts / Scheduled — subtle ghost links */}
        <div className="flex justify-center gap-6 mt-6 text-sm text-white/55">
          <button
            onClick={() => { setDrawerTab('drafts'); setDrawerOpen(true); }}
            className="hover:text-white/85 transition"
          >
            Drafts
            {draftCount > 0 && (
              <span className="text-white/85 font-medium ml-1">{draftCount}</span>
            )}
          </button>
          <button
            onClick={() => { setDrawerTab('scheduled'); setDrawerOpen(true); }}
            className="hover:text-white/85 transition flex items-center gap-1"
          >
            <Clock className="h-3.5 w-3.5" />
            Scheduled
            {scheduledCount > 0 && (
              <span className="text-white/85 font-medium ml-1">{scheduledCount}</span>
            )}
          </button>
        </div>
      </div>

      <UnifiedDraftsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} initialTab={drawerTab} />
    </div>
  );
}

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
import { useCreatorRowBackgrounds, type CreatorRowType } from '@/hooks/useCreatorRowBackgrounds';

export type ContentType = 'expression' | 'video' | 'image' | 'post';

// Per-category SelfERA brand accents — used for the left-edge bar and icon tint.
// NOT user theme — user theme is reserved for personal identity surfaces.
const ACCENT: Record<ContentType, string> = {
  expression: '#d946ef', // SelfERA magenta
  video:      '#8b5cf6', // SelfERA violet
  image:      '#f59e0b', // SelfERA amber (Photo)
  post:       '#2dd4bf', // SelfERA teal
};

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
const BRAND_GRADIENT = 'linear-gradient(135deg, #d946ef, #8b5cf6, #2dd4bf)';

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

function CreatorRow({
  icon: Icon,
  title,
  description,
  accentColor,
  activity,
  backgroundUrl,
  onClick,
}: {
  icon: typeof Sparkles;
  title: string;
  description: string;
  accentColor: string;
  activity?: string;
  backgroundUrl: string | null;
  onClick: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const showPhoto = !!backgroundUrl && !imgFailed;

  // Empty-state gradient — accent at top-left fading to dark base.
  const fallbackGradient = `linear-gradient(135deg, ${accentColor}40 0%, ${accentColor}10 60%, #0a0a0a 100%)`;

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        'group relative w-full text-left',
        'h-64 rounded-2xl overflow-hidden',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]/40'
      )}
      aria-label={`Create ${title}`}
    >
      {/* Background layer */}
      {showPhoto ? (
        <>
          <img
            src={backgroundUrl!}
            alt=""
            aria-hidden
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="absolute inset-0 w-full h-full object-cover transition-[filter] duration-200"
            style={{ filter: 'brightness(0.55) saturate(0.9)' }}
          />
          {/* Directional scrim — heaviest at bottom-left where text sits */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(110deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.25) 100%)',
            }}
          />
        </>
      ) : (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: fallbackGradient }}
        />
      )}

      {/* Left-edge accent bar */}
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-[3px] transition-opacity duration-200 opacity-80 group-hover:opacity-100"
        style={{ background: accentColor }}
      />

      {/* Content layer */}
      <div className="relative z-10 flex flex-col justify-between h-full p-5">
        {/* Top row: icon chip (left) + chevron chip (right) */}
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-xl bg-white/[0.10] backdrop-blur-md border border-white/10 flex items-center justify-center">
            <Icon size={22} strokeWidth={2} style={{ color: accentColor }} aria-hidden />
          </div>
          <div className="w-8 h-8 rounded-full bg-white/[0.10] backdrop-blur-md border border-white/10 flex items-center justify-center">
            <ChevronRight size={16} className="text-white/85" />
          </div>
        </div>

        {/* Bottom-left: title / description / activity */}
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-white leading-tight tracking-tight">
            {title}
          </span>
          <span className="text-sm text-white/75 mt-1">{description}</span>
          {activity && (
            <span className="text-xs text-white/60 mt-2">{activity}</span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

export function ContentTypeDashboard({ onSelect, onClose }: ContentTypeDashboardProps) {
  const navigate = useNavigate();
  const { drafts, scheduled } = useFeedData();
  const backgrounds = useCreatorRowBackgrounds();
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
      // StudioDraft.kind uses 'photo' for the image studio.
      const k: ContentType = d.kind === 'photo' ? 'image' : (d.kind as ContentType);
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

  // Map ContentType ('image') -> hook's CreatorRowType ('photo')
  const bgFor = (id: ContentType): string | null => {
    const key: CreatorRowType = id === 'image' ? 'photo' : (id as CreatorRowType);
    return backgrounds[key] ?? null;
  };

  const openDraft = () => {
    if (!latestDraft) return;
    const slug = latestDraft.kind === 'photo' ? 'photo' : latestDraft.kind;
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
      <div className="px-5 pt-6 pb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight leading-tight">
          <span className="font-medium text-white">what will you </span>
          <span
            className="font-extrabold"
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
        <p className="text-base text-white/55 mt-2">Pick a format to begin</p>
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

        {/* Vertical creator rows */}
        <div className="flex flex-col gap-3">
          {contentTypes.map((type) => {
            const thumb = thumbFor(type.id);
            return (
              <CreatorRow
                key={type.id}
                icon={type.icon}
                title={type.title}
                description={type.description}
                accentColor={ACCENT[type.id]}
                activity={tileContext(type.id)}
                thumbnailUrl={thumb}
                onClick={() => onSelect(type.id)}
              />
            );
          })}
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

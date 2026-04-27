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

// Compact variant for stat-strip cells (e.g. "27m", "3h", "2d")
function relativeTimeShort(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.round(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  return `${d}d`;
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
        'flex-1 min-h-[110px] rounded-2xl overflow-hidden',
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
            style={{ filter: 'brightness(0.5) saturate(0.9)' }}
          />
          {/* Strong horizontal scrim — heaviest at left where text sits */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.75) 40%, rgba(0,0,0,0.35) 100%)',
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

      {/* Content layer — horizontal, vertically centered */}
      <div className="relative z-10 flex items-center gap-3 h-full px-4 py-3">
        {/* Icon chip */}
        <div className="w-10 h-10 rounded-xl bg-white/[0.10] backdrop-blur-md border border-white/10 flex items-center justify-center shrink-0">
          <Icon size={18} strokeWidth={2} style={{ color: accentColor }} aria-hidden />
        </div>

        {/* Content column */}
        <div className="flex-1 min-w-0">
          <div className="text-base font-semibold text-white leading-tight truncate">
            {title}
          </div>
          <div className="text-xs text-white/70 mt-0.5 leading-snug truncate">
            {description}
          </div>
        </div>

        {/* Chevron chip */}
        <div className="w-7 h-7 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/10 flex items-center justify-center shrink-0">
          <ChevronRight size={14} className="text-white/85" />
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

  const showPickup = !!latestDraft;
  const showPrompt = !!todayPrompt;
  const onlyOne = showPickup !== showPrompt; // exactly one renders → span full width

  return (
    <div className="h-dvh flex flex-col bg-background pb-[calc(env(safe-area-inset-bottom)+72px)] overflow-hidden">
      <div className="w-full max-w-[640px] mx-auto flex flex-col flex-1 min-h-0">
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

        {/* Page hero */}
        <div className="px-5 pt-4 pb-6 text-center shrink-0">
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
          <p className="text-sm text-white/55 mt-1.5">Pick a format to begin</p>
        </div>

        {/* Single 4-column stat strip — Continue / Prompt / Drafts / Scheduled */}
        <div className="mx-5 mt-4 mb-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-stretch overflow-hidden divide-x divide-white/[0.06] shrink-0">
          {showPickup && (
            <button
              onClick={openDraft}
              className="relative flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 hover:bg-white/[0.03] transition cursor-pointer"
            >
              <span
                className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
                style={{ background: 'hsl(var(--primary))' }}
                aria-hidden
              />
              <span className="text-base font-semibold text-white leading-none">
                {relativeTimeShort(latestDraft!.updatedAt)}
              </span>
              <span className="text-[10px] tracking-wider text-white/55 leading-none uppercase">
                Continue
              </span>
            </button>
          )}

          {showPrompt && (
            <button
              onClick={openPromptComposer}
              className="relative flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 hover:bg-white/[0.03] transition cursor-pointer"
              aria-label="Use today's prompt"
            >
              <Sparkles size={16} className="text-white" />
              <span className="text-[10px] tracking-wider text-white/55 leading-none uppercase">
                Prompt
              </span>
            </button>
          )}

          <button
            onClick={() => { setDrawerTab('drafts'); setDrawerOpen(true); }}
            className="relative flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 hover:bg-white/[0.03] transition cursor-pointer"
          >
            <span className="text-base font-semibold text-white leading-none">
              {draftCount}
            </span>
            <span className="text-[10px] tracking-wider text-white/55 leading-none uppercase">
              Drafts
            </span>
          </button>

          <button
            onClick={() => { setDrawerTab('scheduled'); setDrawerOpen(true); }}
            className="relative flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 hover:bg-white/[0.03] transition cursor-pointer"
          >
            {scheduledCount > 0 ? (
              <span className="text-base font-semibold text-white leading-none">
                {scheduledCount}
              </span>
            ) : (
              <Clock size={16} className="text-white" />
            )}
            <span className="text-[10px] tracking-wider text-white/55 leading-none uppercase">
              Scheduled
            </span>
          </button>
        </div>

        {/* Creator rows — flex-1 to fill remaining vertical space */}
        <div className="flex-1 min-h-0 flex flex-col gap-2 px-5 pb-2">
          {contentTypes.map((type) => (
            <CreatorRow
              key={type.id}
              icon={type.icon}
              title={type.title}
              description={type.description}
              accentColor={ACCENT[type.id]}
              activity={tileContext(type.id)}
              backgroundUrl={bgFor(type.id)}
              onClick={() => onSelect(type.id)}
            />
          ))}
        </div>
      </div>

      <UnifiedDraftsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} initialTab={drawerTab} />
    </div>
  );
}

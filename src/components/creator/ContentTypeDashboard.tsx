import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Video, Image as ImageIcon, FileText, FileEdit, Clock, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFeedData } from '@/contexts/FeedDataContext';
import { UnifiedDraftsDrawer } from './shared/UnifiedDraftsDrawer';

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

// SelfERA brand gradient — same stops used on the composer hero, avatar ring,
// and the "create POST." title.
const BRAND_GRADIENT = 'linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-mid)), hsl(var(--gradient-end)))';

function CreateTile({
  type,
  index,
  onClick,
}: {
  type: ContentTypeCard;
  index: number;
  onClick: () => void;
}) {
  const Icon = type.icon;
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.06, type: 'spring', stiffness: 280, damping: 24 }}
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl p-5 aspect-[4/5]',
        'bg-white/[0.03] hover:bg-white/[0.05] active:bg-white/[0.06]',
        'transition-colors text-left flex flex-col items-center justify-center',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/40'
      )}
      style={{
        // Gradient border via padded background trick
        backgroundImage: `linear-gradient(hsl(var(--background)), hsl(var(--background))), ${BRAND_GRADIENT}`,
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

      <span
        className="relative inline-flex items-center justify-center"
        style={{
          background: BRAND_GRADIENT,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        <Icon size={40} strokeWidth={1.75} className="text-white" style={{ color: 'currentColor' }} />
      </span>

      <span className="relative mt-4 text-lg font-semibold text-white tracking-tight">
        {type.title}
      </span>
      <span className="relative mt-1 text-xs text-white/55 text-center">
        {type.description}
      </span>
    </motion.button>
  );
}

export function ContentTypeDashboard({ onSelect, onClose }: ContentTypeDashboardProps) {
  const { drafts, scheduled } = useFeedData();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'drafts' | 'scheduled'>('drafts');
  const draftCount = drafts.length;
  const scheduledCount = scheduled.length;

  return (
    <div className="flex flex-col min-h-dvh bg-background pb-[calc(env(safe-area-inset-bottom)+72px)]">
      {/* Header */}
      <div className="flex items-center justify-between h-14 px-3 shrink-0">
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/5 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="w-9" aria-hidden />
      </div>

      {/* Brand hero */}
      <div className="px-5 pt-2 pb-8 text-center">
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

      {/* 2x2 tile grid */}
      <div className="grid grid-cols-2 gap-3 px-5">
        {contentTypes.map((type, i) => (
          <CreateTile key={type.id} type={type} index={i} onClick={() => onSelect(type.id)} />
        ))}
      </div>

      {/* Drafts / Scheduled pills */}
      <div className="flex gap-3 px-5 mt-6 border-t border-white/5 pt-6">
        <button
          onClick={() => { setDrawerTab('drafts'); setDrawerOpen(true); }}
          className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.15] text-sm text-white/85 transition"
        >
          <FileEdit className="h-4 w-4 text-white/70" />
          <span>Drafts</span>
          {draftCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-white/85">
              {draftCount}
            </span>
          )}
        </button>
        <button
          onClick={() => { setDrawerTab('scheduled'); setDrawerOpen(true); }}
          className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.15] text-sm text-white/85 transition"
        >
          <Clock className="h-4 w-4 text-white/70" />
          <span>Scheduled</span>
          {scheduledCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-white/85">
              {scheduledCount}
            </span>
          )}
        </button>
      </div>

      <UnifiedDraftsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} initialTab={drawerTab} />
    </div>
  );
}

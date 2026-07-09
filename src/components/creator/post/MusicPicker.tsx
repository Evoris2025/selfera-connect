import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Play, Pause, Music, Check } from 'lucide-react';
import { Sheet } from '@/components/ui/sheet';
import { BrandSheetContent, BrandSheetTitle } from '@/components/ui/sheet-system';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  duration: number; // seconds
  mood: 'Trending' | 'Upbeat' | 'Chill' | 'Workout' | 'Focus';
}

const FILTERS = ['Trending', 'Upbeat', 'Chill', 'Workout', 'Focus'] as const;

// Mock catalog — swap to real API later; keep shape identical.
const MOCK_TRACKS: MusicTrack[] = [
  { id: 'm1', title: 'Golden Hour', artist: 'JVKE', albumArt: 'https://picsum.photos/seed/gold/200', duration: 209, mood: 'Trending' },
  { id: 'm2', title: 'Sunflower', artist: 'Rex Orange County', albumArt: 'https://picsum.photos/seed/sun/200', duration: 165, mood: 'Chill' },
  { id: 'm3', title: 'Blinding Lights', artist: 'The Weeknd', albumArt: 'https://picsum.photos/seed/blind/200', duration: 200, mood: 'Upbeat' },
  { id: 'm4', title: 'As It Was', artist: 'Harry Styles', albumArt: 'https://picsum.photos/seed/asit/200', duration: 167, mood: 'Trending' },
  { id: 'm5', title: 'Levitating', artist: 'Dua Lipa', albumArt: 'https://picsum.photos/seed/lev/200', duration: 203, mood: 'Workout' },
  { id: 'm6', title: 'Weightless', artist: 'Marconi Union', albumArt: 'https://picsum.photos/seed/weight/200', duration: 480, mood: 'Focus' },
  { id: 'm7', title: 'Cornfield Chase', artist: 'Hans Zimmer', albumArt: 'https://picsum.photos/seed/corn/200', duration: 130, mood: 'Focus' },
  { id: 'm8', title: 'Sunset Lover', artist: 'Petit Biscuit', albumArt: 'https://picsum.photos/seed/sunset/200', duration: 234, mood: 'Chill' },
  { id: 'm9', title: 'Physical', artist: 'Dua Lipa', albumArt: 'https://picsum.photos/seed/phys/200', duration: 194, mood: 'Workout' },
  { id: 'm10', title: 'good 4 u', artist: 'Olivia Rodrigo', albumArt: 'https://picsum.photos/seed/g4u/200', duration: 178, mood: 'Upbeat' },
  { id: 'm11', title: 'Stay', artist: 'The Kid LAROI, Justin Bieber', albumArt: 'https://picsum.photos/seed/stay/200', duration: 141, mood: 'Trending' },
  { id: 'm12', title: 'Lo-Fi Rain', artist: 'Study Beats', albumArt: 'https://picsum.photos/seed/lofi/200', duration: 180, mood: 'Focus' },
];

const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

interface MusicPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (track: MusicTrack) => void;
  initialTrackId?: string | null;
}

export function MusicPicker({ open, onOpenChange, onSelect, initialTrackId }: MusicPickerProps) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>('Trending');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(initialTrackId ?? null);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) setSelectedId(initialTrackId ?? null);
    else {
      setPreviewId(null);
      if (previewTimer.current) clearTimeout(previewTimer.current);
    }
  }, [open, initialTrackId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_TRACKS.filter((t) => {
      const matchesFilter = t.mood === activeFilter;
      const matchesQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.mood.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [query, activeFilter]);

  const togglePreview = (id: string) => {
    if (navigator.vibrate) navigator.vibrate(8);
    if (previewTimer.current) clearTimeout(previewTimer.current);
    if (previewId === id) {
      setPreviewId(null);
      return;
    }
    setPreviewId(id);
    // Simulate 10s preview since we have no real audio.
    previewTimer.current = setTimeout(() => setPreviewId(null), 10000);
  };

  const handleUse = () => {
    const track = MOCK_TRACKS.find((t) => t.id === selectedId);
    if (!track) return;
    onSelect(track);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <BrandSheetContent maxHeight="88vh" className="pb-0">
        <BrandSheetTitle setup="add" emphasis="MUSIC" srDescription="Pick a soundtrack for your post" />

        {/* Search */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs, artists, moods..."
            className="pl-9 bg-white/[0.04] border-white/10 focus-visible:ring-white/20"
          />
        </div>

        {/* Filter chips */}
        <div className="mt-3 -mx-1 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 px-1 pb-1">
            {FILTERS.map((f) => {
              const active = activeFilter === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveFilter(f)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-body whitespace-nowrap transition-all border',
                    active
                      ? 'bg-white text-black border-white'
                      : 'bg-white/[0.04] text-white/80 border-white/10 hover:bg-white/[0.08]'
                  )}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        {/* Track list */}
        <div
          className={cn(
            'mt-3 max-h-[46vh] overflow-y-auto -mx-1 px-1',
            selectedId ? 'pb-24' : 'pb-4'
          )}
        >
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-white/40 text-body">No tracks found</div>
          ) : (
            <ul className="space-y-1">
              {filtered.map((track) => {
                const isSelected = selectedId === track.id;
                const isPlaying = previewId === track.id;
                return (
                  <li key={track.id}>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedId(track.id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-2 rounded-xl transition-colors text-left',
                        isSelected
                          ? 'bg-white/[0.08] ring-1 ring-white/40'
                          : 'hover:bg-white/[0.04]'
                      )}
                    >
                      {/* Album art + play button */}
                      <div className="relative shrink-0 w-12 h-12">
                        {isPlaying && (
                          <motion.span
                            aria-hidden
                            className="absolute inset-0 rounded-full ring-2 ring-white/70"
                            initial={{ opacity: 0.6, scale: 1 }}
                            animate={{ opacity: 0, scale: 1.35 }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                          />
                        )}
                        <img
                          src={track.albumArt}
                          alt=""
                          className="w-12 h-12 rounded-full object-cover"
                          loading="lazy"
                        />
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => { e.stopPropagation(); togglePreview(track.id); }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              e.stopPropagation();
                              togglePreview(track.id);
                            }
                          }}
                          aria-label={isPlaying ? `Pause preview of ${track.title}` : `Play preview of ${track.title}`}
                          className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
                          style={isPlaying ? { opacity: 1 } : undefined}
                        >
                          {isPlaying ? (
                            <EqualizerBars />
                          ) : (
                            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                          )}
                        </span>
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className="text-body font-semibold text-white truncate">{track.title}</p>
                        <p className="text-caption text-white/50 truncate">{track.artist}</p>
                      </div>

                      {/* Duration / selected mark */}
                      <div className="shrink-0 flex items-center gap-2">
                        <span className="text-caption text-white/40 tabular-nums">{fmt(track.duration)}</span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                            <Check className="w-3 h-3 text-black" strokeWidth={3} />
                          </span>
                        )}
                      </div>
                    </motion.button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Sticky CTA */}
        <AnimatePresence>
          {selectedId && (
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              className="sticky bottom-0 left-0 right-0 -mx-5 px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+16px)] bg-gradient-to-t from-background via-background/95 to-background/0"
            >
              <Button
                type="button"
                onClick={handleUse}
                className="w-full h-11 rounded-full bg-white text-black hover:bg-white/90 font-semibold"
              >
                <Music className="w-4 h-4 mr-2" />
                Use this sound
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </BrandSheetContent>
    </Sheet>
  );
}

function EqualizerBars() {
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-0.5 bg-white rounded-full"
          animate={{ height: ['30%', '100%', '50%', '80%', '30%'] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          style={{ height: '30%' }}
        />
      ))}
    </div>
  );
}

/**
 * Compact music badge/chip shown on the composer once a track is attached.
 */
export function MusicBadge({
  track,
  onRemove,
  onClick,
}: {
  track: MusicTrack;
  onRemove: () => void;
  onClick?: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-white/[0.06] border border-white/10 max-w-full">
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-2 min-w-0"
      >
        <img
          src={track.albumArt}
          alt=""
          className="w-6 h-6 rounded-full object-cover shrink-0"
        />
        <span className="text-caption text-white/85 truncate max-w-[180px]">
          <span className="font-semibold">{track.title}</span>
          <span className="text-white/50"> · {track.artist}</span>
        </span>
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove music"
        className="w-5 h-5 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

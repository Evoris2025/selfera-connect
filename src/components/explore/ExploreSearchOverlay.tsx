import { useEffect, useMemo, useState, useCallback } from 'react';
import { Hash, TrendingUp, ArrowUpRight, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BrandIcon } from '@/components/brand';
import { cn } from '@/lib/utils';
import {
  TRENDING_SEARCHES,
  SUGGESTED_CREATORS,
  DEFAULT_RECENT_SEARCHES,
  RECENT_SEARCHES_STORAGE_KEY,
  RECENT_SEARCHES_MAX,
} from './searchOverlayData';

/**
 * ExploreSearchOverlay — pre-search panel shown when the Explore search
 * input is focused. Replaces the rail + tabs + grid until dismissed.
 *
 * Three sections:
 *   1. Recent searches (persisted to localStorage; seeded with defaults)
 *   2. Trending searches (static mock)
 *   3. Suggested creators (static mock)
 *
 * Tapping a recent / trending row calls onSelect(term) so the parent can
 * push it into the search query (and later run a real search). Selecting
 * also adds the term to the recent list. Tapping a creator is a stub.
 */

interface ExploreSearchOverlayProps {
  query: string;
  onSelect: (term: string) => void;
}

function formatSearchCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M searches`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K searches`;
  return `${n} searches`;
}

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
    if (!raw) return DEFAULT_RECENT_SEARCHES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === 'string')) {
      return parsed;
    }
    return DEFAULT_RECENT_SEARCHES;
  } catch {
    return DEFAULT_RECENT_SEARCHES;
  }
}

function saveRecent(list: string[]) {
  try {
    localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 mb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-white/55">
      {children}
    </p>
  );
}

export function ExploreSearchOverlay({ query, onSelect }: ExploreSearchOverlayProps) {
  const [recent, setRecent] = useState<string[]>(() => loadRecent());

  useEffect(() => {
    setRecent(loadRecent());
  }, []);

  const addToRecent = useCallback((term: string) => {
    const clean = term.trim();
    if (!clean) return;
    setRecent((prev) => {
      const next = [clean, ...prev.filter((t) => t.toLowerCase() !== clean.toLowerCase())].slice(
        0,
        RECENT_SEARCHES_MAX,
      );
      saveRecent(next);
      return next;
    });
  }, []);

  const handleSelectTerm = useCallback(
    (term: string) => {
      addToRecent(term);
      onSelect(term);
    },
    [addToRecent, onSelect],
  );

  const handleRemoveRecent = useCallback((term: string) => {
    setRecent((prev) => {
      const next = prev.filter((t) => t !== term);
      saveRecent(next);
      return next;
    });
  }, []);

  const handleClearRecent = useCallback(() => {
    setRecent([]);
    saveRecent([]);
  }, []);

  // Lightweight filter when user is typing — narrows recent + trending.
  const q = query.trim().toLowerCase();
  const filteredRecent = useMemo(
    () => (q ? recent.filter((t) => t.toLowerCase().includes(q)) : recent),
    [recent, q],
  );
  const filteredTrending = useMemo(
    () => (q ? TRENDING_SEARCHES.filter((t) => t.term.toLowerCase().includes(q)) : TRENDING_SEARCHES),
    [q],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="flex-1 bg-background pt-4 pb-12 overflow-y-auto"
      role="region"
      aria-label="Search suggestions"
    >
      {/* Recent */}
      {filteredRecent.length > 0 && (
        <section className="mb-6">
          <div className="px-4 mb-2 flex items-center justify-between">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/55">
              Recent
            </p>
            {recent.length > 0 && !q && (
              <button
                type="button"
                onClick={handleClearRecent}
                className="text-[11px] font-medium text-white/55 hover:text-white/85 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
          <ul role="list">
            {filteredRecent.map((term) => (
              <li key={term}>
                <div className="flex items-center w-full pr-2">
                  <button
                    type="button"
                    onClick={() => handleSelectTerm(term)}
                    className={cn(
                      'flex-1 flex items-center gap-3 px-4 py-2.5 text-left',
                      'hover:bg-white/[0.04] transition-colors',
                    )}
                  >
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/[0.06]">
                      <BrandIcon icon={Hash} size={14} />
                    </span>
                    <span className="flex-1 text-[14px] text-white/90 truncate">{term}</span>
                    <ArrowUpRight className="w-4 h-4 text-white/40" strokeWidth={1.5} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveRecent(term)}
                    aria-label={`Remove ${term} from recent searches`}
                    className="ml-1 flex items-center justify-center w-7 h-7 rounded-full text-white/40 hover:text-white/85 hover:bg-white/[0.04] transition-colors"
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Trending */}
      {filteredTrending.length > 0 && (
        <section className="mb-6">
          <SectionLabel>Trending searches</SectionLabel>
          <ul role="list">
            {filteredTrending.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => handleSelectTerm(t.term)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-left',
                    'hover:bg-white/[0.04] transition-colors',
                  )}
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/[0.06]">
                    <BrandIcon icon={TrendingUp} size={14} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[14px] text-white/90 truncate">{t.term}</span>
                    <span className="block text-[11px] text-white/45">
                      {formatSearchCount(t.count)}
                    </span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-white/40" strokeWidth={1.5} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Suggested creators */}
      <section>
        <SectionLabel>Suggested creators</SectionLabel>
        <ul role="list">
          {SUGGESTED_CREATORS.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => {
                  // Stub for round-2: tapping a creator is a no-op besides
                  // logging. Wire to profile route later.
                  // eslint-disable-next-line no-console
                  console.log('[ExploreSearchOverlay] tap creator', c.handle);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-left',
                  'hover:bg-white/[0.04] transition-colors',
                )}
              >
                <Avatar className="w-9 h-9">
                  <AvatarImage src={c.avatar} alt="" />
                  <AvatarFallback>{c.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="flex-1 min-w-0">
                  <span className="block text-[14px] text-white/90 truncate">
                    {c.displayName}
                    <span className="text-white/45 font-normal"> · @{c.handle}</span>
                  </span>
                  <span className="block text-[11px] text-white/55 truncate">{c.reason}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </motion.div>
  );
}

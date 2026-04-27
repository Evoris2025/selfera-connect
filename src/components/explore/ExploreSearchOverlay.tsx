import { useEffect, useMemo, useState, useCallback } from 'react';
import { Hash, AtSign, Search, ArrowUpRight, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BrandSectionLabel } from '@/components/brand';
import { cn } from '@/lib/utils';
import { ExploreVerifiedTick } from './ExploreVerifiedTick';
import {
  TRENDING_SEARCHES,
  SUGGESTED_CREATORS,
  DEFAULT_RECENT_SEARCHES,
  RECENT_SEARCHES_STORAGE_KEY,
  RECENT_SEARCHES_MAX,
  type RecentSearch,
  type SuggestedCreator,
} from './searchOverlayData';

/**
 * ExploreSearchOverlay — pre-search panel shown when the Explore search
 * input is focused. Replaces the rail + tabs + grid until dismissed.
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

function loadRecent(): RecentSearch[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
    if (!raw) return DEFAULT_RECENT_SEARCHES;
    const parsed = JSON.parse(raw);
    // Migration: legacy plain string[] → reset to defaults.
    if (
      Array.isArray(parsed) &&
      parsed.every(
        (x) =>
          x &&
          typeof x === 'object' &&
          typeof x.id === 'string' &&
          typeof x.label === 'string' &&
          (x.type === 'query' || x.type === 'account' || x.type === 'tag'),
      )
    ) {
      return parsed as RecentSearch[];
    }
    return DEFAULT_RECENT_SEARCHES;
  } catch {
    return DEFAULT_RECENT_SEARCHES;
  }
}

function saveRecent(list: RecentSearch[]) {
  try {
    localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

function inferRecent(input: string): RecentSearch | null {
  const raw = input.trim();
  if (!raw) return null;
  if (raw.startsWith('@')) {
    const label = raw.slice(1).trim();
    if (!label) return null;
    return { id: `r-${Date.now()}`, type: 'account', label };
  }
  if (raw.startsWith('#')) {
    const label = raw.slice(1).trim();
    if (!label) return null;
    return { id: `r-${Date.now()}`, type: 'tag', label };
  }
  return { id: `r-${Date.now()}`, type: 'query', label: raw };
}

function recentDisplay(r: RecentSearch): string {
  if (r.type === 'account') return `@${r.label}`;
  if (r.type === 'tag') return `#${r.label}`;
  return r.label;
}

function FollowButton({ creatorId }: { creatorId: string }) {
  const [isFollowing, setIsFollowing] = useState(false);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setIsFollowing((v) => !v);
        // eslint-disable-next-line no-console
        console.log('[ExploreSearchOverlay] toggle follow', creatorId);
      }}
      className={cn(
        'w-full px-3 py-1.5 rounded-full text-[10px] font-medium uppercase tracking-[0.08em] transition-colors',
        isFollowing
          ? 'border border-white/20 text-white/60 bg-transparent'
          : 'border border-[hsl(var(--primary))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.08)]',
      )}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}

function SuggestedCreatorCard({
  c,
  onTap,
}: {
  c: SuggestedCreator;
  onTap: (handle: string) => void;
}) {
  return (
    <div className="flex-shrink-0 w-28 snap-start flex flex-col items-center">
      <button
        type="button"
        onClick={() => onTap(c.handle)}
        className="flex flex-col items-center gap-2 w-full"
        aria-label={`Open ${c.displayName} profile`}
      >
        <Avatar className="w-16 h-16">
          <AvatarImage src={c.avatarUrl} alt="" />
          <AvatarFallback>{c.displayName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-1 max-w-full">
          <span className="text-[12px] text-white/90 truncate">{c.displayName}</span>
          <ExploreVerifiedTick tier={c.tier} size="sm" />
        </div>
        <span className="text-[10px] text-white/45 truncate max-w-full">@{c.handle}</span>
      </button>
      <div className="mt-2 w-full">
        <FollowButton creatorId={c.id} />
      </div>
    </div>
  );
}

export function ExploreSearchOverlay({ query, onSelect }: ExploreSearchOverlayProps) {
  const [recent, setRecent] = useState<RecentSearch[]>(() => loadRecent());

  useEffect(() => {
    setRecent(loadRecent());
  }, []);

  const addToRecent = useCallback((term: string) => {
    const next = inferRecent(term);
    if (!next) return;
    setRecent((prev) => {
      const merged = [
        next,
        ...prev.filter(
          (t) => !(t.type === next.type && t.label.toLowerCase() === next.label.toLowerCase()),
        ),
      ].slice(0, RECENT_SEARCHES_MAX);
      saveRecent(merged);
      return merged;
    });
  }, []);

  const handleSelectTerm = useCallback(
    (term: string) => {
      addToRecent(term);
      onSelect(term);
    },
    [addToRecent, onSelect],
  );

  const handleSelectRecent = useCallback(
    (r: RecentSearch) => {
      handleSelectTerm(recentDisplay(r));
    },
    [handleSelectTerm],
  );

  const handleRemoveRecent = useCallback((id: string) => {
    setRecent((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveRecent(next);
      return next;
    });
  }, []);

  const handleClearRecent = useCallback(() => {
    setRecent([]);
    saveRecent([]);
  }, []);

  const q = query.trim().toLowerCase();
  const filteredRecent = useMemo(
    () => (q ? recent.filter((t) => t.label.toLowerCase().includes(q)) : recent),
    [recent, q],
  );
  const filteredTrending = useMemo(
    () =>
      q ? TRENDING_SEARCHES.filter((t) => t.term.toLowerCase().includes(q)) : TRENDING_SEARCHES,
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
            <BrandSectionLabel>RECENT</BrandSectionLabel>
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
            {filteredRecent.map((r) => (
              <li key={r.id}>
                <div className="flex items-center w-full pr-2">
                  <button
                    type="button"
                    onClick={() => handleSelectRecent(r)}
                    className={cn(
                      'flex-1 flex items-center gap-3 px-4 py-2.5 text-left',
                      'hover:bg-white/[0.04] transition-colors',
                    )}
                  >
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/[0.06]">
                      {r.type === 'query' && (
                        <Search className="w-3.5 h-3.5 text-white/60" strokeWidth={1.5} />
                      )}
                      {r.type === 'account' && (
                        <AtSign className="w-3.5 h-3.5 text-white/60" strokeWidth={1.5} />
                      )}
                      {r.type === 'tag' && (
                        <Hash className="w-3.5 h-3.5 text-white/60" strokeWidth={1.5} />
                      )}
                    </span>
                    <span className="flex-1 text-[14px] text-white/90 truncate">
                      {recentDisplay(r)}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-white/40" strokeWidth={1.5} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveRecent(r.id)}
                    aria-label={`Remove ${recentDisplay(r)} from recent searches`}
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
          <div className="px-4 mb-2">
            <BrandSectionLabel>TRENDING SEARCHES</BrandSectionLabel>
          </div>
          <ul role="list">
            {filteredTrending.map((t, idx) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => handleSelectTerm(t.term)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-left',
                    'hover:bg-white/[0.04] transition-colors',
                  )}
                >
                  <span className="w-5 text-white/40 text-xs font-medium tabular-nums">
                    {idx + 1}
                  </span>
                  <span className="flex-1 text-white text-sm truncate">{t.term}</span>
                  <span className="text-white/40 text-[10px]">{formatSearchCount(t.count)}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-white/30" strokeWidth={1.5} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Suggested creators — horizontal carousel */}
      <section>
        <div className="px-4 mb-3">
          <BrandSectionLabel>SUGGESTED CREATORS</BrandSectionLabel>
        </div>
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scrollbar-hide">
          {SUGGESTED_CREATORS.map((c) => (
            <SuggestedCreatorCard key={c.id} c={c} />
          ))}
        </div>
      </section>
    </motion.div>
  );
}

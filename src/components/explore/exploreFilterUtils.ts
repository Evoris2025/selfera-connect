/**
 * Shared filter predicates for Explore tab content.
 *
 * Used by both:
 *   - The per-tab grids (ExploreVideos, ExploreExpressions, ExploreImages, ExplorePosts)
 *   - The TrendingNowRail (so rail and grid respond to the same filter state)
 *
 * Predicates use duck-typed minimal shapes so grid items and rail items are
 * both accepted without coupling this utility to either type.
 *
 * Honest scope note: timePeriod and origin are no-ops here because no item
 * type currently carries a timestamp or origin field. Sort handled at
 * grid level via SORT_TO_DATA arrays — rail uses item.views/.likes ordering.
 */
import type {
  ExpressionsFilters,
  VideosFilters,
  ImagesFilters,
  PostsFilters,
  Duration,
  Format,
  CreatorTier,
  SortBy,
} from './ExploreFilters';

// Minimal duck shapes
type WithCreatorTier = { creator?: { tier: string | null }; user?: { tier: string | null } };
type WithDuration = { duration: string };
type WithViews = { views?: number };
type WithLikes = { likes?: number };

export function durationSeconds(d: string): number {
  const parts = d.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

function readTier(item: WithCreatorTier): string | null {
  return item.creator?.tier ?? item.user?.tier ?? null;
}

export function applyCreatorTier<T extends WithCreatorTier>(items: T[], tier: CreatorTier): T[] {
  if (tier === 'all') return items;
  return items.filter((it) => {
    const t = readTier(it);
    return t !== null && (tier as string[]).includes(t);
  });
}

export function applyDuration<T extends WithDuration>(items: T[], dur: Duration): T[] {
  if (dur === 'all') return items;
  return items.filter((v) => {
    const s = durationSeconds(v.duration);
    if (dur === 'under-5') return s < 5 * 60;
    if (dur === '5-20') return s >= 5 * 60 && s <= 20 * 60;
    if (dur === 'over-20') return s > 20 * 60;
    return true;
  });
}

/**
 * Format filter is a mock partition by index (no real format field exists yet).
 * Mirrors prior inline behaviour from ExploreImages.
 */
export function applyFormat<T>(items: T[], fmt: Format): T[] {
  if (fmt === 'all') return items;
  return items.filter((_, i) => (fmt === 'photos' ? i % 2 === 0 : i % 2 === 1));
}

/**
 * Sort fallback used by the rail (which has only one source array per tab).
 * Grids continue to use SORT_TO_DATA array swap; this utility lets the rail
 * mimic the visible effect.
 */
export function applySortRail<T extends WithViews & WithLikes>(items: T[], sortBy: SortBy): T[] {
  const copy = items.slice();
  if (sortBy === 'most-liked') {
    return copy.sort(
      (a, b) => (b.likes ?? b.views ?? 0) - (a.likes ?? a.views ?? 0),
    );
  }
  if (sortBy === 'trending') {
    // Rough proxy: views desc.
    return copy.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
  }
  // for-you, following, most-recent — keep seed order (no timestamp data).
  return copy;
}

// ----- Tab-level entry points used by the rail -----

export function applyExpressionsFilters<T extends WithCreatorTier & WithViews & WithLikes>(
  items: T[],
  f?: ExpressionsFilters,
): T[] {
  if (!f) return items;
  return applyCreatorTier(applySortRail(items, f.sortBy), f.creatorTier);
}

export function applyVideosFilters<T extends WithCreatorTier & WithDuration & WithViews & WithLikes>(
  items: T[],
  f?: VideosFilters,
): T[] {
  if (!f) return items;
  return applyCreatorTier(applyDuration(applySortRail(items, f.sortBy), f.duration), f.creatorTier);
}

export function applyImagesFilters<T extends WithViews & WithLikes>(
  items: T[],
  f?: ImagesFilters,
): T[] {
  if (!f) return items;
  return applyFormat(applySortRail(items, f.sortBy), f.format);
}

export function applyPostsFilters<T extends WithCreatorTier & WithViews & WithLikes>(
  items: T[],
  f?: PostsFilters,
): T[] {
  if (!f) return items;
  return applyCreatorTier(applySortRail(items, f.sortBy), f.creatorTier);
}

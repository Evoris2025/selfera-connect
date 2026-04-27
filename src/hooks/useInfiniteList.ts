import { useCallback, useEffect, useRef, useState } from 'react';

interface UseInfiniteListOptions<T> {
  /** Source array; results are cycled to simulate a long feed. */
  source: T[];
  /** Items per page. */
  pageSize?: number;
  /** Maximum number of items to ever render (safety cap). */
  maxItems?: number;
  /** Reset key — when it changes, the list resets back to page 1. */
  resetKey?: string;
}

interface UseInfiniteListResult<T> {
  items: Array<T & { __key: string }>;
  sentinelRef: (node: HTMLElement | null) => void;
  isLoadingMore: boolean;
  hasMore: boolean;
}

/**
 * Cycles through `source` to produce a virtually infinite list with stable per-item keys.
 * When the sentinel intersects, appends one more page.
 */
export function useInfiniteList<T extends { id: string | number }>({
  source,
  pageSize = 12,
  maxItems = 240,
  resetKey,
}: UseInfiniteListOptions<T>): UseInfiniteListResult<T> {
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Reset when chip / tab changes
  useEffect(() => {
    setPage(1);
    setIsLoadingMore(false);
  }, [resetKey]);

  const totalCount = Math.min(page * pageSize, maxItems);
  const hasMore = totalCount < maxItems && source.length > 0;

  const items: Array<T & { __key: string }> =
    source.length === 0
      ? []
      : Array.from({ length: totalCount }, (_, i) => {
          const base = source[i % source.length];
          return { ...base, __key: `${base.id}-${i}` };
        });

  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (!node || !hasMore) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting && !isLoadingMore) {
            setIsLoadingMore(true);
            // Small simulated delay so the spinner is visible.
            window.setTimeout(() => {
              setPage((p) => p + 1);
              setIsLoadingMore(false);
            }, 300);
          }
        },
        { rootMargin: '200px 0px' },
      );
      observerRef.current.observe(node);
    },
    [hasMore, isLoadingMore],
  );

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return { items, sentinelRef, isLoadingMore, hasMore };
}

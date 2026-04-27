import { useMemo, useState, useEffect } from 'react';
import { useFeedData } from '@/contexts/FeedDataContext';
import { useAuth } from '@/contexts/AuthContext';

export type CreatorRowType = 'expression' | 'video' | 'photo' | 'post';

/**
 * Returns one stable random thumbnail URL per creator type for the lifetime
 * of the screen mount. Picks happen ONCE per mount; re-renders do NOT shuffle.
 * Leaving and returning to the screen produces a fresh pick.
 *
 * Returns null for any type the user has no content of yet.
 */
export function useCreatorRowBackgrounds(): Record<CreatorRowType, string | null> {
  const { user } = useAuth();
  const { posts, expressions } = useFeedData();
  const uid = user?.id;

  // Build per-type candidate pools from the user's own content.
  // Mock/demo data may not be authored by the current user; fall back to all
  // available media so rows still feel personal during development.
  const pools = useMemo(() => {
    const ownPosts = uid ? posts.filter((p) => p.authorId === uid) : [];
    const ownExpr = uid ? expressions.filter((e) => e.userId === uid) : [];

    const sourcePosts = ownPosts.length > 0 ? ownPosts : posts;
    const sourceExpr = ownExpr.length > 0 ? ownExpr : expressions;

    const expressionPool = sourceExpr
      .map((e) => e.thumbnailUrl || e.mediaUrl)
      .filter((u): u is string => !!u);

    const videoPool = sourcePosts
      .filter((p) => p.media?.type === 'video')
      .map((p) => p.media?.thumbnail || p.media?.url)
      .filter((u): u is string => !!u);

    const photoPool = sourcePosts
      .filter((p) => p.media?.type === 'image')
      .map((p) => p.media?.url)
      .filter((u): u is string => !!u);

    // Post row pulls from any media attached to past posts; null = text-only.
    const postPool = sourcePosts
      .map((p) => p.media?.url || p.media?.thumbnail)
      .filter((u): u is string => !!u);

    return { expression: expressionPool, video: videoPool, photo: photoPool, post: postPool };
  }, [posts, expressions, uid]);

  // Pick once per mount. Stored in state so re-renders are stable.
  const [picks, setPicks] = useState<Record<CreatorRowType, string | null> | null>(null);

  useEffect(() => {
    // Only set once — first time pools are non-empty (or remain empty).
    if (picks !== null) return;
    const pick = (arr: string[]): string | null =>
      arr.length === 0 ? null : arr[Math.floor(Math.random() * arr.length)];
    setPicks({
      expression: pick(pools.expression),
      video: pick(pools.video),
      photo: pick(pools.photo),
      post: pick(pools.post),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pools]);

  return (
    picks ?? { expression: null, video: null, photo: null, post: null }
  );
}

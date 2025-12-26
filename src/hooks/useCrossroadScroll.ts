import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export type ContentType = 'image' | 'video' | 'text' | 'reel' | 'live';

interface Post {
  id: string;
  contentType: ContentType;
}

interface UseCrossroadScrollOptions {
  posts: Post[];
  threshold?: number;
  debounceMs?: number;
}

export function useCrossroadScroll({ 
  posts, 
  threshold = 0.4,
  debounceMs = 100,
}: UseCrossroadScrollOptions) {
  const [activePostId, setActivePostId] = useState<string | null>(posts[0]?.id ?? null);
  const postRefs = useRef<Map<string, HTMLElement>>(new Map());
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Register a post element
  const registerPost = useCallback((id: string, element: HTMLElement | null) => {
    if (element) {
      postRefs.current.set(id, element);
    } else {
      postRefs.current.delete(id);
    }
  }, []);

  // Determine which post is most central in viewport (debounced)
  const updateActivePost = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const viewportHeight = window.innerHeight;
      const viewportCenter = viewportHeight * threshold;

      let closestDistance = Infinity;
      let closestId: string | null = null;

      posts.forEach((post) => {
        const element = postRefs.current.get(post.id);
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const distance = Math.abs(elementCenter - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestId = post.id;
        }
      });

      if (closestId && closestId !== activePostId) {
        setActivePostId(closestId);
      }
    }, debounceMs);
  }, [posts, activePostId, threshold, debounceMs]);

  // Scroll listener with RAF throttle
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateActivePost();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [updateActivePost]);

  // Memoized map of contentType -> posts of that type
  const postsByType = useMemo(() => {
    const map = new Map<ContentType, Post[]>();
    posts.forEach((p) => {
      const arr = map.get(p.contentType) || [];
      arr.push(p);
      map.set(p.contentType, arr);
    });
    return map;
  }, [posts]);

  // Get posts filtered by type for horizontal lane (stable reference)
  const getSameTypePosts = useCallback((type: ContentType): Post[] => {
    return postsByType.get(type) || [];
  }, [postsByType]);

  // Get index within same-type lane
  const getLaneIndex = useCallback((postId: string, type: ContentType): number => {
    const lane = getSameTypePosts(type);
    return lane.findIndex(p => p.id === postId);
  }, [getSameTypePosts]);

  // Derive active post info
  const activePost = useMemo(() => posts.find(p => p.id === activePostId), [posts, activePostId]);
  const activeContentType = activePost?.contentType ?? 'image';

  return {
    activePostId,
    activeContentType,
    registerPost,
    getSameTypePosts,
    getLaneIndex,
  };
}

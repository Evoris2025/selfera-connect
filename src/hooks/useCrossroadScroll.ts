import { useState, useEffect, useRef, useCallback } from 'react';

export type ContentType = 'image' | 'video' | 'text' | 'reel' | 'live';

interface Post {
  id: string;
  contentType: ContentType;
}

interface UseCrossroadScrollOptions {
  posts: Post[];
  threshold?: number; // How close to center to be "active"
}

export function useCrossroadScroll({ posts, threshold = 0.4 }: UseCrossroadScrollOptions) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeContentType, setActiveContentType] = useState<ContentType>('image');
  const containerRef = useRef<HTMLDivElement>(null);
  const postRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Register a post element
  const registerPost = useCallback((id: string, element: HTMLElement | null) => {
    if (element) {
      postRefs.current.set(id, element);
    } else {
      postRefs.current.delete(id);
    }
  }, []);

  // Determine which post is most central in viewport
  const updateActivePost = useCallback(() => {
    const viewportHeight = window.innerHeight;
    const viewportCenter = viewportHeight * threshold;

    let closestDistance = Infinity;
    let closestIndex = 0;

    posts.forEach((post, index) => {
      const element = postRefs.current.get(post.id);
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const distance = Math.abs(elementCenter - viewportCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
      setActiveContentType(posts[closestIndex]?.contentType || 'image');
    }
  }, [posts, activeIndex, threshold]);

  // Scroll listener with throttle
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
    return () => window.removeEventListener('scroll', handleScroll);
  }, [updateActivePost]);

  // Get posts filtered by type for horizontal lane
  const getSameTypePosts = useCallback((type: ContentType) => {
    return posts.filter(p => p.contentType === type);
  }, [posts]);

  // Get index within same-type lane
  const getLaneIndex = useCallback((postId: string, type: ContentType) => {
    const lane = getSameTypePosts(type);
    return lane.findIndex(p => p.id === postId);
  }, [getSameTypePosts]);

  return {
    activeIndex,
    activeContentType,
    containerRef,
    registerPost,
    getSameTypePosts,
    getLaneIndex,
  };
}

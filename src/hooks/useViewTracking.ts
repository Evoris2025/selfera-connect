/**
 * View Tracking Hook
 * 
 * Provides intersection observer-based view tracking for feed posts
 */

import { useCallback, useRef, useEffect } from 'react';
import { usePostViews } from './usePostViews';

interface ViewTrackingOptions {
  threshold?: number;
  rootMargin?: string;
  minVisibleTime?: number;
}

export function useViewTracking(options: ViewTrackingOptions = {}) {
  const { trackView, trackViewWithDuration } = usePostViews();
  const {
    threshold = 0.5,
    rootMargin = '0px',
    minVisibleTime = 1000, // Minimum 1 second visible to count as a view
  } = options;

  const viewTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const viewStartTimes = useRef<Map<string, number>>(new Map());
  const trackedPosts = useRef<Set<string>>(new Set());

  const observerRef = useRef<IntersectionObserver | null>(null);

  // Create intersection observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const postId = entry.target.getAttribute('data-post-id');
          if (!postId) return;

          if (entry.isIntersecting) {
            // Post is visible - start tracking
            if (!viewTimers.current.has(postId)) {
              viewStartTimes.current.set(postId, Date.now());
              
              // Set timer to track view after minimum visible time
              const timer = setTimeout(() => {
                if (!trackedPosts.current.has(postId)) {
                  trackedPosts.current.add(postId);
                  trackView(postId);
                }
              }, minVisibleTime);

              viewTimers.current.set(postId, timer);
            }
          } else {
            // Post is no longer visible - clear timer
            const timer = viewTimers.current.get(postId);
            if (timer) {
              clearTimeout(timer);
              viewTimers.current.delete(postId);
            }

            // Calculate view duration if we tracked a view
            const startTime = viewStartTimes.current.get(postId);
            if (startTime && trackedPosts.current.has(postId)) {
              const duration = Math.round((Date.now() - startTime) / 1000);
              if (duration > 1) {
                trackViewWithDuration(postId, duration);
              }
            }
            viewStartTimes.current.delete(postId);
          }
        });
      },
      { threshold, rootMargin }
    );

    return () => {
      observerRef.current?.disconnect();
      viewTimers.current.forEach((timer) => clearTimeout(timer));
      viewTimers.current.clear();
    };
  }, [threshold, rootMargin, minVisibleTime, trackView, trackViewWithDuration]);

  // Callback to observe a post element
  const observePost = useCallback((element: HTMLElement | null) => {
    if (element && observerRef.current) {
      observerRef.current.observe(element);
    }
  }, []);

  // Callback to unobserve a post element
  const unobservePost = useCallback((element: HTMLElement | null) => {
    if (element && observerRef.current) {
      observerRef.current.unobserve(element);
    }
  }, []);

  // Get ref callback for a post
  const getPostRef = useCallback(
    (postId: string) => {
      return (element: HTMLElement | null) => {
        if (element) {
          element.setAttribute('data-post-id', postId);
          observePost(element);
        }
      };
    },
    [observePost]
  );

  return {
    observePost,
    unobservePost,
    getPostRef,
  };
}

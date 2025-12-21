import { useCallback, useEffect, useState } from 'react';

// Detect reduced motion preference
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// Type-safe easing values
type EasingArray = [number, number, number, number];

const easeOutCubic: EasingArray = [0.215, 0.61, 0.355, 1];
const easeOutQuad: EasingArray = [0.25, 0.46, 0.45, 0.94];

// Instagram-style animation presets
export const instagramAnimations = {
  // Like animation: deep squish → dramatic overshoot → bouncy settle
  like: {
    scale: [1, 0.75, 1.3, 0.95, 1.08, 1],
    transition: {
      duration: 0.45,
      times: [0, 0.12, 0.32, 0.52, 0.75, 1],
      ease: easeOutCubic,
    },
  },
  
  // Unlike animation: subtle compression → settle (no burst)
  unlike: {
    scale: [1, 0.92, 1],
    transition: {
      duration: 0.15,
      ease: easeOutQuad,
    },
  },
  
  // Generic tap feedback: compression → spring back
  tap: {
    scale: [1, 0.85, 1.05, 1],
    transition: {
      duration: 0.2,
      type: 'spring' as const,
      stiffness: 600,
      damping: 15,
    },
  },
  
  // Share button: includes subtle tilt
  shareTap: {
    scale: [1, 0.88, 1.05, 1],
    rotate: [0, 12, -3, 0],
    transition: {
      duration: 0.25,
      ease: easeOutQuad,
    },
  },
  
  // Bookmark save: compression + subtle drop effect
  bookmarkSave: {
    scale: [1, 0.88, 1.12, 1],
    y: [0, 2, -1, 0],
    transition: {
      duration: 0.3,
      ease: easeOutQuad,
    },
  },
  
  // Bookmark unsave: subtle compression
  bookmarkUnsave: {
    scale: [1, 0.92, 1],
    transition: {
      duration: 0.15,
      ease: easeOutQuad,
    },
  },
  
  // Count bump animation
  countBump: {
    scale: [1, 1.15, 1],
    transition: {
      duration: 0.2,
      ease: easeOutQuad,
    },
  },
  
  // Reduced motion alternatives
  reduced: {
    scale: [1, 0.98, 1],
    transition: {
      duration: 0.1,
      ease: easeOutQuad,
    },
  },
};

// Debounce hook for rapid tapping
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      const newTimeoutId = setTimeout(() => {
        callback(...args);
      }, delay);
      setTimeoutId(newTimeoutId);
    },
    [callback, delay, timeoutId]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return debouncedCallback;
}

// Haptic feedback helper
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'light') {
  if (navigator.vibrate) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 30,
    };
    navigator.vibrate(patterns[type]);
  }
}

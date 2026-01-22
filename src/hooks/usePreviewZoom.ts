import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'selfera-preview-zoom';
const DEFAULT_ZOOM = 1;

/**
 * Hook to manage desktop preview zoom.
 * Only applies on devices with fine pointer (mouse/trackpad).
 */
export function usePreviewZoom() {
  const [zoom, setZoomState] = useState(DEFAULT_ZOOM);
  const [isDesktop, setIsDesktop] = useState(false);

  // Check if we're on a desktop-like device
  useEffect(() => {
    const checkPointer = () => {
      const isFinePointer = window.matchMedia('(pointer: fine)').matches;
      setIsDesktop(isFinePointer);
    };
    
    checkPointer();
    
    // Listen for changes (e.g., if user connects/disconnects mouse)
    const mediaQuery = window.matchMedia('(pointer: fine)');
    mediaQuery.addEventListener('change', checkPointer);
    
    return () => mediaQuery.removeEventListener('change', checkPointer);
  }, []);

  // Load saved zoom from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0.5 && parsed <= 1) {
        setZoomState(parsed);
      }
    }
  }, []);

  // Apply zoom to CSS variable and toggle class
  useEffect(() => {
    if (isDesktop) {
      document.documentElement.style.setProperty('--preview-zoom', zoom.toString());
      document.documentElement.classList.add('preview-zoom-enabled');
    } else {
      document.documentElement.style.setProperty('--preview-zoom', '1');
      document.documentElement.classList.remove('preview-zoom-enabled');
    }
  }, [zoom, isDesktop]);

  const setZoom = useCallback((newZoom: number) => {
    const clamped = Math.max(0.5, Math.min(1, newZoom));
    setZoomState(clamped);
    localStorage.setItem(STORAGE_KEY, clamped.toString());
  }, []);

  const resetZoom = useCallback(() => {
    setZoomState(DEFAULT_ZOOM);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    zoom,
    setZoom,
    resetZoom,
    isDesktop,
  };
}

import { useState, useEffect, useCallback, useMemo } from 'react';

// Per-mode storage keys - zoom is PERMANENT for each mode
const ZOOM_KEY_MOBILE = 'selfera-preview-zoom-mobile';
const ZOOM_KEY_TABLET = 'selfera-preview-zoom-tablet';
const ZOOM_KEY_DESKTOP = 'selfera-preview-zoom-desktop';

// Fixed default zooms - these are the values we decided on
const DEFAULT_ZOOMS = {
  mobile: 0.72,   // 72% for mobile preview (~430px)
  tablet: 0.95,   // 95% for tablet preview (~768px)
  desktop: 1.0,   // 100% for desktop preview (1024px+)
};

type PreviewMode = 'mobile' | 'tablet' | 'desktop';

function getPreviewMode(width: number): PreviewMode {
  if (width < 500) return 'mobile';
  if (width < 900) return 'tablet';
  return 'desktop';
}

function getStorageKey(mode: PreviewMode): string {
  switch (mode) {
    case 'mobile': return ZOOM_KEY_MOBILE;
    case 'tablet': return ZOOM_KEY_TABLET;
    case 'desktop': return ZOOM_KEY_DESKTOP;
  }
}

function loadZoomForMode(mode: PreviewMode): number {
  if (typeof window === 'undefined') return DEFAULT_ZOOMS[mode];
  
  const key = getStorageKey(mode);
  const saved = localStorage.getItem(key);
  
  if (saved) {
    const parsed = parseFloat(saved);
    if (!isNaN(parsed) && parsed >= 0.3 && parsed <= 1) {
      return parsed;
    }
  }
  
  // Return the permanent default for this mode
  return DEFAULT_ZOOMS[mode];
}

function saveZoomForMode(mode: PreviewMode, zoom: number): void {
  const key = getStorageKey(mode);
  localStorage.setItem(key, zoom.toString());
}

/**
 * Hook to manage desktop preview zoom with PERMANENT per-mode settings.
 * Each mode (mobile/tablet/desktop) has its own saved zoom value.
 * Values persist across browser refreshes and never auto-recalculate.
 */
export function usePreviewZoom() {
  // All hooks must be called unconditionally at the top
  const [isDesktop, setIsDesktop] = useState(false);
  const [previewWidth, setPreviewWidth] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth : 430
  );
  const [zoom, setZoomState] = useState(1); // Start with default, will be set in useEffect

  // Derive current mode from preview width
  const currentMode = useMemo(() => getPreviewMode(previewWidth), [previewWidth]);

  // Check if we're on a desktop-like device (fine pointer = mouse/trackpad)
  useEffect(() => {
    const checkPointer = () => {
      const isFinePointer = window.matchMedia('(pointer: fine)').matches;
      setIsDesktop(isFinePointer);
    };
    
    checkPointer();
    
    const mediaQuery = window.matchMedia('(pointer: fine)');
    mediaQuery.addEventListener('change', checkPointer);
    
    return () => mediaQuery.removeEventListener('change', checkPointer);
  }, []);

  // Load saved zoom on mount and when mode changes
  useEffect(() => {
    const savedZoom = loadZoomForMode(currentMode);
    setZoomState(savedZoom);
  }, [currentMode]);

  // Track preview container width changes (for detecting Lovable preview mode switches)
  useEffect(() => {
    if (!isDesktop) return;

    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setPreviewWidth(window.innerWidth);
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [isDesktop]);

  // Apply zoom to CSS variable
  useEffect(() => {
    if (isDesktop) {
      document.documentElement.style.setProperty('--preview-zoom', zoom.toString());
      document.documentElement.classList.add('preview-zoom-enabled');
    } else {
      document.documentElement.style.setProperty('--preview-zoom', '1');
      document.documentElement.classList.remove('preview-zoom-enabled');
    }
  }, [zoom, isDesktop]);

  // Set zoom and save permanently for current mode
  const setZoom = useCallback((newZoom: number) => {
    const clamped = Math.max(0.3, Math.min(1, newZoom));
    setZoomState(clamped);
    saveZoomForMode(currentMode, clamped);
  }, [currentMode]);

  // Reset current mode to its default
  const resetZoom = useCallback(() => {
    const defaultZoom = DEFAULT_ZOOMS[currentMode];
    setZoomState(defaultZoom);
    saveZoomForMode(currentMode, defaultZoom);
  }, [currentMode]);

  return {
    zoom,
    setZoom,
    resetZoom,
    isDesktop,
    currentMode,
    previewWidth,
  };
}

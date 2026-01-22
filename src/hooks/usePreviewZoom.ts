import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'selfera-preview-zoom';
const AUTO_DETECTED_KEY = 'selfera-preview-zoom-auto';
const DEFAULT_ZOOM = 1;

// Reference width that gave us the perfect 76% zoom for mobile preview
const MOBILE_REFERENCE_WIDTH = 390;

interface PhoneMetrics {
  viewport_width: number;
  device_pixel_ratio: number;
}

/**
 * Calculate zoom based on preview container width and phone metrics.
 * Mobile uses phone-calibrated ratio, tablet/desktop use full or near-full zoom.
 */
function calculateZoomForViewport(previewWidth: number, phoneViewport: number): number {
  // Mobile preview mode (~430px) - use our perfected ratio from phone calibration
  if (previewWidth < 500) {
    return MOBILE_REFERENCE_WIDTH / phoneViewport;
  }
  
  // Tablet preview mode (~768px) - nearly full size
  if (previewWidth < 900) {
    return 0.95;
  }
  
  // Desktop preview mode (~1024px+) - full size, no zoom needed
  return 1.0;
}

/**
 * Hook to manage desktop preview zoom.
 * Automatically fetches phone metrics and calculates recommended zoom.
 * Adapts to different preview modes (mobile/tablet/desktop).
 * Only applies on devices with fine pointer (mouse/trackpad).
 */
export function usePreviewZoom() {
  const { user } = useAuth();
  const [zoom, setZoomState] = useState(DEFAULT_ZOOM);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isAutoDetected, setIsAutoDetected] = useState(false);
  const [phoneMetrics, setPhoneMetrics] = useState<PhoneMetrics | null>(null);
  const [previewWidth, setPreviewWidth] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth : 430
  );

  // Check if we're on a desktop-like device
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

  // Track preview container width changes (for detecting Lovable preview mode switches)
  useEffect(() => {
    if (!isDesktop) return;

    const handleResize = () => {
      setPreviewWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isDesktop]);

  // Recalculate zoom when preview width changes (and we have phone metrics)
  useEffect(() => {
    if (!isDesktop || !phoneMetrics) return;

    // Check if user has manually overridden
    const manualZoom = localStorage.getItem(STORAGE_KEY);
    const wasAutoDetected = localStorage.getItem(AUTO_DETECTED_KEY);
    
    if (manualZoom && !wasAutoDetected) {
      // User has a manual setting, respect it
      return;
    }

    const recommendedZoom = calculateZoomForViewport(previewWidth, phoneMetrics.viewport_width);
    const clampedZoom = Math.max(0.3, Math.min(1, recommendedZoom));
    
    setZoomState(clampedZoom);
    setIsAutoDetected(true);
    
    console.log('Auto-calculated zoom for viewport:', {
      previewWidth,
      phoneWidth: phoneMetrics.viewport_width,
      recommendedZoom: Math.round(clampedZoom * 100) + '%',
      mode: previewWidth < 500 ? 'mobile' : previewWidth < 900 ? 'tablet' : 'desktop'
    });
  }, [isDesktop, phoneMetrics, previewWidth]);

  // Fetch phone metrics on desktop
  useEffect(() => {
    if (!isDesktop || !user) return;

    const fetchPhoneMetrics = async () => {
      try {
        const { data, error } = await supabase
          .from('user_device_metrics')
          .select('viewport_width, device_pixel_ratio')
          .eq('user_id', user.id)
          .single();

        if (error || !data) {
          // No phone metrics yet, fall back to saved or default
          loadSavedZoom();
          return;
        }

        setPhoneMetrics(data);

        // Check if user has manually overridden
        const manualZoom = localStorage.getItem(STORAGE_KEY);
        const wasAutoDetected = localStorage.getItem(AUTO_DETECTED_KEY);
        
        if (manualZoom && !wasAutoDetected) {
          // User has a manual setting, respect it
          const parsed = parseFloat(manualZoom);
          if (!isNaN(parsed) && parsed >= 0.3 && parsed <= 1) {
            setZoomState(parsed);
            return;
          }
        }

        // Calculate initial zoom based on current preview width
        const recommendedZoom = calculateZoomForViewport(previewWidth, data.viewport_width);
        const clampedZoom = Math.max(0.3, Math.min(1, recommendedZoom));
        
        setZoomState(clampedZoom);
        setIsAutoDetected(true);
        localStorage.setItem(AUTO_DETECTED_KEY, 'true');
        
        console.log('Initial auto-calculated zoom:', {
          phoneWidth: data.viewport_width,
          phoneDPR: data.device_pixel_ratio,
          previewWidth,
          recommendedZoom: Math.round(clampedZoom * 100) + '%',
          mode: previewWidth < 500 ? 'mobile' : previewWidth < 900 ? 'tablet' : 'desktop'
        });
      } catch (err) {
        console.error('Failed to fetch phone metrics:', err);
        loadSavedZoom();
      }
    };

    const loadSavedZoom = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 0.3 && parsed <= 1) {
          setZoomState(parsed);
        }
      }
    };

    fetchPhoneMetrics();
  }, [isDesktop, user, previewWidth]);

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
    const clamped = Math.max(0.3, Math.min(1, newZoom));
    setZoomState(clamped);
    setIsAutoDetected(false);
    localStorage.setItem(STORAGE_KEY, clamped.toString());
    localStorage.removeItem(AUTO_DETECTED_KEY);
  }, []);

  const resetZoom = useCallback(() => {
    setZoomState(DEFAULT_ZOOM);
    setIsAutoDetected(false);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(AUTO_DETECTED_KEY);
  }, []);

  const recalculateFromPhone = useCallback(async () => {
    if (!user || !isDesktop) return;
    
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(AUTO_DETECTED_KEY);
    
    // Trigger refetch
    const { data } = await supabase
      .from('user_device_metrics')
      .select('viewport_width, device_pixel_ratio')
      .eq('user_id', user.id)
      .single();
    
    if (data) {
      const recommendedZoom = calculateZoomForViewport(previewWidth, data.viewport_width);
      const clampedZoom = Math.max(0.3, Math.min(1, recommendedZoom));
      
      setZoomState(clampedZoom);
      setIsAutoDetected(true);
      setPhoneMetrics(data);
      localStorage.setItem(AUTO_DETECTED_KEY, 'true');
    }
  }, [user, isDesktop, previewWidth]);

  return {
    zoom,
    setZoom,
    resetZoom,
    recalculateFromPhone,
    isDesktop,
    isAutoDetected,
    phoneMetrics,
    previewWidth,
  };
}

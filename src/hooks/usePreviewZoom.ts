import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'selfera-preview-zoom';
const AUTO_DETECTED_KEY = 'selfera-preview-zoom-auto';
const DEFAULT_ZOOM = 1;

interface PhoneMetrics {
  viewport_width: number;
  device_pixel_ratio: number;
}

/**
 * Hook to manage desktop preview zoom.
 * Automatically fetches phone metrics and calculates recommended zoom.
 * Only applies on devices with fine pointer (mouse/trackpad).
 */
export function usePreviewZoom() {
  const { user } = useAuth();
  const [zoom, setZoomState] = useState(DEFAULT_ZOOM);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isAutoDetected, setIsAutoDetected] = useState(false);
  const [phoneMetrics, setPhoneMetrics] = useState<PhoneMetrics | null>(null);

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

  // Fetch phone metrics and auto-calculate zoom on desktop
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
          if (!isNaN(parsed) && parsed >= 0.5 && parsed <= 1) {
            setZoomState(parsed);
            return;
          }
        }

        // Calculate recommended zoom based on physical size matching
        const desktopWidth = window.innerWidth;
        const desktopDPR = window.devicePixelRatio;
        
        const phonePhysicalWidth = data.viewport_width / data.device_pixel_ratio;
        const desktopPhysicalWidth = desktopWidth / desktopDPR;
        
        // Calculate zoom to match phone's physical size
        let recommendedZoom = phonePhysicalWidth / desktopPhysicalWidth;
        
        // Clamp to reasonable range
        recommendedZoom = Math.max(0.5, Math.min(1, recommendedZoom));
        
        setZoomState(recommendedZoom);
        setIsAutoDetected(true);
        localStorage.setItem(AUTO_DETECTED_KEY, 'true');
        
        console.log('Auto-calculated zoom:', {
          phoneWidth: data.viewport_width,
          phoneDPR: data.device_pixel_ratio,
          desktopWidth,
          desktopDPR,
          recommendedZoom: Math.round(recommendedZoom * 100) + '%'
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
        if (!isNaN(parsed) && parsed >= 0.5 && parsed <= 1) {
          setZoomState(parsed);
        }
      }
    };

    fetchPhoneMetrics();
  }, [isDesktop, user]);

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
      const desktopWidth = window.innerWidth;
      const desktopDPR = window.devicePixelRatio;
      const phonePhysicalWidth = data.viewport_width / data.device_pixel_ratio;
      const desktopPhysicalWidth = desktopWidth / desktopDPR;
      let recommendedZoom = phonePhysicalWidth / desktopPhysicalWidth;
      recommendedZoom = Math.max(0.5, Math.min(1, recommendedZoom));
      
      setZoomState(recommendedZoom);
      setIsAutoDetected(true);
      setPhoneMetrics(data);
      localStorage.setItem(AUTO_DETECTED_KEY, 'true');
    }
  }, [user, isDesktop]);

  return {
    zoom,
    setZoom,
    resetZoom,
    recalculateFromPhone,
    isDesktop,
    isAutoDetected,
    phoneMetrics,
  };
}

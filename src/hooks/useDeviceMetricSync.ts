import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Silently captures and saves device viewport metrics when on a mobile device.
 * This enables auto-calculation of desktop preview zoom to match phone display.
 */
export function useDeviceMetricSync() {
  const { user } = useAuth();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!user || hasSynced.current) return;

    const syncMetrics = async () => {
      // Only sync on mobile/touch devices
      const isTouch = window.matchMedia('(pointer: coarse)').matches;
      if (!isTouch) return;

      const metrics = {
        user_id: user.id,
        device_type: 'phone',
        viewport_width: window.innerWidth,
        device_pixel_ratio: window.devicePixelRatio,
        pointer_type: 'coarse',
        updated_at: new Date().toISOString(),
      };

      try {
        // Upsert metrics (insert or update)
        const { error } = await supabase
          .from('user_device_metrics')
          .upsert(metrics, { onConflict: 'user_id' });

        if (error) {
          console.error('Failed to sync device metrics:', error);
        } else {
          hasSynced.current = true;
          console.log('Device metrics synced:', metrics);
        }
      } catch (err) {
        console.error('Device metric sync error:', err);
      }
    };

    // Small delay to ensure viewport is stable
    const timer = setTimeout(syncMetrics, 500);
    return () => clearTimeout(timer);
  }, [user]);
}

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type GridLayoutStyle = 'uniform' | 'mosaic4' | 'mosaic5' | 'mosaic6' | 'mosaic7' | 'mosaic8';

const VALID_GRID_LAYOUT_STYLES: GridLayoutStyle[] = [
  'uniform',
  'mosaic4',
  'mosaic5',
  'mosaic6',
  'mosaic7',
  'mosaic8',
];

interface UseGridLayoutResult {
  layoutStyle: GridLayoutStyle;
  loading: boolean;
  saving: boolean;
  setLayoutStyle: (style: GridLayoutStyle) => Promise<boolean>;
}

export function useGridLayout(profileUserId?: string): UseGridLayoutResult {
  const { user } = useAuth();
  const [layoutStyle, setLayoutStyleState] = useState<GridLayoutStyle>('uniform');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch layout preference for the profile being viewed
  useEffect(() => {
    async function fetchLayout() {
      if (!profileUserId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_grid_layout_preference')
          .select('layout_style')
          .eq('user_id', profileUserId)
          .maybeSingle();

        if (error) throw error;
        
        const style = data?.layout_style;
        if (style && VALID_GRID_LAYOUT_STYLES.includes(style as GridLayoutStyle)) {
          setLayoutStyleState(style as GridLayoutStyle);
        } else if (style) {
          console.warn('Unknown grid layout style from backend:', style);
        }
      } catch (err) {
        console.error('Error fetching grid layout:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLayout();
  }, [profileUserId]);

  const setLayoutStyle = useCallback(async (style: GridLayoutStyle): Promise<boolean> => {
    if (!user) return false;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_grid_layout_preference')
        .upsert({
          user_id: user.id,
          layout_style: style,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;
      
      setLayoutStyleState(style);
      return true;
    } catch (err) {
      console.error('Error saving grid layout:', err);
      return false;
    } finally {
      setSaving(false);
    }
  }, [user]);

  return {
    layoutStyle,
    loading,
    saving,
    setLayoutStyle,
  };
}

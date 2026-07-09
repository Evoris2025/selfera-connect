import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ProfileTab {
  id: string;
  icon: string;
  label: string;
}

const DEFAULT_TABS: ProfileTab[] = [
  { id: 'unified', icon: 'Unified', label: 'Unified' },
  { id: 'video', icon: 'Video', label: 'Video' },
  { id: 'images', icon: 'Images', label: 'Images' },
  { id: 'posts', icon: 'Posts', label: 'Posts' },
  { id: 'community', icon: 'Community', label: 'Community' },
  { id: 'saved', icon: 'Saved', label: 'Saved' },
];

export function useProfileTabOrder() {
  const { user } = useAuth();
  const [orderedTabs, setOrderedTabs] = useState<ProfileTab[]>(DEFAULT_TABS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalOrder, setOriginalOrder] = useState<ProfileTab[]>(DEFAULT_TABS);

  // Fetch custom order on mount
  useEffect(() => {
    async function fetchTabOrder() {
      if (!user) {
        setOrderedTabs(DEFAULT_TABS);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_profile_tab_order')
          .select('ordered_tab_ids')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching tab order:', error);
          setOrderedTabs(DEFAULT_TABS);
        } else if (data?.ordered_tab_ids) {
          // Reorder tabs based on saved order
          const reordered = data.ordered_tab_ids
            .map((id: string) => DEFAULT_TABS.find(tab => tab.id === id))
            .filter(Boolean) as ProfileTab[];
          
          // Add any new tabs that weren't in the saved order
          const missingTabs = DEFAULT_TABS.filter(
            tab => !data.ordered_tab_ids.includes(tab.id)
          );
          
          setOrderedTabs([...reordered, ...missingTabs]);
        } else {
          setOrderedTabs(DEFAULT_TABS);
        }
      } catch (err) {
        console.error('Error fetching tab order:', err);
        setOrderedTabs(DEFAULT_TABS);
      }
      
      setLoading(false);
    }

    fetchTabOrder();
  }, [user]);

  const reorderTabs = useCallback((fromIndex: number, toIndex: number) => {
    setOrderedTabs(prev => {
      const newOrder = [...prev];
      const [moved] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, moved);
      return newOrder;
    });
  }, []);

  const saveOrder = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    
    setSaving(true);
    const orderedIds = orderedTabs.map(tab => tab.id);

    try {
      const { error } = await supabase
        .from('user_profile_tab_order')
        .upsert(
          { user_id: user.id, ordered_tab_ids: orderedIds },
          { onConflict: 'user_id' }
        );

      if (error) {
        console.error('Error saving tab order:', error);
        setSaving(false);
        return false;
      }

      setOriginalOrder(orderedTabs);
      setSaving(false);
      return true;
    } catch (err) {
      console.error('Error saving tab order:', err);
      setSaving(false);
      return false;
    }
  }, [user, orderedTabs]);

  const storeOriginalOrder = useCallback(() => {
    setOriginalOrder([...orderedTabs]);
  }, [orderedTabs]);

  const restoreOriginalOrder = useCallback(() => {
    setOrderedTabs(originalOrder);
  }, [originalOrder]);

  return {
    orderedTabs,
    loading,
    saving,
    reorderTabs,
    saveOrder,
    storeOriginalOrder,
    restoreOriginalOrder,
    hasCustomOrder: orderedTabs.some((tab, i) => tab.id !== DEFAULT_TABS[i]?.id),
  };
}

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Post {
  id: string;
  thumbnail: string;
  likes: number;
  comments: number;
  isVideo: boolean;
}

export function useProfileGridOrder(posts: Post[]) {
  const { user } = useAuth();
  const [orderedPosts, setOrderedPosts] = useState<Post[]>(posts);
  const [customOrder, setCustomOrder] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch custom order on mount
  useEffect(() => {
    if (!user) {
      setOrderedPosts(posts);
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profile_grid_order')
          .select('ordered_post_ids')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data?.ordered_post_ids) {
          setCustomOrder(data.ordered_post_ids);
        }
      } catch (error) {
        console.error('Error fetching grid order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [user]);

  // Apply custom order to posts when either changes
  useEffect(() => {
    if (!customOrder || customOrder.length === 0) {
      setOrderedPosts(posts);
      return;
    }

    // Create a map for O(1) lookup
    const postMap = new Map(posts.map(p => [p.id, p]));
    
    // Start with posts in custom order (filter out any that no longer exist)
    const ordered: Post[] = [];
    const orderedIds = new Set<string>();

    for (const id of customOrder) {
      const post = postMap.get(id);
      if (post) {
        ordered.push(post);
        orderedIds.add(id);
      }
    }

    // Add any new posts not in custom order (at the end, chronological)
    for (const post of posts) {
      if (!orderedIds.has(post.id)) {
        ordered.push(post);
      }
    }

    setOrderedPosts(ordered);
  }, [posts, customOrder]);

  // Reorder posts (called during drag)
  const reorderPosts = useCallback((fromIndex: number, toIndex: number) => {
    setOrderedPosts(prev => {
      const newOrder = [...prev];
      const [removed] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, removed);
      return newOrder;
    });
  }, []);

  // Save the current order to database
  const saveOrder = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    setSaving(true);
    const newOrderIds = orderedPosts.map(p => p.id);

    try {
      // Upsert the order
      const { error } = await supabase
        .from('user_profile_grid_order')
        .upsert({
          user_id: user.id,
          ordered_post_ids: newOrderIds,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setCustomOrder(newOrderIds);
      return true;
    } catch (error) {
      console.error('Error saving grid order:', error);
      // Revert to previous order
      if (customOrder) {
        const postMap = new Map(posts.map(p => [p.id, p]));
        const reverted = customOrder
          .map(id => postMap.get(id))
          .filter((p): p is Post => p !== undefined);
        
        // Add any posts not in custom order
        for (const post of posts) {
          if (!customOrder.includes(post.id)) {
            reverted.push(post);
          }
        }
        setOrderedPosts(reverted);
      } else {
        setOrderedPosts(posts);
      }
      return false;
    } finally {
      setSaving(false);
    }
  }, [user, orderedPosts, customOrder, posts]);

  return {
    orderedPosts,
    loading,
    saving,
    reorderPosts,
    saveOrder,
    hasCustomOrder: customOrder !== null && customOrder.length > 0,
  };
}
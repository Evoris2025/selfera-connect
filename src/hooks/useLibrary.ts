import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UseLibraryResult {
  inLibrary: boolean;
  toggleLibrary: () => Promise<void>;
  isLoading: boolean;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUuid = (value: string) => UUID_RE.test(value);

export function useLibrary(postId: string): UseLibraryResult {
  const { user } = useAuth();
  const [inLibrary, setInLibrary] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isUuidPostId = isUuid(postId);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    if (!isUuidPostId) {
      // Demo/mock posts (non-UUID) — keep UI functional without backend calls.
      setIsLoading(false);
      return;
    }

    checkLibraryStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, user?.id, isUuidPostId]);

  const checkLibraryStatus = async () => {
    if (!user?.id || !isUuidPostId) return;

    try {
      const { data, error } = await supabase
        .from('saves')
        .select('post_id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setInLibrary(!!data);
    } catch (error) {
      console.error('Error checking library status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLibrary = async () => {
    if (!user?.id) return;

    // Demo/mock posts (non-UUID): optimistic local toggle.
    if (!isUuidPostId) {
      setInLibrary((prev) => !prev);
      return;
    }

    try {
      if (inLibrary) {
        const { error } = await supabase
          .from('saves')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
        setInLibrary(false);
      } else {
        const { error } = await supabase
          .from('saves')
          .insert({
            post_id: postId,
            user_id: user.id,
          });

        if (error) throw error;
        setInLibrary(true);
      }
    } catch (error) {
      console.error('Error toggling library:', error);
      checkLibraryStatus();
    }
  };

  return { inLibrary, toggleLibrary, isLoading };
}

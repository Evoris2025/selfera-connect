import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UseLibraryResult {
  inLibrary: boolean;
  toggleLibrary: () => Promise<void>;
  isLoading: boolean;
}

export function useLibrary(postId: string): UseLibraryResult {
  const { user } = useAuth();
  const [inLibrary, setInLibrary] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      checkLibraryStatus();
    } else {
      setIsLoading(false);
    }
  }, [postId, user?.id]);

  const checkLibraryStatus = async () => {
    if (!user?.id) return;

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

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Default fallback avatar
const DEFAULT_AVATAR_URL = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop';

export function useCurrentUserAvatar() {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string>(DEFAULT_AVATAR_URL);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAvatar = useCallback(async () => {
    if (!user?.id) {
      setAvatarUrl(DEFAULT_AVATAR_URL);
      setIsLoading(false);
      return;
    }

    // First check user metadata (fastest)
    if (user.user_metadata?.avatar_url) {
      setAvatarUrl(user.user_metadata.avatar_url);
      setIsLoading(false);
      return;
    }

    // Then fetch from profiles table
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      if (!error && data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
      } else {
        setAvatarUrl(DEFAULT_AVATAR_URL);
      }
    } catch {
      setAvatarUrl(DEFAULT_AVATAR_URL);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.user_metadata?.avatar_url]);

  useEffect(() => {
    fetchAvatar();
  }, [fetchAvatar]);

  const refreshAvatar = useCallback(() => {
    setIsLoading(true);
    fetchAvatar();
  }, [fetchAvatar]);

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';

  return {
    avatarUrl,
    displayName,
    userId: user?.id,
    isLoading,
    refreshAvatar,
  };
}

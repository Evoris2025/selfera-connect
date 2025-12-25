import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Default fallback cover
const DEFAULT_COVER_URL = 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&h=600&fit=crop';

export function useCurrentUserCover() {
  const { user } = useAuth();
  const [coverUrl, setCoverUrl] = useState<string>(DEFAULT_COVER_URL);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCover = useCallback(async () => {
    if (!user?.id) {
      setCoverUrl(DEFAULT_COVER_URL);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('cover_url')
        .eq('id', user.id)
        .single();

      if (!error && data?.cover_url) {
        setCoverUrl(data.cover_url);
      } else {
        setCoverUrl(DEFAULT_COVER_URL);
      }
    } catch {
      setCoverUrl(DEFAULT_COVER_URL);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCover();
  }, [fetchCover]);

  const refreshCover = useCallback(() => {
    setIsLoading(true);
    fetchCover();
  }, [fetchCover]);

  return {
    coverUrl,
    isLoading,
    refreshCover,
  };
}

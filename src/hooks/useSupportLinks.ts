import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type SupportLinkStatus = 'pending' | 'active' | 'inactive' | 'ended';

interface SupportLink {
  id: string;
  user_id: string;
  provider_user_id: string;
  provider_role: string;
  organization_name: string | null;
  status: SupportLinkStatus;
  created_at: string;
  updated_at: string;
  provider?: {
    id: string;
    display_name: string | null;
    handle: string | null;
    avatar_url: string | null;
    is_verified: boolean;
  };
}

export function useSupportLinks() {
  const { user } = useAuth();
  const [supportLinks, setSupportLinks] = useState<SupportLink[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSupportLinks = useCallback(async () => {
    if (!user) {
      setSupportLinks([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch support links for the current user
      const { data, error } = await supabase
        .from('user_support_links')
        .select(`
          *,
          provider:profiles!user_support_links_provider_user_id_fkey (
            id,
            display_name,
            handle,
            avatar_url,
            is_verified
          )
        `)
        .eq('user_id', user.id)
        .in('status', ['pending', 'active']);

      if (error) throw error;

      const typedLinks = (data || []).map(link => ({
        ...link,
        status: link.status as SupportLinkStatus,
        provider: Array.isArray(link.provider) ? link.provider[0] : link.provider,
      }));

      setSupportLinks(typedLinks);
    } catch (error) {
      console.error('Error fetching support links:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSupportLinks();
  }, [fetchSupportLinks]);

  // Get active providers
  const activeProviders = supportLinks.filter(l => l.status === 'active');
  const pendingProviders = supportLinks.filter(l => l.status === 'pending');

  return {
    supportLinks,
    activeProviders,
    pendingProviders,
    loading,
    refresh: fetchSupportLinks,
    hasActiveSupport: activeProviders.length > 0,
  };
}

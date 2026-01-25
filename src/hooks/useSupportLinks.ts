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
    email: string | null;
  };
}

// For providers viewing their connected clients
interface ConnectedClient {
  id: string;
  user_id: string;
  status: SupportLinkStatus;
  created_at: string;
  client?: {
    id: string;
    display_name: string | null;
    handle: string | null;
    avatar_url: string | null;
  };
}

export function useSupportLinks() {
  const { user } = useAuth();
  const [supportLinks, setSupportLinks] = useState<SupportLink[]>([]);
  const [connectedClients, setConnectedClients] = useState<ConnectedClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSupportLinks = useCallback(async () => {
    if (!user) {
      setSupportLinks([]);
      setConnectedClients([]);
      setLoading(false);
      return;
    }

    setError(null);

    try {
      // Step 1: Fetch support links where user is the client
      const { data: clientLinks, error: clientError } = await supabase
        .from('user_support_links')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'active']);

      if (clientError) throw clientError;

      // Step 2: Extract provider IDs and fetch their profiles separately
      const providerIds = (clientLinks || []).map(link => link.provider_user_id);
      let providerProfiles: Record<string, any> = {};
      
      if (providerIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, handle, avatar_url, is_verified, email')
          .in('id', providerIds);
        
        if (profilesError) {
          console.warn('Error fetching provider profiles:', profilesError);
        } else {
          providerProfiles = (profiles || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
        }
      }

      // Step 3: Fetch support links where user is the provider
      const { data: providerLinks, error: providerError } = await supabase
        .from('user_support_links')
        .select('id, user_id, status, created_at')
        .eq('provider_user_id', user.id)
        .in('status', ['pending', 'active']);

      if (providerError) throw providerError;

      // Step 4: Extract client IDs and fetch their profiles separately
      const clientIds = (providerLinks || []).map(link => link.user_id);
      let clientProfiles: Record<string, any> = {};
      
      if (clientIds.length > 0) {
        const { data: profiles, error: clientProfilesError } = await supabase
          .from('profiles')
          .select('id, display_name, handle, avatar_url')
          .in('id', clientIds);
        
        if (clientProfilesError) {
          console.warn('Error fetching client profiles:', clientProfilesError);
        } else {
          clientProfiles = (profiles || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
        }
      }

      // Step 5: Merge provider profiles into support links
      const typedLinks = (clientLinks || []).map(link => ({
        ...link,
        status: link.status as SupportLinkStatus,
        provider: providerProfiles[link.provider_user_id] || {
          id: link.provider_user_id,
          display_name: null,
          handle: null,
          avatar_url: null,
          is_verified: false,
        },
      }));

      // Step 6: Merge client profiles into connected clients
      const typedClients = (providerLinks || []).map(link => ({
        ...link,
        status: link.status as SupportLinkStatus,
        client: clientProfiles[link.user_id] || {
          id: link.user_id,
          display_name: null,
          handle: null,
          avatar_url: null,
        },
      }));

      setSupportLinks(typedLinks);
      setConnectedClients(typedClients);
    } catch (err) {
      console.error('Error fetching support links:', err);
      setError('Failed to load support connections');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSupportLinks();
  }, [fetchSupportLinks]);

  // Request a connection with a provider
  const requestConnection = useCallback(async (
    providerId: string, 
    providerRole: string, 
    organizationName?: string
  ) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { error } = await supabase.from('user_support_links').insert({
        user_id: user.id,
        provider_user_id: providerId,
        provider_role: providerRole,
        organization_name: organizationName || null,
        status: 'pending',
      });

      if (error) {
        if (error.code === '23505') {
          return { success: false, error: 'Connection already exists' };
        }
        throw error;
      }

      await fetchSupportLinks();
      return { success: true };
    } catch (err) {
      console.error('Error requesting connection:', err);
      return { success: false, error: 'Failed to request connection' };
    }
  }, [user, fetchSupportLinks]);

  // Accept a connection request (for providers)
  const acceptConnection = useCallback(async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('user_support_links')
        .update({ status: 'active' })
        .eq('id', linkId);

      if (error) throw error;
      await fetchSupportLinks();
      return { success: true };
    } catch (err) {
      console.error('Error accepting connection:', err);
      return { success: false, error: 'Failed to accept connection' };
    }
  }, [fetchSupportLinks]);

  // End a support relationship
  const endConnection = useCallback(async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('user_support_links')
        .update({ status: 'ended' })
        .eq('id', linkId);

      if (error) throw error;
      await fetchSupportLinks();
      return { success: true };
    } catch (err) {
      console.error('Error ending connection:', err);
      return { success: false, error: 'Failed to end connection' };
    }
  }, [fetchSupportLinks]);

  // Get active/pending providers (for clients)
  const activeProviders = supportLinks.filter(l => l.status === 'active');
  const pendingProviders = supportLinks.filter(l => l.status === 'pending');

  // Get active/pending clients (for providers)
  const activeClients = connectedClients.filter(l => l.status === 'active');
  const pendingClients = connectedClients.filter(l => l.status === 'pending');

  return {
    // As client
    supportLinks,
    activeProviders,
    pendingProviders,
    hasActiveSupport: activeProviders.length > 0,
    
    // As provider
    connectedClients,
    activeClients,
    pendingClients,
    hasConnectedClients: activeClients.length > 0,
    
    // Actions
    requestConnection,
    acceptConnection,
    endConnection,
    
    // State
    loading,
    error,
    refresh: fetchSupportLinks,
  };
}

/**
 * SIMULATION MODE: Support Links Hook
 * Returns simulated provider/client connection data.
 * Shows mock active providers and pending connections.
 */

import { useState, useCallback } from 'react';

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

// Mock providers for simulation
const MOCK_SUPPORT_LINKS: SupportLink[] = [
  {
    id: 'mock-link-1',
    user_id: 'mock-user',
    provider_user_id: 'mock-provider-1',
    provider_role: 'Therapist',
    organization_name: 'Mind Matters Clinic',
    status: 'active',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    provider: {
      id: 'mock-provider-1',
      display_name: 'Dr. Sarah Chen',
      handle: 'drsarah',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
      is_verified: true,
      email: 'sarah@mindmatters.com',
    },
  },
  {
    id: 'mock-link-2',
    user_id: 'mock-user',
    provider_user_id: 'mock-provider-2',
    provider_role: 'Life Coach',
    organization_name: null,
    status: 'pending',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    provider: {
      id: 'mock-provider-2',
      display_name: 'James Wilson',
      handle: 'jameswilson',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
      is_verified: true,
      email: null,
    },
  },
];

// Mock connected clients (for provider view)
const MOCK_CONNECTED_CLIENTS: ConnectedClient[] = [
  {
    id: 'mock-client-link-1',
    user_id: 'mock-client-1',
    status: 'active',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      id: 'mock-client-1',
      display_name: 'Alex Johnson',
      handle: 'alexj',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    },
  },
  {
    id: 'mock-client-link-2',
    user_id: 'mock-client-2',
    status: 'pending',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      id: 'mock-client-2',
      display_name: 'Morgan Taylor',
      handle: 'morgant',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
    },
  },
];

export function useSimulatedSupportLinks() {
  const [supportLinks] = useState<SupportLink[]>(MOCK_SUPPORT_LINKS);
  const [connectedClients] = useState<ConnectedClient[]>(MOCK_CONNECTED_CLIENTS);

  const requestConnection = useCallback(async (
    providerId: string, 
    providerRole: string, 
    organizationName?: string
  ) => {
    console.log('[Simulation] Connection requested:', { providerId, providerRole, organizationName });
    return { success: true };
  }, []);

  const acceptConnection = useCallback(async (linkId: string) => {
    console.log('[Simulation] Connection accepted:', linkId);
    return { success: true };
  }, []);

  const endConnection = useCallback(async (linkId: string) => {
    console.log('[Simulation] Connection ended:', linkId);
    return { success: true };
  }, []);

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
    loading: false,
    error: null,
    refresh: () => {},
    
    // Simulation extras
    isSimulated: true,
  };
}

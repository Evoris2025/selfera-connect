import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Users,
  Clock,
  Check,
  X,
  MessageCircle,
  Edit,
  Plus,
  ChevronRight,
  Settings,
  Shield,
  MapPin,
  Globe,
  Languages,
  DollarSign,
  ExternalLink,
  AlertCircle,
  Bell,
  Handshake,
} from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CinematicAvatar } from '@/components/ui/CinematicAvatar';
import { GlassCard } from '@/components/ui/GlassCard';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { DirectoryListingForm } from '@/components/directory/DirectoryListingForm';
import { InteractionCard } from '@/components/interactions/InteractionCard';
import { useAuth } from '@/contexts/AuthContext';
import { useSupportLinks } from '@/hooks/useSupportLinks';
import { useInteractionLifecycle } from '@/hooks/useInteractionLifecycle';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { DirectoryEntry } from '@/hooks/useDirectory';

const springGentle = { type: "spring" as const, stiffness: 200, damping: 25 };

interface UserProfile {
  id: string;
  display_name: string | null;
  handle: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  user_type: string | null;
}

const priceLabels: Record<string, string> = {
  free: 'Free',
  'sliding-scale': 'Sliding Scale',
  affordable: 'Affordable',
  standard: 'Standard',
};

export default function ProviderDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    pendingClients, 
    activeClients, 
    acceptConnection, 
    endConnection,
    refresh: refreshLinks,
    loading: linksLoading,
  } = useSupportLinks();

  // Interaction lifecycle hook for Phase F
  const {
    myInteractions,
    fetchInteractions,
    acceptInteraction,
    declineInteraction,
    completeInteraction,
    cancelInteraction,
    getGroupedInteractions,
  } = useInteractionLifecycle();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [directoryEntry, setDirectoryEntry] = useState<DirectoryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [showListingForm, setShowListingForm] = useState(false);

  // Grouped interactions for provider view
  const groupedInteractions = getGroupedInteractions('provider');

  // Function to refetch directory entry
  const refetchDirectoryEntry = useCallback(async () => {
    if (!user) return;
    const { data: entryData } = await supabase
      .from('service_directory_entries')
      .select('*')
      .eq('owner_user_id', user.id)
      .maybeSingle();

    if (entryData) {
      setDirectoryEntry({
        ...entryData,
        verified: entryData.verified ?? false,
        links: entryData.links as { website?: string } | null,
      });
    } else {
      setDirectoryEntry(null);
    }
  }, [user]);

  // Fetch user profile and directory entry
  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, display_name, handle, avatar_url, is_verified, user_type')
          .eq('id', user.id)
          .single();

        if (profileData) setProfile(profileData);

        // Fetch directory entry
        await refetchDirectoryEntry();
        
        // Fetch interactions
        await fetchInteractions('provider');
      } catch (err) {
        console.error('Error fetching provider data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, refetchDirectoryEntry, fetchInteractions]);

  // Real-time subscription for new connection requests
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`provider-connections-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_support_links',
          filter: `provider_user_id=eq.${user.id}`,
        },
        (payload) => {
          toast.info('New connection request received!', {
            icon: <Bell className="w-4 h-4" />,
          });
          refreshLinks();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_support_links',
          filter: `provider_user_id=eq.${user.id}`,
        },
        () => {
          refreshLinks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refreshLinks]);

  const handleAcceptConnection = async (linkId: string) => {
    const result = await acceptConnection(linkId);
    if (result.success) {
      toast.success('Connection accepted');
    } else {
      toast.error('Failed to accept connection');
    }
  };

  const handleDeclineConnection = async (linkId: string) => {
    const result = await endConnection(linkId);
    if (result.success) {
      toast.success('Connection declined');
    } else {
      toast.error('Failed to decline connection');
    }
  };

  const handleMessageClient = (clientId: string) => {
    navigate(`/messages?user=${clientId}`);
  };

  // Check if user is verified professional/organization
  const isVerifiedProvider = profile?.is_verified && 
    (profile?.user_type === 'professional' || profile?.user_type === 'organization');

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  // Access control: only for verified professionals/organizations
  if (!isVerifiedProvider) {
    return (
      <AppLayout>
        <div className="max-w-lg mx-auto px-4 py-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springGentle}
          >
            <Shield className="w-16 h-16 mx-auto mb-6 text-muted-foreground/30" />
            <h1 className="text-xl font-semibold text-foreground mb-2">
              Provider Dashboard
            </h1>
            <p className="text-muted-foreground mb-6">
              This dashboard is available for verified mental health professionals and organizations.
            </p>
            {profile?.user_type === 'professional' || profile?.user_type === 'organization' ? (
              <Button onClick={() => navigate('/settings?view=verification')}>
                <Shield className="w-4 h-4 mr-2" />
                Apply for Verification
              </Button>
            ) : (
              <Button variant="outline" onClick={() => navigate('/my-era')}>
                Explore Pathways
              </Button>
            )}
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          className="flex items-start gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springGentle}
        >
          <CinematicAvatar
            src={profile?.avatar_url || undefined}
            alt={profile?.display_name || 'Provider'}
            fallback={profile?.display_name?.[0] || 'P'}
            size="xl"
            ring="gradient"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold text-foreground truncate">
                {profile?.display_name || 'Provider'}
              </h1>
              <VerifiedBadge size="sm" />
            </div>
            <p className="text-sm text-muted-foreground">@{profile?.handle}</p>
            <Badge variant="secondary" className="mt-2 capitalize">
              {profile?.user_type}
            </Badge>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/settings')}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          className="grid grid-cols-4 gap-3 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.05 }}
        >
          <GlassCard variant="subtle" className="p-4 text-center">
            <p className="text-2xl font-semibold text-foreground">{activeClients.length}</p>
            <p className="text-xs text-muted-foreground">Connections</p>
          </GlassCard>
          <GlassCard variant="subtle" className="p-4 text-center">
            <p className="text-2xl font-semibold text-foreground">{groupedInteractions.pending.length}</p>
            <p className="text-xs text-muted-foreground">Requests</p>
          </GlassCard>
          <GlassCard variant="subtle" className="p-4 text-center">
            <p className="text-2xl font-semibold text-foreground">{groupedInteractions.active.length}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </GlassCard>
          <GlassCard variant="subtle" className="p-4 text-center">
            <p className="text-2xl font-semibold text-foreground">
              {directoryEntry ? '1' : '0'}
            </p>
            <p className="text-xs text-muted-foreground">Listing</p>
          </GlassCard>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="interactions" className="space-y-4">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="interactions" className="gap-2">
              <Handshake className="w-4 h-4" />
              Interactions
            </TabsTrigger>
            <TabsTrigger value="connections" className="gap-2">
              <Users className="w-4 h-4" />
              Connections
            </TabsTrigger>
            <TabsTrigger value="listing" className="gap-2">
              <Globe className="w-4 h-4" />
              Listing
            </TabsTrigger>
          </TabsList>

          {/* Interactions Tab (Phase F) */}
          <TabsContent value="interactions" className="space-y-4">
            {/* Pending Interaction Requests */}
            {groupedInteractions.pending.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Pending Requests ({groupedInteractions.pending.length})
                </h3>
                <div className="space-y-2">
                  {groupedInteractions.pending.map((interaction) => (
                    <InteractionCard
                      key={interaction.id}
                      interaction={interaction}
                      userRole="provider"
                      onAccept={() => acceptInteraction(interaction.id)}
                      onDecline={() => declineInteraction(interaction.id)}
                      onMessage={() => navigate(`/messages?user=${interaction.client_user_id}`)}
                      onCancel={() => cancelInteraction(interaction.id)}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Active Interactions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                Active Interactions ({groupedInteractions.active.length})
              </h3>
              
              {groupedInteractions.active.length === 0 ? (
                <GlassCard variant="subtle" className="p-8 text-center">
                  <Handshake className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    No active interactions. Pending requests will appear here once accepted.
                  </p>
                </GlassCard>
              ) : (
                <div className="space-y-2">
                  {groupedInteractions.active.map((interaction) => (
                    <InteractionCard
                      key={interaction.id}
                      interaction={interaction}
                      userRole="provider"
                      onComplete={() => completeInteraction(interaction.id)}
                      onMessage={() => navigate(`/messages?user=${interaction.client_user_id}`)}
                      onCancel={() => cancelInteraction(interaction.id)}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Completed Interactions */}
            {groupedInteractions.completed.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  Past Interactions ({groupedInteractions.completed.length + groupedInteractions.cancelled.length})
                </h3>
                <div className="space-y-2">
                  {[...groupedInteractions.completed, ...groupedInteractions.cancelled].map((interaction) => (
                    <InteractionCard
                      key={interaction.id}
                      interaction={interaction}
                      userRole="provider"
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Empty State */}
            {groupedInteractions.pending.length === 0 && 
             groupedInteractions.active.length === 0 && 
             groupedInteractions.completed.length === 0 && (
              <GlassCard variant="subtle" className="p-8 text-center">
                <Handshake className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-base font-medium text-foreground mb-2">
                  No Interactions Yet
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  When users request interactions with you, they'll appear here. 
                  Make sure your directory listing is set up to be discoverable.
                </p>
              </GlassCard>
            )}
          </TabsContent>

          {/* Connections Tab */}
          <TabsContent value="connections" className="space-y-4">
            {/* Pending Requests */}
            {pendingClients.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Pending Requests ({pendingClients.length})
                </h3>
                <div className="space-y-2">
                  {pendingClients.map((link) => (
                    <GlassCard key={link.id} variant="card" className="p-4">
                      <div className="flex items-center gap-3">
                        <CinematicAvatar
                          src={link.client?.avatar_url || undefined}
                          alt={link.client?.display_name || 'Client'}
                          fallback={link.client?.display_name?.[0] || 'C'}
                          size="md"
                          ring="muted"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {link.client?.display_name || 'User'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            @{link.client?.handle || 'user'} • Requested connection
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeclineConnection(link.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptConnection(link.id)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Active Connections */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                Active Connections ({activeClients.length})
              </h3>
              
              {activeClients.length === 0 ? (
                <GlassCard variant="subtle" className="p-8 text-center">
                  <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    No active connections yet. Users can find and connect with you through the Directory.
                  </p>
                </GlassCard>
              ) : (
                <div className="space-y-2">
                  {activeClients.map((link) => (
                    <GlassCard key={link.id} variant="card" className="p-4">
                      <div className="flex items-center gap-3">
                        <CinematicAvatar
                          src={link.client?.avatar_url || undefined}
                          alt={link.client?.display_name || 'Client'}
                          fallback={link.client?.display_name?.[0] || 'C'}
                          size="md"
                          ring="primary"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {link.client?.display_name || 'User'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            @{link.client?.handle || 'user'}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMessageClient(link.user_id)}
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Message
                        </Button>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Directory Listing Tab */}
          <TabsContent value="listing" className="space-y-4">
            {directoryEntry ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <GlassCard variant="card" className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {directoryEntry.name}
                        </h3>
                        {directoryEntry.verified && <VerifiedBadge size="sm" />}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {directoryEntry.description}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowListingForm(true)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {directoryEntry.regions_served && directoryEntry.regions_served.length > 0 && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Regions</p>
                          <p className="text-sm text-foreground">
                            {directoryEntry.regions_served.join(', ')}
                          </p>
                        </div>
                      </div>
                    )}
                    {directoryEntry.delivery_type && (
                      <div className="flex items-start gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Delivery</p>
                          <p className="text-sm text-foreground capitalize">
                            {directoryEntry.delivery_type}
                          </p>
                        </div>
                      </div>
                    )}
                    {directoryEntry.languages_supported && directoryEntry.languages_supported.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Languages className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Languages</p>
                          <p className="text-sm text-foreground">
                            {directoryEntry.languages_supported.join(', ')}
                          </p>
                        </div>
                      </div>
                    )}
                    {directoryEntry.price_range && (
                      <div className="flex items-start gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Price Range</p>
                          <p className="text-sm text-foreground">
                            {priceLabels[directoryEntry.price_range] || directoryEntry.price_range}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {directoryEntry.tags && directoryEntry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {directoryEntry.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs rounded-full">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {directoryEntry.links?.website && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-muted-foreground"
                      onClick={() => window.open(directoryEntry.links?.website, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {directoryEntry.links.website}
                    </Button>
                  )}
                </GlassCard>

                {/* Listing Tips */}
                <GlassCard variant="subtle" className="p-4 mt-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-primary shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-foreground mb-1">Listing Tips</p>
                      <ul className="text-muted-foreground space-y-1 text-xs">
                        <li>• Keep your description clear and focused on the support you provide</li>
                        <li>• Add relevant tags to help users find you</li>
                        <li>• Update your regions and languages if they change</li>
                      </ul>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-base font-medium text-foreground mb-2">
                  No Directory Listing Yet
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                  Create a listing to appear in the SelfERA Directory and allow users to discover and connect with you.
                </p>
                <Button onClick={() => setShowListingForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Listing
                </Button>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>

        {/* Trust Notice */}
        <motion.div
          className="mt-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Reminder:</strong> SelfERA facilitates discovery and connection only. 
            All treatment, appointments, and payment agreements occur independently between you and your clients 
            through your own systems.
          </p>
        </motion.div>

        {/* Directory Listing Form Modal */}
        <DirectoryListingForm
          open={showListingForm}
          onOpenChange={setShowListingForm}
          existingEntry={directoryEntry}
          onSuccess={refetchDirectoryEntry}
        />
      </div>
    </AppLayout>
  );
}

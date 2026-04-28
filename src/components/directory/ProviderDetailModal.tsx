import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CinematicAvatar } from '@/components/ui/CinematicAvatar';
import { EraVerifiedTick } from '@/components/EraVerifiedTick';
import { GlassCard } from '@/components/ui/GlassCard';
import { RequestInteractionModal } from '@/components/interactions/RequestInteractionModal';
import { useAuth } from '@/contexts/AuthContext';
import { useSupportLinks } from '@/hooks/useSupportLinks';
import { useInteractionLifecycle } from '@/hooks/useInteractionLifecycle';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { DirectoryEntry } from '@/hooks/useDirectory';
import { EraTier } from '@/lib/eraTiers';
import {
  MapPin,
  Globe,
  DollarSign,
  MessageCircle,
  UserPlus,
  ExternalLink,
  Languages,
  Check,
  AlertCircle,
  Loader2,
  ShieldAlert,
  Handshake,
} from 'lucide-react';

interface ProviderDetailModalProps {
  entry: DirectoryEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const priceLabels: Record<string, string> = {
  free: 'Free',
  'sliding-scale': 'Sliding Scale',
  affordable: 'Affordable',
  standard: 'Standard',
};

const deliveryLabels: Record<string, string> = {
  online: 'Online',
  'in-person': 'In Person',
  hybrid: 'Hybrid',
};

export function ProviderDetailModal({ entry, open, onOpenChange }: ProviderDetailModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refresh: refreshSupportLinks } = useSupportLinks();
  const { requestInteraction, loading: interactionLoading } = useInteractionLifecycle();
  const { subscription } = useSubscription();
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [providerTier, setProviderTier] = useState<EraTier>('pink');

  // Fetch provider's tier when entry changes
  useEffect(() => {
    async function fetchProviderTier() {
      if (!entry) return;
      const providerId = entry.owner_profile_id || entry.owner_user_id;
      const { data } = await supabase
        .from('user_subscriptions')
        .select('tier_colour')
        .eq('user_id', providerId)
        .maybeSingle();
      
      if (data?.tier_colour) {
        setProviderTier(data.tier_colour as EraTier);
      }
    }
    if (open) {
      fetchProviderTier();
    }
  }, [entry, open]);

  if (!entry) return null;

  const handleConnect = async () => {
    if (!user) {
      toast.error(t('auth.required'), {
        description: 'Please log in to connect with providers',
      });
      return;
    }

    if (!entry.owner_profile_id && !entry.owner_user_id) {
      toast.error('Unable to connect', {
        description: 'This provider does not have a linked profile',
      });
      return;
    }

    setConnecting(true);
    try {
      // Determine the role from tags
      const roleTag = entry.tags?.find(tag => 
        ['Counsellor', 'Psychologist', 'Psychiatrist', 'Social Worker', 'Coach', 'Peer Support', 'Occupational Therapist'].includes(tag)
      ) || 'Provider';

      const { error } = await supabase.from('user_support_links').insert({
        user_id: user.id,
        provider_user_id: entry.owner_profile_id || entry.owner_user_id,
        provider_role: roleTag,
        organization_name: entry.name,
        status: 'pending',
      });

      if (error) {
        if (error.code === '23505') {
          toast.info('Connection already exists', {
            description: 'You already have a connection with this provider',
          });
        } else {
          throw error;
        }
      } else {
        setConnected(true);
        toast.success('Connection requested', {
          description: 'Your request has been sent to the provider',
        });
        refreshSupportLinks();
      }
    } catch (err) {
      console.error('Error connecting:', err);
      toast.error('Failed to connect', {
        description: 'Please try again later',
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleRequestInteraction = () => {
    if (!user) {
      toast.error(t('auth.required'), {
        description: 'Please log in to request an interaction',
      });
      return;
    }

    // Check if user has a paid plan (any non-free plan)
    const isPaidClient = subscription?.plan && subscription.plan !== 'free';
    
    if (!isPaidClient) {
      toast.error('Upgrade required', {
        description: 'A paid plan is required to request interactions',
      });
      return;
    }

    if (!entry.verified) {
      toast.error('Verified providers only', {
        description: 'Interactions can only be requested with verified providers',
      });
      return;
    }

    setShowInteractionModal(true);
  };

  const handleSubmitInteraction = async (notes: string): Promise<boolean> => {
    const providerId = entry.owner_profile_id || entry.owner_user_id;
    const result = await requestInteraction({
      providerUserId: providerId,
      providerTier,
      notes,
    });
    
    if (result) {
      toast.success('Interaction requested', {
        description: 'The provider will review your request',
      });
      onOpenChange(false);
      return true;
    }
    return false;
  };

  const handleMessage = () => {
    if (!user) {
      toast.error(t('auth.required'), {
        description: 'Please log in to send messages',
      });
      return;
    }
    
    // Get the provider's user ID for deep-linking
    const providerId = entry.owner_profile_id || entry.owner_user_id;
    onOpenChange(false);
    // Deep-link to messages with the provider's user ID
    navigate(`/messages?user=${providerId}`);
  };

  const handleVisitWebsite = () => {
    const website = entry.links?.website;
    if (website) {
      window.open(website, '_blank', 'noopener,noreferrer');
    }
  };

  const providerId = entry.owner_profile_id || entry.owner_user_id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader className="pb-4">
          <div className="flex items-start gap-4">
            <CinematicAvatar
              src={entry.profile?.avatar_url || undefined}
              alt={entry.name}
              fallback={entry.name.charAt(0)}
              size="xl"
              ring={entry.verified ? 'gradient' : 'muted'}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-headline font-semibold truncate">
                  {entry.name}
                </DialogTitle>
                {entry.verified && <EraVerifiedTick size="sm" userEmail={entry.profile?.email || undefined} />}
              </div>
              {entry.profile?.handle && (
                <p className="text-body text-muted-foreground">
                  @{entry.profile.handle}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {entry.verified ? (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-label">
                    <Check className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-label">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Unverified
                  </Badge>
                )}
                {entry.price_range && (
                  <Badge variant="outline" className="text-label">
                    <DollarSign className="w-3 h-3 mr-1" />
                    {priceLabels[entry.price_range] || entry.price_range}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Description */}
          <p className="text-body text-foreground leading-relaxed">
            {entry.description}
          </p>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            {entry.regions_served && entry.regions_served.length > 0 && (
              <GlassCard variant="subtle" className="p-3">
                <div className="flex items-center gap-2 text-label text-muted-foreground mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Regions</span>
                </div>
                <p className="text-body text-foreground">
                  {entry.regions_served.slice(0, 3).join(', ')}
                  {entry.regions_served.length > 3 && ` +${entry.regions_served.length - 3}`}
                </p>
              </GlassCard>
            )}

            {entry.delivery_type && (
              <GlassCard variant="subtle" className="p-3">
                <div className="flex items-center gap-2 text-label text-muted-foreground mb-1">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Delivery</span>
                </div>
                <p className="text-body text-foreground">
                  {deliveryLabels[entry.delivery_type] || entry.delivery_type}
                </p>
              </GlassCard>
            )}

            {entry.languages_supported && entry.languages_supported.length > 0 && (
              <GlassCard variant="subtle" className="p-3 col-span-2">
                <div className="flex items-center gap-2 text-label text-muted-foreground mb-1">
                  <Languages className="w-3.5 h-3.5" />
                  <span>Languages</span>
                </div>
                <p className="text-body text-foreground">
                  {entry.languages_supported.join(', ')}
                </p>
              </GlassCard>
            )}
          </div>

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {entry.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-label rounded-full">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {entry.verified && (
              <Button
                className="flex-1"
                onClick={handleRequestInteraction}
                disabled={interactionLoading}
              >
                <Handshake className="w-4 h-4 mr-2" />
                Request Interaction
              </Button>
            )}
            <Button
              variant={entry.verified ? "outline" : "default"}
              className={entry.verified ? "" : "flex-1"}
              onClick={handleConnect}
              disabled={connecting || connected}
            >
              {connecting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : connected ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              {connected ? 'Sent' : 'Connect'}
            </Button>
            <Button variant="outline" onClick={handleMessage}>
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>

          {entry.links?.website && (
            <Button 
              variant="ghost" 
              className="w-full text-muted-foreground"
              onClick={handleVisitWebsite}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Website
            </Button>
          )}

          {/* Trust & Transparency Notice */}
          <GlassCard variant="subtle" className="p-4 mt-4">
            <div className="flex gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1.5 text-label text-muted-foreground">
                <p>
                  <strong className="text-foreground">Important:</strong> SelfERA is not a healthcare provider. 
                  Services are provided independently by listed providers.
                </p>
                <p>
                  Payments, appointments, and treatment agreements occur directly with providers. 
                  SelfERA facilitates discovery and connection only.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </DialogContent>

      {/* Request Interaction Modal */}
      <RequestInteractionModal
        isOpen={showInteractionModal}
        onClose={() => setShowInteractionModal(false)}
        provider={{
          id: providerId,
          display_name: entry.name,
          handle: entry.profile?.handle || 'provider',
          avatar_url: entry.profile?.avatar_url || undefined,
          is_verified: entry.verified || false,
          tier: providerTier,
        }}
        onSubmit={handleSubmitInteraction}
        isLoading={interactionLoading}
      />
    </Dialog>
  );
}

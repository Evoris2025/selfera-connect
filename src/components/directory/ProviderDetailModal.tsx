import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CinematicAvatar } from '@/components/ui/CinematicAvatar';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuth } from '@/contexts/AuthContext';
import { useSupportLinks } from '@/hooks/useSupportLinks';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { DirectoryEntry } from '@/hooks/useDirectory';
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
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

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

  const handleMessage = () => {
    if (!user) {
      toast.error(t('auth.required'), {
        description: 'Please log in to send messages',
      });
      return;
    }
    // Navigate to messages (could deep-link to create conversation)
    onOpenChange(false);
    navigate('/messages');
  };

  const handleVisitWebsite = () => {
    const website = entry.links?.website;
    if (website) {
      window.open(website, '_blank', 'noopener,noreferrer');
    }
  };

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
                <DialogTitle className="text-xl font-semibold truncate">
                  {entry.name}
                </DialogTitle>
                {entry.verified && <VerifiedBadge size="sm" />}
              </div>
              {entry.profile?.handle && (
                <p className="text-sm text-muted-foreground">
                  @{entry.profile.handle}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {entry.verified ? (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                    <Check className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Unverified
                  </Badge>
                )}
                {entry.price_range && (
                  <Badge variant="outline" className="text-xs">
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
          <p className="text-sm text-foreground leading-relaxed">
            {entry.description}
          </p>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            {entry.regions_served && entry.regions_served.length > 0 && (
              <GlassCard variant="subtle" className="p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Regions</span>
                </div>
                <p className="text-sm text-foreground">
                  {entry.regions_served.slice(0, 3).join(', ')}
                  {entry.regions_served.length > 3 && ` +${entry.regions_served.length - 3}`}
                </p>
              </GlassCard>
            )}

            {entry.delivery_type && (
              <GlassCard variant="subtle" className="p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Delivery</span>
                </div>
                <p className="text-sm text-foreground">
                  {deliveryLabels[entry.delivery_type] || entry.delivery_type}
                </p>
              </GlassCard>
            )}

            {entry.languages_supported && entry.languages_supported.length > 0 && (
              <GlassCard variant="subtle" className="p-3 col-span-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Languages className="w-3.5 h-3.5" />
                  <span>Languages</span>
                </div>
                <p className="text-sm text-foreground">
                  {entry.languages_supported.join(', ')}
                </p>
              </GlassCard>
            )}
          </div>

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {entry.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs rounded-full">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1"
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
              {connected ? 'Request Sent' : 'Request Connection'}
            </Button>
            <Button variant="outline" onClick={handleMessage}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
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
              <div className="space-y-1.5 text-xs text-muted-foreground">
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
    </Dialog>
  );
}

import { useEffect, useState } from 'react';
import { ICON_SIZE } from "@/lib/scale";
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { 
  ChevronRight,
  Sparkles,
  Stethoscope,
  Building2,
  Heart,
  Check,
  Clock,
  Bookmark,
  Users,
  Compass,
  Settings,
  Bell,
  Shield,
  BarChart3,
  ArrowRight,
  Plus,
  MessageCircle,
  MoreVertical,
  ExternalLink,
  UserCheck,
  FileCheck,
  CreditCard,
  Calendar,
  User,
  AlertCircle,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSupportLinks } from '@/hooks/useSupportLinks';
import { usePendingConnectionCount } from '@/hooks/usePendingConnectionCount';
import { useVerification } from '@/hooks/useVerification';
import { useSubscription, PLAN_DETAILS } from '@/hooks/useSubscription';
import { useNewConversation } from '@/hooks/useNewConversation';
import { useUserRole } from '@/hooks/useUserRole';
import { useInteractionLifecycle } from '@/hooks/useInteractionLifecycle';
import { InteractionList } from '@/components/interactions';
import { CinematicAvatar } from '@/components/ui/CinematicAvatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EraVerifiedTick } from '@/components/EraVerifiedTick';
import { AccountTypeBadge, AccountType } from '@/components/AccountTypeBadge';
import { AppLayout } from '@/components/AppLayout';
import { VerificationFlow } from '@/components/verification';
import {
  VerifiedDirectoryPicker,
  ClientView,
  CreatorView,
  PractitionerView,
  OrganisationView,
} from '@/components/myera';
import { EraAccountStatusCard } from '@/components/billing';
import { EraTier, PlanType } from '@/lib/eraTiers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BrandSectionLabel,
  BrandIcon,
  BrandSurface,
  BrandUnderlineTabs,
} from '@/components/brand';
import { useThemeColor } from '@/hooks/useThemeColor';

const springGentle = { type: "spring" as const, stiffness: 260, damping: 28 };

// Verification intent options - using explicit verification process names
const verificationIntents = [
  {
    id: 'creator',
    icon: Sparkles,
    title: 'Creator / Influencer',
    description: 'Mental health & wellbeing content creator',
    depth: 'Light verification',
    accountType: 'individual' as const,
  },
  {
    id: 'professional',
    icon: Stethoscope,
    title: 'Professional',
    description: 'Licensed mental health practitioner',
    depth: 'Full verification',
    accountType: 'professional' as const,
  },
  {
    id: 'organization',
    icon: Building2,
    title: 'Organization',
    description: 'Mental health service or clinic',
    depth: 'Full verification',
    accountType: 'organization' as const,
  },
  {
    id: 'individual',
    icon: Heart,
    title: 'Individual',
    description: 'Looking for professional support',
    depth: 'Simple profile',
    accountType: 'individual' as const,
  },
];

// Progress steps for verification
const verificationSteps = [
  { id: 'submitted', label: 'Submitted', icon: FileCheck },
  { id: 'review', label: 'Under review', icon: Clock },
  { id: 'approved', label: 'Approved', icon: Check },
];

interface UserProfile {
  display_name: string | null;
  handle: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  is_verified: boolean | null;
  user_type: string | null;
  email: string | null;
}

// Helper to get step index based on verification status
function getVerificationStepIndex(status: string | undefined): number {
  if (!status) return -1;
  switch (status) {
    case 'pending':
      return 1; // Under review
    case 'approved':
      return 2; // Approved
    case 'rejected':
      return -1; // Reset
    default:
      return 0; // Submitted
  }
}


export default function MyERA() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { primary: themePrimary } = useThemeColor();
  const { activeProviders, pendingProviders, loading: supportLinksLoading, error: supportLinksError, refresh: refreshSupportLinks } = useSupportLinks();
  const { count: pendingConnectionCount } = usePendingConnectionCount();
  const { myRequest, isLoading: verificationLoading } = useVerification();
  const { subscription, currentPlan, loading: subscriptionLoading } = useSubscription();
  const { startConversation } = useNewConversation();
  const { role, isVerified: userIsVerified, isProvider, tierColour: userTierColour, planType: userPlanType, loading: roleLoading } = useUserRole();
  const { 
    myInteractions, 
    fetchInteractions, 
    acceptInteraction,
    declineInteraction,
    confirmInteraction,
    completeInteraction,
    cancelInteraction,
    getGroupedInteractions,
    loading: interactionsLoading 
  } = useInteractionLifecycle();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeNetworkTab, setActiveNetworkTab] = useState<'discover' | 'mylist' | 'interactions'>('discover');
  const [showIntentSelection, setShowIntentSelection] = useState(false);
  const [showVerificationFlow, setShowVerificationFlow] = useState(false);
  const [showDirectoryPicker, setShowDirectoryPicker] = useState(false);
  const [selectedIntents, setSelectedIntents] = useState<string[]>([]);
  const [communitiesCount, setCommunitiesCount] = useState<number>(0);
  const [communitiesLoading, setCommunitiesLoading] = useState(true);
  const [messagingProviderId, setMessagingProviderId] = useState<string | null>(null);

  // Handle messaging a provider - create or find conversation and navigate
  const handleMessageProvider = async (providerId: string) => {
    if (messagingProviderId) return; // Prevent double-clicks
    setMessagingProviderId(providerId);
    
    try {
      const conversationId = await startConversation(providerId);
      if (conversationId) {
        navigate(`/messages?conversation=${conversationId}`);
      } else {
        toast.error('Could not start conversation');
      }
    } catch (err) {
      console.error('Error starting conversation:', err);
      toast.error('Failed to open conversation');
    } finally {
      setMessagingProviderId(null);
    }
  };

  // Toggle intent selection (multi-select)
  const handleIntentToggle = (intentId: string) => {
    setSelectedIntents(prev => 
      prev.includes(intentId) 
        ? prev.filter(id => id !== intentId)
        : [...prev, intentId]
    );
  };

  // Navigate to verification with selected intents
  const handleProceedToVerification = () => {
    if (selectedIntents.length === 0) return;
    const queryParam = selectedIntents.join(',');
    navigate(`/settings?view=verification&types=${queryParam}`);
  };

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('display_name, handle, avatar_url, cover_url, is_verified, user_type, email')
        .eq('id', user.id)
        .single();
      if (data) setProfile(data);
    }
    fetchProfile();
  }, [user]);

  // Fetch real communities count from community_memberships
  useEffect(() => {
    async function fetchCommunitiesCount() {
      if (!user) {
        setCommunitiesLoading(false);
        return;
      }
      try {
        const { count, error } = await supabase
          .from('community_memberships')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        if (error) throw error;
        setCommunitiesCount(count || 0);
      } catch (err) {
        console.error('Error fetching communities count:', err);
        setCommunitiesCount(0);
      } finally {
        setCommunitiesLoading(false);
      }
    }
    fetchCommunitiesCount();
  }, [user]);

  const connectionsCount = activeProviders.length + pendingProviders.length;
  const isVerified = profile?.is_verified;
  
  // Verification progress based on actual request
  const hasVerificationRequest = !!myRequest;
  const verificationStatus = myRequest?.status;
  const currentVerificationStep = getVerificationStepIndex(verificationStatus);
  const verificationInProgress = hasVerificationRequest && verificationStatus === 'pending';
  const verificationRejected = hasVerificationRequest && verificationStatus === 'rejected';

  // Plan and billing info
  const planDetails = PLAN_DETAILS.find(p => p.id === currentPlan);
  const monthlyPrice = planDetails?.monthlyPrice || 0;
  const billingPeriod = subscription?.billing_period;
  const periodStart = subscription?.current_period_start;
  const periodEnd = subscription?.current_period_end;
  
  // Extract ERA tier data from subscription (with type safety)
  const subscriptionData = subscription as any;
  const planType: PlanType = subscriptionData?.plan_type || 'free';
  const tierColour: EraTier | null = subscriptionData?.tier_colour || null;
  const amountDue: number = subscriptionData?.amount_due || 0;

  // Role-specific interaction data - derived from real interactions
  const userInteractionRole = isProvider ? 'provider' : 'client';
  const groupedInteractions = getGroupedInteractions(userInteractionRole as 'client' | 'provider');
  const pendingInteractionsCount = groupedInteractions.pending.length;
  const confirmedInteractionsCount = groupedInteractions.active.length;
  const subscriberCount = subscriptionData?.subscriber_count || 0;

  // Fetch interactions on mount
  useEffect(() => {
    if (user) {
      fetchInteractions();
    }
  }, [user, fetchInteractions]);

  // Default cover for visual appeal
  const coverImage = profile?.cover_url || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=400&fit=crop';

  return (
    <AppLayout showHeader={false}>
      <div className="min-h-dvh bg-background pb-nav-safe">
        
        {/* Hero Section with Cover - Matches Profile Page */}
        <motion.section
          className="relative w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Cover Image */}
          <div className="relative h-40 sm:h-48 overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
            <motion.img
              src={coverImage}
              alt=""
              className="w-full h-full object-cover opacity-60"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8 }}
            />
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-transparent h-16" />
            
            {/* Menu Button */}
            <motion.div
              className="absolute top-3 right-3 z-10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/50"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-popover border border-border">
                  <DropdownMenuItem className="gap-2" onClick={() => navigate('/creator-dashboard')}>
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2" onClick={() => navigate('/settings')}>
                    <Settings className="h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2" onClick={() => navigate('/transparency')}>
                    <ExternalLink className="h-4 w-4" />
                    About SelfERA
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          </div>

          {/* Profile Card Floating Over Cover */}
          <div className="px-4 -mt-20 relative z-10">
            <BrandSurface
              as={motion.div as any}
              className="p-5 shadow-2xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springGentle, delay: 0.1 }}
            >
              {/* Avatar + Info Row */}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  aria-label="View your profile"
                  className="flex-shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <CinematicAvatar
                    src={profile?.avatar_url || undefined}
                    alt={profile?.display_name || 'User'}
                    fallback={profile?.display_name?.[0] || 'U'}
                    size="md"
                    ring="gradient"
                  />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <h2 className="text-title font-semibold text-white truncate min-w-0">
                      {profile?.display_name || 'User'}
                    </h2>
                    {profile?.is_verified && (
                      <span className="flex-shrink-0">
                        <EraVerifiedTick size="sm" userEmail={profile?.email || undefined} />
                      </span>
                    )}
                  </div>
                  <p className="text-body text-white/55 truncate">
                    @{profile?.handle || 'user'}
                  </p>
                  <div className="mt-1.5">
                    <AccountTypeBadge type={(profile?.user_type as AccountType) || 'individual'} />
                  </div>
                </div>
              </div>

              {/* Account Status Button — full-width row */}
              <button
                type="button"
                onClick={() => navigate('/account')}
                aria-label="View account details"
                className="mt-3 w-full h-11 px-4 rounded-md border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] active:bg-white/[0.06] transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <BrandIcon icon={Shield} size={16} />
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Account Status</span>
                    <span className="text-sm font-medium text-white truncate">
                      {isVerified
                        ? 'ERA Verified · Active'
                        : planType && planType !== 'free'
                        ? `${planType.charAt(0).toUpperCase()}${planType.slice(1)} Plan`
                        : 'Free Account'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </button>

              {/* Stats Row — FIT pattern (see docs/SCALING.md) */}
              <div className="flex w-full items-stretch gap-0 mt-5 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  className="flex-1 min-w-0 flex flex-col items-center text-center py-2 px-1"
                  onClick={() => navigate('/community')}
                >
                  <div className="h-7 flex items-center justify-center mb-1.5">
                    <p className="text-headline font-bold text-white leading-none">
                      {communitiesLoading ? '—' : communitiesCount}
                    </p>
                  </div>
                  <p className="text-caption font-medium uppercase tracking-wider text-white/55 truncate w-full text-center">Waitlist</p>
                </button>
                <button
                  type="button"
                  className="flex-1 min-w-0 flex flex-col items-center text-center py-2 px-1 border-l border-white/[0.08]"
                  onClick={() => navigate('/directory')}
                >
                  <div className="h-7 flex items-center justify-center mb-1.5">
                    <p className="text-headline font-bold text-white leading-none">
                      {connectionsCount}
                    </p>
                  </div>
                  <p className="text-caption font-medium uppercase tracking-wider text-white/55 truncate w-full text-center">My List</p>
                </button>
                <button
                  type="button"
                  className="flex-1 min-w-0 flex flex-col items-center text-center py-2 px-1 relative border-l border-white/[0.08]"
                  onClick={() => navigate('/notifications')}
                >
                  <div className="h-7 flex items-center justify-center mb-1.5">
                    <p className="text-headline font-bold text-white leading-none">
                      {pendingConnectionCount || 0}
                    </p>
                  </div>
                  <p className="text-caption font-medium uppercase tracking-wider text-white/55 truncate w-full text-center">Pending</p>
                  {pendingConnectionCount > 0 && (
                    <span
                      className="absolute top-1 right-1/4 w-2 h-2 rounded-full"
                      style={{ backgroundColor: themePrimary }}
                    />
                  )}
                </button>
                <button
                  type="button"
                  className="flex-1 min-w-0 flex flex-col items-center text-center py-2 px-1 relative border-l border-white/[0.08]"
                  onClick={() => navigate('/notifications')}
                >
                  <div className="h-7 flex items-center justify-center mb-1.5">
                    <BrandIcon icon={Bell} size={20} />
                  </div>
                  <p className="text-caption font-medium uppercase tracking-wider text-white/55 truncate w-full text-center">Alerts</p>
                </button>
              </div>
            </BrandSurface>
          </div>
        </motion.section>

        {/* Sections */}
        <div className="flex flex-col">

        {/* MyERA Network Section */}
        <motion.section
          className="px-4 order-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.35 }}
        >
          <div className="mt-6 mb-3 flex items-center justify-between">
            <BrandSectionLabel>MYERA NETWORK</BrandSectionLabel>
            <button
              type="button"
              onClick={() => setShowDirectoryPicker(true)}
              className="h-7 px-2.5 rounded-full border border-primary/40 text-[11px] uppercase tracking-tight font-medium text-primary bg-transparent hover:bg-primary/10 inline-flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Add
            </button>
          </div>

          {/* Network Tabs — brand underline */}
          <div className="-mx-4 mb-4 px-3 border-b border-white/[0.08]">
            <BrandUnderlineTabs
              tabs={[
                { id: 'discover', label: 'Discover' },
                { id: 'mylist', label: 'My List' },
                { id: 'interactions', label: 'Interactions' },
              ]}
              value={activeNetworkTab}
              onChange={(id) => setActiveNetworkTab(id as typeof activeNetworkTab)}
              ariaLabel="MyERA network sections"
            />
          </div>

          <AnimatePresence mode="wait">
            {activeNetworkTab === 'discover' && (
              <motion.div
                key="discover-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Loading state */}
                {supportLinksLoading && (
                  <div className="flex items-center justify-center py-8">
                    <div
                      className="w-6 h-6 border-2 border-white/30 rounded-full animate-spin"
                      style={{ borderTopColor: themePrimary }}
                    />
                  </div>
                )}

                {/* Error state */}
                {!supportLinksLoading && supportLinksError && (
                  <motion.div 
                    className="rounded-2xl bg-card/50 border border-white/5 p-6 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <AlertCircle className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-body text-muted-foreground mb-3">Couldn't load support connections</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => refreshSupportLinks()}
                    >
                      Try again
                    </Button>
                  </motion.div>
                )}

                {/* Empty state */}
                {!supportLinksLoading && !supportLinksError && activeProviders.length === 0 && pendingProviders.length === 0 && (
                  <BrandSurface className="p-8">
                    <div className="text-center flex flex-col items-center">
                      <div className="mb-4">
                        <BrandIcon icon={Heart} size={24} />
                      </div>
                      <h3 className="text-white/85 text-body lowercase mb-2">
                        your support connections
                      </h3>
                      <p className="text-white/55 text-label leading-relaxed max-w-[260px] mx-auto mb-5">
                        find support when you're ready. connect with verified professionals on selfera.
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate('/directory')}
                        className="inline-flex items-center gap-2 bg-transparent border h-9 px-4 rounded-full text-label uppercase tracking-[0.1em]"
                        style={{ borderColor: themePrimary, color: themePrimary }}
                      >
                        <Compass className="w-3.5 h-3.5" />
                        Explore Directory
                      </button>
                    </div>
                  </BrandSurface>
                )}

                {/* List of providers */}
                {!supportLinksLoading && !supportLinksError && (activeProviders.length > 0 || pendingProviders.length > 0) && (
                  <div className="space-y-2">
                    {[...activeProviders, ...pendingProviders].map((link, index) => (
                      <motion.div
                        key={link.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-white/5"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ ...springGentle, delay: index * 0.05 }}
                      >
                        <div className="relative">
                          <CinematicAvatar
                            src={link.provider?.avatar_url || undefined}
                            alt={link.provider?.display_name || 'Provider'}
                            fallback={link.provider?.display_name?.[0] || 'P'}
                            size="md"
                            ring={link.status === 'active' ? 'primary' : 'muted'}
                          />
                          {link.status === 'active' && (
                            <span
                              className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: themePrimary }}
                            />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-body font-medium text-foreground truncate">
                            {link.provider?.display_name || 'Provider'}
                            </span>
                            {link.provider?.is_verified && <EraVerifiedTick size="sm" userEmail={link.provider?.email || undefined} />}
                          </div>
                          <p className="text-label text-muted-foreground truncate">
                            {link.organization_name || link.provider_role}
                          </p>
                        </div>

                        {link.status === 'pending' && (
                          <span className="shrink-0 text-[10px] uppercase tracking-[0.08em] font-medium px-2 py-0.5 rounded-full border border-white/15 text-white/55">
                            Pending
                          </span>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          disabled={messagingProviderId === link.provider_user_id}
                          onClick={() => handleMessageProvider(link.provider_user_id)}
                        >
                          {messagingProviderId === link.provider_user_id ? (
                            <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                          ) : (
                            <MessageCircle className="w-4 h-4" />
                          )}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeNetworkTab === 'mylist' && (
              <motion.div
                key="mylist-tab"
                initial={{ opacity: 0, x: 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <BrandSurface className="p-8">
                  <div className="text-center flex flex-col items-center">
                    <div className="mb-4">
                      <BrandIcon icon={Heart} size={24} />
                    </div>
                    <h3 className="text-white/85 text-body lowercase mb-2">
                      your saved connections
                    </h3>
                    <p className="text-white/55 text-label leading-relaxed max-w-[220px] mx-auto">
                      people and providers you've added to your personal list will appear here.
                    </p>
                  </div>
                </BrandSurface>
              </motion.div>
            )}

            {activeNetworkTab === 'interactions' && (
              <motion.div
                key="interactions"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {interactionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div
                      className="w-6 h-6 border-2 border-white/30 rounded-full animate-spin"
                      style={{ borderTopColor: themePrimary }}
                    />
                  </div>
                ) : (
                  <InteractionList
                    pending={groupedInteractions.pending}
                    active={groupedInteractions.active}
                    completed={groupedInteractions.completed}
                    cancelled={groupedInteractions.cancelled}
                    userRole={userInteractionRole as 'client' | 'provider'}
                    onAccept={isProvider ? acceptInteraction : undefined}
                    onDecline={isProvider ? declineInteraction : undefined}
                    onConfirm={!isProvider ? confirmInteraction : undefined}
                    onComplete={completeInteraction}
                    onCancel={cancelInteraction}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        </div>
        {/* /Sections wrapper */}

        {/* Footer - Softened */}
        <motion.footer
          className="px-6 py-8 mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-caption text-muted-foreground/50 leading-relaxed max-w-sm mx-auto tracking-wide">
            By using SelfERA, you agree to our community guidelines.
          </p>
        </motion.footer>

      </div>

      {/* Verification Flow Modal */}
      <AnimatePresence>
        {showVerificationFlow && (
          <motion.div
            className="fixed inset-0 z-50 bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="container max-w-lg mx-auto p-4 pt-safe">
              <VerificationFlow
                onBack={() => setShowVerificationFlow(false)}
                onComplete={() => setShowVerificationFlow(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verified Directory Picker */}
      <VerifiedDirectoryPicker
        open={showDirectoryPicker}
        onOpenChange={setShowDirectoryPicker}
        onAdd={() => refreshSupportLinks()}
      />
    </AppLayout>
  );
}

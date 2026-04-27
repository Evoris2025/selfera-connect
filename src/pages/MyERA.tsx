import { useEffect, useState } from 'react';
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
  BrandScreenTitle,
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
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
    accountType: 'individual' as const,
  },
  {
    id: 'professional',
    icon: Stethoscope,
    title: 'Professional',
    description: 'Licensed mental health practitioner',
    depth: 'Full verification',
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
    accountType: 'professional' as const,
  },
  {
    id: 'organization',
    icon: Building2,
    title: 'Organization',
    description: 'Mental health service or clinic',
    depth: 'Full verification',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    accountType: 'organization' as const,
  },
  {
    id: 'individual',
    icon: Heart,
    title: 'Individual',
    description: 'Looking for professional support',
    depth: 'Simple profile',
    gradient: 'from-rose-500 via-pink-500 to-red-500',
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
            <motion.div
              className="bg-card/80 backdrop-blur-xl border border-white/10 p-5 shadow-2xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springGentle, delay: 0.1 }}
            >
              {/* Avatar + Info Row */}
              <div className="flex items-center gap-4">
                <CinematicAvatar
                  src={profile?.avatar_url || undefined}
                  alt={profile?.display_name || 'User'}
                  fallback={profile?.display_name?.[0] || 'U'}
                  size="xl"
                  ring="gradient"
                  interactive
                  onClick={() => navigate('/profile')}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg font-semibold text-foreground truncate">
                      {profile?.display_name || 'User'}
                    </h1>
                    {profile?.is_verified && <EraVerifiedTick size="sm" userEmail={profile?.email || undefined} />}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    @{profile?.handle || 'user'}
                  </p>
                  <div className="mt-1.5">
                    <AccountTypeBadge type={(profile?.user_type as AccountType) || 'individual'} />
                  </div>
                </div>

                {/* Quick Action */}
                <Button 
                  size="sm" 
                  variant="secondary"
                  className="rounded-full h-9 px-4"
                  onClick={() => navigate('/profile')}
                >
                  View Profile
                </Button>
              </div>

              {/* Stats Row - Evenly Spaced Grid */}
              <div className="grid grid-cols-4 gap-0 mt-5 pt-4 border-t border-white/10">
                <button 
                  className="text-center group py-2"
                  onClick={() => navigate('/community')}
                >
                  <div className="h-7 flex items-center justify-center mb-1.5">
                    <p className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-none">
                      {communitiesLoading ? '—' : communitiesCount}
                    </p>
                  </div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Waitlist</p>
                </button>
                <button 
                  className="text-center group py-2 border-l border-white/10"
                  onClick={() => navigate('/directory')}
                >
                  <div className="h-7 flex items-center justify-center mb-1.5">
                    <p className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-none">
                      {connectionsCount}
                    </p>
                  </div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">My List</p>
                </button>
                <button 
                  className="text-center group relative py-2 border-l border-white/10"
                  onClick={() => navigate('/notifications')}
                >
                  <div className="h-7 flex items-center justify-center mb-1.5">
                    <p className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-none">
                      {pendingConnectionCount || 0}
                    </p>
                  </div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Pending</p>
                  {pendingConnectionCount > 0 && (
                    <span className="absolute top-1 right-1/4 w-2 h-2 rounded-full bg-rose-500" />
                  )}
                </button>
                <button 
                  className="text-center group relative py-2 border-l border-white/10"
                  onClick={() => navigate('/notifications')}
                >
                  <div className="h-7 flex items-center justify-center mb-1.5">
                    <Bell className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Alerts</p>
                </button>
              </div>
            </motion.div>
          </div>
        </motion.section>


        {/* Your Account Info Section */}
        <motion.section
          className="px-4 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.17 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4 tracking-tight">Your Account Info</h2>
          
          <div className="grid grid-cols-2 gap-4">
            {/* ERA Account Status Card - Left */}
            <EraAccountStatusCard
              planType={planType}
              tierColour={tierColour}
              status={subscription?.status || 'active'}
              currentPeriodEnd={periodEnd || null}
              amountDue={amountDue}
              isVerified={!!isVerified}
            />

            {/* Verification Card - Right */}
            <AnimatePresence mode="wait">
              {/* Not started verification */}
              {!isVerified && !hasVerificationRequest && !showIntentSelection && (
                <motion.div
                  key="verification-cta"
                  className="relative overflow-hidden bg-card/40 backdrop-blur-lg border border-white/[0.06] min-h-[180px] flex flex-col p-5"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ ...springGentle, delay: 0.19 }}
                >
                  <div className="relative flex flex-col flex-1">
                    {/* Header with icon and title */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground leading-tight">
                          Become ERA Verified
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          Build trust and connect with the right community.
                        </p>
                      </div>
                    </div>
                    
                    {/* Progress Steps - centered */}
                    <div className="flex items-center justify-center gap-2 my-auto py-2">
                      {verificationSteps.map((step, idx) => (
                        <div key={step.id} className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center bg-muted/10 border border-white/[0.08] text-muted-foreground">
                            <step.icon className="w-3 h-3" />
                          </div>
                          {idx < verificationSteps.length - 1 && (
                            <div className="w-6 h-px bg-white/10" />
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* CTA Button */}
                    <div className="mt-auto pt-2">
                      <Button
                        size="sm"
                        className="rounded-full h-9 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                        onClick={() => setShowVerificationFlow(true)}
                      >
                        Start Verification
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Verification in progress */}
              {!isVerified && verificationInProgress && (
                <motion.div
                  key="verification-progress"
                  className="relative overflow-hidden bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-card/40 backdrop-blur-lg border border-amber-500/20 min-h-[180px] flex flex-col"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ ...springGentle, delay: 0.19 }}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  
                  <div className="relative p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <motion.div 
                        className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Clock className="w-5 h-5 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">
                          In Progress
                        </h3>
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[9px]">
                          <Clock className="w-2 h-2 mr-0.5" />
                          Pending
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-3">
                      {myRequest?.account_type_requested} verification under review.
                    </p>
                    
                    {/* Animated Progress Steps */}
                    <div className="flex items-center gap-1.5 mb-2">
                      {verificationSteps.map((step, idx) => {
                        const isCompleted = idx < currentVerificationStep;
                        const isCurrent = idx === currentVerificationStep;
                        
                        return (
                          <div key={step.id} className="flex items-center gap-1.5">
                            <motion.div 
                              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                isCompleted 
                                  ? 'bg-emerald-500 text-white' 
                                  : isCurrent 
                                    ? 'bg-amber-500 text-white' 
                                    : 'bg-muted/20 text-muted-foreground'
                              }`}
                              animate={{ 
                                scale: isCurrent ? [1, 1.1, 1] : 1
                              }}
                              transition={{ 
                                duration: isCurrent ? 1.5 : 0.3, 
                                repeat: isCurrent ? Infinity : 0
                              }}
                            >
                              {isCompleted ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <step.icon className="w-3 h-3" />
                              )}
                            </motion.div>
                            {idx < verificationSteps.length - 1 && (
                              <div className={`w-6 h-0.5 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-muted/30'}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    <p className="text-[10px] text-muted-foreground mt-auto">
                      Submitted {myRequest?.created_at ? format(new Date(myRequest.created_at), 'MMM d') : '—'}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Verification rejected */}
              {!isVerified && verificationRejected && (
                <motion.div
                  key="verification-rejected"
                  className="relative overflow-hidden bg-gradient-to-br from-rose-500/20 via-red-500/10 to-card/40 backdrop-blur-lg border border-rose-500/20 min-h-[180px] flex flex-col"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ ...springGentle, delay: 0.19 }}
                >
                  <div className="relative p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">
                        Not Approved
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 flex-1">
                      {myRequest?.admin_notes || 'Your request was not approved.'}
                    </p>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="rounded-full h-8 w-full"
                      onClick={() => navigate('/settings?view=verification')}
                    >
                      Try Again
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Verified Status Card */}
              {isVerified && (
                <motion.div
                  key="verified-status"
                  className="relative overflow-hidden bg-gradient-to-br from-emerald-500/20 via-green-500/10 to-card/40 backdrop-blur-lg border border-emerald-500/20 min-h-[180px] flex flex-col"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ ...springGentle, delay: 0.19 }}
                >
                  <div className="relative p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <motion.div 
                        className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      >
                        <UserCheck className="w-5 h-5 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">
                          ERA Verified
                        </h3>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px]">
                          <Check className="w-2 h-2 mr-0.5" />
                          Active
                        </Badge>
                      </div>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1.5 mt-2">
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>Verified badge on profile & posts</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>Increased trust with the community</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>Priority in directory listings</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Intent Selection - Full Width when active */}
          <AnimatePresence mode="wait">
            {showIntentSelection && !isVerified && !hasVerificationRequest && (
              <motion.div
                key="intent-selection"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={springGentle}
                className="space-y-3 mt-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      What best describes you?
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      Select all that apply
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => {
                      setShowIntentSelection(false);
                      setSelectedIntents([]);
                    }}
                  >
                    Back
                  </Button>
                </div>
                
                {verificationIntents.map((intent, index) => {
                  const IconComponent = intent.icon;
                  const isSelected = selectedIntents.includes(intent.id);
                  
                  return (
                    <motion.button
                      key={intent.id}
                      className={`relative w-full overflow-hidden rounded-2xl text-left transition-all ${
                        isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...springGentle, delay: index * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleIntentToggle(intent.id)}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${intent.gradient} ${isSelected ? 'opacity-25' : 'opacity-15'}`} />
                      <div className="absolute inset-0 bg-card/70 backdrop-blur-sm" />
                      
                      <div className="relative p-4 flex items-center gap-4">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${intent.gradient}`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-sm font-semibold text-foreground">
                              {intent.title}
                            </h3>
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-white/10 text-muted-foreground">
                              {intent.depth}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {intent.description}
                          </p>
                        </div>

                        {/* Checkbox indicator */}
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-primary border-primary' 
                            : 'border-muted-foreground/30 bg-transparent'
                        }`}>
                          {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}

                {/* Continue Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: selectedIntents.length > 0 ? 1 : 0.5, y: 0 }}
                  transition={{ ...springGentle, delay: 0.25 }}
                  className="pt-2"
                >
                  <Button
                    className="w-full rounded-full"
                    disabled={selectedIntents.length === 0}
                    onClick={handleProceedToVerification}
                  >
                    Continue with {selectedIntents.length} selected
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* MyERA Network Section */}
        <motion.section
          className="mt-8 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.35 }}
        >
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground tracking-tight">MyERA Network</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary h-8 px-3"
                onClick={() => setShowDirectoryPicker(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          {/* Network Tabs - Clean Square Edge Style */}
          <div className="flex items-center bg-[hsl(240,10%,8%)] border border-border/30 mb-5">
            <button
              className={`relative flex-1 py-2.5 text-sm font-medium transition-all text-center ${
                activeNetworkTab === 'discover'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground/70'
              }`}
              onClick={() => setActiveNetworkTab('discover')}
            >
              {activeNetworkTab === 'discover' && (
                <motion.div
                  layoutId="networkTabIndicator"
                  className="absolute inset-0 border border-primary bg-primary/5"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">Discover</span>
            </button>
            <button
              className={`relative flex-1 py-2.5 text-sm font-medium transition-all text-center ${
                activeNetworkTab === 'mylist'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground/70'
              }`}
              onClick={() => setActiveNetworkTab('mylist')}
            >
              {activeNetworkTab === 'mylist' && (
                <motion.div
                  layoutId="networkTabIndicator"
                  className="absolute inset-0 border border-primary bg-primary/5"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">My List</span>
            </button>
            <button
              className={`relative flex-1 py-2.5 text-sm font-medium transition-all text-center ${
                activeNetworkTab === 'interactions'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground/70'
              }`}
              onClick={() => setActiveNetworkTab('interactions')}
            >
              {activeNetworkTab === 'interactions' && (
                <motion.div
                  layoutId="networkTabIndicator"
                  className="absolute inset-0 border border-primary bg-primary/5"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">Interactions</span>
              {activeNetworkTab !== 'interactions' && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </button>
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
                    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
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
                    <p className="text-sm text-muted-foreground mb-3">Couldn't load support connections</p>
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
                  <motion.div 
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500/10 via-pink-500/10 to-fuchsia-500/10 border border-white/5 p-6"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="text-center">
                      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                        <Heart className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-base font-medium text-foreground mb-1">
                        Your support connections
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 max-w-[240px] mx-auto">
                        Find support when you're ready. Connect with verified professionals on SelfERA.
                      </p>
                      <Button
                        className="rounded-full px-6"
                        onClick={() => navigate('/directory')}
                      >
                        <Compass className="w-4 h-4 mr-2" />
                        Explore Directory
                      </Button>
                    </div>
                  </motion.div>
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
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-foreground truncate">
                            {link.provider?.display_name || 'Provider'}
                            </span>
                            {link.provider?.is_verified && <EraVerifiedTick size="sm" userEmail={link.provider?.email || undefined} />}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {link.organization_name || link.provider_role}
                          </p>
                        </div>

                        {link.status === 'pending' && (
                          <Badge className="bg-amber-500/20 text-amber-400 text-[10px]">
                            Pending
                          </Badge>
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
                className="relative overflow-hidden rounded-2xl bg-card/30 border border-white/5 p-6"
              >
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-muted/30 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-medium text-foreground mb-1">
                    Your saved connections
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                    People and providers you've added to your personal list will appear here.
                  </p>
                </div>
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
                    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
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

        {/* Footer - Softened */}
        <motion.footer
          className="px-6 py-8 mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-[11px] text-muted-foreground/50 leading-relaxed max-w-sm mx-auto tracking-wide">
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

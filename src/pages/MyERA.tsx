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
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSupportLinks } from '@/hooks/useSupportLinks';
import { usePendingConnectionCount } from '@/hooks/usePendingConnectionCount';
import { useVerification } from '@/hooks/useVerification';
import { useSubscription, PLAN_DETAILS } from '@/hooks/useSubscription';
import { CinematicAvatar } from '@/components/ui/CinematicAvatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { AccountTypeBadge, AccountType } from '@/components/AccountTypeBadge';
import { AppLayout } from '@/components/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const springGentle = { type: "spring" as const, stiffness: 260, damping: 28 };

// Verification intent options
const verificationIntents = [
  {
    id: 'creator',
    icon: Sparkles,
    title: 'Creator / Influencer',
    description: 'Mental health & wellbeing content creator',
    depth: 'Light verification',
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
  },
  {
    id: 'professional',
    icon: Stethoscope,
    title: 'Practitioner',
    description: 'Licensed mental health professional',
    depth: 'Full verification',
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
  },
  {
    id: 'organization',
    icon: Building2,
    title: 'Organisation',
    description: 'Mental health service or clinic',
    depth: 'Full verification',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
  },
  {
    id: 'support_seeker',
    icon: Heart,
    title: 'Support Seeker',
    description: 'Looking for professional support',
    depth: 'Simple profile',
    gradient: 'from-rose-500 via-pink-500 to-red-500',
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
  const { activeProviders, pendingProviders } = useSupportLinks();
  const { count: pendingConnectionCount } = usePendingConnectionCount();
  const { myRequest, isLoading: verificationLoading } = useVerification();
  const { subscription, currentPlan, loading: subscriptionLoading } = useSubscription();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeNetworkTab, setActiveNetworkTab] = useState<'list' | 'interactions'>('list');
  const [showIntentSelection, setShowIntentSelection] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('display_name, handle, avatar_url, cover_url, is_verified, user_type')
        .eq('id', user.id)
        .single();
      if (data) setProfile(data);
    }
    fetchProfile();
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
              className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-background"
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
                <DropdownMenuContent align="end" className="w-48">
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
              className="bg-card/80 backdrop-blur-xl rounded-3xl border border-white/10 p-5 shadow-2xl"
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
                    {profile?.is_verified && <VerifiedBadge size="sm" />}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    @{profile?.handle || 'user'}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <AccountTypeBadge type={(profile?.user_type as AccountType) || 'individual'} />
                    {isVerified && (
                      <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                        <Shield className="w-2.5 h-2.5 mr-1" />
                        ERA Verified
                      </Badge>
                    )}
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

              {/* Stats Row */}
              <div className="flex items-center justify-around mt-5 pt-4 border-t border-white/10">
                <button 
                  className="text-center flex-1 group"
                  onClick={() => navigate('/community')}
                >
                  <p className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {connectionsCount}
                  </p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Connections</p>
                </button>
                <div className="w-px h-8 bg-white/10" />
                <button 
                  className="text-center flex-1 group relative"
                  onClick={() => navigate('/notifications')}
                >
                  <p className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {pendingConnectionCount || 0}
                  </p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Pending</p>
                  {pendingConnectionCount > 0 && (
                    <span className="absolute -top-1 right-1/4 w-2 h-2 rounded-full bg-rose-500" />
                  )}
                </button>
                <div className="w-px h-8 bg-white/10" />
                <button 
                  className="text-center flex-1 group"
                  onClick={() => navigate('/profile?tab=saved')}
                >
                  <p className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    —
                  </p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Saved</p>
                </button>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Quick Actions Grid */}
        <motion.section
          className="px-4 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.15 }}
        >
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: Bookmark, label: 'Saved', path: '/profile?tab=saved', color: 'from-blue-500 to-cyan-500' },
              { icon: Users, label: 'Community', path: '/community', color: 'from-purple-500 to-pink-500' },
              { icon: Compass, label: 'Directory', path: '/directory', color: 'from-orange-500 to-amber-500' },
              { icon: Bell, label: 'Alerts', path: '/notifications', color: 'from-green-500 to-emerald-500' },
            ].map((item, i) => (
              <motion.button
                key={item.label}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card/50 border border-white/5 hover:bg-card/80 transition-all"
                onClick={() => navigate(item.path)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springGentle, delay: 0.15 + i * 0.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Your Journey - Verification Focused */}
        <motion.section
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.2 }}
        >
          <div className="flex items-center justify-between px-4 mb-4">
            <h2 className="text-lg font-semibold text-foreground">Your Journey</h2>
          </div>

          <div className="px-4 space-y-4">
            <AnimatePresence mode="wait">
              {/* Not started verification */}
              {!isVerified && !hasVerificationRequest && !showIntentSelection && (
                <motion.div
                  key="verification-cta"
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-background border border-primary/20"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={springGentle}
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  
                  <div className="relative p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                        <Shield className="w-7 h-7 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          Become ERA Verified
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                          Unlock your full potential on SelfERA. Verification builds trust and connects you with the right community.
                        </p>
                        
                        {/* Static Progress Steps */}
                        <div className="flex items-center gap-2 mb-4">
                          {verificationSteps.map((step, idx) => (
                            <div key={step.id} className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center bg-muted/20 text-muted-foreground">
                                <step.icon className="w-3 h-3" />
                              </div>
                              {idx < verificationSteps.length - 1 && (
                                <div className="w-8 h-0.5 rounded-full bg-muted/30" />
                              )}
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Button
                            className="rounded-full"
                            onClick={() => setShowIntentSelection(true)}
                          >
                            Start Verification
                            <ArrowRight className="w-4 h-4 ml-1.5" />
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            Est. review: 2–5 days
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Verification in progress with animated steps */}
              {!isVerified && verificationInProgress && (
                <motion.div
                  key="verification-progress"
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-background border border-amber-500/20"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={springGentle}
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  
                  <div className="relative p-6">
                    <div className="flex items-start gap-4">
                      <motion.div 
                        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Clock className="w-7 h-7 text-white" />
                      </motion.div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-foreground">
                            Verification In Progress
                          </h3>
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[9px]">
                            <Clock className="w-2.5 h-2.5 mr-0.5" />
                            Pending
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                          Your request for {myRequest?.account_type_requested} verification is being reviewed.
                        </p>
                        
                        {/* Animated Progress Steps */}
                        <div className="flex items-center gap-2 mb-3">
                          {verificationSteps.map((step, idx) => {
                            const isCompleted = idx < currentVerificationStep;
                            const isCurrent = idx === currentVerificationStep;
                            
                            return (
                              <div key={step.id} className="flex items-center gap-2">
                                <motion.div 
                                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                    isCompleted 
                                      ? 'bg-emerald-500 text-white' 
                                      : isCurrent 
                                        ? 'bg-amber-500 text-white' 
                                        : 'bg-muted/20 text-muted-foreground'
                                  }`}
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ 
                                    scale: isCurrent ? [1, 1.1, 1] : 1, 
                                    opacity: 1 
                                  }}
                                  transition={{ 
                                    duration: isCurrent ? 1.5 : 0.3, 
                                    repeat: isCurrent ? Infinity : 0,
                                    delay: idx * 0.1 
                                  }}
                                >
                                  {isCompleted ? (
                                    <Check className="w-4 h-4" />
                                  ) : (
                                    <step.icon className="w-4 h-4" />
                                  )}
                                </motion.div>
                                {idx < verificationSteps.length - 1 && (
                                  <motion.div 
                                    className={`w-12 h-1 rounded-full ${
                                      isCompleted ? 'bg-emerald-500' : 'bg-muted/30'
                                    }`}
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ duration: 0.5, delay: idx * 0.2 }}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          Submitted on {myRequest?.created_at ? format(new Date(myRequest.created_at), 'MMM d, yyyy') : '—'} • Est. review: 2–5 days
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Verification rejected */}
              {!isVerified && verificationRejected && (
                <motion.div
                  key="verification-rejected"
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500/20 via-red-500/10 to-background border border-rose-500/20"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={springGentle}
                >
                  <div className="relative p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-foreground">
                          Verification Not Approved
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {myRequest?.admin_notes || 'Your request was not approved. You can submit a new request.'}
                      </p>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="rounded-full"
                        onClick={() => navigate('/settings?view=verification')}
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Intent Selection */}
              {showIntentSelection && !isVerified && !hasVerificationRequest && (
                <motion.div
                  key="intent-selection"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={springGentle}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">
                      What best describes you?
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => setShowIntentSelection(false)}
                    >
                      Back
                    </Button>
                  </div>
                  
                  {verificationIntents.map((intent, index) => {
                    const IconComponent = intent.icon;
                    return (
                      <motion.button
                        key={intent.id}
                        className="relative w-full overflow-hidden rounded-2xl text-left"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ ...springGentle, delay: index * 0.05 }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => navigate('/settings?view=verification')}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r ${intent.gradient} opacity-15`} />
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

                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}

              {/* Verified Status Card */}
              {isVerified && (
                <motion.div
                  key="verified-status"
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/20 via-green-500/10 to-background border border-emerald-500/20"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={springGentle}
                >
                  <div className="relative p-5 flex items-center gap-4">
                    <motion.div 
                      className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      <UserCheck className="w-6 h-6 text-white" />
                    </motion.div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-foreground">
                          ERA Verified
                        </h3>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px]">
                          <Check className="w-2.5 h-2.5 mr-0.5" />
                          Active
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Your verification is active. You're part of the trusted ERA community.
                      </p>
                    </div>

                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Account Type & Billing Cards - Under Journey */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {/* Account Type Card */}
              <motion.div
                className="relative overflow-hidden rounded-2xl bg-card/50 border border-white/5 p-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springGentle, delay: 0.25 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Account</p>
                    <p className="text-sm font-semibold text-foreground capitalize">
                      {profile?.user_type || 'Individual'}
                    </p>
                  </div>
                </div>
                <AccountTypeBadge type={(profile?.user_type as AccountType) || 'individual'} />
              </motion.div>

              {/* Billing Card */}
              <motion.div
                className="relative overflow-hidden rounded-2xl bg-card/50 border border-white/5 p-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springGentle, delay: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Plan</p>
                    <p className="text-sm font-semibold text-foreground capitalize">
                      {currentPlan}
                    </p>
                  </div>
                </div>
                
                {currentPlan === 'free' ? (
                  <p className="text-xs text-muted-foreground">No charges</p>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Amount due</span>
                      <span className="font-medium text-foreground">
                        ${billingPeriod === 'yearly' ? planDetails?.yearlyPrice : monthlyPrice}/{billingPeriod === 'yearly' ? 'yr' : 'mo'}
                      </span>
                    </div>
                    {periodStart && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
                        <Calendar className="w-3 h-3" />
                        <span>Last: {format(new Date(periodStart), 'MMM d')}</span>
                      </div>
                    )}
                    {periodEnd && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
                        <Calendar className="w-3 h-3" />
                        <span>Next: {format(new Date(periodEnd), 'MMM d')}</span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* MyERA Network */}
        <motion.section
          className="mt-8 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.35 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">MyERA Network</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary h-8 px-3"
              onClick={() => navigate('/directory')}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

          {/* Network Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/30 mb-4">
            <button
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                activeNetworkTab === 'list'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveNetworkTab('list')}
            >
              My List
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all relative ${
                activeNetworkTab === 'interactions'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveNetworkTab('interactions')}
            >
              Interactions
              <span className="absolute top-1.5 right-3 w-1.5 h-1.5 rounded-full bg-primary/50" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeNetworkTab === 'list' && (
              <motion.div
                key="my-list"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                {activeProviders.length === 0 && pendingProviders.length === 0 ? (
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
                ) : (
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
                          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-foreground truncate">
                              {link.provider?.display_name || 'Provider'}
                            </span>
                            {link.provider?.is_verified && <VerifiedBadge size="sm" />}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {link.provider_role}
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
                          onClick={() => navigate('/messages')}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeNetworkTab === 'interactions' && (
              <motion.div
                key="interactions"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="relative overflow-hidden rounded-2xl bg-card/30 border border-white/5 p-6"
              >
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-muted/30 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-medium text-foreground mb-1">
                    Recent interactions
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                    Your conversations and connection requests will appear here.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Footer - Softened */}
        <motion.footer
          className="px-6 py-8 mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-[10px] text-muted-foreground/50 leading-relaxed max-w-sm mx-auto">
            SelfERA is a wellbeing platform, not a clinical service. For emergencies, please contact local crisis services. 
            By using SelfERA, you agree to our community guidelines.
          </p>
        </motion.footer>

      </div>
    </AppLayout>
  );
}

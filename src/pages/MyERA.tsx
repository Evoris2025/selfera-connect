import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Settings, 
  Shield, 
  MessageCircle, 
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
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPathways, PathwayType } from '@/hooks/useUserPathways';
import { useSupportLinks } from '@/hooks/useSupportLinks';
import { usePendingConnectionCount } from '@/hooks/usePendingConnectionCount';
import { CinematicAvatar } from '@/components/ui/CinematicAvatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { AccountTypeBadge, AccountType } from '@/components/AccountTypeBadge';
import { AppLayout } from '@/components/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { CurrentPlanCard } from '@/components/pricing';
import { supabase } from '@/integrations/supabase/client';

const springGentle = { type: "spring" as const, stiffness: 200, damping: 25 };

const pathwayIcons: Record<PathwayType, React.ReactNode> = {
  creator: <Sparkles className="w-5 h-5" />,
  professional: <Stethoscope className="w-5 h-5" />,
  organization: <Building2 className="w-5 h-5" />,
  support_seeker: <Heart className="w-5 h-5" />,
};

const pathwayGradients: Record<PathwayType, string> = {
  creator: 'from-amber-500/20 via-orange-500/20 to-rose-500/20',
  professional: 'from-blue-500/20 via-cyan-500/20 to-teal-500/20',
  organization: 'from-violet-500/20 via-purple-500/20 to-indigo-500/20',
  support_seeker: 'from-rose-500/20 via-pink-500/20 to-fuchsia-500/20',
};

const pathwayAccents: Record<PathwayType, string> = {
  creator: 'text-amber-400',
  professional: 'text-cyan-400',
  organization: 'text-violet-400',
  support_seeker: 'text-pink-400',
};

interface UserProfile {
  display_name: string | null;
  handle: string | null;
  avatar_url: string | null;
  is_verified: boolean | null;
  user_type: string | null;
}

export default function MyERA() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getPathwaysWithInfo, startPathway } = useUserPathways();
  const { activeProviders, pendingProviders } = useSupportLinks();
  const { count: pendingConnectionCount } = usePendingConnectionCount();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('display_name, handle, avatar_url, is_verified, user_type')
        .eq('id', user.id)
        .single();
      if (data) setProfile(data);
    }
    fetchProfile();
  }, [user]);

  const pathways = getPathwaysWithInfo();
  const completedCount = pathways.filter(p => p.status === 'completed').length;
  const inProgressCount = pathways.filter(p => p.status === 'in_progress').length;
  const connectionsCount = activeProviders.length + pendingProviders.length;

  // Check if user is a verified provider (can access provider dashboard)
  const isVerifiedProvider = profile?.is_verified && 
    (profile?.user_type === 'professional' || profile?.user_type === 'organization');

  const handlePathwayAction = (pathway: typeof pathways[0]) => {
    if (pathway.type === 'professional') {
      navigate('/settings?view=verification');
    } else if (pathway.type === 'support_seeker') {
      navigate('/directory');
    } else if (pathway.status === 'available') {
      startPathway(pathway.type);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return (
        <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
          <Check className="w-2.5 h-2.5 mr-1" />
          Complete
        </Badge>
      );
    }
    if (status === 'in_progress') {
      return (
        <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
          <Clock className="w-2.5 h-2.5 mr-1" />
          Active
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-muted-foreground text-[10px]">
        Available
      </Badge>
    );
  };

  // Quick access shortcuts
  const quickAccess = [
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Bookmark, label: 'Saved', path: '/profile?tab=saved' },
    { icon: Users, label: 'Communities', path: '/community' },
    { icon: Compass, label: 'Directory', path: '/directory' },
  ];

  return (
    <AppLayout showHeader={false}>
      <div className="min-h-screen bg-background pb-nav-safe">
        {/* Identity Header */}
        <motion.header 
          className="relative px-4 pt-8 pb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springGentle}
        >
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
                <h1 className="text-xl font-semibold text-foreground truncate">
                  {profile?.display_name || 'User'}
                </h1>
                {profile?.is_verified && <VerifiedBadge size="sm" />}
                {/* Placeholder for future ERA Verified badge */}
              </div>
              
              <p className="text-sm text-muted-foreground truncate">
                @{profile?.handle || 'user'}
              </p>
              
              <div className="flex items-center gap-2 mt-2">
                <AccountTypeBadge 
                  type={(profile?.user_type as AccountType) || 'individual'} 
                />
              </div>
            </div>
          </div>
        </motion.header>

        {/* Hero Status Card (Placeholder) */}
        <motion.section
          className="px-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.05 }}
        >
          <GlassCard variant="floating" className="p-5 border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-accent/20">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-medium text-foreground">ERA Account Status</h2>
                <p className="text-xs text-muted-foreground">Your ERA account status will appear here</p>
              </div>
            </div>
            
            {/* Placeholder skeleton indicators */}
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-20 rounded-full bg-muted/30 animate-pulse" />
              <div className="h-6 w-16 rounded-full bg-muted/20 animate-pulse" />
            </div>
            
            <Button 
              className="w-full rounded-xl"
              onClick={() => navigate('/settings?view=verification')}
            >
              {isVerifiedProvider ? 'View Status' : 'Get Verified'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </GlassCard>
        </motion.section>

        {/* Quick Access Strip */}
        <motion.section
          className="px-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.1 }}
        >
          <div className="flex items-center justify-between gap-2">
            {quickAccess.map((item, index) => (
              <motion.button
                key={item.label}
                className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl glass-subtle hover:bg-white/5 transition-colors"
                onClick={() => navigate(item.path)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springGentle, delay: 0.1 + index * 0.03 }}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Your Journey Section */}
        <motion.section
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.15 }}
        >
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-base font-semibold text-foreground">Your Journey</h2>
            {inProgressCount > 0 && (
              <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                {inProgressCount} active
              </Badge>
            )}
          </div>

          <div className="px-4 space-y-3">
            {pathways.map((pathway, index) => (
              <motion.button
                key={pathway.type}
                className={`
                  relative w-full p-4 rounded-2xl text-left
                  bg-gradient-to-r ${pathwayGradients[pathway.type]}
                  border border-white/10 backdrop-blur-sm
                  transition-all duration-200
                `}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...springGentle, delay: 0.15 + index * 0.05 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handlePathwayAction(pathway)}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-black/20 ${pathwayAccents[pathway.type]}`}>
                    {pathwayIcons[pathway.type]}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-medium text-foreground truncate">
                        {pathway.title}
                      </h3>
                      {getStatusBadge(pathway.status)}
                    </div>
                    
                    {/* Static progress placeholder */}
                    <div className="mt-2 h-1 w-full rounded-full bg-white/10 overflow-hidden">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${
                          pathway.status === 'completed' 
                            ? 'from-emerald-500 to-emerald-400 w-full' 
                            : pathway.status === 'in_progress' 
                            ? 'from-amber-500 to-amber-400 w-1/2' 
                            : 'from-muted to-muted w-0'
                        }`} 
                      />
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      {pathway.status === 'completed' 
                        ? 'Journey complete' 
                        : pathway.status === 'in_progress' 
                        ? 'Continue your path' 
                        : 'Start when ready'}
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-3" />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Support Connections Section */}
        <motion.section
          className="px-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground">Your Support Connections</h2>
            {connectionsCount > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                {connectionsCount}
              </Badge>
            )}
          </div>

          {activeProviders.length === 0 && pendingProviders.length === 0 ? (
            <GlassCard variant="subtle" className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-rose-500/20 to-pink-500/20">
                <Heart className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">
                No connections yet
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Find support when you're ready
              </p>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => navigate('/directory')}
              >
                <Compass className="w-4 h-4 mr-2" />
                Browse Directory
              </Button>
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {[...activeProviders, ...pendingProviders].map((link, index) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...springGentle, delay: 0.2 + index * 0.05 }}
                >
                  <GlassCard variant="subtle" className="p-3">
                    <div className="flex items-center gap-3">
                      <CinematicAvatar
                        src={link.provider?.avatar_url || undefined}
                        alt={link.provider?.display_name || 'Provider'}
                        fallback={link.provider?.display_name?.[0] || 'P'}
                        size="md"
                        ring={link.status === 'active' ? 'primary' : 'muted'}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-foreground truncate">
                            {link.provider?.display_name || 'Provider'}
                          </span>
                          {link.provider?.is_verified && <VerifiedBadge size="sm" />}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {link.provider_role}
                          {link.organization_name && ` • ${link.organization_name}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {link.status === 'pending' && (
                          <Badge variant="secondary" className="text-[10px] bg-amber-500/20 text-amber-400">
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
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Plan & Billing Section (Compressed) */}
        <motion.section
          className="px-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.25 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-muted-foreground">Plan & Billing</h2>
          </div>
          
          <div className="opacity-80 hover:opacity-100 transition-opacity">
            <CurrentPlanCard />
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          className="px-4 pb-8 pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...springGentle, delay: 0.3 }}
        >
          <div className="text-center space-y-2">
            <p className="text-[11px] text-muted-foreground/50 leading-relaxed">
              SelfERA connects you with wellbeing content and verified support.
              This is not a crisis service or medical advice platform.
            </p>
            <button 
              className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors"
              onClick={() => navigate('/transparency')}
            >
              Learn more about our approach
            </button>
          </div>
        </motion.footer>
      </div>
    </AppLayout>
  );
}

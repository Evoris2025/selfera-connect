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
  ExternalLink,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPathways, PathwayType } from '@/hooks/useUserPathways';
import { useSupportLinks } from '@/hooks/useSupportLinks';
import { usePendingConnectionCount } from '@/hooks/usePendingConnectionCount';
import { useNotifications } from '@/hooks/useNotifications';
import { CinematicAvatar } from '@/components/ui/CinematicAvatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { AccountTypeBadge, AccountType } from '@/components/AccountTypeBadge';
import { MobileNav } from '@/components/MobileNav';
import { CurrentPlanCard } from '@/components/pricing';
import { supabase } from '@/integrations/supabase/client';

const springGentle = { type: "spring" as const, stiffness: 200, damping: 25 };

const pathwayIcons: Record<PathwayType, React.ReactNode> = {
  creator: <Sparkles className="w-6 h-6" />,
  professional: <Stethoscope className="w-6 h-6" />,
  organization: <Building2 className="w-6 h-6" />,
  support_seeker: <Heart className="w-6 h-6" />,
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
  const { unreadCount: notificationCount } = useNotifications();
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
        <div className="flex items-center gap-1 text-xs text-emerald-400">
          <Check className="w-3 h-3" />
          <span>Completed</span>
        </div>
      );
    }
    if (status === 'in_progress') {
      return (
        <div className="flex items-center gap-1 text-xs text-amber-400">
          <Clock className="w-3 h-3" />
          <span>In Progress</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Section */}
      <motion.div 
        className="relative px-4 pt-6 pb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springGentle}
      >
        <div className="flex items-start gap-4">
          <CinematicAvatar
            src={profile?.avatar_url || undefined}
            alt={profile?.display_name || 'User'}
            fallback={profile?.display_name?.[0] || 'U'}
            size="xl"
            ring="gradient"
            interactive
            onClick={() => navigate('/profile')}
          />
          
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold text-foreground truncate">
                {profile?.display_name || 'User'}
              </h1>
              {profile?.is_verified && <VerifiedBadge size="sm" />}
            </div>
            
            <p className="text-sm text-muted-foreground truncate">
              @{profile?.handle || 'user'}
            </p>
            
            <div className="mt-2">
              <AccountTypeBadge 
                type={(profile?.user_type as AccountType) || 'individual'} 
              />
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-around mt-6 py-4 rounded-2xl glass-subtle">
          <button 
            className="flex flex-col items-center gap-1 px-4"
            onClick={() => navigate('/community')}
          >
            <span className="text-lg font-semibold text-foreground">0</span>
            <span className="text-xs text-muted-foreground">Communities</span>
          </button>
          <div className="w-px h-8 bg-border/50" />
          <div className="flex flex-col items-center gap-1 px-4">
            <span className="text-lg font-semibold text-foreground">{completedCount}</span>
            <span className="text-xs text-muted-foreground">Completed</span>
          </div>
          <div className="w-px h-8 bg-border/50" />
          <div className="flex flex-col items-center gap-1 px-4">
            <span className="text-lg font-semibold text-foreground">{connectionsCount}</span>
            <span className="text-xs text-muted-foreground">Connections</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 rounded-xl min-w-[80px]"
            onClick={() => navigate('/profile')}
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 rounded-xl min-w-[80px]"
            onClick={() => navigate('/settings')}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          {isVerifiedProvider ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 rounded-xl min-w-[80px] relative"
              onClick={() => navigate('/provider-dashboard')}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
              {pendingConnectionCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-medium rounded-full bg-primary text-primary-foreground">
                  {pendingConnectionCount > 99 ? '99+' : pendingConnectionCount}
                </span>
              )}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 rounded-xl min-w-[80px]"
              onClick={() => navigate('/settings?view=verification')}
            >
              <Shield className="w-4 h-4 mr-2" />
              Verify
            </Button>
          )}
        </div>
      </motion.div>

      {/* Pathways Section */}
      <motion.section
        className="mt-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.1 }}
      >
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="text-base font-semibold text-foreground">Your Pathways</h2>
          {inProgressCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {inProgressCount} active
            </Badge>
          )}
        </div>

        <ScrollArea className="w-full">
          <div className="flex gap-3 px-4 pb-4">
            {pathways.map((pathway, index) => (
              <motion.button
                key={pathway.type}
                className={`
                  relative flex-shrink-0 w-44 p-4 rounded-2xl text-left
                  bg-gradient-to-br ${pathwayGradients[pathway.type]}
                  border border-white/10 backdrop-blur-sm
                  transition-all duration-200
                `}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...springGentle, delay: 0.1 + index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePathwayAction(pathway)}
              >
                <div className={`${pathwayAccents[pathway.type]} mb-3`}>
                  {pathwayIcons[pathway.type]}
                </div>
                
                <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-1">
                  {pathway.title}
                </h3>
                
                <div className="mt-2">
                  {getStatusBadge(pathway.status)}
                  {pathway.status === 'available' && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>Start</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </motion.section>

      {/* Support Connections */}
      <motion.section
        className="mt-6 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">Support Network</h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => navigate('/directory')}
          >
            Find help
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>

        {activeProviders.length === 0 && pendingProviders.length === 0 ? (
          <motion.div
            className="p-6 rounded-2xl glass-subtle text-center"
            whileHover={{ scale: 1.01 }}
          >
            <Heart className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground mb-3">
              No connections yet
            </p>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => navigate('/directory')}
            >
              Browse Directory
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {[...activeProviders, ...pendingProviders].map((link, index) => (
              <motion.div
                key={link.id}
                className="flex items-center gap-3 p-3 rounded-2xl glass-subtle"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...springGentle, delay: 0.2 + index * 0.05 }}
              >
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
                    <Badge variant="secondary" className="text-xs">
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
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      {/* Plan & Billing Section */}
      <motion.section
        className="mt-8 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.25 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">Plan & Billing</h2>
        </div>

        <CurrentPlanCard />
      </motion.section>

      {/* About Footer */}
      <motion.footer
        className="mt-10 px-4 pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...springGentle, delay: 0.3 }}
      >
        <div className="text-center space-y-3">
          <p className="text-xs text-muted-foreground/70">
            SelfERA connects you with wellbeing content and verified support.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/50">
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3" />
              Not a crisis service
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3" />
              Not medical advice
            </span>
          </div>
        </div>
      </motion.footer>

      {/* Bottom Navigation */}
      <MobileNav 
        notificationCount={notificationCount}
        pendingConnectionCount={pendingConnectionCount}
      />
    </div>
  );
}

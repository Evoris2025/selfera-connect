import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Star,
  Zap,
  Crown,
  ArrowRight,
  Plus,
  MessageCircle,
  MoreVertical,
  Share2,
  ExternalLink,
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
import { CurrentPlanCard } from '@/components/pricing';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const springGentle = { type: "spring" as const, stiffness: 260, damping: 28 };

const pathwayMeta: Record<PathwayType, { icon: React.ElementType; gradient: string; accent: string }> = {
  creator: { 
    icon: Sparkles, 
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
    accent: 'text-amber-400',
  },
  professional: { 
    icon: Stethoscope, 
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
    accent: 'text-cyan-400',
  },
  organization: { 
    icon: Building2, 
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    accent: 'text-violet-400',
  },
  support_seeker: { 
    icon: Heart, 
    gradient: 'from-rose-500 via-pink-500 to-red-500',
    accent: 'text-rose-400',
  },
};

interface UserProfile {
  display_name: string | null;
  handle: string | null;
  avatar_url: string | null;
  cover_url: string | null;
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
        .select('display_name, handle, avatar_url, cover_url, is_verified, user_type')
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

              {/* Stats Row */}
              <div className="flex items-center justify-around mt-5 pt-4 border-t border-white/10">
                <button 
                  className="text-center flex-1 group"
                  onClick={() => navigate('/community')}
                >
                  <p className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {completedCount}
                  </p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Complete</p>
                </button>
                <div className="w-px h-8 bg-white/10" />
                <button 
                  className="text-center flex-1 group"
                  onClick={() => navigate('/directory')}
                >
                  <p className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {connectionsCount}
                  </p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Connections</p>
                </button>
                <div className="w-px h-8 bg-white/10" />
                <button 
                  className="text-center flex-1 group"
                  onClick={() => navigate('/notifications')}
                >
                  <p className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {pendingConnectionCount || 0}
                  </p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Pending</p>
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

        {/* Your Journey - Full Width Cards */}
        <motion.section
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.2 }}
        >
          <div className="flex items-center justify-between px-4 mb-4">
            <h2 className="text-lg font-semibold text-foreground">Your Journey</h2>
            {inProgressCount > 0 && (
              <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                {inProgressCount} in progress
              </Badge>
            )}
          </div>

          <div className="px-4 space-y-3">
            {pathways.map((pathway, index) => {
              const meta = pathwayMeta[pathway.type];
              const IconComponent = meta.icon;
              
              return (
                <motion.button
                  key={pathway.type}
                  className="relative w-full overflow-hidden rounded-2xl text-left"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...springGentle, delay: 0.2 + index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handlePathwayAction(pathway)}
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${meta.gradient} opacity-20`} />
                  <div className="absolute inset-0 bg-card/60 backdrop-blur-sm" />
                  
                  {/* Content */}
                  <div className="relative p-4 flex items-center gap-4">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${meta.gradient}`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-foreground">
                          {pathway.title}
                        </h3>
                        {pathway.status === 'completed' && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px] px-1.5">
                            <Check className="w-2.5 h-2.5 mr-0.5" />
                            Done
                          </Badge>
                        )}
                        {pathway.status === 'in_progress' && (
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[9px] px-1.5">
                            <Clock className="w-2.5 h-2.5 mr-0.5" />
                            Active
                          </Badge>
                        )}
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                        <motion.div 
                          className={`h-full rounded-full bg-gradient-to-r ${meta.gradient}`}
                          initial={{ width: 0 }}
                          animate={{ 
                            width: pathway.status === 'completed' ? '100%' : 
                                   pathway.status === 'in_progress' ? '50%' : '0%' 
                          }}
                          transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                        />
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.section>

        {/* Support Network */}
        <motion.section
          className="mt-8 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.25 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Support Network</h2>
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
                  Build your support circle
                </h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-[240px] mx-auto">
                  Connect with verified professionals and organizations ready to help
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
                  transition={{ ...springGentle, delay: 0.25 + index * 0.05 }}
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
        </motion.section>

        {/* ERA Status Card */}
        <motion.section
          className="mt-8 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.3 }}
        >
          <motion.div
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-background border border-primary/20 p-5"
            whileHover={{ scale: 1.01 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-base font-semibold text-foreground mb-1">
                  ERA Account Status
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {isVerifiedProvider 
                    ? 'Your verification is active' 
                    : 'Complete verification to unlock more features'}
                </p>
                
                <Button
                  size="sm"
                  className="rounded-full"
                  onClick={() => navigate('/settings?view=verification')}
                >
                  {isVerifiedProvider ? 'View Status' : 'Get Verified'}
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Subscription Status - Compact */}
        <motion.section
          className="mt-6 px-4 pb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.35 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-muted-foreground">Your Plan</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-muted-foreground h-7"
              onClick={() => navigate('/transparency')}
            >
              Learn more
            </Button>
          </div>
          <div className="opacity-80">
            <CurrentPlanCard />
          </div>
        </motion.section>

      </div>
    </AppLayout>
  );
}

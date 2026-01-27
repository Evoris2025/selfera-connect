import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Plus, Bell, MessageCircle, User, LayoutDashboard, Heart, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  icon: typeof Home;
  href: string;
  label: string;
  isCreate?: boolean;
  isProfile?: boolean;
  hasBadge?: boolean;
  isCrisis?: boolean;
}

interface DesktopNavProps {
  notificationCount?: number;
  messageCount?: number;
  followRequestCount?: number;
  pendingConnectionCount?: number;
}

// Cinematic spring configs - slower, more intentional
const springSmooth = { type: 'spring' as const, stiffness: 300, damping: 30 };
const springGentle = { type: 'spring' as const, stiffness: 200, damping: 25 };

export function DesktopNav({ 
  notificationCount = 0, 
  messageCount = 0, 
  followRequestCount = 0,
  pendingConnectionCount = 0,
}: DesktopNavProps) {
  const location = useLocation();
  

  // Combine notification count with follow request count and pending connections for total badge
  const totalNotificationBadge = notificationCount + followRequestCount + pendingConnectionCount;
  // Primary nav items
  const navItems: NavItem[] = [
    { icon: Home, href: '/feed', label: 'Home' },
    { icon: Compass, href: '/explore', label: 'Explore' },
    { icon: LayoutDashboard, href: '/my-era', label: 'MyERA' },
    { icon: Plus, href: '#create', isCreate: true, label: 'Create' },
    { icon: Bell, href: '/notifications', label: 'Notifications', hasBadge: totalNotificationBadge > 0 },
    { icon: MessageCircle, href: '/messages', label: 'Messages', hasBadge: messageCount > 0 },
    { icon: User, href: '/profile', label: 'Profile', isProfile: true },
  ];

  // Secondary nav items (at bottom)
  const secondaryItems: NavItem[] = [
    { icon: Heart, href: '/crisis-support', label: 'Crisis Support', isCrisis: true },
    { icon: Settings, href: '/settings', label: 'Settings' },
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/feed') return location.pathname === '/feed';
    if (href === '/explore') return location.pathname.startsWith('/explore');
    if (href === '/my-era') return location.pathname === '/my-era';
    if (href === '/profile') return location.pathname.startsWith('/profile');
    if (href === '/notifications') return location.pathname === '/notifications';
    if (href === '/messages') return location.pathname === '/messages';
    if (href === '/crisis-support') return location.pathname === '/crisis-support';
    if (href === '/settings') return location.pathname === '/settings';
    return location.pathname === href;
  };

  const renderNavItem = (item: NavItem, index: number) => {
    const isActive = isActiveRoute(item.href);

    // Create button - navigates to /studio
    if (item.isCreate) {
      return (
        <TooltipProvider key={`create-${index}`} delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/studio">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  transition={springSmooth}
                  className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors duration-300"
                  aria-label="Create post"
                >
                  <motion.div
                    whileHover={{ rotate: 90 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <item.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  </motion.div>
                </motion.div>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={12}>
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // Profile with subtle ring
    if (item.isProfile) {
      return (
        <TooltipProvider key={item.href} delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to={item.href}>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  transition={springSmooth}
                  className={cn(
                    'relative flex items-center justify-center p-3',
                    isActive ? 'text-foreground' : 'text-muted-foreground/50'
                  )}
                >
                  <motion.div 
                    className={cn(
                      "relative",
                      isActive && "after:absolute after:inset-0 after:rounded-full after:ring-2 after:ring-primary/60 after:ring-offset-2 after:ring-offset-background"
                    )}
                    animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                    transition={springGentle}
                  >
                    <item.icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 1.8 : 1.2} />
                  </motion.div>
                </motion.div>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={12}>
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // Crisis support - special styling
    if (item.isCrisis) {
      return (
        <TooltipProvider key={item.href} delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to={item.href}>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  transition={springSmooth}
                  className={cn(
                    'relative flex items-center justify-center p-3',
                    isActive ? 'text-crisis' : 'text-crisis/50 hover:text-crisis/80'
                  )}
                >
                  <motion.div
                    animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                    transition={springGentle}
                  >
                    <item.icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 1.8 : 1.2} />
                  </motion.div>
                </motion.div>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={12}>
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // Standard nav items - thin, elegant
    return (
      <TooltipProvider key={item.href} delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to={item.href}>
              <motion.div
                whileTap={{ scale: 0.9 }}
                transition={springSmooth}
                className={cn(
                  'relative flex items-center justify-center p-3',
                  isActive ? 'text-foreground' : 'text-muted-foreground/50 hover:text-muted-foreground'
                )}
              >
                <motion.div
                  animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                  transition={springGentle}
                >
                  <item.icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 1.8 : 1.2} />
                </motion.div>
                
                {/* Subtle active indicator */}
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={springGentle}
                      className="absolute -right-1 w-1 h-1 rounded-full bg-primary"
                    />
                  )}
                </AnimatePresence>
                
                {/* Badge - minimal pulse */}
                <AnimatePresence mode="popLayout">
                  {item.hasBadge && (
                    <motion.span 
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={springGentle}
                      className="absolute top-2 right-2 w-2 h-2 rounded-full bg-crisis/80"
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12}>
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <nav className="fixed left-0 top-0 bottom-0 z-50 w-16">
      {/* Glass background */}
      <div className="absolute inset-0 glass-heavy border-r border-border/50" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/40 to-transparent pointer-events-none" />
      
      <div className="relative flex flex-col h-full py-6">
        {/* Primary nav items - centered */}
        <div className="flex-1 flex flex-col items-center justify-center gap-1">
          {navItems.map((item, index) => renderNavItem(item, index))}
        </div>

        {/* Divider */}
        <div className="mx-4 my-2 border-t border-border/30" />

        {/* Secondary items - at bottom */}
        <div className="flex flex-col items-center gap-1">
          {secondaryItems.map((item, index) => renderNavItem(item, index))}
        </div>
      </div>
    </nav>
  );
}

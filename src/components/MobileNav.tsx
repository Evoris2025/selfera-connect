import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Plus, Bell, MessageCircle, User, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  icon: typeof Home;
  href: string;
  label: string;
  isCreate?: boolean;
  isProfile?: boolean;
  hasBadge?: boolean;
}

interface MobileNavProps {
  onCreateClick?: () => void;
  notificationCount?: number;
  messageCount?: number;
  followRequestCount?: number;
  pendingConnectionCount?: number;
}

// Cinematic spring configs - slower, more intentional
const springSmooth = { type: 'spring' as const, stiffness: 300, damping: 30 };
const springGentle = { type: 'spring' as const, stiffness: 200, damping: 25 };

export function MobileNav({ 
  onCreateClick, 
  notificationCount = 0, 
  messageCount = 0, 
  followRequestCount = 0,
  pendingConnectionCount = 0,
}: MobileNavProps) {
  const location = useLocation();

  // Combine notification count with follow request count and pending connections for total badge
  const totalNotificationBadge = notificationCount + followRequestCount + pendingConnectionCount;

  // 6 nav items: Home, Explore, MyERA, Create (center), Notifications, Messages, Profile
  // Order: Home, Explore, MyERA, Create, Notifications, Messages, Profile
  const navItems: NavItem[] = [
    { icon: Home, href: '/feed', label: 'Home' },
    { icon: Compass, href: '/explore', label: 'Explore' },
    { icon: LayoutDashboard, href: '/my-era', label: 'MyERA' },
    { icon: Plus, href: '#create', isCreate: true, label: 'Create' },
    { icon: Bell, href: '/notifications', label: 'Notifications', hasBadge: totalNotificationBadge > 0 },
    { icon: MessageCircle, href: '/messages', label: 'Messages', hasBadge: messageCount > 0 },
    { icon: User, href: '/profile', label: 'Profile', isProfile: true },
  ];

  return (
    <nav className="w-full">
      {/* Safe area spacer */}
      <div className="pb-safe">
        {/* Glass background with gradient fade */}
        <div className="absolute inset-0 glass-heavy rounded-t-3xl border-t border-border/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent rounded-t-3xl pointer-events-none" />
        
        <div className="relative flex items-center justify-around h-[72px] max-w-lg mx-auto px-4">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.href || 
            (item.href === '/feed' && location.pathname === '/feed') ||
            (item.href === '/explore' && location.pathname.startsWith('/explore')) ||
            (item.href === '/my-era' && location.pathname === '/my-era') ||
            (item.href === '/profile' && location.pathname.startsWith('/profile')) ||
            (item.href === '/notifications' && location.pathname === '/notifications') ||
            (item.href === '/messages' && location.pathname === '/messages');
          
          // Create button - special styling
          if (item.isCreate) {
            return (
              <motion.button
                key={index}
                onClick={onCreateClick}
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
              </motion.button>
            );
          }

          // Profile with subtle ring
          if (item.isProfile) {
            return (
              <Link key={item.href} to={item.href}>
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
            );
          }
          
          // Standard nav items - thin, elegant
          return (
            <Link key={item.href} to={item.href}>
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
                      className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
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
          );
        })}
        </div>
      </div>
    </nav>
  );
}

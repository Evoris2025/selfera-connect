import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Plus, Bell, MessageCircle, User, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/hooks/useNotifications';
import { useFollowRequests } from '@/hooks/useFollowRequests';

interface NavItem {
  icon: typeof Home;
  href: string;
  label: string;
  isCreate?: boolean;
  isProfile?: boolean;
  hasBadge?: boolean;
}

const springSmooth = { type: 'spring' as const, stiffness: 300, damping: 30 };
const springGentle = { type: 'spring' as const, stiffness: 200, damping: 25 };

/**
 * DesktopLeftRail — the mobile/tablet glass nav treatment placed on the left
 * edge for desktop. Same icons, active states, and create button as MobileNav.
 */
export function DesktopLeftRail() {
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const { pendingCount } = useFollowRequests();

  const totalNotificationBadge = (unreadCount ?? 0) + (pendingCount ?? 0);

  const navItems: NavItem[] = [
    { icon: Home, href: '/feed', label: 'Home' },
    { icon: Compass, href: '/explore', label: 'Explore' },
    { icon: LayoutDashboard, href: '/my-era', label: 'MyERA' },
    { icon: Plus, href: '#create', isCreate: true, label: 'Create' },
    { icon: Bell, href: '/notifications', label: 'Notifications', hasBadge: totalNotificationBadge > 0 },
    { icon: MessageCircle, href: '/messages', label: 'Messages' },
    { icon: User, href: '/profile', label: 'Profile', isProfile: true },
  ];

  return (
    <nav className="hidden lg:flex fixed left-0 inset-y-0 z-50 h-dvh w-18">
      <div className="relative h-full w-full">
        <div className="absolute inset-0 glass-heavy rounded-r-3xl border-r border-border/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 to-transparent rounded-r-3xl pointer-events-none" />

        <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 py-8">
          {navItems.map((item, index) => {
            const isActive =
              location.pathname === item.href ||
              (item.href === '/explore' && location.pathname.startsWith('/explore')) ||
              (item.href === '/profile' && location.pathname.startsWith('/profile'));

            if (item.isCreate) {
              return (
                <Link key={`create-${index}`} to="/studio" aria-label="Create">
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    transition={springSmooth}
                    className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors duration-300"
                  >
                    <motion.div
                      whileHover={{ rotate: 90 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <item.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                    </motion.div>
                  </motion.div>
                </Link>
              );
            }

            if (item.isProfile) {
              return (
                <Link key={item.href} to={item.href} aria-label={item.label}>
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
                        'relative',
                        isActive &&
                          'after:absolute after:inset-0 after:rounded-full after:ring-2 after:ring-primary/60 after:ring-offset-2 after:ring-offset-background'
                      )}
                      animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                      transition={springGentle}
                    >
                      <item.icon className="h-5 w-5" strokeWidth={isActive ? 1.8 : 1.2} />
                    </motion.div>
                  </motion.div>
                </Link>
              );
            }

            return (
              <Link key={item.href} to={item.href} aria-label={item.label}>
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
                    <item.icon className="h-5 w-5" strokeWidth={isActive ? 1.8 : 1.2} />
                  </motion.div>

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

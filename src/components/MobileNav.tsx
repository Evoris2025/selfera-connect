import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Plus, Bell, MessageCircle, User } from 'lucide-react';
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
}

// Spring configs for dopamine-driven motion
const springPop = { type: 'spring' as const, stiffness: 500, damping: 15 };
const springBounce = { type: 'spring' as const, stiffness: 600, damping: 12 };
const springSnap = { type: 'spring' as const, stiffness: 700, damping: 20 };

export function MobileNav({ onCreateClick, notificationCount = 0, messageCount = 0 }: MobileNavProps) {
  const location = useLocation();

  const navItems: NavItem[] = [
    { icon: Home, href: '/feed', label: 'Home' },
    { icon: Compass, href: '/explore', label: 'Explore' },
    { icon: Plus, href: '#create', isCreate: true, label: 'Create' },
    { icon: Bell, href: '/notifications', label: 'Notifications', hasBadge: notificationCount > 0 },
    { icon: MessageCircle, href: '/messages', label: 'Messages', hasBadge: messageCount > 0 },
    { icon: User, href: '/profile', label: 'Profile', isProfile: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-3">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.href || 
            (item.href === '/feed' && location.pathname === '/feed') ||
            (item.href === '/explore' && location.pathname.startsWith('/explore')) ||
            (item.href === '/profile' && location.pathname.startsWith('/profile')) ||
            (item.href === '/notifications' && location.pathname === '/notifications') ||
            (item.href === '/messages' && location.pathname === '/messages');
          
          if (item.isCreate) {
            return (
              <motion.button
                key={index}
                onClick={onCreateClick}
                whileTap={{ scale: 0.85 }}
                transition={springSnap}
                className={cn(
                  'relative flex items-center justify-center p-3 rounded-2xl',
                  'text-muted-foreground/60 hover:text-muted-foreground'
                )}
                aria-label="Create post"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  transition={springPop}
                >
                  <item.icon className="h-6 w-6" strokeWidth={2} />
                </motion.div>
              </motion.button>
            );
          }

          // Profile with ring state
          if (item.isProfile) {
            return (
              <Link key={item.href} to={item.href}>
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  transition={springSnap}
                  className={cn(
                    'relative flex items-center justify-center p-3 rounded-2xl',
                    isActive ? 'text-foreground' : 'text-muted-foreground/60 hover:text-muted-foreground'
                  )}
                >
                  <motion.div 
                    className={cn(
                      "p-0.5 rounded-full",
                      isActive && "ring-2 ring-primary/80 ring-offset-2 ring-offset-background"
                    )}
                    animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                    transition={springBounce}
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      <item.icon className="h-5 w-5" strokeWidth={isActive ? 2 : 1.5} />
                    </div>
                  </motion.div>
                </motion.div>
              </Link>
            );
          }
          
          return (
            <Link key={item.href} to={item.href}>
              <motion.div
                whileTap={{ scale: 0.85 }}
                transition={springSnap}
                className={cn(
                  'relative flex items-center justify-center p-3 rounded-2xl',
                  isActive ? 'text-foreground' : 'text-muted-foreground/60 hover:text-muted-foreground'
                )}
              >
                <motion.div
                  animate={isActive ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                  transition={springBounce}
                >
                  <item.icon className="h-5 w-5" strokeWidth={isActive ? 2 : 1.5} />
                </motion.div>
                
                {/* Dopamine badge with pop + pulse */}
                <AnimatePresence mode="popLayout">
                  {item.hasBadge && (
                    <motion.span 
                      initial={{ opacity: 0, scale: 0, y: 5 }}
                      animate={{ 
                        opacity: 1, 
                        scale: [0, 1.4, 1],
                        y: 0
                      }}
                      exit={{ opacity: 0, scale: 0, y: -5 }}
                      transition={springPop}
                      className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50"
                    >
                      {/* Pulse ring */}
                      <motion.span
                        className="absolute inset-0 rounded-full bg-rose-500"
                        animate={{ scale: [1, 2, 2], opacity: [0.6, 0, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                      />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Plus, Bell, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

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

export function MobileNav({ onCreateClick, notificationCount = 0, messageCount = 0 }: MobileNavProps) {
  const location = useLocation();
  const [isCreatePressed, setIsCreatePressed] = useState(false);

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
            (item.href === '/profile' && location.pathname.startsWith('/profile'));
          
          if (item.isCreate) {
            return (
              <button
                key={index}
                onClick={onCreateClick}
                onMouseDown={() => setIsCreatePressed(true)}
                onMouseUp={() => setIsCreatePressed(false)}
                onMouseLeave={() => setIsCreatePressed(false)}
                onTouchStart={() => setIsCreatePressed(true)}
                onTouchEnd={() => setIsCreatePressed(false)}
                className="flex items-center justify-center -mt-4 relative"
                aria-label="Create post"
              >
                {/* Soft radial glow */}
                <div className="absolute inset-0 w-11 h-11 rounded-full bg-primary/20 blur-xl scale-150" />
                
                <motion.div 
                  animate={isCreatePressed ? { scale: 0.95 } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={cn(
                    "relative w-11 h-11 rounded-full flex items-center justify-center shadow-lg shadow-primary/20",
                    isCreatePressed ? "gradient-brand" : "bg-gradient-to-br from-primary/90 to-primary"
                  )}
                >
                  <item.icon className="h-5 w-5 text-white" strokeWidth={2} />
                </motion.div>
              </button>
            );
          }

          // Profile with ring state
          if (item.isProfile) {
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'relative flex items-center justify-center p-3 rounded-2xl transition-all duration-200',
                  isActive 
                    ? 'text-foreground' 
                    : 'text-muted-foreground/60 hover:text-muted-foreground'
                )}
              >
                <div className={cn(
                  "p-0.5 rounded-full transition-all duration-200",
                  isActive && "ring-2 ring-primary/80 ring-offset-2 ring-offset-background"
                )}>
                  <div className="w-5 h-5 flex items-center justify-center">
                    <item.icon className="h-5 w-5" strokeWidth={isActive ? 2 : 1.5} />
                  </div>
                </div>
              </Link>
            );
          }
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'relative flex items-center justify-center p-3 rounded-2xl transition-all duration-200',
                isActive 
                  ? 'text-foreground' 
                  : 'text-muted-foreground/60 hover:text-muted-foreground'
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={isActive ? 2 : 1.5} />
              
              {/* Soft dot badge */}
              <AnimatePresence>
                {item.hasBadge && (
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary/90"
                  />
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

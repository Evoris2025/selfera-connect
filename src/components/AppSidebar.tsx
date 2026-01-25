import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Plus, Bell, MessageCircle, User, LayoutDashboard, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandMark } from './BrandMark';
import { CrisisWidget } from './CrisisWidget';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  icon: typeof Home;
  href: string;
  label: string;
  isCreate?: boolean;
  isProfile?: boolean;
  hasBadge?: boolean;
}

interface AppSidebarProps {
  onCreateClick?: () => void;
  notificationCount?: number;
  messageCount?: number;
  followRequestCount?: number;
  pendingConnectionCount?: number;
}

// Cinematic spring configs
const springSmooth = { type: 'spring' as const, stiffness: 300, damping: 30 };
const springGentle = { type: 'spring' as const, stiffness: 200, damping: 25 };

// Slide-in animation variants
const sidebarVariants = {
  hidden: { x: -280, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: springGentle
  }
};

export function AppSidebar({ 
  onCreateClick, 
  notificationCount = 0, 
  messageCount = 0, 
  followRequestCount = 0,
  pendingConnectionCount = 0,
}: AppSidebarProps) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });

  // Persist collapse state and dispatch event for layout sync
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(isCollapsed));
    window.dispatchEvent(new CustomEvent('sidebar-toggle'));
  }, [isCollapsed]);

  const totalNotificationBadge = notificationCount + followRequestCount + pendingConnectionCount;

  const navItems: NavItem[] = [
    { icon: Home, href: '/feed', label: 'Home' },
    { icon: Compass, href: '/explore', label: 'Explore' },
    { icon: LayoutDashboard, href: '/my-era', label: 'MyERA' },
    { icon: Plus, href: '#create', isCreate: true, label: 'Create' },
    { icon: Bell, href: '/notifications', label: 'Notifications', hasBadge: totalNotificationBadge > 0 },
    { icon: MessageCircle, href: '/messages', label: 'Messages', hasBadge: messageCount > 0 },
    { icon: User, href: '/profile', label: 'Profile', isProfile: true },
  ];

  const secondaryItems: NavItem[] = [
    { icon: Settings, href: '/settings', label: 'Settings' },
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/feed') return location.pathname === '/feed';
    if (href === '/explore') return location.pathname.startsWith('/explore');
    if (href === '/my-era') return location.pathname === '/my-era';
    if (href === '/profile') return location.pathname.startsWith('/profile');
    if (href === '/notifications') return location.pathname === '/notifications';
    if (href === '/messages') return location.pathname === '/messages';
    if (href === '/settings') return location.pathname === '/settings';
    return location.pathname === href;
  };

  const renderNavItem = (item: NavItem, index: number) => {
    const isActive = isActiveRoute(item.href);
    const IconComponent = item.icon;

    const itemContent = (
      <motion.div
        variants={itemVariants}
        whileTap={{ scale: 0.95 }}
        transition={springSmooth}
        className={cn(
          'relative flex items-center rounded-xl transition-colors duration-200',
          isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5',
          item.isCreate 
            ? 'bg-primary/10 hover:bg-primary/20 text-primary'
            : isActive 
              ? 'bg-primary/10 text-foreground' 
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
          item.isProfile && isActive && !isCollapsed && "after:absolute after:left-3 after:top-1/2 after:-translate-y-1/2 after:w-6 after:h-6 after:rounded-full after:ring-2 after:ring-primary/60"
        )}
      >
        <motion.div
          className={cn("flex items-center justify-center", isCollapsed ? "w-5" : "w-6")}
          animate={isActive ? { scale: 1.05 } : { scale: 1 }}
          transition={springGentle}
          whileHover={item.isCreate ? { rotate: 90 } : undefined}
        >
          <IconComponent className="h-5 w-5" strokeWidth={isActive ? 1.8 : 1.2} />
        </motion.div>
        
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className={cn("text-sm whitespace-nowrap overflow-hidden", isActive && "font-medium")}
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
        
        {/* Badge */}
        <AnimatePresence mode="popLayout">
          {item.hasBadge && (
            <motion.span 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={springGentle}
              className={cn(
                "w-2 h-2 rounded-full bg-crisis/80",
                isCollapsed ? "absolute top-1 right-1" : "absolute right-3 top-1/2 -translate-y-1/2"
              )}
            />
          )}
        </AnimatePresence>
      </motion.div>
    );

    const wrappedContent = isCollapsed ? (
      <Tooltip>
        <TooltipTrigger asChild>
          {item.isCreate ? (
            <button onClick={onCreateClick} className="w-full" aria-label={item.label}>
              {itemContent}
            </button>
          ) : (
            <Link to={item.href} className="block">
              {itemContent}
            </Link>
          )}
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {item.label}
        </TooltipContent>
      </Tooltip>
    ) : (
      item.isCreate ? (
        <button onClick={onCreateClick} className="w-full" aria-label={item.label}>
          {itemContent}
        </button>
      ) : (
        <Link to={item.href} className="block">
          {itemContent}
        </Link>
      )
    );

    return <div key={item.href + index}>{wrappedContent}</div>;
  };

  return (
    <motion.aside
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
      className={cn(
        "fixed left-0 top-0 bottom-0 flex flex-col bg-background border-r border-border/50 z-40 transition-[width] duration-300 ease-out",
        isCollapsed ? "w-16" : "w-60 lg:w-64"
      )}
    >
      {/* Logo & Toggle */}
      <div className="h-16 flex items-center justify-between px-3 border-b border-border/30">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Link to="/feed">
                <BrandMark className="h-9 w-[140px]" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={cn(
            "p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors",
            isCollapsed && "mx-auto"
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.div>
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        <motion.div className="space-y-1" variants={sidebarVariants}>
          {navItems.map((item, index) => renderNavItem(item, index))}
        </motion.div>

        {/* Separator */}
        <div className="my-4 h-px bg-border/50 mx-1" />

        {/* Secondary Items */}
        <motion.div className="space-y-1" variants={sidebarVariants}>
          {secondaryItems.map((item, index) => renderNavItem(item, index))}
        </motion.div>
      </nav>

      {/* Crisis Widget - only show when expanded */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="px-3 pb-4 overflow-hidden"
          >
            <CrisisWidget />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}

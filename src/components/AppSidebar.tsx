import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Plus, Bell, MessageCircle, User, LayoutDashboard, Settings, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandMark } from './BrandMark';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  icon: typeof Home;
  href: string;
  label: string;
  isCreate?: boolean;
  isProfile?: boolean;
  hasBadge?: boolean;
  isCrisis?: boolean;
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

// Default collapse delay in ms (can be overridden via settings)
const DEFAULT_COLLAPSE_DELAY = 300;

export function AppSidebar({ 
  onCreateClick, 
  notificationCount = 0, 
  messageCount = 0, 
  followRequestCount = 0,
  pendingConnectionCount = 0,
}: AppSidebarProps) {
  const location = useLocation();
  const collapseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Start collapsed by default, expand on hover
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showKeyboardFeedback, setShowKeyboardFeedback] = useState(false);
  const [collapseDelay, setCollapseDelay] = useState(DEFAULT_COLLAPSE_DELAY);
  
  // Effective collapsed state - collapsed unless hovered or pinned
  const isCollapsed = !isPinned && !isHovered;

  // Load collapse delay from settings
  useEffect(() => {
    const savedDelay = localStorage.getItem('sidebar-collapse-delay');
    if (savedDelay) {
      setCollapseDelay(parseInt(savedDelay, 10));
    }
    
    // Listen for settings changes
    const handleDelayChange = () => {
      const newDelay = localStorage.getItem('sidebar-collapse-delay');
      if (newDelay) {
        setCollapseDelay(parseInt(newDelay, 10));
      }
    };
    window.addEventListener('sidebar-delay-change', handleDelayChange);
    return () => window.removeEventListener('sidebar-delay-change', handleDelayChange);
  }, []);

  // Handle mouse enter - expand immediately
  const handleMouseEnter = useCallback(() => {
    // Clear any pending collapse
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current);
      collapseTimeoutRef.current = null;
    }
    setIsHovered(true);
  }, []);

  // Handle mouse leave - delay collapse using configurable delay
  const handleMouseLeave = useCallback(() => {
    collapseTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, collapseDelay);
  }, [collapseDelay]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current);
      }
    };
  }, []);

  // Persist pin state
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-pinned');
    if (saved === 'true') {
      setIsPinned(true);
    }
  }, []);

  // Sync pin state to storage and dispatch event
  useEffect(() => {
    localStorage.setItem('sidebar-pinned', String(isPinned));
    localStorage.setItem('sidebar-collapsed', String(!isPinned && !isHovered));
    window.dispatchEvent(new CustomEvent('sidebar-toggle'));
  }, [isPinned, isHovered]);

  // Keyboard shortcut: Cmd/Ctrl + B to toggle pin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setIsPinned(prev => !prev);
        
        // Show visual feedback
        setShowKeyboardFeedback(true);
        setTimeout(() => setShowKeyboardFeedback(false), 400);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    { icon: Heart, href: '/crisis-support', label: 'Find Support', isCrisis: true },
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
          item.isCrisis
            ? 'bg-crisis/10 hover:bg-crisis/20 text-crisis'
            : item.isCreate 
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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "fixed left-0 top-0 bottom-0 flex flex-col bg-background border-r z-40 transition-all duration-300 ease-out",
        isCollapsed ? "w-16" : "w-60 lg:w-64",
        isPinned 
          ? "border-primary/40 shadow-[0_0_15px_-3px_hsl(var(--primary)/0.3)]" 
          : "border-border/50"
      )}
    >
      {/* Keyboard shortcut visual feedback overlay */}
      <AnimatePresence>
        {showKeyboardFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-primary/10 pointer-events-none z-50 rounded-r-xl"
          />
        )}
      </AnimatePresence>

      {/* Logo - only show full brand when expanded, minimal when collapsed */}
      <div className="h-16 flex items-center justify-center px-3 border-b border-border/30">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Link to="/feed">
                <BrandMark className="h-9 w-[140px]" />
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="icon"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="w-8 h-8"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Navigation - centered vertically */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto flex flex-col justify-center">
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


      {/* Pin indicator - subtle hint at bottom */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-3 pb-3 text-center"
          >
            <button
              onClick={() => setIsPinned(!isPinned)}
              className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              {isPinned ? 'Unpin sidebar' : 'Pin sidebar'} <span className="opacity-50">(⌘B)</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}

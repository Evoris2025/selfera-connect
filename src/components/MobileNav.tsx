import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Plus, Bell, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: typeof Home;
  href: string;
  label: string;
  isCreate?: boolean;
  badge?: number;
}

interface MobileNavProps {
  onCreateClick?: () => void;
  notificationCount?: number;
  messageCount?: number;
}

export function MobileNav({ onCreateClick, notificationCount = 3, messageCount = 2 }: MobileNavProps) {
  const location = useLocation();

  const navItems: NavItem[] = [
    { icon: Home, href: '/feed', label: 'Home' },
    { icon: Compass, href: '/explore', label: 'Explore' },
    { icon: Plus, href: '#create', isCreate: true, label: 'Create' },
    { icon: Bell, href: '/notifications', label: 'Notifications', badge: notificationCount },
    { icon: MessageCircle, href: '/messages', label: 'Messages', badge: messageCount },
    { icon: User, href: '/profile', label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-safe">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-2">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.href || 
            (item.href === '/feed' && location.pathname === '/feed') ||
            (item.href === '/explore' && location.pathname.startsWith('/explore'));
          
          if (item.isCreate) {
            return (
              <button
                key={index}
                onClick={onCreateClick}
                className="flex items-center justify-center -mt-6"
                aria-label="Create post"
              >
                <div className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-transform">
                  <item.icon className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
              </button>
            );
          }
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'relative flex items-center justify-center p-2.5 rounded-xl transition-colors',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-rose-500 rounded-full px-1">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

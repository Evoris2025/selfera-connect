import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Plus, Play, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, href: '/feed', label: 'Home' },
  { icon: Compass, href: '/explore', label: 'Explore' },
  { icon: Plus, href: '#create', isCreate: true, label: 'Create' },
  { icon: Play, href: '/videos', label: 'Videos' },
  { icon: User, href: '/profile', label: 'Profile' },
];

interface MobileNavProps {
  onCreateClick?: () => void;
}

export function MobileNav({ onCreateClick }: MobileNavProps) {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-safe">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-4">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.href || 
            (item.href === '/feed' && location.pathname === '/feed');
          
          if (item.isCreate) {
            return (
              <button
                key={index}
                onClick={onCreateClick}
                className="flex items-center justify-center -mt-6"
                aria-label="Create post"
              >
                <div className="w-14 h-14 rounded-full gradient-brand flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-transform">
                  <item.icon className="h-7 w-7 text-white" strokeWidth={2.5} />
                </div>
              </button>
            );
          }
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center justify-center p-3 rounded-xl transition-colors',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

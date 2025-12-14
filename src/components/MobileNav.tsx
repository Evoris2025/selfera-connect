import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Search, PlusSquare, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'nav.home', href: '/feed' },
  { icon: Search, label: 'nav.explore', href: '/search' },
  { icon: PlusSquare, label: 'nav.createPost', href: '/feed?create=true', isCreate: true },
  { icon: Bell, label: 'nav.notifications', href: '/notifications' },
  { icon: User, label: 'nav.profile', href: '/profile' },
];

export function MobileNav() {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href === '/feed' && location.pathname === '/feed');
          
          if (item.isCreate) {
            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center justify-center -mt-4"
              >
                <div className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                  <item.icon className="h-6 w-6 text-white" />
                </div>
              </Link>
            );
          }
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors min-w-[60px]',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-[10px] font-medium">{t(item.label)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

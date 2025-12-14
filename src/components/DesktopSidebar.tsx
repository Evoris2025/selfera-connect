import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  Search, 
  Bell, 
  User, 
  Heart,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CrisisWidget } from './CrisisWidget';
import logo from '@/assets/logo.jpg';

const mainNavItems = [
  { icon: Home, label: 'nav.home', href: '/feed' },
  { icon: Search, label: 'nav.explore', href: '/search' },
  { icon: Heart, label: 'nav.directory', href: '/directory' },
  { icon: Bell, label: 'nav.notifications', href: '/notifications' },
  { icon: User, label: 'nav.profile', href: '/profile' },
];

const secondaryNavItems = [
  { icon: Settings, label: 'nav.settings', href: '/settings' },
];

export function DesktopSidebar() {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-border bg-sidebar p-4">
      <div className="flex-1">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1 mb-8 px-3">
          <img src={logo} alt="SelfERA" className="w-10 h-10 rounded-xl object-cover" />
          <span className="text-xl font-bold gradient-brand-text"><span className="tracking-[0.02em]">Self</span><span className="tracking-[0.04em]">ERA</span></span>
        </Link>

        {/* Main Nav */}
        <nav className="space-y-1">
          {mainNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{t(item.label)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="my-6 border-t border-border" />

        {/* Secondary Nav */}
        <nav className="space-y-1">
          {secondaryNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{t(item.label)}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Crisis Widget */}
      <div className="mt-auto">
        <CrisisWidget />
      </div>
    </aside>
  );
}

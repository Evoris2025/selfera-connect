import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  Compass, 
  Play,
  Bell, 
  User, 
  Heart,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CrisisWidget } from './CrisisWidget';
import logo from '@/assets/selfera-logo.png';

const mainNavItems = [
  { icon: Home, label: 'nav.home', href: '/feed' },
  { icon: Compass, label: 'nav.explore', href: '/explore' },
  { icon: Play, label: 'Videos', href: '/videos' },
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
        {/* Logo - Brand-scale sizing */}
        <Link to="/" className="flex items-center h-[56px] mb-6 px-3">
          <img 
            src={logo} 
            alt="SelfERA" 
            className="h-[36px] lg:h-[40px] w-auto object-contain" 
          />
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

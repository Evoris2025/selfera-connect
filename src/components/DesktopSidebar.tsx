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
        <Link to="/" className="flex items-center gap-3 mb-8 px-3 group">
          <div className="relative">
            <img src={logo} alt="SelfERA" className="w-11 h-11 rounded-2xl object-cover ring-1 ring-foreground/10" />
            <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="font-logo text-xl tracking-[0.2em] uppercase logo-glow">
            <span className="font-light text-foreground/50">SELF</span>
            <span className="font-semibold gradient-brand-text">ERA</span>
          </span>
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

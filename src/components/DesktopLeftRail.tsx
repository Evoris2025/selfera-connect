import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home,
  Compass,
  LayoutDashboard,
  Bell,
  MessageCircle,
  User,
  Plus,
  Settings,
  LogOut,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CinematicAvatar } from '@/components/ui/CinematicAvatar';
import { useCurrentUserAvatar } from '@/hooks/useCurrentUserAvatar';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * DesktopLeftRail — floating expandable pill nav (lg+).
 *
 * Collapsed (~64px): icon-only vertical pill, vertically centered,
 * floats over content via position: fixed.
 * Expanded (on hover, ~240px): labels slide in, Create reveals text,
 * avatar reveals name + "View profile".
 *
 * Below lg: display:none — MobileNav (bottom) takes over.
 */

interface NavItem {
  icon: typeof Home;
  href: string;
  labelKey: string;
  fallbackLabel: string;
  showBadge?: boolean;
}

const navItems: NavItem[] = [
  { icon: Home, href: '/feed', labelKey: 'nav.home', fallbackLabel: 'Home' },
  { icon: Compass, href: '/explore', labelKey: 'nav.explore', fallbackLabel: 'Explore' },
  { icon: LayoutDashboard, href: '/my-era', labelKey: 'nav.myera', fallbackLabel: 'MyERA' },
  { icon: Bell, href: '/notifications', labelKey: 'nav.notifications', fallbackLabel: 'Notifications', showBadge: true },
  { icon: MessageCircle, href: '/messages', labelKey: 'nav.messages', fallbackLabel: 'Messages' },
  { icon: User, href: '/profile', labelKey: 'nav.profile', fallbackLabel: 'Profile' },
];

export function DesktopLeftRail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const { avatarUrl, displayName } = useCurrentUserAvatar();
  const { unreadCount } = useNotifications();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (href: string) =>
    location.pathname === href ||
    (href === '/explore' && location.pathname.startsWith('/explore')) ||
    (href === '/profile' && location.pathname.startsWith('/profile'));

  return (
    <aside
      className={cn(
        'group hidden lg:flex fixed left-4 top-1/2 -translate-y-1/2 z-50',
        'flex-col gap-1 p-2',
        'w-16 hover:w-[220px]',
        'rounded-3xl border border-white/10 bg-background/70 backdrop-blur-md shadow-2xl',
        'transition-[width] duration-300 ease-in-out overflow-hidden',
      )}
    >
      {/* Primary nav */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const showBadge = item.showBadge && unreadCount > 0;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'relative flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors',
                active
                  ? 'bg-emerald-500/15 text-emerald-300'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
              )}
            >
              <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                <item.icon className="h-5 w-5" strokeWidth={active ? 2 : 1.6} />
                {showBadge && (
                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-background" />
                )}
              </span>
              <span
                className={cn(
                  'whitespace-nowrap text-body font-medium',
                  'opacity-0 -translate-x-2 transition-all duration-300 ease-in-out',
                  'group-hover:opacity-100 group-hover:translate-x-0',
                )}
              >
                {t(item.labelKey, item.fallbackLabel)}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Create */}
      <motion.div whileTap={{ scale: 0.96 }} className="mt-2">
        <Link
          to="/studio"
          className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 px-3 py-3 font-semibold text-white shadow-lg shadow-emerald-500/20 transition-transform hover:brightness-110"
        >
          <Plus className="h-5 w-5 shrink-0" strokeWidth={2.4} />
          <span
            className={cn(
              'whitespace-nowrap text-body',
              'opacity-0 -translate-x-2 transition-all duration-300 ease-in-out',
              'group-hover:opacity-100 group-hover:translate-x-0',
            )}
          >
            {t('nav.create', 'Create')}
          </span>
        </Link>
      </motion.div>

      {/* Divider */}
      <div className="my-1 h-px bg-white/5" />

      {/* Account block */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex w-full items-center gap-3 rounded-2xl p-1.5 text-left transition-colors hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/50">
            <div className="shrink-0">
              <CinematicAvatar src={avatarUrl} alt={displayName} size="sm" ring="primary" />
            </div>
            <div
              className={cn(
                'min-w-0 flex-1',
                'opacity-0 -translate-x-2 transition-all duration-300 ease-in-out',
                'group-hover:opacity-100 group-hover:translate-x-0',
              )}
            >
              <p className="truncate text-label font-medium text-foreground">{displayName}</p>
              <p className="truncate text-caption text-muted-foreground">
                {t('nav.viewProfile', 'View profile')}
              </p>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="right" className="w-56 border border-border bg-popover">
          <DropdownMenuItem asChild>
            <Link to="/profile">{t('nav.profile')}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/directory">{t('nav.directory')}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/crisis">{t('nav.crisisSupport')}</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {t('nav.settings')}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
            <LogOut className="h-4 w-4 mr-2" />
            {t('auth.logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </aside>
  );
}

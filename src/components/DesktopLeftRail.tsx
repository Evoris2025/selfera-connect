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
import { BrandMark } from '@/components/BrandMark';
import { CinematicAvatar } from '@/components/ui/CinematicAvatar';
import { useCurrentUserAvatar } from '@/hooks/useCurrentUserAvatar';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * DesktopLeftRail
 *
 * Permanent left navigation for lg+ viewports. Lives as a sibling to the
 * mobile column inside AppLayout — never reaches into the column itself.
 * Hidden below lg, where MobileNav (bottom) takes over.
 *
 * See docs/SCALING.md — rem-based tokens only, no arbitrary px values.
 */

interface NavItem {
  icon: typeof Home;
  href: string;
  labelKey: string;
  fallbackLabel: string;
}

const navItems: NavItem[] = [
  { icon: Home, href: '/feed', labelKey: 'nav.home', fallbackLabel: 'Home' },
  { icon: Compass, href: '/explore', labelKey: 'nav.explore', fallbackLabel: 'Explore' },
  { icon: LayoutDashboard, href: '/my-era', labelKey: 'nav.myera', fallbackLabel: 'MyERA' },
  { icon: Bell, href: '/notifications', labelKey: 'nav.notifications', fallbackLabel: 'Notifications' },
  { icon: MessageCircle, href: '/messages', labelKey: 'nav.messages', fallbackLabel: 'Messages' },
  { icon: User, href: '/profile', labelKey: 'nav.profile', fallbackLabel: 'Profile' },
];

export function DesktopLeftRail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const { avatarUrl, displayName } = useCurrentUserAvatar();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (href: string) =>
    location.pathname === href ||
    (href === '/explore' && location.pathname.startsWith('/explore')) ||
    (href === '/profile' && location.pathname.startsWith('/profile'));

  return (
    <aside className="hidden lg:flex sticky top-0 h-dvh w-64 shrink-0 flex-col border-r border-white/[0.08] bg-background px-4 py-6">
      {/* Brand */}
      <Link to="/feed" className="mb-8 flex items-center px-3">
        <BrandMark imgClassName="-translate-x-5" />
      </Link>

      {/* Primary nav */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex min-h-11 items-center gap-3 rounded-full px-4 py-2.5 text-body transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={active ? 1.8 : 1.4} />
              <span className="font-medium">{t(item.labelKey, item.fallbackLabel)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Create */}
      <motion.div whileTap={{ scale: 0.98 }} className="mt-4">
        <Link
          to="/studio"
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md gradient-brand px-3 py-2.5 text-body font-semibold text-white shadow-cinematic"
        >
          <Plus className="h-5 w-5" strokeWidth={2} />
          <span>{t('nav.create', 'Create')}</span>
        </Link>
      </motion.div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Account block */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex min-h-11 w-full items-center gap-3 rounded-md p-1.5 text-left transition-colors hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/50">
            <CinematicAvatar src={avatarUrl} alt={displayName} size="sm" ring="primary" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-label font-medium text-foreground">
                {displayName}
              </p>
              <p className="truncate text-caption text-muted-foreground">
                {t('nav.viewProfile', 'View profile')}
              </p>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-56 border border-border bg-popover">
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

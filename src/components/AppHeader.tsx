import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BrandMark } from '@/components/BrandMark';

interface AppHeaderProps {
  title?: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        {/* Logo - crop + scale to counter PNG padding */}
        <Link to="/feed" className="flex items-center">
          {title ? (
            <>
              <BrandMark
                alt="SelfERA"
                className="h-9 w-[148px] sm:h-10 sm:w-[164px]"
              />
              <span className="font-logo font-semibold text-foreground tracking-widest ml-2">
                {title}
              </span>
            </>
          ) : (
            <BrandMark alt="SelfERA" className="h-9 w-[148px] sm:h-10 sm:w-[164px]" />
          )}
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
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
        </div>
      </div>
    </header>
  );
}

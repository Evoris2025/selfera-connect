import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Palette, Globe, Eye, Bell, Lock, User, HelpCircle, BadgeCheck, Shield, ShieldOff, VolumeX, UserPlus, CreditCard, Users } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SettingsSection, SettingsRow } from '@/components/ui/settings-list';
import { languages, changeLanguage, getCurrentLanguage, type LanguageCode } from '@/i18n';
import { ThemeSelector } from '@/components/settings/ThemeSelector';

import { VerificationRequestForm } from '@/components/settings/VerificationRequestForm';
import { BlockedUsersList } from '@/components/settings/BlockedUsersList';
import { MutedUsersList } from '@/components/settings/MutedUsersList';
import { CloseFriendsList } from '@/components/settings/CloseFriendsList';
import { FollowRequestsModal } from '@/components/settings/FollowRequestsModal';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { BillingSettingsView } from '@/components/billing';
import { useAuth } from '@/contexts/AuthContext';
import { useSafety } from '@/contexts/SafetyContext';
import { useFollowRequests } from '@/hooks/useFollowRequests';
import { useSubscription } from '@/hooks/useSubscription';
import { useCloseFriends } from '@/hooks/useCloseFriends';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SettingsView = 'main' | 'verification' | 'blocked' | 'muted' | 'billing' | 'closeFriends' | 'notifications';

export default function Settings() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, signOut } = useAuth();
  const { blockedUserIds, mutedUserIds } = useSafety();
  const { pendingCount } = useFollowRequests();
  const { currentPlan } = useSubscription();
  const { count: closeFriendsCount } = useCloseFriends();
  const currentLang = getCurrentLanguage();

  const initialView = (searchParams.get('view') as SettingsView) || 'main';
  const [view, setView] = useState<SettingsView>(initialView);
  const [isAdmin, setIsAdmin] = useState(false);
  const [followRequestsOpen, setFollowRequestsOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  useEffect(() => {
    const urlView = searchParams.get('view') as SettingsView;
    if (urlView && urlView !== view) setView(urlView);
  }, [searchParams]);

  const handleViewChange = (newView: SettingsView) => {
    setView(newView);
    if (newView === 'main') setSearchParams({});
    else setSearchParams({ view: newView });
  };

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      setIsAdmin(!!data);
    };
    checkAdmin();
  }, [user?.id]);

  // ---- Subview shells ----
  if (view === 'verification') {
    return <AppLayout><div className="max-w-2xl mx-auto p-4"><VerificationRequestForm onBack={() => handleViewChange('main')} /></div></AppLayout>;
  }
  if (view === 'blocked') {
    return <AppLayout><div className="max-w-2xl mx-auto p-4"><BlockedUsersList onBack={() => handleViewChange('main')} /></div></AppLayout>;
  }
  if (view === 'muted') {
    return <AppLayout><div className="max-w-2xl mx-auto p-4"><MutedUsersList onBack={() => handleViewChange('main')} /></div></AppLayout>;
  }
  if (view === 'billing') {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto p-4">
          <Button variant="ghost" onClick={() => handleViewChange('main')} className="gap-2 -ml-2 mb-4">← Back to Settings</Button>
          <h1 className="text-page-title mb-6">Plan & Billing</h1>
          <BillingSettingsView />
        </div>
      </AppLayout>
    );
  }
  if (view === 'closeFriends') {
    return <AppLayout><div className="max-w-2xl mx-auto p-4"><CloseFriendsList onBack={() => handleViewChange('main')} /></div></AppLayout>;
  }
  if (view === 'notifications') {
    return <AppLayout><div className="max-w-2xl mx-auto p-4"><NotificationSettings onBack={() => handleViewChange('main')} /></div></AppLayout>;
  }

  const currentLangLabel = languages.find(l => l.code === currentLang)?.nativeName ?? currentLang;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto pb-8">
        <div className="px-4 pt-4 pb-3">
          <h1 className="text-page-title">{t('settings.title')}</h1>
        </div>

        {/* Appearance */}
        <SettingsSection title="Appearance">
          <SettingsRow
            icon={Palette}
            iconClassName="text-primary"
            label={t('settings.theme', 'Theme')}
            helper="Choose your color theme"
            onClick={() => setThemeOpen((v) => !v)}
            showChevron
          />
          {themeOpen && (
            <div className="px-4 py-3 bg-background/40">
              <ThemeSelector />
            </div>
          )}
          <SettingsRow
            icon={Globe}
            iconClassName="text-primary"
            label={t('settings.language')}
            trailing={
              <Select value={currentLang} onValueChange={(v) => changeLanguage(v as LanguageCode)}>
                <SelectTrigger className="h-8 w-auto min-w-[110px] border-0 bg-transparent px-1 text-[13px] text-muted-foreground focus:ring-0">
                  <SelectValue>{currentLangLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language.code} value={language.code}>
                      {language.nativeName} ({language.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
          />
          <SettingsRow
            icon={Eye}
            iconClassName="text-primary"
            label={t('settings.reduceMotion')}
            helper="Minimize animations"
            trailing={<Switch id="reduce-motion" />}
          />
        </SettingsSection>

        {/* Privacy */}
        <SettingsSection title="Privacy">
          <SettingsRow
            icon={Lock}
            iconClassName="text-primary"
            label={t('settings.privateAccount')}
            helper="Only approved followers can see your posts"
            trailing={<Switch id="private-account" />}
          />
          <SettingsRow
            icon={UserPlus}
            iconClassName="text-primary"
            label="Follow Requests"
            helper="Review pending follow requests"
            trailing={pendingCount > 0 ? <Badge variant="default" className="rounded-full">{pendingCount}</Badge> : undefined}
            onClick={() => setFollowRequestsOpen(true)}
            showChevron
          />
          <SettingsRow
            icon={Users}
            iconClassName="text-green-500"
            label="Close Friends"
            helper="Share expressions with select people"
            trailing={closeFriendsCount > 0 ? <Badge variant="secondary" className="rounded-full bg-green-500/10 text-green-500">{closeFriendsCount}</Badge> : undefined}
            onClick={() => handleViewChange('closeFriends')}
            showChevron
          />
          <SettingsRow
            icon={ShieldOff}
            iconClassName="text-destructive"
            label="Blocked Accounts"
            helper="Manage accounts you've blocked"
            trailing={blockedUserIds.size > 0 ? <Badge variant="secondary" className="rounded-full">{blockedUserIds.size}</Badge> : undefined}
            onClick={() => handleViewChange('blocked')}
            showChevron
          />
          <SettingsRow
            icon={VolumeX}
            iconClassName="text-amber-500"
            label="Muted Accounts"
            helper="Manage accounts you've muted"
            trailing={mutedUserIds.size > 0 ? <Badge variant="secondary" className="rounded-full">{mutedUserIds.size}</Badge> : undefined}
            onClick={() => handleViewChange('muted')}
            showChevron
          />
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications">
          <SettingsRow
            icon={Bell}
            iconClassName="text-primary"
            label={t('settings.notifications')}
            helper="Configure notification preferences"
            onClick={() => handleViewChange('notifications')}
            showChevron
          />
        </SettingsSection>

        {/* Account */}
        <SettingsSection title="Account">
          <SettingsRow
            icon={CreditCard}
            iconClassName="text-primary"
            label="Plan & Billing"
            helper="Manage your subscription and view plans"
            trailing={<Badge variant="secondary" className="capitalize">{currentPlan}</Badge>}
            onClick={() => handleViewChange('billing')}
            showChevron
          />
          <SettingsRow
            icon={BadgeCheck}
            iconClassName="text-verified"
            label="Get Verified"
            helper="Apply for professional or organisation verification"
            onClick={() => handleViewChange('verification')}
            showChevron
          />
          <SettingsRow
            icon={User}
            iconClassName="text-primary"
            label={t('settings.account')}
            helper="Manage your account details"
            showChevron
          />
          <SettingsRow
            icon={HelpCircle}
            iconClassName="text-primary"
            label={t('settings.help')}
            helper="Get help and support"
            showChevron
          />
        </SettingsSection>

        {isAdmin && (
          <SettingsSection title="Admin">
            <SettingsRow
              icon={Shield}
              iconClassName="text-destructive"
              label="Admin Console"
              helper="Verification, moderation, and audit logs"
              onClick={() => (window.location.href = '/admin')}
              showChevron
            />
          </SettingsSection>
        )}

        {/* Logout */}
        <div className="px-4 pt-2">
          <Button variant="destructive" className="w-full" onClick={() => signOut()}>
            {t('auth.logout')}
          </Button>
        </div>

        <FollowRequestsModal open={followRequestsOpen} onOpenChange={setFollowRequestsOpen} />
      </div>
    </AppLayout>
  );
}

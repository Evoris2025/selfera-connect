import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Palette, Globe, Eye, Bell, Lock, User, HelpCircle, BadgeCheck, Shield, ShieldOff, VolumeX, UserPlus, CreditCard, Users } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { languages, changeLanguage, getCurrentLanguage, type LanguageCode } from '@/i18n';
import { ThemeSelector } from '@/components/settings/ThemeSelector';
import { PreviewZoomControl } from '@/components/settings/PreviewZoomControl';
import { VerificationRequestForm } from '@/components/settings/VerificationRequestForm';
import { BlockedUsersList } from '@/components/settings/BlockedUsersList';
import { MutedUsersList } from '@/components/settings/MutedUsersList';
import { CloseFriendsList } from '@/components/settings/CloseFriendsList';
import { FollowRequestsModal } from '@/components/settings/FollowRequestsModal';
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

type SettingsView = 'main' | 'verification' | 'blocked' | 'muted' | 'billing' | 'closeFriends';

export default function Settings() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, signOut } = useAuth();
  const { blockedUserIds, mutedUserIds } = useSafety();
  const { pendingCount } = useFollowRequests();
  const { currentPlan } = useSubscription();
  const { count: closeFriendsCount } = useCloseFriends();
  const currentLang = getCurrentLanguage();
  
  // Initialize view from URL query param
  const initialView = (searchParams.get('view') as SettingsView) || 'main';
  const [view, setView] = useState<SettingsView>(initialView);
  const [isAdmin, setIsAdmin] = useState(false);
  const [followRequestsOpen, setFollowRequestsOpen] = useState(false);

  // Sync view state with URL
  useEffect(() => {
    const urlView = searchParams.get('view') as SettingsView;
    if (urlView && urlView !== view) {
      setView(urlView);
    }
  }, [searchParams]);

  // Update URL when view changes
  const handleViewChange = (newView: SettingsView) => {
    setView(newView);
    if (newView === 'main') {
      setSearchParams({});
    } else {
      setSearchParams({ view: newView });
    }
  };

  // Check if current user is admin
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

  const settingsSections = [
    {
      icon: User,
      title: t('settings.account'),
      description: 'Manage your account details',
    },
    {
      icon: Bell,
      title: t('settings.notifications'),
      description: 'Configure notification preferences',
    },
    {
      icon: Lock,
      title: t('settings.privacy'),
      description: 'Control your privacy settings',
    },
    {
      icon: HelpCircle,
      title: t('settings.help'),
      description: 'Get help and support',
    },
  ];

  // Verification request form view
  if (view === 'verification') {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto p-4">
          <VerificationRequestForm onBack={() => handleViewChange('main')} />
        </div>
      </AppLayout>
    );
  }

  // Blocked users list view
  if (view === 'blocked') {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto p-4">
          <BlockedUsersList onBack={() => handleViewChange('main')} />
        </div>
      </AppLayout>
    );
  }

  // Muted users list view
  if (view === 'muted') {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto p-4">
          <MutedUsersList onBack={() => handleViewChange('main')} />
        </div>
      </AppLayout>
    );
  }

  // Billing & subscription view
  if (view === 'billing') {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto p-4">
          <Button variant="ghost" onClick={() => handleViewChange('main')} className="gap-2 -ml-2 mb-4">
            ← Back to Settings
          </Button>
          <h1 className="text-2xl font-bold text-foreground mb-6">Plan & Billing</h1>
          <BillingSettingsView />
        </div>
      </AppLayout>
    );
  }

  // Close Friends view
  if (view === 'closeFriends') {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto p-4">
          <CloseFriendsList onBack={() => handleViewChange('main')} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-foreground mb-6">{t('settings.title')}</h1>

        <div className="space-y-4">
          {/* Theme */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{t('settings.theme', 'Theme')}</CardTitle>
                  <CardDescription>Choose your color theme</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ThemeSelector />
            </CardContent>
          </Card>

          {/* Preview Zoom (Desktop only) */}
          <PreviewZoomControl />

          {/* Language */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{t('settings.language')}</CardTitle>
                  <CardDescription>Choose your preferred language</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Select value={currentLang} onValueChange={(value) => changeLanguage(value as LanguageCode)}>
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language.code} value={language.code}>
                      {language.nativeName} ({language.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Reduce Motion */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{t('settings.reduceMotion')}</CardTitle>
                    <CardDescription>Minimize animations throughout the app</CardDescription>
                  </div>
                </div>
                <Switch id="reduce-motion" />
              </div>
            </CardHeader>
          </Card>

          {/* Private Account */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{t('settings.privateAccount')}</CardTitle>
                    <CardDescription>Only approved followers can see your posts</CardDescription>
                  </div>
                </div>
                <Switch id="private-account" />
              </div>
            </CardHeader>
          </Card>

          {/* Follow Requests */}
          <Card 
            className="cursor-pointer hover:border-primary/30 transition-colors"
            onClick={() => setFollowRequestsOpen(true)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <UserPlus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Follow Requests</CardTitle>
                    <CardDescription>Review pending follow requests</CardDescription>
                  </div>
                </div>
                {pendingCount > 0 && (
                  <Badge variant="default" className="rounded-full">
                    {pendingCount}
                  </Badge>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Close Friends */}
          <Card 
            className="cursor-pointer hover:border-green-500/30 transition-colors"
            onClick={() => handleViewChange('closeFriends')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Users className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Close Friends</CardTitle>
                    <CardDescription>Share expressions with select people</CardDescription>
                  </div>
                </div>
                {closeFriendsCount > 0 && (
                  <Badge variant="secondary" className="rounded-full bg-green-500/10 text-green-600">
                    {closeFriendsCount}
                  </Badge>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Blocked Accounts */}
          <Card 
            className="cursor-pointer hover:border-destructive/30 transition-colors"
            onClick={() => handleViewChange('blocked')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <ShieldOff className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Blocked Accounts</CardTitle>
                    <CardDescription>Manage accounts you've blocked</CardDescription>
                  </div>
                </div>
                {blockedUserIds.size > 0 && (
                  <Badge variant="secondary" className="rounded-full">
                    {blockedUserIds.size}
                  </Badge>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Muted Accounts */}
          <Card 
            className="cursor-pointer hover:border-amber-500/30 transition-colors"
            onClick={() => handleViewChange('muted')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <VolumeX className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Muted Accounts</CardTitle>
                    <CardDescription>Manage accounts you've muted</CardDescription>
                  </div>
                </div>
                {mutedUserIds.size > 0 && (
                  <Badge variant="secondary" className="rounded-full">
                    {mutedUserIds.size}
                  </Badge>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Plan & Billing */}
          <Card 
            className="cursor-pointer hover:border-primary/30 transition-colors"
            onClick={() => handleViewChange('billing')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Plan & Billing</CardTitle>
                    <CardDescription>Manage your subscription and view plans</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {currentPlan}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Get Verified */}
          <Card 
            className="cursor-pointer hover:border-verified/30 transition-colors"
            onClick={() => handleViewChange('verification')}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-verified/10">
                  <BadgeCheck className="h-5 w-5 text-verified" />
                </div>
                <div>
                  <CardTitle className="text-base">Get Verified</CardTitle>
                  <CardDescription>Apply for professional or organisation verification</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Admin Console Link */}
          {isAdmin && (
            <Card 
              className="cursor-pointer hover:border-primary/30 transition-colors border-dashed"
              onClick={() => window.location.href = '/admin'}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <Shield className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Admin Console</CardTitle>
                    <CardDescription>Verification, moderation, and audit logs</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}

          {/* Other Settings */}
          {settingsSections.map((section, index) => (
            <Card key={index} className="cursor-pointer hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <section.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}

          {/* Logout */}
          <div className="pt-4">
            <Button variant="destructive" className="w-full" onClick={() => signOut()}>
              {t('auth.logout')}
            </Button>
          </div>
        </div>

        {/* Follow Requests Modal */}
        <FollowRequestsModal 
          open={followRequestsOpen} 
          onOpenChange={setFollowRequestsOpen} 
        />
      </div>
    </AppLayout>
  );
}

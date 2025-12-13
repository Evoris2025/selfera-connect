import { useTranslation } from 'react-i18next';
import { Moon, Globe, Eye, Bell, Lock, User, HelpCircle } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { languages, changeLanguage, getCurrentLanguage, type LanguageCode } from '@/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Settings() {
  const { t } = useTranslation();
  const currentLang = getCurrentLanguage();

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

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-foreground mb-6">{t('settings.title')}</h1>

        <div className="space-y-4">
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
            <Button variant="destructive" className="w-full">
              {t('auth.logout')}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

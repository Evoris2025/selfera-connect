import { ArrowLeft, Bell, Heart, MessageCircle, UserPlus, AtSign, Handshake, BellRing, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface NotificationSettingsProps {
  onBack: () => void;
}

export function NotificationSettings({ onBack }: NotificationSettingsProps) {
  const { preferences, isLoading, updatePreference } = useNotificationPreferences();
  const { isSupported, permission, subscribe, unsubscribe, isSubscribed } = usePushNotifications();

  const handleToggle = (key: 'reactions_enabled' | 'replies_enabled' | 'follows_enabled' | 'comments_enabled' | 'mentions_enabled' | 'interactions_enabled' | 'push_enabled', value: boolean) => {
    updatePreference.mutate({ key, value });
  };

  const handlePushToggle = async () => {
    if (isSubscribed) {
      await unsubscribe.mutateAsync();
      handleToggle('push_enabled', false);
    } else {
      try {
        await subscribe.mutateAsync();
        handleToggle('push_enabled', true);
      } catch (error) {
        console.error('Failed to enable push notifications:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const notificationTypes = [
    {
      key: 'reactions_enabled' as const,
      icon: Heart,
      title: 'Reactions',
      description: 'When someone reacts to your content',
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
    },
    {
      key: 'replies_enabled' as const,
      icon: MessageCircle,
      title: 'Replies & Comments',
      description: 'When someone replies to your expressions or comments on posts',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      key: 'follows_enabled' as const,
      icon: UserPlus,
      title: 'New Followers',
      description: 'When someone starts following you',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      key: 'mentions_enabled' as const,
      icon: AtSign,
      title: 'Mentions',
      description: 'When someone mentions you in a post or comment',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      key: 'interactions_enabled' as const,
      icon: Handshake,
      title: 'Interactions',
      description: 'Updates about your professional interactions',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Notification Settings</h1>
          <p className="text-sm text-muted-foreground">
            Choose which notifications you receive
          </p>
        </div>
      </div>

      {/* Push Notifications */}
      {isSupported && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BellRing className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Push Notifications</CardTitle>
                  <CardDescription>
                    Receive notifications even when the app is closed
                  </CardDescription>
                </div>
              </div>
              <Switch
                checked={isSubscribed && preferences?.push_enabled}
                onCheckedChange={handlePushToggle}
                disabled={subscribe.isPending || unsubscribe.isPending}
              />
            </div>
          </CardHeader>
          {permission === 'denied' && (
            <CardContent className="pt-0">
              <p className="text-xs text-destructive">
                Push notifications are blocked. Please enable them in your browser settings.
              </p>
            </CardContent>
          )}
        </Card>
      )}

      <Separator />

      {/* In-App Notification Types */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <Bell className="w-4 h-4" />
          In-App Notifications
        </h2>
        
        <div className="space-y-3">
          {notificationTypes.map((type) => (
            <Card key={type.key} className="border-border/50">
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${type.bgColor}`}>
                      <type.icon className={`h-4 w-4 ${type.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium">{type.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {type.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={preferences?.[type.key] ?? true}
                    onCheckedChange={(checked) => handleToggle(type.key, checked)}
                    disabled={updatePreference.isPending}
                  />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Info Text */}
      <p className="text-xs text-muted-foreground text-center px-4">
        You'll still receive important account and security notifications regardless of these settings.
      </p>
    </div>
  );
}

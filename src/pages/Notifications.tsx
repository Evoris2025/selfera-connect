import { useTranslation } from 'react-i18next';
import { Heart, MessageCircle, UserPlus, CheckCircle } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const mockNotifications = [
  {
    id: '1',
    type: 'reaction',
    user: { name: 'Mind Matters', handle: 'mindmatters' },
    action: 'supported your post',
    preview: 'Remember: taking a break is not...',
    time: '2m',
    read: false,
  },
  {
    id: '2',
    type: 'follow',
    user: { name: 'Dr. Sarah', handle: 'drsarah' },
    action: 'started following you',
    time: '1h',
    read: false,
  },
  {
    id: '3',
    type: 'comment',
    user: { name: 'Jamie', handle: 'jamie_journey' },
    action: 'commented on your post',
    preview: 'This is so helpful, thank you!',
    time: '3h',
    read: true,
  },
  {
    id: '4',
    type: 'verification',
    action: 'Your verification request is under review',
    time: '1d',
    read: true,
  },
  {
    id: '5',
    type: 'reaction',
    user: { name: 'Wellness Hub', handle: 'wellnesshub' },
    action: 'found your post informative',
    preview: 'Anxiety tip: Try the 5-4-3-2-1...',
    time: '2d',
    read: true,
  },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'reaction':
      return <Heart className="h-4 w-4 text-support" />;
    case 'follow':
      return <UserPlus className="h-4 w-4 text-primary" />;
    case 'comment':
      return <MessageCircle className="h-4 w-4 text-accent" />;
    case 'verification':
      return <CheckCircle className="h-4 w-4 text-verified" />;
    default:
      return <Heart className="h-4 w-4" />;
  }
};

export default function Notifications() {
  const { t } = useTranslation();

  return (
    <AppLayout title={t('nav.notifications')}>
      <div className="divide-y divide-border">
        {mockNotifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              'flex items-start gap-3 p-4 hover:bg-secondary/50 transition-colors cursor-pointer',
              !notification.read && 'bg-primary/5'
            )}
          >
            {/* Icon or Avatar */}
            {notification.user ? (
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {notification.user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-background">
                  {getNotificationIcon(notification.type)}
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                {getNotificationIcon(notification.type)}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                {notification.user && (
                  <span className="font-semibold">{notification.user.name} </span>
                )}
                {notification.action}
              </p>
              {notification.preview && (
                <p className="text-sm text-muted-foreground truncate mt-0.5">
                  "{notification.preview}"
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
            </div>

            {/* Unread indicator */}
            {!notification.read && (
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            )}
          </div>
        ))}
      </div>
    </AppLayout>
  );
}

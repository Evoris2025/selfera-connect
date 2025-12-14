import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, MessageCircle, UserPlus, CheckCircle, Users, AtSign, Bell, MoreHorizontal } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  type: 'reaction' | 'follow' | 'comment' | 'mention' | 'community' | 'message' | 'verification';
  user?: { name: string; handle: string };
  action: string;
  preview?: string;
  thumbnailUrl?: string;
  time: string;
  read: boolean;
  targetType?: string;
  targetId?: string;
}

const mockNotifications: Notification[] = [
  // Today
  {
    id: '1',
    type: 'reaction',
    user: { name: 'Mind Matters', handle: 'mindmatters' },
    action: 'supported your post',
    preview: 'Remember: taking a break is not...',
    time: '2m',
    read: false,
    targetType: 'post',
    targetId: '123',
  },
  {
    id: '2',
    type: 'follow',
    user: { name: 'Dr. Sarah', handle: 'drsarah' },
    action: 'started following you',
    time: '1h',
    read: false,
    targetType: 'profile',
    targetId: 'drsarah',
  },
  {
    id: '3',
    type: 'mention',
    user: { name: 'Wellness Hub', handle: 'wellnesshub' },
    action: 'mentioned you in a post',
    preview: '@you Thanks for the amazing tips!',
    time: '3h',
    read: false,
    targetType: 'post',
    targetId: '124',
  },
  // This week
  {
    id: '4',
    type: 'comment',
    user: { name: 'Jamie', handle: 'jamie_journey' },
    action: 'commented on your post',
    preview: 'This is so helpful, thank you!',
    time: '1d',
    read: true,
    targetType: 'post',
    targetId: '125',
  },
  {
    id: '5',
    type: 'community',
    user: { name: 'Mental Health Support', handle: 'mhsupport' },
    action: 'New post in your community',
    preview: 'Weekly check-in thread is live!',
    time: '2d',
    read: true,
    targetType: 'community',
    targetId: 'mhsupport',
  },
  {
    id: '6',
    type: 'message',
    user: { name: 'Alex Chen', handle: 'alexchen' },
    action: 'sent you a message',
    preview: 'Hey! Thanks for connecting...',
    time: '3d',
    read: true,
    targetType: 'message',
    targetId: '126',
  },
  // Earlier
  {
    id: '7',
    type: 'verification',
    action: 'Your verification request was approved',
    time: '1w',
    read: true,
  },
  {
    id: '8',
    type: 'reaction',
    user: { name: 'Wellness Hub', handle: 'wellnesshub' },
    action: 'found your post informative',
    preview: 'Anxiety tip: Try the 5-4-3-2-1...',
    time: '2w',
    read: true,
    targetType: 'post',
    targetId: '127',
  },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'reaction':
      return <Heart className="h-4 w-4 text-rose-500" />;
    case 'follow':
      return <UserPlus className="h-4 w-4 text-primary" />;
    case 'comment':
      return <MessageCircle className="h-4 w-4 text-blue-500" />;
    case 'mention':
      return <AtSign className="h-4 w-4 text-amber-500" />;
    case 'community':
      return <Users className="h-4 w-4 text-emerald-500" />;
    case 'message':
      return <MessageCircle className="h-4 w-4 text-purple-500" />;
    case 'verification':
      return <CheckCircle className="h-4 w-4 text-verified" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const groupNotificationsByTime = (notifications: Notification[]) => {
  const today: Notification[] = [];
  const thisWeek: Notification[] = [];
  const earlier: Notification[] = [];

  notifications.forEach((notification) => {
    const time = notification.time.toLowerCase();
    if (time.includes('m') || time.includes('h')) {
      today.push(notification);
    } else if (time.includes('d') && parseInt(time) <= 7) {
      thisWeek.push(notification);
    } else {
      earlier.push(notification);
    }
  });

  return { today, thisWeek, earlier };
};

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

function NotificationItem({ notification }: { notification: Notification }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleClick = () => {
    if (notification.targetType === 'message') {
      navigate('/messages');
    } else if (notification.targetType === 'profile') {
      navigate(`/profile/${notification.targetId}`);
    } else if (notification.targetType === 'post') {
      navigate(`/post/${notification.targetId}`);
    } else if (notification.targetType === 'community') {
      navigate(`/community/${notification.targetId}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={cn(
        'flex items-start gap-3 p-4 cursor-pointer transition-colors hover:bg-secondary/50',
        !notification.read && 'bg-primary/5'
      )}
    >
      {/* Icon or Avatar */}
      {notification.user ? (
        <div className="relative">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-secondary text-secondary-foreground">
              {notification.user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-background border border-border">
            {getNotificationIcon(notification.type)}
          </div>
        </div>
      ) : (
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
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

      {/* Thumbnail */}
      {notification.thumbnailUrl && (
        <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden shrink-0">
          <img
            src={notification.thumbnailUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Unread indicator */}
      {!notification.read && (
        <div className="w-2.5 h-2.5 rounded-full bg-primary mt-2 shrink-0" />
      )}

      {/* More options */}
      <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
        <DropdownMenuTrigger
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(true);
          }}
          className="p-1 rounded-full hover:bg-secondary opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {notification.user && (
            <>
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                Mute @{notification.user.handle}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                Block @{notification.user.handle}
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
            Turn off this type
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}

export default function Notifications() {
  const { t } = useTranslation();
  const [isLoading] = useState(false);
  const grouped = groupNotificationsByTime(mockNotifications);

  return (
    <AppLayout title={t('nav.notifications')}>
      {isLoading ? (
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <NotificationSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div>
          {/* Today */}
          {grouped.today.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-secondary/30">
                <p className="text-sm font-semibold text-foreground">Today</p>
              </div>
              <div className="divide-y divide-border">
                {grouped.today.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            </div>
          )}

          {/* This Week */}
          {grouped.thisWeek.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-secondary/30">
                <p className="text-sm font-semibold text-foreground">This Week</p>
              </div>
              <div className="divide-y divide-border">
                {grouped.thisWeek.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            </div>
          )}

          {/* Earlier */}
          {grouped.earlier.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-secondary/30">
                <p className="text-sm font-semibold text-foreground">Earlier</p>
              </div>
              <div className="divide-y divide-border">
                {grouped.earlier.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            </div>
          )}

          {mockNotifications.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No notifications yet</p>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}

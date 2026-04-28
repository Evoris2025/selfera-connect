import { useState, useMemo } from 'react';
import { ICON_SIZE } from "@/lib/scale";
import { useTranslation } from 'react-i18next';
import {
  Heart,
  MessageCircle,
  UserPlus,
  CheckCircle,
  Users,
  AtSign,
  Bell,
  ArrowLeft,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence, type Transition } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useNotifications } from '@/hooks/useNotifications';
import { FollowRequestsSection } from '@/components/notifications/FollowRequestsSection';
import { EraVerifiedTick } from '@/components/EraVerifiedTick';
import { BrandScreenTitle, BrandSectionLabel, BrandIcon } from '@/components/brand';
import { useThemeColor } from '@/hooks/useThemeColor';

// Ultra-calm motion - simple fades and slides only
const calmFade: Transition = { duration: 0.25, ease: 'easeOut' as const };
const calmSlide: Transition = { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const };

interface NotificationUser {
  name: string;
  handle: string;
  avatarUrl?: string;
  isVerified?: boolean;
  email?: string;
}

interface Notification {
  id: string;
  type: 'reaction' | 'follow' | 'comment' | 'mention' | 'community' | 'message' | 'verification' | 'follow_suggestion' | 'connection_request';
  users?: NotificationUser[];
  action: string;
  preview?: string;
  thumbnailUrl?: string;
  time: string;
  read: boolean;
  targetType?: string;
  targetId?: string;
  showFollowButton?: boolean;
  isHighlight?: boolean;
  count?: number;
}

const mockNotifications: Notification[] = [
  // ── TODAY (4) — 3 unread + 1 read ──────────────────────────────────────
  { id: '1',  type: 'follow',       users: [{ name: 'Dr. Sarah Lin',    handle: 'drsarahlin',  isVerified: true }],  action: 'started following you',                                       time: '12m', read: false, showFollowButton: true, targetType: 'profile', targetId: 'drsarahlin' },
  { id: '2',  type: 'reaction',     users: [{ name: 'Mind Matters',     handle: 'mindmatters', isVerified: true }],  action: 'and 12 others liked your post',                                time: '1h',  read: false, targetType: 'post', targetId: '124' },
  { id: '3',  type: 'comment',      users: [{ name: 'Jamie Rivers',     handle: 'jamie_journey' }],                  action: 'commented on your post',  preview: 'this is so helpful, thank you 💙', time: '3h',  read: false, targetType: 'post', targetId: '125' },
  { id: '4',  type: 'mention',      users: [{ name: 'Wellness Hub',     handle: 'wellnesshub',  isVerified: true }], action: 'mentioned you in a comment', preview: '@you thanks for the tips!',     time: '6h',  read: true,  targetType: 'post', targetId: '126' },

  // ── THIS WEEK (5) — 1 unread + 4 read ──────────────────────────────────
  { id: '5',  type: 'follow',       users: [{ name: 'Marcus Patel',     handle: 'marcus.p' }],                       action: 'started following you',                                       time: '1d',  read: false, showFollowButton: true, targetType: 'profile', targetId: 'marcus.p' },
  { id: '6',  type: 'reaction',     users: [{ name: 'Olivia Brooks',    handle: 'olivia_b' }],                       action: 'liked your reel',                                              time: '2d',  read: true,  targetType: 'post', targetId: '127' },
  { id: '7',  type: 'comment',      users: [{ name: 'Theo Nakamura',    handle: 'theonakamura' }],                   action: 'replied to your comment', preview: 'totally agree — couldn\u2019t have said it better.', time: '3d', read: true, targetType: 'post', targetId: '128' },
  { id: '8',  type: 'community',    users: [{ name: 'Mental Health Support', handle: 'mhsupport' }],                 action: 'new activity in your community',                               time: '4d',  read: true,  targetType: 'community', targetId: 'mhsupport' },
  { id: '9',  type: 'mention',      users: [{ name: 'Calm Collective',  handle: 'calmcollective', isVerified: true }], action: 'tagged you in a post',  preview: 'check out @you\u2019s journal — it really resonated.', time: '5d', read: true, targetType: 'post', targetId: '129' },

  // ── EARLIER (5) — all read ─────────────────────────────────────────────
  { id: '10', type: 'verification', action: 'your verification request was approved',                                                                                          time: '1w',  read: true },
  { id: '11', type: 'community',    users: [{ name: 'Anxiety Allies',   handle: 'anxietyallies' }],                  action: 'invited you to a new community',                                time: '2w',  read: true,  targetType: 'community', targetId: 'anxietyallies' },
  { id: '12', type: 'follow',       users: [{ name: 'Alex Chen',        handle: 'alexchen' }],                       action: 'started following you',                                       time: '3w',  read: true,  showFollowButton: true, targetType: 'profile', targetId: 'alexchen' },
  { id: '13', type: 'reaction',     users: [{ name: 'Quiet Mornings',   handle: 'quietmornings' }],                  action: 'and 4 others liked your post',                                 time: '4w',  read: true,  targetType: 'post', targetId: '130' },
  { id: '14', type: 'message',      users: [{ name: 'Priya Desai',      handle: 'priya.d' }],                        action: 'sent you a message',      preview: 'hey — thinking of you today.',  time: '6w',  read: true,  targetType: 'message', targetId: 'priya.d' },
];

const getActionIcon = (type: string) => {
  switch (type) {
    case 'reaction': return Heart;
    case 'follow':
    case 'follow_suggestion':
    case 'connection_request':
      return UserPlus;
    case 'comment':
    case 'message':
      return MessageCircle;
    case 'mention': return AtSign;
    case 'community': return Users;
    case 'verification': return CheckCircle;
    default: return Bell;
  }
};

// Lowercase relative phrasing → UPPERCASE per spec.
const formatTime = (t: string) => t.trim().toUpperCase().replace('YESTERDAY', 'YESTERDAY') + (t.match(/^\d+[mhdw]$/i) ? ' AGO' : '');

const groupNotificationsByTime = (notifications: Notification[]) => {
  const today: Notification[] = [];
  const thisWeek: Notification[] = [];
  const earlier: Notification[] = [];

  notifications.forEach((n) => {
    const time = n.time.toLowerCase();
    if (time.includes('m') || time.includes('h')) {
      today.push(n);
    } else if (time.includes('d') && parseInt(time) <= 7) {
      thisWeek.push(n);
    } else {
      earlier.push(n);
    }
  });

  return { today, thisWeek, earlier };
};

function NotificationSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Skeleton className="h-9 w-9 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-52" />
        <Skeleton className="h-2.5 w-20" />
      </div>
      <Skeleton className="h-11 w-11 rounded-md" />
    </div>
  );
}

function NotificationItem({
  notification,
  index,
  primaryColor,
}: {
  notification: Notification;
  index: number;
  primaryColor: string;
}) {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [showLongPressMenu, setShowLongPressMenu] = useState(false);

  const handleClick = () => {
    if (notification.targetType === 'message') navigate('/messages');
    else if (notification.targetType === 'profile') navigate(`/profile/${notification.targetId}`);
    else if (notification.targetType === 'post') navigate(`/post/${notification.targetId}`);
    else if (notification.targetType === 'community') navigate(`/community/${notification.targetId}`);
  };

  const primaryUser = notification.users?.[0];
  const ActionIcon = getActionIcon(notification.type);

  const avatarRingStyle = !notification.read
    ? { boxShadow: `0 0 0 1.5px ${primaryColor}` }
    : undefined;

  return (
    <DropdownMenu open={showLongPressMenu} onOpenChange={setShowLongPressMenu}>
      <DropdownMenuTrigger asChild>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...calmSlide, delay: index * 0.03 }}
          onClick={handleClick}
          onContextMenu={(e) => { e.preventDefault(); setShowLongPressMenu(true); }}
          className="flex items-center gap-3 px-4 py-3 cursor-pointer"
        >
          <div className="relative shrink-0">
            <Avatar
              className={cn(
                'h-9 w-9',
                notification.read && 'border border-white/[0.12]',
              )}
              style={avatarRingStyle}
            >
              <AvatarFallback className="bg-gradient-to-br from-white/10 to-white/5 text-white text-label font-medium">
                {primaryUser?.name.charAt(0) ?? <Bell className="h-4 w-4 text-white/55" />}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-body leading-snug flex items-start gap-1.5">
              <BrandIcon icon={ActionIcon} size={ICON_SIZE.sm} strokeWidth={1.75} className="mt-[3px]" />
              <span className="min-w-0">
                {primaryUser && (
                  <>
                    <span className="font-medium text-white">{primaryUser.name}</span>
                    {primaryUser.isVerified && (
                      <span className="inline-flex align-middle ml-0.5">
                        <EraVerifiedTick size="sm" userEmail={primaryUser.email} />
                      </span>
                    )}
                    {' '}
                  </>
                )}
                <span className="text-white/85">{notification.action}</span>
              </span>
            </p>
            {notification.preview && (
              <p className="text-label text-white/55 truncate mt-0.5 ml-[22px]">{notification.preview}</p>
            )}
            <p className="text-caption text-white/45 uppercase tracking-[0.08em] mt-1 ml-[22px]">
              {formatTime(notification.time)}
            </p>
          </div>

          {notification.showFollowButton ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsFollowing(!isFollowing); }}
              className={cn(
                'shrink-0 h-8 px-3.5 rounded-full border bg-transparent text-label uppercase tracking-[0.1em]',
                isFollowing && 'border-white/15 text-white/55',
              )}
              style={
                isFollowing
                  ? undefined
                  : { borderColor: primaryColor, color: primaryColor }
              }
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          ) : notification.thumbnailUrl && !notification.thumbnailUrl.endsWith('/placeholder.svg') ? (
            <div className="w-11 h-11 rounded-md overflow-hidden shrink-0 border border-white/[0.08] bg-black">
              <img src={notification.thumbnailUrl} alt="" className="w-full h-full object-cover" />
            </div>
          ) : null}
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-background border-white/[0.08]">
        {primaryUser && (
          <>
            <DropdownMenuItem>Mute @{primaryUser.handle}</DropdownMenuItem>
            <DropdownMenuItem>Block @{primaryUser.handle}</DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem>Turn off this notification type</DropdownMenuItem>
        <DropdownMenuItem>Notification settings</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={calmSlide}
      className="flex flex-col items-center mt-16 px-6"
    >
      <BrandIcon icon={Bell} size={28} />
      <p className="text-white/55 text-body mt-3 lowercase">nothing new yet.</p>
    </motion.div>
  );
}

export default function Notifications() {
  useTranslation();
  const navigate = useNavigate();
  const { primary } = useThemeColor();

  const { notifications: realNotifications, isLoading } = useNotifications();
  const notifications = realNotifications.length > 0 ? realNotifications : mockNotifications;
  const grouped = useMemo(() => groupNotificationsByTime(notifications), [notifications]);

  const hasNotifications = notifications.length > 0;

  return (
    <AppLayout showHeader={false}>
      <div className="flex flex-col min-h-[100dvh] bg-background">
        {/* Back affordance only — title rendered in-page below */}
        <div className="flex items-center gap-2 px-2 pt-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0 h-9 w-9 rounded-full hover:bg-white/[0.04]"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5 text-white/70" />
          </Button>
        </div>

        {/* In-page brand title */}
        <div className="px-4 pt-2 pb-2">
          <BrandScreenTitle emphasis="NOTIFICATIONS" size="screen" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-nav-safe">
          {isLoading ? (
            <div className="pt-2">
              {Array.from({ length: 6 }).map((_, i) => <NotificationSkeleton key={`sk-${i}`} />)}
            </div>
          ) : !hasNotifications ? (
            <EmptyState />
          ) : (
            <div className="pb-4">
              <FollowRequestsSection />

              {grouped.today.length > 0 && (
                <div>
                  <div className="mt-6 mb-3 px-4">
                    <BrandSectionLabel>TODAY</BrandSectionLabel>
                  </div>
                  {grouped.today.map((n, idx) => (
                    <NotificationItem key={n.id} notification={n} index={idx} primaryColor={primary} />
                  ))}
                </div>
              )}

              {grouped.thisWeek.length > 0 && (
                <div>
                  <div className="mt-6 mb-3 px-4">
                    <BrandSectionLabel>THIS WEEK</BrandSectionLabel>
                  </div>
                  {grouped.thisWeek.map((n, idx) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      index={idx + grouped.today.length}
                      primaryColor={primary}
                    />
                  ))}
                </div>
              )}

              {grouped.earlier.length > 0 && (
                <div>
                  <div className="mt-6 mb-3 px-4">
                    <BrandSectionLabel>EARLIER</BrandSectionLabel>
                  </div>
                  {grouped.earlier.map((n, idx) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      index={idx + grouped.today.length + grouped.thisWeek.length}
                      primaryColor={primary}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

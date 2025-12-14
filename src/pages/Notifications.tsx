import { useState } from 'react';
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
  Settings
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { MobileNav } from '@/components/MobileNav';

// Dopamine-driven spring configs
const springSnap = { type: 'spring' as const, stiffness: 700, damping: 30, mass: 0.8 };
const springBounce = { type: 'spring' as const, stiffness: 500, damping: 15, mass: 0.5 };
const springPop = { type: 'spring' as const, stiffness: 600, damping: 12 };
const springElastic = { type: 'spring' as const, stiffness: 400, damping: 8 };

interface Notification {
  id: string;
  type: 'reaction' | 'follow' | 'comment' | 'mention' | 'community' | 'message' | 'verification' | 'follow_suggestion';
  users?: { name: string; handle: string; avatarUrl?: string }[];
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
  { id: 'h1', type: 'message', users: [{ name: 'Mind Matters', handle: 'mindmatters' }, { name: 'Dr. Sarah', handle: 'drsarah' }], action: 'and others sent you messages', count: 5, time: '2h', read: false, isHighlight: true, targetType: 'message' },
  { id: 'h2', type: 'reaction', users: [{ name: 'Jamie', handle: 'jamie_journey' }, { name: 'Alex Chen', handle: 'alexchen' }, { name: 'Wellness Hub', handle: 'wellnesshub' }], action: 'and 12 others liked your post', count: 15, time: '4h', read: false, isHighlight: true, targetType: 'post', targetId: '123', thumbnailUrl: '/placeholder.svg' },
  { id: '1', type: 'follow', users: [{ name: 'Dr. Sarah', handle: 'drsarah' }], action: 'started following you', time: '1h', read: false, showFollowButton: true, targetType: 'profile', targetId: 'drsarah' },
  { id: '2', type: 'follow_suggestion', users: [{ name: 'Wellness Coach', handle: 'wellnesscoach' }], action: 'who you might know, is on SelfERA', time: '3h', read: false, showFollowButton: true },
  { id: '3', type: 'reaction', users: [{ name: 'Mind Matters', handle: 'mindmatters' }], action: 'liked your post', time: '5h', read: false, targetType: 'post', targetId: '124', thumbnailUrl: '/placeholder.svg' },
  { id: '4', type: 'comment', users: [{ name: 'Jamie', handle: 'jamie_journey' }], action: 'commented:', preview: 'This is so helpful, thank you! 💙', time: '1d', read: true, targetType: 'post', targetId: '125', thumbnailUrl: '/placeholder.svg' },
  { id: '5', type: 'mention', users: [{ name: 'Wellness Hub', handle: 'wellnesshub' }], action: 'mentioned you in a comment', preview: '@you Thanks for the tips!', time: '2d', read: true, targetType: 'post', targetId: '126' },
  { id: '6', type: 'community', users: [{ name: 'Mental Health Support', handle: 'mhsupport' }], action: 'New activity in your community', time: '3d', read: true, targetType: 'community', targetId: 'mhsupport' },
  { id: '7', type: 'verification', action: 'Your verification request was approved', time: '1w', read: true },
  { id: '8', type: 'follow', users: [{ name: 'Alex Chen', handle: 'alexchen' }, { name: 'Lisa M', handle: 'lisam' }], action: 'and 3 others started following you', count: 5, time: '2w', read: true },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'reaction': return <Heart className="h-3.5 w-3.5 text-rose-500" fill="currentColor" />;
    case 'follow': case 'follow_suggestion': return <UserPlus className="h-3.5 w-3.5 text-primary" />;
    case 'comment': return <MessageCircle className="h-3.5 w-3.5 text-blue-500" />;
    case 'mention': return <AtSign className="h-3.5 w-3.5 text-amber-500" />;
    case 'community': return <Users className="h-3.5 w-3.5 text-emerald-500" />;
    case 'message': return <MessageCircle className="h-3.5 w-3.5 text-primary" fill="currentColor" />;
    case 'verification': return <CheckCircle className="h-3.5 w-3.5 text-emerald-500" fill="currentColor" />;
    default: return <Bell className="h-3.5 w-3.5" />;
  }
};

const groupNotificationsByTime = (notifications: Notification[]) => {
  const highlights: Notification[] = [];
  const recent: Notification[] = [];
  const earlier: Notification[] = [];

  notifications.forEach((notification) => {
    if (notification.isHighlight) {
      highlights.push(notification);
    } else {
      const time = notification.time.toLowerCase();
      if (time.includes('m') || time.includes('h') || (time.includes('d') && parseInt(time) <= 7)) {
        recent.push(notification);
      } else {
        earlier.push(notification);
      }
    }
  });

  return { highlights, recent, earlier };
};

function NotificationSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-52" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-11 w-11 rounded-lg" />
    </div>
  );
}

function StackedAvatars({ users, max = 3 }: { users: { name: string; handle: string }[]; max?: number }) {
  const displayUsers = users.slice(0, max);
  
  if (displayUsers.length === 1) {
    return (
      <motion.div
        whileHover={{ scale: 1.1 }}
        transition={springPop}
      >
        <Avatar className="h-12 w-12 ring-1 ring-border/50">
          <AvatarFallback className="bg-gradient-to-br from-secondary to-secondary/60 text-foreground font-medium">
            {displayUsers[0].name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="relative h-12 w-12"
      whileHover={{ scale: 1.05 }}
      transition={springPop}
    >
      {displayUsers.map((user, idx) => (
        <motion.div
          key={user.handle}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...springBounce, delay: idx * 0.1 }}
        >
          <Avatar 
            className={cn(
              "h-9 w-9 ring-2 ring-background absolute",
              idx === 0 && "top-0 left-0 z-10",
              idx === 1 && "bottom-0 right-0 z-20",
              idx === 2 && "top-1 right-0 z-0"
            )}
          >
            <AvatarFallback className="bg-gradient-to-br from-secondary to-secondary/60 text-foreground text-sm font-medium">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </motion.div>
      ))}
    </motion.div>
  );
}

function NotificationItem({ notification, index }: { notification: Notification; index: number }) {
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

  return (
    <DropdownMenu open={showLongPressMenu} onOpenChange={setShowLongPressMenu}>
      <DropdownMenuTrigger asChild>
        <motion.div
          initial={{ opacity: 0, x: -40, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ ...springBounce, delay: index * 0.04 }}
          whileTap={{ scale: 0.97, x: 5 }}
          whileHover={{ x: 3, backgroundColor: 'hsl(var(--secondary) / 0.3)' }}
          onClick={handleClick}
          onContextMenu={(e) => { e.preventDefault(); setShowLongPressMenu(true); }}
          className={cn(
            'flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors',
            !notification.read && 'bg-primary/[0.05]'
          )}
        >
          {/* Avatar(s) */}
          <div className="relative shrink-0">
            {notification.users && notification.users.length > 0 ? (
              <StackedAvatars users={notification.users} />
            ) : (
              <motion.div 
                className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={springPop}
              >
                {getNotificationIcon(notification.type)}
              </motion.div>
            )}
            {notification.users && notification.users.length > 0 && (
              <motion.div 
                className="absolute -bottom-0.5 -right-0.5 p-1 rounded-full bg-background border border-border/50 shadow-sm"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ ...springPop, delay: index * 0.04 + 0.2 }}
              >
                {getNotificationIcon(notification.type)}
              </motion.div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={cn("text-[14px] text-foreground leading-snug", !notification.read && "font-medium")}>
              {primaryUser && <span className="font-semibold">{primaryUser.name}</span>}
              {' '}{notification.action}
              {' '}<span className="text-muted-foreground/70">{notification.time}</span>
            </p>
            {notification.preview && (
              <p className="text-[13px] text-muted-foreground/80 truncate mt-0.5">{notification.preview}</p>
            )}
          </div>

          {/* Right side */}
          {notification.showFollowButton ? (
            <motion.div
              whileTap={{ scale: 0.85 }}
              transition={springSnap}
            >
              <Button
                size="sm"
                variant={isFollowing ? "outline" : "default"}
                className={cn("shrink-0 h-8 px-4 rounded-lg text-[13px] font-semibold", isFollowing && "border-border/50")}
                onClick={(e) => { e.stopPropagation(); setIsFollowing(!isFollowing); }}
              >
                <motion.span
                  key={isFollowing ? 'following' : 'follow'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={springPop}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </motion.span>
              </Button>
            </motion.div>
          ) : notification.thumbnailUrl ? (
            <motion.div 
              className="w-11 h-11 rounded-lg bg-secondary overflow-hidden shrink-0 ring-1 ring-border/30"
              whileHover={{ scale: 1.1 }}
              transition={springPop}
            >
              <img src={notification.thumbnailUrl} alt="" className="w-full h-full object-cover" />
            </motion.div>
          ) : null}

          {/* Unread dot */}
          <AnimatePresence>
            {!notification.read && !notification.showFollowButton && !notification.thumbnailUrl && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 1] }}
                exit={{ scale: 0 }}
                transition={springPop}
                className="w-2 h-2 rounded-full bg-primary shrink-0 shadow-lg shadow-primary/40" 
              />
            )}
          </AnimatePresence>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-background border-border">
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

function HighlightCard({ notification, index }: { notification: Notification; index: number }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (notification.targetType === 'message') navigate('/messages');
    else if (notification.targetType === 'post') navigate(`/post/${notification.targetId}`);
  };

  const primaryUser = notification.users?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ ...springBounce, delay: index * 0.08 }}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02, y: -2 }}
      onClick={handleClick}
      className="flex items-center gap-4 px-5 py-4 cursor-pointer bg-gradient-to-r from-primary/[0.08] via-primary/[0.04] to-transparent rounded-2xl mx-4 mb-3 border border-primary/10"
    >
      <motion.div 
        className="relative shrink-0"
        animate={{ rotate: [0, -5, 5, 0] }}
        transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
      >
        {notification.users && <StackedAvatars users={notification.users} />}
      </motion.div>

      <div className="flex-1 min-w-0">
        <p className="text-[14px] text-foreground font-semibold leading-snug">
          {primaryUser && <span>{primaryUser.name}</span>}
          {' '}{notification.action}
        </p>
        <p className="text-[12px] text-muted-foreground/70 mt-0.5">{notification.time}</p>
      </div>

      {notification.thumbnailUrl ? (
        <motion.div 
          className="w-11 h-11 rounded-lg bg-secondary overflow-hidden shrink-0 ring-1 ring-border/30"
          whileHover={{ scale: 1.15, rotate: 3 }}
          transition={springPop}
        >
          <img src={notification.thumbnailUrl} alt="" className="w-full h-full object-cover" />
        </motion.div>
      ) : notification.type === 'message' ? (
        <motion.div 
          className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <MessageCircle className="h-5 w-5 text-primary" />
        </motion.div>
      ) : null}
    </motion.div>
  );
}

function EmptyState() {
  const navigate = useNavigate();
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={springBounce}
      className="flex flex-col items-center justify-center py-20 px-6"
    >
      <motion.div 
        className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/40 flex items-center justify-center mb-5"
        animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <CheckCircle className="h-10 w-10 text-primary/60" />
      </motion.div>
      <motion.h3 
        className="text-lg font-semibold text-foreground mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springBounce, delay: 0.2 }}
      >
        You're all caught up
      </motion.h3>
      <motion.p 
        className="text-[14px] text-muted-foreground/70 text-center mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        You've seen all your notifications from the last 30 days
      </motion.p>
      <motion.div
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        transition={springSnap}
      >
        <Button variant="outline" className="rounded-xl" onClick={() => navigate('/settings')}>
          <Settings className="h-4 w-4 mr-2" />
          Notification settings
        </Button>
      </motion.div>
    </motion.div>
  );
}

export default function Notifications() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading] = useState(false);
  const [highlightsExpanded, setHighlightsExpanded] = useState(true);
  const grouped = groupNotificationsByTime(mockNotifications);

  const hasNotifications = mockNotifications.length > 0;
  const allRead = mockNotifications.every(n => n.read);

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      {/* Header */}
      <motion.div 
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={springBounce}
        className="flex items-center gap-4 px-4 py-3.5 border-b border-border/60 bg-background"
      >
        <motion.div whileTap={{ scale: 0.8, x: -5 }} transition={springSnap}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0 -ml-2 h-9 w-9 rounded-full hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </motion.div>
        <motion.h1 
          className="flex-1 font-bold text-xl text-foreground tracking-tight"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...springBounce, delay: 0.1 }}
        >
          Notifications
        </motion.h1>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div>{Array.from({ length: 6 }).map((_, i) => <NotificationSkeleton key={`skeleton-${i}`} />)}</div>
        ) : !hasNotifications || allRead ? (
          <EmptyState />
        ) : (
          <div className="pb-4">
            {/* Highlights */}
            {grouped.highlights.length > 0 && (
              <motion.div 
                className="pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.button
                  className="px-5 pb-3 flex items-center gap-2 w-full"
                  onClick={() => setHighlightsExpanded(!highlightsExpanded)}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="font-semibold text-[15px] text-foreground tracking-tight">Highlights</span>
                  <motion.div
                    animate={{ rotate: highlightsExpanded ? 0 : -90 }}
                    transition={springSnap}
                  >
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                </motion.button>
                <AnimatePresence>
                  {highlightsExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={springElastic}
                    >
                      {grouped.highlights.map((notification, idx) => (
                        <HighlightCard key={notification.id} notification={notification} index={idx} />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Last 7 days */}
            {grouped.recent.length > 0 && (
              <div className="pt-4">
                <motion.div 
                  className="px-5 pb-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...springBounce, delay: 0.2 }}
                >
                  <span className="font-semibold text-[15px] text-foreground tracking-tight">Last 7 days</span>
                </motion.div>
                {grouped.recent.map((notification, idx) => (
                  <NotificationItem key={notification.id} notification={notification} index={idx} />
                ))}
              </div>
            )}

            {/* Earlier */}
            {grouped.earlier.length > 0 && (
              <div className="pt-4">
                <motion.div 
                  className="px-5 pb-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...springBounce, delay: 0.3 }}
                >
                  <span className="font-semibold text-[15px] text-foreground tracking-tight">Earlier</span>
                </motion.div>
                {grouped.earlier.map((notification, idx) => (
                  <NotificationItem key={notification.id} notification={notification} index={idx + grouped.recent.length} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}

// Need to import ChevronDown
import { ChevronDown } from 'lucide-react';

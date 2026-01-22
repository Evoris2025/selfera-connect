import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSafety } from '@/contexts/SafetyContext';

interface NotificationUser {
  name: string;
  handle: string;
  avatarUrl?: string;
}

interface Notification {
  id: string;
  type: 'reaction' | 'follow' | 'comment' | 'mention' | 'community' | 'message' | 'verification';
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
  createdAt: Date;
  actorId?: string;
}

interface UseNotificationsResult {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => Promise<void>;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffWeeks > 0) return `${diffWeeks}w`;
  if (diffDays > 0) return `${diffDays}d`;
  if (diffHours > 0) return `${diffHours}h`;
  if (diffMins > 0) return `${diffMins}m`;
  return 'now';
}

function getActionText(type: string): string {
  switch (type) {
    case 'follow':
      return 'started following you';
    case 'reaction':
      return 'liked your post';
    case 'comment':
      return 'commented on your post';
    case 'mention':
      return 'mentioned you';
    case 'community':
      return 'activity in your community';
    case 'message':
      return 'sent you a message';
    case 'verification':
      return 'Your verification status was updated';
    default:
      return 'interacted with your content';
  }
}

export function useNotifications(): UseNotificationsResult {
  const { user } = useAuth();
  const { shouldHideUser } = useSafety();
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter out notifications from blocked users
  const notifications = useMemo(() => {
    return allNotifications.filter(n => {
      // Filter out notifications from blocked users
      if (n.actorId && shouldHideUser(n.actorId)) {
        return false;
      }
      return true;
    });
  }, [allNotifications, shouldHideUser]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      setAllNotifications([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id,
          type,
          message,
          target_type,
          target_id,
          target_thumbnail_url,
          read_at,
          created_at,
          actor_id,
          profiles!notifications_actor_id_fkey (
            id,
            display_name,
            handle,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedNotifications: Notification[] = (data || []).map(n => {
        const actor = n.profiles as any;
        const createdAt = new Date(n.created_at);
        const actorId = n.actor_id;
        
        return {
          id: n.id,
          type: n.type as Notification['type'],
          users: actor ? [{
            name: actor.display_name || actor.handle || 'Someone',
            handle: actor.handle || 'unknown',
            avatarUrl: actor.avatar_url,
          }] : undefined,
          action: getActionText(n.type),
          preview: n.message || undefined,
          thumbnailUrl: n.target_thumbnail_url || undefined,
          time: formatTimeAgo(createdAt),
          read: !!n.read_at,
          targetType: n.target_type || undefined,
          targetId: n.target_id || undefined,
          showFollowButton: n.type === 'follow',
          isHighlight: !n.read_at && (n.type === 'reaction' || n.type === 'message'),
          createdAt,
          actorId, // Store actor ID for filtering
        };
      });

      setAllNotifications(formattedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    setIsLoading(true);
    fetchNotifications();

    if (!user?.id) return;

    // Subscribe to new notifications
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user?.id) return;

    // Optimistic update
    setAllNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert on error
      fetchNotifications();
    }
  }, [user?.id, fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    // Optimistic update
    setAllNotifications(prev => prev.map(n => ({ ...n, read: true })));

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('read_at', null);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Revert on error
      fetchNotifications();
    }
  }, [user?.id, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}

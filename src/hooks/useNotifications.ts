import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      setUnreadCount(0);
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
        };
      });

      setNotifications(formattedNotifications);
      setUnreadCount(formattedNotifications.filter(n => !n.read).length);
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
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

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
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

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

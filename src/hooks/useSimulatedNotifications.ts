/**
 * SIMULATION MODE: Notifications Hook
 * Returns simulated notification data from MockSystemContext.
 * Always shows mock notifications, never requires real database data.
 */

import { useMockSystem } from '@/contexts/MockSystemContext';
import { useMemo, useCallback } from 'react';

interface NotificationUser {
  name: string;
  handle: string;
  avatarUrl?: string;
  isVerified?: boolean;
  email?: string;
}

export interface Notification {
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
  createdAt: Date;
  actorId?: string;
}

export function useSimulatedNotifications() {
  const { state, markNotificationRead, markAllNotificationsRead, getUnreadNotificationCount } = useMockSystem();

  // Transform mock notifications to match the expected interface
  const notifications = useMemo((): Notification[] => {
    return state.notifications.map(n => ({
      id: n.id,
      type: n.type as Notification['type'],
      users: n.users?.map(u => ({
        name: u.name,
        handle: u.handle,
        avatarUrl: u.avatarUrl,
        isVerified: false,
        email: undefined,
      })),
      action: n.action,
      preview: n.preview,
      thumbnailUrl: n.thumbnailUrl,
      time: n.time,
      read: n.read,
      targetType: n.targetType,
      targetId: n.targetId,
      showFollowButton: n.showFollowButton,
      isHighlight: n.isHighlight,
      count: n.count,
      createdAt: n.timestamp,
      actorId: undefined,
    }));
  }, [state.notifications]);

  const unreadCount = getUnreadNotificationCount();

  const markAsRead = useCallback(async (notificationId: string) => {
    markNotificationRead(notificationId);
  }, [markNotificationRead]);

  const markAllAsRead = useCallback(async () => {
    markAllNotificationsRead();
  }, [markAllNotificationsRead]);

  const refetch = useCallback(async () => {
    // No-op in simulation mode
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading: false, // Always ready in simulation mode
    markAsRead,
    markAllAsRead,
    refetch,
    // Simulation extras
    isSimulated: true,
  };
}

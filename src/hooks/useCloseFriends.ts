import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface CloseFriend {
  id: string;
  userId: string;
  friendUserId: string;
  friendName: string;
  friendHandle: string;
  friendAvatar: string;
  createdAt: Date;
}

/**
 * Hook for managing Close Friends list
 * Currently uses mock data - will integrate with database when migration is approved
 */
export function useCloseFriends() {
  const { user } = useAuth();
  const [closeFriends, setCloseFriends] = useState<CloseFriend[]>([]);
  const [closeFriendIds, setCloseFriendIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Mock close friends
  useEffect(() => {
    if (!user?.id) {
      setCloseFriends([]);
      setCloseFriendIds(new Set());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Mock data - 2 close friends
    const mockCloseFriends: CloseFriend[] = [
      {
        id: 'cf1',
        userId: user.id,
        friendUserId: 'f1',
        friendName: 'Sarah Chen',
        friendHandle: 'sarahc',
        friendAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        createdAt: new Date(),
      },
      {
        id: 'cf2',
        userId: user.id,
        friendUserId: 'f3',
        friendName: 'Emma Roberts',
        friendHandle: 'emmar',
        friendAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
        createdAt: new Date(),
      },
    ];

    setTimeout(() => {
      setCloseFriends(mockCloseFriends);
      setCloseFriendIds(new Set(mockCloseFriends.map(cf => cf.friendUserId)));
      setIsLoading(false);
    }, 200);
  }, [user?.id]);

  const isCloseFriend = useCallback((friendUserId: string): boolean => {
    return closeFriendIds.has(friendUserId);
  }, [closeFriendIds]);

  const addCloseFriend = useCallback(async (
    friendUserId: string,
    friendName: string,
    friendHandle: string,
    friendAvatar: string
  ) => {
    if (!user?.id) return;

    const newCloseFriend: CloseFriend = {
      id: `cf-${Date.now()}`,
      userId: user.id,
      friendUserId,
      friendName,
      friendHandle,
      friendAvatar,
      createdAt: new Date(),
    };

    setCloseFriends(prev => [...prev, newCloseFriend]);
    setCloseFriendIds(prev => new Set([...prev, friendUserId]));
  }, [user?.id]);

  const removeCloseFriend = useCallback(async (friendUserId: string) => {
    setCloseFriends(prev => prev.filter(cf => cf.friendUserId !== friendUserId));
    setCloseFriendIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(friendUserId);
      return newSet;
    });
  }, []);

  const toggleCloseFriend = useCallback(async (
    friendUserId: string,
    friendName: string,
    friendHandle: string,
    friendAvatar: string
  ) => {
    if (isCloseFriend(friendUserId)) {
      await removeCloseFriend(friendUserId);
    } else {
      await addCloseFriend(friendUserId, friendName, friendHandle, friendAvatar);
    }
  }, [isCloseFriend, addCloseFriend, removeCloseFriend]);

  return {
    closeFriends,
    closeFriendIds,
    isLoading,
    isCloseFriend,
    addCloseFriend,
    removeCloseFriend,
    toggleCloseFriend,
    count: closeFriends.length,
  };
}

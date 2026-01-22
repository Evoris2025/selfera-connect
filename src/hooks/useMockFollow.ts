import { useCallback } from 'react';
import { useMockSystem } from '@/contexts/MockSystemContext';
import { useAuth } from '@/contexts/AuthContext';

interface UseMockFollowResult {
  isFollowing: boolean;
  toggleFollow: () => Promise<void>;
  isLoading: boolean;
  followingCount: number;
  followerCount: number;
}

export function useMockFollow(userId: string, userName?: string): UseMockFollowResult {
  const { user } = useAuth();
  const { 
    isFollowing: checkIsFollowing, 
    followUser, 
    unfollowUser,
    getFollowingCount,
    getFollowerCount,
  } = useMockSystem();

  const isFollowing = checkIsFollowing(userId);

  const toggleFollow = useCallback(async () => {
    if (!user?.id) return;
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    if (isFollowing) {
      unfollowUser(userId);
    } else {
      followUser(userId, userName);
    }
  }, [user?.id, userId, userName, isFollowing, followUser, unfollowUser]);

  return {
    isFollowing,
    toggleFollow,
    isLoading: false,
    followingCount: getFollowingCount(),
    followerCount: getFollowerCount(),
  };
}

/**
 * SIMULATION MODE: Profile Stats Hook
 * Returns simulated profile data and stats.
 * Falls back to mock data when no real profile exists.
 */

import { useState, useEffect } from 'react';
import { useMockSystem } from '@/contexts/MockSystemContext';

interface ProfileStats {
  postCount: number;
  followerCount: number;
  followingCount: number;
  communityCount: number;
}

interface Profile {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  bio: string | null;
  location: string | null;
  isVerified: boolean;
  isPrivate: boolean;
  userType: 'individual' | 'organization' | 'professional';
  email: string | null;
}

// Default mock profile for simulation
const MOCK_PROFILE: Profile = {
  id: 'mock-user-id',
  displayName: 'Alex Johnson',
  handle: 'alexj',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  coverUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&h=600&fit=crop',
  bio: 'Advocating for mental health awareness. Sharing my journey one day at a time. #mindfulness #wellbeing',
  location: 'Los Angeles, CA',
  isVerified: true,
  isPrivate: false,
  userType: 'individual',
  email: 'alex@example.com',
};

// Default mock stats for simulation
const MOCK_STATS: ProfileStats = {
  postCount: 147,
  followerCount: 12400,
  followingCount: 567,
  communityCount: 24,
};

export function useSimulatedProfileStats(userId: string) {
  const { state } = useMockSystem();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<ProfileStats>(MOCK_STATS);

  useEffect(() => {
    // Check if we have a mock profile for this user
    const mockProfile = state.profiles.get(userId);
    
    if (mockProfile) {
      setProfile({
        id: mockProfile.id,
        displayName: mockProfile.name,
        handle: mockProfile.handle,
        avatarUrl: mockProfile.avatar,
        coverUrl: null,
        bio: mockProfile.bio || null,
        location: null,
        isVerified: mockProfile.isVerified || false,
        isPrivate: false,
        userType: 'individual',
        email: null,
      });
    } else {
      // Use default mock profile
      setProfile(MOCK_PROFILE);
    }

    // Use mock stats with some derived data
    setStats({
      postCount: state.posts.length || MOCK_STATS.postCount,
      followerCount: state.userState.followers.size || MOCK_STATS.followerCount,
      followingCount: state.userState.following.size || MOCK_STATS.followingCount,
      communityCount: state.userState.communityMembers.size || MOCK_STATS.communityCount,
    });
  }, [userId, state]);

  return {
    profile,
    stats,
    isLoading: false, // Always ready in simulation mode
    error: null,
    refetch: () => Promise.resolve(),
    isSimulated: true,
  };
}

// Hook to fetch user's posts for profile grid (simulated)
export function useSimulatedUserPosts(userId: string) {
  const { state } = useMockSystem();
  
  // Return posts from mock state
  const posts = state.posts.map(p => ({
    id: p.id,
    thumbnail: p.media?.thumbnail || p.media?.url || '/placeholder.svg',
    likes: p.likes || 0,
    comments: p.commentCount || 0,
    isVideo: p.contentType === 'video',
  }));

  return {
    posts,
    isLoading: false,
    isSimulated: true,
  };
}

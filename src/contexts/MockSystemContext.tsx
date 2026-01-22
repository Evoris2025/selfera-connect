import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import type { FeedPost } from '@/components/feed/CrossroadFeed';

// =============================================================================
// TYPES
// =============================================================================

export interface MockComment {
  id: string;
  postId: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
  timestamp: Date;
}

export interface MockNotification {
  id: string;
  type: 'reaction' | 'follow' | 'comment' | 'mention' | 'community' | 'message' | 'verification';
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
  timestamp: Date;
}

export interface MockMessage {
  id: string;
  conversationId: string;
  content: string;
  senderId: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'image';
  imageUrl?: string;
  createdAt: Date;
}

export interface MockConversation {
  id: string;
  participant: {
    id: string;
    name: string;
    handle: string;
    avatarUrl?: string;
    isOnline?: boolean;
  };
  messages: MockMessage[];
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  isTyping?: boolean;
  isNew?: boolean;
}

export interface MockCommunity {
  id: string;
  name: string;
  handle: string;
  description?: string;
  memberCount: number;
  followerCount: number;
  isJoined: boolean;
  isFollowing: boolean;
  avatarUrl?: string;
}

export interface MockProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio?: string;
  isVerified?: boolean;
}

export interface MockUserState {
  following: Set<string>; // Set of user IDs being followed
  followers: Set<string>; // Set of user IDs following current user
  communityMembers: Set<string>; // Personal community members
  joinedCommunities: Set<string>; // Community IDs
  followingCommunities: Set<string>; // Community IDs
  savedPosts: Set<string>; // Post IDs
  reactions: Map<string, string>; // postId -> reactionType
}

export interface MockSystemState {
  posts: FeedPost[];
  comments: Map<string, MockComment[]>; // postId -> comments
  notifications: MockNotification[];
  conversations: MockConversation[];
  communities: MockCommunity[];
  userState: MockUserState;
  profiles: Map<string, MockProfile>;
}

// =============================================================================
// INITIAL DATA
// =============================================================================

const createInitialMockPosts = (): FeedPost[] => [
  {
    id: 'mock-1',
    authorId: 'mock-author-1',
    author: {
      name: 'Sarah Chen',
      handle: 'sarahc',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
      isVerified: true,
    },
    content: 'Taking time for self-care today. Remember: you can\'t pour from an empty cup. 🌸',
    tags: ['selfcare', 'mentalhealth'],
    commentCount: 12,
    createdAt: '2h',
    likes: 47,
    contentType: 'text',
  },
  {
    id: 'mock-2',
    authorId: 'mock-author-2',
    author: {
      name: 'Mind Matters',
      handle: 'mindmatters',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
      isVerified: true,
    },
    content: 'Morning meditation complete. Starting the day with intention and gratitude.',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    },
    tags: ['meditation', 'morning'],
    commentCount: 8,
    createdAt: '4h',
    likes: 89,
    contentType: 'image',
  },
  {
    id: 'mock-video-1',
    authorId: 'mock-author-video-1',
    author: {
      name: 'Calm Studios',
      handle: 'calmstudios',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
      isVerified: true,
    },
    content: 'Find your peace. 🧘‍♀️ A 1-minute breathing exercise to center yourself.',
    media: {
      type: 'video',
      url: 'https://videos.pexels.com/video-files/3571264/3571264-sd_640_360_30fps.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop',
    },
    tags: ['breathing', 'calm'],
    commentCount: 34,
    createdAt: '3h',
    likes: 245,
    contentType: 'video',
  },
  {
    id: 'mock-3',
    authorId: 'mock-author-3',
    author: {
      name: 'James Wilson',
      handle: 'jwilson',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
      isVerified: false,
    },
    content: 'Therapy session today was a breakthrough. It\'s okay to ask for help. 💪',
    tags: ['therapy', 'growth'],
    commentCount: 23,
    createdAt: '6h',
    likes: 156,
    contentType: 'text',
  },
  {
    id: 'mock-4',
    authorId: 'mock-author-4',
    author: {
      name: 'Wellness Hub',
      handle: 'wellnesshub',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
      isVerified: true,
    },
    content: 'Nature walk therapy 🌿 Sometimes the best medicine is fresh air and green spaces.',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    },
    tags: ['nature', 'wellness'],
    commentCount: 15,
    createdAt: '8h',
    likes: 234,
    contentType: 'image',
  },
  {
    id: 'mock-video-2',
    authorId: 'mock-author-video-2',
    author: {
      name: 'Nature Sounds',
      handle: 'naturesounds',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      isVerified: false,
    },
    content: 'Let the ocean waves wash away your stress 🌊',
    media: {
      type: 'video',
      url: 'https://videos.pexels.com/video-files/1093662/1093662-sd_640_360_30fps.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop',
    },
    tags: ['ocean', 'relaxation'],
    commentCount: 19,
    createdAt: '5h',
    likes: 178,
    contentType: 'video',
  },
  {
    id: 'mock-5',
    authorId: 'mock-author-5',
    author: {
      name: 'Emma Roberts',
      handle: 'emmar',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
      isVerified: false,
    },
    content: 'Journaling prompt: What are three things you\'re grateful for today? Share below! ✨',
    tags: ['journaling', 'gratitude'],
    commentCount: 45,
    createdAt: '12h',
    likes: 312,
    contentType: 'text',
  },
  {
    id: 'mock-6',
    authorId: 'mock-author-6',
    author: {
      name: 'Alex Turner',
      handle: 'alext',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      isVerified: false,
    },
    content: 'Breathwork session done. 5 minutes of deep breathing can change your entire day.',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop',
    },
    tags: ['breathwork', 'mindfulness'],
    commentCount: 7,
    createdAt: '1d',
    likes: 78,
    contentType: 'image',
  },
];

const createInitialComments = (): Map<string, MockComment[]> => {
  const map = new Map<string, MockComment[]>();
  
  // Add some default comments
  map.set('mock-1', [
    {
      id: 'comment-1-1',
      postId: 'mock-1',
      author: { name: 'Marcus Johnson', handle: 'marcusj', avatar: '' },
      content: 'This really resonates with me. Thank you for sharing! 💙',
      createdAt: '1h',
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: 'comment-1-2',
      postId: 'mock-1',
      author: { name: 'Jamie Lee', handle: 'jamielee', avatar: '' },
      content: 'Beautifully expressed. We all need reminders like this.',
      createdAt: '30m',
      timestamp: new Date(Date.now() - 1800000),
    },
  ]);
  
  map.set('mock-2', [
    {
      id: 'comment-2-1',
      postId: 'mock-2',
      author: { name: 'Alex Chen', handle: 'alexchen', avatar: '' },
      content: 'What a beautiful scene! Where was this taken?',
      createdAt: '2h',
      timestamp: new Date(Date.now() - 7200000),
    },
  ]);
  
  return map;
};

const createInitialConversations = (): MockConversation[] => [
  {
    id: 'conv-1',
    participant: {
      id: 'user-mindmatters',
      name: 'Mind Matters',
      handle: 'mindmatters',
      isOnline: true,
    },
    messages: [
      { id: 'msg-1-1', conversationId: 'conv-1', content: 'Hey! I saw your post about managing anxiety. Really helpful!', senderId: 'other', timestamp: '10:30 AM', read: true, type: 'text', createdAt: new Date() },
      { id: 'msg-1-2', conversationId: 'conv-1', content: 'Thank you so much! It means a lot to hear that.', senderId: 'me', timestamp: '10:32 AM', read: true, type: 'text', createdAt: new Date() },
      { id: 'msg-1-3', conversationId: 'conv-1', content: 'Do you have any other resources you recommend?', senderId: 'other', timestamp: '10:33 AM', read: true, type: 'text', createdAt: new Date() },
      { id: 'msg-1-4', conversationId: 'conv-1', content: 'Absolutely! I\'ll share some links with you.', senderId: 'me', timestamp: '10:35 AM', read: true, type: 'text', createdAt: new Date() },
      { id: 'msg-1-5', conversationId: 'conv-1', content: 'Thanks for sharing that resource!', senderId: 'other', timestamp: '10:40 AM', read: true, type: 'text', createdAt: new Date() },
    ],
    lastMessage: 'Thanks for sharing that resource!',
    lastMessageTime: '2m',
    unread: true,
  },
  {
    id: 'conv-2',
    participant: {
      id: 'user-drsarah',
      name: 'Dr. Sarah',
      handle: 'drsarah',
      isOnline: true,
    },
    messages: [
      { id: 'msg-2-1', conversationId: 'conv-2', content: 'Looking forward to our session tomorrow!', senderId: 'other', timestamp: '1h', read: true, type: 'text', createdAt: new Date() },
      { id: 'msg-2-2', conversationId: 'conv-2', content: '💪', senderId: 'other', timestamp: '1h', read: true, type: 'text', createdAt: new Date() },
    ],
    lastMessage: '💪',
    lastMessageTime: '1h',
    unread: true,
  },
  {
    id: 'conv-3',
    participant: {
      id: 'user-jamie',
      name: 'Jamie',
      handle: 'jamie_journey',
      isOnline: false,
    },
    messages: [
      { id: 'msg-3-1', conversationId: 'conv-3', content: 'Are you coming to the community meetup?', senderId: 'other', timestamp: '3h', read: true, type: 'text', createdAt: new Date() },
      { id: 'msg-3-2', conversationId: 'conv-3', content: 'Yes! See you there!', senderId: 'me', timestamp: '3h', read: true, type: 'text', createdAt: new Date() },
      { id: 'msg-3-3', conversationId: 'conv-3', content: 'See you at the community meetup!', senderId: 'other', timestamp: '3h', read: true, type: 'text', createdAt: new Date() },
    ],
    lastMessage: 'See you at the community meetup!',
    lastMessageTime: '3h',
    unread: false,
  },
];

const createInitialNotifications = (): MockNotification[] => [
  {
    id: 'notif-h1',
    type: 'message',
    users: [{ name: 'Mind Matters', handle: 'mindmatters' }, { name: 'Dr. Sarah', handle: 'drsarah' }],
    action: 'and others sent you messages',
    count: 5,
    time: '2h',
    read: false,
    isHighlight: true,
    targetType: 'message',
    timestamp: new Date(Date.now() - 7200000),
  },
  {
    id: 'notif-h2',
    type: 'reaction',
    users: [{ name: 'Jamie', handle: 'jamie_journey' }, { name: 'Alex Chen', handle: 'alexchen' }, { name: 'Wellness Hub', handle: 'wellnesshub' }],
    action: 'and 12 others liked your post',
    count: 15,
    time: '4h',
    read: false,
    isHighlight: true,
    targetType: 'post',
    targetId: 'mock-1',
    thumbnailUrl: '/placeholder.svg',
    timestamp: new Date(Date.now() - 14400000),
  },
];

const createInitialCommunities = (): MockCommunity[] => [
  { id: 'comm-1', name: 'Mindfulness Circle', handle: 'mindfulness', description: 'A space for mindfulness practice', memberCount: 1250, followerCount: 3400, isJoined: false, isFollowing: false },
  { id: 'comm-2', name: 'Anxiety Support', handle: 'anxietysupport', description: 'Supporting each other through anxiety', memberCount: 890, followerCount: 2100, isJoined: false, isFollowing: false },
  { id: 'comm-3', name: 'Self Care Club', handle: 'selfcareclub', description: 'Daily self-care tips and motivation', memberCount: 2300, followerCount: 5600, isJoined: false, isFollowing: false },
  { id: 'comm-4', name: 'Wellness Warriors', handle: 'wellnesswarriors', description: 'Fighting for mental wellness together', memberCount: 670, followerCount: 1800, isJoined: false, isFollowing: false },
  { id: 'comm-5', name: 'Gratitude Journal', handle: 'gratitudejournal', description: 'Share what you\'re grateful for', memberCount: 1100, followerCount: 2900, isJoined: false, isFollowing: false },
];

// =============================================================================
// CONTEXT
// =============================================================================

interface MockSystemContextType {
  state: MockSystemState;
  
  // Post actions
  addPost: (post: FeedPost) => void;
  updatePostLikes: (postId: string, delta: number) => void;
  updatePostCommentCount: (postId: string, delta: number) => void;
  getPost: (postId: string) => FeedPost | undefined;
  
  // Reaction actions
  setReaction: (postId: string, reactionType: string | null) => void;
  getReaction: (postId: string) => string | null;
  
  // Comment actions
  addComment: (postId: string, content: string, author: { name: string; handle: string; avatar: string }) => void;
  getComments: (postId: string) => MockComment[];
  
  // Follow actions
  followUser: (userId: string, userName?: string) => void;
  unfollowUser: (userId: string) => void;
  isFollowing: (userId: string) => boolean;
  getFollowingCount: () => number;
  getFollowerCount: () => number;
  
  // Community member actions (personal community)
  addToCommunity: (userId: string, userName?: string) => void;
  removeFromCommunity: (userId: string) => void;
  isInCommunity: (userId: string) => boolean;
  getCommunityCount: () => number;
  
  // Save/Library actions
  toggleSave: (postId: string) => void;
  isSaved: (postId: string) => boolean;
  getSavedCount: () => number;
  
  // Notification actions
  addNotification: (notification: Omit<MockNotification, 'id' | 'timestamp'>) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  getUnreadNotificationCount: () => number;
  
  // Message actions
  sendMessage: (conversationId: string, content: string, imageUrl?: string) => void;
  getConversation: (conversationId: string) => MockConversation | undefined;
  getUnreadMessageCount: () => number;
  markConversationRead: (conversationId: string) => void;
  
  // Community actions
  joinCommunity: (communityId: string) => void;
  leaveCommunity: (communityId: string) => void;
  followCommunity: (communityId: string) => void;
  unfollowCommunity: (communityId: string) => void;
  
  // Stats derived from state
  getPostCount: () => number;
}

const MockSystemContext = createContext<MockSystemContextType | null>(null);

// =============================================================================
// PROVIDER
// =============================================================================

export function MockSystemProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MockSystemState>(() => ({
    posts: createInitialMockPosts(),
    comments: createInitialComments(),
    notifications: createInitialNotifications(),
    conversations: createInitialConversations(),
    communities: createInitialCommunities(),
    userState: {
      following: new Set<string>(),
      followers: new Set<string>(['mock-follower-1', 'mock-follower-2', 'mock-follower-3']), // Start with some followers
      communityMembers: new Set<string>(),
      joinedCommunities: new Set<string>(),
      followingCommunities: new Set<string>(),
      savedPosts: new Set<string>(),
      reactions: new Map<string, string>(),
    },
    profiles: new Map<string, MockProfile>(),
  }));

  // -------------------------------------------------------------------------
  // POST ACTIONS
  // -------------------------------------------------------------------------
  
  const addPost = useCallback((post: FeedPost) => {
    setState(prev => ({
      ...prev,
      posts: [post, ...prev.posts],
    }));
  }, []);

  const updatePostLikes = useCallback((postId: string, delta: number) => {
    setState(prev => ({
      ...prev,
      posts: prev.posts.map(p => 
        p.id === postId 
          ? { ...p, likes: Math.max(0, p.likes + delta) }
          : p
      ),
    }));
  }, []);

  const updatePostCommentCount = useCallback((postId: string, delta: number) => {
    setState(prev => ({
      ...prev,
      posts: prev.posts.map(p => 
        p.id === postId 
          ? { ...p, commentCount: Math.max(0, p.commentCount + delta) }
          : p
      ),
    }));
  }, []);

  const getPost = useCallback((postId: string) => {
    return state.posts.find(p => p.id === postId);
  }, [state.posts]);

  // -------------------------------------------------------------------------
  // REACTION ACTIONS
  // -------------------------------------------------------------------------

  const setReaction = useCallback((postId: string, reactionType: string | null) => {
    setState(prev => {
      const newReactions = new Map(prev.userState.reactions);
      const previousReaction = newReactions.get(postId);
      
      // Calculate likes delta
      let likesDelta = 0;
      if (previousReaction && !reactionType) {
        likesDelta = -1; // Removing reaction
      } else if (!previousReaction && reactionType) {
        likesDelta = 1; // Adding reaction
      }
      // If changing reaction type, delta is 0
      
      if (reactionType) {
        newReactions.set(postId, reactionType);
      } else {
        newReactions.delete(postId);
      }
      
      return {
        ...prev,
        userState: {
          ...prev.userState,
          reactions: newReactions,
        },
        posts: prev.posts.map(p => 
          p.id === postId 
            ? { ...p, likes: Math.max(0, p.likes + likesDelta) }
            : p
        ),
      };
    });
  }, []);

  const getReaction = useCallback((postId: string) => {
    return state.userState.reactions.get(postId) || null;
  }, [state.userState.reactions]);

  // -------------------------------------------------------------------------
  // COMMENT ACTIONS
  // -------------------------------------------------------------------------

  const addComment = useCallback((postId: string, content: string, author: { name: string; handle: string; avatar: string }) => {
    const newComment: MockComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      postId,
      author,
      content,
      createdAt: 'Just now',
      timestamp: new Date(),
    };

    setState(prev => {
      const existingComments = prev.comments.get(postId) || [];
      const newComments = new Map(prev.comments);
      newComments.set(postId, [...existingComments, newComment]);
      
      // Also update comment count on the post
      const updatedPosts = prev.posts.map(p => 
        p.id === postId 
          ? { ...p, commentCount: p.commentCount + 1 }
          : p
      );

      // Generate notification for post author
      const post = prev.posts.find(p => p.id === postId);
      const newNotifications = [...prev.notifications];
      if (post && post.authorId !== 'current-user') {
        newNotifications.unshift({
          id: `notif-${Date.now()}`,
          type: 'comment',
          users: [{ name: author.name, handle: author.handle }],
          action: 'commented on your post',
          preview: content.length > 50 ? content.substring(0, 50) + '...' : content,
          time: 'Just now',
          read: false,
          targetType: 'post',
          targetId: postId,
          timestamp: new Date(),
        });
      }

      return {
        ...prev,
        comments: newComments,
        posts: updatedPosts,
        notifications: newNotifications,
      };
    });
  }, []);

  const getComments = useCallback((postId: string) => {
    return state.comments.get(postId) || [];
  }, [state.comments]);

  // -------------------------------------------------------------------------
  // FOLLOW ACTIONS
  // -------------------------------------------------------------------------

  const followUser = useCallback((userId: string, userName?: string) => {
    setState(prev => {
      const newFollowing = new Set(prev.userState.following);
      newFollowing.add(userId);
      
      // Generate notification
      const newNotifications = [...prev.notifications];
      newNotifications.unshift({
        id: `notif-${Date.now()}`,
        type: 'follow',
        users: [{ name: userName || 'Someone', handle: userId }],
        action: 'You started following',
        time: 'Just now',
        read: true, // Mark as read since it's your own action
        targetType: 'profile',
        targetId: userId,
        timestamp: new Date(),
      });

      return {
        ...prev,
        userState: {
          ...prev.userState,
          following: newFollowing,
        },
        notifications: newNotifications,
      };
    });
  }, []);

  const unfollowUser = useCallback((userId: string) => {
    setState(prev => {
      const newFollowing = new Set(prev.userState.following);
      newFollowing.delete(userId);
      return {
        ...prev,
        userState: {
          ...prev.userState,
          following: newFollowing,
        },
      };
    });
  }, []);

  const isFollowing = useCallback((userId: string) => {
    return state.userState.following.has(userId);
  }, [state.userState.following]);

  const getFollowingCount = useCallback(() => {
    return state.userState.following.size;
  }, [state.userState.following]);

  const getFollowerCount = useCallback(() => {
    return state.userState.followers.size;
  }, [state.userState.followers]);

  // -------------------------------------------------------------------------
  // COMMUNITY MEMBER ACTIONS (Personal community)
  // -------------------------------------------------------------------------

  const addToCommunity = useCallback((userId: string, userName?: string) => {
    setState(prev => {
      const newMembers = new Set(prev.userState.communityMembers);
      newMembers.add(userId);
      
      return {
        ...prev,
        userState: {
          ...prev.userState,
          communityMembers: newMembers,
        },
      };
    });
  }, []);

  const removeFromCommunity = useCallback((userId: string) => {
    setState(prev => {
      const newMembers = new Set(prev.userState.communityMembers);
      newMembers.delete(userId);
      return {
        ...prev,
        userState: {
          ...prev.userState,
          communityMembers: newMembers,
        },
      };
    });
  }, []);

  const isInCommunity = useCallback((userId: string) => {
    return state.userState.communityMembers.has(userId);
  }, [state.userState.communityMembers]);

  const getCommunityCount = useCallback(() => {
    return state.userState.communityMembers.size;
  }, [state.userState.communityMembers]);

  // -------------------------------------------------------------------------
  // SAVE/LIBRARY ACTIONS
  // -------------------------------------------------------------------------

  const toggleSave = useCallback((postId: string) => {
    setState(prev => {
      const newSaved = new Set(prev.userState.savedPosts);
      if (newSaved.has(postId)) {
        newSaved.delete(postId);
      } else {
        newSaved.add(postId);
      }
      return {
        ...prev,
        userState: {
          ...prev.userState,
          savedPosts: newSaved,
        },
      };
    });
  }, []);

  const isSaved = useCallback((postId: string) => {
    return state.userState.savedPosts.has(postId);
  }, [state.userState.savedPosts]);

  const getSavedCount = useCallback(() => {
    return state.userState.savedPosts.size;
  }, [state.userState.savedPosts]);

  // -------------------------------------------------------------------------
  // NOTIFICATION ACTIONS
  // -------------------------------------------------------------------------

  const addNotification = useCallback((notification: Omit<MockNotification, 'id' | 'timestamp'>) => {
    setState(prev => ({
      ...prev,
      notifications: [
        {
          ...notification,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
        },
        ...prev.notifications,
      ],
    }));
  }, []);

  const markNotificationRead = useCallback((notificationId: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true })),
    }));
  }, []);

  const getUnreadNotificationCount = useCallback(() => {
    return state.notifications.filter(n => !n.read).length;
  }, [state.notifications]);

  // -------------------------------------------------------------------------
  // MESSAGE ACTIONS
  // -------------------------------------------------------------------------

  const sendMessage = useCallback((conversationId: string, content: string, imageUrl?: string) => {
    const newMessage: MockMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      content,
      senderId: 'me',
      timestamp: 'Just now',
      read: false,
      type: imageUrl ? 'image' : 'text',
      imageUrl,
      createdAt: new Date(),
    };

    setState(prev => ({
      ...prev,
      conversations: prev.conversations.map(conv => 
        conv.id === conversationId 
          ? {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastMessage: imageUrl ? '📷 Photo' : content,
              lastMessageTime: 'Just now',
            }
          : conv
      ),
    }));
  }, []);

  const getConversation = useCallback((conversationId: string) => {
    return state.conversations.find(c => c.id === conversationId);
  }, [state.conversations]);

  const getUnreadMessageCount = useCallback(() => {
    return state.conversations.filter(c => c.unread).length;
  }, [state.conversations]);

  const markConversationRead = useCallback((conversationId: string) => {
    setState(prev => ({
      ...prev,
      conversations: prev.conversations.map(conv => 
        conv.id === conversationId ? { ...conv, unread: false } : conv
      ),
    }));
  }, []);

  // -------------------------------------------------------------------------
  // COMMUNITY ACTIONS
  // -------------------------------------------------------------------------

  const joinCommunity = useCallback((communityId: string) => {
    setState(prev => {
      const newJoined = new Set(prev.userState.joinedCommunities);
      newJoined.add(communityId);
      
      return {
        ...prev,
        userState: {
          ...prev.userState,
          joinedCommunities: newJoined,
        },
        communities: prev.communities.map(c => 
          c.id === communityId 
            ? { ...c, isJoined: true, memberCount: c.memberCount + 1 }
            : c
        ),
      };
    });
  }, []);

  const leaveCommunity = useCallback((communityId: string) => {
    setState(prev => {
      const newJoined = new Set(prev.userState.joinedCommunities);
      newJoined.delete(communityId);
      
      return {
        ...prev,
        userState: {
          ...prev.userState,
          joinedCommunities: newJoined,
        },
        communities: prev.communities.map(c => 
          c.id === communityId 
            ? { ...c, isJoined: false, memberCount: Math.max(0, c.memberCount - 1) }
            : c
        ),
      };
    });
  }, []);

  const followCommunity = useCallback((communityId: string) => {
    setState(prev => {
      const newFollowing = new Set(prev.userState.followingCommunities);
      newFollowing.add(communityId);
      
      return {
        ...prev,
        userState: {
          ...prev.userState,
          followingCommunities: newFollowing,
        },
        communities: prev.communities.map(c => 
          c.id === communityId 
            ? { ...c, isFollowing: true, followerCount: c.followerCount + 1 }
            : c
        ),
      };
    });
  }, []);

  const unfollowCommunity = useCallback((communityId: string) => {
    setState(prev => {
      const newFollowing = new Set(prev.userState.followingCommunities);
      newFollowing.delete(communityId);
      
      return {
        ...prev,
        userState: {
          ...prev.userState,
          followingCommunities: newFollowing,
        },
        communities: prev.communities.map(c => 
          c.id === communityId 
            ? { ...c, isFollowing: false, followerCount: Math.max(0, c.followerCount - 1) }
            : c
        ),
      };
    });
  }, []);

  // -------------------------------------------------------------------------
  // STATS
  // -------------------------------------------------------------------------

  const getPostCount = useCallback(() => {
    // Count posts by "current user" - for demo, count all mock posts
    return state.posts.length;
  }, [state.posts]);

  // -------------------------------------------------------------------------
  // CONTEXT VALUE
  // -------------------------------------------------------------------------

  const value = useMemo<MockSystemContextType>(() => ({
    state,
    addPost,
    updatePostLikes,
    updatePostCommentCount,
    getPost,
    setReaction,
    getReaction,
    addComment,
    getComments,
    followUser,
    unfollowUser,
    isFollowing,
    getFollowingCount,
    getFollowerCount,
    addToCommunity,
    removeFromCommunity,
    isInCommunity,
    getCommunityCount,
    toggleSave,
    isSaved,
    getSavedCount,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    getUnreadNotificationCount,
    sendMessage,
    getConversation,
    getUnreadMessageCount,
    markConversationRead,
    joinCommunity,
    leaveCommunity,
    followCommunity,
    unfollowCommunity,
    getPostCount,
  }), [
    state,
    addPost,
    updatePostLikes,
    updatePostCommentCount,
    getPost,
    setReaction,
    getReaction,
    addComment,
    getComments,
    followUser,
    unfollowUser,
    isFollowing,
    getFollowingCount,
    getFollowerCount,
    addToCommunity,
    removeFromCommunity,
    isInCommunity,
    getCommunityCount,
    toggleSave,
    isSaved,
    getSavedCount,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    getUnreadNotificationCount,
    sendMessage,
    getConversation,
    getUnreadMessageCount,
    markConversationRead,
    joinCommunity,
    leaveCommunity,
    followCommunity,
    unfollowCommunity,
    getPostCount,
  ]);

  return (
    <MockSystemContext.Provider value={value}>
      {children}
    </MockSystemContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

export function useMockSystem() {
  const context = useContext(MockSystemContext);
  if (!context) {
    // During HMR, context might be temporarily unavailable
    // Return a minimal fallback to prevent crashes
    console.warn('MockSystemContext not available, returning fallback');
    const fallback: MockSystemContextType = {
      state: {
        posts: [],
        comments: new Map(),
        notifications: [],
        conversations: [],
        communities: [],
        userState: {
          following: new Set(),
          followers: new Set(),
          communityMembers: new Set(),
          joinedCommunities: new Set(),
          followingCommunities: new Set(),
          savedPosts: new Set(),
          reactions: new Map(),
        },
        profiles: new Map(),
      },
      addPost: () => {},
      updatePostLikes: () => {},
      updatePostCommentCount: () => {},
      getPost: () => undefined,
      setReaction: () => {},
      getReaction: () => null,
      addComment: () => {},
      getComments: () => [],
      followUser: () => {},
      unfollowUser: () => {},
      isFollowing: () => false,
      getFollowerCount: () => 0,
      getFollowingCount: () => 0,
      addToCommunity: () => {},
      removeFromCommunity: () => {},
      isInCommunity: () => false,
      getCommunityCount: () => 0,
      toggleSave: () => {},
      isSaved: () => false,
      getSavedCount: () => 0,
      addNotification: () => {},
      markNotificationRead: () => {},
      markAllNotificationsRead: () => {},
      getUnreadNotificationCount: () => 0,
      sendMessage: () => {},
      getConversation: () => undefined,
      getUnreadMessageCount: () => 0,
      markConversationRead: () => {},
      joinCommunity: () => {},
      leaveCommunity: () => {},
      followCommunity: () => {},
      unfollowCommunity: () => {},
      getPostCount: () => 0,
    };
    return fallback;
  }
  return context;
}

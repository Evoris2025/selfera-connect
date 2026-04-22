import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { FeedPost } from '@/components/feed/CrossroadFeed';
import type { ReactionType } from '@/components/feed/ReactionPicker';
import { useAuth } from '@/contexts/AuthContext';
import { MockUUIDs, generateMockUUID, getMockUUID } from '@/lib/mockUUIDs';

// =============================================================================
// TYPES
// =============================================================================

// Audience union shared across all creators
export type StudioAudience = 'public' | 'followers' | 'close_friends' | 'only_me' | 'custom';

// Expression mode: ephemeral story vs permanent reel
export type ExpressionMode = 'story' | 'reel';

// Text-post background (Facebook-style styled posts)
export interface PostBackground {
  type: 'color' | 'gradient';
  value: string; // CSS color or gradient string
  textColor?: string;
}

export interface FeedExpression {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  thumbnailUrl?: string;
  caption?: string;
  hasUnseenExpression: boolean;
  createdAt: Date;
  expiresAt: Date;
  // New (additive, optional, defaulted)
  mode?: ExpressionMode;          // 'story' (default) or 'reel'
  audience?: StudioAudience;      // default 'public'
  scheduledAt?: number | null;    // epoch ms; null/undef = published immediately
  remixOfId?: string;
}

// =============================================================================
// DRAFTS & SCHEDULED
// =============================================================================

export type StudioContentKind = 'expression' | 'video' | 'photo' | 'post';

export interface StudioDraft {
  id: string;
  kind: StudioContentKind;
  title: string;
  data: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export interface ScheduledItem {
  id: string;
  kind: StudioContentKind;
  scheduledAt: number;
  payload: Record<string, unknown>; // raw createPost / createExpression args
  createdAt: number;
}

export interface FeedComment {
  id: string;
  postId: string;
  userId: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    isVerified?: boolean;
    email?: string;
  };
  content: string;
  createdAt: string;
  timestamp: Date;
}

export interface FeedUserState {
  reactions: Record<string, ReactionType>; // postId -> reaction type
  savedPosts: string[]; // post IDs
  communityMembers: string[]; // user IDs
  mutedUsers: string[];
  blockedUsers: string[];
}

interface PersistedFeedState {
  posts: FeedPost[];
  comments: Record<string, FeedComment[]>;
  expressions: FeedExpression[];
  userState: FeedUserState;
  drafts?: StudioDraft[];
  scheduled?: ScheduledItem[];
  lastUpdated: number;
}

// =============================================================================
// STORAGE KEY & HELPERS
// =============================================================================

const STORAGE_KEY = 'selfiera_feed_data';

function loadPersistedState(): PersistedFeedState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    // Rehydrate dates
    if (parsed.expressions) {
      parsed.expressions = parsed.expressions.map((e: FeedExpression) => ({
        ...e,
        createdAt: new Date(e.createdAt),
        expiresAt: new Date(e.expiresAt),
      }));
    }
    if (parsed.comments) {
      Object.keys(parsed.comments).forEach(postId => {
        parsed.comments[postId] = parsed.comments[postId].map((c: FeedComment) => ({
          ...c,
          timestamp: new Date(c.timestamp),
        }));
      });
    }
    return parsed;
  } catch {
    return null;
  }
}

function savePersistedState(state: PersistedFeedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to persist feed state:', e);
  }
}

// =============================================================================
// INITIAL MOCK DATA WITH STABLE UUIDs
// =============================================================================

const createInitialExpressions = (): FeedExpression[] => [
  {
    id: MockUUIDs.EXPR_1,
    userId: MockUUIDs.JENNIFER,
    userName: 'Jennifer',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    mediaUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=700&fit=crop',
    mediaType: 'image',
    caption: 'Morning gratitude practice ✨ Starting the day with intention',
    hasUnseenExpression: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000),
  },
  {
    id: MockUUIDs.EXPR_2,
    userId: MockUUIDs.CODY,
    userName: 'Cody',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    mediaUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=700&fit=crop',
    mediaType: 'image',
    caption: 'Nature walks are my therapy 🌿 #mindfulness',
    hasUnseenExpression: true,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000),
  },
  {
    id: MockUUIDs.EXPR_3,
    userId: MockUUIDs.AMY,
    userName: 'Amy',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    mediaUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=700&fit=crop',
    mediaType: 'image',
    caption: 'One step at a time. Progress, not perfection 💪',
    hasUnseenExpression: true,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000),
  },
  {
    id: MockUUIDs.EXPR_4,
    userId: MockUUIDs.TRENT,
    userName: 'Trent',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    mediaUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=700&fit=crop',
    mediaType: 'image',
    caption: 'Finding peace in the little moments',
    hasUnseenExpression: false,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
  },
  {
    id: MockUUIDs.EXPR_5,
    userId: MockUUIDs.DONNA,
    userName: 'Donna',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
    mediaUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=700&fit=crop',
    mediaType: 'image',
    caption: 'Self-care Sunday vibes 🧘‍♀️',
    hasUnseenExpression: true,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 16 * 60 * 60 * 1000),
  },
  {
    id: MockUUIDs.EXPR_6,
    userId: MockUUIDs.MARCUS,
    userName: 'Marcus',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    mediaUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=700&fit=crop',
    mediaType: 'image',
    caption: 'Grateful for this community 🙏 #wellbeing #support',
    hasUnseenExpression: true,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 23 * 60 * 60 * 1000),
  },
];

const createInitialPosts = (): FeedPost[] => [
  {
    id: MockUUIDs.POST_1,
    authorId: MockUUIDs.SARAH_CHEN,
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
    id: MockUUIDs.POST_2,
    authorId: MockUUIDs.MIND_MATTERS,
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
    id: MockUUIDs.POST_VIDEO_1,
    authorId: MockUUIDs.CALM_STUDIOS,
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
    id: MockUUIDs.POST_3,
    authorId: MockUUIDs.JAMES_WILSON,
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
    id: MockUUIDs.POST_4,
    authorId: MockUUIDs.WELLNESS_HUB,
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
    id: MockUUIDs.POST_VIDEO_2,
    authorId: MockUUIDs.NATURE_SOUNDS,
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
    id: MockUUIDs.POST_5,
    authorId: MockUUIDs.EMMA_ROBERTS,
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
    id: MockUUIDs.POST_6,
    authorId: MockUUIDs.ALEX_TURNER,
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

const createInitialComments = (): Record<string, FeedComment[]> => ({
  [MockUUIDs.POST_1]: [
    {
      id: MockUUIDs.COMMENT_1_1,
      postId: MockUUIDs.POST_1,
      userId: MockUUIDs.MARCUS_JOHNSON,
      author: { name: 'Marcus Johnson', handle: 'marcusj', avatar: '' },
      content: 'This really resonates with me. Thank you for sharing! 💙',
      createdAt: '1h',
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: MockUUIDs.COMMENT_1_2,
      postId: MockUUIDs.POST_1,
      userId: MockUUIDs.JAMIE_LEE,
      author: { name: 'Jamie Lee', handle: 'jamielee', avatar: '' },
      content: 'Beautifully expressed. We all need reminders like this.',
      createdAt: '30m',
      timestamp: new Date(Date.now() - 1800000),
    },
  ],
  [MockUUIDs.POST_2]: [
    {
      id: MockUUIDs.COMMENT_2_1,
      postId: MockUUIDs.POST_2,
      userId: MockUUIDs.ALEX_CHEN,
      author: { name: 'Alex Chen', handle: 'alexchen', avatar: '' },
      content: 'What a beautiful scene! Where was this taken?',
      createdAt: '2h',
      timestamp: new Date(Date.now() - 7200000),
    },
  ],
});

const createInitialUserState = (): FeedUserState => ({
  reactions: {},
  savedPosts: [],
  communityMembers: [],
  mutedUsers: [],
  blockedUsers: [],
});

// =============================================================================
// CONTEXT TYPE
// =============================================================================

interface FeedDataContextType {
  // State
  posts: FeedPost[];
  expressions: FeedExpression[];
  isSimulationMode: boolean;
  
  // Post operations
  createPost: (post: Omit<FeedPost, 'id' | 'createdAt' | 'commentCount' | 'likes'>) => void;
  getPost: (postId: string) => FeedPost | undefined;
  
  // Reaction operations
  getReaction: (postId: string) => ReactionType | null;
  setReaction: (postId: string, type: ReactionType | null) => void;
  getReactionCount: (postId: string) => number;
  
  // Comment operations
  getComments: (postId: string) => FeedComment[];
  getCommentCount: (postId: string) => number;
  addComment: (postId: string, content: string) => void;
  
  // Library/Save operations
  isSaved: (postId: string) => boolean;
  toggleSave: (postId: string) => void;
  
  // Personal community operations
  isInCommunity: (userId: string) => boolean;
  toggleCommunity: (userId: string) => void;
  getCommunityCount: () => number;
  
  // Expression operations
  getExpressions: () => FeedExpression[];
  createExpression: (expression: Omit<FeedExpression, 'id' | 'createdAt' | 'expiresAt'>) => void;
  markExpressionSeen: (expressionId: string) => void;
  
  // Safety operations
  isMuted: (userId: string) => boolean;
  isBlocked: (userId: string) => boolean;
  muteUser: (userId: string) => void;
  unmuteUser: (userId: string) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  
  // Utility
  refreshFeed: () => void;

  // Drafts (unified across all four creators)
  drafts: StudioDraft[];
  saveDraft: (draft: Omit<StudioDraft, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => StudioDraft;
  deleteDraft: (id: string) => void;
  getDraft: (id: string) => StudioDraft | undefined;
  getDraftsByKind: (kind: StudioContentKind) => StudioDraft[];

  // Scheduled
  scheduled: ScheduledItem[];
  schedulePublish: (item: Omit<ScheduledItem, 'id' | 'createdAt'>) => ScheduledItem;
  cancelScheduled: (id: string) => void;
  updateScheduled: (id: string, patch: Partial<Pick<ScheduledItem, 'scheduledAt' | 'payload'>>) => void;
}

const FeedDataContext = createContext<FeedDataContextType | null>(null);

// =============================================================================
// PROVIDER
// =============================================================================

export function FeedDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // Initialize state from localStorage or defaults
  const [posts, setPosts] = useState<FeedPost[]>(() => {
    const persisted = loadPersistedState();
    return persisted?.posts ?? createInitialPosts();
  });
  
  const [comments, setComments] = useState<Record<string, FeedComment[]>>(() => {
    const persisted = loadPersistedState();
    return persisted?.comments ?? createInitialComments();
  });
  
  const [expressions, setExpressions] = useState<FeedExpression[]>(() => {
    const persisted = loadPersistedState();
    return persisted?.expressions ?? createInitialExpressions();
  });
  
  const [userState, setUserState] = useState<FeedUserState>(() => {
    const persisted = loadPersistedState();
    return persisted?.userState ?? createInitialUserState();
  });

  const [drafts, setDrafts] = useState<StudioDraft[]>(() => {
    const persisted = loadPersistedState();
    return persisted?.drafts ?? [];
  });

  const [scheduled, setScheduled] = useState<ScheduledItem[]>(() => {
    const persisted = loadPersistedState();
    return persisted?.scheduled ?? [];
  });

  const isSimulationMode = true; // Always simulation for now
  
  // Persist state on changes
  useEffect(() => {
    const state: PersistedFeedState = {
      posts,
      comments,
      expressions,
      userState,
      drafts,
      scheduled,
      lastUpdated: Date.now(),
    };
    savePersistedState(state);
  }, [posts, comments, expressions, userState, drafts, scheduled]);
  
  // ---------------------------------------------------------------------------
  // POST OPERATIONS
  // ---------------------------------------------------------------------------
  
  const createPost = useCallback((postData: Omit<FeedPost, 'id' | 'createdAt' | 'commentCount' | 'likes'>) => {
    const newPost: FeedPost = {
      ...postData,
      id: generateMockUUID(), // Use proper UUID for new posts
      createdAt: 'Just now',
      commentCount: 0,
      likes: 0,
    };
    
    setPosts(prev => [newPost, ...prev]);
    
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(10);
  }, []);
  
  const getPost = useCallback((postId: string) => {
    return posts.find(p => p.id === postId);
  }, [posts]);
  
  // ---------------------------------------------------------------------------
  // REACTION OPERATIONS
  // ---------------------------------------------------------------------------
  
  const getReaction = useCallback((postId: string): ReactionType | null => {
    return userState.reactions[postId] || null;
  }, [userState.reactions]);
  
  const setReaction = useCallback((postId: string, type: ReactionType | null) => {
    setUserState(prev => {
      const previousReaction = prev.reactions[postId];
      const newReactions = { ...prev.reactions };
      
      if (type) {
        newReactions[postId] = type;
      } else {
        delete newReactions[postId];
      }
      
      return { ...prev, reactions: newReactions };
    });
    
    // Update post likes count
    setPosts(prev => prev.map(post => {
      if (post.id !== postId) return post;
      
      const hadReaction = !!userState.reactions[postId];
      const hasReaction = !!type;
      
      let delta = 0;
      if (!hadReaction && hasReaction) delta = 1;
      else if (hadReaction && !hasReaction) delta = -1;
      
      return { ...post, likes: Math.max(0, post.likes + delta) };
    }));
    
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(10);
  }, [userState.reactions]);
  
  const getReactionCount = useCallback((postId: string): number => {
    const post = posts.find(p => p.id === postId);
    return post?.likes ?? 0;
  }, [posts]);
  
  // ---------------------------------------------------------------------------
  // COMMENT OPERATIONS
  // ---------------------------------------------------------------------------
  
  const getComments = useCallback((postId: string): FeedComment[] => {
    return comments[postId] || [];
  }, [comments]);
  
  const getCommentCount = useCallback((postId: string): number => {
    const post = posts.find(p => p.id === postId);
    return post?.commentCount ?? (comments[postId]?.length ?? 0);
  }, [posts, comments]);
  
  const addComment = useCallback((postId: string, content: string) => {
    if (!content.trim() || !user) return;
    
    const newComment: FeedComment = {
      id: generateMockUUID(), // Use proper UUID for new comments
      postId,
      userId: user.id,
      author: {
        name: user.email?.split('@')[0] || 'You',
        handle: user.email?.split('@')[0] || 'you',
        avatar: '',
      },
      content: content.trim(),
      createdAt: 'Just now',
      timestamp: new Date(),
    };
    
    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment],
    }));
    
    // Update post comment count
    setPosts(prev => prev.map(post =>
      post.id === postId
        ? { ...post, commentCount: post.commentCount + 1 }
        : post
    ));
    
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(10);
  }, [user]);
  
  // ---------------------------------------------------------------------------
  // LIBRARY/SAVE OPERATIONS
  // ---------------------------------------------------------------------------
  
  const isSaved = useCallback((postId: string): boolean => {
    return userState.savedPosts.includes(postId);
  }, [userState.savedPosts]);
  
  const toggleSave = useCallback((postId: string) => {
    setUserState(prev => {
      const isCurrentlySaved = prev.savedPosts.includes(postId);
      return {
        ...prev,
        savedPosts: isCurrentlySaved
          ? prev.savedPosts.filter(id => id !== postId)
          : [...prev.savedPosts, postId],
      };
    });
    
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(10);
  }, []);
  
  // ---------------------------------------------------------------------------
  // PERSONAL COMMUNITY OPERATIONS
  // ---------------------------------------------------------------------------
  
  const isInCommunity = useCallback((userId: string): boolean => {
    return userState.communityMembers.includes(userId);
  }, [userState.communityMembers]);
  
  const toggleCommunity = useCallback((userId: string) => {
    setUserState(prev => {
      const isCurrentlyInCommunity = prev.communityMembers.includes(userId);
      return {
        ...prev,
        communityMembers: isCurrentlyInCommunity
          ? prev.communityMembers.filter(id => id !== userId)
          : [...prev.communityMembers, userId],
      };
    });
    
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(10);
  }, []);
  
  const getCommunityCount = useCallback((): number => {
    return userState.communityMembers.length;
  }, [userState.communityMembers]);
  
  // ---------------------------------------------------------------------------
  // EXPRESSION OPERATIONS
  // ---------------------------------------------------------------------------
  
  const getExpressions = useCallback((): FeedExpression[] => {
    // Filter out expired expressions
    const now = new Date();
    return expressions.filter(e => e.expiresAt > now);
  }, [expressions]);
  
  const createExpression = useCallback((expressionData: Omit<FeedExpression, 'id' | 'createdAt' | 'expiresAt'>) => {
    const now = new Date();
    const newExpression: FeedExpression = {
      ...expressionData,
      id: generateMockUUID(), // Use proper UUID for new expressions
      createdAt: now,
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 hours
    };
    
    setExpressions(prev => [newExpression, ...prev]);
    
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(10);
  }, []);
  
  const markExpressionSeen = useCallback((expressionId: string) => {
    setExpressions(prev => prev.map(expr =>
      expr.id === expressionId
        ? { ...expr, hasUnseenExpression: false }
        : expr
    ));
  }, []);
  
  // ---------------------------------------------------------------------------
  // SAFETY OPERATIONS
  // ---------------------------------------------------------------------------
  
  const isMuted = useCallback((userId: string): boolean => {
    return userState.mutedUsers.includes(userId);
  }, [userState.mutedUsers]);
  
  const isBlocked = useCallback((userId: string): boolean => {
    return userState.blockedUsers.includes(userId);
  }, [userState.blockedUsers]);
  
  const muteUser = useCallback((userId: string) => {
    setUserState(prev => ({
      ...prev,
      mutedUsers: prev.mutedUsers.includes(userId)
        ? prev.mutedUsers
        : [...prev.mutedUsers, userId],
    }));
  }, []);
  
  const unmuteUser = useCallback((userId: string) => {
    setUserState(prev => ({
      ...prev,
      mutedUsers: prev.mutedUsers.filter(id => id !== userId),
    }));
  }, []);
  
  const blockUser = useCallback((userId: string) => {
    setUserState(prev => ({
      ...prev,
      blockedUsers: prev.blockedUsers.includes(userId)
        ? prev.blockedUsers
        : [...prev.blockedUsers, userId],
    }));
  }, []);
  
  const unblockUser = useCallback((userId: string) => {
    setUserState(prev => ({
      ...prev,
      blockedUsers: prev.blockedUsers.filter(id => id !== userId),
    }));
  }, []);
  
  // ---------------------------------------------------------------------------
  // UTILITY
  // ---------------------------------------------------------------------------
  
  const refreshFeed = useCallback(() => {
    // Reset to initial state (simulate refresh)
    setPosts(createInitialPosts());
    setComments(createInitialComments());
    setExpressions(createInitialExpressions());
    // Keep user state (reactions, saves, etc.)
  }, []);

  // ---------------------------------------------------------------------------
  // DRAFT OPERATIONS
  // ---------------------------------------------------------------------------

  const saveDraft = useCallback<FeedDataContextType['saveDraft']>((draft) => {
    const now = Date.now();
    let result!: StudioDraft;
    setDrafts(prev => {
      if (draft.id) {
        const existing = prev.find(d => d.id === draft.id);
        if (existing) {
          result = { ...existing, ...draft, id: draft.id, updatedAt: now };
          return prev.map(d => (d.id === draft.id ? result : d));
        }
      }
      result = {
        id: draft.id ?? generateMockUUID(),
        kind: draft.kind,
        title: draft.title,
        data: draft.data,
        createdAt: now,
        updatedAt: now,
      };
      return [result, ...prev];
    });
    return result;
  }, []);

  const deleteDraft = useCallback((id: string) => {
    setDrafts(prev => prev.filter(d => d.id !== id));
  }, []);

  const getDraft = useCallback((id: string) => drafts.find(d => d.id === id), [drafts]);

  const getDraftsByKind = useCallback(
    (kind: StudioContentKind) => drafts.filter(d => d.kind === kind),
    [drafts]
  );

  // ---------------------------------------------------------------------------
  // SCHEDULED OPERATIONS
  // ---------------------------------------------------------------------------

  const schedulePublish = useCallback<FeedDataContextType['schedulePublish']>((item) => {
    const newItem: ScheduledItem = {
      id: generateMockUUID(),
      kind: item.kind,
      scheduledAt: item.scheduledAt,
      payload: item.payload,
      createdAt: Date.now(),
    };
    setScheduled(prev => [newItem, ...prev]);
    return newItem;
  }, []);

  const cancelScheduled = useCallback((id: string) => {
    setScheduled(prev => prev.filter(s => s.id !== id));
  }, []);

  const updateScheduled = useCallback<FeedDataContextType['updateScheduled']>((id, patch) => {
    setScheduled(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)));
  }, []);
  
  // ---------------------------------------------------------------------------
  // CONTEXT VALUE
  // ---------------------------------------------------------------------------
  
  const value: FeedDataContextType = {
    posts,
    expressions,
    isSimulationMode,
    createPost,
    getPost,
    getReaction,
    setReaction,
    getReactionCount,
    getComments,
    getCommentCount,
    addComment,
    isSaved,
    toggleSave,
    isInCommunity,
    toggleCommunity,
    getCommunityCount,
    getExpressions,
    createExpression,
    markExpressionSeen,
    isMuted,
    isBlocked,
    muteUser,
    unmuteUser,
    blockUser,
    unblockUser,
    refreshFeed,
    drafts,
    saveDraft,
    deleteDraft,
    getDraft,
    getDraftsByKind,
    scheduled,
    schedulePublish,
    cancelScheduled,
    updateScheduled,
  };
  
  return (
    <FeedDataContext.Provider value={value}>
      {children}
    </FeedDataContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

export function useFeedData() {
  const context = useContext(FeedDataContext);
  if (!context) {
    throw new Error('useFeedData must be used within a FeedDataProvider');
  }
  return context;
}

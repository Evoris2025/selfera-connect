import { useCallback, useMemo } from 'react';
import { useMockSystem, type MockComment } from '@/contexts/MockSystemContext';
import { useAuth } from '@/contexts/AuthContext';

interface UseMockCommentsResult {
  comments: MockComment[];
  commentCount: number;
  addComment: (content: string) => Promise<void>;
  isLoading: boolean;
}

export function useMockComments(postId: string): UseMockCommentsResult {
  const { user } = useAuth();
  const { getComments, addComment: addMockComment, state } = useMockSystem();

  const comments = useMemo(() => {
    return getComments(postId);
  }, [getComments, postId]);

  // Get the post to get current comment count
  const post = useMemo(() => {
    return state.posts.find(p => p.id === postId);
  }, [state.posts, postId]);

  const commentCount = post?.commentCount ?? comments.length;

  const addComment = useCallback(async (content: string) => {
    if (!user?.id || !content.trim()) return;
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    const author = {
      name: user.email?.split('@')[0] || 'You',
      handle: user.email?.split('@')[0] || 'you',
      avatar: '',
    };
    
    addMockComment(postId, content, author);
  }, [user, postId, addMockComment]);

  return {
    comments,
    commentCount,
    addComment,
    isLoading: false,
  };
}

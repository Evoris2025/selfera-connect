/**
 * Feed Comments Hook
 * 
 * This hook provides comment functionality that works in simulation mode.
 * Comments are persisted to localStorage via FeedDataContext.
 */

import { useCallback } from 'react';
import { useFeedData, FeedComment } from '@/contexts/FeedDataContext';
import { useAuth } from '@/contexts/AuthContext';

interface UseFeedCommentsResult {
  comments: FeedComment[];
  commentCount: number;
  addComment: (content: string) => Promise<void>;
  isLoading: boolean;
}

export function useFeedComments(postId: string): UseFeedCommentsResult {
  const { user } = useAuth();
  const feedData = useFeedData();
  
  const comments = feedData.getComments(postId);
  const commentCount = feedData.getCommentCount(postId);
  
  const addComment = useCallback(async (content: string) => {
    if (!user?.id || !content.trim()) return;
    feedData.addComment(postId, content);
  }, [user?.id, postId, feedData]);
  
  return {
    comments,
    commentCount,
    addComment,
    isLoading: false,
  };
}

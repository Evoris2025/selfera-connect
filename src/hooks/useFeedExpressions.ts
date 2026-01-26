/**
 * Feed Expressions Hook
 * 
 * This hook provides expression (stories) functionality in simulation mode.
 * Expressions are persisted to localStorage via FeedDataContext.
 */

import { useCallback } from 'react';
import { useFeedData, FeedExpression } from '@/contexts/FeedDataContext';
import { useAuth } from '@/contexts/AuthContext';

interface UseFeedExpressionsResult {
  expressions: FeedExpression[];
  createExpression: (data: {
    mediaUrl: string;
    mediaType: 'image' | 'video';
    thumbnailUrl?: string;
  }) => void;
  markSeen: (expressionId: string) => void;
  isLoading: boolean;
}

export function useFeedExpressions(): UseFeedExpressionsResult {
  const { user } = useAuth();
  const feedData = useFeedData();
  
  const expressions = feedData.getExpressions();
  
  const createExpression = useCallback((data: {
    mediaUrl: string;
    mediaType: 'image' | 'video';
    thumbnailUrl?: string;
  }) => {
    if (!user?.id) return;
    
    feedData.createExpression({
      userId: user.id,
      userName: user.email?.split('@')[0] || 'You',
      userAvatar: '',
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType,
      thumbnailUrl: data.thumbnailUrl,
      hasUnseenExpression: false, // User's own expression is "seen"
    });
  }, [user, feedData]);
  
  const markSeen = useCallback((expressionId: string) => {
    feedData.markExpressionSeen(expressionId);
  }, [feedData]);
  
  return {
    expressions,
    createExpression,
    markSeen,
    isLoading: false,
  };
}

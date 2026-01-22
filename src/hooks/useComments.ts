import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  postId: string;
  author: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
  timestamp: Date;
}

interface UseCommentsResult {
  comments: Comment[];
  commentCount: number;
  isLoading: boolean;
  addComment: (content: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUuid = (value: string) => UUID_RE.test(value);

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d`;
  if (diffHours > 0) return `${diffHours}h`;
  if (diffMins > 0) return `${diffMins}m`;
  return 'now';
}

export function useComments(postId: string): UseCommentsResult {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const isValidPost = isUuid(postId);

  const fetchComments = useCallback(async () => {
    if (!isValidPost) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          body,
          created_at,
          user_id,
          profiles!comments_user_id_fkey (
            id,
            display_name,
            handle,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .eq('is_removed', false)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedComments: Comment[] = (data || []).map(c => {
        const profile = c.profiles as any;
        const createdAt = new Date(c.created_at || '');
        
        return {
          id: c.id,
          postId,
          author: {
            id: c.user_id,
            name: profile?.display_name || profile?.handle || 'Anonymous',
            handle: profile?.handle || 'anonymous',
            avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.user_id}`,
          },
          content: c.body,
          createdAt: formatTimeAgo(createdAt),
          timestamp: createdAt,
        };
      });

      setComments(formattedComments);
      setCommentCount(formattedComments.length);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isValidPost, postId]);

  useEffect(() => {
    setIsLoading(true);
    setComments([]);
    fetchComments();

    if (!isValidPost) return;

    // Subscribe to new comments
    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, isValidPost, fetchComments]);

  const addComment = useCallback(async (content: string): Promise<boolean> => {
    if (!user?.id || !isValidPost || !content.trim()) {
      return false;
    }

    // Get current user profile for optimistic update
    const { data: profileData } = await supabase
      .from('profiles')
      .select('display_name, handle, avatar_url')
      .eq('id', user.id)
      .single();

    const optimisticComment: Comment = {
      id: `temp-${Date.now()}`,
      postId,
      author: {
        id: user.id,
        name: profileData?.display_name || profileData?.handle || 'You',
        handle: profileData?.handle || 'you',
        avatar: profileData?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
      },
      content: content.trim(),
      createdAt: 'now',
      timestamp: new Date(),
    };

    // Optimistic update
    setComments(prev => [...prev, optimisticComment]);
    setCommentCount(prev => prev + 1);

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          body: content.trim(),
        });

      if (error) throw error;

      // Refetch to get the real comment with proper ID
      await fetchComments();
      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      // Revert optimistic update
      setComments(prev => prev.filter(c => c.id !== optimisticComment.id));
      setCommentCount(prev => Math.max(0, prev - 1));
      toast({
        title: "Couldn't post comment",
        description: 'Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  }, [user?.id, isValidPost, postId, fetchComments]);

  return {
    comments,
    commentCount,
    isLoading,
    addComment,
    refetch: fetchComments,
  };
}

/**
 * Creator Analytics Hook
 * 
 * Fetches real analytics data for expressions, posts, videos, and images from the database
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ExpressionAnalytics {
  totalViews: number;
  totalReactions: number;
  totalReplies: number;
  completionRate: number;
  avgWatchTime: number;
  reactionBreakdown: Record<string, number>;
  viewsByDay: { date: string; views: number }[];
  reactionsByDay: { date: string; reactions: number }[];
}

export interface ContentItem {
  id: string;
  type: 'expression' | 'post' | 'video' | 'image';
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  views: number;
  reactions: number;
  comments: number;
  createdAt: string;
}

export interface AggregatedCreatorAnalytics {
  // Content counts
  totalExpressions: number;
  totalPosts: number;
  totalVideos: number;
  totalImages: number;
  totalContent: number;
  
  // Engagement metrics
  totalViews: number;
  totalReactions: number;
  totalReplies: number;
  totalComments: number;
  avgCompletionRate: number;
  avgWatchTime: number;
  
  // Trends
  viewsTrend: { date: string; views: number }[];
  reactionsTrend: { date: string; reactions: number }[];
  repliesTrend: { date: string; replies: number }[];
  
  // Top content across all types
  topContent: ContentItem[];
  
  // Legacy support
  topExpressions: {
    id: string;
    mediaUrl: string;
    thumbnailUrl: string | null;
    views: number;
    reactions: number;
    replies: number;
  }[];
}

interface DateItem {
  [key: string]: unknown;
}

function getCountByDay(items: DateItem[], dateField: string, days: number, key: string): { date: string; [key: string]: number | string }[] {
  const now = new Date();
  const result: { date: string; [key: string]: number | string }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const count = items.filter(item => {
      const itemDate = new Date(item[dateField] as string);
      return itemDate.toISOString().split('T')[0] === dateStr;
    }).length;

    result.push({ date: dateStr, [key]: count });
  }

  return result;
}

function getViewsByDay(items: DateItem[], dateField: string, days: number): { date: string; views: number }[] {
  return getCountByDay(items, dateField, days, 'views') as { date: string; views: number }[];
}

function getReactionsByDay(items: DateItem[], dateField: string, days: number): { date: string; reactions: number }[] {
  return getCountByDay(items, dateField, days, 'reactions') as { date: string; reactions: number }[];
}

function getRepliesByDay(items: DateItem[], dateField: string, days: number): { date: string; replies: number }[] {
  return getCountByDay(items, dateField, days, 'replies') as { date: string; replies: number }[];
}

export function useExpressionAnalytics(expressionId: string) {
  return useQuery({
    queryKey: ['expression-analytics', expressionId],
    queryFn: async (): Promise<ExpressionAnalytics> => {
      // Fetch views
      const { data: views, error: viewsError } = await supabase
        .from('expression_views')
        .select('*')
        .eq('expression_id', expressionId);

      if (viewsError) throw viewsError;

      // Fetch reactions
      const { data: reactions, error: reactionsError } = await supabase
        .from('expression_reactions')
        .select('*')
        .eq('expression_id', expressionId);

      if (reactionsError) throw reactionsError;

      // Fetch replies
      const { data: replies, error: repliesError } = await supabase
        .from('expression_replies')
        .select('*')
        .eq('expression_id', expressionId);

      if (repliesError) throw repliesError;

      // Calculate metrics
      const totalViews = views?.length || 0;
      const totalReactions = reactions?.length || 0;
      const totalReplies = replies?.length || 0;
      
      const completedViews = views?.filter(v => v.completed).length || 0;
      const completionRate = totalViews > 0 ? Math.round((completedViews / totalViews) * 100) : 0;
      
      const totalWatchTime = views?.reduce((sum, v) => sum + (v.watch_duration_seconds || 0), 0) || 0;
      const avgWatchTime = totalViews > 0 ? Math.round(totalWatchTime / totalViews) : 0;

      // Reaction breakdown
      const reactionBreakdown: Record<string, number> = {};
      reactions?.forEach(r => {
        reactionBreakdown[r.emoji] = (reactionBreakdown[r.emoji] || 0) + 1;
      });

      // Views by day (last 7 days)
      const viewsByDay = getViewsByDay(views || [], 'viewed_at', 7);
      const reactionsByDay = getReactionsByDay(reactions || [], 'created_at', 7);

      return {
        totalViews,
        totalReactions,
        totalReplies,
        completionRate,
        avgWatchTime,
        reactionBreakdown,
        viewsByDay,
        reactionsByDay,
      };
    },
    enabled: !!expressionId,
  });
}

export function useCreatorAnalytics() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['creator-analytics', user?.id],
    queryFn: async (): Promise<AggregatedCreatorAnalytics> => {
      if (!user?.id) throw new Error('User not authenticated');

      // Fetch all user's expressions
      const { data: expressions, error: expressionsError } = await supabase
        .from('expressions')
        .select('id, media_url, thumbnail_url, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (expressionsError) throw expressionsError;

      // Fetch all user's posts (including videos and images)
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id, media_url, thumbnail_url, media_type, created_at')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Categorize posts by type
      const videoPosts = posts?.filter(p => p.media_type === 'video') || [];
      const imagePosts = posts?.filter(p => p.media_type === 'image') || [];
      const textPosts = posts?.filter(p => !p.media_type || p.media_type === 'text') || [];

      const expressionIds = expressions?.map(e => e.id) || [];
      const postIds = posts?.map(p => p.id) || [];
      
      // Initialize empty analytics
      let totalExpressionViews = 0;
      let totalExpressionReactions = 0;
      let totalExpressionReplies = 0;
      let avgCompletionRate = 0;
      let avgWatchTime = 0;
      let allViews: DateItem[] = [];
      let allExpressionReactions: DateItem[] = [];
      let allReplies: DateItem[] = [];

      // Fetch expression analytics if there are expressions
      if (expressionIds.length > 0) {
        const { data: views, error: viewsError } = await supabase
          .from('expression_views')
          .select('*')
          .in('expression_id', expressionIds);

        if (viewsError) throw viewsError;
        allViews = views || [];

        const { data: reactions, error: reactionsError } = await supabase
          .from('expression_reactions')
          .select('*')
          .in('expression_id', expressionIds);

        if (reactionsError) throw reactionsError;
        allExpressionReactions = reactions || [];

        const { data: replies, error: repliesError } = await supabase
          .from('expression_replies')
          .select('*')
          .in('expression_id', expressionIds);

        if (repliesError) throw repliesError;
        allReplies = replies || [];

        totalExpressionViews = allViews.length;
        totalExpressionReactions = allExpressionReactions.length;
        totalExpressionReplies = allReplies.length;

        const completedViews = allViews.filter(v => v.completed).length;
        avgCompletionRate = totalExpressionViews > 0 ? Math.round((completedViews / totalExpressionViews) * 100) : 0;

        const totalWatchTime = allViews.reduce((sum, v) => sum + ((v.watch_duration_seconds as number) || 0), 0);
        avgWatchTime = totalExpressionViews > 0 ? Math.round(totalWatchTime / totalExpressionViews) : 0;
      }

      // Fetch post reactions and comments
      let totalPostReactions = 0;
      let totalComments = 0;
      let allPostReactions: DateItem[] = [];
      let allComments: DateItem[] = [];

      if (postIds.length > 0) {
        const { data: reactions, error: reactionsError } = await supabase
          .from('reactions')
          .select('*')
          .in('post_id', postIds);

        if (reactionsError) throw reactionsError;
        allPostReactions = reactions || [];
        totalPostReactions = allPostReactions.length;

        const { data: comments, error: commentsError } = await supabase
          .from('comments')
          .select('*')
          .in('post_id', postIds)
          .eq('is_removed', false);

        if (commentsError) throw commentsError;
        allComments = comments || [];
        totalComments = allComments.length;
      }

      // Combined totals
      const totalViews = totalExpressionViews; // Note: Posts don't have a view tracking table yet
      const totalReactions = totalExpressionReactions + totalPostReactions;
      const totalReplies = totalExpressionReplies;

      // Trends (last 30 days) - combine expression views with post reactions for engagement
      const viewsTrend = getViewsByDay(allViews, 'viewed_at', 30);
      const reactionsTrend = getReactionsByDay([...allExpressionReactions, ...allPostReactions], 'created_at', 30);
      const repliesTrend = getRepliesByDay([...allReplies, ...allComments], 'created_at', 30);

      // Build top content list across all types
      const topContent: ContentItem[] = [];

      // Add expressions
      expressions?.forEach(expr => {
        const views = allViews.filter(v => v.expression_id === expr.id).length;
        const reactions = allExpressionReactions.filter(r => r.expression_id === expr.id).length;
        const comments = allReplies.filter(r => r.expression_id === expr.id).length;
        topContent.push({
          id: expr.id,
          type: 'expression',
          mediaUrl: expr.media_url,
          thumbnailUrl: expr.thumbnail_url,
          views,
          reactions,
          comments,
          createdAt: expr.created_at,
        });
      });

      // Add posts (videos, images)
      posts?.forEach(post => {
        const reactions = allPostReactions.filter(r => r.post_id === post.id).length;
        const comments = allComments.filter(c => c.post_id === post.id).length;
        
        let type: 'post' | 'video' | 'image' = 'post';
        if (post.media_type === 'video') type = 'video';
        else if (post.media_type === 'image') type = 'image';
        
        topContent.push({
          id: post.id,
          type,
          mediaUrl: post.media_url,
          thumbnailUrl: post.thumbnail_url,
          views: 0, // Posts don't have view tracking yet
          reactions,
          comments,
          createdAt: post.created_at || '',
        });
      });

      // Sort by engagement and take top 10
      const sortedTopContent = topContent
        .map(item => ({
          ...item,
          engagement: item.views + item.reactions * 2 + item.comments * 3,
        }))
        .sort((a, b) => b.engagement - a.engagement)
        .slice(0, 10)
        .map(({ engagement, ...rest }) => rest);

      // Legacy top expressions format
      const topExpressions = expressions?.map(expr => {
        const views = allViews.filter(v => v.expression_id === expr.id).length;
        const reactions = allExpressionReactions.filter(r => r.expression_id === expr.id).length;
        const replies = allReplies.filter(r => r.expression_id === expr.id).length;
        return {
          id: expr.id,
          mediaUrl: expr.media_url,
          thumbnailUrl: expr.thumbnail_url,
          views,
          reactions,
          replies,
          engagement: views + reactions * 2 + replies * 3,
        };
      })
        .sort((a, b) => b.engagement - a.engagement)
        .slice(0, 5)
        .map(({ engagement, ...rest }) => rest) || [];

      return {
        totalExpressions: expressions?.length || 0,
        totalPosts: textPosts.length,
        totalVideos: videoPosts.length,
        totalImages: imagePosts.length,
        totalContent: (expressions?.length || 0) + (posts?.length || 0),
        totalViews,
        totalReactions,
        totalReplies,
        totalComments,
        avgCompletionRate,
        avgWatchTime,
        viewsTrend,
        reactionsTrend,
        repliesTrend,
        topContent: sortedTopContent,
        topExpressions,
      };
    },
    enabled: !!user?.id,
  });
}

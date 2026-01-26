/**
 * Expression Analytics Hook
 * 
 * Fetches real analytics data for expressions from the database
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

export interface AggregatedCreatorAnalytics {
  totalExpressions: number;
  totalViews: number;
  totalReactions: number;
  totalReplies: number;
  avgCompletionRate: number;
  avgWatchTime: number;
  viewsTrend: { date: string; views: number }[];
  reactionsTrend: { date: string; reactions: number }[];
  repliesTrend: { date: string; replies: number }[];
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

function getViewsByDay(items: DateItem[], dateField: string, days: number): { date: string; views: number }[] {
  const now = new Date();
  const result: { date: string; views: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const count = items.filter(item => {
      const itemDate = new Date(item[dateField] as string);
      return itemDate.toISOString().split('T')[0] === dateStr;
    }).length;

    result.push({ date: dateStr, views: count });
  }

  return result;
}

function getReactionsByDay(items: DateItem[], dateField: string, days: number): { date: string; reactions: number }[] {
  const now = new Date();
  const result: { date: string; reactions: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const count = items.filter(item => {
      const itemDate = new Date(item[dateField] as string);
      return itemDate.toISOString().split('T')[0] === dateStr;
    }).length;

    result.push({ date: dateStr, reactions: count });
  }

  return result;
}

function getRepliesByDay(items: DateItem[], dateField: string, days: number): { date: string; replies: number }[] {
  const now = new Date();
  const result: { date: string; replies: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const count = items.filter(item => {
      const itemDate = new Date(item[dateField] as string);
      return itemDate.toISOString().split('T')[0] === dateStr;
    }).length;

    result.push({ date: dateStr, replies: count });
  }

  return result;
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

      const expressionIds = expressions?.map(e => e.id) || [];
      
      if (expressionIds.length === 0) {
        return {
          totalExpressions: 0,
          totalViews: 0,
          totalReactions: 0,
          totalReplies: 0,
          avgCompletionRate: 0,
          avgWatchTime: 0,
          viewsTrend: [],
          reactionsTrend: [],
          repliesTrend: [],
          topExpressions: [],
        };
      }

      // Fetch all views for user's expressions
      const { data: allViews, error: viewsError } = await supabase
        .from('expression_views')
        .select('*')
        .in('expression_id', expressionIds);

      if (viewsError) throw viewsError;

      // Fetch all reactions for user's expressions
      const { data: allReactions, error: reactionsError } = await supabase
        .from('expression_reactions')
        .select('*')
        .in('expression_id', expressionIds);

      if (reactionsError) throw reactionsError;

      // Fetch all replies for user's expressions
      const { data: allReplies, error: repliesError } = await supabase
        .from('expression_replies')
        .select('*')
        .in('expression_id', expressionIds);

      if (repliesError) throw repliesError;

      // Calculate totals
      const totalViews = allViews?.length || 0;
      const totalReactions = allReactions?.length || 0;
      const totalReplies = allReplies?.length || 0;

      const completedViews = allViews?.filter(v => v.completed).length || 0;
      const avgCompletionRate = totalViews > 0 ? Math.round((completedViews / totalViews) * 100) : 0;

      const totalWatchTime = allViews?.reduce((sum, v) => sum + (v.watch_duration_seconds || 0), 0) || 0;
      const avgWatchTime = totalViews > 0 ? Math.round(totalWatchTime / totalViews) : 0;

      // Trends (last 30 days)
      const viewsTrend = getViewsByDay(allViews || [], 'viewed_at', 30);
      const reactionsTrend = getReactionsByDay(allReactions || [], 'created_at', 30);
      const repliesTrend = getRepliesByDay(allReplies || [], 'created_at', 30);

      // Top expressions by engagement
      const expressionStats = expressions?.map(expr => {
        const views = allViews?.filter(v => v.expression_id === expr.id).length || 0;
        const reactions = allReactions?.filter(r => r.expression_id === expr.id).length || 0;
        const replies = allReplies?.filter(r => r.expression_id === expr.id).length || 0;
        return {
          id: expr.id,
          mediaUrl: expr.media_url,
          thumbnailUrl: expr.thumbnail_url,
          views,
          reactions,
          replies,
          engagement: views + reactions * 2 + replies * 3,
        };
      }) || [];

      const topExpressions = expressionStats
        .sort((a, b) => b.engagement - a.engagement)
        .slice(0, 5)
        .map(({ engagement, ...rest }) => rest);

      return {
        totalExpressions: expressions?.length || 0,
        totalViews,
        totalReactions,
        totalReplies,
        avgCompletionRate,
        avgWatchTime,
        viewsTrend,
        reactionsTrend,
        repliesTrend,
        topExpressions,
      };
    },
    enabled: !!user?.id,
  });
}

import { useState, useEffect } from 'react';
import { BarChart3, Users, FileText, Flag, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, endOfDay, subWeeks, startOfWeek, endOfWeek } from 'date-fns';

interface AnalyticsData {
  newUsers: number;
  newPosts: number;
  newReports: number;
  totalUsers: number;
  totalPosts: number;
  pendingReports: number;
  pendingVerifications: number;
}

interface TimeSeriesPoint {
  date: string;
  label: string;
  users: number;
  posts: number;
  reports: number;
}

export function AdminAnalytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly'>('daily');
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    newUsers: 0,
    newPosts: 0,
    newReports: 0,
    totalUsers: 0,
    totalPosts: 0,
    pendingReports: 0,
    pendingVerifications: 0,
  });
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const dayStart = startOfDay(now).toISOString();
      const weekStart = startOfWeek(now).toISOString();

      // Fetch counts in parallel
      const [
        { count: totalUsers },
        { count: totalPosts },
        { count: newUsersToday },
        { count: newPostsToday },
        { count: newReportsToday },
        { count: pendingReports },
        { count: pendingVerifications },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', dayStart),
        supabase.from('posts').select('*', { count: 'exact', head: true }).gte('created_at', dayStart),
        supabase.from('reports').select('*', { count: 'exact', head: true }).gte('created_at', dayStart),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('verification_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      setAnalytics({
        totalUsers: totalUsers || 0,
        totalPosts: totalPosts || 0,
        newUsers: newUsersToday || 0,
        newPosts: newPostsToday || 0,
        newReports: newReportsToday || 0,
        pendingReports: pendingReports || 0,
        pendingVerifications: pendingVerifications || 0,
      });

      // Fetch time series data
      await fetchTimeSeries(timeframe);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTimeSeries = async (period: 'daily' | 'weekly') => {
    const points: TimeSeriesPoint[] = [];
    const now = new Date();

    if (period === 'daily') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = subDays(now, i);
        const start = startOfDay(date).toISOString();
        const end = endOfDay(date).toISOString();

        const [
          { count: users },
          { count: posts },
          { count: reports },
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true })
            .gte('created_at', start).lte('created_at', end),
          supabase.from('posts').select('*', { count: 'exact', head: true })
            .gte('created_at', start).lte('created_at', end),
          supabase.from('reports').select('*', { count: 'exact', head: true })
            .gte('created_at', start).lte('created_at', end),
        ]);

        points.push({
          date: format(date, 'yyyy-MM-dd'),
          label: format(date, 'EEE'),
          users: users || 0,
          posts: posts || 0,
          reports: reports || 0,
        });
      }
    } else {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const weekDate = subWeeks(now, i);
        const start = startOfWeek(weekDate).toISOString();
        const end = endOfWeek(weekDate).toISOString();

        const [
          { count: users },
          { count: posts },
          { count: reports },
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true })
            .gte('created_at', start).lte('created_at', end),
          supabase.from('posts').select('*', { count: 'exact', head: true })
            .gte('created_at', start).lte('created_at', end),
          supabase.from('reports').select('*', { count: 'exact', head: true })
            .gte('created_at', start).lte('created_at', end),
        ]);

        points.push({
          date: format(startOfWeek(weekDate), 'yyyy-MM-dd'),
          label: `Week ${4 - i}`,
          users: users || 0,
          posts: posts || 0,
          reports: reports || 0,
        });
      }
    }

    setTimeSeries(points);
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      fetchTimeSeries(timeframe);
    }
  }, [timeframe]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const maxValue = Math.max(
    ...timeSeries.flatMap(p => [p.users, p.posts, p.reports]),
    1
  );

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics.newUsers} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalPosts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics.newPosts} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.pendingReports}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics.newReports} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verifications</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.pendingVerifications}</div>
            <p className="text-xs text-muted-foreground">
              pending review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Time Series Chart */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Activity Overview
            </CardTitle>
            <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as 'daily' | 'weekly')}>
              <TabsList className="h-8">
                <TabsTrigger value="daily" className="text-xs px-2 h-6">Daily</TabsTrigger>
                <TabsTrigger value="weekly" className="text-xs px-2 h-6">Weekly</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {/* Simple bar chart */}
          <div className="space-y-4">
            {/* Legend */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-primary" />
                <span>Users</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-blue-500" />
                <span>Posts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-amber-500" />
                <span>Reports</span>
              </div>
            </div>

            {/* Chart */}
            <div className="flex items-end justify-between gap-2 h-40">
              {timeSeries.map((point) => (
                <div key={point.date} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center gap-0.5 h-32">
                    <div
                      className="w-2 bg-primary rounded-t transition-all"
                      style={{ height: `${(point.users / maxValue) * 100}%`, minHeight: point.users > 0 ? '4px' : '0' }}
                      title={`${point.users} users`}
                    />
                    <div
                      className="w-2 bg-blue-500 rounded-t transition-all"
                      style={{ height: `${(point.posts / maxValue) * 100}%`, minHeight: point.posts > 0 ? '4px' : '0' }}
                      title={`${point.posts} posts`}
                    />
                    <div
                      className="w-2 bg-amber-500 rounded-t transition-all"
                      style={{ height: `${(point.reports / maxValue) * 100}%`, minHeight: point.reports > 0 ? '4px' : '0' }}
                      title={`${point.reports} reports`}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{point.label}</span>
                </div>
              ))}
            </div>

            {/* Stats summary */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-lg font-semibold">
                  {timeSeries.reduce((sum, p) => sum + p.users, 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  New Users ({timeframe === 'daily' ? '7 days' : '4 weeks'})
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">
                  {timeSeries.reduce((sum, p) => sum + p.posts, 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  New Posts ({timeframe === 'daily' ? '7 days' : '4 weeks'})
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">
                  {timeSeries.reduce((sum, p) => sum + p.reports, 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Reports ({timeframe === 'daily' ? '7 days' : '4 weeks'})
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
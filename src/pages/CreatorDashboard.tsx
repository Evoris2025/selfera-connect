import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  Heart, 
  MessageCircle, 
  TrendingUp, 
  Clock, 
  Target,
  BarChart3,
  Play,
  Image,
  FileText,
  Video,
  Bell,
  BellOff,
  Loader2,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useCreatorAnalytics, ContentItem } from '@/hooks/useExpressionAnalytics';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useRealtimeAnalytics } from '@/hooks/useRealtimeAnalytics';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';

const contentTypeIcons: Record<string, React.ElementType> = {
  expression: Play,
  video: Video,
  image: Image,
  post: FileText,
};

const contentTypeColors: Record<string, string> = {
  expression: 'text-amber-500 bg-amber-500/10',
  video: 'text-purple-500 bg-purple-500/10',
  image: 'text-blue-500 bg-blue-500/10',
  post: 'text-green-500 bg-green-500/10',
};

export default function CreatorDashboard() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<7 | 30 | 90>(30);
  const { data: analytics, isLoading, error, refetch } = useCreatorAnalytics(dateRange);
  const { isSupported, subscribe, unsubscribe, isSubscribed } = usePushNotifications();
  const { invalidateAnalytics } = useRealtimeAnalytics(); // Enable real-time updates
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Manual refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleToggleNotifications = async () => {
    if (isSubscribed) {
      await unsubscribe.mutateAsync();
    } else {
      await subscribe.mutateAsync();
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-muted-foreground">Failed to load analytics</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </AppLayout>
    );
  }

  const engagementStats = [
    { 
      label: 'Total Views', 
      value: analytics?.totalViews || 0, 
      icon: Eye, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    { 
      label: 'Total Reactions', 
      value: analytics?.totalReactions || 0, 
      icon: Heart, 
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10'
    },
    { 
      label: 'Comments', 
      value: (analytics?.totalReplies || 0) + (analytics?.totalComments || 0), 
      icon: MessageCircle, 
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    { 
      label: 'Avg. Completion', 
      value: `${analytics?.avgCompletionRate || 0}%`, 
      icon: Target, 
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
  ];

  const contentStats = [
    { 
      label: 'Expressions', 
      value: analytics?.totalExpressions || 0, 
      icon: Play, 
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10'
    },
    { 
      label: 'Videos', 
      value: analytics?.totalVideos || 0, 
      icon: Video, 
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    { 
      label: 'Images', 
      value: analytics?.totalImages || 0, 
      icon: Image, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    { 
      label: 'Posts', 
      value: analytics?.totalPosts || 0, 
      icon: FileText, 
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
  ];

  return (
    <AppLayout>
      <div className="px-4 py-6 pb-24 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Track your content performance
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Refresh button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            
            {isSupported && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleNotifications}
                disabled={subscribe.isPending || unsubscribe.isPending}
                className="gap-2"
              >
                {subscribe.isPending || unsubscribe.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isSubscribed ? (
                  <Bell className="w-4 h-4" />
                ) : (
                  <BellOff className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Time period:</span>
          <div className="flex bg-muted rounded-lg p-1">
            {([7, 30, 90] as const).map((range) => (
              <Button
                key={range}
                variant={dateRange === range ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => setDateRange(range)}
              >
                {range}d
              </Button>
            ))}
          </div>
        </div>

        {/* Content Stats Grid */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Your Content</h3>
          <div className="grid grid-cols-4 gap-2">
            {contentStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-border/50">
                  <CardContent className="p-3 text-center">
                    <div className={`w-8 h-8 mx-auto mb-2 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <p className="text-xl font-bold">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Engagement Stats Grid */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Engagement</h3>
          <div className="grid grid-cols-2 gap-3">
            {engagementStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <Clock className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics?.avgWatchTime || 0}s</p>
                  <p className="text-xs text-muted-foreground">Avg. Watch Time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <BarChart3 className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics?.totalContent || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Content</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="top">Top Content</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            {/* Views Trend */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Views Trend ({dateRange} days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics?.viewsTrend || []}>
                      <defs>
                        <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10 }}
                        tickFormatter={(date) => new Date(date).getDate().toString()}
                        className="text-muted-foreground"
                      />
                      <YAxis 
                        tick={{ fontSize: 10 }}
                        className="text-muted-foreground"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="views" 
                        stroke="hsl(var(--primary))" 
                        fill="url(#viewsGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="mt-4 space-y-4">
            {/* Reactions Trend */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  Reactions ({dateRange} days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.reactionsTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10 }}
                        tickFormatter={(date) => new Date(date).getDate().toString()}
                      />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      />
                      <Bar dataKey="reactions" fill="hsl(346.8 77.2% 49.8%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Comments Trend */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-green-500" />
                  Comments & Replies ({dateRange} days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics?.repliesTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10 }}
                        tickFormatter={(date) => new Date(date).getDate().toString()}
                      />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="replies" 
                        stroke="hsl(142.1 76.2% 36.3%)" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(142.1 76.2% 36.3%)' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="top" className="mt-4 space-y-4">
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Top Performing Content
                </CardTitle>
                <CardDescription>
                  Ranked by engagement across all content types
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics?.topContent && analytics.topContent.length > 0 ? (
                  analytics.topContent.map((item: ContentItem, index: number) => {
                    const Icon = contentTypeIcons[item.type] || FileText;
                    const colorClass = contentTypeColors[item.type] || 'text-muted-foreground bg-muted';
                    
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
                      >
                        <div className="relative">
                          <Badge 
                            variant="secondary" 
                            className="absolute -top-1 -left-1 w-5 h-5 p-0 flex items-center justify-center text-xs z-10"
                          >
                            {index + 1}
                          </Badge>
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                            {item.thumbnailUrl || item.mediaUrl ? (
                              <img 
                                src={item.thumbnailUrl || item.mediaUrl || ''}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Icon className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`p-1 rounded ${colorClass}`}>
                              <Icon className="w-3 h-3" />
                            </div>
                            <span className="text-xs text-muted-foreground capitalize">{item.type}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Eye className="w-3 h-3" />
                              {item.views}
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Heart className="w-3 h-3" />
                              {item.reactions}
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <MessageCircle className="w-3 h-3" />
                              {item.comments}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No content yet</p>
                    <p className="text-xs">Create your first post or expression to see analytics</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

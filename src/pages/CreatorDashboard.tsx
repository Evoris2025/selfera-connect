import { useState } from 'react';
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
  Bell,
  BellOff,
  Loader2
} from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useCreatorAnalytics } from '@/hooks/useExpressionAnalytics';
import { usePushNotifications } from '@/hooks/usePushNotifications';
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

export default function CreatorDashboard() {
  const { data: analytics, isLoading, error } = useCreatorAnalytics();
  const { isSupported, permission, subscribe, unsubscribe, isSubscribed } = usePushNotifications();
  const [activeTab, setActiveTab] = useState('overview');

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

  const stats = [
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
      label: 'Total Replies', 
      value: analytics?.totalReplies || 0, 
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

  return (
    <AppLayout>
      <div className="px-4 py-6 pb-24 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Creator Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Track your expression performance
            </p>
          </div>
          
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
              {isSubscribed ? 'Notifications On' : 'Enable Notifications'}
            </Button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
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

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Play className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics?.totalExpressions || 0}</p>
                  <p className="text-xs text-muted-foreground">Expressions</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
                  Views Trend (30 days)
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
                  Reactions (30 days)
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

            {/* Replies Trend */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-green-500" />
                  Replies (30 days)
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
                  Top Performing Expressions
                </CardTitle>
                <CardDescription>
                  Ranked by engagement (views, reactions, replies)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics?.topExpressions && analytics.topExpressions.length > 0 ? (
                  analytics.topExpressions.map((expr, index) => (
                    <motion.div
                      key={expr.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
                    >
                      <div className="relative">
                        <Badge 
                          variant="secondary" 
                          className="absolute -top-1 -left-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
                        >
                          {index + 1}
                        </Badge>
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                          {expr.thumbnailUrl || expr.mediaUrl ? (
                            <img 
                              src={expr.thumbnailUrl || expr.mediaUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Play className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Eye className="w-3 h-3" />
                            {expr.views}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Heart className="w-3 h-3" />
                            {expr.reactions}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <MessageCircle className="w-3 h-3" />
                            {expr.replies}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Play className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No expressions yet</p>
                    <p className="text-xs">Create your first expression to see analytics</p>
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

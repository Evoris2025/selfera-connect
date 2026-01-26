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
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCreatorAnalytics } from '@/hooks/useExpressionAnalytics';
import { 
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const springGentle = { type: "spring" as const, stiffness: 260, damping: 28 };

export function AnalyticsSection() {
  const navigate = useNavigate();
  const { data: analytics, isLoading, error } = useCreatorAnalytics();

  if (isLoading) {
    return (
      <motion.section
        className="px-4 mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground tracking-tight">Analytics</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </motion.section>
    );
  }

  if (error) {
    return (
      <motion.section
        className="px-4 mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground tracking-tight">Analytics</h2>
        </div>
        <div className="rounded-2xl bg-card/40 border border-white/[0.06] p-6 text-center">
          <BarChart3 className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">Couldn't load analytics</p>
        </div>
      </motion.section>
    );
  }

  const stats = [
    { 
      label: 'Views', 
      value: analytics?.totalViews || 0, 
      icon: Eye, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    { 
      label: 'Reactions', 
      value: analytics?.totalReactions || 0, 
      icon: Heart, 
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10'
    },
    { 
      label: 'Replies', 
      value: analytics?.totalReplies || 0, 
      icon: MessageCircle, 
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    { 
      label: 'Completion', 
      value: `${analytics?.avgCompletionRate || 0}%`, 
      icon: Target, 
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
  ];

  const hasExpressions = (analytics?.totalExpressions || 0) > 0;

  return (
    <motion.section
      className="px-4 mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springGentle, delay: 0.2 }}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">Analytics</h2>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary h-8 px-3"
          onClick={() => navigate('/creator-dashboard')}
        >
          View All
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {!hasExpressions ? (
        /* Empty State */
        <motion.div 
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border border-white/5 p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.25 }}
        >
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <Play className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-base font-medium text-foreground mb-1">
              No expressions yet
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first expression to see analytics
            </p>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => navigate('/profile')}
            >
              <Play className="w-4 h-4 mr-2" />
              Create Expression
            </Button>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {/* Stats Grid */}
          <motion.div 
            className="grid grid-cols-4 gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springGentle, delay: 0.25 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="rounded-xl bg-card/40 border border-white/[0.06] p-3 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <div className={`w-8 h-8 mx-auto mb-2 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Mini Chart */}
          <motion.div
            className="rounded-2xl bg-card/40 border border-white/[0.06] p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springGentle, delay: 0.35 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Views Trend</span>
              </div>
              <Badge variant="secondary" className="text-xs">30 days</Badge>
            </div>
            
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.viewsTrend?.slice(-14) || []}>
                  <defs>
                    <linearGradient id="miniViewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stroke="hsl(var(--primary))" 
                    fill="url(#miniViewsGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Top Expression Preview */}
          {analytics?.topExpressions && analytics.topExpressions.length > 0 && (
            <motion.div
              className="rounded-2xl bg-card/40 border border-white/[0.06] p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springGentle, delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-foreground">Top Performing</span>
                </div>
              </div>
              
              <div className="space-y-2">
                {analytics.topExpressions.slice(0, 3).map((expr, index) => (
                  <div
                    key={expr.id}
                    className="flex items-center gap-3 p-2 rounded-xl bg-muted/20"
                  >
                    <Badge 
                      variant="secondary" 
                      className="w-5 h-5 p-0 flex items-center justify-center text-xs shrink-0"
                    >
                      {index + 1}
                    </Badge>
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-muted shrink-0">
                      {expr.thumbnailUrl || expr.mediaUrl ? (
                        <img 
                          src={expr.thumbnailUrl || expr.mediaUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="w-3 h-3 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-1 min-w-0">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {expr.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {expr.reactions}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {expr.replies}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.section>
  );
}

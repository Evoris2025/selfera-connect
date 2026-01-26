import { Users, FileText, Flag, TrendingUp, CheckCircle, MessageSquare, Activity, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMockSystem } from '@/contexts/MockSystemContext';

// Simulated platform metrics for Phase K
const MOCK_PLATFORM_METRICS = {
  totalUsers: 12847,
  verifiedUsers: 892,
  eraTierDistribution: {
    free: 9420,
    pink: 1850,
    green: 420,
    blue: 115,
    purple: 32,
    orange: 10,
  },
  clientProviderRatio: { clients: 8940, providers: 3907 },
  interactions: {
    active: 234,
    completed: 1856,
    cancelled: 89,
    flagged: 12,
  },
  pendingVerifications: 23,
  reportsSubmitted: 156,
  reportsNew: 18,
  reportsReviewing: 7,
};

export function AdminPlatformOverview() {
  const { state } = useMockSystem();
  
  const tierColors = {
    free: 'bg-muted',
    pink: 'bg-tier-pink',
    green: 'bg-tier-green',
    blue: 'bg-tier-blue',
    purple: 'bg-tier-purple',
    orange: 'bg-tier-orange',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Activity className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Platform Overview</h2>
          <p className="text-sm text-muted-foreground">
            Simulated system health metrics
          </p>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_PLATFORM_METRICS.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {MOCK_PLATFORM_METRICS.verifiedUsers} verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Interactions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_PLATFORM_METRICS.interactions.active}</div>
            <p className="text-xs text-muted-foreground">
              {MOCK_PLATFORM_METRICS.interactions.completed.toLocaleString()} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_PLATFORM_METRICS.pendingVerifications}</div>
            <p className="text-xs text-muted-foreground">
              awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Reports</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_PLATFORM_METRICS.reportsNew + MOCK_PLATFORM_METRICS.reportsReviewing}</div>
            <p className="text-xs text-muted-foreground">
              {MOCK_PLATFORM_METRICS.reportsNew} new, {MOCK_PLATFORM_METRICS.reportsReviewing} reviewing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ERA Tier Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Shield className="h-4 w-4" />
            ERA Tier Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(MOCK_PLATFORM_METRICS.eraTierDistribution).map(([tier, count]) => {
              const percentage = (count / MOCK_PLATFORM_METRICS.totalUsers) * 100;
              return (
                <div key={tier} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize font-medium">{tier}</span>
                    <span className="text-muted-foreground">{count.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${tierColors[tier as keyof typeof tierColors]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Client vs Provider */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">User Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-2xl font-bold">{MOCK_PLATFORM_METRICS.clientProviderRatio.clients.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Clients</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{MOCK_PLATFORM_METRICS.clientProviderRatio.providers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Providers</p>
              </div>
            </div>
            <div className="h-3 rounded-full bg-secondary overflow-hidden flex">
              <div 
                className="h-full bg-primary"
                style={{ width: `${(MOCK_PLATFORM_METRICS.clientProviderRatio.clients / MOCK_PLATFORM_METRICS.totalUsers) * 100}%` }}
              />
              <div 
                className="h-full bg-verified"
                style={{ width: `${(MOCK_PLATFORM_METRICS.clientProviderRatio.providers / MOCK_PLATFORM_METRICS.totalUsers) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Interaction Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Completed</span>
              <span className="font-semibold text-emerald-600">{MOCK_PLATFORM_METRICS.interactions.completed.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active</span>
              <span className="font-semibold text-blue-600">{MOCK_PLATFORM_METRICS.interactions.active}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cancelled</span>
              <span className="font-semibold text-amber-600">{MOCK_PLATFORM_METRICS.interactions.cancelled}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Flagged</span>
              <span className="font-semibold text-destructive">{MOCK_PLATFORM_METRICS.interactions.flagged}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simulation Notice */}
      <Card className="border-dashed border-2 border-muted">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground text-center">
            All data shown is simulated for development and testing purposes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

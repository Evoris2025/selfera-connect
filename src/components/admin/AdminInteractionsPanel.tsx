import { MessageSquare, CheckCircle, XCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useMockSystem } from '@/contexts/MockSystemContext';

// Extended mock data for admin oversight
const MOCK_INTERACTION_STATS = {
  totalLifetime: 4567,
  completedLifetime: 3890,
  cancelledLifetime: 234,
  completionRate: 0.85,
  avgResponseTime: '2.4 hours',
  flaggedTotal: 45,
  flaggedResolved: 38,
};

const MOCK_FLAGGED_INTERACTIONS = [
  {
    id: 'flag-1',
    clientName: 'Anonymous Client',
    providerName: 'Dr. Unknown',
    providerHandle: 'provider123',
    reason: 'Session ended abruptly',
    status: 'reviewing',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'flag-2',
    clientName: 'Anonymous Client',
    providerName: 'Wellness Coach',
    providerHandle: 'coach456',
    reason: 'Inappropriate content reported',
    status: 'new',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
];

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground', icon: Clock },
  requested: { label: 'Requested', color: 'bg-amber-500/10 text-amber-600', icon: Clock },
  accepted: { label: 'Accepted', color: 'bg-blue-500/10 text-blue-600', icon: CheckCircle },
  confirmed: { label: 'Confirmed', color: 'bg-primary/10 text-primary', icon: CheckCircle },
  completed: { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-600', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-muted text-muted-foreground', icon: XCircle },
  declined: { label: 'Declined', color: 'bg-destructive/10 text-destructive', icon: XCircle },
};

export function AdminInteractionsPanel() {
  const { state } = useMockSystem();
  const interactions = state.interactions;

  const getStatusCounts = () => {
    const counts: Record<string, number> = {};
    interactions.forEach(i => {
      counts[i.status] = (counts[i.status] || 0) + 1;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-500/10">
          <MessageSquare className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Interaction Oversight</h2>
          <p className="text-sm text-muted-foreground">
            Read-only visibility — No editing permitted
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-muted-foreground">Completion Rate</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              {(MOCK_INTERACTION_STATS.completionRate * 100).toFixed(0)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Completed</span>
            </div>
            <p className="text-2xl font-bold">{MOCK_INTERACTION_STATS.completedLifetime.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-muted-foreground">Total Cancelled</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{MOCK_INTERACTION_STATS.cancelledLifetime}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-muted-foreground">Flagged (Open)</span>
            </div>
            <p className="text-2xl font-bold text-destructive">
              {MOCK_INTERACTION_STATS.flaggedTotal - MOCK_INTERACTION_STATS.flaggedResolved}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Current Interactions by Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Current Interaction States</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(statusConfig).map(([status, config]) => {
              const Icon = config.icon;
              const count = statusCounts[status] || 0;
              return (
                <div 
                  key={status}
                  className={cn(
                    'p-3 rounded-lg border',
                    count > 0 ? config.color : 'bg-muted/30 text-muted-foreground'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{config.label}</span>
                  </div>
                  <p className="text-xl font-bold">{count}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Interactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent Interactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {interactions.slice(0, 5).map(interaction => {
            const config = statusConfig[interaction.status as keyof typeof statusConfig];
            const Icon = config?.icon || Clock;
            const isProvider = interaction.provider_user_id === 'mock-user';
            const otherParty = isProvider ? interaction.client : interaction.provider;
            
            return (
              <div 
                key={interaction.id}
                className="flex items-center gap-4 p-3 border border-border rounded-lg"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={otherParty?.avatar_url} />
                  <AvatarFallback>
                    {otherParty?.display_name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {otherParty?.display_name || 'Unknown'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({isProvider ? 'Client' : 'Provider'})
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {interaction.notes || 'No notes'}
                  </p>
                </div>
                <Badge variant="outline" className={cn('text-xs', config?.color)}>
                  <Icon className="h-3 w-3 mr-1" />
                  {config?.label || interaction.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  ${interaction.amount_due.toFixed(2)}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Flagged Interactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Flagged Interactions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {MOCK_FLAGGED_INTERACTIONS.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No flagged interactions
            </p>
          ) : (
            MOCK_FLAGGED_INTERACTIONS.map(flag => (
              <div 
                key={flag.id}
                className="flex items-start gap-4 p-3 border border-destructive/20 rounded-lg bg-destructive/5"
              >
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{flag.providerName}</span>
                    <span className="text-xs text-muted-foreground">@{flag.providerHandle}</span>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        'text-xs',
                        flag.status === 'new' ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-500/10 text-blue-600'
                      )}
                    >
                      {flag.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{flag.reason}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Flagged {Math.floor((Date.now() - flag.createdAt.getTime()) / (1000 * 60 * 60))}h ago
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Simulation Notice */}
      <Card className="border-dashed border-2 border-muted">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground text-center">
            This panel provides read-only visibility. No interaction editing is permitted.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

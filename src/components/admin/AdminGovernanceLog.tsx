import { FileText, Shield, BadgeCheck, Flag, TrendingUp, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useMockSystem } from '@/contexts/MockSystemContext';
import { GovernanceEvent, GovernanceEventType } from '@/lib/governance';

// Mock governance events for simulation (using snake_case to match types)
const MOCK_GOVERNANCE_EVENTS: GovernanceEvent[] = [
  {
    id: 'gov-1',
    user_id: 'user-1',
    event_type: 'verification_status_changed',
    previous_value: { status: 'pending' },
    new_value: { status: 'approved', tier: 'professional' },
    reason: 'Credentials verified via AHPRA registry',
    triggered_by: 'admin_simulation',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'gov-2',
    user_id: 'user-2',
    event_type: 'trust_score_changed',
    previous_value: { score: 85 },
    new_value: { score: 78 },
    reason: 'Declined interaction pattern detected',
    triggered_by: 'system',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'gov-3',
    user_id: 'user-3',
    event_type: 'tier_changed',
    previous_value: { tier: 'green' },
    new_value: { tier: 'blue' },
    reason: 'Subscriber count exceeded 250,000',
    triggered_by: 'system',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'gov-4',
    user_id: 'user-4',
    event_type: 'report_upheld',
    previous_value: { reports_upheld: 0 },
    new_value: { reports_upheld: 1 },
    reason: 'Spam activity confirmed',
    triggered_by: 'report',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'gov-5',
    user_id: 'user-5',
    event_type: 'interaction_flagged',
    previous_value: { flagged: false },
    new_value: { flagged: true, reason: 'Inappropriate content' },
    reason: 'Client reported inappropriate session content',
    triggered_by: 'report',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const EVENT_CONFIG: Record<GovernanceEventType, { 
  icon: typeof FileText; 
  label: string; 
  color: string;
}> = {
  trust_score_changed: { icon: TrendingUp, label: 'Trust Score Change', color: 'bg-blue-500/10 text-blue-600' },
  verification_status_changed: { icon: BadgeCheck, label: 'Verification Changed', color: 'bg-emerald-500/10 text-emerald-600' },
  tier_changed: { icon: Shield, label: 'Tier Change', color: 'bg-primary/10 text-primary' },
  report_upheld: { icon: Flag, label: 'Report Upheld', color: 'bg-amber-500/10 text-amber-600' },
  interaction_flagged: { icon: Flag, label: 'Interaction Flagged', color: 'bg-destructive/10 text-destructive' },
  trust_flag_added: { icon: Flag, label: 'Flag Added', color: 'bg-amber-500/10 text-amber-600' },
  trust_flag_removed: { icon: Shield, label: 'Flag Removed', color: 'bg-emerald-500/10 text-emerald-600' },
  escalation_level_changed: { icon: TrendingUp, label: 'Escalation Change', color: 'bg-amber-500/10 text-amber-600' },
};

const formatTimeAgo = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  return 'Just now';
};

export function AdminGovernanceLog() {
  const events = MOCK_GOVERNANCE_EVENTS;

  const eventsByDay = events.reduce<Record<string, GovernanceEvent[]>>((acc, event) => {
    const day = new Date(event.created_at).toLocaleDateString();
    if (!acc[day]) acc[day] = [];
    acc[day].push(event);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-muted">
          <FileText className="h-5 w-5 text-foreground" />
        </div>
        <div>
          <h2 className="text-headline font-bold text-foreground">Governance Event Log</h2>
          <p className="text-body text-muted-foreground">Internal transparency & audit trail</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-body font-medium">Event Timeline</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(eventsByDay).map(([day, dayEvents]) => (
            <div key={day}>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-label font-medium text-muted-foreground px-2">{day}</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="space-y-3">
                {dayEvents.map(event => {
                  const config = EVENT_CONFIG[event.event_type];
                  const Icon = config?.icon || FileText;
                  return (
                    <div key={event.id} className="flex items-start gap-4 p-3 border border-border rounded-lg">
                      <div className={cn('p-2 rounded-lg shrink-0', config?.color || 'bg-muted')}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-body">{config?.label || event.event_type}</span>
                          <span className="text-label text-muted-foreground">{formatTimeAgo(event.created_at)}</span>
                        </div>
                        <p className="text-body text-muted-foreground mb-2">{event.reason}</p>
                        <div className="flex items-center gap-4 text-label">
                          {event.previous_value && (
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">From:</span>
                              <code className="bg-muted px-1.5 py-0.5 rounded">{JSON.stringify(event.previous_value)}</code>
                            </div>
                          )}
                          {event.new_value && (
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">To:</span>
                              <code className="bg-muted px-1.5 py-0.5 rounded">{JSON.stringify(event.new_value)}</code>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-label text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{event.user_id.slice(0, 8)}...</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-dashed border-2 border-muted">
        <CardContent className="py-4 space-y-2">
          <p className="text-body font-medium text-center">This log exists for:</p>
          <div className="flex justify-center gap-6 text-body text-muted-foreground">
            <span>• Internal transparency</span>
            <span>• Founder oversight</span>
            <span>• Future audit readiness</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

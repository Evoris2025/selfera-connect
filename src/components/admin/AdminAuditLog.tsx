import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { FileText, Filter, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuditLogs, AuditLogEntry } from '@/hooks/useAuditLog';

const actionTypeLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  verification_approved: { label: 'Verification Approved', variant: 'default' },
  verification_rejected: { label: 'Verification Rejected', variant: 'destructive' },
  role_change: { label: 'Role Change', variant: 'secondary' },
  account_upgrade: { label: 'Account Upgrade', variant: 'default' },
  account_downgrade: { label: 'Account Downgrade', variant: 'outline' },
  user_blocked: { label: 'User Blocked', variant: 'destructive' },
  user_unblocked: { label: 'User Unblocked', variant: 'outline' },
  report_resolved: { label: 'Report Resolved', variant: 'default' },
  report_dismissed: { label: 'Report Dismissed', variant: 'outline' },
  connection_approved: { label: 'Connection Approved', variant: 'default' },
  connection_rejected: { label: 'Connection Rejected', variant: 'destructive' },
  content_removed: { label: 'Content Removed', variant: 'destructive' },
  content_limited: { label: 'Content Limited', variant: 'secondary' },
};

const entityTypeLabels: Record<string, string> = {
  profiles: 'Profile',
  reports: 'Report',
  verification_requests: 'Verification',
  user_support_links: 'Connection',
  posts: 'Post',
  comments: 'Comment',
  user_roles: 'Role',
};

function LogEntrySkeleton() {
  return (
    <div className="p-4 border rounded-lg space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}

function LogEntryCard({ entry }: { entry: AuditLogEntry }) {
  const actionConfig = actionTypeLabels[entry.action_type] || { 
    label: entry.action_type, 
    variant: 'outline' as const 
  };
  const entityLabel = entityTypeLabels[entry.target_entity_type] || entry.target_entity_type;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={actionConfig.variant}>
                {actionConfig.label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {entityLabel}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Target: <code className="text-xs bg-muted px-1 rounded">{entry.target_entity_id.slice(0, 8)}...</code>
            </p>
            {entry.notes && (
              <p className="text-sm text-foreground mt-2 p-2 bg-muted/50 rounded">
                {entry.notes}
              </p>
            )}
          </div>
          <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
            {format(new Date(entry.created_at), 'MMM d, yyyy')}
            <br />
            {format(new Date(entry.created_at), 'h:mm a')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminAuditLog() {
  const { logs, isLoading, fetchLogs } = useAuditLogs();
  const [actionFilter, setActionFilter] = useState<string>('all');

  useEffect(() => {
    fetchLogs(actionFilter === 'all' ? {} : { actionType: actionFilter });
  }, [actionFilter]);

  const handleRefresh = () => {
    fetchLogs(actionFilter === 'all' ? {} : { actionType: actionFilter });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Audit Log
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {Object.entries(actionTypeLabels).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          <LogEntrySkeleton />
          <LogEntrySkeleton />
          <LogEntrySkeleton />
        </div>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No audit logs found</p>
            <p className="text-sm">Admin actions will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {logs.map((entry) => (
            <LogEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

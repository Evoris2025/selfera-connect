import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Flag, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock,
  AlertTriangle,
  MessageSquare,
  User,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useReports, Report } from '@/hooks/useReports';

interface AdminModerationQueueProps {
  onBack: () => void;
}

const statusConfig = {
  new: { label: 'New', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Clock },
  reviewing: { label: 'Reviewing', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: Eye },
  actioned: { label: 'Actioned', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle },
  dismissed: { label: 'Dismissed', color: 'bg-muted text-muted-foreground border-border', icon: XCircle },
};

const targetTypeIcons = {
  post: FileText,
  comment: MessageSquare,
  profile: User,
  message: MessageSquare,
};

const reasonLabels: Record<string, string> = {
  harassment: 'Harassment',
  hate_speech: 'Hate Speech',
  spam: 'Spam',
  self_harm: 'Self-harm',
  misinformation: 'Misinformation',
  inappropriate_content: 'Inappropriate',
  impersonation: 'Impersonation',
  other: 'Other',
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  return 'Just now';
}

function ReportCard({ report, onStatusChange }: { 
  report: Report; 
  onStatusChange: (reportId: string, status: Report['status']) => void;
}) {
  const StatusIcon = statusConfig[report.status].icon;
  const TargetIcon = targetTypeIcons[report.targetType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border border-border rounded-xl bg-card hover:bg-card/80 transition-colors"
    >
      <div className="flex items-start gap-4">
        {/* Reporter Avatar */}
        <Avatar className="h-10 w-10">
          {report.reporterProfile?.avatarUrl && (
            <AvatarImage src={report.reporterProfile.avatarUrl} />
          )}
          <AvatarFallback>
            {report.reporterProfile?.displayName?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="font-medium text-body">
              {report.reporterProfile?.displayName || 'Unknown'}
            </span>
            <span className="text-muted-foreground text-body">reported a</span>
            <div className="flex items-center gap-1 text-body">
              <TargetIcon className="h-3.5 w-3.5" />
              <span className="font-medium">{report.targetType}</span>
            </div>
            <span className="text-muted-foreground text-label">
              · {formatTimeAgo(report.createdAt)}
            </span>
          </div>

          {/* Reason Badge */}
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-label">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {reasonLabels[report.reason] || report.reason}
            </Badge>
            <Badge 
              variant="outline" 
              className={cn('text-label', statusConfig[report.status].color)}
            >
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig[report.status].label}
            </Badge>
          </div>

          {/* Details */}
          {report.details && (
            <p className="text-body text-muted-foreground bg-secondary/50 rounded-lg p-3 mt-2">
              "{report.details}"
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            <Select
              value={report.status}
              onValueChange={(value) => onStatusChange(report.id, value as Report['status'])}
            >
              <SelectTrigger className="w-32 h-8 text-label">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="actioned">Actioned</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" className="h-8 text-label">
              View Content
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ReportSkeleton() {
  return (
    <div className="p-4 border border-border rounded-xl">
      <div className="flex items-start gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    </div>
  );
}

export function AdminModerationQueue({ onBack }: AdminModerationQueueProps) {
  const { reports, isLoading, fetchAllReports, updateReportStatus } = useReports();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchAllReports();
  }, [fetchAllReports]);

  const filteredReports = statusFilter === 'all' 
    ? reports 
    : reports.filter(r => r.status === statusFilter);

  const statusCounts = {
    new: reports.filter(r => r.status === 'new').length,
    reviewing: reports.filter(r => r.status === 'reviewing').length,
    actioned: reports.filter(r => r.status === 'actioned').length,
    dismissed: reports.filter(r => r.status === 'dismissed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-headline font-bold">Moderation Queue</h2>
          <p className="text-body text-muted-foreground">
            {reports.length} total reports
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={statusFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('all')}
        >
          All ({reports.length})
        </Button>
        {Object.entries(statusConfig).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <Button
              key={key}
              variant={statusFilter === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(key)}
              className="gap-1.5"
            >
              <Icon className="h-3.5 w-3.5" />
              {config.label} ({statusCounts[key as keyof typeof statusCounts]})
            </Button>
          );
        })}
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {isLoading ? (
          <>
            <ReportSkeleton />
            <ReportSkeleton />
            <ReportSkeleton />
          </>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
              <Flag className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">No reports</h3>
            <p className="text-body text-muted-foreground">
              {statusFilter === 'all' 
                ? 'No reports have been submitted yet.' 
                : `No ${statusFilter} reports.`}
            </p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <ReportCard 
              key={report.id} 
              report={report} 
              onStatusChange={updateReportStatus}
            />
          ))
        )}
      </div>
    </div>
  );
}

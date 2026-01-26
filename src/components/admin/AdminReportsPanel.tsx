import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Flag, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock,
  AlertTriangle,
  MessageSquare,
  User,
  FileText,
  Image
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Mock reports data for simulation
const MOCK_REPORTS = [
  {
    id: 'report-1',
    targetType: 'post',
    targetId: 'post-123',
    reason: 'harassment',
    details: 'This post contains targeted harassment against another user.',
    status: 'new',
    severity: 'medium',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    reporter: { name: 'Alex Johnson', handle: 'alexj', avatar: '' },
    internalNotes: '',
  },
  {
    id: 'report-2',
    targetType: 'comment',
    targetId: 'comment-456',
    reason: 'spam',
    details: 'Repeated promotional content in comments.',
    status: 'reviewing',
    severity: 'low',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    reporter: { name: 'Jamie Lee', handle: 'jamielee', avatar: '' },
    internalNotes: 'Checking comment history',
  },
  {
    id: 'report-3',
    targetType: 'profile',
    targetId: 'user-789',
    reason: 'impersonation',
    details: 'This account appears to be impersonating a licensed therapist.',
    status: 'new',
    severity: 'high',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    reporter: { name: 'Mind Matters', handle: 'mindmatters', avatar: '' },
    internalNotes: '',
  },
  {
    id: 'report-4',
    targetType: 'interaction',
    targetId: 'int-abc',
    reason: 'inappropriate_content',
    details: 'Provider shared inappropriate content during session.',
    status: 'new',
    severity: 'high',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    reporter: { name: 'Morgan Taylor', handle: 'morgant', avatar: '' },
    internalNotes: '',
  },
  {
    id: 'report-5',
    targetType: 'post',
    targetId: 'post-def',
    reason: 'misinformation',
    details: 'Post contains medical misinformation about mental health treatment.',
    status: 'reviewing',
    severity: 'medium',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    reporter: { name: 'Dr. Sarah', handle: 'drsarah', avatar: '' },
    internalNotes: 'Consulting with medical advisor',
  },
];

const statusConfig = {
  new: { label: 'New', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Clock },
  reviewing: { label: 'Reviewing', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: Eye },
  actioned: { label: 'Actioned', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle },
  dismissed: { label: 'Dismissed', color: 'bg-muted text-muted-foreground border-border', icon: XCircle },
};

const severityColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-amber-500/10 text-amber-600',
  high: 'bg-destructive/10 text-destructive',
};

const targetTypeIcons = {
  post: FileText,
  comment: MessageSquare,
  profile: User,
  interaction: MessageSquare,
  image: Image,
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

export function AdminReportsPanel() {
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const filteredReports = statusFilter === 'all' 
    ? reports 
    : reports.filter(r => r.status === statusFilter);

  const statusCounts = {
    new: reports.filter(r => r.status === 'new').length,
    reviewing: reports.filter(r => r.status === 'reviewing').length,
    actioned: reports.filter(r => r.status === 'actioned').length,
    dismissed: reports.filter(r => r.status === 'dismissed').length,
  };

  const handleStatusChange = (reportId: string, newStatus: string) => {
    setReports(prev => prev.map(r => 
      r.id === reportId ? { ...r, status: newStatus } : r
    ));
  };

  const handleSeverityChange = (reportId: string, newSeverity: string) => {
    setReports(prev => prev.map(r => 
      r.id === reportId ? { ...r, severity: newSeverity } : r
    ));
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-500/10">
          <Flag className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Reports Review</h2>
          <p className="text-sm text-muted-foreground">
            Review-only visibility — No enforcement actions
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
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Flag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No reports in this category</p>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => {
            const StatusIcon = statusConfig[report.status as keyof typeof statusConfig].icon;
            const TargetIcon = targetTypeIcons[report.targetType as keyof typeof targetTypeIcons] || FileText;
            const isExpanded = expandedReport === report.id;

            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-border rounded-xl bg-card overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={report.reporter.avatar} />
                      <AvatarFallback>
                        {report.reporter.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="font-medium text-sm">
                          {report.reporter.name}
                        </span>
                        <span className="text-muted-foreground text-sm">reported a</span>
                        <div className="flex items-center gap-1 text-sm">
                          <TargetIcon className="h-3.5 w-3.5" />
                          <span className="font-medium">{report.targetType}</span>
                        </div>
                        <span className="text-muted-foreground text-xs">
                          · {formatTimeAgo(report.createdAt)}
                        </span>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {reasonLabels[report.reason] || report.reason}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={cn('text-xs', statusConfig[report.status as keyof typeof statusConfig].color)}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[report.status as keyof typeof statusConfig].label}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={cn('text-xs capitalize', severityColors[report.severity as keyof typeof severityColors])}
                        >
                          {report.severity} severity
                        </Badge>
                      </div>

                      {/* Details */}
                      <p className="text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3">
                        "{report.details}"
                      </p>

                      {/* Controls */}
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <Select
                          value={report.status}
                          onValueChange={(value) => handleStatusChange(report.id, value)}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="reviewing">Reviewing</SelectItem>
                            <SelectItem value="actioned">Actioned</SelectItem>
                            <SelectItem value="dismissed">Dismissed</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select
                          value={report.severity}
                          onValueChange={(value) => handleSeverityChange(report.id, value)}
                        >
                          <SelectTrigger className="w-28 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs"
                          onClick={() => setExpandedReport(isExpanded ? null : report.id)}
                        >
                          {isExpanded ? 'Hide Notes' : 'Add Notes'}
                        </Button>
                      </div>

                      {/* Internal Notes Expansion */}
                      {isExpanded && (
                        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs font-medium mb-2">Internal Notes</p>
                          <Textarea
                            value={notes[report.id] || report.internalNotes}
                            onChange={(e) => setNotes(prev => ({ ...prev, [report.id]: e.target.value }))}
                            placeholder="Add internal notes for this report..."
                            className="text-sm min-h-[80px]"
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            Notes are for internal tracking only and not shared with reporters.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Simulation Notice */}
      <Card className="border-dashed border-2 border-muted">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground text-center">
            This is a review-only panel. No enforcement actions are available in simulation mode.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

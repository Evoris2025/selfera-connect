import { useState } from 'react';
import { BadgeCheck, Check, X, Loader2, ExternalLink, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminVerification, VerificationRequest } from '@/hooks/useVerification';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface RequestCardProps {
  request: VerificationRequest & { profile?: { display_name: string; handle: string; avatar_url: string } };
  onApprove: (id: string, notes?: string) => void;
  onReject: (id: string, notes?: string) => void;
}

function RequestCard({ request, onApprove, onReject }: RequestCardProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    setIsProcessing(true);
    await onApprove(request.id);
    setIsProcessing(false);
  };

  const handleReject = async () => {
    setIsProcessing(true);
    await onReject(request.id, rejectNotes);
    setIsProcessing(false);
    setShowRejectDialog(false);
  };

  const fields = request.submitted_fields || {};

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center gap-4 p-4 border-b border-border/50">
            <Avatar className="h-12 w-12">
              <AvatarImage src={request.profile?.avatar_url} />
              <AvatarFallback>
                {request.profile?.display_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  {request.profile?.display_name || fields.display_name || 'Unknown'}
                </span>
                <Badge variant="secondary" className="capitalize">
                  {request.account_type_requested}
                </Badge>
              </div>
              <p className="text-body text-muted-foreground">
                @{request.profile?.handle || 'unknown'}
              </p>
            </div>
            <div className="text-right">
              <Badge 
                variant={
                  request.status === 'approved' ? 'default' :
                  request.status === 'rejected' ? 'destructive' : 'secondary'
                }
              >
                {request.status}
              </Badge>
              <p className="text-label text-muted-foreground mt-1">
                {new Date(request.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="p-4 space-y-3 text-body">
            {fields.country && (
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground min-w-24">Country:</span>
                <span className="text-foreground">{fields.country}</span>
              </div>
            )}
            {fields.credentials_summary && (
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground min-w-24">Credentials:</span>
                <span className="text-foreground">{fields.credentials_summary}</span>
              </div>
            )}
            {fields.registration_number && (
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground min-w-24">License #:</span>
                <span className="text-foreground">{fields.registration_number}</span>
              </div>
            )}
            {fields.website && (
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground min-w-24">Website:</span>
                <a 
                  href={fields.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  {fields.website}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>

          {/* Actions - only for pending requests */}
          {request.status === 'pending' && (
            <div className="flex items-center gap-2 p-4 border-t border-border/50 bg-muted/30">
              <Button
                variant="default"
                size="sm"
                className="flex-1 gap-2"
                onClick={handleApprove}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2"
                onClick={() => setShowRejectDialog(true)}
                disabled={isProcessing}
              >
                <X className="h-4 w-4" />
                Reject
              </Button>
            </div>
          )}

          {/* Admin notes for processed requests */}
          {request.status !== 'pending' && request.admin_notes && (
            <div className="p-4 border-t border-border/50 bg-muted/30">
              <p className="text-label text-muted-foreground mb-1">Admin notes:</p>
              <p className="text-body">{request.admin_notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this request. The user will see this message.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-notes">Rejection Reason</Label>
            <Textarea
              id="reject-notes"
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="e.g. Unable to verify credentials. Please provide additional documentation."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isProcessing}>
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function AdminVerificationQueue() {
  const { requests, isLoading, updateRequest } = useAdminVerification();

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-verified/10">
          <BadgeCheck className="h-5 w-5 text-verified" />
        </div>
        <div>
          <h2 className="text-headline font-bold text-foreground">Verification Queue</h2>
          <p className="text-body text-muted-foreground">
            Review and process verification requests
          </p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="w-full max-w-xs">
          <TabsTrigger value="pending" className="flex-1 gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="processed" className="flex-1 gap-2">
            <User className="h-4 w-4" />
            Processed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6 space-y-4">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BadgeCheck className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No pending requests</p>
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map(request => (
              <RequestCard
                key={request.id}
                request={request}
                onApprove={(id, notes) => updateRequest(id, 'approved', notes)}
                onReject={(id, notes) => updateRequest(id, 'rejected', notes)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="processed" className="mt-6 space-y-4">
          {processedRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No processed requests yet</p>
              </CardContent>
            </Card>
          ) : (
            processedRequests.map(request => (
              <RequestCard
                key={request.id}
                request={request}
                onApprove={(id, notes) => updateRequest(id, 'approved', notes)}
                onReject={(id, notes) => updateRequest(id, 'rejected', notes)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

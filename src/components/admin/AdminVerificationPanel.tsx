import { useState } from 'react';
import { BadgeCheck, Check, X, Clock, User, ExternalLink, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Mock verification requests for simulation
const INITIAL_MOCK_REQUESTS = [
  {
    id: 'ver-1',
    userId: 'user-1',
    status: 'pending',
    accountTypeRequested: 'professional',
    displayName: 'Dr. Emma Richards',
    handle: 'dremma',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    country: 'Australia',
    credentialsSummary: 'Licensed Clinical Psychologist, AHPRA registered',
    registrationNumber: 'PSY0012345',
    website: 'https://emmarichards-therapy.com',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    adminNotes: '',
  },
  {
    id: 'ver-2',
    userId: 'user-2',
    status: 'pending',
    accountTypeRequested: 'organization',
    displayName: 'Mindful Living Foundation',
    handle: 'mindfulorg',
    avatarUrl: '',
    country: 'United Kingdom',
    credentialsSummary: 'Registered charity focused on mental health awareness',
    registrationNumber: 'CH-789456',
    website: 'https://mindfulliving.org.uk',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    adminNotes: '',
  },
  {
    id: 'ver-3',
    userId: 'user-3',
    status: 'pending',
    accountTypeRequested: 'professional',
    displayName: 'Marcus Chen, LMFT',
    handle: 'marcustherapy',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    country: 'United States',
    credentialsSummary: 'Licensed Marriage & Family Therapist, California',
    registrationNumber: 'LMFT-87654',
    website: 'https://marcuschentherapy.com',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    adminNotes: '',
  },
  {
    id: 'ver-4',
    userId: 'user-4',
    status: 'approved',
    accountTypeRequested: 'professional',
    displayName: 'Dr. Sarah Mitchell',
    handle: 'drsarah',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    country: 'Australia',
    credentialsSummary: 'Psychiatrist, RANZCP Fellow',
    registrationNumber: 'MED-345678',
    website: 'https://drsarahmitchell.com.au',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    adminNotes: 'Verified via AHPRA registry. Approved.',
  },
  {
    id: 'ver-5',
    userId: 'user-5',
    status: 'rejected',
    accountTypeRequested: 'professional',
    displayName: 'John Wellness',
    handle: 'johnwell',
    avatarUrl: '',
    country: 'Canada',
    credentialsSummary: 'Life coach',
    registrationNumber: '',
    website: '',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    adminNotes: 'Unable to verify professional credentials. No registration body listed.',
  },
];

export function AdminVerificationPanel() {
  const [requests, setRequests] = useState(INITIAL_MOCK_REQUESTS);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<typeof INITIAL_MOCK_REQUESTS[0] | null>(null);
  const [actionNotes, setActionNotes] = useState('');

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  const handleApprove = (request: typeof INITIAL_MOCK_REQUESTS[0]) => {
    setSelectedRequest(request);
    setActionNotes('');
    setShowApproveDialog(true);
  };

  const handleReject = (request: typeof INITIAL_MOCK_REQUESTS[0]) => {
    setSelectedRequest(request);
    setActionNotes('');
    setShowRejectDialog(true);
  };

  const confirmApprove = () => {
    if (!selectedRequest) return;
    setRequests(prev => prev.map(r => 
      r.id === selectedRequest.id 
        ? { ...r, status: 'approved', adminNotes: actionNotes || 'Approved.' }
        : r
    ));
    setShowApproveDialog(false);
    setSelectedRequest(null);
  };

  const confirmReject = () => {
    if (!selectedRequest) return;
    setRequests(prev => prev.map(r => 
      r.id === selectedRequest.id 
        ? { ...r, status: 'rejected', adminNotes: actionNotes }
        : r
    ));
    setShowRejectDialog(false);
    setSelectedRequest(null);
  };

  const requestMoreInfo = (request: typeof INITIAL_MOCK_REQUESTS[0]) => {
    setRequests(prev => prev.map(r => 
      r.id === request.id 
        ? { ...r, adminNotes: 'Requested additional documentation.' }
        : r
    ));
  };

  const formatDate = (date: Date) => date.toLocaleDateString();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-verified/10">
          <BadgeCheck className="h-5 w-5 text-verified" />
        </div>
        <div>
          <h2 className="text-headline font-bold text-foreground">Verification Review</h2>
          <p className="text-body text-muted-foreground">
            Review and process ERA verification requests
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
              <Card key={request.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Header */}
                  <div className="flex items-center gap-4 p-4 border-b border-border/50">
                    <Avatar size="md">
                      <AvatarImage src={request.avatarUrl} />
                      <AvatarFallback>
                        {request.displayName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {request.displayName}
                        </span>
                        <Badge variant="secondary" className="capitalize">
                          {request.accountTypeRequested}
                        </Badge>
                      </div>
                      <p className="text-body text-muted-foreground">
                        @{request.handle}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">pending</Badge>
                      <p className="text-label text-muted-foreground mt-1">
                        {formatDate(request.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4 space-y-3 text-body">
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground min-w-24">Country:</span>
                      <span className="text-foreground">{request.country}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground min-w-24">Credentials:</span>
                      <span className="text-foreground">{request.credentialsSummary}</span>
                    </div>
                    {request.registrationNumber && (
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground min-w-24">License #:</span>
                        <span className="text-foreground">{request.registrationNumber}</span>
                      </div>
                    )}
                    {request.website && (
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground min-w-24">Website:</span>
                        <a 
                          href={request.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          {request.website}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 p-4 border-t border-border/50 bg-muted/30">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => handleApprove(request)}
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => handleReject(request)}
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      onClick={() => requestMoreInfo(request)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Request Info
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
              <Card key={request.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 p-4 border-b border-border/50">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={request.avatarUrl} />
                      <AvatarFallback>
                        {request.displayName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-foreground">
                        {request.displayName}
                      </span>
                      <p className="text-body text-muted-foreground">
                        @{request.handle}
                      </p>
                    </div>
                    <Badge 
                      variant={request.status === 'approved' ? 'default' : 'destructive'}
                    >
                      {request.status}
                    </Badge>
                  </div>
                  {request.adminNotes && (
                    <div className="p-4 bg-muted/30">
                      <p className="text-label text-muted-foreground mb-1">Admin notes:</p>
                      <p className="text-body">{request.adminNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Verification</DialogTitle>
            <DialogDescription>
              Approving will update the user's ERA Verified status and badge color.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="approve-notes">Notes (optional)</Label>
            <Textarea
              id="approve-notes"
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="e.g. Verified credentials via official registry."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmApprove}>
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejection. This will be visible to the applicant.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-notes">Rejection Reason</Label>
            <Textarea
              id="reject-notes"
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="e.g. Unable to verify credentials. Please provide additional documentation."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReject}>
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Simulation Notice */}
      <Card className="border-dashed border-2 border-muted">
        <CardContent className="py-4">
          <p className="text-body text-muted-foreground text-center">
            Simulation mode — Changes do not affect real user accounts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

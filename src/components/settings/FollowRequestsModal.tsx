import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, X, UserPlus } from 'lucide-react';
import { useFollowRequests } from '@/hooks/useFollowRequests';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface FollowRequestsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FollowRequestsModal({ open, onOpenChange }: FollowRequestsModalProps) {
  const { pendingRequests, isLoading, approveRequest, rejectRequest } = useFollowRequests();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Follow Requests
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {isLoading ? (
            <div className="space-y-4 p-1">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-28 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No pending follow requests</p>
            </div>
          ) : (
            <div className="space-y-3 p-1">
              {pendingRequests.map(request => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <Link
                    to={`/profile/${request.follower.handle}`}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1 min-w-0"
                    onClick={() => onOpenChange(false)}
                  >
                    <Avatar size="md" className="shrink-0">
                      <AvatarImage src={request.follower.avatar} alt={request.follower.name} />
                      <AvatarFallback>{request.follower.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-body truncate">{request.follower.name}</p>
                      <p className="text-label text-muted-foreground truncate">@{request.follower.handle}</p>
                      <p className="text-label text-muted-foreground mt-0.5">
                        {formatDistanceToNow(request.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <Button
                      size="icon"
                      variant="default"
                      className="h-8 w-8 rounded-full"
                      onClick={() => approveRequest(request.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 rounded-full"
                      onClick={() => rejectRequest(request.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

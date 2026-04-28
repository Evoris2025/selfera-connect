import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldOff, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSafety } from '@/contexts/SafetyContext';
import { Link } from 'react-router-dom';

interface BlockedUser {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl: string;
}

interface BlockedUsersListProps {
  onBack: () => void;
}

export function BlockedUsersList({ onBack }: BlockedUsersListProps) {
  const { blockedUserIds, unblockUser, isBlocking } = useSafety();
  const [users, setUsers] = useState<BlockedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      if (blockedUserIds.size === 0) {
        setUsers([]);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, handle, avatar_url')
          .in('id', Array.from(blockedUserIds));

        if (error) throw error;

        setUsers(
          (data || []).map(p => ({
            id: p.id,
            displayName: p.display_name || p.handle || 'Anonymous',
            handle: p.handle || 'anonymous',
            avatarUrl: p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`,
          }))
        );
      } catch (error) {
        console.error('Error fetching blocked users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlockedUsers();
  }, [blockedUserIds]);

  const handleUnblock = async (userId: string) => {
    const success = await unblockUser(userId);
    if (success) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="gap-2 -ml-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Settings
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <ShieldOff className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-title">Blocked Accounts</CardTitle>
              <CardDescription>
                Blocked accounts cannot see your profile or interact with you
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              You haven't blocked anyone yet
            </p>
          ) : (
            <div className="space-y-3">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between">
                  <Link
                    to={`/profile/${user.handle}`}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                      <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-body">{user.displayName}</p>
                      <p className="text-label text-muted-foreground">@{user.handle}</p>
                    </div>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnblock(user.id)}
                    disabled={isBlocking}
                  >
                    Unblock
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CinematicAvatar } from '@/components/ui/CinematicAvatar';
import { EraVerifiedTick } from '@/components/EraVerifiedTick';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type ListType = 'followers' | 'following' | 'community';

interface UserListItem {
  id: string;
  display_name: string | null;
  handle: string | null;
  avatar_url: string | null;
  bio: string | null;
  isFollowing?: boolean;
  is_verified?: boolean;
  email?: string | null;
}

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ListType;
  userId: string;
  userName?: string;
}

// Mock data for demo
const mockFollowers: UserListItem[] = [
  { id: '1', display_name: 'Sarah Chen', handle: 'sarahc', avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop', bio: 'Mental health advocate', isFollowing: true, is_verified: true },
  { id: '2', display_name: 'Mind Matters', handle: 'mindmatters', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop', bio: 'Daily wellness tips', isFollowing: false, is_verified: true },
  { id: '3', display_name: 'James Wilson', handle: 'jwilson', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop', bio: 'Sharing my journey', isFollowing: true, is_verified: false },
  { id: '4', display_name: 'Wellness Hub', handle: 'wellnesshub', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop', bio: 'Your daily dose of calm', isFollowing: false, is_verified: true },
  { id: '5', display_name: 'Emma Roberts', handle: 'emmar', avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop', bio: 'Mindfulness coach', isFollowing: true, is_verified: false },
];

const mockFollowing: UserListItem[] = [
  { id: '6', display_name: 'Alex Turner', handle: 'alext', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', bio: 'Daily reflections', isFollowing: true, is_verified: false },
  { id: '7', display_name: 'Calm Corner', handle: 'calmcorner', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop', bio: 'Peace of mind', isFollowing: true, is_verified: true },
  { id: '8', display_name: 'Mike Chen', handle: 'mikec', avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop', bio: 'Growth mindset', isFollowing: true, is_verified: false },
];

const mockCommunity: UserListItem[] = [
  { id: '9', display_name: 'Support Circle', handle: 'supportcircle', avatar_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&h=200&fit=crop', bio: 'Community support group', isFollowing: false, is_verified: true },
  { id: '10', display_name: 'Mindful Living', handle: 'mindfulliving', avatar_url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=200&h=200&fit=crop', bio: 'Living in the moment', isFollowing: true, is_verified: false },
];

export function UserListModal({ isOpen, onClose, type, userId, userName }: UserListModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});

  const titles: Record<ListType, string> = {
    followers: 'Followers',
    following: 'Following',
    community: 'Community',
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, type, userId]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let fetchedUsers: UserListItem[] = [];
      
      if (type === 'followers') {
        // Fetch followers
        const { data, error } = await supabase
          .from('follows')
          .select(`
            follower_id,
            profiles!follows_follower_id_fkey (
              id,
              display_name,
              handle,
              avatar_url,
              bio,
              is_verified,
              email
            )
          `)
          .eq('following_id', userId)
          .eq('status', 'approved');

        if (!error && data) {
          fetchedUsers = data
            .filter(f => f.profiles)
            .map(f => ({
              id: (f.profiles as any).id,
              display_name: (f.profiles as any).display_name,
              handle: (f.profiles as any).handle,
              avatar_url: (f.profiles as any).avatar_url,
              bio: (f.profiles as any).bio,
              is_verified: (f.profiles as any).is_verified,
              email: (f.profiles as any).email,
            }));
        }
      } else if (type === 'following') {
        // Fetch following
        const { data, error } = await supabase
          .from('follows')
          .select(`
            following_id,
            profiles!follows_following_id_fkey (
              id,
              display_name,
              handle,
              avatar_url,
              bio,
              is_verified,
              email
            )
          `)
          .eq('follower_id', userId)
          .eq('status', 'approved');

        if (!error && data) {
          fetchedUsers = data
            .filter(f => f.profiles)
            .map(f => ({
              id: (f.profiles as any).id,
              display_name: (f.profiles as any).display_name,
              handle: (f.profiles as any).handle,
              avatar_url: (f.profiles as any).avatar_url,
              bio: (f.profiles as any).bio,
              is_verified: (f.profiles as any).is_verified,
              email: (f.profiles as any).email,
            }));
        }
      } else if (type === 'community') {
        // Fetch community members
        const { data, error } = await supabase
          .from('user_community_members')
          .select(`
            member_user_id,
            profiles!user_community_members_member_user_id_fkey (
              id,
              display_name,
              handle,
              avatar_url,
              bio,
              is_verified,
              email
            )
          `)
          .eq('user_id', userId);

        if (!error && data) {
          fetchedUsers = data
            .filter(f => f.profiles)
            .map(f => ({
              id: (f.profiles as any).id,
              display_name: (f.profiles as any).display_name,
              handle: (f.profiles as any).handle,
              avatar_url: (f.profiles as any).avatar_url,
              bio: (f.profiles as any).bio,
              is_verified: (f.profiles as any).is_verified,
              email: (f.profiles as any).email,
            }));
        }
      }

      // If no real users, use mock data
      if (fetchedUsers.length === 0) {
        fetchedUsers = type === 'followers' ? mockFollowers : 
                       type === 'following' ? mockFollowing : mockCommunity;
      }

      // Check which users the current user is following
      if (user && fetchedUsers.length > 0) {
        const { data: followsData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id)
          .eq('status', 'approved');

        const followingSet = new Set(followsData?.map(f => f.following_id) || []);
        const states: Record<string, boolean> = {};
        fetchedUsers.forEach(u => {
          states[u.id] = followingSet.has(u.id) || u.isFollowing === true;
        });
        setFollowingStates(states);
      }

      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to mock data
      setUsers(type === 'followers' ? mockFollowers : 
               type === 'following' ? mockFollowing : mockCommunity);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (targetUserId: string) => {
    if (!user) return;

    const isCurrentlyFollowing = followingStates[targetUserId];
    
    // Optimistic update
    setFollowingStates(prev => ({
      ...prev,
      [targetUserId]: !isCurrentlyFollowing,
    }));

    try {
      if (isCurrentlyFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);
      } else {
        await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: targetUserId,
            status: 'approved',
          });
      }
    } catch (error) {
      // Revert on error
      setFollowingStates(prev => ({
        ...prev,
        [targetUserId]: isCurrentlyFollowing,
      }));
    }
  };

  const handleUserClick = (userHandle: string | null, userId: string) => {
    onClose();
    navigate(`/profile/${userHandle || userId}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[10%] bottom-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md z-50 flex flex-col bg-card rounded-2xl border border-border shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-title font-semibold text-foreground">{titles[type]}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* User List */}
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {type === 'followers' && 'No followers yet'}
                  {type === 'following' && 'Not following anyone yet'}
                  {type === 'community' && 'No community members yet'}
                </div>
              ) : (
                <div className="py-2">
                  {users.map((listUser, index) => {
                    const isFollowingUser = followingStates[listUser.id];
                    const isCurrentUser = user?.id === listUser.id;
                    
                    return (
                      <motion.div
                        key={listUser.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                      >
                        {/* Avatar */}
                        <div 
                          className="cursor-pointer"
                          onClick={() => handleUserClick(listUser.handle, listUser.id)}
                        >
                          <CinematicAvatar
                            src={listUser.avatar_url || ''}
                            alt={listUser.display_name || ''}
                            fallback={(listUser.display_name || 'U').charAt(0)}
                            size="md"
                            ring="muted"
                            interactive
                          />
                        </div>
                        
                        {/* User Info */}
                        <div 
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => handleUserClick(listUser.handle, listUser.id)}
                        >
                          <p className="font-semibold text-body text-foreground truncate inline-flex items-center gap-1">
                            <span>{listUser.display_name || 'User'}</span>
                            {listUser.is_verified && (
                              <EraVerifiedTick size="sm" userEmail={listUser.email || undefined} />
                            )}
                          </p>
                          <p className="text-label text-muted-foreground truncate">
                            @{listUser.handle || 'user'}
                          </p>
                        </div>
                        
                        {/* Follow Button */}
                        {!isCurrentUser && (
                          <Button
                            size="sm"
                            variant={isFollowingUser ? 'outline' : 'default'}
                            onClick={() => handleFollowToggle(listUser.id)}
                            className={`h-8 px-4 text-label font-semibold rounded-lg transition-all ${
                              isFollowingUser 
                                ? 'border-border text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50' 
                                : 'bg-primary text-primary-foreground'
                            }`}
                          >
                            {isFollowingUser ? (
                              <span className="flex items-center gap-1">
                                <UserMinus className="h-3 w-3" />
                                Following
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <UserPlus className="h-3 w-3" />
                                Follow
                              </span>
                            )}
                          </Button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
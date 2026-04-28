import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Plus, Search, Lock, UserMinus, UserPlus } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunityMembership, CommunityRole } from '@/hooks/useCommunityMembership';
import { CommunityFeedView } from '@/components/community/CommunityFeedView';
import { CreateCommunityModal } from '@/components/community/CreateCommunityModal';
import { cn } from '@/lib/utils';

interface CommunityWithStatus {
  id: string;
  name: string;
  handle: string;
  description: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  member_count: number;
  follower_count: number;
  is_private: boolean;
  created_by: string | null;
  created_at: string;
  isJoined: boolean;
  isFollowing: boolean;
  userRole?: CommunityRole;
}

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

function CommunityCard({ 
  community, 
  onJoin, 
  onLeave,
  onFollow,
  onUnfollow,
  onOpen,
}: { 
  community: CommunityWithStatus; 
  onJoin: (id: string) => void;
  onLeave: (id: string) => void;
  onFollow: (id: string) => void;
  onUnfollow: (id: string) => void;
  onOpen: (community: CommunityWithStatus) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={() => community.isJoined && onOpen(community)}
    >
      <Avatar className="h-14 w-14">
        <AvatarImage src={community.avatar_url || ''} />
        <AvatarFallback className="bg-primary/10 text-primary text-title">
          <Users className="h-6 w-6" />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h3 className="font-semibold text-foreground truncate">{community.name}</h3>
          {community.is_private && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
        </div>
        <p className="text-body text-muted-foreground truncate">@{community.handle}</p>
        <p className="text-label text-muted-foreground mt-0.5">
          {formatCount(community.member_count)} members · {formatCount(community.follower_count)} followers
        </p>
      </div>
      
      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        {community.isJoined ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-label gap-1"
            onClick={() => onLeave(community.id)}
          >
            <UserMinus className="h-3.5 w-3.5" />
            Leave
          </Button>
        ) : community.isFollowing ? (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-label"
              onClick={() => onUnfollow(community.id)}
            >
              Unfollow
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="text-label gap-1"
              onClick={() => onJoin(community.id)}
            >
              <UserPlus className="h-3.5 w-3.5" />
              Join
            </Button>
          </div>
        ) : (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-label"
              onClick={() => onFollow(community.id)}
            >
              Follow
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="text-label gap-1"
              onClick={() => onJoin(community.id)}
            >
              <UserPlus className="h-3.5 w-3.5" />
              Join
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
}

// Mock communities for demo when no real data exists
const mockCommunities: CommunityWithStatus[] = [
  { id: 'c1', name: 'Mental Health Support', handle: 'mh_support', description: 'A safe space for mental health discussions', avatar_url: null, cover_url: null, member_count: 12500, follower_count: 45000, is_private: false, created_by: null, created_at: new Date().toISOString(), isJoined: false, isFollowing: false },
  { id: 'c2', name: 'Anxiety Warriors', handle: 'anxiety_warriors', description: 'Supporting each other through anxiety', avatar_url: null, cover_url: null, member_count: 8200, follower_count: 23000, is_private: false, created_by: null, created_at: new Date().toISOString(), isJoined: false, isFollowing: false },
  { id: 'c3', name: 'Mindfulness Daily', handle: 'mindfulness_daily', description: 'Daily mindfulness practices and tips', avatar_url: null, cover_url: null, member_count: 15600, follower_count: 67000, is_private: false, created_by: null, created_at: new Date().toISOString(), isJoined: false, isFollowing: false },
  { id: 'c4', name: 'Depression Support', handle: 'depression_support', description: 'You are not alone', avatar_url: null, cover_url: null, member_count: 9800, follower_count: 34000, is_private: false, created_by: null, created_at: new Date().toISOString(), isJoined: false, isFollowing: false },
  { id: 'c5', name: 'Self-Care Club', handle: 'selfcare_club', description: 'Tips and motivation for self-care', avatar_url: null, cover_url: null, member_count: 20100, follower_count: 89000, is_private: false, created_by: null, created_at: new Date().toISOString(), isJoined: false, isFollowing: false },
  { id: 'c6', name: 'Therapy Talk', handle: 'therapy_talk', description: 'Discussions about therapy experiences', avatar_url: null, cover_url: null, member_count: 5400, follower_count: 18000, is_private: true, created_by: null, created_at: new Date().toISOString(), isJoined: false, isFollowing: false },
];

export default function Community() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('joined');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityWithStatus | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  const {
    communities: dbCommunities,
    loading,
    joinCommunity,
    leaveCommunity,
    followCommunity,
    unfollowCommunity,
    joinedCommunities: dbJoined,
    followingCommunities: dbFollowing,
    suggestedCommunities: dbSuggested,
    refresh,
  } = useCommunityMembership();

  // Use DB communities if available, otherwise use mock
  const allCommunities = dbCommunities.length > 0 ? dbCommunities : mockCommunities;
  const joinedCommunities = dbCommunities.length > 0 ? dbJoined : [];
  const followingCommunities = dbCommunities.length > 0 ? dbFollowing : [];
  const suggestedCommunities = dbCommunities.length > 0 ? dbSuggested : mockCommunities;

  // Handle community selection from URL
  useEffect(() => {
    if (communityId && allCommunities.length > 0) {
      const community = allCommunities.find(c => c.id === communityId);
      if (community && community.isJoined) {
        setSelectedCommunity(community);
      }
    }
  }, [communityId, allCommunities]);

  const handleOpenCommunity = (community: CommunityWithStatus) => {
    setSelectedCommunity(community);
    navigate(`/community/${community.id}`);
  };

  const handleBackFromFeed = () => {
    setSelectedCommunity(null);
    navigate('/community');
  };

  const filteredCommunities = (list: CommunityWithStatus[]) => {
    if (!searchQuery) return list;
    const query = searchQuery.toLowerCase();
    return list.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.handle.toLowerCase().includes(query)
    );
  };

  // Show community feed if selected
  if (selectedCommunity) {
    return (
      <AppLayout showHeader={false}>
        <CommunityFeedView 
          community={selectedCommunity} 
          onBack={handleBackFromFeed} 
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col min-h-full">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-headline font-bold text-foreground">Communities</h1>
            <Button size="sm" className="gap-1" onClick={() => setCreateModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Create
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-secondary/50"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="w-full rounded-none bg-transparent border-b border-border h-12 grid grid-cols-3">
            <TabsTrigger 
              value="joined" 
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent h-full"
            >
              Joined ({joinedCommunities.length})
            </TabsTrigger>
            <TabsTrigger 
              value="following" 
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent h-full"
            >
              Following ({followingCommunities.length})
            </TabsTrigger>
            <TabsTrigger 
              value="suggested" 
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent h-full"
            >
              Suggested
            </TabsTrigger>
          </TabsList>

          <TabsContent value="joined" className="mt-0 p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredCommunities(joinedCommunities).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No communities joined yet</p>
                <p className="text-body mt-1">Explore and join communities to connect with others</p>
              </div>
            ) : (
              filteredCommunities(joinedCommunities).map((community, i) => (
                <motion.div
                  key={community.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <CommunityCard 
                    community={community} 
                    onJoin={joinCommunity}
                    onLeave={leaveCommunity}
                    onFollow={followCommunity}
                    onUnfollow={unfollowCommunity}
                    onOpen={handleOpenCommunity}
                  />
                </motion.div>
              ))
            )}
          </TabsContent>

          <TabsContent value="following" className="mt-0 p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredCommunities(followingCommunities).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Not following any communities</p>
              </div>
            ) : (
              filteredCommunities(followingCommunities).map((community, i) => (
                <motion.div
                  key={community.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <CommunityCard 
                    community={community} 
                    onJoin={joinCommunity}
                    onLeave={leaveCommunity}
                    onFollow={followCommunity}
                    onUnfollow={unfollowCommunity}
                    onOpen={handleOpenCommunity}
                  />
                </motion.div>
              ))
            )}
          </TabsContent>

          <TabsContent value="suggested" className="mt-0 p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              filteredCommunities(suggestedCommunities).map((community, i) => (
                <motion.div
                  key={community.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <CommunityCard 
                    community={community} 
                    onJoin={joinCommunity}
                    onLeave={leaveCommunity}
                    onFollow={followCommunity}
                    onUnfollow={unfollowCommunity}
                    onOpen={handleOpenCommunity}
                  />
                </motion.div>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Create Community Modal */}
        <CreateCommunityModal 
          open={createModalOpen} 
          onOpenChange={setCreateModalOpen}
          onSuccess={refresh}
        />
      </div>
    </AppLayout>
  );
}

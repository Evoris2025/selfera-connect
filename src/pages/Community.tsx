import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Search } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Community {
  id: string;
  name: string;
  handle: string;
  description: string | null;
  avatar_url: string | null;
  member_count: number;
  follower_count: number;
  isJoined?: boolean;
  isFollowing?: boolean;
}

// Mock communities for demo
const mockCommunities: Community[] = [
  { id: 'c1', name: 'Mental Health Support', handle: 'mh_support', description: 'A safe space for mental health discussions', avatar_url: null, member_count: 12500, follower_count: 45000, isJoined: true },
  { id: 'c2', name: 'Anxiety Warriors', handle: 'anxiety_warriors', description: 'Supporting each other through anxiety', avatar_url: null, member_count: 8200, follower_count: 23000, isJoined: true },
  { id: 'c3', name: 'Mindfulness Daily', handle: 'mindfulness_daily', description: 'Daily mindfulness practices and tips', avatar_url: null, member_count: 15600, follower_count: 67000, isFollowing: true },
  { id: 'c4', name: 'Depression Support', handle: 'depression_support', description: 'You are not alone', avatar_url: null, member_count: 9800, follower_count: 34000, isFollowing: true },
  { id: 'c5', name: 'Self-Care Club', handle: 'selfcare_club', description: 'Tips and motivation for self-care', avatar_url: null, member_count: 20100, follower_count: 89000 },
  { id: 'c6', name: 'Therapy Talk', handle: 'therapy_talk', description: 'Discussions about therapy experiences', avatar_url: null, member_count: 5400, follower_count: 18000 },
];

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

function CommunityCard({ community, onJoin, onFollow }: { 
  community: Community; 
  onJoin: (id: string) => void;
  onFollow: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl"
    >
      <Avatar className="h-14 w-14">
        <AvatarImage src={community.avatar_url || ''} />
        <AvatarFallback className="bg-primary/10 text-primary text-lg">
          <Users className="h-6 w-6" />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate">{community.name}</h3>
        <p className="text-sm text-muted-foreground truncate">@{community.handle}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatCount(community.member_count)} members · {formatCount(community.follower_count)} followers
        </p>
      </div>
      
      <div className="flex gap-2">
        {community.isJoined ? (
          <Button variant="outline" size="sm" className="text-xs">
            Joined
          </Button>
        ) : community.isFollowing ? (
          <Button variant="outline" size="sm" className="text-xs">
            Following
          </Button>
        ) : (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={() => onFollow(community.id)}
            >
              Follow
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="text-xs"
              onClick={() => onJoin(community.id)}
            >
              Join
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function Community() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('joined');
  const [communities, setCommunities] = useState<Community[]>(mockCommunities);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const joinedCommunities = communities.filter(c => c.isJoined);
  const followingCommunities = communities.filter(c => c.isFollowing && !c.isJoined);
  const suggestedCommunities = communities.filter(c => !c.isJoined && !c.isFollowing);

  const handleJoin = (communityId: string) => {
    setCommunities(prev => 
      prev.map(c => c.id === communityId ? { ...c, isJoined: true, member_count: c.member_count + 1 } : c)
    );
    toast({ title: 'Joined community!' });
  };

  const handleFollow = (communityId: string) => {
    setCommunities(prev => 
      prev.map(c => c.id === communityId ? { ...c, isFollowing: true, follower_count: c.follower_count + 1 } : c)
    );
    toast({ title: 'Following community!' });
  };

  const filteredCommunities = (list: Community[]) => {
    if (!searchQuery) return list;
    const query = searchQuery.toLowerCase();
    return list.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.handle.toLowerCase().includes(query)
    );
  };

  return (
    <AppLayout>
      <div className="flex flex-col min-h-full">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-foreground">Community</h1>
            <Button size="sm" className="gap-1">
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
            {filteredCommunities(joinedCommunities).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No communities joined yet</p>
                <p className="text-sm mt-1">Explore and join communities to connect with others</p>
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
                    onJoin={handleJoin}
                    onFollow={handleFollow}
                  />
                </motion.div>
              ))
            )}
          </TabsContent>

          <TabsContent value="following" className="mt-0 p-4 space-y-3">
            {filteredCommunities(followingCommunities).length === 0 ? (
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
                    onJoin={handleJoin}
                    onFollow={handleFollow}
                  />
                </motion.div>
              ))
            )}
          </TabsContent>

          <TabsContent value="suggested" className="mt-0 p-4 space-y-3">
            {filteredCommunities(suggestedCommunities).map((community, i) => (
              <motion.div
                key={community.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <CommunityCard 
                  community={community} 
                  onJoin={handleJoin}
                  onFollow={handleFollow}
                />
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
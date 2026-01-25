import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, Lock, MoreHorizontal, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useCommunityFeed } from '@/hooks/useCommunityFeed';
import { formatDistanceToNow } from 'date-fns';
import { EraVerifiedTick } from '@/components/EraVerifiedTick';
import { toast } from 'sonner';

interface CommunityFeedViewProps {
  community: {
    id: string;
    name: string;
    handle: string;
    description: string | null;
    avatar_url: string | null;
    member_count: number;
    is_private: boolean;
  };
  onBack: () => void;
}

export function CommunityFeedView({ community, onBack }: CommunityFeedViewProps) {
  const { posts, loading, postToCommunity, refresh } = useCommunityFeed(community.id);
  const [newPost, setNewPost] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    
    setIsPosting(true);
    const result = await postToCommunity(newPost.trim());
    
    if (result) {
      setNewPost('');
      toast.success('Posted to community!');
    } else {
      toast.error('Failed to post');
    }
    setIsPosting(false);
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <Avatar className="h-10 w-10">
            <AvatarImage src={community.avatar_url || ''} />
            <AvatarFallback className="bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-semibold text-foreground truncate">{community.name}</h1>
              {community.is_private && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
            </div>
            <p className="text-xs text-muted-foreground">
              {community.member_count.toLocaleString()} members
            </p>
          </div>
          
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Community description */}
        {community.description && (
          <p className="px-4 pb-3 text-sm text-muted-foreground line-clamp-2">
            {community.description}
          </p>
        )}
      </div>

      {/* Post composer */}
      <div className="p-4 border-b border-border">
        <div className="flex gap-3">
          <Textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder={`Share with ${community.name}...`}
            className="min-h-[80px] resize-none"
          />
        </div>
        <div className="flex justify-end mt-2">
          <Button
            size="sm"
            onClick={handlePost}
            disabled={!newPost.trim() || isPosting}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Post
          </Button>
        </div>
      </div>

      {/* Posts feed */}
      <div className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="font-medium text-foreground mb-1">No posts yet</h3>
            <p className="text-sm text-muted-foreground">
              Be the first to share something with this community!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            <AnimatePresence initial={false}>
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4"
                >
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.author?.avatar_url || ''} />
                      <AvatarFallback>
                        {post.author?.display_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-medium text-sm">
                          {post.author?.display_name || 'User'}
                        </span>
                        {post.author?.is_verified && <EraVerifiedTick size="sm" userEmail={post.author?.email || undefined} />}
                        <span className="text-xs text-muted-foreground">
                          @{post.author?.handle}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      
                      {post.content && (
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {post.content}
                        </p>
                      )}
                      
                      {post.media_url && post.media_type?.startsWith('image') && (
                        <div className="mt-2 rounded-xl overflow-hidden">
                          <img
                            src={post.media_url}
                            alt=""
                            className="w-full max-h-80 object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, X, Check, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Community {
  id: string;
  name: string;
  handle: string;
  avatar_url: string | null;
  member_count: number;
}

// Mock communities for demo
const mockUserCommunities: Community[] = [
  { id: 'c1', name: 'Mental Health Support', handle: 'mh_support', avatar_url: null, member_count: 12500 },
  { id: 'c2', name: 'Anxiety Warriors', handle: 'anxiety_warriors', avatar_url: null, member_count: 8200 },
  { id: 'c3', name: 'Mindfulness Daily', handle: 'mindfulness_daily', avatar_url: null, member_count: 15600 },
  { id: 'c4', name: 'Depression Support', handle: 'depression_support', avatar_url: null, member_count: 9800 },
];

interface ShareToCommunityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
}

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export function ShareToCommunityModal({ open, onOpenChange, postId }: ShareToCommunityModalProps) {
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sharing, setSharing] = useState(false);

  const filteredCommunities = mockUserCommunities.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleShare = async () => {
    if (!selectedCommunity) {
      toast({ title: 'Please select a community', variant: 'destructive' });
      return;
    }

    setSharing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const community = mockUserCommunities.find(c => c.id === selectedCommunity);
    toast({ 
      title: 'Shared to community!',
      description: `Post shared to ${community?.name}`,
    });
    
    setSharing(false);
    setSelectedCommunity(null);
    setCaption('');
    onOpenChange(false);
  };

  const handleClose = () => {
    setSelectedCommunity(null);
    setCaption('');
    setSearchQuery('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Share to Community
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Community List */}
          <div className="max-h-[240px] overflow-y-auto space-y-2">
            <AnimatePresence>
              {filteredCommunities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No communities found
                </div>
              ) : (
                filteredCommunities.map((community, i) => (
                  <motion.button
                    key={community.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setSelectedCommunity(community.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg transition-all',
                      selectedCommunity === community.id
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-secondary/50 hover:bg-secondary border-2 border-transparent'
                    )}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={community.avatar_url || ''} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <Users className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 text-left">
                      <p className="font-medium text-foreground text-sm">{community.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCount(community.member_count)} members
                      </p>
                    </div>
                    
                    {selectedCommunity === community.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-6 w-6 rounded-full bg-primary flex items-center justify-center"
                      >
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </motion.div>
                    )}
                  </motion.button>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Caption */}
          <div>
            <Textarea
              placeholder="Add a caption (optional)..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleShare}
              disabled={!selectedCommunity || sharing}
            >
              {sharing ? 'Sharing...' : 'Share'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
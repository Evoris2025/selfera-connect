import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Plus, X, Check, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CloseFriend {
  id: string;
  name: string;
  handle: string;
  avatar: string;
}

interface CloseFriendsListProps {
  onBack: () => void;
}

// Mock data
const mockFollowers: CloseFriend[] = [
  { id: 'f1', name: 'Sarah Chen', handle: 'sarahc', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
  { id: 'f2', name: 'James Wilson', handle: 'jwilson', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
  { id: 'f3', name: 'Emma Roberts', handle: 'emmar', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop' },
  { id: 'f4', name: 'Alex Turner', handle: 'alext', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
  { id: 'f5', name: 'Mind Matters', handle: 'mindmatters', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop' },
  { id: 'f6', name: 'Wellness Hub', handle: 'wellnesshub', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop' },
];

export function CloseFriendsList({ onBack }: CloseFriendsListProps) {
  const [closeFriends, setCloseFriends] = useState<string[]>(['f1', 'f3']); // Pre-select some
  const [search, setSearch] = useState('');
  const [followers] = useState<CloseFriend[]>(mockFollowers);

  const filteredFollowers = followers.filter((f) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return f.name.toLowerCase().includes(query) || f.handle.toLowerCase().includes(query);
  });

  const toggleCloseFriend = (userId: string) => {
    setCloseFriends(prev => {
      const isClose = prev.includes(userId);
      if (isClose) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const handleSave = () => {
    toast({
      title: 'Close Friends updated',
      description: `${closeFriends.length} people in your Close Friends list.`,
    });
    onBack();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-semibold">Close Friends</h1>
          <p className="text-xs text-muted-foreground">{closeFriends.length} people</p>
        </div>
        <Button size="sm" onClick={handleSave}>
          Done
        </Button>
      </div>

      {/* Description */}
      <div className="p-4 bg-green-500/10 border-b border-green-500/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
            <UserPlus className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="font-medium text-sm">Share privately with Close Friends</p>
            <p className="text-xs text-muted-foreground mt-1">
              Only people you add will see your Close Friends expressions. They won't be notified that you added them.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search followers..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Follower List */}
      <ScrollArea className="flex-1">
        <div className="p-4 pt-0 space-y-1">
          {filteredFollowers.map((follower) => {
            const isClose = closeFriends.includes(follower.id);
            
            return (
              <motion.button
                key={follower.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleCloseFriend(follower.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-colors",
                  isClose ? "bg-green-500/10" : "hover:bg-secondary/50"
                )}
              >
                {/* Avatar with green ring if close friend */}
                <div className={cn(
                  "relative",
                  isClose && "ring-2 ring-green-500 ring-offset-2 ring-offset-background rounded-full"
                )}>
                  <Avatar className="h-11 w-11">
                    <AvatarImage src={follower.avatar} />
                    <AvatarFallback>{follower.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>

                {/* User info */}
                <div className="text-left flex-1">
                  <p className="font-medium">{follower.name}</p>
                  <p className="text-sm text-muted-foreground">@{follower.handle}</p>
                </div>

                {/* Toggle indicator */}
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                  isClose ? "bg-green-500 text-white" : "bg-secondary"
                )}>
                  {isClose ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

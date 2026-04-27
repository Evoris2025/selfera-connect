import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface UserResult {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl?: string;
}

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartConversation: (userId: string) => void;
}

const springPop = { type: 'spring' as const, stiffness: 600, damping: 12 };
const springBounce = { type: 'spring' as const, stiffness: 500, damping: 15, mass: 0.5 };

export function NewConversationModal({ isOpen, onClose, onStartConversation }: NewConversationModalProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setUsers([]);
      setSelectedUserId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim() || !user?.id) {
        setUsers([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, handle, avatar_url')
          .neq('id', user.id)
          .or(`display_name.ilike.%${searchQuery}%,handle.ilike.%${searchQuery}%`)
          .limit(20);

        if (error) throw error;

        setUsers((data || []).map(p => ({
          id: p.id,
          displayName: p.display_name || p.handle || 'Anonymous',
          handle: p.handle || 'anonymous',
          avatarUrl: p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`,
        })));
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, user?.id]);

  const handleStartConversation = () => {
    if (selectedUserId) {
      onStartConversation(selectedUserId);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={springBounce}
        className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] rounded-t-3xl bg-background border-t border-border/50 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
          <h2 className="font-semibold text-lg">New Message</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStartConversation}
            disabled={!selectedUserId}
            className={cn(
              "font-semibold",
              selectedUserId ? "text-primary" : "text-muted-foreground"
            )}
          >
            Chat
          </Button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-border/40">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground font-medium">To:</span>
            <div className="flex-1 relative">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="border-0 bg-transparent focus-visible:ring-0 px-0 h-10 text-[15px]"
                autoFocus
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-muted-foreground/70">
                {searchQuery ? 'No users found' : 'Search for people to message'}
              </p>
            </div>
          ) : (
            <div className="py-2">
              {users.map((userResult, idx) => (
                <motion.button
                  key={userResult.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...springBounce, delay: idx * 0.03 }}
                  onClick={() => setSelectedUserId(
                    selectedUserId === userResult.id ? null : userResult.id
                  )}
                  className={cn(
                    "w-full flex items-center gap-3 px-5 py-3 transition-colors",
                    selectedUserId === userResult.id
                      ? "bg-white/[0.06]"
                      : "hover:bg-white/[0.04]"
                  )}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={userResult.avatarUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-secondary to-secondary/60">
                      {userResult.displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-[15px]">{userResult.displayName}</p>
                    <p className="text-muted-foreground text-sm">@{userResult.handle}</p>
                  </div>
                  <AnimatePresence>
                    {selectedUserId === userResult.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={springPop}
                        className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                      >
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

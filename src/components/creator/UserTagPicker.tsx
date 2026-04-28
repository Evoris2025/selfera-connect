import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AtSign, Search, X, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface UserTag {
  id: string;
  userId: string;
  userName: string;
  userHandle: string;
  userAvatar: string;
  position: { x: number; y: number };
}

interface UserPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (user: { id: string; name: string; handle: string; avatar: string }) => void;
}

// Mock users for tagging
const mockUsers = [
  { id: 'u1', name: 'Sarah Chen', handle: 'sarahc', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
  { id: 'u2', name: 'James Wilson', handle: 'jwilson', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
  { id: 'u3', name: 'Emma Roberts', handle: 'emmar', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop' },
  { id: 'u4', name: 'Alex Turner', handle: 'alext', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
  { id: 'u5', name: 'Mind Matters', handle: 'mindmatters', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop' },
  { id: 'u6', name: 'Wellness Hub', handle: 'wellnesshub', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop' },
  { id: 'u7', name: 'Calm Studios', handle: 'calmstudios', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
];

export function UserTagPicker({ isOpen, onClose, onSelect }: UserPickerProps) {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredUsers = mockUsers.filter((user) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.handle.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSelect = (user: typeof mockUsers[0]) => {
    onSelect(user);
    setSearch('');
    if (navigator.vibrate) navigator.vibrate(10);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="absolute inset-x-0 bottom-0 bg-background/95 backdrop-blur-xl border-t border-border rounded-t-3xl z-50"
          style={{ height: '50vh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <AtSign className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Tag People</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search people..."
                className="pl-10"
              />
            </div>
          </div>

          {/* User List */}
          <ScrollArea className="flex-1 h-[calc(50vh-130px)]">
            <div className="p-3 space-y-1">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AtSign className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No users found</p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <motion.button
                    key={user.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(user)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
                  >
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-left flex-1">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-body text-muted-foreground">@{user.handle}</p>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, UserPlus, AtSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export interface UserTag {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  positionX: number; // 0-100 percentage
  positionY: number; // 0-100 percentage
}

interface UserTagOverlayProps {
  tags: UserTag[];
  onTagsChange: (tags: UserTag[]) => void;
  imageUrl: string;
  isEditing: boolean;
  onEditingChange: (editing: boolean) => void;
}

// Mock user search results - in production, this would search the database
const mockUsers = [
  { id: '1', username: 'emma_wellness', displayName: 'Emma', avatar: '' },
  { id: '2', username: 'mental_health_advocate', displayName: 'Mental Health Advocate', avatar: '' },
  { id: '3', username: 'recovery_journey', displayName: 'Recovery Journey', avatar: '' },
  { id: '4', username: 'mindful_living', displayName: 'Mindful Living', avatar: '' },
  { id: '5', username: 'support_community', displayName: 'Support Community', avatar: '' },
];

export function UserTagOverlay({
  tags,
  onTagsChange,
  imageUrl,
  isEditing,
  onEditingChange,
}: UserTagOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pendingTag, setPendingTag] = useState<{ x: number; y: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTags, setShowTags] = useState(true);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditing) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Clamp to valid range
    const clampedX = Math.max(10, Math.min(90, x));
    const clampedY = Math.max(10, Math.min(90, y));

    setPendingTag({ x: clampedX, y: clampedY });
    setSearchQuery('');
  };

  const handleUserSelect = (user: typeof mockUsers[0]) => {
    if (!pendingTag) return;

    const newTag: UserTag = {
      id: `tag-${Date.now()}`,
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      positionX: pendingTag.x,
      positionY: pendingTag.y,
    };

    onTagsChange([...tags, newTag]);
    setPendingTag(null);
    setSearchQuery('');
  };

  const handleRemoveTag = (tagId: string) => {
    onTagsChange(tags.filter(t => t.id !== tagId));
  };

  const filteredUsers = mockUsers.filter(
    u => 
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {/* Tag Mode Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onEditingChange(!isEditing)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
            isEditing
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          )}
        >
          <UserPlus className="h-4 w-4" />
          Tag People
        </button>

        {tags.length > 0 && (
          <button
            onClick={() => setShowTags(!showTags)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {showTags ? 'Hide' : 'Show'} tags ({tags.length})
          </button>
        )}
      </div>

      {/* Image with Tags */}
      <div
        ref={containerRef}
        onClick={handleImageClick}
        className={cn(
          'relative aspect-square rounded-xl overflow-hidden',
          isEditing && 'cursor-crosshair'
        )}
      >
        <img src={imageUrl} alt="Tag people" className="w-full h-full object-cover" />

        {/* Existing Tags */}
        <AnimatePresence>
          {showTags && tags.map((tag) => (
            <motion.div
              key={tag.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute"
              style={{
                left: `${tag.positionX}%`,
                top: `${tag.positionY}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="relative">
                <div className="px-2 py-1 rounded-lg bg-background/90 backdrop-blur-sm shadow-lg flex items-center gap-1.5">
                  <AtSign className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium">{tag.username}</span>
                  {isEditing && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTag(tag.id);
                      }}
                      className="ml-1 p-0.5 rounded-full hover:bg-destructive/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                {/* Arrow pointing to tag location */}
                <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-background/90 rotate-45" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Pending Tag with Search */}
        <AnimatePresence>
          {pendingTag && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute z-10"
              style={{
                left: `${pendingTag.x}%`,
                top: `${pendingTag.y}%`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <div className="p-3 bg-background rounded-xl shadow-xl border border-border min-w-[200px]">
                <div className="relative mb-2">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search people..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-9 text-sm"
                    autoFocus
                  />
                </div>

                <div className="max-h-[150px] overflow-y-auto space-y-1">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUserSelect(user);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="text-xs">
                          {user.displayName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium">{user.displayName}</div>
                        <div className="text-xs text-muted-foreground">@{user.username}</div>
                      </div>
                    </button>
                  ))}

                  {filteredUsers.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      No users found
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPendingTag(null);
                  }}
                  className="w-full mt-2 h-8 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Editing Overlay */}
        {isEditing && !pendingTag && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
            <div className="px-4 py-2 rounded-full bg-background/90 backdrop-blur-sm">
              <span className="text-sm font-medium">Tap to tag someone</span>
            </div>
          </div>
        )}
      </div>

      {/* Tagged Users List */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary text-sm"
            >
              <AtSign className="h-3 w-3 text-primary" />
              <span>{tag.username}</span>
              {isEditing && (
                <button
                  onClick={() => handleRemoveTag(tag.id)}
                  className="p-0.5 rounded-full hover:bg-destructive/20"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

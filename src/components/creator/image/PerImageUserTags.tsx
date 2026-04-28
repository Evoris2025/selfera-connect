import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, UserPlus, AtSign, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { UserTag, CarouselImage } from './types';

interface PerImageUserTagsProps {
  images: CarouselImage[];
  selectedImageIndex: number;
  onImageSelect: (index: number) => void;
  onTagsChange: (imageId: string, tags: UserTag[]) => void;
}

// Mock user search results - in production, this would search the database
const mockUsers = [
  { id: '1', username: 'emma_wellness', displayName: 'Emma', avatar: '' },
  { id: '2', username: 'mental_health_advocate', displayName: 'Mental Health Advocate', avatar: '' },
  { id: '3', username: 'recovery_journey', displayName: 'Recovery Journey', avatar: '' },
  { id: '4', username: 'mindful_living', displayName: 'Mindful Living', avatar: '' },
  { id: '5', username: 'support_community', displayName: 'Support Community', avatar: '' },
];

export function PerImageUserTags({
  images,
  selectedImageIndex,
  onImageSelect,
  onTagsChange,
}: PerImageUserTagsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [pendingTag, setPendingTag] = useState<{ x: number; y: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTags, setShowTags] = useState(true);

  const currentImage = images[selectedImageIndex];
  const currentTags = currentImage?.userTags || [];

  const totalTagCount = images.reduce((sum, img) => sum + (img.userTags?.length || 0), 0);

  const handleImageClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditing) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Clamp to valid range (keep tags away from edges)
    const clampedX = Math.max(10, Math.min(90, x));
    const clampedY = Math.max(10, Math.min(90, y));

    setPendingTag({ x: clampedX, y: clampedY });
    setSearchQuery('');
  }, [isEditing]);

  const handleUserSelect = useCallback((user: typeof mockUsers[0]) => {
    if (!pendingTag || !currentImage) return;

    const newTag: UserTag = {
      id: `tag-${Date.now()}`,
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      positionX: pendingTag.x,
      positionY: pendingTag.y,
    };

    onTagsChange(currentImage.id, [...currentTags, newTag]);
    setPendingTag(null);
    setSearchQuery('');
  }, [pendingTag, currentImage, currentTags, onTagsChange]);

  const handleRemoveTag = useCallback((tagId: string) => {
    if (!currentImage) return;
    onTagsChange(currentImage.id, currentTags.filter(t => t.id !== tagId));
  }, [currentImage, currentTags, onTagsChange]);

  const filteredUsers = mockUsers.filter(
    u => 
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!currentImage) return null;

  return (
    <div className="space-y-3">
      {/* Header with mode toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full text-body font-medium transition-colors',
            isEditing
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          )}
        >
          <UserPlus className="h-4 w-4" />
          Tag People
        </button>

        {totalTagCount > 0 && (
          <button
            onClick={() => setShowTags(!showTags)}
            className="text-label text-muted-foreground hover:text-foreground"
          >
            {showTags ? 'Hide' : 'Show'} tags ({totalTagCount})
          </button>
        )}
      </div>

      {/* Image selector for multi-image posts */}
      {images.length > 1 && isEditing && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onImageSelect(Math.max(0, selectedImageIndex - 1))}
            disabled={selectedImageIndex === 0}
            className={cn(
              'p-1 rounded-full transition-colors',
              selectedImageIndex === 0 ? 'opacity-30' : 'hover:bg-secondary'
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <div className="flex gap-1 overflow-x-auto flex-1">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => onImageSelect(i)}
                className={cn(
                  'flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden border-2 transition-all relative',
                  i === selectedImageIndex 
                    ? 'border-primary' 
                    : 'border-transparent hover:border-border'
                )}
              >
                <img src={img.previewUrl} alt="" className="w-full h-full object-cover" />
                {img.userTags?.length > 0 && (
                  <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center text-caption text-primary-foreground font-medium">
                    {img.userTags.length}
                  </div>
                )}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => onImageSelect(Math.min(images.length - 1, selectedImageIndex + 1))}
            disabled={selectedImageIndex === images.length - 1}
            className={cn(
              'p-1 rounded-full transition-colors',
              selectedImageIndex === images.length - 1 ? 'opacity-30' : 'hover:bg-secondary'
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Image with Tags */}
      <div
        ref={containerRef}
        onClick={handleImageClick}
        className={cn(
          'relative aspect-square rounded-xl overflow-hidden',
          isEditing && 'cursor-crosshair'
        )}
      >
        <img src={currentImage.previewUrl} alt="Tag people" className="w-full h-full object-cover" />

        {/* Existing Tags */}
        <AnimatePresence>
          {showTags && currentTags.map((tag) => (
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
                  <span className="text-label font-medium">{tag.username}</span>
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
                    className="pl-8 h-9 text-body"
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
                        <AvatarFallback className="text-label">
                          {user.displayName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <div className="text-body font-medium">{user.displayName}</div>
                        <div className="text-label text-muted-foreground">@{user.username}</div>
                      </div>
                    </button>
                  ))}

                  {filteredUsers.length === 0 && (
                    <p className="text-label text-muted-foreground text-center py-2">
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
                  className="w-full mt-2 h-8 text-label"
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
              <span className="text-body font-medium">Tap to tag someone</span>
            </div>
          </div>
        )}
      </div>

      {/* Tagged Users Summary */}
      {totalTagCount > 0 && (
        <div className="space-y-2">
          <p className="text-label text-muted-foreground">Tagged in this post:</p>
          <div className="flex flex-wrap gap-2">
            {images.map((img, imgIndex) => 
              img.userTags?.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary text-label"
                >
                  <AtSign className="h-3 w-3 text-primary" />
                  <span>{tag.username}</span>
                  {images.length > 1 && (
                    <span className="text-muted-foreground">(Photo {imgIndex + 1})</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

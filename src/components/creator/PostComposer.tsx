import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  Image, 
  Video, 
  Globe, 
  Users, 
  Lock, 
  X, 
  Loader2,
  Link as LinkIcon,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useFeedData } from '@/contexts/FeedDataContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { TopicTagSelector } from './shared/TopicTagSelector';
import { ContentWarningToggle } from './shared/ContentWarningToggle';
import { 
  PollCreator, 
  PollData,
  CharacterCounter,
  FeelingActivityPicker,
  FeelingActivity,
  LocationPicker,
  Location,
  ScheduleSelector,
  GifPicker,
  GifData,
  ThreadComposer,
  ThreadItem,
} from './post';
import { cn } from '@/lib/utils';

// Simulation mode flag - when true, uses FeedDataContext instead of Supabase
const SIMULATION_MODE = true;
const MAX_CHARACTERS = 500;

interface PostComposerProps {
  onBack: () => void;
  onSuccess: () => void;
}

type Visibility = 'public' | 'followers' | 'private';
type ContentWarningType = 'sensitive' | 'triggering' | 'graphic' | 'other' | null;
type ComposerMode = 'simple' | 'thread';

const visibilityOptions = [
  { value: 'public' as const, label: 'Public', icon: Globe },
  { value: 'followers' as const, label: 'Followers', icon: Users },
  { value: 'private' as const, label: 'Only me', icon: Lock },
];

export function PostComposer({ onBack, onSuccess }: PostComposerProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { createPost, isSimulationMode } = useFeedData();
  
  // Core content state
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [contentWarning, setContentWarning] = useState(false);
  const [contentWarningType, setContentWarningType] = useState<ContentWarningType>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New feature states
  const [composerMode, setComposerMode] = useState<ComposerMode>('simple');
  const [threadItems, setThreadItems] = useState<ThreadItem[]>([
    { id: 'thread-1', content: '' }
  ]);
  const [poll, setPoll] = useState<PollData | null>(null);
  const [feeling, setFeeling] = useState<FeelingActivity | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [selectedGif, setSelectedGif] = useState<GifData | null>(null);

  const displayName = user?.email?.split('@')[0] || 'You';
  const userInitial = displayName.charAt(0).toUpperCase();

  // Calculate if post is valid
  const hasContent = composerMode === 'thread' 
    ? threadItems.some(item => item.content.trim().length > 0)
    : content.trim().length > 0 || mediaFiles.length > 0 || selectedGif !== null;
  
  const canPost = hasContent && selectedTags.length > 0;

  const handleMediaSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Clear GIF if selecting media
    setSelectedGif(null);

    // Limit to 4 files
    const newFiles = [...mediaFiles, ...files].slice(0, 4);
    setMediaFiles(newFiles);

    // Create preview URLs
    const newUrls = newFiles.map((file) => URL.createObjectURL(file));
    setMediaPreviewUrls(newUrls);
  };

  const removeMedia = (index: number) => {
    const newFiles = mediaFiles.filter((_, i) => i !== index);
    const newUrls = mediaPreviewUrls.filter((_, i) => i !== index);
    setMediaFiles(newFiles);
    setMediaPreviewUrls(newUrls);
  };

  const handleGifSelect = (gif: GifData) => {
    // Clear other media if selecting GIF
    setMediaFiles([]);
    setMediaPreviewUrls([]);
    setSelectedGif(gif);
  };

  const removeGif = () => {
    setSelectedGif(null);
  };

  const toggleThreadMode = () => {
    if (composerMode === 'simple') {
      setComposerMode('thread');
      setThreadItems([{ id: 'thread-1', content: content }]);
    } else {
      setComposerMode('simple');
      setContent(threadItems[0]?.content || '');
    }
  };

  const handleSubmit = async () => {
    if (!canPost) return;

    setIsSubmitting(true);

    try {
      // Use simulation mode via FeedDataContext
      if (SIMULATION_MODE || isSimulationMode) {
        let mediaUrl: string | undefined;
        let mediaType: 'image' | 'video' | undefined;

        // For simulation, use the object URL or GIF URL
        if (selectedGif) {
          mediaUrl = selectedGif.url;
          mediaType = 'image'; // Treat GIF as image for feed display
        } else if (mediaFiles.length > 0 && mediaPreviewUrls.length > 0) {
          mediaUrl = mediaPreviewUrls[0];
          mediaType = mediaFiles[0]?.type.startsWith('video') ? 'video' : 'image';
        }

        const postContent = composerMode === 'thread'
          ? threadItems.map(item => item.content).join('\n\n---\n\n')
          : content.trim();

        // Build content with feeling/location prefix
        let enrichedContent = postContent;
        if (feeling) {
          const prefix = feeling.type === 'feeling' 
            ? `${feeling.emoji} Feeling ${feeling.label}`
            : `${feeling.emoji} ${feeling.label}`;
          enrichedContent = `${prefix}\n\n${enrichedContent}`;
        }
        if (location) {
          enrichedContent = `📍 at ${location.name}\n\n${enrichedContent}`;
        }

        // Create post via FeedDataContext
        createPost({
          authorId: user?.id || `sim-user-${Date.now()}`,
          author: {
            name: displayName,
            handle: displayName.toLowerCase().replace(/\s+/g, ''),
            avatar: '',
            isVerified: false,
            email: user?.email,
          },
          content: enrichedContent,
          tags: selectedTags,
          contentType: mediaType || 'text',
          media: mediaUrl && mediaType ? { type: mediaType, url: mediaUrl } : undefined,
        });

        // Show scheduled confirmation or success
        if (scheduledDate) {
          toast({
            title: 'Scheduled!',
            description: `Your post will be published on ${scheduledDate.toLocaleDateString()} at ${scheduledDate.toLocaleTimeString()}.`,
          });
        }

        onSuccess();
        return;
      }

      // Real Supabase mode (when not in simulation)
      if (!user) return;

      let mediaUrl: string | null = null;
      let mediaType: string | null = null;

      // Upload media if present
      if (mediaFiles.length > 0) {
        const file = mediaFiles[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('media')
          .getPublicUrl(fileName);

        mediaUrl = urlData.publicUrl;
        mediaType = file.type.startsWith('video') ? 'video' : 'image';
      } else if (selectedGif) {
        mediaUrl = selectedGif.url;
        mediaType = 'gif';
      }

      // Create the post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          content: content.trim() || null,
          visibility,
          media_url: mediaUrl,
          media_type: mediaType,
          content_warning_enabled: contentWarning,
          content_warning_type: contentWarning ? contentWarningType : null,
        })
        .select()
        .single();

      if (postError) throw postError;

      // Add topic tags
      if (selectedTags.length > 0 && post) {
        const tagMappings = selectedTags.map((tagId) => ({
          post_id: post.id,
          tag_id: tagId,
        }));

        const { error: tagError } = await supabase
          .from('post_tag_map')
          .insert(tagMappings);

        if (tagError) throw tagError;
      }

      onSuccess();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create post. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const VisibilityIcon = visibilityOptions.find((v) => v.value === visibility)?.icon || Globe;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full max-h-[85vh]"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="font-semibold">
          {scheduledDate ? 'Schedule Post' : 'Create Post'}
        </h2>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!canPost || isSubmitting}
          className="gradient-brand text-white"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : scheduledDate ? (
            'Schedule'
          ) : (
            'Post'
          )}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Author Row */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="" alt={displayName} />
            <AvatarFallback className="bg-secondary text-secondary-foreground">
              {userInitial}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium text-sm">{displayName}</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <VisibilityIcon className="h-3 w-3" />
                  {visibilityOptions.find((v) => v.value === visibility)?.label}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {visibilityOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setVisibility(option.value)}
                  >
                    <option.icon className="h-4 w-4 mr-2" />
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Character counter for simple mode */}
          {composerMode === 'simple' && (
            <CharacterCounter current={content.length} max={MAX_CHARACTERS} />
          )}
        </div>

        {/* Feeling/Activity & Location display */}
        {(feeling || location) && (
          <div className="flex flex-wrap gap-2">
            {feeling && (
              <FeelingActivityPicker value={feeling} onChange={setFeeling} />
            )}
            {location && (
              <LocationPicker value={location} onChange={setLocation} />
            )}
          </div>
        )}

        {/* Scheduled indicator */}
        {scheduledDate && (
          <ScheduleSelector value={scheduledDate} onChange={setScheduledDate} />
        )}

        {/* Text Input - Simple or Thread mode */}
        <AnimatePresence mode="wait">
          {composerMode === 'simple' ? (
            <motion.div
              key="simple"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Textarea
                placeholder={`What's on your mind, ${displayName}?`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={MAX_CHARACTERS}
                className="min-h-[120px] resize-none border-0 bg-transparent p-0 text-base focus-visible:ring-0 placeholder:text-muted-foreground"
              />
            </motion.div>
          ) : (
            <motion.div
              key="thread"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ThreadComposer
                items={threadItems}
                onItemsChange={setThreadItems}
                maxCharacters={MAX_CHARACTERS}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* GIF Preview */}
        {selectedGif && (
          <div className="relative rounded-xl overflow-hidden bg-secondary">
            <img
              src={selectedGif.url}
              alt={selectedGif.title}
              className="w-full max-h-64 object-contain"
            />
            <button
              onClick={removeGif}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        )}

        {/* Media Previews */}
        {mediaPreviewUrls.length > 0 && (
          <div className={cn(
            'grid gap-2',
            mediaPreviewUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          )}>
            {mediaPreviewUrls.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
                {mediaFiles[index]?.type.startsWith('video') ? (
                  <video
                    src={url}
                    className="w-full h-full object-cover"
                    controls={false}
                  />
                ) : (
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
                <button
                  onClick={() => removeMedia(index)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Poll */}
        <PollCreator poll={poll} onPollChange={setPoll} />

        {/* Topic Tags */}
        <TopicTagSelector
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
        />

        {/* Content Warning */}
        <ContentWarningToggle
          enabled={contentWarning}
          onEnabledChange={setContentWarning}
          warningType={contentWarningType}
          onWarningTypeChange={setContentWarningType}
        />
      </div>

      {/* Action Bar - Primary actions */}
      <div className="flex items-center gap-1 px-4 py-2 border-t border-border overflow-x-auto">
        <label className="p-2 rounded-full hover:bg-secondary transition-colors cursor-pointer">
          <Image className="h-5 w-5 text-emerald-500" />
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleMediaSelect}
            className="hidden"
          />
        </label>
        <label className="p-2 rounded-full hover:bg-secondary transition-colors cursor-pointer">
          <Video className="h-5 w-5 text-rose-500" />
          <input
            type="file"
            accept="video/*"
            onChange={handleMediaSelect}
            className="hidden"
          />
        </label>
        
        <div className="h-5 w-px bg-border mx-1" />
        
        <GifPicker onSelect={handleGifSelect} />
        
        {!feeling && (
          <FeelingActivityPicker value={null} onChange={setFeeling} />
        )}
        
        {!location && (
          <LocationPicker value={null} onChange={setLocation} />
        )}
        
        {!scheduledDate && (
          <ScheduleSelector value={null} onChange={setScheduledDate} />
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleThreadMode}
          className={cn(
            'gap-2 text-muted-foreground hover:text-foreground',
            composerMode === 'thread' && 'text-primary'
          )}
        >
          <MessageSquare className="h-4 w-4" />
          Thread
        </Button>
      </div>
    </motion.div>
  );
}

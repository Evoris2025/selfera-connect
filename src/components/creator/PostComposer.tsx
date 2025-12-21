import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Image, Video, Globe, Users, Lock, X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { TopicTagSelector } from './shared/TopicTagSelector';
import { ContentWarningToggle } from './shared/ContentWarningToggle';

interface PostComposerProps {
  onBack: () => void;
  onSuccess: () => void;
  intent?: 'express' | 'share' | 'teach' | 'reflect' | null;
  tone?: 'gentle' | 'neutral' | 'uplifting';
}

type Visibility = 'public' | 'followers' | 'private';
type ContentWarningType = 'sensitive' | 'triggering' | 'graphic' | 'other' | null;

const visibilityOptions = [
  { value: 'public' as const, label: 'Public', icon: Globe },
  { value: 'followers' as const, label: 'Followers', icon: Users },
  { value: 'private' as const, label: 'Only me', icon: Lock },
];

export function PostComposer({ onBack, onSuccess, intent, tone }: PostComposerProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [contentWarning, setContentWarning] = useState(false);
  const [contentWarningType, setContentWarningType] = useState<ContentWarningType>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayName = user?.email?.split('@')[0] || 'there';
  const userInitial = displayName.charAt(0).toUpperCase();

  const canPost = (content.trim().length > 0 || mediaFiles.length > 0) && selectedTags.length > 0;

  const handleMediaSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

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

  const handleSubmit = async () => {
    if (!user || !canPost) return;

    setIsSubmitting(true);

    try {
      let mediaUrl: string | null = null;
      let mediaType: string | null = null;

      // Upload media if present
      if (mediaFiles.length > 0) {
        const file = mediaFiles[0]; // For now, just upload the first file
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
        <h2 className="font-semibold">Create Post</h2>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!canPost || isSubmitting}
          className="gradient-brand text-white"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post'}
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
        </div>

        {/* Text Input */}
        <Textarea
          placeholder={`What's on your mind, ${displayName}?`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[120px] resize-none border-0 bg-transparent p-0 text-base focus-visible:ring-0 placeholder:text-muted-foreground"
        />

        {/* Media Previews */}
        {mediaPreviewUrls.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
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

      {/* Action Bar */}
      <div className="flex items-center gap-2 p-4 border-t border-border">
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
      </div>
    </motion.div>
  );
}

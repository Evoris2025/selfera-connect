import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link as LinkIcon, ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LinkPreviewData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

interface LinkPreviewCardProps {
  url: string;
  onRemove: () => void;
  className?: string;
}

// URL regex to detect links in text
export const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export function extractUrls(text: string): string[] {
  const matches = text.match(URL_REGEX);
  return matches || [];
}

/**
 * @deprecated Phase 4b: prefer ComposerLinkPreview (composer-side, driven by useLinkPreview)
 * and PostCardLinkPreview (feed-side, reads stored linkPreview without fetching).
 * Kept for legacy callsites; do not use in new code.
 */
export function LinkPreviewCard({ url, onRemove, className }: LinkPreviewCardProps) {
  const [preview, setPreview] = useState<LinkPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPreview = async () => {
      setIsLoading(true);
      setError(false);

      try {
        // In production, this would call an edge function to fetch link metadata
        // For now, we'll simulate with a timeout and mock data
        await new Promise(resolve => setTimeout(resolve, 800));

        // Parse domain from URL
        const domain = new URL(url).hostname.replace('www.', '');

        // Mock preview data based on URL patterns
        const mockPreview: LinkPreviewData = {
          url,
          title: `Content from ${domain}`,
          description: 'Click to view the full content on the original site.',
          siteName: domain,
        };

        // Add mock images for known domains
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          mockPreview.title = 'YouTube Video';
          mockPreview.image = 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=200&fit=crop';
        } else if (url.includes('instagram.com')) {
          mockPreview.title = 'Instagram Post';
          mockPreview.image = 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400&h=200&fit=crop';
        } else if (url.includes('twitter.com') || url.includes('x.com')) {
          mockPreview.title = 'Tweet';
        }

        setPreview(mockPreview);
      } catch (err) {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreview();
  }, [url]);

  if (error) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          "relative overflow-hidden rounded-xl border border-border bg-secondary/50",
          className
        )}
      >
        {isLoading ? (
          <div className="flex items-center gap-3 p-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 bg-muted-foreground/20 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-muted-foreground/10 rounded animate-pulse" />
            </div>
          </div>
        ) : preview ? (
          <>
            {/* Preview image */}
            {preview.image && (
              <div className="aspect-[2/1] w-full overflow-hidden bg-muted">
                <img
                  src={preview.image}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-3 space-y-1">
              <div className="flex items-start gap-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-body line-clamp-1">
                    {preview.title || 'Link Preview'}
                  </p>
                  {preview.description && (
                    <p className="text-label text-muted-foreground line-clamp-2 mt-0.5">
                      {preview.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1 mt-1 text-label text-muted-foreground">
                    <ExternalLink className="h-3 w-3" />
                    <span className="truncate">{preview.siteName || new URL(url).hostname}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Remove button */}
            <button
              onClick={onRemove}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}

// Hook to detect and manage link previews in text
export function useLinkPreview(text: string) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removedUrls, setRemovedUrls] = useState<Set<string>>(new Set());

  useEffect(() => {
    const urls = extractUrls(text);
    const validUrl = urls.find(url => !removedUrls.has(url));
    setPreviewUrl(validUrl || null);
  }, [text, removedUrls]);

  const removePreview = (url: string) => {
    setRemovedUrls(prev => new Set([...prev, url]));
  };

  return { previewUrl, removePreview };
}

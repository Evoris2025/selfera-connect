import { ExternalLink, Link as LinkIcon } from 'lucide-react';
import type { FeedLinkPreview } from '@/components/feed/CrossroadFeed';
import { cn } from '@/lib/utils';

interface PostCardLinkPreviewProps {
  preview: FeedLinkPreview;
  className?: string;
}

/**
 * Compact link-preview card rendered inside PostCard. Reads the stored
 * FeedPost.linkPreview snapshot — does NOT re-fetch.
 */
export function PostCardLinkPreview({ preview, className }: PostCardLinkPreviewProps) {
  const host = (() => {
    try { return new URL(preview.url).hostname.replace('www.', ''); }
    catch { return preview.url; }
  })();

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={cn(
        'block overflow-hidden rounded-xl border border-border bg-secondary/40 hover:bg-secondary/60 transition-colors',
        className
      )}
    >
      {preview.image && (
        <div className="aspect-[2/1] w-full overflow-hidden bg-muted">
          <img src={preview.image} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-3">
        <div className="flex items-start gap-2">
          <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            {preview.title && (
              <p className="font-medium text-sm line-clamp-1">{preview.title}</p>
            )}
            {preview.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{preview.description}</p>
            )}
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <ExternalLink className="h-3 w-3" />
              <span className="truncate">{preview.siteName || host}</span>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}

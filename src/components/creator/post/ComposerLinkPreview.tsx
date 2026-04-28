import { motion } from 'framer-motion';
import { ExternalLink, Link as LinkIcon, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LinkPreview } from '@/hooks/useLinkPreview';

interface ComposerLinkPreviewProps {
  preview: LinkPreview | null;
  loading?: boolean;
  fallbackUrl?: string;
  onDismiss: () => void;
  className?: string;
}

/**
 * Composer-side link preview card. Driven by the shared `useLinkPreview`
 * hook (Phase 0). Distinct from the legacy ./LinkPreviewCard which has its
 * own internal fetch logic.
 */
export function ComposerLinkPreview({
  preview,
  loading,
  fallbackUrl,
  onDismiss,
  className,
}: ComposerLinkPreviewProps) {
  if (!preview && !loading) return null;
  const url = preview?.url ?? fallbackUrl ?? '';
  const host = (() => { try { return new URL(url).hostname.replace('www.', ''); } catch { return url; } })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-secondary/50',
        className
      )}
    >
      {loading ? (
        <div className="flex items-center gap-3 p-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 bg-muted-foreground/20 rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-muted-foreground/10 rounded animate-pulse" />
          </div>
        </div>
      ) : preview ? (
        <>
          {preview.image && (
            <div className="aspect-[2/1] w-full overflow-hidden bg-muted">
              <img src={preview.image} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-3">
            <div className="flex items-start gap-2">
              <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-body line-clamp-1">{preview.title || 'Link preview'}</p>
                {preview.description && (
                  <p className="text-label text-muted-foreground line-clamp-2 mt-0.5">{preview.description}</p>
                )}
                <div className="flex items-center gap-1 mt-1 text-label text-muted-foreground">
                  <ExternalLink className="h-3 w-3" />
                  <span className="truncate">{preview.siteName || host}</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
            aria-label="Dismiss link preview"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </>
      ) : null}
    </motion.div>
  );
}

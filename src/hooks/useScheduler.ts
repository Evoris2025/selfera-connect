import { useCallback, useEffect, useRef } from 'react';
import { useFeedData, type ScheduledItem } from '@/contexts/FeedDataContext';

/**
 * Lightweight scheduler that publishes due items via the existing context
 * write path (createPost / createExpression). Runs:
 *   - on app focus / visibility change
 *   - on a 30s interval as a fallback
 *
 * Payloads are the raw arguments that would be passed to the corresponding
 * create* function — never bypasses the context.
 */
export function useScheduler() {
  const { scheduled, cancelScheduled, createPost, createExpression } = useFeedData();
  const scheduledRef = useRef<ScheduledItem[]>(scheduled);

  useEffect(() => {
    scheduledRef.current = scheduled;
  }, [scheduled]);

  const publishDue = useCallback(() => {
    const now = Date.now();
    for (const item of scheduledRef.current) {
      if (item.scheduledAt <= now) {
        try {
          if (item.kind === 'post' || item.kind === 'photo' || item.kind === 'video') {
            // All three land in the unified posts feed
            createPost(item.payload as Parameters<typeof createPost>[0]);
          } else if (item.kind === 'expression') {
            createExpression(item.payload as Parameters<typeof createExpression>[0]);
          }
          cancelScheduled(item.id);
        } catch (err) {
          console.warn('Scheduler failed to publish item', item.id, err);
        }
      }
    }
  }, [cancelScheduled, createPost, createExpression]);

  useEffect(() => {
    publishDue(); // run once on mount
    const onFocus = () => publishDue();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') publishDue();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    const id = window.setInterval(publishDue, 30_000);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
      window.clearInterval(id);
    };
  }, [publishDue]);

  return { scheduled, publishDue };
}

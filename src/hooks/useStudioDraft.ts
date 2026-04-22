import { useCallback, useEffect, useRef, useState } from 'react';
import { useFeedData, type StudioContentKind, type StudioDraft } from '@/contexts/FeedDataContext';

export interface UseStudioDraftOptions<TData extends Record<string, unknown>> {
  kind: StudioContentKind;
  data: TData;
  /** Auto-derived title for the draft (e.g. first 40 chars of caption) */
  title: string;
  /** Should we even consider auto-saving? (e.g. caption.length > 0 || images.length > 0) */
  enabled?: boolean;
  /** Auto-save interval in ms. Default: 5000 */
  intervalMs?: number;
  /** Existing draft id when resuming */
  existingDraftId?: string;
}

/**
 * Unified, kind-discriminated draft hook backed by FeedDataContext.
 * Persists through the same store as the feed (localStorage) so all four
 * creators share a single drafts inbox.
 */
export function useStudioDraft<TData extends Record<string, unknown>>(
  options: UseStudioDraftOptions<TData>
) {
  const { kind, data, title, enabled = true, intervalMs = 5000, existingDraftId } = options;
  const { saveDraft, deleteDraft, getDraft } = useFeedData();

  const [draftId, setDraftId] = useState<string | undefined>(existingDraftId);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const lastSerializedRef = useRef<string>('');

  // Snapshot the latest values so the interval callback always sees fresh data
  const latestRef = useRef({ kind, data, title, enabled });
  useEffect(() => {
    latestRef.current = { kind, data, title, enabled };
  }, [kind, data, title, enabled]);

  const persist = useCallback((force = false): StudioDraft | undefined => {
    const { kind: k, data: d, title: t, enabled: e } = latestRef.current;
    if (!e) return;
    const serialized = JSON.stringify(d);
    if (!force && serialized === lastSerializedRef.current) return;
    const result = saveDraft({ id: draftId, kind: k, title: t, data: d });
    lastSerializedRef.current = serialized;
    setDraftId(result.id);
    setLastSavedAt(result.updatedAt);
    return result;
  }, [draftId, saveDraft]);

  // Auto-save timer
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => persist(false), intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs, persist]);

  // Save on unload
  useEffect(() => {
    const handler = () => persist(true);
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [persist]);

  const discard = useCallback(() => {
    if (draftId) {
      deleteDraft(draftId);
      setDraftId(undefined);
      lastSerializedRef.current = '';
      setLastSavedAt(null);
    }
  }, [draftId, deleteDraft]);

  const resume = useCallback(
    (id: string): StudioDraft | undefined => {
      const draft = getDraft(id);
      if (draft) setDraftId(id);
      return draft;
    },
    [getDraft]
  );

  return { draftId, lastSavedAt, persist, discard, resume };
}

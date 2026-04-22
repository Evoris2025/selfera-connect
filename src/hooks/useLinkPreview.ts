import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

const URL_RE = /(https?:\/\/[^\s]+)/i;

/**
 * Wrapper around the existing fetch-link-preview edge function.
 * Debounced; safe to feed raw post text.
 */
export function useLinkPreview(text: string, debounceMs = 600) {
  const [preview, setPreview] = useState<LinkPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const lastUrlRef = useRef<string | null>(null);

  const fetchFor = useCallback(async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.functions.invoke('fetch-link-preview', {
        body: { url },
      });
      if (err) throw err;
      setPreview({ url, ...(data ?? {}) });
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch link preview'));
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const match = text?.match(URL_RE);
    const url = match?.[0] ?? null;
    if (!url) {
      setPreview(null);
      lastUrlRef.current = null;
      return;
    }
    if (url === lastUrlRef.current) return;
    const id = window.setTimeout(() => {
      lastUrlRef.current = url;
      void fetchFor(url);
    }, debounceMs);
    return () => window.clearTimeout(id);
  }, [text, debounceMs, fetchFor]);

  return { preview, loading, error, clear: () => setPreview(null) };
}

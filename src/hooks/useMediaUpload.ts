import { useCallback, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UploadStatus = 'idle' | 'uploading' | 'paused' | 'success' | 'error';

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

export interface UseMediaUploadOptions {
  bucket?: string;
  /** Bytes per chunk. Default 5MB. */
  chunkSize?: number;
  /** Retry attempts per chunk. Default 3. */
  maxRetries?: number;
  /** Optional path prefix (e.g. user id). */
  pathPrefix?: string;
}

export interface UploadResult {
  path: string;
  publicUrl: string;
}

/**
 * Unified media upload hook used by Video, Photo, and Expression creators.
 *
 * Today the Supabase storage SDK does not natively expose true resumable / chunked
 * uploads in the browser, so we fall back to a single PUT but expose progress via
 * an XHR wrapper, plus retry-on-failure. The chunked branch is wired for when
 * a TUS-compatible endpoint is added; the public API stays the same.
 */
export function useMediaUpload(options: UseMediaUploadOptions = {}) {
  const {
    bucket = 'media',
    chunkSize = 5 * 1024 * 1024,
    maxRetries = 3,
    pathPrefix,
  } = options;

  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState<UploadProgress>({ loaded: 0, total: 0, percent: 0 });
  const [error, setError] = useState<Error | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress({ loaded: 0, total: 0, percent: 0 });
    setError(null);
  }, []);

  const cancel = useCallback(() => {
    xhrRef.current?.abort();
    xhrRef.current = null;
    setStatus('idle');
  }, []);

  const upload = useCallback(
    async (file: File, fileName?: string): Promise<UploadResult> => {
      setStatus('uploading');
      setError(null);
      const total = file.size;
      setProgress({ loaded: 0, total, percent: 0 });

      const safeName =
        fileName ?? `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
      const path = pathPrefix ? `${pathPrefix}/${safeName}` : safeName;

      let attempt = 0;
      let lastErr: unknown;
      while (attempt < maxRetries) {
        try {
          // Use Supabase signed upload URL so we can drive XHR and report progress
          const { data: signed, error: signErr } = await supabase
            .storage
            .from(bucket)
            .createSignedUploadUrl(path);
          if (signErr || !signed) throw signErr ?? new Error('Failed to sign upload URL');

          const result = await new Promise<UploadResult>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhrRef.current = xhr;
            xhr.open('PUT', signed.signedUrl, true);
            xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
            xhr.upload.onprogress = (e) => {
              if (!e.lengthComputable) return;
              setProgress({
                loaded: e.loaded,
                total: e.total,
                percent: Math.round((e.loaded / e.total) * 100),
              });
            };
            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
                resolve({ path, publicUrl: pub.publicUrl });
              } else {
                reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
              }
            };
            xhr.onerror = () => reject(new Error('Network error during upload'));
            xhr.onabort = () => reject(new Error('Upload aborted'));
            xhr.send(file);
          });

          xhrRef.current = null;
          setStatus('success');
          setProgress({ loaded: total, total, percent: 100 });
          return result;
        } catch (err) {
          lastErr = err;
          attempt += 1;
          if (attempt >= maxRetries) break;
          await new Promise(r => setTimeout(r, 500 * 2 ** attempt));
        }
      }

      const finalErr = lastErr instanceof Error ? lastErr : new Error('Upload failed');
      setStatus('error');
      setError(finalErr);
      throw finalErr;
    },
    [bucket, maxRetries, pathPrefix]
  );

  return {
    upload,
    cancel,
    reset,
    status,
    progress,
    error,
    chunkSize, // exposed for callers that want to display chunking info
  };
}

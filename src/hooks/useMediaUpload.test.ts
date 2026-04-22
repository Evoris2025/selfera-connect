import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMediaUpload } from './useMediaUpload';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    storage: {
      from: () => ({
        createSignedUploadUrl: vi.fn(async () => ({
          data: { signedUrl: 'https://example.test/upload', token: 't', path: 'p' },
          error: null,
        })),
        getPublicUrl: () => ({ data: { publicUrl: 'https://example.test/public/file.png' } }),
      }),
    },
  },
}));

class MockXHR {
  upload = { onprogress: null as ((e: ProgressEvent) => void) | null };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onabort: (() => void) | null = null;
  status = 200;
  statusText = 'OK';
  open() {}
  setRequestHeader() {}
  abort() { this.onabort?.(); }
  send() {
    setTimeout(() => {
      this.upload.onprogress?.({ lengthComputable: true, loaded: 10, total: 10 } as ProgressEvent);
      this.onload?.();
    }, 0);
  }
}

describe('useMediaUpload', () => {
  beforeEach(() => {
    // @ts-expect-error patch global
    global.XMLHttpRequest = MockXHR;
  });

  it('uploads a file and reports success + 100% progress', async () => {
    const { result } = renderHook(() => useMediaUpload());
    const file = new File(['hi'], 'hi.txt', { type: 'text/plain' });

    let uploadResult: Awaited<ReturnType<typeof result.current.upload>> | undefined;
    await act(async () => {
      uploadResult = await result.current.upload(file);
    });

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.progress.percent).toBe(100);
    expect(uploadResult?.publicUrl).toContain('https://');
  });

  it('reset() returns to idle', async () => {
    const { result } = renderHook(() => useMediaUpload());
    act(() => result.current.reset());
    expect(result.current.status).toBe('idle');
    expect(result.current.progress.percent).toBe(0);
  });
});

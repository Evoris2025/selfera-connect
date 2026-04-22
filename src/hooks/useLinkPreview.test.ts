import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLinkPreview } from './useLinkPreview';

const invokeMock = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: { invoke: (...args: unknown[]) => invokeMock(...args) },
  },
}));

describe('useLinkPreview', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    invokeMock.mockReset();
    invokeMock.mockResolvedValue({
      data: { title: 'OG Title', siteName: 'Example' },
      error: null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces rapid text changes', async () => {
    const { rerender } = renderHook(({ text }) => useLinkPreview(text, 600), {
      initialProps: { text: '' },
    });

    rerender({ text: 'check this https://example.com/a' });
    rerender({ text: 'check this https://example.com/ab' });
    rerender({ text: 'check this https://example.com/abc' });

    // Before debounce window elapses, no fetch
    expect(invokeMock).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(700);
    });

    expect(invokeMock).toHaveBeenCalledTimes(1);
    expect(invokeMock).toHaveBeenCalledWith('fetch-link-preview', {
      body: { url: 'https://example.com/abc' },
    });
  });

  it('dedupes when the same URL is set repeatedly', async () => {
    const { rerender } = renderHook(({ text }) => useLinkPreview(text, 100), {
      initialProps: { text: 'see https://example.com/x' },
    });

    await act(async () => { vi.advanceTimersByTime(150); });
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(invokeMock).toHaveBeenCalledTimes(1);

    // Same URL again (different surrounding text) -> no extra fetch
    rerender({ text: 'still see https://example.com/x today' });
    await act(async () => { vi.advanceTimersByTime(150); });
    await act(async () => { await Promise.resolve(); });
    expect(invokeMock).toHaveBeenCalledTimes(1);
  });

  it('clears the preview when text becomes empty', async () => {
    const { result, rerender } = renderHook(({ text }) => useLinkPreview(text, 50), {
      initialProps: { text: 'visit https://example.com' },
    });

    await act(async () => { vi.advanceTimersByTime(100); });
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(result.current.preview).not.toBeNull();

    rerender({ text: '' });
    await act(async () => { vi.advanceTimersByTime(100); });
    expect(result.current.preview).toBeNull();
  });
});

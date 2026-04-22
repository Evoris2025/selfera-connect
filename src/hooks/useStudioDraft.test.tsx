import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { FeedDataProvider } from '@/contexts/FeedDataContext';
import { useStudioDraft } from './useStudioDraft';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user', email: 't@e.st' }, loading: false }),
  AuthProvider: ({ children }: { children: ReactNode }) => children,
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <FeedDataProvider>{children}</FeedDataProvider>
);

describe('useStudioDraft', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists a draft on persist() and exposes its id', () => {
    const data = { caption: 'hello world' };
    const { result } = renderHook(
      () => useStudioDraft({ kind: 'post', title: 'hello', data, enabled: true }),
      { wrapper }
    );
    act(() => { result.current.persist(true); });
    expect(result.current.draftId).toBeTruthy();
    expect(result.current.lastSavedAt).toBeGreaterThan(0);
  });

  it('discard() removes the draft', () => {
    const { result } = renderHook(
      () => useStudioDraft({ kind: 'post', title: 't', data: { x: 1 }, enabled: true }),
      { wrapper }
    );
    act(() => { result.current.persist(true); });
    expect(result.current.draftId).toBeTruthy();
    act(() => { result.current.discard(); });
    expect(result.current.draftId).toBeUndefined();
  });

  it('does not persist when disabled', () => {
    const { result } = renderHook(
      () => useStudioDraft({ kind: 'video', title: 't', data: { y: 2 }, enabled: false }),
      { wrapper }
    );
    act(() => { result.current.persist(true); });
    expect(result.current.draftId).toBeUndefined();
  });
});

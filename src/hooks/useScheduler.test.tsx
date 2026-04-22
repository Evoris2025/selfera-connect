import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { FeedDataProvider, useFeedData } from '@/contexts/FeedDataContext';
import { useScheduler } from './useScheduler';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user', email: 't@e.st' }, loading: false }),
  AuthProvider: ({ children }: { children: ReactNode }) => children,
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <FeedDataProvider>{children}</FeedDataProvider>
);

describe('useScheduler', () => {
  beforeEach(() => localStorage.clear());

  it('publishes due posts and removes them from the queue', () => {
    const { result } = renderHook(
      () => {
        const ctx = useFeedData();
        const sched = useScheduler();
        return { ctx, sched };
      },
      { wrapper }
    );

    const initialPostCount = result.current.ctx.posts.length;

    act(() => {
      result.current.ctx.schedulePublish({
        kind: 'post',
        scheduledAt: Date.now() - 1000,
        payload: {
          author: { name: 'You', handle: 'you', avatar: '' },
          content: 'scheduled hello',
          tags: [],
          contentType: 'text',
        },
      });
    });

    expect(result.current.ctx.scheduled.length).toBe(1);

    act(() => { result.current.sched.publishDue(); });

    expect(result.current.ctx.scheduled.length).toBe(0);
    expect(result.current.ctx.posts.length).toBe(initialPostCount + 1);
  });

  it('leaves future items alone', () => {
    const { result } = renderHook(
      () => {
        const ctx = useFeedData();
        const sched = useScheduler();
        return { ctx, sched };
      },
      { wrapper }
    );

    act(() => {
      result.current.ctx.schedulePublish({
        kind: 'post',
        scheduledAt: Date.now() + 60_000,
        payload: {
          author: { name: 'You', handle: 'you', avatar: '' },
          content: 'later',
          tags: [],
          contentType: 'text',
        },
      });
    });

    act(() => { result.current.sched.publishDue(); });
    expect(result.current.ctx.scheduled.length).toBe(1);
  });
});

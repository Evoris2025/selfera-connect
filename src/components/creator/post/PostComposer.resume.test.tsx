/**
 * Verifies that mounting <PostComposer ?draftId=...> hydrates state from
 * the stored StudioDraft.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

import { PostComposer } from '../PostComposer';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { changeLanguage: () => Promise.resolve() } }),
  initReactI18next: { type: '3rdParty', init: () => {} },
  Trans: ({ children }: { children?: React.ReactNode }) => children,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'sim-user-resume', email: 'resume@example.com' },
    session: null,
    loading: false,
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

const seededDraft = {
  id: 'draft-resume-1',
  kind: 'post' as const,
  title: 'Resumed caption',
  createdAt: 0,
  updatedAt: 0,
  data: {
    content: 'Resumed caption from a saved draft',
    selectedTags: [],
    audience: 'followers',
    customAudience: { include: [], exclude: [] },
    contentWarning: false,
    contentWarningType: null,
    mediaPreviewUrls: [],
    mediaTypes: [],
    selectedGifUrl: null,
    background: null,
    composerMode: 'simple',
    threadItems: [{ id: 'thread-1', content: '' }],
    poll: null,
    feeling: null,
    location: null,
    scheduledDate: null,
    checkIn: null,
    taggedPeople: [],
    commentPermission: 'everyone',
    reactionsDisabled: false,
    lifeEvent: null,
    fundraiser: null,
    linkPreview: null,
    crossPost: { alsoShareAsExpression: false, alsoShareAsPost: false },
  },
};

vi.mock('@/contexts/FeedDataContext', async () => {
  const actual = await vi.importActual<typeof import('@/contexts/FeedDataContext')>(
    '@/contexts/FeedDataContext'
  );
  return {
    ...actual,
    useFeedData: () => ({
      createPost: vi.fn(),
      createExpression: vi.fn(),
      schedulePublish: vi.fn(),
      getDraft: (id: string) => (id === seededDraft.id ? seededDraft : undefined),
      saveDraft: vi.fn(() => seededDraft),
      deleteDraft: vi.fn(),
    }),
  };
});

vi.mock('@/hooks/useStudioDraft', () => ({
  useStudioDraft: () => ({
    draftId: seededDraft.id,
    lastSavedAt: null,
    persist: vi.fn(),
    discard: vi.fn(),
    resume: vi.fn(),
  }),
}));

vi.mock('@/hooks/useLinkPreview', () => ({
  useLinkPreview: () => ({ preview: null, loading: false, error: null, clear: vi.fn() }),
}));

describe('PostComposer resume from draft', () => {
  it('hydrates the textarea and audience from the stored draft', async () => {
    render(
      <MemoryRouter initialEntries={[`/studio/post?draftId=${seededDraft.id}`]}>
        <PostComposer onBack={() => {}} onSuccess={() => {}} />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByPlaceholderText(/What's on your mind/i)).toHaveValue(
        'Resumed caption from a saved draft'
      )
    );

    // The audience selector renders the selected option label
    expect(screen.getByRole('button', { name: /followers/i })).toBeInTheDocument();
  });
});

/**
 * Verifies that PostComposer's createPost call carries every Phase 4 field
 * AND remains a superset of the legacy payload fixture.
 *
 * Strategy: seed a kind:'post' draft with a fully-populated ComposerState,
 * mount <PostComposer> with ?draftId=…, capture the createPost call via a
 * mocked useFeedData, then click Post.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

import { PostComposer } from '../PostComposer';
import { legacyPostPayload } from './__fixtures__/legacyPostPayload';

// ---- Mocks ------------------------------------------------------------------
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { changeLanguage: () => Promise.resolve() } }),
  initReactI18next: { type: '3rdParty', init: () => {} },
  Trans: ({ children }: { children?: React.ReactNode }) => children,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'sim-user-legacy', email: 'you@example.com' },
    session: null,
    loading: false,
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

const createPostMock = vi.fn();
const createExpressionMock = vi.fn();
const schedulePublishMock = vi.fn();
const discardMock = vi.fn();

const seededDraft = {
  id: 'draft-fully-populated',
  kind: 'post' as const,
  title: 'Hello world from the legacy composer',
  createdAt: 0,
  updatedAt: 0,
  data: {
    content: 'Hello world from the legacy composer',
    selectedTags: ['mindfulness'],
    audience: 'close_friends',
    customAudience: { include: [], exclude: [] },
    contentWarning: false,
    contentWarningType: null,
    mediaPreviewUrls: [],
    mediaTypes: [],
    selectedGifUrl: null,
    background: null,
    composerMode: 'simple',
    threadItems: [{ id: 'thread-1', content: '' }],
    poll: {
      options: [{ text: 'A' }, { text: 'B' }],
      durationHours: 1,
      durationMs: 3_600_000,
      multiSelect: true,
    },
    feeling: null,
    location: null,
    scheduledDate: null,
    checkIn: { placeId: 'p1', name: 'Blue Bottle Coffee', category: 'Cafe' },
    taggedPeople: [
      { id: 'u1', name: 'Sarah Chen', handle: 'sarahc', avatar: '' },
      { id: 'u2', name: 'James Wilson', handle: 'jwilson', avatar: '' },
    ],
    commentPermission: 'followers',
    reactionsDisabled: true,
    lifeEvent: null,
    fundraiser: null,
    linkPreview: {
      url: 'https://example.com',
      title: 'Example',
      description: 'desc',
      siteName: 'example.com',
    },
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
      createPost: createPostMock,
      createExpression: createExpressionMock,
      schedulePublish: schedulePublishMock,
      getDraft: (id: string) => (id === seededDraft.id ? seededDraft : undefined),
      saveDraft: vi.fn(() => seededDraft),
      deleteDraft: vi.fn(),
    }),
  };
});

// useStudioDraft: bypass interval/persist and just expose discard
vi.mock('@/hooks/useStudioDraft', () => ({
  useStudioDraft: () => ({
    draftId: seededDraft.id,
    lastSavedAt: null,
    persist: vi.fn(),
    discard: discardMock,
    resume: vi.fn(),
  }),
}));

// useLinkPreview: emulate a successful fetch using the seeded URL
vi.mock('@/hooks/useLinkPreview', () => ({
  useLinkPreview: (text: string) => ({
    preview: text.includes('https://example.com')
      ? { url: 'https://example.com', title: 'Example', description: 'desc', siteName: 'example.com' }
      : null,
    loading: false,
    error: null,
    clear: vi.fn(),
  }),
}));

// ---- Test -------------------------------------------------------------------
describe('PostComposer → createPost payload', () => {
  beforeEach(() => {
    createPostMock.mockReset();
    createExpressionMock.mockReset();
    schedulePublishMock.mockReset();
    discardMock.mockReset();
  });

  it('publishes a fully-populated post and remains a superset of the legacy payload', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={[`/studio/post?draftId=${seededDraft.id}`]}>
        <PostComposer onBack={() => {}} onSuccess={() => {}} />
      </MemoryRouter>
    );

    // Wait for hydration
    await waitFor(() =>
      expect(screen.getByPlaceholderText(/What's on your mind/i)).toHaveValue(
        'Hello world from the legacy composer'
      )
    );

    const postButton = screen.getByRole('button', { name: /^post$/i });
    await user.click(postButton);

    await waitFor(() => expect(createPostMock).toHaveBeenCalledTimes(1));

    const payload = createPostMock.mock.calls[0][0];

    // Phase 4 fields
    expect(payload.audience).toBe('close_friends');
    expect(payload.checkIn).toEqual({ placeId: 'p1', name: 'Blue Bottle Coffee', category: 'Cafe' });
    expect(payload.taggedPeople).toHaveLength(2);
    expect(payload.linkPreview).toMatchObject({ url: 'https://example.com', title: 'Example' });
    expect(payload.commentPermission).toBe('followers');
    expect(payload.reactionsDisabled).toBe(true);
    expect(payload.poll).toBeDefined();
    expect(payload.poll.multiSelect).toBe(true);
    expect(payload.poll.durationMs).toBe(3_600_000);
    expect(payload.poll.closesAt).toBeGreaterThan(Date.now());
    expect(payload.poll.options).toHaveLength(2);

    // Legacy superset
    expect(payload.authorId).toBe(legacyPostPayload.authorId);
    expect(payload.author.name).toBe(legacyPostPayload.author.name);
    expect(payload.author.handle).toBe(legacyPostPayload.author.handle);
    expect(payload.content).toBe(legacyPostPayload.content);
    expect(payload.tags).toEqual(legacyPostPayload.tags);
    expect(payload.contentType).toBe(legacyPostPayload.contentType);
    expect(payload.media).toBeUndefined();
  });
});

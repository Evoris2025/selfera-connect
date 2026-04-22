/**
 * Legacy PostComposer → createPost payload snapshot.
 *
 * Captured before the Phase 4b rewrite. Mirrors the exact object the
 * pre-Phase-4b PostComposer handed to FeedDataContext.createPost for a
 * plain text post with one topic tag.
 *
 * The new composer is REQUIRED to produce a payload that is a SUPERSET of
 * this fixture: every legacy field present, same shape, only additive new
 * fields permitted. See PostComposer.payload.test.tsx.
 */
export const legacyPostPayload = {
  authorId: 'sim-user-legacy',
  author: {
    name: 'You',
    handle: 'you',
    avatar: '',
    isVerified: false,
    email: undefined as string | undefined,
  },
  content: 'Hello world from the legacy composer',
  tags: ['mindfulness'],
  contentType: 'text' as const,
  // media intentionally omitted on text-only posts
  media: undefined as { type: 'image' | 'video'; url: string } | undefined,
};

export type LegacyPostPayload = typeof legacyPostPayload;

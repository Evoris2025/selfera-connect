/**
 * Mock data for the Explore pre-search overlay (ExploreSearchOverlay).
 * All entries are static seeds for round-2; wire to real search later.
 */

export interface TrendingSearch {
  id: string;
  term: string;
  /** Approximate search volume (used for the "1.2K searches" subtitle). */
  count: number;
}

import type { VerificationTier } from './ExploreVerifiedTick';

export interface SuggestedCreator {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl: string;
  /** Tier drives badge color via ExploreVerifiedTick; null = unverified (no badge). */
  tier: VerificationTier | null;
  /** Optional category line — kept in the type but not rendered on cards. */
  reason?: string;
}

export type RecentSearchType = 'query' | 'account' | 'tag';

export interface RecentSearch {
  id: string;
  type: RecentSearchType;
  label: string;
}

export const TRENDING_SEARCHES: TrendingSearch[] = [
  { id: 'ts-1', term: 'mindfulness', count: 1_200_000 },
  { id: 'ts-2', term: 'self compassion', count: 8900 },
  { id: 'ts-3', term: 'sleep routines', count: 6200 },
  { id: 'ts-4', term: 'breathwork', count: 4100 },
  { id: 'ts-5', term: 'gratitude journaling', count: 3300 },
];

// Reuse the Unsplash photo pool already referenced in trendingNowData.ts to
// avoid introducing new external image hosts.
const AVA = (seed: string) => `https://images.unsplash.com/${seed}?w=160&h=160&fit=crop`;

export const SUGGESTED_CREATORS: SuggestedCreator[] = [
  {
    id: 'sc-1',
    displayName: 'Maya Quiet',
    handle: 'mayaquiet',
    avatarUrl: AVA('photo-1494790108377-be9c29b29330'),
    tier: 'purple',
    reason: 'Calm voice · meditation',
  },
  {
    id: 'sc-2',
    displayName: 'Dr. Noor',
    handle: 'drnoor',
    avatarUrl: AVA('photo-1517021897933-0e0319cfbc28'),
    tier: 'orange',
    reason: 'Therapist · ERA Verified',
  },
  {
    id: 'sc-3',
    displayName: 'Leo in Motion',
    handle: 'leoinmotion',
    avatarUrl: AVA('photo-1504593811423-6dd665756598'),
    tier: null,
    reason: 'Movement · breathwork',
  },
  {
    id: 'sc-4',
    displayName: 'Aria Notes',
    handle: 'aria.notes',
    avatarUrl: AVA('photo-1488521787991-ed7bbaae773c'),
    tier: 'green',
    reason: 'Journaling prompts',
  },
  {
    id: 'sc-5',
    displayName: 'Kai',
    handle: 'kaitherapy',
    avatarUrl: AVA('photo-1531123897727-8f129e1688ce'),
    tier: 'pink',
    reason: 'Anxiety support · creator',
  },
  {
    id: 'sc-6',
    displayName: 'Inés',
    handle: 'ines.sleeps',
    avatarUrl: AVA('photo-1541781774459-bb2af2f05b55'),
    tier: 'blue',
    reason: 'Sleep · nervous system',
  },
  {
    id: 'sc-7',
    displayName: 'Sam Murmurs',
    handle: 'sammurmurs',
    avatarUrl: AVA('photo-1507003211169-0a1dd7228f2d'),
    tier: null,
    reason: 'ASMR · voice notes',
  },
  {
    id: 'sc-8',
    displayName: 'Rivkah',
    handle: 'rivkahheals',
    avatarUrl: AVA('photo-1499209974431-9dddcece7f88'),
    tier: 'green',
    reason: 'Practitioner · grief',
  },
];

export const DEFAULT_RECENT_SEARCHES: RecentSearch[] = [
  { id: 'r1', type: 'query', label: 'mindfulness' },
  { id: 'r2', type: 'account', label: 'drsarah' },
  { id: 'r3', type: 'tag', label: 'healingjourney' },
];

export const RECENT_SEARCHES_STORAGE_KEY = 'selfera:recent-searches';
export const RECENT_SEARCHES_MAX = 8;

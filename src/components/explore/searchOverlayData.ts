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

export interface SuggestedCreator {
  id: string;
  handle: string;
  displayName: string;
  avatar: string;
  /** Short reason / category line shown under the name. */
  reason: string;
}

export const TRENDING_SEARCHES: TrendingSearch[] = [
  { id: 'ts-1', term: 'mindfulness', count: 12400 },
  { id: 'ts-2', term: 'self compassion', count: 8900 },
  { id: 'ts-3', term: 'sleep routines', count: 6200 },
  { id: 'ts-4', term: 'breathwork', count: 4100 },
  { id: 'ts-5', term: 'gratitude journaling', count: 3300 },
];

export const SUGGESTED_CREATORS: SuggestedCreator[] = [
  {
    id: 'sc-1',
    handle: 'mayaquiet',
    displayName: 'Maya Quiet',
    avatar: 'https://i.pravatar.cc/120?img=47',
    reason: 'Calm voice · meditation',
  },
  {
    id: 'sc-2',
    handle: 'drnoor',
    displayName: 'Dr. Noor',
    avatar: 'https://i.pravatar.cc/120?img=12',
    reason: 'Therapist · ERA Verified',
  },
  {
    id: 'sc-3',
    handle: 'leoinmotion',
    displayName: 'Leo in Motion',
    avatar: 'https://i.pravatar.cc/120?img=33',
    reason: 'Movement · breathwork',
  },
  {
    id: 'sc-4',
    handle: 'aria.notes',
    displayName: 'Aria Notes',
    avatar: 'https://i.pravatar.cc/120?img=21',
    reason: 'Journaling prompts',
  },
  {
    id: 'sc-5',
    handle: 'kaitherapy',
    displayName: 'Kai',
    avatar: 'https://i.pravatar.cc/120?img=8',
    reason: 'Anxiety support · creator',
  },
  {
    id: 'sc-6',
    handle: 'ines.sleeps',
    displayName: 'Inés',
    avatar: 'https://i.pravatar.cc/120?img=44',
    reason: 'Sleep · nervous system',
  },
  {
    id: 'sc-7',
    handle: 'sammurmurs',
    displayName: 'Sam Murmurs',
    avatar: 'https://i.pravatar.cc/120?img=15',
    reason: 'ASMR · voice notes',
  },
  {
    id: 'sc-8',
    handle: 'rivkahheals',
    displayName: 'Rivkah',
    avatar: 'https://i.pravatar.cc/120?img=26',
    reason: 'Practitioner · grief',
  },
];

export const DEFAULT_RECENT_SEARCHES: string[] = [
  'morning anxiety',
  'self worth',
  'guided breathwork',
];

export const RECENT_SEARCHES_STORAGE_KEY = 'selfera.explore.recentSearches';
export const RECENT_SEARCHES_MAX = 8;

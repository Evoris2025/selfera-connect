/**
 * Mock data for the Explore search results overlay (ExploreSearchResults).
 * All static seeds for round-3a; wire to real search later.
 */

import type { VerificationTier } from '@/components/EraVerifiedTick';

const AVA = (seed: string) => `https://images.unsplash.com/${seed}?w=160&h=160&fit=crop`;

export interface SearchAccount {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl: string;
  followerCount: number;
  tier: VerificationTier | null;
}

export interface SearchTag {
  id: string;
  name: string;
  postCount: number;
}

export interface SearchPost {
  id: string;
  body: string;
  timeAgo: string;
  likes: number;
  comments: number;
  author: {
    id: string;
    displayName: string;
    handle: string;
    avatarUrl: string;
    tier: VerificationTier | null;
  };
}

export const MOCK_ACCOUNTS: SearchAccount[] = [
  { id: 'a1', displayName: 'Mindful Moments', handle: 'mindfulmoments', avatarUrl: AVA('photo-1494790108377-be9c29b29330'), followerCount: 1_240_000, tier: 'purple' },
  { id: 'a2', displayName: 'Dr. Sarah Mitchell', handle: 'drsarah', avatarUrl: AVA('photo-1517021897933-0e0319cfbc28'), followerCount: 320_000, tier: 'blue' },
  { id: 'a3', displayName: 'Calm Coach', handle: 'calmcoach', avatarUrl: AVA('photo-1488521787991-ed7bbaae773c'), followerCount: 78_000, tier: 'green' },
  { id: 'a4', displayName: 'Jamie', handle: 'jamie_journey', avatarUrl: AVA('photo-1531123897727-8f129e1688ce'), followerCount: 8_900, tier: null },
  { id: 'a5', displayName: 'Wellness Hub', handle: 'wellnesshub', avatarUrl: AVA('photo-1499209974431-9dddcece7f88'), followerCount: 5_600_000, tier: 'orange' },
  { id: 'a6', displayName: 'Recovery Road', handle: 'recoveryroad', avatarUrl: AVA('photo-1541781774459-bb2af2f05b55'), followerCount: 22_000, tier: 'pink' },
  { id: 'a7', displayName: 'Anxiety Support', handle: 'anxietysupport', avatarUrl: AVA('photo-1507003211169-0a1dd7228f2d'), followerCount: 145_000, tier: 'green' },
  { id: 'a8', displayName: 'Leo H.', handle: 'leo_h', avatarUrl: AVA('photo-1504593811423-6dd665756598'), followerCount: 2_400, tier: null },
];

export const MOCK_TAGS: SearchTag[] = [
  { id: 't1', name: 'mindfulness', postCount: 1_200_000 },
  { id: 't2', name: 'healingjourney', postCount: 540_000 },
  { id: 't3', name: 'selfcompassion', postCount: 89_000 },
  { id: 't4', name: 'breathwork', postCount: 41_000 },
  { id: 't5', name: 'sleeproutines', postCount: 33_000 },
  { id: 't6', name: 'gratitude', postCount: 210_000 },
  { id: 't7', name: 'anxietysupport', postCount: 156_000 },
  { id: 't8', name: 'recovery', postCount: 67_000 },
];

export const MOCK_POSTS: SearchPost[] = [
  {
    id: 'sp1',
    body: 'Healing is not linear. Some days will be harder than others — keep showing up.',
    timeAgo: '2h',
    likes: 2340,
    comments: 156,
    author: { id: 'au1', displayName: 'Dr. Sarah Mitchell', handle: 'drsarah', avatarUrl: AVA('photo-1517021897933-0e0319cfbc28'), tier: 'blue' },
  },
  {
    id: 'sp2',
    body: 'Setting boundaries isn\'t selfish — it\'s self-care. 💙',
    timeAgo: '4h',
    likes: 1890,
    comments: 89,
    author: { id: 'au2', displayName: 'Wellness Hub', handle: 'wellnesshub', avatarUrl: AVA('photo-1499209974431-9dddcece7f88'), tier: 'orange' },
  },
  {
    id: 'sp3',
    body: 'Spent the morning journaling and it shifted my mindset. What\'s your reflection practice?',
    timeAgo: '6h',
    likes: 5670,
    comments: 423,
    author: { id: 'au3', displayName: 'Mind Matters', handle: 'mindmatters', avatarUrl: AVA('photo-1488521787991-ed7bbaae773c'), tier: 'green' },
  },
  {
    id: 'sp4',
    body: 'Six months sober today. Thank you to everyone who believed in me when I couldn\'t.',
    timeAgo: '1d',
    likes: 12_400,
    comments: 890,
    author: { id: 'au4', displayName: 'Jamie', handle: 'jamie_journey', avatarUrl: AVA('photo-1531123897727-8f129e1688ce'), tier: null },
  },
  {
    id: 'sp5',
    body: 'One small thing today: I took a 10-minute walk outside. Your turn?',
    timeAgo: '12h',
    likes: 3200,
    comments: 1567,
    author: { id: 'au5', displayName: 'Calm Space', handle: 'calmspace', avatarUrl: AVA('photo-1494790108377-be9c29b29330'), tier: 'pink' },
  },
  {
    id: 'sp6',
    body: 'Breathwork before bed has changed my sleep entirely.',
    timeAgo: '3h',
    likes: 870,
    comments: 64,
    author: { id: 'au6', displayName: 'Inés', handle: 'ines.sleeps', avatarUrl: AVA('photo-1541781774459-bb2af2f05b55'), tier: 'green' },
  },
  {
    id: 'sp7',
    body: 'A practitioner-led grief circle next week — open to anyone navigating loss.',
    timeAgo: '8h',
    likes: 412,
    comments: 28,
    author: { id: 'au7', displayName: 'Rivkah', handle: 'rivkahheals', avatarUrl: AVA('photo-1499209974431-9dddcece7f88'), tier: 'green' },
  },
  {
    id: 'sp8',
    body: 'Just joined SelfERA — feeling hopeful for the first time in a while.',
    timeAgo: '15m',
    likes: 234,
    comments: 45,
    author: { id: 'au8', displayName: 'NewStart', handle: 'newstart2024', avatarUrl: AVA('photo-1507003211169-0a1dd7228f2d'), tier: null },
  },
];

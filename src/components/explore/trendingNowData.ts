/**
 * Mock data for the TRENDING NOW rail in the Explore tab.
 *
 * Per-tab content with native shapes:
 *  - expressions: 9:16 vertical thumbnails
 *  - videos: 16:9 landscape thumbnails with duration
 *  - images: 1:1 square thumbnails
 *  - posts: text-first cards with author + snippet
 *
 * Co-located with the Explore feature, kept in its own file so the
 * TrendingNowRail component stays component-only.
 */

export interface TrendingExpression {
  id: string;
  thumbnail: string;
  user: { handle: string; avatar: string };
  views: number;
}

export interface TrendingVideo {
  id: string;
  thumbnail: string;
  duration: string;
  title: string;
  views: number;
}

export interface TrendingImage {
  id: string;
  url: string;
  likes: number;
}

export interface TrendingPost {
  id: string;
  snippet: string;
  user: { handle: string; avatar: string };
  likes: number;
}

// Reused image pool — same Unsplash photos already referenced elsewhere in the codebase.
const VERT = (seed: string) => `https://images.unsplash.com/${seed}?w=400&h=700&fit=crop`;
const WIDE = (seed: string) => `https://images.unsplash.com/${seed}?w=800&h=450&fit=crop`;
const SQ = (seed: string) => `https://images.unsplash.com/${seed}?w=600&h=600&fit=crop`;

const PHOTOS = [
  'photo-1506126613408-eca07ce68773',
  'photo-1499209974431-9dddcece7f88',
  'photo-1518495973542-4542c06a5843',
  'photo-1541781774459-bb2af2f05b55',
  'photo-1507003211169-0a1dd7228f2d',
  'photo-1494790108377-be9c29b29330',
  'photo-1517021897933-0e0319cfbc28',
  'photo-1488521787991-ed7bbaae773c',
  'photo-1504593811423-6dd665756598',
  'photo-1531123897727-8f129e1688ce',
];

const USERS = [
  { handle: 'drsarah', avatar: 'https://i.pravatar.cc/100?img=47' },
  { handle: 'wellnesshub', avatar: 'https://i.pravatar.cc/100?img=32' },
  { handle: 'jamie_j', avatar: 'https://i.pravatar.cc/100?img=12' },
  { handle: 'mindmatters', avatar: 'https://i.pravatar.cc/100?img=14' },
  { handle: 'calmspace', avatar: 'https://i.pravatar.cc/100?img=9' },
  { handle: 'alex_w', avatar: 'https://i.pravatar.cc/100?img=33' },
  { handle: 'newstart24', avatar: 'https://i.pravatar.cc/100?img=51' },
  { handle: 'breathe.daily', avatar: 'https://i.pravatar.cc/100?img=22' },
  { handle: 'soft_landing', avatar: 'https://i.pravatar.cc/100?img=5' },
  { handle: 'kindredspirit', avatar: 'https://i.pravatar.cc/100?img=18' },
];

const VIEWS = [12400, 8900, 5600, 23400, 18700, 4300, 67800, 156000, 34500, 9800, 2100, 45200, 11300, 7600, 88400, 3400, 19200, 5500, 27800, 6100];
const LIKES = [2340, 1890, 5670, 12400, 3200, 234, 9800, 4500, 760, 15600, 870, 2210, 6700, 3300, 18200, 540, 2900, 1100, 7400, 980];

const VIDEO_TITLES = [
  'Understanding Anxiety: A Complete Guide',
  'Morning Meditation for Calm',
  'My Recovery Journey: 6 Month Update',
  'The Science of Sleep and Mental Health',
  'Building Resilience: A Workshop',
  'How to Start Your Wellness Journey',
  'Breathing Techniques That Actually Work',
  'Talking to a Therapist for the First Time',
  'Why Rest Is Productive',
  'Letting Go of Perfectionism',
  'Reframing Negative Self-Talk',
  'A Gentle Guide to Journaling',
  'Healing in Community',
  'Burnout Recovery: What Helped Me',
  'Setting Boundaries Without Guilt',
  'The Truth About Antidepressants',
  'Grounding Exercises for Panic',
  'Slow Mornings, Soft Days',
  'Hope Is a Practice',
  'You Are Allowed to Take Up Space',
];

const VIDEO_DURATIONS = ['12:34', '8:15', '15:22', '45:00', '1:02:15', '18:45', '6:30', '22:10', '4:50', '11:25', '9:40', '14:55', '7:20', '33:18', '19:02', '5:14', '8:48', '16:30', '10:05', '24:42'];

const POST_SNIPPETS = [
  "Healing isn't linear. Some days will be harder. What matters is showing up for yourself.",
  "Setting boundaries isn't selfish — it's self-care. Protect your peace. 💙",
  "Spent the morning journaling and it shifted my mindset. What's your reflection practice?",
  'Six months sober today. Never thought I would make it this far. Thank you all.',
  'One small thing for your mental health today? I took a 10-minute walk outside.',
  'Just joined this community and feeling hopeful for the first time in a while.',
  'Reminder: rest is not a reward. You don\'t have to earn it.',
  'Therapy is hard work but it changes you. Worth every session.',
  'Your nervous system needs safety, not pressure. Be gentle today.',
  'Quiet wins still count. Got out of bed, drank water, sent the email.',
  'You can love someone and still need space from them.',
  'Recovery is not pretty. It is messy and slow. And it is real.',
  'Started saying no this year. Best decision I have made.',
  'Anxiety lies. Take the deep breath. You are safe right now.',
  'Healing the relationship with myself first. Everything else follows.',
  'Some days the win is just not giving up.',
  'Letting myself feel hard things instead of running from them.',
  'Community is medicine. Thank you for being here.',
  'Trying to be the friend I needed when I was younger.',
  'Soft life is not a trend, it is a recovery plan.',
];

function buildExpressions(): TrendingExpression[] {
  return Array.from({ length: 20 }, (_, i) => ({
    id: `tn-e${i + 1}`,
    thumbnail: VERT(PHOTOS[i % PHOTOS.length]),
    user: USERS[i % USERS.length],
    views: VIEWS[i],
  }));
}

function buildVideos(): TrendingVideo[] {
  return Array.from({ length: 20 }, (_, i) => ({
    id: `tn-v${i + 1}`,
    thumbnail: WIDE(PHOTOS[i % PHOTOS.length]),
    duration: VIDEO_DURATIONS[i],
    title: VIDEO_TITLES[i],
    views: VIEWS[i],
  }));
}

function buildImages(): TrendingImage[] {
  return Array.from({ length: 20 }, (_, i) => ({
    id: `tn-i${i + 1}`,
    url: SQ(PHOTOS[i % PHOTOS.length]),
    likes: LIKES[i],
  }));
}

function buildPosts(): TrendingPost[] {
  return Array.from({ length: 20 }, (_, i) => ({
    id: `tn-p${i + 1}`,
    snippet: POST_SNIPPETS[i],
    user: USERS[i % USERS.length],
    likes: LIKES[i],
  }));
}

export const trendingExpressions: TrendingExpression[] = buildExpressions();
export const trendingVideos: TrendingVideo[] = buildVideos();
export const trendingImages: TrendingImage[] = buildImages();
export const trendingPosts: TrendingPost[] = buildPosts();

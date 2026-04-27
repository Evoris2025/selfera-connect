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

export const trendingExpressions: TrendingExpression[] = [
  { id: 'tn-e1', thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=700&fit=crop', user: { handle: 'drsarah', avatar: 'https://i.pravatar.cc/100?img=47' }, views: 12400 },
  { id: 'tn-e2', thumbnail: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=700&fit=crop', user: { handle: 'wellnesshub', avatar: 'https://i.pravatar.cc/100?img=32' }, views: 8900 },
  { id: 'tn-e3', thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=700&fit=crop', user: { handle: 'jamie_j', avatar: 'https://i.pravatar.cc/100?img=12' }, views: 5600 },
  { id: 'tn-e4', thumbnail: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=700&fit=crop', user: { handle: 'mindmatters', avatar: 'https://i.pravatar.cc/100?img=14' }, views: 23400 },
  { id: 'tn-e5', thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=700&fit=crop', user: { handle: 'calmspace', avatar: 'https://i.pravatar.cc/100?img=9' }, views: 18700 },
  { id: 'tn-e6', thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=700&fit=crop', user: { handle: 'alex_w', avatar: 'https://i.pravatar.cc/100?img=33' }, views: 4300 },
];

export const trendingVideos: TrendingVideo[] = [
  { id: 'tn-v1', thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=450&fit=crop', duration: '12:34', title: 'Understanding Anxiety: A Complete Guide', views: 45200 },
  { id: 'tn-v2', thumbnail: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&h=450&fit=crop', duration: '8:15', title: 'Morning Meditation for Calm', views: 23100 },
  { id: 'tn-v3', thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&h=450&fit=crop', duration: '15:22', title: 'My Recovery Journey: 6 Month Update', views: 8900 },
  { id: 'tn-v4', thumbnail: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&h=450&fit=crop', duration: '45:00', title: 'The Science of Sleep and Mental Health', views: 67800 },
  { id: 'tn-v5', thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=450&fit=crop', duration: '1:02:15', title: 'Building Resilience: A Workshop', views: 34500 },
  { id: 'tn-v6', thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=450&fit=crop', duration: '18:45', title: 'How to Start Your Wellness Journey', views: 156000 },
];

export const trendingImages: TrendingImage[] = [
  { id: 'tn-i1', url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=600&fit=crop', likes: 12400 },
  { id: 'tn-i2', url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&h=600&fit=crop', likes: 8900 },
  { id: 'tn-i3', url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&h=600&fit=crop', likes: 15600 },
  { id: 'tn-i4', url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&h=600&fit=crop', likes: 23400 },
  { id: 'tn-i5', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop', likes: 18700 },
  { id: 'tn-i6', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop', likes: 5600 },
];

export const trendingPosts: TrendingPost[] = [
  { id: 'tn-p1', snippet: "Healing isn't linear. Some days will be harder. What matters is showing up for yourself.", user: { handle: 'drsarah', avatar: 'https://i.pravatar.cc/100?img=47' }, likes: 2340 },
  { id: 'tn-p2', snippet: "Setting boundaries isn't selfish — it's self-care. Protect your peace. 💙", user: { handle: 'wellnesshub', avatar: 'https://i.pravatar.cc/100?img=32' }, likes: 1890 },
  { id: 'tn-p3', snippet: "Spent the morning journaling and it shifted my mindset. What's your reflection practice?", user: { handle: 'mindmatters', avatar: 'https://i.pravatar.cc/100?img=14' }, likes: 5670 },
  { id: 'tn-p4', snippet: 'Six months sober today. Never thought I would make it this far. Thank you all.', user: { handle: 'jamie_journey', avatar: 'https://i.pravatar.cc/100?img=12' }, likes: 12400 },
  { id: 'tn-p5', snippet: 'One small thing for your mental health today? I took a 10-minute walk outside.', user: { handle: 'calmspace', avatar: 'https://i.pravatar.cc/100?img=9' }, likes: 3200 },
  { id: 'tn-p6', snippet: 'Just joined this community and feeling hopeful for the first time in a while.', user: { handle: 'newstart2024', avatar: 'https://i.pravatar.cc/100?img=51' }, likes: 234 },
];

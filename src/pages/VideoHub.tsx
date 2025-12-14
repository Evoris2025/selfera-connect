import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Clock, Users, Compass, ChevronRight, BookOpen } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { cn } from '@/lib/utils';

// Mock video data
const forYouVideos = [
  {
    id: '1',
    title: 'Understanding Anxiety: A Complete Guide',
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=450&fit=crop',
    duration: '12:34',
    views: 45200,
    creator: { name: 'Dr. Sarah Mitchell', handle: 'drsarah', avatar: '', isVerified: true },
    tags: ['Anxiety', 'Education'],
  },
  {
    id: '2',
    title: 'Morning Meditation for Calm',
    thumbnail: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&h=450&fit=crop',
    duration: '8:15',
    views: 23100,
    creator: { name: 'Mindful Moments', handle: 'mindfulmoments', avatar: '', isVerified: true },
    tags: ['Meditation', 'Mindfulness'],
  },
];

const followingVideos = [
  {
    id: '3',
    title: 'My Recovery Journey: 6 Month Update',
    thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&h=450&fit=crop',
    duration: '15:22',
    views: 8900,
    creator: { name: 'Jamie', handle: 'jamie_journey', avatar: '', isVerified: false },
    tags: ['Recovery', 'Personal'],
  },
];

const deepDives = [
  {
    id: '4',
    title: 'The Science of Sleep and Mental Health',
    thumbnail: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&h=450&fit=crop',
    duration: '45:00',
    views: 67800,
    creator: { name: 'Wellness Academy', handle: 'wellnessacademy', avatar: '', isVerified: true },
    tags: ['Sleep', 'Science'],
  },
  {
    id: '5',
    title: 'Building Resilience: A Workshop',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=450&fit=crop',
    duration: '1:02:15',
    views: 34500,
    creator: { name: 'Mental Health Foundation', handle: 'mhfoundation', avatar: '', isVerified: true },
    tags: ['Resilience', 'Workshop'],
  },
];

function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}

interface VideoCardProps {
  video: typeof forYouVideos[0];
  size?: 'large' | 'medium';
}

function VideoCard({ video, size = 'medium' }: VideoCardProps) {
  return (
    <Card className={cn(
      'overflow-hidden cursor-pointer group hover:border-primary/30 transition-all',
      size === 'large' ? 'min-w-[320px] w-[320px]' : 'min-w-[280px] w-[280px]'
    )}>
      {/* Thumbnail */}
      <div className="relative aspect-video bg-secondary overflow-hidden">
        <img 
          src={video.thumbnail} 
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 rounded text-xs text-white font-medium">
          {video.duration}
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center">
            <Play className="h-6 w-6 text-primary-foreground fill-current ml-1" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex gap-3">
          <Avatar className="h-9 w-9 flex-shrink-0">
            <AvatarImage src={video.creator.avatar} alt={video.creator.name} />
            <AvatarFallback className="bg-secondary text-xs">
              {video.creator.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-foreground line-clamp-2 leading-tight">
              {video.title}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-muted-foreground">{video.creator.name}</span>
              {video.creator.isVerified && <VerifiedBadge size="sm" />}
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
              <span>{formatViews(video.views)} views</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface VideoSectionProps {
  title: string;
  icon: React.ReactNode;
  videos: typeof forYouVideos;
  size?: 'large' | 'medium';
}

function VideoSection({ title, icon, videos, size = 'medium' }: VideoSectionProps) {
  if (videos.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="font-semibold text-foreground">{title}</h2>
        </div>
        <button className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors">
          See all
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} size={size} />
        ))}
      </div>
    </section>
  );
}

export default function VideoHub() {
  const { t } = useTranslation();

  return (
    <AppLayout title="Videos">
      <div className="py-4 space-y-6">
        {/* For You Section */}
        <VideoSection
          title="For you right now"
          icon={<Compass className="h-5 w-5 text-primary" />}
          videos={forYouVideos}
          size="large"
        />

        {/* Creators You Follow */}
        <VideoSection
          title="Creators you follow"
          icon={<Users className="h-5 w-5 text-emerald-400" />}
          videos={followingVideos}
        />

        {/* Deep Dives */}
        <VideoSection
          title="Deep dives"
          icon={<BookOpen className="h-5 w-5 text-accent" />}
          videos={deepDives}
          size="large"
        />

        {/* Reflection Panel Prompt */}
        <div className="px-4">
          <Card className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground text-sm">Reflection space</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  After watching, take a moment to reflect. What resonated with you?
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
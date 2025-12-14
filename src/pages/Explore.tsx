import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search as SearchIcon, Compass, Heart, Brain, Battery, Sunrise, Shield, ChevronRight, BadgeCheck } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { cn } from '@/lib/utils';

// Wellbeing paths - guided discovery journeys
const wellbeingPaths = [
  {
    id: 'anxiety',
    title: 'Managing Anxiety',
    description: 'Understand and cope with anxious thoughts',
    icon: Brain,
    color: 'from-blue-500/20 to-primary/20',
    borderColor: 'border-primary/30',
    iconColor: 'text-primary',
    posts: 124,
  },
  {
    id: 'burnout',
    title: 'Burnout Recovery',
    description: 'Rest, reset, and rebuild your energy',
    icon: Battery,
    color: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/30',
    iconColor: 'text-amber-400',
    posts: 89,
  },
  {
    id: 'recovery',
    title: 'Recovery Journey',
    description: 'Stories of healing and hope',
    icon: Sunrise,
    color: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/30',
    iconColor: 'text-emerald-400',
    posts: 156,
  },
  {
    id: 'selfcare',
    title: 'Daily Self-Care',
    description: 'Small practices for big impact',
    icon: Heart,
    color: 'from-rose-500/20 to-pink-500/20',
    borderColor: 'border-rose-500/30',
    iconColor: 'text-rose-400',
    posts: 203,
  },
];

// Featured verified accounts
const verifiedCreators = [
  {
    name: 'Dr. Sarah Mitchell',
    handle: 'drsarah',
    avatar: '',
    bio: 'Clinical psychologist sharing evidence-based mental health tips',
    isVerified: true,
    specialty: 'Anxiety & CBT',
  },
  {
    name: 'Wellness Academy',
    handle: 'wellnessacademy',
    avatar: '',
    bio: 'Educational content for mental health awareness',
    isVerified: true,
    specialty: 'Education',
  },
  {
    name: 'Mental Health Foundation',
    handle: 'mhfoundation',
    avatar: '',
    bio: 'Promoting mental health for all',
    isVerified: true,
    specialty: 'Advocacy',
  },
];

// Topic categories
const topicCategories = [
  { name: 'Anxiety', count: 2340 },
  { name: 'Depression', count: 1892 },
  { name: 'Mindfulness', count: 1567 },
  { name: 'Self-care', count: 1456 },
  { name: 'Recovery', count: 1234 },
  { name: 'Relationships', count: 987 },
  { name: 'Work-life', count: 876 },
  { name: 'Sleep', count: 765 },
];

export default function Explore() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <AppLayout title={t('nav.explore')}>
      <div className="p-4 space-y-6">
        {/* Search Input */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search topics, creators, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary border-none h-11"
          />
        </div>

        {/* Wellbeing Paths */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Wellbeing Paths</h2>
          </div>
          <p className="text-sm text-muted-foreground -mt-1">
            Guided journeys for your mental health
          </p>
          <div className="grid gap-3">
            {wellbeingPaths.map((path) => (
              <Card
                key={path.id}
                className={cn(
                  'p-4 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]',
                  'bg-gradient-to-r border',
                  path.color,
                  path.borderColor
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-background/50">
                    <path.icon className={cn('h-6 w-6', path.iconColor)} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{path.title}</h3>
                    <p className="text-sm text-muted-foreground">{path.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">{path.posts} posts</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground mt-1 ml-auto" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Verified Creators */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-verified" />
              <h2 className="font-semibold text-foreground">Verified Creators</h2>
            </div>
            <button className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              See all
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2">
            {verifiedCreators.map((creator) => (
              <Card
                key={creator.handle}
                className="p-3 cursor-pointer hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={creator.avatar} alt={creator.name} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      {creator.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-foreground truncate">{creator.name}</span>
                      <VerifiedBadge size="sm" />
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{creator.bio}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    {creator.specialty}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Topics Grid */}
        <section className="space-y-3">
          <h2 className="font-semibold text-foreground">Browse Topics</h2>
          <div className="flex flex-wrap gap-2">
            {topicCategories.map((topic) => (
              <Badge
                key={topic.name}
                variant="secondary"
                className="cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors py-1.5 px-3"
              >
                #{topic.name}
                <span className="ml-1.5 text-muted-foreground text-xs">
                  {topic.count.toLocaleString()}
                </span>
              </Badge>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, TrendingUp, Users, Hash, Flame, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/AppLayout';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { Hashtag } from '@/components/Hashtag';
import { cn } from '@/lib/utils';

// Trending hashtags with post counts
const trendingHashtags = [
  { tag: 'mentalhealth', posts: 234500, trending: true },
  { tag: 'selfcare', posts: 189200, trending: true },
  { tag: 'anxiety', posts: 156800, trending: false },
  { tag: 'recovery', posts: 134500, trending: true },
  { tag: 'mindfulness', posts: 98700, trending: false },
  { tag: 'therapy', posts: 87600, trending: true },
  { tag: 'wellness', posts: 76500, trending: false },
  { tag: 'motivation', posts: 65400, trending: true },
  { tag: 'depression', posts: 54300, trending: false },
  { tag: 'healing', posts: 43200, trending: true },
];

// Suggested accounts
const suggestedAccounts = [
  { name: 'Dr. Sarah Mitchell', handle: 'drsarah', avatar: '', isVerified: true, followers: 125000, bio: 'Clinical psychologist | CBT specialist' },
  { name: 'Wellness Academy', handle: 'wellnessacademy', avatar: '', isVerified: true, followers: 89000, bio: 'Mental health education' },
  { name: 'Mind Matters', handle: 'mindmatters', avatar: '', isVerified: true, followers: 67000, bio: 'Daily mental health tips' },
  { name: 'Jamie\'s Journey', handle: 'jamiejourney', avatar: '', isVerified: false, followers: 45000, bio: 'Recovery advocate | Speaker' },
];

// Explore grid content
const exploreContent = [
  { id: '1', type: 'image', url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop', likes: 12400 },
  { id: '2', type: 'video', url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=400&fit=crop', views: 45600 },
  { id: '3', type: 'image', url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=400&fit=crop', likes: 8900 },
  { id: '4', type: 'image', url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=400&fit=crop', likes: 23400 },
  { id: '5', type: 'video', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', views: 67800 },
  { id: '6', type: 'image', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop', likes: 15600 },
  { id: '7', type: 'image', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop', likes: 9800 },
  { id: '8', type: 'video', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop', views: 34500 },
  { id: '9', type: 'image', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop', likes: 18700 },
];

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export default function Explore() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('tag') || '');
  const [activeTab, setActiveTab] = useState('foryou');

  return (
    <AppLayout title={t('nav.explore')}>
      <div className="flex flex-col">
        {/* Search Input */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur p-3 border-b border-border">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-none h-10 rounded-xl"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-transparent border-b border-border rounded-none h-12 p-0 justify-start gap-0">
            <TabsTrigger 
              value="foryou" 
              className="flex-1 rounded-none h-full data-[state=active]:border-b-2 data-[state=active]:border-foreground data-[state=active]:bg-transparent font-semibold"
            >
              For You
            </TabsTrigger>
            <TabsTrigger 
              value="trending" 
              className="flex-1 rounded-none h-full data-[state=active]:border-b-2 data-[state=active]:border-foreground data-[state=active]:bg-transparent font-semibold"
            >
              Trending
            </TabsTrigger>
            <TabsTrigger 
              value="accounts" 
              className="flex-1 rounded-none h-full data-[state=active]:border-b-2 data-[state=active]:border-foreground data-[state=active]:bg-transparent font-semibold"
            >
              Accounts
            </TabsTrigger>
          </TabsList>

          {/* For You - Grid View */}
          <TabsContent value="foryou" className="mt-0">
            <div className="grid grid-cols-3 gap-0.5">
              {exploreContent.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="aspect-square relative group cursor-pointer overflow-hidden"
                >
                  <img 
                    src={item.url} 
                    alt="" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.type === 'video' && (
                    <div className="absolute top-2 right-2 bg-black/60 rounded px-1.5 py-0.5">
                      <span className="text-white text-xs font-medium">{formatCount(item.views)}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Trending Hashtags */}
          <TabsContent value="trending" className="mt-0 p-3 space-y-4">
            {/* Top trending */}
            <div className="space-y-2">
              {trendingHashtags.map((item, index) => (
                <motion.div
                  key={item.tag}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-3 hover:bg-card/80 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center',
                        item.trending ? 'bg-rose-500/10' : 'bg-primary/10'
                      )}>
                        {item.trending ? (
                          <Flame className="h-5 w-5 text-rose-500" />
                        ) : (
                          <Hash className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">#{item.tag}</p>
                        <p className="text-sm text-muted-foreground">{formatCount(item.posts)} posts</p>
                      </div>
                      {item.trending && (
                        <div className="flex items-center gap-1 text-rose-500 text-xs font-medium">
                          <TrendingUp className="h-3 w-3" />
                          Trending
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Suggested Accounts */}
          <TabsContent value="accounts" className="mt-0 p-3 space-y-2">
            {suggestedAccounts.map((account, index) => (
              <motion.div
                key={account.handle}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-3 hover:bg-card/80 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                      <AvatarImage src={account.avatar} alt={account.name} />
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        {account.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground truncate">{account.name}</span>
                        {account.isVerified && <VerifiedBadge size="sm" />}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">@{account.handle}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatCount(account.followers)} followers</p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Follow
                    </motion.button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
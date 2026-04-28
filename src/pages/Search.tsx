import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search as SearchIcon, Hash, Users } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { EraVerifiedTick } from '@/components/EraVerifiedTick';

const trendingTags = [
  { name: 'Self-care', count: 2340 },
  { name: 'Anxiety', count: 1892 },
  { name: 'Mindfulness', count: 1567 },
  { name: 'Recovery', count: 1234 },
  { name: 'Support', count: 987 },
  { name: 'Depression', count: 876 },
  { name: 'Wellness', count: 765 },
];

const suggestedAccounts = [
  { name: 'Mind Matters', handle: 'mindmatters', isVerified: true, email: undefined },
  { name: 'Therapy Tips', handle: 'therapytips', isVerified: true, email: undefined },
  { name: 'Community Care', handle: 'communitycare', isVerified: false, email: undefined },
  { name: 'Wellness Daily', handle: 'wellnessdaily', isVerified: true, email: undefined },
];

export default function Search() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  return (
    <AppLayout title={t('nav.explore')}>
      <div className="p-4 space-y-6">
        {/* Search Input */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary border-none"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-secondary">
            <TabsTrigger value="all" className="flex-1 text-label">All</TabsTrigger>
            <TabsTrigger value="accounts" className="flex-1 text-label">Accounts</TabsTrigger>
            <TabsTrigger value="tags" className="flex-1 text-label">Tags</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Trending Tags */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Hash className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Trending Topics</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map((tag) => (
              <Badge
                key={tag.name}
                variant="secondary"
                className="cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors"
              >
                #{tag.name}
                <span className="ml-1 text-muted-foreground text-label">
                  {tag.count.toLocaleString()}
                </span>
              </Badge>
            ))}
          </div>
        </section>

        {/* Suggested Accounts */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Suggested Accounts</h2>
          </div>
          <div className="space-y-3">
            {suggestedAccounts.map((account) => (
              <div
                key={account.handle}
                className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors cursor-pointer"
              >
                <Avatar size="md">
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {account.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-foreground">{account.name}</span>
                    {account.isVerified && <EraVerifiedTick size="sm" userEmail={account.email} />}
                  </div>
                  <p className="text-body text-muted-foreground">@{account.handle}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

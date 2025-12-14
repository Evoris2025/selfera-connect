import { ChevronRight } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface SuggestedProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  isVerified?: boolean;
}

const mockSuggestions: SuggestedProfile[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    handle: 'sarahc',
    avatar: '',
    bio: 'Mental health advocate',
    isVerified: true,
  },
  {
    id: '2',
    name: 'Mind Matters',
    handle: 'mindmatters',
    avatar: '',
    bio: 'Daily wellness tips',
    isVerified: true,
  },
  {
    id: '3',
    name: 'James Wilson',
    handle: 'jwilson',
    avatar: '',
    bio: 'Sharing my journey',
  },
  {
    id: '4',
    name: 'Wellness Hub',
    handle: 'wellnesshub',
    avatar: '',
    bio: 'Your daily dose of calm',
    isVerified: true,
  },
  {
    id: '5',
    name: 'Emma Roberts',
    handle: 'emmar',
    avatar: '',
    bio: 'Mindfulness coach',
  },
];

export function DiscoverRow() {
  const navigate = useNavigate();

  return (
    <div className="py-4">
      <div className="flex items-center justify-between px-4 mb-3">
        <h3 className="text-sm font-semibold text-foreground">Discover People</h3>
        <button 
          className="text-xs text-primary flex items-center gap-0.5"
          onClick={() => navigate('/directory')}
        >
          See all
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
      
      <ScrollArea className="w-full">
        <div className="flex gap-3 px-4 pb-2">
          {mockSuggestions.map((profile) => (
            <div
              key={profile.id}
              className="flex-shrink-0 w-36 bg-card border border-border rounded-xl p-3 flex flex-col items-center text-center"
            >
              <Avatar className="h-14 w-14 mb-2">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback className="bg-secondary text-secondary-foreground text-lg">
                  {profile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <p className="text-sm font-medium text-foreground truncate w-full">
                {profile.name}
              </p>
              <p className="text-xs text-muted-foreground truncate w-full mb-2">
                @{profile.handle}
              </p>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full h-7 text-xs"
                onClick={() => navigate(`/profile/${profile.handle}`)}
              >
                Follow
              </Button>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

import { Plus, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface Story {
  id: string;
  userName: string;
  userAvatar: string;
  thumbnailUrl: string;
  hasUnseenStory: boolean;
}

// Mock stories data
const mockStories: Story[] = [
  {
    id: '1',
    userName: 'Jennifer Love Hewitt',
    userAvatar: '',
    thumbnailUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=300&fit=crop',
    hasUnseenStory: true,
  },
  {
    id: '2',
    userName: "Cody's collaborations",
    userAvatar: '',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=300&fit=crop',
    hasUnseenStory: true,
  },
  {
    id: '3',
    userName: 'Amy Fell',
    userAvatar: '',
    thumbnailUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=300&fit=crop',
    hasUnseenStory: true,
  },
  {
    id: '4',
    userName: 'Trent Mitchel Livori',
    userAvatar: '',
    thumbnailUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=300&fit=crop',
    hasUnseenStory: false,
  },
  {
    id: '5',
    userName: 'Donna Karen',
    userAvatar: '',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=300&fit=crop',
    hasUnseenStory: true,
  },
];

export function StoriesRow() {
  const { user } = useAuth();
  const displayName = user?.email?.split('@')[0] || 'You';
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative">
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          {/* Create Story Card */}
          <div className="flex-shrink-0 w-[110px]">
            <div className="relative h-[160px] rounded-xl overflow-hidden bg-secondary">
              {/* User's image as background */}
              <div className="absolute inset-0 bg-gradient-to-b from-secondary to-secondary/50 flex items-center justify-center">
                <span className="text-4xl font-semibold text-secondary-foreground/30">
                  {userInitial}
                </span>
              </div>
              
              {/* Bottom section */}
              <div className="absolute bottom-0 left-0 right-0 bg-card pt-5 pb-2 px-2">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center ring-4 ring-card">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                </div>
                <p className="text-xs text-center text-foreground font-medium mt-1">
                  Create story
                </p>
              </div>
            </div>
          </div>

          {/* Story Cards */}
          {mockStories.map((story) => (
            <button
              key={story.id}
              className="flex-shrink-0 w-[110px] group"
            >
              <div className="relative h-[160px] rounded-xl overflow-hidden">
                {/* Story thumbnail */}
                <img
                  src={story.thumbnailUrl}
                  alt={story.userName}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
                
                {/* User avatar with gradient ring */}
                <div className="absolute top-2 left-2">
                  <div className={`w-10 h-10 rounded-full p-[2px] ${story.hasUnseenStory ? 'gradient-brand' : 'bg-muted'}`}>
                    <div className="w-full h-full rounded-full bg-card p-[2px]">
                      <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                        {story.userAvatar ? (
                          <img
                            src={story.userAvatar}
                            alt={story.userName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-medium text-secondary-foreground">
                            {story.userName.charAt(0)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Username */}
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-xs text-white font-medium line-clamp-2 leading-tight">
                    {story.userName}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>

      {/* Right scroll indicator */}
      <button className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/90 backdrop-blur flex items-center justify-center shadow-lg hover:bg-card transition-colors">
        <ChevronRight className="h-5 w-5 text-foreground" />
      </button>
    </div>
  );
}

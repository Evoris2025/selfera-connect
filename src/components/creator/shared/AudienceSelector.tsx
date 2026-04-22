import { Globe, Users, Lock, UserCog, Heart } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { FeedAudience } from '@/components/feed/CrossroadFeed';

export type StudioAudience = FeedAudience;

interface AudienceOption {
  value: StudioAudience;
  label: string;
  description: string;
  icon: typeof Globe;
}

const OPTIONS: AudienceOption[] = [
  { value: 'public', label: 'Public', description: 'Anyone on SelfERA', icon: Globe },
  { value: 'followers', label: 'Followers', description: 'People who follow you', icon: Users },
  { value: 'close_friends', label: 'Close friends', description: 'Your close-friends list', icon: Heart },
  { value: 'only_me', label: 'Only me', description: 'Hidden from everyone else', icon: Lock },
  { value: 'custom', label: 'Specific people', description: 'Choose who can see this', icon: UserCog },
];

interface AudienceSelectorProps {
  value: StudioAudience;
  onChange: (value: StudioAudience) => void;
  /** Hide audience options that don't apply (e.g. hide 'custom' for Expressions). */
  excludes?: StudioAudience[];
  size?: 'sm' | 'default';
}

export function AudienceSelector({ value, onChange, excludes = [], size = 'sm' }: AudienceSelectorProps) {
  const options = OPTIONS.filter(o => !excludes.includes(o.value));
  const current = options.find(o => o.value === value) ?? options[0];
  const Icon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size} className="gap-2">
          <Icon className="h-4 w-4" />
          {current.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {options.map(opt => {
          const ItemIcon = opt.icon;
          return (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className="flex items-start gap-3 py-2"
            >
              <ItemIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{opt.label}</span>
                <span className="text-xs text-muted-foreground">{opt.description}</span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

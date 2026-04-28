import { Globe, Users, Lock, UserCog, Heart, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
  /** 'outline' renders a bordered button (default). 'ghost' renders a subtle inline chip. */
  variant?: 'outline' | 'ghost';
}

export function AudienceSelector({ value, onChange, excludes = [], size = 'sm', variant = 'outline' }: AudienceSelectorProps) {
  const options = OPTIONS.filter(o => !excludes.includes(o.value));
  const current = options.find(o => o.value === value) ?? options[0];
  const Icon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === 'ghost' ? (
          <button
            type="button"
            className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-label',
              'bg-white/5 hover:bg-white/10 text-foreground/70 hover:text-foreground transition'
            )}
          >
            <Icon className="h-3 w-3" />
            <span>{current.label}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>
        ) : (
          <Button variant="outline" size={size} className="gap-2">
            <Icon className="h-4 w-4" />
            {current.label}
          </Button>
        )}
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
                <span className="text-body font-medium">{opt.label}</span>
                <span className="text-label text-muted-foreground">{opt.description}</span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

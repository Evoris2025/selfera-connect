import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { FeedCustomAudience } from '@/components/feed/CrossroadFeed';

const mockUsers = [
  { id: 'u1', name: 'Sarah Chen', handle: 'sarahc', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop' },
  { id: 'u2', name: 'James Wilson', handle: 'jwilson', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop' },
  { id: 'u3', name: 'Emma Roberts', handle: 'emmar', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop' },
  { id: 'u4', name: 'Alex Turner', handle: 'alext', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop' },
  { id: 'u5', name: 'Marcus J.', handle: 'marcusj', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop' },
  { id: 'u6', name: 'Donna L.', handle: 'donnal', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop' },
];

interface CustomAudienceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: FeedCustomAudience;
  onSave: (next: FeedCustomAudience) => void;
}

export function CustomAudienceDialog({ open, onOpenChange, value, onSave }: CustomAudienceDialogProps) {
  const [mode, setMode] = useState<'include' | 'exclude'>('include');
  const [include, setInclude] = useState<string[]>(value.include);
  const [exclude, setExclude] = useState<string[]>(value.exclude);
  const [search, setSearch] = useState('');

  const list = mode === 'include' ? include : exclude;
  const setList = mode === 'include' ? setInclude : setExclude;
  const toggle = (id: string) => setList(list.includes(id) ? list.filter(x => x !== id) : [...list, id]);

  const filtered = mockUsers.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.handle.includes(search.toLowerCase())
  );

  const handleSave = () => {
    onSave({ include, exclude });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Specific people</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2">
          <Button size="sm" variant={mode === 'include' ? 'default' : 'outline'} onClick={() => setMode('include')} className="flex-1">
            Include ({include.length})
          </Button>
          <Button size="sm" variant={mode === 'exclude' ? 'default' : 'outline'} onClick={() => setMode('exclude')} className="flex-1">
            Except ({exclude.length})
          </Button>
        </div>
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search people…" />
        <div className="max-h-72 overflow-y-auto -mx-1 space-y-1">
          {filtered.map(u => {
            const checked = list.includes(u.id);
            return (
              <button
                key={u.id}
                onClick={() => toggle(u.id)}
                className={cn(
                  'w-full flex items-center gap-3 p-2 rounded-lg text-left transition',
                  checked ? 'bg-primary/10' : 'hover:bg-secondary'
                )}
              >
                <Avatar size="sm">
                  <AvatarImage src={u.avatar} alt={u.name} />
                  <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-body font-medium truncate">{u.name}</p>
                  <p className="text-label text-muted-foreground truncate">@{u.handle}</p>
                </div>
                <div className={cn(
                  'h-5 w-5 rounded-full border-2 flex items-center justify-center',
                  checked ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                )}>
                  {checked && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
                </div>
              </button>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

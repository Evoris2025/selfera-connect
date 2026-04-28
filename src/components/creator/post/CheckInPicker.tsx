import { useState } from 'react';
import { MapPin, Search, X, Loader2, Coffee, Building2, Trees, Plane } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { FeedCheckIn } from '@/components/feed/CrossroadFeed';

const mockPlaces: FeedCheckIn[] = [
  { placeId: 'p1', name: 'Blue Bottle Coffee', category: 'Cafe' },
  { placeId: 'p2', name: 'Central Park', category: 'Park' },
  { placeId: 'p3', name: 'Equinox Gym', category: 'Fitness' },
  { placeId: 'p4', name: 'JFK Airport', category: 'Airport' },
  { placeId: 'p5', name: 'The Yoga Studio', category: 'Wellness' },
  { placeId: 'p6', name: 'Whole Foods Market', category: 'Grocery' },
];

const categoryIcon = (cat?: string) => {
  switch ((cat || '').toLowerCase()) {
    case 'cafe': return Coffee;
    case 'park': return Trees;
    case 'airport': return Plane;
    default: return Building2;
  }
};

interface CheckInPickerProps {
  value: FeedCheckIn | null;
  onChange: (value: FeedCheckIn | null) => void;
}

export function CheckInPicker({ value, onChange }: CheckInPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<FeedCheckIn[]>([]);

  const handleSearch = (q: string) => {
    setSearch(q);
    if (q.length < 2) { setResults([]); return; }
    setSearching(true);
    setTimeout(() => {
      setResults(mockPlaces.filter(p =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(q.toLowerCase())
      ));
      setSearching(false);
    }, 250);
  };

  if (value) {
    const Icon = categoryIcon(value.category);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-body"
      >
        <Icon className="h-3.5 w-3.5 text-emerald-500" />
        <span className="font-medium">at {value.name}</span>
        {value.category && <span className="text-muted-foreground">· {value.category}</span>}
        <button onClick={() => onChange(null)} className="ml-1 p-0.5 rounded-full hover:bg-emerald-500/20">
          <X className="h-3 w-3" />
        </button>
      </motion.div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
          <MapPin className="h-4 w-4" />
          Check in
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Where are you?"
              className="pl-8"
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto p-2">
          {searching && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {!searching && (results.length > 0 ? results : mockPlaces.slice(0, 5)).map(place => {
            const Icon = categoryIcon(place.category);
            return (
              <button
                key={place.placeId}
                onClick={() => { onChange(place); setOpen(false); setSearch(''); }}
                className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-secondary text-left"
              >
                <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-body font-medium">{place.name}</p>
                  {place.category && <p className="text-label text-muted-foreground">{place.category}</p>}
                </div>
              </button>
            );
          })}
          {!searching && search.length >= 2 && results.length === 0 && (
            <div className="py-4 text-center text-body text-muted-foreground">No places found</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

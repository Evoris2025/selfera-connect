import { useState } from 'react';
import { MapPin, X, Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface Location {
  name: string;
  address?: string;
}

interface LocationPickerProps {
  value: Location | null;
  onChange: (value: Location | null) => void;
}

// Mock locations for simulation mode
const mockLocations: Location[] = [
  { name: 'Central Park', address: 'New York, NY' },
  { name: 'Golden Gate Bridge', address: 'San Francisco, CA' },
  { name: 'Times Square', address: 'New York, NY' },
  { name: 'Santa Monica Pier', address: 'Santa Monica, CA' },
  { name: 'The Bean', address: 'Chicago, IL' },
  { name: 'Space Needle', address: 'Seattle, WA' },
  { name: 'Venice Beach', address: 'Los Angeles, CA' },
  { name: 'Brooklyn Bridge', address: 'New York, NY' },
];

const recentLocations: Location[] = [
  { name: 'Home', address: 'My neighborhood' },
  { name: 'Coffee Shop', address: 'Downtown' },
];

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Location[]>([]);

  const handleSearch = (query: string) => {
    setSearch(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    // Simulate search delay
    setIsSearching(true);
    setTimeout(() => {
      const filtered = mockLocations.filter(
        (loc) =>
          loc.name.toLowerCase().includes(query.toLowerCase()) ||
          loc.address?.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
      setIsSearching(false);
    }, 300);
  };

  const handleSelect = (location: Location) => {
    onChange(location);
    setOpen(false);
    setSearch('');
    setSearchResults([]);
  };

  const handleRemove = () => {
    onChange(null);
  };

  if (value) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-sm"
      >
        <MapPin className="h-3.5 w-3.5 text-primary" />
        <span className="font-medium">{value.name}</span>
        {value.address && (
          <span className="text-muted-foreground">· {value.address}</span>
        )}
        <button
          onClick={handleRemove}
          className="ml-1 p-0.5 rounded-full hover:bg-primary/20 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      </motion.div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <MapPin className="h-4 w-4" />
          Location
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        {/* Search */}
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search locations..."
              className="pl-8"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto">
          {/* Loading */}
          {isSearching && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Search Results */}
          {!isSearching && searchResults.length > 0 && (
            <div className="p-2">
              {searchResults.map((location, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(location)}
                  className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-secondary transition-colors text-left"
                >
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{location.name}</p>
                    {location.address && (
                      <p className="text-xs text-muted-foreground">{location.address}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isSearching && search.length >= 2 && searchResults.length === 0 && (
            <div className="py-4 text-center text-sm text-muted-foreground">
              No locations found
            </div>
          )}

          {/* Recent Locations */}
          {!isSearching && search.length < 2 && (
            <div className="p-2">
              <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Recent
              </p>
              {recentLocations.map((location, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(location)}
                  className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-secondary transition-colors text-left"
                >
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{location.name}</p>
                    {location.address && (
                      <p className="text-xs text-muted-foreground">{location.address}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

import { useState, useCallback } from 'react';
import { Search, Loader2, X, ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface GifData {
  id: string;
  url: string;
  previewUrl: string;
  width: number;
  height: number;
  title: string;
}

interface GifPickerProps {
  onSelect: (gif: GifData) => void;
}

// Mock GIF data for simulation mode
const mockGifs: GifData[] = [
  { id: '1', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200', previewUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100', width: 200, height: 200, title: 'Cat' },
  { id: '2', url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200', previewUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100', width: 200, height: 200, title: 'Dog' },
  { id: '3', url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200', previewUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100', width: 200, height: 200, title: 'Puppy' },
  { id: '4', url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200', previewUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=100', width: 200, height: 200, title: 'Kitten' },
  { id: '5', url: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=200', previewUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=100', width: 200, height: 200, title: 'Happy dog' },
  { id: '6', url: 'https://images.unsplash.com/photo-1501820488136-72669149e0d4?w=200', previewUrl: 'https://images.unsplash.com/photo-1501820488136-72669149e0d4?w=100', width: 200, height: 200, title: 'Cute' },
  { id: '7', url: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=200', previewUrl: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=100', width: 200, height: 200, title: 'Funny' },
  { id: '8', url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200', previewUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=100', width: 200, height: 200, title: 'Joy' },
];

const trendingCategories = [
  'Trending',
  'Reactions',
  'Thank You',
  'Celebrate',
  'Love',
  'Happy',
  'Sad',
  'Agree',
];

export function GifPicker({ onSelect }: GifPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [gifs, setGifs] = useState<GifData[]>(mockGifs);
  const [activeCategory, setActiveCategory] = useState('Trending');

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
    
    if (query.length < 2) {
      setGifs(mockGifs);
      return;
    }

    // Simulate search
    setIsSearching(true);
    setTimeout(() => {
      const filtered = mockGifs.filter((gif) =>
        gif.title.toLowerCase().includes(query.toLowerCase())
      );
      setGifs(filtered.length > 0 ? filtered : mockGifs);
      setIsSearching(false);
    }, 300);
  }, []);

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    setSearch('');
    // In real implementation, fetch GIFs for this category
    setGifs(mockGifs);
  };

  const handleSelect = (gif: GifData) => {
    onSelect(gif);
    setOpen(false);
    setSearch('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ImageIcon className="h-4 w-4" />
          GIF
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        {/* Search */}
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search GIFs..."
              className="pl-8"
              autoFocus
            />
          </div>
        </div>

        {/* Categories */}
        <div className="p-2 border-b border-border overflow-x-auto">
          <div className="flex gap-1.5">
            {trendingCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={cn(
                  'px-3 py-1 rounded-full text-label font-medium whitespace-nowrap transition-colors',
                  activeCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* GIF Grid */}
        <div className="p-2 max-h-64 overflow-y-auto">
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : gifs.length === 0 ? (
            <div className="py-8 text-center text-body text-muted-foreground">
              No GIFs found
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {gifs.map((gif) => (
                <motion.button
                  key={gif.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelect(gif)}
                  className="aspect-square rounded-lg overflow-hidden bg-secondary"
                >
                  <img
                    src={gif.previewUrl}
                    alt={gif.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Attribution */}
        <div className="p-2 border-t border-border">
          <p className="text-label text-muted-foreground text-center">
            Powered by GIPHY
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

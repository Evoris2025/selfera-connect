import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Play, Pause, Music, Volume2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface Sound {
  id: string;
  name: string;
  artist: string;
  category: string;
  duration: number; // in seconds
  previewUrl?: string; // Optional - for MVP we'll simulate playback
}

// Royalty-free sound library for wellness theme
const soundLibrary: Sound[] = [
  // Ambient
  { id: 'a1', name: 'Ocean Waves', artist: 'Nature Sounds', category: 'Ambient', duration: 30 },
  { id: 'a2', name: 'Rain on Window', artist: 'Calm Studios', category: 'Ambient', duration: 30 },
  { id: 'a3', name: 'Forest Birds', artist: 'Nature Sounds', category: 'Ambient', duration: 30 },
  { id: 'a4', name: 'Gentle Stream', artist: 'Zen Collection', category: 'Ambient', duration: 30 },
  { id: 'a5', name: 'Wind Chimes', artist: 'Meditation Mix', category: 'Ambient', duration: 30 },
  
  // Meditation
  { id: 'm1', name: 'Tibetan Bowls', artist: 'Zen Masters', category: 'Meditation', duration: 45 },
  { id: 'm2', name: 'Om Chanting', artist: 'Sacred Sounds', category: 'Meditation', duration: 60 },
  { id: 'm3', name: 'Healing Frequency', artist: 'Wellness Audio', category: 'Meditation', duration: 45 },
  { id: 'm4', name: 'Deep Breathing', artist: 'Mindful Moments', category: 'Meditation', duration: 30 },
  
  // Lo-Fi
  { id: 'l1', name: 'Study Beats', artist: 'Lo-Fi Hip Hop', category: 'Lo-Fi', duration: 30 },
  { id: 'l2', name: 'Chill Vibes', artist: 'Relaxation Station', category: 'Lo-Fi', duration: 30 },
  { id: 'l3', name: 'Cozy Afternoon', artist: 'Lo-Fi Dreams', category: 'Lo-Fi', duration: 30 },
  
  // Uplifting
  { id: 'u1', name: 'Morning Motivation', artist: 'Positive Energy', category: 'Uplifting', duration: 30 },
  { id: 'u2', name: 'New Beginnings', artist: 'Inspire Audio', category: 'Uplifting', duration: 30 },
  { id: 'u3', name: 'Rise & Shine', artist: 'Wellness Beats', category: 'Uplifting', duration: 30 },
];

const categories = ['All', 'Trending', 'Ambient', 'Meditation', 'Lo-Fi', 'Uplifting'];

interface SoundPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (sound: Sound) => void;
  selectedSound?: Sound | null;
}

export function SoundPicker({ isOpen, onClose, onSelect, selectedSound }: SoundPickerProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [volume, setVolume] = useState([75]);
  
  // Simulate audio playback (no actual audio files in MVP)
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const filteredSounds = soundLibrary.filter((sound) => {
    const matchesCategory = activeCategory === 'All' || 
      activeCategory === 'Trending' || 
      sound.category === activeCategory;
    const matchesSearch = search === '' || 
      sound.name.toLowerCase().includes(search.toLowerCase()) ||
      sound.artist.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const togglePlay = (soundId: string) => {
    if (playingId === soundId) {
      setPlayingId(null);
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    } else {
      setPlayingId(soundId);
      if (navigator.vibrate) navigator.vibrate(10);
      
      // Simulate playback stopping after 3 seconds (preview)
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
      playIntervalRef.current = setTimeout(() => {
        setPlayingId(null);
      }, 3000);
    }
  };

  const handleSelect = (sound: Sound) => {
    onSelect(sound);
    setPlayingId(null);
    if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="absolute inset-x-0 bottom-0 bg-background/95 backdrop-blur-xl border-t border-border rounded-t-3xl z-50"
          style={{ height: '60vh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Add Sound</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sounds..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Volume Control */}
          <div className="px-4 pb-3 flex items-center gap-3">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-8">{volume}%</span>
          </div>

          {/* Categories */}
          <div className="px-3 pb-2">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all",
                    activeCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Sound List */}
          <ScrollArea className="flex-1 h-[calc(60vh-220px)]">
            <div className="p-3 space-y-2">
              {filteredSounds.map((sound) => (
                <motion.div
                  key={sound.id}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-all",
                    selectedSound?.id === sound.id
                      ? "bg-primary/10 border border-primary/30"
                      : "bg-secondary/50 hover:bg-secondary"
                  )}
                >
                  {/* Play/Pause Button */}
                  <button
                    onClick={() => togglePlay(sound.id)}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all",
                      playingId === sound.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    {playingId === sound.id ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5 fill-current" />
                    )}
                  </button>

                  {/* Sound Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{sound.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{sound.artist}</p>
                  </div>

                  {/* Duration */}
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatDuration(sound.duration)}
                  </span>

                  {/* Select Button */}
                  <Button
                    size="sm"
                    variant={selectedSound?.id === sound.id ? "default" : "outline"}
                    onClick={() => handleSelect(sound)}
                    className="shrink-0"
                  >
                    {selectedSound?.id === sound.id ? 'Selected' : 'Use'}
                  </Button>
                </motion.div>
              ))}
            </div>
          </ScrollArea>

          {/* Selected Sound Footer */}
          {selectedSound && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border-t border-border bg-primary/5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Music className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{selectedSound.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedSound.artist}</p>
                  </div>
                </div>
                <Button onClick={onClose} size="sm">
                  Done
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

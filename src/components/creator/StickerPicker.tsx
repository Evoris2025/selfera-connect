import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface Sticker {
  id: string;
  emoji: string;
  category: string;
  keywords: string[];
}

// Curated sticker library - emoji-based for now (no external dependencies)
const stickerLibrary: Sticker[] = [
  // Emotions
  { id: 's1', emoji: '😊', category: 'Emotions', keywords: ['happy', 'smile', 'joy'] },
  { id: 's2', emoji: '😢', category: 'Emotions', keywords: ['sad', 'cry', 'tears'] },
  { id: 's3', emoji: '😍', category: 'Emotions', keywords: ['love', 'heart', 'adore'] },
  { id: 's4', emoji: '🥰', category: 'Emotions', keywords: ['love', 'hearts', 'affection'] },
  { id: 's5', emoji: '😌', category: 'Emotions', keywords: ['calm', 'peaceful', 'relief'] },
  { id: 's6', emoji: '🤗', category: 'Emotions', keywords: ['hug', 'embrace', 'support'] },
  { id: 's7', emoji: '😤', category: 'Emotions', keywords: ['frustrated', 'angry', 'steam'] },
  { id: 's8', emoji: '🥺', category: 'Emotions', keywords: ['pleading', 'uwu', 'cute'] },
  
  // Wellness
  { id: 'w1', emoji: '🧘', category: 'Wellness', keywords: ['yoga', 'meditation', 'zen'] },
  { id: 'w2', emoji: '💪', category: 'Wellness', keywords: ['strong', 'workout', 'strength'] },
  { id: 'w3', emoji: '🌿', category: 'Wellness', keywords: ['nature', 'plant', 'growth'] },
  { id: 'w4', emoji: '☀️', category: 'Wellness', keywords: ['sun', 'bright', 'positive'] },
  { id: 'w5', emoji: '🌈', category: 'Wellness', keywords: ['rainbow', 'hope', 'pride'] },
  { id: 'w6', emoji: '✨', category: 'Wellness', keywords: ['sparkle', 'magic', 'special'] },
  { id: 'w7', emoji: '🦋', category: 'Wellness', keywords: ['butterfly', 'transform', 'change'] },
  { id: 'w8', emoji: '🌸', category: 'Wellness', keywords: ['flower', 'cherry', 'bloom'] },
  
  // Nature
  { id: 'n1', emoji: '🌊', category: 'Nature', keywords: ['wave', 'ocean', 'water'] },
  { id: 'n2', emoji: '🌲', category: 'Nature', keywords: ['tree', 'forest', 'nature'] },
  { id: 'n3', emoji: '🌙', category: 'Nature', keywords: ['moon', 'night', 'sleep'] },
  { id: 'n4', emoji: '⭐', category: 'Nature', keywords: ['star', 'shine', 'night'] },
  { id: 'n5', emoji: '🔥', category: 'Nature', keywords: ['fire', 'hot', 'lit'] },
  { id: 'n6', emoji: '❄️', category: 'Nature', keywords: ['snow', 'cold', 'winter'] },
  { id: 'n7', emoji: '🌻', category: 'Nature', keywords: ['sunflower', 'happy', 'yellow'] },
  { id: 'n8', emoji: '🍃', category: 'Nature', keywords: ['leaf', 'wind', 'nature'] },
  
  // Reactions
  { id: 'r1', emoji: '❤️', category: 'Reactions', keywords: ['heart', 'love', 'like'] },
  { id: 'r2', emoji: '💯', category: 'Reactions', keywords: ['hundred', 'perfect', 'yes'] },
  { id: 'r3', emoji: '👏', category: 'Reactions', keywords: ['clap', 'applause', 'congrats'] },
  { id: 'r4', emoji: '🙌', category: 'Reactions', keywords: ['celebrate', 'praise', 'hands'] },
  { id: 'r5', emoji: '💖', category: 'Reactions', keywords: ['sparkle heart', 'love', 'cute'] },
  { id: 'r6', emoji: '🤝', category: 'Reactions', keywords: ['handshake', 'agree', 'deal'] },
  { id: 'r7', emoji: '💫', category: 'Reactions', keywords: ['dizzy', 'star', 'amazing'] },
  { id: 'r8', emoji: '🎉', category: 'Reactions', keywords: ['party', 'celebrate', 'confetti'] },
];

const categories = ['All', 'Emotions', 'Wellness', 'Nature', 'Reactions'];

interface StickerPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (sticker: Sticker) => void;
}

export function StickerPicker({ isOpen, onClose, onSelect }: StickerPickerProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredStickers = stickerLibrary.filter((sticker) => {
    const matchesCategory = activeCategory === 'All' || sticker.category === activeCategory;
    const matchesSearch = search === '' || 
      sticker.keywords.some(k => k.toLowerCase().includes(search.toLowerCase())) ||
      sticker.emoji.includes(search);
    return matchesCategory && matchesSearch;
  });

  const handleSelect = (sticker: Sticker) => {
    onSelect(sticker);
    if (navigator.vibrate) navigator.vibrate(10);
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
          style={{ height: '50vh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold">Stickers</h3>
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
                placeholder="Search stickers..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="px-3 pb-2">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-body whitespace-nowrap transition-all",
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

          {/* Sticker Grid */}
          <ScrollArea className="flex-1 h-[calc(50vh-160px)]">
            <div className="grid grid-cols-6 gap-2 p-3">
              {filteredStickers.map((sticker) => (
                <motion.button
                  key={sticker.id}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSelect(sticker)}
                  className="aspect-square flex items-center justify-center text-3xl rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  {sticker.emoji}
                </motion.button>
              ))}
            </div>
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

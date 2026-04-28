import { useState } from 'react';
import { Smile, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface FeelingActivity {
  type: 'feeling' | 'activity';
  emoji: string;
  label: string;
}

interface FeelingActivityPickerProps {
  value: FeelingActivity | null;
  onChange: (value: FeelingActivity | null) => void;
}

const feelings = [
  { emoji: '😊', label: 'happy' },
  { emoji: '🥰', label: 'loved' },
  { emoji: '😌', label: 'relaxed' },
  { emoji: '🙏', label: 'grateful' },
  { emoji: '💪', label: 'motivated' },
  { emoji: '😔', label: 'sad' },
  { emoji: '😤', label: 'frustrated' },
  { emoji: '😰', label: 'anxious' },
  { emoji: '🤔', label: 'thoughtful' },
  { emoji: '😴', label: 'tired' },
  { emoji: '🤗', label: 'hopeful' },
  { emoji: '😎', label: 'confident' },
];

const activities = [
  { emoji: '🎧', label: 'Listening to' },
  { emoji: '📺', label: 'Watching' },
  { emoji: '📖', label: 'Reading' },
  { emoji: '🏃', label: 'Exercising' },
  { emoji: '🍽️', label: 'Eating' },
  { emoji: '☕', label: 'Drinking' },
  { emoji: '🎮', label: 'Playing' },
  { emoji: '✈️', label: 'Traveling to' },
  { emoji: '🎉', label: 'Celebrating' },
  { emoji: '💭', label: 'Thinking about' },
  { emoji: '🧘', label: 'Practicing' },
  { emoji: '📝', label: 'Working on' },
];

export function FeelingActivityPicker({ value, onChange }: FeelingActivityPickerProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'feeling' | 'activity'>('feeling');
  const [search, setSearch] = useState('');

  const handleSelect = (type: 'feeling' | 'activity', emoji: string, label: string) => {
    onChange({ type, emoji, label });
    setOpen(false);
  };

  const handleRemove = () => {
    onChange(null);
  };

  const items = activeTab === 'feeling' ? feelings : activities;
  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  if (value) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-body"
      >
        <span>{value.emoji}</span>
        <span className="text-muted-foreground">
          {value.type === 'feeling' ? 'Feeling' : value.label}
        </span>
        {value.type === 'feeling' && (
          <span className="font-medium">{value.label}</span>
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
          <Smile className="h-4 w-4" />
          Feeling/Activity
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('feeling')}
            className={cn(
              'flex-1 px-4 py-2.5 text-body font-medium transition-colors',
              activeTab === 'feeling'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Feelings
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={cn(
              'flex-1 px-4 py-2.5 text-body font-medium transition-colors',
              activeTab === 'activity'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Activities
          </button>
        </div>

        {/* Search */}
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-8 h-8"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="p-2 max-h-60 overflow-y-auto">
          <div className="grid grid-cols-4 gap-1">
            {filteredItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleSelect(activeTab, item.emoji, item.label)}
                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <span className="text-headline">{item.emoji}</span>
                <span className="text-caption text-muted-foreground text-center leading-tight">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

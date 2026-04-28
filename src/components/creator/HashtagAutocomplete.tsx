import { useState, useEffect, useRef, useCallback } from 'react';
import { Hash, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

// Simulated trending/popular hashtags
const TRENDING_HASHTAGS = [
  { tag: 'mentalhealth', count: '12.4K', trending: true },
  { tag: 'selfcare', count: '8.2K', trending: true },
  { tag: 'motivation', count: '6.1K', trending: true },
  { tag: 'mindfulness', count: '5.8K', trending: false },
  { tag: 'wellness', count: '4.9K', trending: false },
  { tag: 'gratitude', count: '4.5K', trending: false },
  { tag: 'healing', count: '3.8K', trending: false },
  { tag: 'growth', count: '3.2K', trending: true },
  { tag: 'positivity', count: '2.9K', trending: false },
  { tag: 'journey', count: '2.7K', trending: false },
  { tag: 'recovery', count: '2.4K', trending: false },
  { tag: 'support', count: '2.1K', trending: false },
  { tag: 'community', count: '1.9K', trending: false },
  { tag: 'selflove', count: '1.8K', trending: true },
  { tag: 'anxiety', count: '1.6K', trending: false },
];

interface HashtagAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

export function HashtagAutocomplete({
  value,
  onChange,
  placeholder = "Add a caption... Use #hashtags for discovery",
  maxLength = 200,
  className,
}: HashtagAutocompleteProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof TRENDING_HASHTAGS>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Find the hashtag being typed at cursor position
  const getHashtagAtCursor = useCallback((text: string, position: number) => {
    // Find the start of the current word
    let start = position - 1;
    while (start >= 0 && !/\s/.test(text[start])) {
      start--;
    }
    start++;
    
    // Extract the word from start to cursor
    const word = text.slice(start, position);
    
    if (word.startsWith('#') && word.length > 1) {
      return {
        query: word.slice(1).toLowerCase(),
        start,
        end: position,
      };
    }
    return null;
  }, []);

  // Update suggestions based on current input
  useEffect(() => {
    const hashtagInfo = getHashtagAtCursor(value, cursorPosition);
    
    if (hashtagInfo) {
      const filtered = TRENDING_HASHTAGS.filter(h => 
        h.tag.toLowerCase().startsWith(hashtagInfo.query)
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  }, [value, cursorPosition, getHashtagAtCursor]);

  const handleSelect = (tag: string) => {
    const hashtagInfo = getHashtagAtCursor(value, cursorPosition);
    
    if (hashtagInfo) {
      // Replace the partial hashtag with the complete one
      const before = value.slice(0, hashtagInfo.start);
      const after = value.slice(hashtagInfo.end);
      const newValue = `${before}#${tag} ${after}`;
      onChange(newValue);
      
      // Move cursor after the inserted hashtag
      const newPosition = hashtagInfo.start + tag.length + 2; // +2 for # and space
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newPosition, newPosition);
        }
      }, 0);
    }
    
    setShowSuggestions(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setCursorPosition(e.target.selectionStart || 0);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    setCursorPosition((e.target as HTMLTextAreaElement).selectionStart || 0);
  };

  const handleClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    setCursorPosition((e.target as HTMLTextAreaElement).selectionStart || 0);
  };

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyUp={handleKeyUp}
        onClick={handleClick}
        placeholder={placeholder}
        className={cn(
          "bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none min-h-[60px] max-h-[100px]",
          className
        )}
        maxLength={maxLength}
      />
      
      {/* Autocomplete Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 bottom-full mb-1 bg-background border border-border rounded-lg shadow-xl z-50 overflow-hidden">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.tag}
              type="button"
              onClick={() => handleSelect(suggestion.tag)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/80 transition-colors text-left"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                {suggestion.trending ? (
                  <TrendingUp className="h-4 w-4 text-primary" />
                ) : (
                  <Hash className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-body text-foreground">#{suggestion.tag}</p>
                <p className="text-label text-muted-foreground">{suggestion.count} posts</p>
              </div>
              {suggestion.trending && (
                <span className="text-caption font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  Trending
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Trending hashtag chips for quick-add
interface TrendingHashtagChipsProps {
  onSelect: (tag: string) => void;
  currentValue: string;
  className?: string;
}

export function TrendingHashtagChips({ onSelect, currentValue, className }: TrendingHashtagChipsProps) {
  // Get top trending hashtags that aren't already in the caption
  const availableTags = TRENDING_HASHTAGS
    .filter(h => h.trending)
    .filter(h => !currentValue.toLowerCase().includes(`#${h.tag}`))
    .slice(0, 5);

  if (availableTags.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      <span className="text-label text-white/50 mr-1 flex items-center">
        <TrendingUp className="h-3 w-3 mr-1" />
        Trending:
      </span>
      {availableTags.map((hashtag) => (
        <button
          key={hashtag.tag}
          type="button"
          onClick={() => onSelect(hashtag.tag)}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-label font-medium rounded-full bg-primary/20 text-primary hover:bg-primary/30 active:scale-95 transition-all"
        >
          <Hash className="h-3 w-3" />
          {hashtag.tag}
        </button>
      ))}
    </div>
  );
}

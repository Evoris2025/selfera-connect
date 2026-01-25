import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, MapPin, Globe, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CinematicAvatar } from '@/components/ui/CinematicAvatar';
import { EraVerifiedTick } from '@/components/EraVerifiedTick';
import { cn } from '@/lib/utils';
import type { DirectoryEntry } from '@/hooks/useDirectory';

interface DirectorySearchBarProps {
  value: string;
  onChange: (value: string) => void;
  entries: DirectoryEntry[];
  loading?: boolean;
  onSelectEntry?: (entry: DirectoryEntry) => void;
  placeholder?: string;
  className?: string;
}

const springGentle = { type: 'spring' as const, stiffness: 200, damping: 25 };

export function DirectorySearchBar({
  value,
  onChange,
  entries,
  loading = false,
  onSelectEntry,
  placeholder = 'Search providers, services, or topics...',
  className,
}: DirectorySearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Show results when there's a search query and input is focused
  const shouldShowResults = isFocused && value.trim().length > 0;

  // Limit displayed results
  const displayedEntries = entries.slice(0, 5);
  const hasMoreResults = entries.length > 5;

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update showResults when conditions change
  useEffect(() => {
    setShowResults(shouldShowResults);
  }, [shouldShowResults]);

  const handleSelect = (entry: DirectoryEntry) => {
    setShowResults(false);
    inputRef.current?.blur();
    onSelectEntry?.(entry);
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search 
          className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200',
            isFocused ? 'text-primary' : 'text-muted-foreground'
          )} 
        />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            'pl-10 pr-10 h-12 bg-secondary/50 border-border/50 rounded-xl transition-all duration-200',
            isFocused && 'ring-2 ring-primary/20 border-primary/40'
          )}
        />
        
        {/* Clear button or loading indicator */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
            </motion.div>
          ) : value.length > 0 ? (
            <motion.button
              key="clear"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-secondary transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={springGentle}
            className="absolute top-full left-0 right-0 mt-2 z-50 bg-card border border-border/50 rounded-xl shadow-lg overflow-hidden"
          >
            {displayedEntries.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No providers found for "{value}"
              </div>
            ) : (
              <>
                <div className="max-h-80 overflow-y-auto">
                  {displayedEntries.map((entry, index) => (
                    <motion.button
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => handleSelect(entry)}
                      className="w-full flex items-start gap-3 p-3 hover:bg-secondary/50 transition-colors text-left border-b border-border/30 last:border-0"
                    >
                      <CinematicAvatar
                        src={entry.profile?.avatar_url || undefined}
                        alt={entry.name}
                        fallback={entry.name.charAt(0)}
                        size="md"
                        ring={entry.verified ? 'gradient' : 'muted'}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-foreground truncate">
                            {entry.name}
                          </span>
                          {entry.verified && <EraVerifiedTick size="sm" userEmail={entry.profile?.email || undefined} />}
                        </div>
                        
                        {entry.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {entry.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 mt-1">
                          {entry.tags?.slice(0, 2).map(tag => (
                            <Badge 
                              key={tag} 
                              variant="secondary" 
                              className="text-[10px] px-1.5 py-0 h-4 rounded-full"
                            >
                              {tag}
                            </Badge>
                          ))}
                          
                          {entry.regions_served && entry.regions_served.length > 0 && (
                            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                              <MapPin className="h-2.5 w-2.5" />
                              {entry.regions_served[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
                
                {hasMoreResults && (
                  <div className="p-2 border-t border-border/30 text-center">
                    <span className="text-xs text-muted-foreground">
                      +{entries.length - 5} more results
                    </span>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EraVerifiedTick } from '@/components/EraVerifiedTick';
import { cn } from '@/lib/utils';

export interface MentionUser {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl?: string;
  isVerified?: boolean;
}

// Mock users for simulation mode
const mockUsers: MentionUser[] = [
  { id: '1', handle: 'maya', displayName: 'Maya Chen', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', isVerified: true },
  { id: '2', handle: 'alex', displayName: 'Alex Rivera', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', isVerified: false },
  { id: '3', handle: 'sam', displayName: 'Sam Taylor', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', isVerified: true },
  { id: '4', handle: 'jordan', displayName: 'Jordan Lee', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', isVerified: false },
  { id: '5', handle: 'casey', displayName: 'Casey Martinez', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', isVerified: true },
  { id: '6', handle: 'morgan', displayName: 'Morgan Blake', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', isVerified: false },
  { id: '7', handle: 'taylor', displayName: 'Taylor Smith', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', isVerified: false },
  { id: '8', handle: 'wellness_coach', displayName: 'Wellness Coach', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100', isVerified: true },
];

interface UserMentionAutocompleteProps {
  query: string;
  onSelect: (user: MentionUser) => void;
  onClose: () => void;
  position?: { top: number; left: number };
  className?: string;
}

export function UserMentionAutocomplete({
  query,
  onSelect,
  onClose,
  position,
  className,
}: UserMentionAutocompleteProps) {
  const [results, setResults] = useState<MentionUser[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter users based on query
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = mockUsers.filter(
      user =>
        user.handle.toLowerCase().includes(lowerQuery) ||
        user.displayName.toLowerCase().includes(lowerQuery)
    ).slice(0, 6);

    setResults(filtered);
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (results.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % results.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            onSelect(results[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [results, selectedIndex, onSelect, onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (results.length === 0) {
    return null;
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'absolute z-50 w-64 max-h-64 overflow-y-auto',
        'bg-popover border border-border rounded-xl shadow-lg',
        className
      )}
      style={position ? { top: position.top, left: position.left } : undefined}
    >
      <div className="p-1">
        {results.map((user, index) => (
          <button
            key={user.id}
            onClick={() => onSelect(user)}
            onMouseEnter={() => setSelectedIndex(index)}
            className={cn(
              'w-full flex items-center gap-3 p-2 rounded-lg transition-colors',
              index === selectedIndex ? 'bg-secondary' : 'hover:bg-secondary/50'
            )}
          >
            <Avatar size="sm">
              <AvatarImage src={user.avatarUrl} alt={user.displayName} />
              <AvatarFallback className="text-label">
                {user.displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-1">
                <span className="font-medium text-body truncate">
                  {user.displayName}
                </span>
                {user.isVerified && <EraVerifiedTick size="sm" />}
              </div>
              <span className="text-label text-muted-foreground">
                @{user.handle}
              </span>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// Hook for detecting @ mentions in text
export function useMentionDetection(text: string) {
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionPosition, setMentionPosition] = useState<number | null>(null);

  useEffect(() => {
    // Find the last @ symbol and extract the query after it
    const lastAtIndex = text.lastIndexOf('@');
    
    if (lastAtIndex === -1) {
      setMentionQuery(null);
      setMentionPosition(null);
      return;
    }

    // Check if there's a space after the @ (mention complete)
    const afterAt = text.slice(lastAtIndex + 1);
    if (afterAt.includes(' ')) {
      setMentionQuery(null);
      setMentionPosition(null);
      return;
    }

    // Check if @ is at start or after a space
    if (lastAtIndex > 0 && text[lastAtIndex - 1] !== ' ' && text[lastAtIndex - 1] !== '\n') {
      setMentionQuery(null);
      setMentionPosition(null);
      return;
    }

    setMentionQuery(afterAt);
    setMentionPosition(lastAtIndex);
  }, [text]);

  const insertMention = useCallback((user: MentionUser, currentText: string): string => {
    if (mentionPosition === null) return currentText;

    const before = currentText.slice(0, mentionPosition);
    const mention = `@${user.handle} `;
    
    return before + mention;
  }, [mentionPosition]);

  return {
    mentionQuery,
    mentionPosition,
    insertMention,
    isActive: mentionQuery !== null,
  };
}

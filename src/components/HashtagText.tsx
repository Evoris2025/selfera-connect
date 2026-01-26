import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface HashtagTextProps {
  text: string;
  className?: string;
  hashtagClassName?: string;
}

/**
 * Renders text with clickable hashtags.
 * Hashtags are automatically detected and linked to the explore page.
 */
export function HashtagText({ text, className, hashtagClassName }: HashtagTextProps) {
  // Split text into parts: regular text and hashtags
  const parts = text.split(/(#\w+)/g);
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('#')) {
          const tag = part.slice(1);
          return (
            <Link
              key={index}
              to={`/explore?tag=${encodeURIComponent(tag)}`}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'text-primary hover:text-primary/80 transition-colors',
                hashtagClassName
              )}
            >
              {part}
            </Link>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}

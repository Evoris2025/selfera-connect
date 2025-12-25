import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Plus, X, Hash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface TopicTag {
  id: string;
  name: string;
  category: string | null;
}

interface TopicTagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
}

export function TopicTagSelector({
  selectedTags,
  onTagsChange,
  maxTags = 5,
}: TopicTagSelectorProps) {
  const { t } = useTranslation();
  const [tags, setTags] = useState<TopicTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [customTag, setCustomTag] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    if (showCustomInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showCustomInput]);

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('topic_tags')
        .select('id, name, category')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter((id) => id !== tagId));
    } else if (selectedTags.length < maxTags) {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  const handleCustomTagSubmit = async () => {
    const cleanTag = customTag.trim().toLowerCase().replace(/^#/, '').replace(/\s+/g, '');
    
    if (!cleanTag || selectedTags.length >= maxTags) {
      setCustomTag('');
      setShowCustomInput(false);
      return;
    }

    // Check if tag already exists
    const existingTag = tags.find(t => t.name.toLowerCase() === cleanTag);
    
    if (existingTag) {
      if (!selectedTags.includes(existingTag.id)) {
        onTagsChange([...selectedTags, existingTag.id]);
      }
    } else {
      // Create new tag
      try {
        const { data: newTag, error } = await supabase
          .from('topic_tags')
          .insert({ name: cleanTag, active: true })
          .select()
          .single();

        if (error) throw error;
        
        if (newTag) {
          setTags(prev => [...prev, newTag]);
          onTagsChange([...selectedTags, newTag.id]);
        }
      } catch (error) {
        console.error('Error creating tag:', error);
      }
    }

    setCustomTag('');
    setShowCustomInput(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCustomTagSubmit();
    } else if (e.key === 'Escape') {
      setCustomTag('');
      setShowCustomInput(false);
    }
  };

  // Get selected tag objects for display
  const selectedTagObjects = tags.filter(t => selectedTags.includes(t.id));

  if (loading) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Topics</p>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-8 w-20 rounded-full bg-secondary animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          Topics <span className="text-destructive">*</span>
        </p>
        <span className="text-xs text-muted-foreground">
          {selectedTags.length}/{maxTags}
        </span>
      </div>

      {/* Selected Tags */}
      {selectedTagObjects.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTagObjects.map((tag) => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-primary text-primary-foreground transition-all hover:bg-primary/90"
            >
              <span className="opacity-70">#</span>
              {tag.name}
              <X className="h-3 w-3 ml-1" />
            </button>
          ))}
        </div>
      )}

      {/* Custom Tag Input */}
      {showCustomInput ? (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleCustomTagSubmit}
              placeholder="Enter custom tag..."
              className="pl-9 h-9"
              maxLength={30}
            />
          </div>
          <button
            onClick={() => {
              setCustomTag('');
              setShowCustomInput(false);
            }}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        selectedTags.length < maxTags && (
          <button
            onClick={() => setShowCustomInput(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Add custom tag
          </button>
        )
      )}

      {/* Suggested Tags */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Suggested</p>
        <div className="flex flex-wrap gap-2">
          {tags
            .filter(tag => !selectedTags.includes(tag.id))
            .slice(0, 12)
            .map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                disabled={selectedTags.length >= maxTags}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all',
                  'bg-secondary/60 text-secondary-foreground hover:bg-secondary',
                  selectedTags.length >= maxTags && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Plus className="h-3 w-3" />
                {tag.name}
              </button>
            ))}
        </div>
      </div>

      {selectedTags.length === 0 && (
        <p className="text-xs text-destructive">Please select at least one topic</p>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

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

  useEffect(() => {
    fetchTags();
  }, []);

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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          Topics <span className="text-destructive">*</span>
        </p>
        <span className="text-xs text-muted-foreground">
          {selectedTags.length}/{maxTags}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag.id);
          return (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              disabled={!isSelected && selectedTags.length >= maxTags}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all',
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                !isSelected && selectedTags.length >= maxTags && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isSelected ? (
                <Check className="h-3 w-3" />
              ) : (
                <Plus className="h-3 w-3" />
              )}
              {tag.name}
            </button>
          );
        })}
      </div>
      {selectedTags.length === 0 && (
        <p className="text-xs text-destructive">Please select at least one topic</p>
      )}
    </div>
  );
}

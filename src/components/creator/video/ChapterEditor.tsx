import { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Plus, Trash2, GripVertical, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface Chapter {
  id: string;
  title: string;
  timestamp: number; // seconds
}

interface ChapterEditorProps {
  chapters: Chapter[];
  onChange: (chapters: Chapter[]) => void;
  videoDuration: number;
}

export function ChapterEditor({ chapters, onChange, videoDuration }: ChapterEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTimestamp, setNewTimestamp] = useState('');

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const parseTime = (timeStr: string): number | null => {
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      const mins = parseInt(parts[0], 10);
      const secs = parseInt(parts[1], 10);
      if (!isNaN(mins) && !isNaN(secs)) {
        return mins * 60 + secs;
      }
    }
    return null;
  };

  const handleAdd = () => {
    if (!newTitle.trim() || !newTimestamp) return;
    
    const timestamp = parseTime(newTimestamp);
    if (timestamp === null || timestamp > videoDuration) return;

    const newChapter: Chapter = {
      id: `chapter-${Date.now()}`,
      title: newTitle.trim(),
      timestamp,
    };

    // Sort by timestamp
    const updated = [...chapters, newChapter].sort((a, b) => a.timestamp - b.timestamp);
    onChange(updated);
    setNewTitle('');
    setNewTimestamp('');
    setIsAdding(false);
  };

  const handleRemove = (id: string) => {
    onChange(chapters.filter(c => c.id !== id));
  };

  const handleReorder = (reordered: Chapter[]) => {
    onChange(reordered);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-body font-medium">Chapters</label>
        {!isAdding && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="h-8 text-label"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Chapter
          </Button>
        )}
      </div>

      {/* Add chapter form */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex gap-2 items-end"
        >
          <div className="flex-1 space-y-1">
            <span className="text-label text-muted-foreground">Title</span>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Introduction"
              maxLength={50}
            />
          </div>
          <div className="w-24 space-y-1">
            <span className="text-label text-muted-foreground">Time</span>
            <Input
              value={newTimestamp}
              onChange={(e) => setNewTimestamp(e.target.value)}
              placeholder="0:00"
            />
          </div>
          <Button size="sm" onClick={handleAdd} className="h-9">
            Add
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsAdding(false)}
            className="h-9"
          >
            Cancel
          </Button>
        </motion.div>
      )}

      {/* Chapters list */}
      {chapters.length > 0 ? (
        <Reorder.Group
          axis="y"
          values={chapters}
          onReorder={handleReorder}
          className="space-y-2"
        >
          {chapters.map((chapter) => (
            <Reorder.Item
              key={chapter.id}
              value={chapter}
              className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg group"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
              <div className="flex items-center gap-2 flex-1">
                <span className="text-label font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                  {formatTime(chapter.timestamp)}
                </span>
                <span className="text-body truncate">{chapter.title}</span>
              </div>
              <button
                onClick={() => handleRemove(chapter.id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-destructive transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      ) : (
        <p className="text-body text-muted-foreground text-center py-3">
          Add chapters to help viewers navigate your video
        </p>
      )}

      {/* Timeline visualization */}
      {chapters.length > 0 && videoDuration > 0 && (
        <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
          {chapters.map((chapter, index) => (
            <div
              key={chapter.id}
              className="absolute top-0 w-1 h-full bg-primary"
              style={{
                left: `${(chapter.timestamp / videoDuration) * 100}%`,
              }}
              title={`${chapter.title} (${formatTime(chapter.timestamp)})`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

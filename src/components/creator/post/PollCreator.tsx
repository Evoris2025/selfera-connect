import { useState } from 'react';
import { Plus, X, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface PollData {
  options: string[];
  durationHours: number;
}

interface PollCreatorProps {
  poll: PollData | null;
  onPollChange: (poll: PollData | null) => void;
}

const durationOptions = [
  { value: 24, label: '1 day' },
  { value: 72, label: '3 days' },
  { value: 168, label: '1 week' },
];

export function PollCreator({ poll, onPollChange }: PollCreatorProps) {
  const [isCreating, setIsCreating] = useState(!!poll);

  const handleCreate = () => {
    setIsCreating(true);
    onPollChange({
      options: ['', ''],
      durationHours: 24,
    });
  };

  const handleRemove = () => {
    setIsCreating(false);
    onPollChange(null);
  };

  const updateOption = (index: number, value: string) => {
    if (!poll) return;
    const newOptions = [...poll.options];
    newOptions[index] = value;
    onPollChange({ ...poll, options: newOptions });
  };

  const addOption = () => {
    if (!poll || poll.options.length >= 4) return;
    onPollChange({
      ...poll,
      options: [...poll.options, ''],
    });
  };

  const removeOption = (index: number) => {
    if (!poll || poll.options.length <= 2) return;
    onPollChange({
      ...poll,
      options: poll.options.filter((_, i) => i !== index),
    });
  };

  const setDuration = (hours: number) => {
    if (!poll) return;
    onPollChange({ ...poll, durationHours: hours });
  };

  if (!isCreating) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCreate}
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <BarChart2 className="h-4 w-4" />
        Add Poll
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-4 p-4 rounded-xl bg-secondary/50 border border-border"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-primary" />
          <Label className="font-medium">Poll</Label>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemove}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {poll?.options.map((option, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-2"
            >
              <Input
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                maxLength={50}
                className="flex-1"
              />
              {poll.options.length > 2 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(index)}
                  className="h-9 w-9 shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {poll && poll.options.length < 4 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={addOption}
          className="gap-1.5 text-primary"
        >
          <Plus className="h-4 w-4" />
          Add option
        </Button>
      )}

      <div className="flex items-center gap-3">
        <Label className="text-sm text-muted-foreground">Poll duration:</Label>
        <Select
          value={poll?.durationHours.toString()}
          onValueChange={(v) => setDuration(parseInt(v))}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {durationOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value.toString()}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </motion.div>
  );
}

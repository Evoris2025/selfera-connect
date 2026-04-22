import { useEffect, useState } from 'react';
import { Plus, X, BarChart2, Image as ImageIcon, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface PollOptionData {
  text: string;
  image?: string;
}

export interface PollData {
  options: PollOptionData[];
  /** legacy hours-based duration; still written for back-compat. */
  durationHours: number;
  /** Phase 4 additions */
  multiSelect?: boolean;
  durationMs?: number;
  closesAt?: number;
}

interface PollCreatorProps {
  poll: PollData | null;
  onPollChange: (poll: PollData | null) => void;
}

const DURATION_PRESETS: Array<{ ms: number; label: string; hours: number }> = [
  { ms: 60 * 60 * 1000,             label: '1 hour',  hours: 1 },
  { ms: 24 * 60 * 60 * 1000,        label: '1 day',   hours: 24 },
  { ms: 7 * 24 * 60 * 60 * 1000,    label: '1 week',  hours: 168 },
];

const DEFAULT_DURATION_MS = 24 * 60 * 60 * 1000;

/** Helper exposed for unit tests: compute closesAt given start + durationMs. */
export function computePollClosesAt(startedAt: number, durationMs: number): number {
  return startedAt + durationMs;
}

/** Helper exposed for unit tests: is the poll currently expired? */
export function isPollExpired(closesAt: number | undefined, now = Date.now()): boolean {
  return typeof closesAt === 'number' && closesAt <= now;
}

export function PollCreator({ poll, onPollChange }: PollCreatorProps) {
  const [creating, setCreating] = useState(!!poll);

  const upsert = (patch: Partial<PollData>) => {
    if (!poll) return;
    onPollChange({ ...poll, ...patch });
  };

  const handleCreate = () => {
    setCreating(true);
    onPollChange({
      options: [{ text: '' }, { text: '' }],
      durationHours: 24,
      durationMs: DEFAULT_DURATION_MS,
      multiSelect: false,
    });
  };

  const handleRemove = () => {
    setCreating(false);
    onPollChange(null);
  };

  const updateOption = (index: number, patch: Partial<PollOptionData>) => {
    if (!poll) return;
    const next = poll.options.slice();
    next[index] = { ...next[index], ...patch };
    upsert({ options: next });
  };

  const addOption = () => {
    if (!poll || poll.options.length >= 4) return;
    upsert({ options: [...poll.options, { text: '' }] });
  };

  const removeOption = (index: number) => {
    if (!poll || poll.options.length <= 2) return;
    upsert({ options: poll.options.filter((_, i) => i !== index) });
  };

  const setDurationMs = (ms: number) => {
    const preset = DURATION_PRESETS.find(p => p.ms === ms);
    upsert({ durationMs: ms, durationHours: preset?.hours ?? Math.round(ms / 3_600_000) });
  };

  const handleOptionImage = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    updateOption(index, { image: URL.createObjectURL(file) });
  };

  // Migrate legacy polls (durationHours only) into durationMs lazily
  useEffect(() => {
    if (poll && poll.durationMs == null && poll.durationHours) {
      upsert({ durationMs: poll.durationHours * 3_600_000 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poll?.id, poll?.durationHours]);

  if (!creating) {
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

  const durationMs = poll?.durationMs ?? DEFAULT_DURATION_MS;

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
        <Button variant="ghost" size="icon" onClick={handleRemove} className="h-8 w-8">
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
              <div className="relative shrink-0">
                {option.image ? (
                  <div className="relative h-9 w-9 rounded overflow-hidden">
                    <img src={option.image} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => updateOption(index, { image: undefined })}
                      className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center"
                      aria-label="Remove image"
                    >
                      <X className="h-3.5 w-3.5 text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="h-9 w-9 rounded border border-dashed border-border flex items-center justify-center hover:bg-secondary cursor-pointer text-muted-foreground" aria-label="Add option image">
                    <ImageIcon className="h-4 w-4" />
                    <input type="file" accept="image/*" onChange={(e) => handleOptionImage(index, e)} className="hidden" />
                  </label>
                )}
              </div>

              <Input
                value={option.text}
                onChange={(e) => updateOption(index, { text: e.target.value })}
                placeholder={`Option ${index + 1}`}
                maxLength={50}
                className="flex-1"
              />
              {poll && poll.options.length > 2 && (
                <Button variant="ghost" size="icon" onClick={() => removeOption(index)} className="h-9 w-9 shrink-0">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {poll && poll.options.length < 4 && (
        <Button variant="ghost" size="sm" onClick={addOption} className="gap-1.5 text-primary">
          <Plus className="h-4 w-4" />
          Add option
        </Button>
      )}

      <div className="flex items-center justify-between gap-3 pt-1">
        <Label htmlFor="poll-multi" className="flex items-center gap-2 text-sm">
          <CheckSquare className="h-4 w-4 text-muted-foreground" />
          Allow multiple answers
        </Label>
        <Switch
          id="poll-multi"
          checked={!!poll?.multiSelect}
          onCheckedChange={(v) => upsert({ multiSelect: v })}
        />
      </div>

      <div className="flex items-center gap-3">
        <Label className="text-sm text-muted-foreground">Duration:</Label>
        <Select value={durationMs.toString()} onValueChange={(v) => setDurationMs(parseInt(v))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DURATION_PRESETS.map(opt => (
              <SelectItem key={opt.ms} value={opt.ms.toString()}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </motion.div>
  );
}

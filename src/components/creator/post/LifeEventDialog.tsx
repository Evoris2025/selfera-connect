import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { FeedLifeEvent } from '@/components/feed/CrossroadFeed';

const PRESETS: Array<{ kind: string; label: string; icon: string }> = [
  { kind: 'new_job',    label: 'New job',     icon: '💼' },
  { kind: 'moved',      label: 'Moved',       icon: '🏡' },
  { kind: 'married',    label: 'Married',     icon: '💍' },
  { kind: 'graduated',  label: 'Graduated',   icon: '🎓' },
  { kind: 'new_pet',    label: 'New pet',     icon: '🐾' },
  { kind: 'milestone',  label: 'Milestone',   icon: '🏁' },
  { kind: 'travel',     label: 'Travel',      icon: '✈️' },
  { kind: 'wellbeing',  label: 'Wellbeing',   icon: '🌿' },
];

interface LifeEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: FeedLifeEvent | null;
  onSave: (next: FeedLifeEvent | null) => void;
}

export function LifeEventDialog({ open, onOpenChange, value, onSave }: LifeEventDialogProps) {
  const [selected, setSelected] = useState<FeedLifeEvent | null>(value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add a life event</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map(p => {
            const active = selected?.kind === p.kind;
            return (
              <button
                key={p.kind}
                onClick={() => setSelected({ kind: p.kind, label: p.label, icon: p.icon, date: Date.now() })}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border text-left transition',
                  active ? 'border-primary bg-primary/10' : 'border-border hover:bg-secondary'
                )}
              >
                <span className="text-2xl">{p.icon}</span>
                <span className="text-body font-medium">{p.label}</span>
              </button>
            );
          })}
        </div>
        <DialogFooter>
          {selected && (
            <Button variant="ghost" onClick={() => { onSave(null); onOpenChange(false); }}>
              Remove
            </Button>
          )}
          <Button onClick={() => { onSave(selected); onOpenChange(false); }} disabled={!selected}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

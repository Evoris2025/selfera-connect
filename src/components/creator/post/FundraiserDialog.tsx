import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FeedFundraiser } from '@/components/feed/CrossroadFeed';

interface FundraiserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: FeedFundraiser | null;
  onSave: (next: FeedFundraiser | null) => void;
}

export function FundraiserDialog({ open, onOpenChange, value, onSave }: FundraiserDialogProps) {
  const [title, setTitle] = useState(value?.title ?? '');
  const [goal, setGoal] = useState<string>(value?.goal?.toString() ?? '');
  const [currency, setCurrency] = useState(value?.currency ?? 'USD');

  const valid = title.trim().length > 0 && Number(goal) > 0;

  const handleSave = () => {
    if (!valid) return;
    // TODO: wire payments in the publish handler
    onSave({ title: title.trim(), goal: Number(goal), currency });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Start a fundraiser</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="fr-title">Title</Label>
            <Input id="fr-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Mental health resources for students" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="fr-goal">Goal</Label>
              <Input id="fr-goal" type="number" min={1} value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="1000" />
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="AUD">AUD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          {value && (
            <Button variant="ghost" onClick={() => { onSave(null); onOpenChange(false); }}>Remove</Button>
          )}
          <Button onClick={handleSave} disabled={!valid}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

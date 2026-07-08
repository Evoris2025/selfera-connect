import { FileText } from 'lucide-react';
import { ExpressionIcon } from '@/components/icons/ExpressionIcon';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { StudioContentKind } from '@/contexts/FeedDataContext';

export interface CrossPostState {
  alsoShareAsExpression: boolean;
  alsoShareAsPost: boolean;
}

interface CrossPostTogglesProps {
  /** What's currently being created — used to hide the matching toggle. */
  source: StudioContentKind;
  value: CrossPostState;
  onChange: (next: CrossPostState) => void;
}

/**
 * Shared "also share as Expression / Post" toggles.
 * On publish, callers fan out via createExpression / createPost in FeedDataContext.
 */
export function CrossPostToggles({ source, value, onChange }: CrossPostTogglesProps) {
  return (
    <div className="space-y-3">
      {source !== 'expression' && (
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="cross-expression" className="flex items-center gap-2 text-body">
            <ExpressionIcon className="h-4 w-4" />
            Also share as Expression
          </Label>
          <Switch
            id="cross-expression"
            checked={value.alsoShareAsExpression}
            onCheckedChange={(v) => onChange({ ...value, alsoShareAsExpression: v })}
          />
        </div>
      )}

      {source !== 'post' && (
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="cross-post" className="flex items-center gap-2 text-body">
            <FileText className="h-4 w-4 text-emerald-400" />
            Also share as Post
          </Label>
          <Switch
            id="cross-post"
            checked={value.alsoShareAsPost}
            onCheckedChange={(v) => onChange({ ...value, alsoShareAsPost: v })}
          />
        </div>
      )}
    </div>
  );
}

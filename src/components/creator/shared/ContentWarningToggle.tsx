import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type ContentWarningType = 'sensitive' | 'triggering' | 'graphic' | 'other' | null;

interface ContentWarningToggleProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  warningType: ContentWarningType;
  onWarningTypeChange: (type: ContentWarningType) => void;
}

const warningTypes = [
  { value: 'sensitive', label: 'Sensitive Content' },
  { value: 'triggering', label: 'Potentially Triggering' },
  { value: 'graphic', label: 'Graphic Content' },
  { value: 'other', label: 'Other' },
];

export function ContentWarningToggle({
  enabled,
  onEnabledChange,
  warningType,
  onWarningTypeChange,
}: ContentWarningToggleProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3 p-3 rounded-xl bg-secondary/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <Label htmlFor="content-warning" className="text-body font-medium">
            Content Warning
          </Label>
        </div>
        <Switch
          id="content-warning"
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
      </div>

      {enabled && (
        <Select
          value={warningType || ''}
          onValueChange={(value) => onWarningTypeChange(value as ContentWarningType)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select warning type" />
          </SelectTrigger>
          <SelectContent>
            {warningTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <p className="text-label text-muted-foreground">
        Content with warnings will be blurred until viewers choose to see it.
      </p>
    </div>
  );
}

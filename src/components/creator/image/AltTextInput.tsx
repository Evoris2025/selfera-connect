import { motion } from 'framer-motion';
import { Eye, Info } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface AltTextInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export function AltTextInput({ value, onChange, maxLength = 500 }: AltTextInputProps) {
  const remaining = maxLength - value.length;
  const isNearLimit = remaining < 50;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <label className="text-sm font-medium">Alt Text</label>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5" />
          <span>For accessibility</span>
        </div>
      </div>

      <Textarea
        placeholder="Describe this image for people who use screen readers..."
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        className="min-h-[80px] resize-none text-sm"
      />

      <div className="flex items-center justify-between text-xs">
        <p className="text-muted-foreground">
          Describe what's in the image so everyone can enjoy it
        </p>
        <span className={cn(
          'tabular-nums',
          isNearLimit ? 'text-crisis' : 'text-muted-foreground'
        )}>
          {remaining}
        </span>
      </div>
    </motion.div>
  );
}

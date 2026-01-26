import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Sparkles, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ThumbnailSelectorProps {
  autoThumbnails: string[];
  selectedIndex: number | null;
  customThumbnail: string | null;
  onSelectAuto: (index: number) => void;
  onUploadCustom: (dataUrl: string) => void;
  onGenerateAI?: () => void;
  isGeneratingAI?: boolean;
}

export function ThumbnailSelector({
  autoThumbnails,
  selectedIndex,
  customThumbnail,
  onSelectAuto,
  onUploadCustom,
  onGenerateAI,
  isGeneratingAI,
}: ThumbnailSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [useCustom, setUseCustom] = useState(!!customThumbnail);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onUploadCustom(dataUrl);
      setUseCustom(true);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Thumbnail</label>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="h-8 text-xs"
          >
            <Upload className="w-4 h-4 mr-1" />
            Upload
          </Button>
          {onGenerateAI && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onGenerateAI}
              disabled={isGeneratingAI}
              className="h-8 text-xs"
            >
              {isGeneratingAI ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-1" />
              )}
              AI Generate
            </Button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Auto-generated thumbnails */}
      <div className="grid grid-cols-3 gap-2">
        {autoThumbnails.map((thumb, index) => (
          <motion.button
            key={index}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onSelectAuto(index);
              setUseCustom(false);
            }}
            className={cn(
              'relative aspect-video rounded-lg overflow-hidden border-2 transition-colors',
              !useCustom && selectedIndex === index
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-transparent hover:border-primary/50'
            )}
          >
            <img
              src={thumb}
              alt={`Thumbnail option ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {!useCustom && selectedIndex === index && (
              <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
            <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 rounded">
              Auto {index + 1}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Custom thumbnail */}
      {customThumbnail && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setUseCustom(true)}
          className={cn(
            'relative w-full aspect-video rounded-lg overflow-hidden border-2 transition-colors',
            useCustom
              ? 'border-primary ring-2 ring-primary/20'
              : 'border-transparent hover:border-primary/50'
          )}
        >
          <img
            src={customThumbnail}
            alt="Custom thumbnail"
            className="w-full h-full object-cover"
          />
          {useCustom && (
            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-4 h-4 text-primary-foreground" />
            </div>
          )}
          <span className="absolute bottom-2 left-2 text-xs bg-black/60 text-white px-2 py-0.5 rounded">
            Custom
          </span>
        </motion.button>
      )}

      <p className="text-xs text-muted-foreground">
        Recommended: 1280x720 (16:9). A good thumbnail can significantly increase views.
      </p>
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookmarkPlus, Trash2, Edit2, Check, X, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { EditPreset } from './useEditPresets';
import type { ImageAdjustments } from './types';
import { filters } from './filterUtils';

interface PresetManagerProps {
  presets: EditPreset[];
  currentFilter: number;
  currentFilterIntensity: number;
  currentAdjustments: ImageAdjustments;
  onSavePreset: (name: string) => void;
  onApplyPreset: (preset: EditPreset) => void;
  onDeletePreset: (id: string) => void;
  onRenamePreset: (id: string, newName: string) => void;
}

export function PresetManager({
  presets,
  currentFilter,
  currentFilterIntensity,
  currentAdjustments,
  onSavePreset,
  onApplyPreset,
  onDeletePreset,
  onRenamePreset,
}: PresetManagerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Quick-save: auto-generate a name from the current filter + count
  const handleQuickSave = () => {
    const filterName = currentFilter > 0 && filters[currentFilter]
      ? filters[currentFilter].name
      : 'Custom';
    const name = `${filterName} ${presets.length + 1}`;
    onSavePreset(name);
    setIsExpanded(true);
  };

  const hasEffects =
    currentFilter > 0 ||
    Object.entries(currentAdjustments).some(([key, value]) => {
      if (key === 'brightness' || key === 'contrast' || key === 'saturation') {
        return value !== 100;
      }
      return value !== 0;
    });

  const handleStartEdit = (preset: EditPreset) => {
    setEditingId(preset.id);
    setEditingName(preset.name);
  };

  const handleConfirmEdit = () => {
    if (editingId && editingName.trim()) {
      onRenamePreset(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  const getPresetSummary = (preset: EditPreset) => {
    const parts: string[] = [];

    if (preset.filter > 0 && filters[preset.filter]) {
      parts.push(filters[preset.filter].name);
    }

    const modifiedAdjustments = Object.entries(preset.adjustments).filter(([key, value]) => {
      if (key === 'brightness' || key === 'contrast' || key === 'saturation') {
        return value !== 100;
      }
      return value !== 0;
    });

    if (modifiedAdjustments.length > 0) {
      parts.push(`${modifiedAdjustments.length} adj`);
    }

    return parts.length > 0 ? parts.join(' + ') : 'No effects';
  };

  return (
    <div className="space-y-2">
      {/* Header with quick-save icon */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between flex-1 p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Saved Presets</span>
            {presets.length > 0 && (
              <span className="text-xs text-muted-foreground">({presets.length})</span>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        <motion.button
          onClick={handleQuickSave}
          disabled={!hasEffects}
          whileTap={{ scale: 0.9 }}
          title={hasEffects ? 'Save current look as a preset' : 'Apply a filter or adjustment first'}
          className={cn(
            'p-2 rounded-lg transition-colors flex items-center justify-center',
            hasEffects
              ? 'bg-primary/15 text-primary hover:bg-primary/25'
              : 'bg-secondary/30 text-muted-foreground/50 cursor-not-allowed'
          )}
        >
          <BookmarkPlus className="h-4 w-4" />
        </motion.button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-2">
              {/* Quick-save hint */}
              <p className="text-[11px] text-muted-foreground px-1">
                Tap the bookmark icon above to save your current filter & adjustments. Rename anytime.
              </p>

              {/* Preset List */}
              {presets.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3">
                  No saved presets yet. Save your favorite filter and adjustment combinations!
                </p>
              ) : (
                <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                  {presets.map((preset) => (
                    <motion.div
                      key={preset.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="group flex items-center gap-2 p-2 rounded-lg bg-secondary/30 hover:bg-secondary/60 transition-colors"
                    >
                      {editingId === preset.id ? (
                        <>
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="h-6 text-xs flex-1"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleConfirmEdit();
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleConfirmEdit}
                            className="h-6 w-6 p-0"
                          >
                            <Check className="h-3 w-3 text-primary" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingId(null)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => onApplyPreset(preset)}
                            className="flex-1 text-left"
                          >
                            <div className="text-sm font-medium truncate">{preset.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {getPresetSummary(preset)}
                            </div>
                          </button>
                          
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStartEdit(preset)}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDeletePreset(preset.id)}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

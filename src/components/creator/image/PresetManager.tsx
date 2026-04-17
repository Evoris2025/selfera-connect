import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookmarkPlus, Trash2, Edit2, Check, X, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { EditPreset } from './useEditPresets';
import type { ImageAdjustments } from './types';
import { filters } from './EnhancedFilterLibrary';

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
  const [isSaving, setIsSaving] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleSave = () => {
    if (newPresetName.trim()) {
      onSavePreset(newPresetName.trim());
      setNewPresetName('');
      setIsSaving(false);
    }
  };

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
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
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
              {/* Save New Preset */}
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="Preset name..."
                    className="h-8 text-sm flex-1"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave();
                      if (e.key === 'Escape') setIsSaving(false);
                    }}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSave}
                    disabled={!newPresetName.trim()}
                    className="h-8 w-8 p-0"
                  >
                    <Check className="h-4 w-4 text-primary" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsSaving(false);
                      setNewPresetName('');
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsSaving(true)}
                  className="w-full h-8 text-xs gap-1.5"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save Current Settings
                </Button>
              )}

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

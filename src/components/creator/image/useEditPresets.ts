import { useState, useCallback, useEffect } from 'react';
import type { ImageAdjustments } from './types';
import { DEFAULT_ADJUSTMENTS } from './types';

export interface EditPreset {
  id: string;
  name: string;
  filter: number;
  filterIntensity: number;
  adjustments: ImageAdjustments;
  createdAt: number;
}

const STORAGE_KEY = 'selfera_image_presets';
const MAX_PRESETS = 20;

interface UseEditPresetsReturn {
  presets: EditPreset[];
  savePreset: (name: string, filter: number, filterIntensity: number, adjustments: ImageAdjustments) => EditPreset;
  deletePreset: (id: string) => void;
  renamePreset: (id: string, newName: string) => void;
  applyPreset: (preset: EditPreset) => { filter: number; filterIntensity: number; adjustments: ImageAdjustments };
  isLoading: boolean;
}

export function useEditPresets(): UseEditPresetsReturn {
  const [presets, setPresets] = useState<EditPreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load presets from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setPresets(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load presets:', error);
    }
    setIsLoading(false);
  }, []);

  // Save presets to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
      } catch (error) {
        console.error('Failed to save presets:', error);
      }
    }
  }, [presets, isLoading]);

  const savePreset = useCallback((
    name: string,
    filter: number,
    filterIntensity: number,
    adjustments: ImageAdjustments
  ): EditPreset => {
    const newPreset: EditPreset = {
      id: `preset-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: name.trim() || `Preset ${presets.length + 1}`,
      filter,
      filterIntensity,
      adjustments: { ...adjustments },
      createdAt: Date.now(),
    };

    setPresets(prev => {
      const updated = [newPreset, ...prev];
      // Limit to max presets
      if (updated.length > MAX_PRESETS) {
        return updated.slice(0, MAX_PRESETS);
      }
      return updated;
    });

    return newPreset;
  }, [presets.length]);

  const deletePreset = useCallback((id: string) => {
    setPresets(prev => prev.filter(p => p.id !== id));
  }, []);

  const renamePreset = useCallback((id: string, newName: string) => {
    setPresets(prev => prev.map(p => 
      p.id === id ? { ...p, name: newName.trim() || p.name } : p
    ));
  }, []);

  const applyPreset = useCallback((preset: EditPreset) => {
    return {
      filter: preset.filter,
      filterIntensity: preset.filterIntensity,
      adjustments: { ...preset.adjustments },
    };
  }, []);

  return {
    presets,
    savePreset,
    deletePreset,
    renamePreset,
    applyPreset,
    isLoading,
  };
}

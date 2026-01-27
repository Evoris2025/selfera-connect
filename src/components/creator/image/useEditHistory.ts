import { useState, useCallback, useRef } from 'react';
import type { CarouselImage, ImageAdjustments, CropData } from './types';

// Represents a single edit action that can be undone/redone
interface EditAction {
  imageId: string;
  type: 'filter' | 'adjustment' | 'crop' | 'batch';
  previousState: Partial<CarouselImage>;
  newState: Partial<CarouselImage>;
  timestamp: number;
}

interface UseEditHistoryProps {
  maxHistorySize?: number;
}

interface UseEditHistoryReturn {
  // Record a change to history
  recordChange: (
    imageId: string,
    type: EditAction['type'],
    previousState: Partial<CarouselImage>,
    newState: Partial<CarouselImage>
  ) => void;
  
  // Undo/Redo operations
  undo: (applyChange: (imageId: string, state: Partial<CarouselImage>) => void) => void;
  redo: (applyChange: (imageId: string, state: Partial<CarouselImage>) => void) => void;
  
  // State
  canUndo: boolean;
  canRedo: boolean;
  historyLength: number;
  undoStackLength: number;
  
  // Clear history
  clearHistory: () => void;
}

export function useEditHistory({ 
  maxHistorySize = 20 
}: UseEditHistoryProps = {}): UseEditHistoryReturn {
  const [history, setHistory] = useState<EditAction[]>([]);
  const [redoStack, setRedoStack] = useState<EditAction[]>([]);
  
  // Debounce similar actions (e.g., rapid slider movements)
  const lastActionRef = useRef<{ type: string; imageId: string; timestamp: number } | null>(null);
  const pendingActionRef = useRef<EditAction | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const recordChange = useCallback((
    imageId: string,
    type: EditAction['type'],
    previousState: Partial<CarouselImage>,
    newState: Partial<CarouselImage>
  ) => {
    const now = Date.now();
    const lastAction = lastActionRef.current;
    
    // Debounce rapid changes of the same type on the same image
    const shouldDebounce = 
      lastAction && 
      lastAction.type === type && 
      lastAction.imageId === imageId && 
      now - lastAction.timestamp < 300; // 300ms debounce window
    
    const action: EditAction = {
      imageId,
      type,
      previousState,
      newState,
      timestamp: now,
    };

    if (shouldDebounce) {
      // Update the pending action's newState but keep original previousState
      if (pendingActionRef.current) {
        pendingActionRef.current = {
          ...pendingActionRef.current,
          newState,
          timestamp: now,
        };
      }
      
      // Reset debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      debounceTimerRef.current = setTimeout(() => {
        if (pendingActionRef.current) {
          setHistory(prev => {
            const newHistory = [...prev, pendingActionRef.current!];
            // Trim to max size
            if (newHistory.length > maxHistorySize) {
              return newHistory.slice(newHistory.length - maxHistorySize);
            }
            return newHistory;
          });
          pendingActionRef.current = null;
        }
        lastActionRef.current = null;
      }, 300);
      
      return;
    }
    
    // Flush any pending action first
    if (pendingActionRef.current) {
      setHistory(prev => {
        const newHistory = [...prev, pendingActionRef.current!];
        if (newHistory.length > maxHistorySize) {
          return newHistory.slice(newHistory.length - maxHistorySize);
        }
        return newHistory;
      });
      pendingActionRef.current = null;
    }
    
    // Start new pending action
    pendingActionRef.current = action;
    lastActionRef.current = { type, imageId, timestamp: now };
    
    // Clear redo stack when new action is recorded
    setRedoStack([]);
    
    // Set timer to commit this action
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      if (pendingActionRef.current) {
        setHistory(prev => {
          const newHistory = [...prev, pendingActionRef.current!];
          if (newHistory.length > maxHistorySize) {
            return newHistory.slice(newHistory.length - maxHistorySize);
          }
          return newHistory;
        });
        pendingActionRef.current = null;
      }
      lastActionRef.current = null;
    }, 300);
  }, [maxHistorySize]);

  const undo = useCallback((applyChange: (imageId: string, state: Partial<CarouselImage>) => void) => {
    // Flush pending action first
    if (pendingActionRef.current) {
      setHistory(prev => [...prev, pendingActionRef.current!]);
      pendingActionRef.current = null;
    }
    
    setHistory(prev => {
      if (prev.length === 0) return prev;
      
      const lastAction = prev[prev.length - 1];
      
      // Apply the previous state
      applyChange(lastAction.imageId, lastAction.previousState);
      
      // Move to redo stack
      setRedoStack(redoPrev => [...redoPrev, lastAction]);
      
      return prev.slice(0, -1);
    });
  }, []);

  const redo = useCallback((applyChange: (imageId: string, state: Partial<CarouselImage>) => void) => {
    setRedoStack(prev => {
      if (prev.length === 0) return prev;
      
      const lastRedo = prev[prev.length - 1];
      
      // Apply the new state
      applyChange(lastRedo.imageId, lastRedo.newState);
      
      // Move back to history
      setHistory(historyPrev => [...historyPrev, lastRedo]);
      
      return prev.slice(0, -1);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setRedoStack([]);
    pendingActionRef.current = null;
    lastActionRef.current = null;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, []);

  // Calculate if pending action should count towards history
  const effectiveHistoryLength = history.length + (pendingActionRef.current ? 1 : 0);

  return {
    recordChange,
    undo,
    redo,
    canUndo: effectiveHistoryLength > 0,
    canRedo: redoStack.length > 0,
    historyLength: effectiveHistoryLength,
    undoStackLength: redoStack.length,
    clearHistory,
  };
}

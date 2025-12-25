import { useState, useCallback, useRef, useEffect } from 'react';

interface OptimisticState {
  isActive: boolean;
  count: number;
}

interface UseOptimisticReactionOptions {
  initialActive: boolean;
  initialCount: number;
  onToggle: (newState: boolean) => Promise<void>;
  debounceMs?: number;
}

interface UseOptimisticReactionReturn {
  isActive: boolean;
  count: number;
  toggle: () => void;
  isPending: boolean;
}

export function useOptimisticReaction({
  initialActive,
  initialCount,
  onToggle,
  debounceMs = 300,
}: UseOptimisticReactionOptions): UseOptimisticReactionReturn {
  // UI state (optimistic, instant)
  const [uiState, setUiState] = useState<OptimisticState>({
    isActive: initialActive,
    count: initialCount,
  });
  
  // Track pending server state
  const [isPending, setIsPending] = useState(false);
  
  // Track the latest intended state for debouncing
  const latestStateRef = useRef<boolean>(initialActive);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);
  
  // Sync with props changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    // Only sync if not pending (server reconciliation)
    if (!isPending) {
      setUiState({
        isActive: initialActive,
        count: initialCount,
      });
      latestStateRef.current = initialActive;
    }
  }, [initialActive, initialCount, isPending]);

  const toggle = useCallback(() => {
    // Immediately update UI state (optimistic)
    const newActive = !uiState.isActive;
    const newCount = uiState.count + (newActive ? 1 : -1);
    
    setUiState({
      isActive: newActive,
      count: Math.max(0, newCount),
    });
    
    // Track latest intended state
    latestStateRef.current = newActive;
    
    // Clear any pending debounce
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Debounce server call
    debounceTimeoutRef.current = setTimeout(async () => {
      // Only make server call if state differs from what server knows
      const stateToSync = latestStateRef.current;
      
      setIsPending(true);
      
      try {
        await onToggle(stateToSync);
      } catch (error) {
        // Revert UI state on failure
        setUiState(prev => ({
          isActive: !prev.isActive,
          count: Math.max(0, prev.count + (prev.isActive ? -1 : 1)),
        }));
        latestStateRef.current = !stateToSync;
      } finally {
        setIsPending(false);
      }
    }, debounceMs);
  }, [uiState.isActive, uiState.count, onToggle, debounceMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    isActive: uiState.isActive,
    count: uiState.count,
    toggle,
    isPending,
  };
}

// Simpler version for non-count toggles (like bookmark)
interface UseOptimisticToggleOptions {
  initialActive: boolean;
  onToggle: (newState: boolean) => Promise<void>;
  debounceMs?: number;
}

export function useOptimisticToggle({
  initialActive,
  onToggle,
  debounceMs = 300,
}: UseOptimisticToggleOptions) {
  const [isActive, setIsActive] = useState(initialActive);
  const [isPending, setIsPending] = useState(false);
  const latestStateRef = useRef(initialActive);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!isPending) {
      setIsActive(initialActive);
      latestStateRef.current = initialActive;
    }
  }, [initialActive, isPending]);

  const toggle = useCallback(() => {
    const newState = !isActive;
    setIsActive(newState);
    latestStateRef.current = newState;

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      setIsPending(true);
      try {
        await onToggle(latestStateRef.current);
      } catch (error) {
        setIsActive(!latestStateRef.current);
        latestStateRef.current = !latestStateRef.current;
      } finally {
        setIsPending(false);
      }
    }, debounceMs);
  }, [isActive, onToggle, debounceMs]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return { isActive, toggle, isPending };
}

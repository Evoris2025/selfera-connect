import { useCallback } from 'react';
import { useMockSystem } from '@/contexts/MockSystemContext';
import { useAuth } from '@/contexts/AuthContext';

interface UseMockLibraryResult {
  inLibrary: boolean;
  toggleLibrary: () => Promise<void>;
  isLoading: boolean;
}

export function useMockLibrary(postId: string): UseMockLibraryResult {
  const { user } = useAuth();
  const { isSaved, toggleSave } = useMockSystem();

  const inLibrary = isSaved(postId);

  const toggleLibrary = useCallback(async () => {
    if (!user?.id) return;
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    toggleSave(postId);
  }, [user?.id, postId, toggleSave]);

  return {
    inLibrary,
    toggleLibrary,
    isLoading: false,
  };
}

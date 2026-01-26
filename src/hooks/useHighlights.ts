import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Highlight {
  id: string;
  userId: string;
  name: string;
  coverUrl: string;
  createdAt: Date;
  updatedAt: Date;
  itemCount: number;
}

export interface HighlightItem {
  id: string;
  highlightId: string;
  expressionId: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  orderIndex: number;
  createdAt: Date;
}

/**
 * Hook for managing user highlights (saved expression collections)
 * Currently uses mock data - will integrate with database tables when migration is approved
 */
export function useHighlights(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock highlights for now
  useEffect(() => {
    if (!targetUserId) {
      setHighlights([]);
      setIsLoading(false);
      return;
    }

    // Simulate loading
    setIsLoading(true);
    
    // Mock data
    const mockHighlights: Highlight[] = [
      {
        id: 'h1',
        userId: targetUserId,
        name: 'Travel',
        coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop',
        createdAt: new Date(),
        updatedAt: new Date(),
        itemCount: 5,
      },
      {
        id: 'h2',
        userId: targetUserId,
        name: 'Wellness',
        coverUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=200&h=200&fit=crop',
        createdAt: new Date(),
        updatedAt: new Date(),
        itemCount: 8,
      },
      {
        id: 'h3',
        userId: targetUserId,
        name: 'Gratitude',
        coverUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=200&h=200&fit=crop',
        createdAt: new Date(),
        updatedAt: new Date(),
        itemCount: 12,
      },
    ];

    setTimeout(() => {
      setHighlights(mockHighlights);
      setIsLoading(false);
    }, 300);
  }, [targetUserId]);

  const createHighlight = useCallback(async (name: string, coverUrl: string) => {
    if (!user?.id) return null;

    const newHighlight: Highlight = {
      id: `h-${Date.now()}`,
      userId: user.id,
      name,
      coverUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
      itemCount: 0,
    };

    setHighlights(prev => [newHighlight, ...prev]);
    return newHighlight;
  }, [user?.id]);

  const deleteHighlight = useCallback(async (highlightId: string) => {
    setHighlights(prev => prev.filter(h => h.id !== highlightId));
  }, []);

  const addToHighlight = useCallback(async (
    highlightId: string,
    expressionId: string,
    mediaUrl: string,
    mediaType: 'image' | 'video'
  ) => {
    setHighlights(prev => prev.map(h => 
      h.id === highlightId 
        ? { ...h, itemCount: h.itemCount + 1, updatedAt: new Date() }
        : h
    ));
  }, []);

  const removeFromHighlight = useCallback(async (highlightId: string, itemId: string) => {
    setHighlights(prev => prev.map(h => 
      h.id === highlightId 
        ? { ...h, itemCount: Math.max(0, h.itemCount - 1), updatedAt: new Date() }
        : h
    ));
  }, []);

  return {
    highlights,
    isLoading,
    createHighlight,
    deleteHighlight,
    addToHighlight,
    removeFromHighlight,
  };
}

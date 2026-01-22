import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UseNewConversationResult {
  startConversation: (targetUserId: string) => Promise<string | null>;
  findExistingConversation: (targetUserId: string) => Promise<string | null>;
}

export function useNewConversation(): UseNewConversationResult {
  const { user } = useAuth();

  // Find existing conversation between current user and target user
  const findExistingConversation = useCallback(async (targetUserId: string): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      // Get all conversations the current user is part of
      const { data: myConversations, error: myError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (myError) throw myError;
      if (!myConversations || myConversations.length === 0) return null;

      const myConversationIds = myConversations.map(c => c.conversation_id);

      // Check if target user is in any of these conversations (for 1:1)
      const { data: sharedConversations, error: sharedError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', targetUserId)
        .in('conversation_id', myConversationIds);

      if (sharedError) throw sharedError;
      if (!sharedConversations || sharedConversations.length === 0) return null;

      // Verify it's a 1:1 conversation (exactly 2 participants)
      for (const conv of sharedConversations) {
        const { count, error: countError } = await supabase
          .from('conversation_participants')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.conversation_id);

        if (!countError && count === 2) {
          return conv.conversation_id;
        }
      }

      return null;
    } catch (error) {
      console.error('Error finding existing conversation:', error);
      return null;
    }
  }, [user?.id]);

  // Start a new conversation or return existing one
  const startConversation = useCallback(async (targetUserId: string): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      // First check for existing conversation
      const existingId = await findExistingConversation(targetUserId);
      if (existingId) {
        return existingId;
      }

      // Create new conversation
      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single();

      if (convError) throw convError;

      // Add both participants
      const { error: partError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: newConversation.id, user_id: user.id },
          { conversation_id: newConversation.id, user_id: targetUserId },
        ]);

      if (partError) throw partError;

      return newConversation.id;
    } catch (error) {
      console.error('Error starting conversation:', error);
      return null;
    }
  }, [user?.id, findExistingConversation]);

  return {
    startConversation,
    findExistingConversation,
  };
}

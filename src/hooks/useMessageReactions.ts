import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MessageReaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

interface UseMessageReactionsResult {
  reactions: Map<string, MessageReaction[]>;
  toggleReaction: (messageId: string, emoji: string) => Promise<void>;
  isLoading: boolean;
}

export function useMessageReactions(conversationId: string | null): UseMessageReactionsResult {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<Map<string, MessageReaction[]>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  // Fetch reactions for all messages in conversation
  const fetchReactions = useCallback(async () => {
    if (!conversationId || !user?.id) return;

    try {
      // Get all message IDs in this conversation
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversationId);

      if (msgError) throw msgError;
      if (!messages || messages.length === 0) return;

      const messageIds = messages.map(m => m.id);

      // Get all reactions for these messages
      const { data: reactionData, error: reactError } = await supabase
        .from('message_reactions')
        .select('message_id, emoji, user_id')
        .in('message_id', messageIds);

      if (reactError) throw reactError;

      // Build reactions map
      const reactionsMap = new Map<string, MessageReaction[]>();

      messageIds.forEach(msgId => {
        const msgReactions = reactionData?.filter(r => r.message_id === msgId) || [];
        const emojiCounts = new Map<string, { count: number; userReacted: boolean }>();

        msgReactions.forEach(r => {
          const existing = emojiCounts.get(r.emoji) || { count: 0, userReacted: false };
          emojiCounts.set(r.emoji, {
            count: existing.count + 1,
            userReacted: existing.userReacted || r.user_id === user.id,
          });
        });

        const formattedReactions: MessageReaction[] = Array.from(emojiCounts.entries()).map(
          ([emoji, data]) => ({
            emoji,
            count: data.count,
            userReacted: data.userReacted,
          })
        );

        if (formattedReactions.length > 0) {
          reactionsMap.set(msgId, formattedReactions);
        }
      });

      setReactions(reactionsMap);
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  }, [conversationId, user?.id]);

  // Toggle reaction (add or remove)
  const toggleReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!user?.id) return;

    // Optimistic update
    setReactions(prev => {
      const newMap = new Map(prev);
      const msgReactions = [...(newMap.get(messageId) || [])];
      const existingIdx = msgReactions.findIndex(r => r.emoji === emoji);

      if (existingIdx >= 0) {
        const existing = msgReactions[existingIdx];
        if (existing.userReacted) {
          // Remove user's reaction
          if (existing.count === 1) {
            msgReactions.splice(existingIdx, 1);
          } else {
            msgReactions[existingIdx] = {
              ...existing,
              count: existing.count - 1,
              userReacted: false,
            };
          }
        } else {
          // Add user's reaction
          msgReactions[existingIdx] = {
            ...existing,
            count: existing.count + 1,
            userReacted: true,
          };
        }
      } else {
        // New emoji reaction
        msgReactions.push({ emoji, count: 1, userReacted: true });
      }

      if (msgReactions.length > 0) {
        newMap.set(messageId, msgReactions);
      } else {
        newMap.delete(messageId);
      }

      return newMap;
    });

    try {
      // Check if user already reacted with this emoji
      const { data: existing } = await supabase
        .from('message_reactions')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji)
        .single();

      if (existing) {
        // Remove reaction
        await supabase
          .from('message_reactions')
          .delete()
          .eq('id', existing.id);
      } else {
        // Add reaction
        await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: user.id,
            emoji,
          });
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
      // Revert on error
      fetchReactions();
    }
  }, [user?.id, fetchReactions]);

  // Initial fetch
  useEffect(() => {
    if (conversationId) {
      setIsLoading(true);
      fetchReactions().finally(() => setIsLoading(false));
    }
  }, [conversationId, fetchReactions]);

  // Realtime subscription for reactions
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`message-reactions-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
        },
        () => {
          // Refetch on any change
          fetchReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, fetchReactions]);

  return {
    reactions,
    toggleReaction,
    isLoading,
  };
}

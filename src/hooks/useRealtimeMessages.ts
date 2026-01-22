import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSafety } from '@/contexts/SafetyContext';

interface Participant {
  id: string;
  name: string;
  handle: string;
  avatarUrl?: string;
  isOnline?: boolean;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
  readAt?: Date;
}

interface Conversation {
  id: string;
  participant: Participant;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isTyping?: boolean;
}

interface UseRealtimeMessagesResult {
  conversations: Conversation[];
  messages: Message[];
  isLoading: boolean;
  sendMessage: (conversationId: string, content: string, imageUrl?: string) => Promise<boolean>;
  markConversationRead: (conversationId: string) => Promise<void>;
  selectConversation: (conversationId: string | null) => void;
  selectedConversationId: string | null;
  refetch: () => Promise<void>;
}

export function useRealtimeMessages(): UseRealtimeMessagesResult {
  const { user } = useAuth();
  const { shouldHideUser } = useSafety();
  const [allConversations, setAllConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter out conversations with blocked users
  const conversations = useMemo(() => {
    return allConversations.filter(conv => !shouldHideUser(conv.participant.id));
  }, [allConversations, shouldHideUser]);

  const fetchConversations = useCallback(async () => {
    if (!user?.id) {
      setAllConversations([]);
      setIsLoading(false);
      return;
    }

    try {
      // Get conversations the user is part of
      const { data: participations, error: partError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (partError) throw partError;

      if (!participations || participations.length === 0) {
        setAllConversations([]);
        setIsLoading(false);
        return;
      }

      const conversationIds = participations.map(p => p.conversation_id);

      // Get other participants for each conversation
      const { data: otherParticipants, error: opError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          user_id,
          profiles!conversation_participants_user_id_fkey (
            id,
            display_name,
            handle,
            avatar_url
          )
        `)
        .in('conversation_id', conversationIds)
        .neq('user_id', user.id);

      if (opError) throw opError;

      // Get latest messages for each conversation
      const { data: latestMessages, error: msgError } = await supabase
        .from('messages')
        .select('conversation_id, content, created_at, sender_id, read_at')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false });

      if (msgError) throw msgError;

      // Build conversation objects
      const conversationMap = new Map<string, Conversation>();

      otherParticipants?.forEach(op => {
        const profile = op.profiles as any;
        if (!profile) return;

        const conversationMessages = latestMessages?.filter(m => m.conversation_id === op.conversation_id) || [];
        const lastMsg = conversationMessages[0];
        const unreadCount = conversationMessages.filter(m => 
          m.sender_id !== user.id && !m.read_at
        ).length;

        conversationMap.set(op.conversation_id, {
          id: op.conversation_id,
          participant: {
            id: profile.id,
            name: profile.display_name || profile.handle || 'Anonymous',
            handle: profile.handle || 'anonymous',
            avatarUrl: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`,
          },
          lastMessage: lastMsg?.content || '',
          lastMessageTime: lastMsg ? new Date(lastMsg.created_at) : new Date(),
          unreadCount,
        });
      });

      setAllConversations(Array.from(conversationMap.values()).sort((a, b) => 
        b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
      ));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!user?.id || !conversationId) {
      setMessages([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      setMessages((data || []).map(m => ({
        id: m.id,
        conversationId: m.conversation_id,
        senderId: m.sender_id,
        content: m.content || '',
        imageUrl: m.image_url || undefined,
        createdAt: new Date(m.created_at),
        readAt: m.read_at ? new Date(m.read_at) : undefined,
      })));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [user?.id]);

  const selectConversation = useCallback((conversationId: string | null) => {
    setSelectedConversationId(conversationId);
    if (conversationId) {
      fetchMessages(conversationId);
    } else {
      setMessages([]);
    }
  }, [fetchMessages]);

  const sendMessage = useCallback(async (conversationId: string, content: string, imageUrl?: string): Promise<boolean> => {
    if (!user?.id || !content.trim()) return false;

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      id: tempId,
      conversationId,
      senderId: user.id,
      content,
      imageUrl,
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          image_url: imageUrl || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Replace temp message with real one
      setMessages(prev => prev.map(m => 
        m.id === tempId ? {
          ...m,
          id: data.id,
          createdAt: new Date(data.created_at),
        } : m
      ));

      // Update conversation's last message
      setAllConversations(prev => prev.map(conv => 
        conv.id === conversationId ? {
          ...conv,
          lastMessage: content,
          lastMessageTime: new Date(),
        } : conv
      ).sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime()));

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove temp message
      setMessages(prev => prev.filter(m => m.id !== tempId));
      return false;
    }
  }, [user?.id]);

  const markConversationRead = useCallback(async (conversationId: string) => {
    if (!user?.id) return;

    // Optimistic update
    setAllConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
    ));

    try {
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .is('read_at', null);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking conversation read:', error);
    }
  }, [user?.id]);

  // Initial fetch
  useEffect(() => {
    setIsLoading(true);
    fetchConversations();
  }, [fetchConversations]);

  // Realtime subscription for new messages
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`messages-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as any;
          
          // If this is for the currently selected conversation, add to messages
          if (newMessage.conversation_id === selectedConversationId) {
            setMessages(prev => {
              // Avoid duplicates
              if (prev.some(m => m.id === newMessage.id)) return prev;
              return [...prev, {
                id: newMessage.id,
                conversationId: newMessage.conversation_id,
                senderId: newMessage.sender_id,
                content: newMessage.content || '',
                imageUrl: newMessage.image_url || undefined,
                createdAt: new Date(newMessage.created_at),
                readAt: newMessage.read_at ? new Date(newMessage.read_at) : undefined,
              }];
            });
          }

          // Update conversations list
          setAllConversations(prev => {
            const existing = prev.find(c => c.id === newMessage.conversation_id);
            if (existing) {
              return prev.map(conv => 
                conv.id === newMessage.conversation_id ? {
                  ...conv,
                  lastMessage: newMessage.content || '',
                  lastMessageTime: new Date(newMessage.created_at),
                  unreadCount: newMessage.sender_id !== user.id 
                    ? conv.unreadCount + 1 
                    : conv.unreadCount,
                } : conv
              ).sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
            }
            // New conversation - refetch
            fetchConversations();
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, selectedConversationId, fetchConversations]);

  return {
    conversations,
    messages,
    isLoading,
    sendMessage,
    markConversationRead,
    selectConversation,
    selectedConversationId,
    refetch: fetchConversations,
  };
}

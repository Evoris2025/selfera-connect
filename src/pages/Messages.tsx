import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Edit,
  ArrowLeft,
  Send,
  Image as ImageIcon,
  CheckCheck,
  ChevronDown,
  Plus,
  Paperclip,
  Phone,
  Video,
  Upload,
  MessageCircle,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { AppLayout } from '@/components/AppLayout';
import { useMockSystem, type MockConversation, type MockMessage } from '@/contexts/MockSystemContext';
import { useSafety } from '@/contexts/SafetyContext';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { useMessageReactions } from '@/hooks/useMessageReactions';
import { useNewConversation } from '@/hooks/useNewConversation';
import { useMessageImageUpload } from '@/hooks/useMessageImageUpload';
import { NewConversationModal } from '@/components/messages/NewConversationModal';
import { ReactionPicker, MessageReactions } from '@/components/messages/MessageReactions';
import { ReadReceipt } from '@/components/messages/ReadReceipt';
import { ImagePreviewBar } from '@/components/messages/ImagePreviewBar';
import { ImageMessage } from '@/components/messages/ImageMessage';
import { EraVerifiedTick } from '@/components/EraVerifiedTick';
import { supabase } from '@/integrations/supabase/client';
import { BrandSurface, BrandIcon, BrandSectionLabel } from '@/components/brand';
import { useThemeColor } from '@/hooks/useThemeColor';

// Dopamine-driven spring configs
const springSnap = { type: 'spring' as const, stiffness: 700, damping: 30, mass: 0.8 };
const springBounce = { type: 'spring' as const, stiffness: 500, damping: 15, mass: 0.5 };
const springPop = { type: 'spring' as const, stiffness: 600, damping: 12 };

interface QuickAccessUser {
  id: string;
  name: string;
  avatarUrl?: string;
  isOnline?: boolean;
  hasNote?: boolean;
  note?: string;
}

const mockQuickAccess: QuickAccessUser[] = [
  { id: 'note', name: 'Your note', hasNote: true, note: '✨' },
  { id: 'new', name: 'New', isOnline: false },
  { id: '1', name: 'Mind', isOnline: true },
  { id: '2', name: 'Sarah', isOnline: true },
  { id: '3', name: 'Jamie', isOnline: false },
  { id: '4', name: 'Alex', isOnline: true },
];

function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Skeleton className="h-11 w-11 rounded-full" />
      <div className="flex-1 space-y-2.5">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
  );
}

function TypingIndicator({ color }: { color?: string }) {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color ?? 'rgba(255,255,255,0.45)' }}
          animate={{ y: -6 }}
          transition={{
            duration: 0.25,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: i * 0.15,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
}

function OnlineDot({ themePrimary }: { themePrimary: string }) {
  return (
    <div
      className="absolute bottom-0 right-0 w-2 h-2 rounded-full"
      style={{ backgroundColor: themePrimary }}
    />
  );
}

// Message bubble with reactions and read receipts
function MessageBubble({
  message,
  isOwnMessage,
  reactions,
  onReact,
  isLastMessage,
  isRead,
  themePrimary,
}: {
  message: MockMessage & { imageUrls?: string[] };
  isOwnMessage: boolean;
  reactions: { emoji: string; count: number; userReacted: boolean }[];
  onReact: (emoji: string) => void;
  isLastMessage: boolean;
  isRead: boolean;
  themePrimary: string;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = () => {
    longPressTimeoutRef.current = setTimeout(() => {
      setShowPicker(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }
  };

  const handleDoubleClick = () => {
    onReact('❤️');
  };

  const hasImages = message.imageUrls && message.imageUrls.length > 0;
  const hasText = !!message.content?.trim();

  return (
    <div className={cn('relative', isOwnMessage ? 'flex flex-col items-end' : 'flex flex-col items-start')}>
      {hasImages && (
        <motion.div
          onDoubleClick={handleDoubleClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          <ImageMessage
            imageUrls={message.imageUrls!}
            isOwnMessage={isOwnMessage}
            caption={hasText ? message.content : undefined}
          />
          <ReactionPicker
            isOpen={showPicker}
            onSelect={onReact}
            onClose={() => setShowPicker(false)}
            position={isOwnMessage ? 'right' : 'left'}
          />
        </motion.div>
      )}

      {!hasImages && hasText && (
        <motion.div
          onDoubleClick={handleDoubleClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'max-w-[78%] px-3.5 py-2.5 rounded-2xl relative border',
            isOwnMessage
              ? 'bg-white/[0.08] border-white/10 text-white'
              : 'bg-transparent border-white/[0.12] text-white/85'
          )}
          style={
            isOwnMessage
              ? { boxShadow: `inset -1.5px 0 0 0 ${themePrimary}` }
              : undefined
          }
        >
          <p className="text-body leading-relaxed">{message.content}</p>

          <ReactionPicker
            isOpen={showPicker}
            onSelect={onReact}
            onClose={() => setShowPicker(false)}
            position={isOwnMessage ? 'right' : 'left'}
          />
        </motion.div>
      )}

      {reactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "flex items-center gap-1 mt-1",
            isOwnMessage ? "justify-end" : "justify-start"
          )}
        >
          {reactions.map((reaction) => (
            <motion.button
              key={reaction.emoji}
              whileTap={{ scale: 0.85 }}
              onClick={() => onReact(reaction.emoji)}
              className={cn(
                "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-label border",
                "bg-white/[0.06] border-white/10"
              )}
              style={reaction.userReacted ? { borderColor: themePrimary } : undefined}
            >
              <span>{reaction.emoji}</span>
              {reaction.count > 1 && (
                <span className="text-white/55 text-caption">{reaction.count}</span>
              )}
            </motion.button>
          ))}
        </motion.div>
      )}

      {isOwnMessage && isLastMessage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-1 flex justify-end"
        >
          <span className="text-white/45 text-caption uppercase tracking-[0.08em]">
            {isRead ? 'READ' : 'SENT'}
          </span>
        </motion.div>
      )}
    </div>
  );
}

export default function Messages() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { state, sendMessage: sendMockMessage, markConversationRead } = useMockSystem();
  const { shouldHideUser } = useSafety();
  const { typingUsers, setTyping, onlineUsers } = useRealtimeMessages();
  const { startConversation, findExistingConversation } = useNewConversation();
  const themeColor = useThemeColor();
  const themePrimary = themeColor.primary;
  const {
    isUploading,
    uploadProgress,
    pendingImages,
    selectImages,
    removePendingImage,
    clearPendingImages,
    uploadImages,
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handlePaste,
  } = useMessageImageUpload();
  const [selectedConversation, setSelectedConversation] = useState<MockConversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [messageReactions, setMessageReactions] = useState<Map<string, { emoji: string; count: number; userReacted: boolean }[]>>(new Map());
  const [readMessages, setReadMessages] = useState<Set<string>>(new Set());
  const [deepLinkUser, setDeepLinkUser] = useState<{ id: string; name: string; handle?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const requestCount = 2;

  useEffect(() => {
    const targetUserId = searchParams.get('user');
    const targetConversationId = searchParams.get('conversation');

    if (!targetUserId && !targetConversationId) return;

    const handleDeepLink = async () => {
      setIsLoading(true);
      try {
        if (targetConversationId) {
          const { data: participants } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', targetConversationId);

          if (participants && participants.length > 0) {
            const { data: sessionData } = await supabase.auth.getSession();
            const currentUserId = sessionData?.session?.user?.id;
            const otherParticipant = participants.find(p => p.user_id !== currentUserId);

            if (otherParticipant) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('id, display_name, handle, avatar_url, is_verified, email')
                .eq('id', otherParticipant.user_id)
                .single();

              if (profile) {
                const tempConv: MockConversation = {
                  id: targetConversationId,
                  participant: {
                    id: profile.id,
                    name: profile.display_name || 'User',
                    handle: profile.handle || 'user',
                    avatarUrl: profile.avatar_url || undefined,
                    isOnline: false,
                    isVerified: profile.is_verified ?? false,
                    email: profile.email || undefined,
                  },
                  lastMessage: '',
                  lastMessageTime: 'now',
                  unread: false,
                  messages: [],
                  isNew: false,
                };
                setSelectedConversation(tempConv);
              }
            }
          }

          setSearchParams({}, { replace: true });
          setIsLoading(false);
          return;
        }

        if (targetUserId) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, display_name, handle, avatar_url, is_verified, email')
            .eq('id', targetUserId)
            .single();

          if (profile) {
            setDeepLinkUser({
              id: profile.id,
              name: profile.display_name || 'User',
              handle: profile.handle || undefined,
            });

            const conversationId = await startConversation(targetUserId);
            if (conversationId) {
              const existingConv = state.conversations.find(c => c.id === conversationId);
              if (existingConv) {
                setSelectedConversation(existingConv);
              } else {
                const tempConv: MockConversation = {
                  id: conversationId,
                  participant: {
                    id: profile.id,
                    name: profile.display_name || 'User',
                    handle: profile.handle || 'user',
                    avatarUrl: profile.avatar_url || undefined,
                    isOnline: false,
                    isVerified: profile.is_verified ?? false,
                    email: profile.email || undefined,
                  },
                  lastMessage: '',
                  lastMessageTime: 'now',
                  unread: false,
                  messages: [],
                  isNew: true,
                };
                setSelectedConversation(tempConv);
              }
            }
          }

          setSearchParams({}, { replace: true });
        }
      } catch (err) {
        console.error('Error handling deep link:', err);
      } finally {
        setIsLoading(false);
      }
    };

    handleDeepLink();
  }, [searchParams, startConversation, state.conversations, setSearchParams]);

  const conversations = useMemo(() => {
    return state.conversations.filter(conv => !shouldHideUser(conv.participant.id));
  }, [state.conversations, shouldHideUser]);

  const messages = useMemo(() => {
    if (!selectedConversation) return [];
    const conv = state.conversations.find(c => c.id === selectedConversation.id);
    return conv?.messages || [];
  }, [state.conversations, selectedConversation]);

  const currentTypingUsers = useMemo(() => {
    if (!selectedConversation) return [];
    return typingUsers.get(selectedConversation.id) || [];
  }, [selectedConversation, typingUsers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    if (value.trim()) {
      setTyping(true);
    } else {
      setTyping(false);
    }
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.participant.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && pendingImages.length === 0) || !selectedConversation) return;

    setIsSending(true);
    setTyping(false);

    let imageUrls: string[] = [];

    if (pendingImages.length > 0) {
      const uploadedUrls = await uploadImages();
      if (uploadedUrls.length > 0) {
        imageUrls = uploadedUrls;
      }
    }

    if (newMessage.trim() || imageUrls.length > 0) {
      sendMockMessage(selectedConversation.id, newMessage || '📷 Photo', imageUrls);
    }
    setNewMessage('');

    setTimeout(() => {
      setIsSending(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

      setTimeout(() => {
        if (messages.length > 0) {
          setReadMessages(prev => new Set([...prev, messages[messages.length - 1]?.id || '']));
        }
      }, 2000);
    }, 100);
  };

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      selectImages(files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [selectImages]);

  const triggerImagePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleSelectConversation = (conv: MockConversation) => {
    setSelectedConversation(conv);
    markConversationRead(conv.id);
  };

  const handleStartNewConversation = async (userId: string) => {
    const conversationId = await startConversation(userId);
    if (conversationId) {
      const conv = conversations.find(c => c.id === conversationId);
      if (conv) {
        setSelectedConversation(conv);
      }
    }
  };

  const handleReactToMessage = (messageId: string, emoji: string) => {
    setMessageReactions(prev => {
      const newMap = new Map(prev);
      const msgReactions = [...(newMap.get(messageId) || [])];
      const existingIdx = msgReactions.findIndex(r => r.emoji === emoji);

      if (existingIdx >= 0) {
        const existing = msgReactions[existingIdx];
        if (existing.userReacted) {
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
          msgReactions[existingIdx] = {
            ...existing,
            count: existing.count + 1,
            userReacted: true,
          };
        }
      } else {
        msgReactions.push({ emoji, count: 1, userReacted: true });
      }

      if (msgReactions.length > 0) {
        newMap.set(messageId, msgReactions);
      } else {
        newMap.delete(messageId);
      }

      return newMap;
    });
  };

  const getLastMessagePreview = (conv: MockConversation) => {
    return conv.lastMessage;
  };

  const sendActive = newMessage.trim().length > 0 || pendingImages.length > 0;

  // Conversation View
  if (selectedConversation) {
    return (
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={springSnap}
        className="flex flex-col h-[100dvh] bg-background relative"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Drop zone overlay */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center gap-4 pointer-events-none"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={springPop}
                className="p-6 rounded-2xl bg-white/[0.04] border-2 border-dashed"
                style={{ borderColor: themePrimary }}
              >
                <Upload className="h-12 w-12" style={{ color: themePrimary }} />
              </motion.div>
              <div className="text-center">
                <p className="text-title font-semibold text-white">Drop images here</p>
                <p className="text-body text-white/55">Up to 10 images at once</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...springBounce, delay: 0.1 }}
          className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.08] bg-background"
        >
          <motion.button
            whileTap={{ scale: 0.85 }}
            transition={springSnap}
            onClick={() => setSelectedConversation(null)}
            className="shrink-0 -ml-1 h-9 w-9 rounded-full flex items-center justify-center"
          >
            <BrandIcon icon={ArrowLeft} size={20} />
          </motion.button>
          <div className="relative">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-white/[0.08] text-white text-caption font-medium">
                {selectedConversation.participant.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {(selectedConversation.participant.isOnline || onlineUsers.has(selectedConversation.participant.id)) && (
              <OnlineDot themePrimary={themePrimary} />
            )}
          </div>
          <div className="flex-1 min-w-0 text-center">
            <div className="flex items-center justify-center gap-1">
              <p className="font-medium text-body text-white truncate">
                {selectedConversation.participant.name}
              </p>
              {selectedConversation.participant.isVerified && (
                <EraVerifiedTick size="sm" userEmail={selectedConversation.participant.email} />
              )}
            </div>
            {(selectedConversation.participant.isOnline || onlineUsers.has(selectedConversation.participant.id)) && currentTypingUsers.length > 0 && (
              <p className="text-caption uppercase tracking-[0.08em] text-white/45">typing…</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <motion.button whileTap={{ scale: 0.85 }} transition={springSnap} className="h-9 w-9 rounded-full flex items-center justify-center">
              <BrandIcon icon={Phone} size={18} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.85 }} transition={springSnap} className="h-9 w-9 rounded-full flex items-center justify-center">
              <BrandIcon icon={Video} size={18} />
            </motion.button>
          </div>
        </motion.div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
          <AnimatePresence mode="popLayout">
            {messages.map((message, idx) => (
              <motion.div
                key={message.id}
                initial={{
                  opacity: 0,
                  scale: 0.8,
                  x: message.senderId === 'me' ? 50 : -50,
                  y: 20
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: 0,
                  y: 0
                }}
                transition={{ ...springBounce, delay: idx * 0.05 }}
                layout
                className={cn('flex', message.senderId === 'me' ? 'justify-end' : 'justify-start')}
              >
                <MessageBubble
                  message={message}
                  isOwnMessage={message.senderId === 'me'}
                  reactions={messageReactions.get(message.id) || []}
                  onReact={(emoji) => handleReactToMessage(message.id, emoji)}
                  isLastMessage={idx === messages.length - 1}
                  isRead={readMessages.has(message.id)}
                  themePrimary={themePrimary}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {currentTypingUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={springPop}
              className="flex justify-start items-center gap-2"
            >
              <div className="rounded-2xl border border-white/[0.12]">
                <TypingIndicator color={themePrimary} />
              </div>
              <span className="text-caption uppercase tracking-[0.08em] text-white/45">
                typing…
              </span>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* Image Preview */}
        <AnimatePresence>
          {pendingImages.length > 0 && (
            <ImagePreviewBar
              images={pendingImages}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              onRemove={removePendingImage}
              onAddMore={triggerImagePicker}
            />
          )}
        </AnimatePresence>

        {/* Composer */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...springBounce, delay: 0.2 }}
          className="px-4 pb-5 pt-2"
        >
          <BrandSurface className="flex items-center gap-2 rounded-full h-11 px-3">
            <motion.button
              whileTap={{ scale: 0.85 }}
              transition={springSnap}
              onClick={triggerImagePicker}
              disabled={isUploading}
              className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center"
            >
              <BrandIcon icon={Paperclip} size={20} />
            </motion.button>
            <Input
              value={newMessage}
              onChange={handleInputChange}
              onPaste={handlePaste}
              placeholder="message"
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 px-1 h-9 text-body text-white placeholder:text-white/45"
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <motion.button
              whileTap={{ scale: 0.85 }}
              transition={springSnap}
              onClick={handleSendMessage}
              disabled={!sendActive || isSending || isUploading}
              className="shrink-0 h-9 w-9 rounded-full flex items-center justify-center transition-colors"
              style={
                sendActive
                  ? { backgroundColor: themePrimary, color: '#fff' }
                  : { backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }
              }
            >
              <Send className="h-4 w-4" />
            </motion.button>
          </BrandSurface>
        </motion.div>
      </motion.div>
    );
  }

  // Inbox View
  return (
    <AppLayout showHeader={false}>
      <div className="flex flex-col h-[100dvh] bg-background">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={springBounce}
          className="flex items-center justify-between px-5 py-4 bg-background"
        >
          <motion.button
            className="flex items-center gap-1.5 group"
            whileTap={{ scale: 0.95 }}
            transition={springSnap}
          >
            <span className="font-bold text-headline text-white tracking-tight">username</span>
            <motion.div animate={{ rotate: 0 }} whileHover={{ rotate: 180 }} transition={springPop}>
              <ChevronDown className="h-4 w-4 text-white/55" />
            </motion.div>
          </motion.button>
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {requestCount > 0 && (
                <motion.button
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.8 }}
                  transition={springPop}
                  whileTap={{ scale: 0.9 }}
                  className="text-caption uppercase tracking-[0.1em] font-medium"
                  style={{ color: themePrimary }}
                >
                  REQUESTS ({requestCount})
                </motion.button>
              )}
            </AnimatePresence>
            <motion.button
              whileTap={{ scale: 0.85, rotate: 15 }}
              transition={springSnap}
              className="h-10 w-10 rounded-full flex items-center justify-center"
              onClick={() => setShowNewConversation(true)}
            >
              <BrandIcon icon={Edit} size={22} />
            </motion.button>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...springBounce, delay: 0.05 }}
          className="sticky top-0 z-10 px-5 pb-3 bg-background"
        >
          <BrandSurface className="relative flex items-center h-11 px-4 rounded-full">
            <BrandIcon icon={Search} size={18} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="search messages"
              className="flex-1 ml-2 border-0 bg-transparent focus-visible:ring-0 h-9 text-body text-white placeholder:text-white/45"
            />
          </BrandSurface>
        </motion.div>

        {/* Quick Access */}
        <div className="border-b border-white/[0.08]">
          <ScrollArea className="w-full">
            <div className="flex gap-4 px-5 py-4">
              {mockQuickAccess.map((user, idx) => (
                <motion.button
                  key={user.id}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ ...springBounce, delay: idx * 0.05 }}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex flex-col items-center gap-2 min-w-[64px] group"
                  onClick={() => {
                    if (user.id === 'new') {
                      setShowNewConversation(true);
                    } else if (user.id !== 'note') {
                      const conv = conversations.find(c => c.participant.name.toLowerCase().includes(user.name.toLowerCase()));
                      if (conv) setSelectedConversation(conv);
                    }
                  }}
                >
                  <div className="relative">
                    {user.id === 'note' ? (
                      <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-dashed border-white/[0.15] flex items-center justify-center">
                        <span className="text-2xl">{user.note}</span>
                      </div>
                    ) : user.id === 'new' ? (
                      <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.12] flex items-center justify-center">
                        <BrandIcon icon={Plus} size={22} />
                      </div>
                    ) : (
                      <>
                        <Avatar className="h-16 w-16 border border-white/[0.12]">
                          <AvatarFallback className="bg-white/[0.06] text-white text-title font-medium">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {user.isOnline && <OnlineDot themePrimary={themePrimary} />}
                      </>
                    )}
                  </div>
                  <span className="text-caption text-white/55 truncate max-w-[64px]">
                    {user.id === 'note' ? 'your note' : user.id === 'new' ? 'new' : user.name}
                  </span>
                </motion.button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        </div>

        {/* Section label */}
        <div className="px-5 pt-4 pb-2">
          <BrandSectionLabel>MESSAGES</BrandSectionLabel>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto pb-nav-safe">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <ConversationSkeleton key={`skeleton-${i}`} />)
          ) : filteredConversations.length === 0 ? (
            <div className="px-5 py-16 flex flex-col items-center text-center">
              <BrandIcon icon={MessageCircle} size={28} />
              <p className="text-white/55 text-body mt-4">start a conversation.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredConversations.map((conversation, idx) => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, x: -30, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 30, scale: 0.95 }}
                  transition={{ ...springBounce, delay: idx * 0.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectConversation(conversation)}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                  layout
                >
                  <div className="relative">
                    <Avatar
                      className={cn(
                        'h-11 w-11',
                        !conversation.unread && 'border border-white/[0.12]'
                      )}
                      style={
                        conversation.unread
                          ? { boxShadow: `0 0 0 1.5px ${themePrimary}` }
                          : undefined
                      }
                    >
                      <AvatarFallback className="bg-white/[0.06] text-white text-body font-medium">
                        {conversation.participant.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.participant.isOnline && <OnlineDot themePrimary={themePrimary} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-body font-medium text-white truncate">
                      <span className="truncate">{conversation.participant.name}</span>
                      {conversation.participant.isVerified && (
                        <EraVerifiedTick size="sm" userEmail={conversation.participant.email} />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-label text-white/55 truncate mt-0.5 flex-1">
                        {conversation.isTyping ? <TypingIndicator color={themePrimary} /> : getLastMessagePreview(conversation)}
                      </p>
                      {!conversation.unread && (
                        <CheckCheck className="h-3.5 w-3.5 text-white/45 shrink-0" />
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-white/45 text-caption uppercase tracking-[0.08em]">
                      {conversation.lastMessageTime}
                    </span>
                    <AnimatePresence>
                      {conversation.unread && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={springPop}
                          className="text-caption px-1.5 py-0.5 rounded-full border bg-transparent"
                          style={{ borderColor: themePrimary, color: themePrimary }}
                        >
                          NEW
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* New Conversation Modal */}
        <NewConversationModal
          isOpen={showNewConversation}
          onClose={() => setShowNewConversation(false)}
          onStartConversation={handleStartNewConversation}
        />
      </div>
    </AppLayout>
  );
}

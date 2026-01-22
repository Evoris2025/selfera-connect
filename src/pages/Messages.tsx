import { useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Edit, 
  ArrowLeft, 
  Send, 
  Image, 
  CheckCheck, 
  ChevronDown,
  Plus,
  Camera,
  Phone,
  Video,
  Check
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { MobileNav } from '@/components/MobileNav';
import { useMockSystem, type MockConversation, type MockMessage } from '@/contexts/MockSystemContext';
import { useSafety } from '@/contexts/SafetyContext';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { useMessageReactions } from '@/hooks/useMessageReactions';
import { useNewConversation } from '@/hooks/useNewConversation';
import { NewConversationModal } from '@/components/messages/NewConversationModal';
import { ReactionPicker, MessageReactions } from '@/components/messages/MessageReactions';
import { ReadReceipt } from '@/components/messages/ReadReceipt';

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
    <div className="flex items-center gap-4 px-5 py-4">
      <Skeleton className="h-14 w-14 rounded-full" />
      <div className="flex-1 space-y-2.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3.5 w-48" />
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-muted-foreground/50"
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

function OnlineIndicator({ size = 'default', pulse = false }: { size?: 'small' | 'default'; pulse?: boolean }) {
  return (
    <motion.div 
      className={cn(
        "absolute rounded-full bg-emerald-500 border-[2.5px] border-background shadow-sm",
        size === 'small' ? "bottom-0 right-0 w-3.5 h-3.5" : "bottom-0.5 right-0.5 w-4 h-4"
      )}
      animate={pulse ? { scale: 1.2 } : {}}
      transition={springPop}
    >
      {pulse && (
        <span
          className="absolute inset-0 rounded-full bg-emerald-500/60 animate-ping"
        />
      )}
    </motion.div>
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
}: {
  message: MockMessage;
  isOwnMessage: boolean;
  reactions: { emoji: string; count: number; userReacted: boolean }[];
  onReact: (emoji: string) => void;
  isLastMessage: boolean;
  isRead: boolean;
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

  return (
    <div className={cn('relative', isOwnMessage ? 'flex flex-col items-end' : 'flex flex-col items-start')}>
      <motion.div
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'max-w-[78%] px-4 py-3 shadow-sm relative',
          isOwnMessage
            ? 'bg-primary text-primary-foreground rounded-[22px] rounded-br-md'
            : 'bg-secondary/80 text-foreground rounded-[22px] rounded-bl-md'
        )}
      >
        <p className="text-[15px] leading-relaxed">{message.content}</p>
        
        <ReactionPicker
          isOpen={showPicker}
          onSelect={onReact}
          onClose={() => setShowPicker(false)}
          position={isOwnMessage ? 'right' : 'left'}
        />
      </motion.div>
      
      {/* Reactions display */}
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
                "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs",
                "bg-secondary/80 hover:bg-secondary transition-colors",
                reaction.userReacted && "ring-1 ring-primary/50"
              )}
            >
              <span>{reaction.emoji}</span>
              {reaction.count > 1 && (
                <span className="text-muted-foreground text-[10px]">{reaction.count}</span>
              )}
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Read receipt for own messages */}
      {isOwnMessage && isLastMessage && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-1 flex justify-end"
        >
          <ReadReceipt isSent={true} isRead={isRead} />
        </motion.div>
      )}
    </div>
  );
}

export default function Messages() {
  const { t } = useTranslation();
  const { state, sendMessage: sendMockMessage, markConversationRead } = useMockSystem();
  const { shouldHideUser } = useSafety();
  const { typingUsers, setTyping, onlineUsers } = useRealtimeMessages();
  const { startConversation } = useNewConversation();
  const [selectedConversation, setSelectedConversation] = useState<MockConversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [messageReactions, setMessageReactions] = useState<Map<string, { emoji: string; count: number; userReacted: boolean }[]>>(new Map());
  const [readMessages, setReadMessages] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const requestCount = 2;
  
  // Get conversations from mock system, filtering out blocked users
  const conversations = useMemo(() => {
    return state.conversations.filter(conv => !shouldHideUser(conv.participant.id));
  }, [state.conversations, shouldHideUser]);
  
  // Get messages for selected conversation
  const messages = useMemo(() => {
    if (!selectedConversation) return [];
    const conv = state.conversations.find(c => c.id === selectedConversation.id);
    return conv?.messages || [];
  }, [state.conversations, selectedConversation]);

  // Check if someone is typing in the current conversation
  const currentTypingUsers = useMemo(() => {
    if (!selectedConversation) return [];
    return typingUsers.get(selectedConversation.id) || [];
  }, [selectedConversation, typingUsers]);

  // Handle input change with typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    
    // Trigger typing indicator when user starts typing
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

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    setIsSending(true);
    setTyping(false); // Clear typing indicator
    sendMockMessage(selectedConversation.id, newMessage);
    setNewMessage('');
    
    // Simulate read receipt after sending
    setTimeout(() => {
      setIsSending(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      
      // Mark last message as read after a delay (simulating other user reading)
      setTimeout(() => {
        if (messages.length > 0) {
          setReadMessages(prev => new Set([...prev, messages[messages.length - 1]?.id || '']));
        }
      }, 2000);
    }, 100);
  };

  const handleSelectConversation = (conv: MockConversation) => {
    setSelectedConversation(conv);
    markConversationRead(conv.id);
  };

  const handleStartNewConversation = async (userId: string) => {
    const conversationId = await startConversation(userId);
    if (conversationId) {
      // Find or create conversation in state
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
  };

  const getLastMessagePreview = (conv: MockConversation) => {
    return conv.lastMessage;
  };

  // Conversation View
  if (selectedConversation) {
    return (
      <motion.div 
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={springSnap}
        className="flex flex-col h-[100dvh] bg-background"
      >
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...springBounce, delay: 0.1 }}
          className="flex items-center gap-4 px-4 py-3.5 border-b border-border/60 bg-background"
        >
          <motion.div whileTap={{ scale: 0.8 }} transition={springSnap}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedConversation(null)}
              className="shrink-0 -ml-2 h-9 w-9 rounded-full hover:bg-secondary"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </motion.div>
          <motion.div 
            className="relative"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...springPop, delay: 0.15 }}
          >
            <Avatar className="h-11 w-11 ring-1 ring-border/50">
              <AvatarFallback className="bg-gradient-to-br from-secondary to-secondary/60 text-foreground font-medium">
                {selectedConversation.participant.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {(selectedConversation.participant.isOnline || onlineUsers.has(selectedConversation.participant.id)) && <OnlineIndicator size="small" pulse />}
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[15px] text-foreground truncate tracking-tight">
              {selectedConversation.participant.name}
            </p>
            <p className="text-[13px] text-muted-foreground/80">
              {(selectedConversation.participant.isOnline || onlineUsers.has(selectedConversation.participant.id)) 
                ? (currentTypingUsers.length > 0 ? 'typing...' : 'Active now')
                : `@${selectedConversation.participant.handle}`}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <motion.div whileTap={{ scale: 0.85 }} transition={springSnap}>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground">
                <Phone className="h-5 w-5" />
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.85 }} transition={springSnap}>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground">
                <Video className="h-5 w-5" />
              </Button>
            </motion.div>
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
              <div className="bg-secondary/80 rounded-[22px] rounded-bl-md">
                <TypingIndicator />
              </div>
              <span className="text-xs text-muted-foreground">
                {currentTypingUsers.length === 1 
                  ? `${currentTypingUsers[0].displayName} is typing...`
                  : `${currentTypingUsers.length} people are typing...`
                }
              </span>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...springBounce, delay: 0.2 }}
          className="px-4 pb-5 pt-2"
        >
          <div className="flex items-center gap-2 bg-secondary/60 rounded-full px-2 py-1.5 ring-1 ring-border/30">
            <motion.div whileTap={{ scale: 0.8 }} transition={springSnap}>
              <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary">
                <Camera className="h-5 w-5" />
              </Button>
            </motion.div>
            <Input
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Message..."
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 px-1 h-10 text-[15px] placeholder:text-muted-foreground/60"
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <AnimatePresence mode="popLayout">
              {newMessage.trim() ? (
                <motion.div
                  key="send"
                  initial={{ opacity: 0, scale: 0, rotate: -180 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0, rotate: 180 }}
                  transition={springPop}
                >
                  <motion.div whileTap={{ scale: 0.8 }} transition={springSnap}>
                    <Button
                      size="icon"
                      className="shrink-0 h-9 w-9 rounded-full"
                      onClick={handleSendMessage}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="image"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={springPop}
                >
                  <motion.div whileTap={{ scale: 0.8 }} transition={springSnap}>
                    <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary">
                      <Image className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Inbox View
  return (
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
          <span className="font-bold text-xl text-foreground tracking-tight">username</span>
          <motion.div
            animate={{ rotate: 0 }}
            whileHover={{ rotate: 180 }}
            transition={springPop}
          >
            <ChevronDown className="h-4 w-4 text-foreground/70 group-hover:text-foreground" />
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
                className="text-[13px] text-primary font-semibold"
              >
                Requests ({requestCount})
              </motion.button>
            )}
          </AnimatePresence>
          <motion.div whileTap={{ scale: 0.85, rotate: 15 }} transition={springSnap}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 rounded-full text-foreground hover:bg-secondary"
              onClick={() => setShowNewConversation(true)}
            >
              <Edit className="h-6 w-6" strokeWidth={1.5} />
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div 
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...springBounce, delay: 0.05 }}
        className="sticky top-0 z-10 px-5 pb-3 bg-background"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="pl-11 rounded-xl bg-secondary/50 border-0 h-11 text-[15px] placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary/30"
          />
        </div>
      </motion.div>

      {/* Quick Access */}
      <div className="border-b border-border/40">
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
                className="flex flex-col items-center gap-2 min-w-[72px] group"
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
                    <motion.div 
                      className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-secondary to-secondary/40 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center"
                      whileHover={{ borderColor: 'hsl(var(--primary) / 0.4)' }}
                    >
                      <span className="text-2xl">{user.note}</span>
                    </motion.div>
                  ) : user.id === 'new' ? (
                    <motion.div 
                      className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-secondary to-secondary/40 border-2 border-muted-foreground/20 flex items-center justify-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.div
                        whileHover={{ rotate: 90 }}
                        transition={springPop}
                      >
                        <Plus className="h-7 w-7 text-muted-foreground/70 group-hover:text-primary" />
                      </motion.div>
                    </motion.div>
                  ) : (
                    <>
                      <Avatar className="h-[72px] w-[72px] shadow-sm">
                        <AvatarFallback className="bg-gradient-to-br from-secondary to-secondary/60 text-foreground text-lg font-medium">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {user.isOnline && <OnlineIndicator />}
                    </>
                  )}
                </div>
                <span className="text-[12px] text-muted-foreground/80 truncate max-w-[72px] font-medium">
                  {user.id === 'note' ? 'Your note' : user.id === 'new' ? 'New' : user.name}
                </span>
              </motion.button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </div>

      {/* Label */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="px-5 py-3"
      >
        <span className="font-semibold text-[15px] text-foreground tracking-tight">Messages</span>
      </motion.div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto pb-nav-safe">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <ConversationSkeleton key={`skeleton-${i}`} />)
        ) : filteredConversations.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-muted-foreground/70 text-[15px]">No conversations yet</p>
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
                whileTap={{ scale: 0.97, backgroundColor: 'hsl(var(--secondary) / 0.5)' }}
                onClick={() => handleSelectConversation(conversation)}
                className={cn(
                  "flex items-center gap-4 px-5 py-3.5 cursor-pointer",
                  conversation.isNew && "bg-primary/[0.05]"
                )}
                layout
              >
                <motion.div 
                  className="relative"
                  animate={conversation.isNew ? { scale: 1.05 } : {}}
                  transition={conversation.isNew ? { duration: 0.25, repeat: 2, repeatType: 'reverse', ease: 'easeInOut' } : {}}
                >
                  <Avatar className={cn(
                    "h-[58px] w-[58px] shadow-sm",
                    conversation.unread && "ring-[2.5px] ring-primary ring-offset-2 ring-offset-background"
                  )}>
                    <AvatarFallback className="bg-gradient-to-br from-secondary to-secondary/60 text-foreground text-lg font-medium">
                      {conversation.participant.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.participant.isOnline && <OnlineIndicator pulse={conversation.isNew} />}
                </motion.div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn(
                      'text-[15px] text-foreground truncate tracking-tight',
                      conversation.unread ? 'font-semibold' : 'font-normal'
                    )}>
                      {conversation.participant.name}
                    </p>
                    <span className={cn(
                      'text-[12px] shrink-0',
                      conversation.unread ? 'text-foreground/80 font-medium' : 'text-muted-foreground/60'
                    )}>
                      {conversation.lastMessageTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <p className={cn(
                      'text-[14px] truncate mt-0.5 flex-1',
                      conversation.unread ? 'text-foreground/90 font-medium' : 'text-muted-foreground/70'
                    )}>
                      {conversation.isTyping ? <TypingIndicator /> : getLastMessagePreview(conversation)}
                    </p>
                    {/* Show read receipt in conversation list */}
                    {!conversation.unread && (
                      <CheckCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {conversation.unread && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={springPop}
                      className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 shadow-lg shadow-primary/40" 
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <MobileNav />
      
      {/* New Conversation Modal */}
      <NewConversationModal
        isOpen={showNewConversation}
        onClose={() => setShowNewConversation(false)}
        onStartConversation={handleStartNewConversation}
      />
    </div>
  );
}

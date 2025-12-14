import { useState, useRef } from 'react';
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
  Video
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { MobileNav } from '@/components/MobileNav';

// Dopamine-driven spring configs
const springSnap = { type: 'spring' as const, stiffness: 700, damping: 30, mass: 0.8 };
const springBounce = { type: 'spring' as const, stiffness: 500, damping: 15, mass: 0.5 };
const springPop = { type: 'spring' as const, stiffness: 600, damping: 12 };
const springElastic = { type: 'spring' as const, stiffness: 400, damping: 10, mass: 0.8 };

interface Conversation {
  id: string;
  participant: {
    name: string;
    handle: string;
    avatarUrl?: string;
    isOnline?: boolean;
  };
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  isTyping?: boolean;
  lastMessageType?: 'text' | 'image' | 'reaction';
  isNew?: boolean;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'image';
  imageUrl?: string;
}

interface QuickAccessUser {
  id: string;
  name: string;
  avatarUrl?: string;
  isOnline?: boolean;
  hasNote?: boolean;
  note?: string;
}

const mockConversations: Conversation[] = [
  { id: '1', participant: { name: 'Mind Matters', handle: 'mindmatters', isOnline: true }, lastMessage: 'Thanks for sharing that resource!', lastMessageTime: '2m', unread: true, lastMessageType: 'text', isNew: true },
  { id: '2', participant: { name: 'Dr. Sarah', handle: 'drsarah', isOnline: true }, lastMessage: '💪', lastMessageTime: '1h', unread: true, lastMessageType: 'reaction' },
  { id: '3', participant: { name: 'Jamie', handle: 'jamie_journey', isOnline: false }, lastMessage: 'See you at the community meetup!', lastMessageTime: '3h', unread: false, lastMessageType: 'text' },
  { id: '4', participant: { name: 'Wellness Hub', handle: 'wellnesshub', isOnline: false }, lastMessage: 'Sent a photo', lastMessageTime: '1d', unread: false, lastMessageType: 'image' },
  { id: '5', participant: { name: 'Alex Chen', handle: 'alexchen', isOnline: true }, lastMessage: 'That meditation app is really helpful', lastMessageTime: '2d', unread: false, lastMessageType: 'text' },
];

const mockQuickAccess: QuickAccessUser[] = [
  { id: 'note', name: 'Your note', hasNote: true, note: '✨' },
  { id: 'new', name: 'New', isOnline: false },
  { id: '1', name: 'Mind', isOnline: true },
  { id: '2', name: 'Sarah', isOnline: true },
  { id: '3', name: 'Jamie', isOnline: false },
  { id: '4', name: 'Alex', isOnline: true },
];

const mockMessages: Message[] = [
  { id: '1', content: 'Hey! I saw your post about managing anxiety. Really helpful!', senderId: 'other', timestamp: '10:30 AM', read: true, type: 'text' },
  { id: '2', content: 'Thank you so much! It means a lot to hear that.', senderId: 'me', timestamp: '10:32 AM', read: true, type: 'text' },
  { id: '3', content: 'Do you have any other resources you recommend?', senderId: 'other', timestamp: '10:33 AM', read: true, type: 'text' },
  { id: '4', content: 'Absolutely! I\'ll share some links with you.', senderId: 'me', timestamp: '10:35 AM', read: true, type: 'text' },
  { id: '5', content: 'Thanks for sharing that resource!', senderId: 'other', timestamp: '10:40 AM', read: true, type: 'text' },
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

export default function Messages() {
  const { t } = useTranslation();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const requestCount = 2;

  const filteredConversations = mockConversations.filter(
    (conv) =>
      conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.participant.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    setIsSending(true);
    const newMsg: Message = {
      id: Date.now().toString(),
      content: newMessage,
      senderId: 'me',
      timestamp: 'Just now',
      read: false,
      type: 'text'
    };
    
    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
    
    setTimeout(() => {
      setIsSending(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const getLastMessagePreview = (conv: Conversation) => {
    if (conv.lastMessageType === 'image') {
      return <span className="flex items-center gap-1.5"><Image className="h-3.5 w-3.5" />Photo</span>;
    }
    if (conv.lastMessageType === 'reaction') {
      return <span>Reacted {conv.lastMessage}</span>;
    }
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
            {selectedConversation.participant.isOnline && <OnlineIndicator size="small" pulse />}
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[15px] text-foreground truncate tracking-tight">
              {selectedConversation.participant.name}
            </p>
            <p className="text-[13px] text-muted-foreground/80">
              {selectedConversation.participant.isOnline ? 'Active now' : `@${selectedConversation.participant.handle}`}
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
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'max-w-[78%] px-4 py-3 shadow-sm',
                    message.senderId === 'me'
                      ? 'bg-primary text-primary-foreground rounded-[22px] rounded-br-md'
                      : 'bg-secondary/80 text-foreground rounded-[22px] rounded-bl-md'
                  )}
                >
                  <p className="text-[15px] leading-relaxed">{message.content}</p>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {selectedConversation.isTyping && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={springPop}
              className="flex justify-start"
            >
              <div className="bg-secondary/80 rounded-[22px] rounded-bl-md">
                <TypingIndicator />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Seen indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-5 pb-2 flex justify-end"
        >
          <span className="text-[11px] text-muted-foreground/70 flex items-center gap-1 font-medium">
            <CheckCheck className="h-3.5 w-3.5" />
            Seen
          </span>
        </motion.div>

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
              onChange={(e) => setNewMessage(e.target.value)}
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
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-foreground hover:bg-secondary">
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
                  if (user.id !== 'new' && user.id !== 'note') {
                    const conv = mockConversations.find(c => c.participant.name.toLowerCase().includes(user.name.toLowerCase()));
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
      <div className="flex-1 overflow-y-auto">
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
                onClick={() => setSelectedConversation(conversation)}
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
                  <p className={cn(
                    'text-[14px] truncate mt-0.5',
                    conversation.unread ? 'text-foreground/90 font-medium' : 'text-muted-foreground/70'
                  )}>
                    {conversation.isTyping ? <TypingIndicator /> : getLastMessagePreview(conversation)}
                  </p>
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
    </div>
  );
}

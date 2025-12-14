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
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { MobileNav } from '@/components/MobileNav';

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
  {
    id: '1',
    participant: { name: 'Mind Matters', handle: 'mindmatters', isOnline: true },
    lastMessage: 'Thanks for sharing that resource!',
    lastMessageTime: '2m',
    unread: true,
    lastMessageType: 'text',
  },
  {
    id: '2',
    participant: { name: 'Dr. Sarah', handle: 'drsarah', isOnline: true },
    lastMessage: '💪',
    lastMessageTime: '1h',
    unread: true,
    lastMessageType: 'reaction',
  },
  {
    id: '3',
    participant: { name: 'Jamie', handle: 'jamie_journey', isOnline: false },
    lastMessage: 'See you at the community meetup!',
    lastMessageTime: '3h',
    unread: false,
    lastMessageType: 'text',
  },
  {
    id: '4',
    participant: { name: 'Wellness Hub', handle: 'wellnesshub', isOnline: false },
    lastMessage: 'Sent a photo',
    lastMessageTime: '1d',
    unread: false,
    lastMessageType: 'image',
  },
  {
    id: '5',
    participant: { name: 'Alex Chen', handle: 'alexchen', isOnline: true },
    lastMessage: 'That meditation app is really helpful',
    lastMessageTime: '2d',
    unread: false,
    lastMessageType: 'text',
  },
];

const mockQuickAccess: QuickAccessUser[] = [
  { id: 'note', name: 'Your note', hasNote: true, note: '✨' },
  { id: 'new', name: 'New', isOnline: false },
  { id: '1', name: 'Mind', isOnline: true },
  { id: '2', name: 'Sarah', isOnline: true },
  { id: '3', name: 'Jamie', isOnline: false },
  { id: '4', name: 'Alex', isOnline: true },
  { id: '5', name: 'Lisa', isOnline: false },
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

function QuickAccessSkeleton() {
  return (
    <div className="flex gap-5 px-5 py-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2.5">
          <Skeleton className="h-[72px] w-[72px] rounded-full" />
          <Skeleton className="h-3 w-14" />
        </div>
      ))}
    </div>
  );
}

function MessageSkeleton() {
  return (
    <div className="space-y-4 p-5">
      <div className="flex justify-start"><Skeleton className="h-11 w-52 rounded-3xl" /></div>
      <div className="flex justify-end"><Skeleton className="h-11 w-40 rounded-3xl" /></div>
      <div className="flex justify-start"><Skeleton className="h-11 w-56 rounded-3xl" /></div>
    </div>
  );
}

function OnlineIndicator({ size = 'default' }: { size?: 'small' | 'default' }) {
  return (
    <div className={cn(
      "absolute rounded-full bg-emerald-500 border-[2.5px] border-background shadow-sm",
      size === 'small' ? "bottom-0 right-0 w-3.5 h-3.5" : "bottom-0.5 right-0.5 w-4 h-4"
    )} />
  );
}

export default function Messages() {
  const { t } = useTranslation();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isLoading] = useState(false);
  const [messages] = useState<Message[]>(mockMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const requestCount = 2;

  const filteredConversations = mockConversations.filter(
    (conv) =>
      conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.participant.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setNewMessage('');
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
      <div className="flex flex-col h-[100dvh] bg-background">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 px-4 py-3.5 border-b border-border/60 bg-background"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedConversation(null)}
            className="shrink-0 -ml-2 h-9 w-9 rounded-full hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="relative">
            <Avatar className="h-11 w-11 ring-1 ring-border/50">
              <AvatarFallback className="bg-gradient-to-br from-secondary to-secondary/60 text-foreground font-medium">
                {selectedConversation.participant.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {selectedConversation.participant.isOnline && <OnlineIndicator size="small" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[15px] text-foreground truncate tracking-tight">
              {selectedConversation.participant.name}
            </p>
            <p className="text-[13px] text-muted-foreground/80">
              {selectedConversation.participant.isOnline ? 'Active now' : `@${selectedConversation.participant.handle}`}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground">
              <Video className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
          {isLoading ? (
            <MessageSkeleton />
          ) : (
            <AnimatePresence>
              {messages.map((message, idx) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className={cn('flex', message.senderId === 'me' ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[78%] px-4 py-3 shadow-sm',
                      message.senderId === 'me'
                        ? 'bg-primary text-primary-foreground rounded-[22px] rounded-br-md'
                        : 'bg-secondary/80 text-foreground rounded-[22px] rounded-bl-md'
                    )}
                  >
                    <p className="text-[15px] leading-relaxed">{message.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Seen indicator */}
        <div className="px-5 pb-2 flex justify-end">
          <span className="text-[11px] text-muted-foreground/70 flex items-center gap-1 font-medium">
            <CheckCheck className="h-3.5 w-3.5" />
            Seen
          </span>
        </div>

        {/* Input */}
        <div className="px-4 pb-5 pt-2">
          <div className="flex items-center gap-2 bg-secondary/60 rounded-full px-2 py-1.5 ring-1 ring-border/30">
            <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary">
              <Camera className="h-5 w-5" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message..."
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 px-1 h-10 text-[15px] placeholder:text-muted-foreground/60"
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <AnimatePresence mode="wait">
              {newMessage.trim() ? (
                <motion.div
                  key="send"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                >
                  <Button
                    size="icon"
                    className="shrink-0 h-9 w-9 rounded-full"
                    onClick={handleSendMessage}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="image"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                >
                  <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary">
                    <Image className="h-5 w-5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // Inbox View
  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-5 py-4 bg-background"
      >
        <button className="flex items-center gap-1.5 hover:opacity-70 transition-opacity group">
          <span className="font-bold text-xl text-foreground tracking-tight">username</span>
          <ChevronDown className="h-4 w-4 text-foreground/70 group-hover:text-foreground transition-colors" />
        </button>
        <div className="flex items-center gap-3">
          {requestCount > 0 && (
            <motion.button 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[13px] text-primary font-semibold hover:opacity-80 transition-opacity"
            >
              Requests ({requestCount})
            </motion.button>
          )}
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-foreground hover:bg-secondary">
            <Edit className="h-6 w-6" strokeWidth={1.5} />
          </Button>
        </div>
      </motion.div>

      {/* Search */}
      <div className="sticky top-0 z-10 px-5 pb-3 bg-background">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="pl-11 rounded-xl bg-secondary/50 border-0 h-11 text-[15px] placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary/30"
          />
        </div>
      </div>

      {/* Quick Access */}
      <div className="border-b border-border/40">
        {isLoading ? (
          <QuickAccessSkeleton />
        ) : (
          <ScrollArea className="w-full">
            <div className="flex gap-4 px-5 py-4">
              {mockQuickAccess.map((user, idx) => (
                <motion.button
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
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
                      <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-secondary to-secondary/40 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center group-hover:border-primary/40 transition-all">
                        <span className="text-2xl">{user.note}</span>
                      </div>
                    ) : user.id === 'new' ? (
                      <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-secondary to-secondary/40 border-2 border-muted-foreground/20 flex items-center justify-center group-hover:border-primary/40 group-hover:from-primary/10 group-hover:to-primary/5 transition-all">
                        <Plus className="h-7 w-7 text-muted-foreground/70 group-hover:text-primary transition-colors" />
                      </div>
                    ) : (
                      <>
                        <Avatar className="h-[72px] w-[72px] ring-2 ring-transparent group-hover:ring-primary/20 transition-all shadow-sm">
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
        )}
      </div>

      {/* Label */}
      <div className="px-5 py-3">
        <span className="font-semibold text-[15px] text-foreground tracking-tight">Messages</span>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <ConversationSkeleton key={`skeleton-${i}`} />)
        ) : filteredConversations.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-muted-foreground/70 text-[15px]">No conversations yet</p>
          </div>
        ) : (
          filteredConversations.map((conversation, idx) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedConversation(conversation)}
              className="flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors hover:bg-secondary/30 active:bg-secondary/50"
            >
              <div className="relative">
                <Avatar className={cn(
                  "h-[58px] w-[58px] transition-all shadow-sm",
                  conversation.unread && "ring-[2.5px] ring-primary ring-offset-2 ring-offset-background"
                )}>
                  <AvatarFallback className="bg-gradient-to-br from-secondary to-secondary/60 text-foreground text-lg font-medium">
                    {conversation.participant.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {conversation.participant.isOnline && <OnlineIndicator />}
              </div>

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
                  {getLastMessagePreview(conversation)}
                </p>
              </div>

              {conversation.unread && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 shadow-sm shadow-primary/30" 
                />
              )}
            </motion.div>
          ))
        )}
      </div>

      <MobileNav />
    </div>
  );
}

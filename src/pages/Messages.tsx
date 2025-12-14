import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Edit, 
  ArrowLeft, 
  Send, 
  Image, 
  Check, 
  CheckCheck, 
  ChevronDown,
  Plus,
  Circle,
  Camera,
  Play
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

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
  { id: 'note', name: 'Your note', hasNote: true, note: 'Feeling grateful today ✨' },
  { id: 'new', name: 'New', isOnline: false },
  { id: '1', name: 'Mind', isOnline: true },
  { id: '2', name: 'Sarah', isOnline: true },
  { id: '3', name: 'Jamie', isOnline: false },
  { id: '4', name: 'Alex', isOnline: true },
  { id: '5', name: 'Lisa', isOnline: false },
];

const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Hey! I saw your post about managing anxiety. Really helpful!',
    senderId: 'other',
    timestamp: '10:30 AM',
    read: true,
    type: 'text',
  },
  {
    id: '2',
    content: 'Thank you so much! It means a lot to hear that.',
    senderId: 'me',
    timestamp: '10:32 AM',
    read: true,
    type: 'text',
  },
  {
    id: '3',
    content: 'Do you have any other resources you recommend?',
    senderId: 'other',
    timestamp: '10:33 AM',
    read: true,
    type: 'text',
  },
  {
    id: '4',
    content: 'Absolutely! I\'ll share some links with you.',
    senderId: 'me',
    timestamp: '10:35 AM',
    read: true,
    type: 'text',
  },
  {
    id: '5',
    content: 'Thanks for sharing that resource!',
    senderId: 'other',
    timestamp: '10:40 AM',
    read: true,
    type: 'text',
  },
];

function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Skeleton className="h-14 w-14 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-44" />
      </div>
      <Skeleton className="h-3 w-8" />
    </div>
  );
}

function QuickAccessSkeleton() {
  return (
    <div className="flex gap-4 px-4 py-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  );
}

function MessageSkeleton() {
  return (
    <div className="space-y-3 p-4">
      <div className="flex justify-start">
        <Skeleton className="h-10 w-48 rounded-2xl" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-10 w-36 rounded-2xl" />
      </div>
      <div className="flex justify-start">
        <Skeleton className="h-10 w-52 rounded-2xl" />
      </div>
    </div>
  );
}

function OnlineIndicator({ className }: { className?: string }) {
  return (
    <div className={cn(
      "absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background",
      className
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

  const requestCount = 2; // Mock request count

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
      return (
        <span className="flex items-center gap-1">
          <Image className="h-3 w-3" />
          Sent a photo
        </span>
      );
    }
    if (conv.lastMessageType === 'reaction') {
      return <span>Reacted {conv.lastMessage} to your message</span>;
    }
    return conv.lastMessage;
  };

  // Conversation View
  if (selectedConversation) {
    return (
      <div className="flex flex-col h-[100dvh] bg-background">
        {/* Chat Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedConversation(null)}
            className="shrink-0 -ml-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-secondary text-secondary-foreground">
                {selectedConversation.participant.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {selectedConversation.participant.isOnline && (
              <OnlineIndicator className="w-3 h-3" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">
              {selectedConversation.participant.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {selectedConversation.participant.isOnline ? 'Active now' : `@${selectedConversation.participant.handle}`}
            </p>
          </div>
          {/* Desktop quick actions */}
          <div className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Camera className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Play className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <MessageSkeleton />
          ) : (
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    'flex',
                    message.senderId === 'me' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[75%] px-4 py-2.5 rounded-3xl',
                      message.senderId === 'me'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    )}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Read receipt */}
        <div className="px-4 pb-1 flex justify-end">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <CheckCheck className="h-3 w-3" />
            Seen
          </span>
        </div>

        {/* Message Input */}
        <div className="px-4 pb-4 pt-2 bg-background">
          <div className="flex items-center gap-2 bg-secondary rounded-full px-3 py-1">
            <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground">
              <Camera className="h-5 w-5" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message..."
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 px-0 h-10"
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            {newMessage.trim() ? (
              <Button
                size="sm"
                variant="ghost"
                className="shrink-0 text-primary font-semibold hover:text-primary"
                onClick={handleSendMessage}
              >
                Send
              </Button>
            ) : (
              <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground">
                <Image className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Inbox View
  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
        <button className="flex items-center gap-1 hover:opacity-70 transition-opacity">
          <span className="font-semibold text-lg text-foreground">username</span>
          <ChevronDown className="h-4 w-4 text-foreground" />
        </button>
        <div className="flex items-center gap-2">
          {requestCount > 0 && (
            <button className="text-sm text-primary font-medium hover:opacity-70 transition-opacity">
              Requests ({requestCount})
            </button>
          )}
          <Button variant="ghost" size="icon" className="text-foreground">
            <Edit className="h-6 w-6" strokeWidth={1.5} />
          </Button>
        </div>
      </div>

      {/* Sticky Search */}
      <div className="sticky top-0 z-10 px-4 py-3 bg-background">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages or people"
            className="pl-11 rounded-xl bg-secondary border-0 h-10"
          />
        </div>
      </div>

      {/* Quick Access Row */}
      <div className="border-b border-border">
        {isLoading ? (
          <QuickAccessSkeleton />
        ) : (
          <ScrollArea className="w-full">
            <div className="flex gap-4 px-4 py-3">
              {mockQuickAccess.map((user) => (
                <button
                  key={user.id}
                  className="flex flex-col items-center gap-1.5 min-w-[64px] group"
                  onClick={() => {
                    if (user.id === 'new') {
                      // Handle new message
                    } else if (user.id !== 'note') {
                      // Open conversation
                      const conv = mockConversations.find(c => c.participant.name.toLowerCase().includes(user.name.toLowerCase()));
                      if (conv) setSelectedConversation(conv);
                    }
                  }}
                >
                  <div className="relative">
                    {user.id === 'note' ? (
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-secondary/50">
                        <span className="text-2xl">✨</span>
                      </div>
                    ) : user.id === 'new' ? (
                      <div className="w-16 h-16 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center bg-secondary/50 group-hover:border-primary/50 transition-colors">
                        <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    ) : (
                      <>
                        <Avatar className="h-16 w-16 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                          <AvatarFallback className="bg-secondary text-secondary-foreground text-lg">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {user.isOnline && <OnlineIndicator />}
                      </>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground truncate max-w-[64px]">
                    {user.id === 'note' ? 'Your note' : user.id === 'new' ? 'New' : user.name}
                  </span>
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        )}
      </div>

      {/* Messages Label */}
      <div className="px-4 py-2">
        <span className="font-semibold text-foreground">Messages</span>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <ConversationSkeleton key={`skeleton-${i}`} />)
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>No conversations found</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <motion.div
              key={conversation.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedConversation(conversation)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-secondary/30'
              )}
            >
              {/* Avatar with unread ring */}
              <div className="relative">
                <Avatar className={cn(
                  "h-14 w-14 transition-all",
                  conversation.unread && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                )}>
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-lg">
                    {conversation.participant.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {conversation.participant.isOnline && <OnlineIndicator />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={cn(
                    'text-foreground truncate',
                    conversation.unread ? 'font-semibold' : 'font-normal'
                  )}>
                    {conversation.participant.name}
                  </p>
                  <span className={cn(
                    'text-xs shrink-0 ml-2',
                    conversation.unread ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {conversation.lastMessageTime}
                  </span>
                </div>
                <p className={cn(
                  'text-sm truncate mt-0.5',
                  conversation.unread ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}>
                  {getLastMessagePreview(conversation)}
                </p>
              </div>

              {/* Unread indicator */}
              {conversation.unread && (
                <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Bottom padding for nav */}
      <div className="h-20" />
    </div>
  );
}

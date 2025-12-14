import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Edit, ArrowLeft, Send, Image, Check, CheckCheck } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

interface Conversation {
  id: string;
  participant: {
    name: string;
    handle: string;
    avatarUrl?: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  isTyping?: boolean;
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

const mockConversations: Conversation[] = [
  {
    id: '1',
    participant: { name: 'Mind Matters', handle: 'mindmatters' },
    lastMessage: 'Thanks for sharing that resource!',
    lastMessageTime: '2m',
    unread: true,
  },
  {
    id: '2',
    participant: { name: 'Dr. Sarah', handle: 'drsarah' },
    lastMessage: 'Your progress is amazing 💪',
    lastMessageTime: '1h',
    unread: true,
  },
  {
    id: '3',
    participant: { name: 'Jamie', handle: 'jamie_journey' },
    lastMessage: 'See you at the community meetup!',
    lastMessageTime: '3h',
    unread: false,
  },
  {
    id: '4',
    participant: { name: 'Wellness Hub', handle: 'wellnesshub' },
    lastMessage: 'We loved your latest post!',
    lastMessageTime: '1d',
    unread: false,
  },
  {
    id: '5',
    participant: { name: 'Alex Chen', handle: 'alexchen' },
    lastMessage: 'That meditation app is really helpful',
    lastMessageTime: '2d',
    unread: false,
  },
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
    <div className="flex items-center gap-3 p-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="h-3 w-8" />
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

export default function Messages() {
  const { t } = useTranslation();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isLoading] = useState(false);
  const [messages] = useState<Message[]>(mockMessages);

  const filteredConversations = mockConversations.filter(
    (conv) =>
      conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.participant.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    // Optimistic UI - would add to messages array
    setNewMessage('');
  };

  // Conversation View
  if (selectedConversation) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
        {/* Chat Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border bg-background/95 backdrop-blur">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedConversation(null)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-secondary text-secondary-foreground">
              {selectedConversation.participant.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">
              {selectedConversation.participant.name}
            </p>
            <p className="text-xs text-muted-foreground">
              @{selectedConversation.participant.handle}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <MessageSkeleton />
          ) : (
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'flex',
                    message.senderId === 'me' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[75%] px-4 py-2.5 rounded-2xl',
                      message.senderId === 'me'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-secondary text-secondary-foreground rounded-bl-md'
                    )}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div
                      className={cn(
                        'flex items-center gap-1 mt-1',
                        message.senderId === 'me' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <span className="text-[10px] opacity-70">{message.timestamp}</span>
                      {message.senderId === 'me' && (
                        message.read ? (
                          <CheckCheck className="h-3 w-3 opacity-70" />
                        ) : (
                          <Check className="h-3 w-3 opacity-70" />
                        )
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-border bg-background/95 backdrop-blur">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="shrink-0">
              <Image className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message..."
              className="flex-1 rounded-full bg-secondary border-0"
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button
              size="icon"
              className="shrink-0 rounded-full"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Inbox View
  return (
    <AppLayout title={t('nav.messages', 'Messages')}>
      {/* Search & New Message */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur p-4 space-y-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="pl-9 rounded-full bg-secondary border-0"
            />
          </div>
          <Button size="icon" variant="ghost">
            <Edit className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="divide-y divide-border">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <ConversationSkeleton key={i} />)
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
                'flex items-center gap-3 p-4 cursor-pointer transition-colors hover:bg-secondary/50',
                conversation.unread && 'bg-primary/5'
              )}
            >
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-secondary text-secondary-foreground text-lg">
                  {conversation.participant.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={cn(
                    'font-semibold text-foreground truncate',
                    conversation.unread && 'font-bold'
                  )}>
                    {conversation.participant.name}
                  </p>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {conversation.lastMessageTime}
                  </span>
                </div>
                <p className={cn(
                  'text-sm truncate',
                  conversation.unread ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}>
                  {conversation.lastMessage}
                </p>
              </div>
              {conversation.unread && (
                <div className="w-3 h-3 rounded-full bg-primary shrink-0" />
              )}
            </motion.div>
          ))
        )}
      </div>
    </AppLayout>
  );
}
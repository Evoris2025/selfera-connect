import { Plus, ChevronRight } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { CinematicAvatar } from '@/components/ui/CinematicAvatar';
import { useCurrentUserAvatar } from '@/hooks/useCurrentUserAvatar';

interface Expression {
  id: string;
  userName: string;
  userAvatar: string;
  thumbnailUrl: string;
  hasUnseenExpression: boolean;
}

// Mock expressions data
const mockExpressions: Expression[] = [
  {
    id: '1',
    userName: 'Jennifer',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=300&fit=crop',
    hasUnseenExpression: true,
  },
  {
    id: '2',
    userName: 'Cody',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=300&fit=crop',
    hasUnseenExpression: true,
  },
  {
    id: '3',
    userName: 'Amy',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=300&fit=crop',
    hasUnseenExpression: true,
  },
  {
    id: '4',
    userName: 'Trent',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=300&fit=crop',
    hasUnseenExpression: false,
  },
  {
    id: '5',
    userName: 'Donna',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=300&fit=crop',
    hasUnseenExpression: true,
  },
  {
    id: '6',
    userName: 'Marcus',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=300&fit=crop',
    hasUnseenExpression: true,
  },
];

export function ExpressionsRow() {
  const { avatarUrl, displayName } = useCurrentUserAvatar();

  return (
    <div className="relative">
      <ScrollArea className="w-full">
        <div className="flex gap-3 px-4 py-2">
          {/* Create Expression Card */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex-shrink-0 flex flex-col items-center gap-2"
          >
            <div className="relative">
              <CinematicAvatar
                src={avatarUrl}
                alt={displayName}
                size="xl"
                ring="muted"
              />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full gradient-brand flex items-center justify-center ring-3 ring-background shadow-glow">
                <Plus className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
            <span className="text-xs text-muted-foreground font-medium">Create Expression</span>
          </motion.button>

          {/* Expression Cards */}
          {mockExpressions.map((expression, index) => (
            <motion.button
              key={expression.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (index + 1) * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex-shrink-0 flex flex-col items-center gap-2"
            >
              <CinematicAvatar
                src={expression.userAvatar}
                alt={expression.userName}
                fallback={expression.userName.charAt(0)}
                size="xl"
                ring={expression.hasUnseenExpression ? 'gradient' : 'muted'}
              />
              <span className="text-xs text-foreground/80 font-medium max-w-[72px] truncate">
                {expression.userName}
              </span>
            </motion.button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>

      {/* Right scroll indicator */}
      <motion.button 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary/15 backdrop-blur-md border border-primary/25 flex items-center justify-center shadow-lg hover:bg-primary/20 hover:border-primary/30 transition-all duration-300"
      >
        <ChevronRight className="h-4 w-4 text-primary" />
      </motion.button>
    </div>
  );
}

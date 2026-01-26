import { motion } from 'framer-motion';
import { Sparkles, Video, Image, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ContentType = 'expression' | 'video' | 'image' | 'post';

interface ContentTypeCard {
  id: ContentType;
  icon: typeof Sparkles;
  title: string;
  description: string;
  gradient: string;
  iconBg: string;
  iconColor: string;
}

const contentTypes: ContentTypeCard[] = [
  {
    id: 'expression',
    icon: Sparkles,
    title: 'Expression',
    description: 'Share moments that disappear in 24h',
    gradient: 'from-rose-500/20 via-pink-500/10 to-transparent',
    iconBg: 'bg-rose-500/20',
    iconColor: 'text-rose-400',
  },
  {
    id: 'video',
    icon: Video,
    title: 'Video',
    description: 'Upload and share long-form content',
    gradient: 'from-blue-500/20 via-primary/10 to-transparent',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
  },
  {
    id: 'image',
    icon: Image,
    title: 'Photo',
    description: 'Share photos with filters and edits',
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
  },
  {
    id: 'post',
    icon: FileText,
    title: 'Post',
    description: 'Share thoughts, polls, and updates',
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
];

interface ContentTypeDashboardProps {
  onSelect: (type: ContentType) => void;
  onClose: () => void;
}

export function ContentTypeDashboard({ onSelect, onClose }: ContentTypeDashboardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full bg-background"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Create</h2>
          <p className="text-sm text-muted-foreground">What would you like to share?</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-secondary transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content Type Grid */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-lg">
          {contentTypes.map((type, index) => (
            <motion.button
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => onSelect(type.id)}
              className={cn(
                'group relative flex flex-col items-center justify-center gap-3 p-6 sm:p-8',
                'rounded-2xl border border-border/50',
                'bg-gradient-to-br hover:border-border',
                'transition-all duration-200',
                'hover:scale-[1.02] active:scale-[0.98]',
                'focus:outline-none focus:ring-2 focus:ring-primary/50',
                type.gradient
              )}
            >
              {/* Icon Container */}
              <div
                className={cn(
                  'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center',
                  'transition-transform duration-200 group-hover:scale-110',
                  type.iconBg
                )}
              >
                <type.icon className={cn('h-7 w-7 sm:h-8 sm:w-8', type.iconColor)} />
              </div>

              {/* Text */}
              <div className="text-center space-y-1">
                <span className="block font-semibold text-foreground text-base sm:text-lg">
                  {type.title}
                </span>
                <span className="block text-xs sm:text-sm text-muted-foreground leading-tight">
                  {type.description}
                </span>
              </div>

              {/* Hover Glow Effect */}
              <div
                className={cn(
                  'absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100',
                  'transition-opacity duration-300 pointer-events-none',
                  'bg-gradient-to-br',
                  type.gradient
                )}
                style={{ filter: 'blur(20px)', zIndex: -1 }}
              />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="p-4 border-t border-border bg-card/30">
        <p className="text-center text-sm text-muted-foreground">
          Create content that inspires and connects
        </p>
      </div>
    </motion.div>
  );
}

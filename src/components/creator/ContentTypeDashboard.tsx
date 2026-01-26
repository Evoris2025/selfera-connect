import { motion } from 'framer-motion';
import { Sparkles, Video, Image, FileText, ChevronRight, FileEdit, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BrandMark } from '@/components/BrandMark';
import { useDrafts } from './shared/DraftManager';

export type ContentType = 'expression' | 'video' | 'image' | 'post';

interface ContentTypeCard {
  id: ContentType;
  icon: typeof Sparkles;
  title: string;
  description: string;
  accentColor: string;
  glowColor: string;
}

const contentTypes: ContentTypeCard[] = [
  {
    id: 'expression',
    icon: Sparkles,
    title: 'Expression',
    description: 'Share moments that disappear in 24h',
    accentColor: 'from-rose-500 to-pink-600',
    glowColor: 'group-hover:shadow-[0_0_60px_-15px_hsl(346,77%,50%)]',
  },
  {
    id: 'video',
    icon: Video,
    title: 'Video',
    description: 'Upload long-form content',
    accentColor: 'from-blue-500 to-indigo-600',
    glowColor: 'group-hover:shadow-[0_0_60px_-15px_hsl(217,91%,60%)]',
  },
  {
    id: 'image',
    icon: Image,
    title: 'Photo',
    description: 'Share with filters & edits',
    accentColor: 'from-amber-500 to-orange-600',
    glowColor: 'group-hover:shadow-[0_0_60px_-15px_hsl(38,92%,50%)]',
  },
  {
    id: 'post',
    icon: FileText,
    title: 'Post',
    description: 'Share thoughts & polls',
    accentColor: 'from-emerald-500 to-teal-600',
    glowColor: 'group-hover:shadow-[0_0_60px_-15px_hsl(160,84%,39%)]',
  },
];

interface ContentTypeDashboardProps {
  onSelect: (type: ContentType) => void;
  onClose: () => void;
}

export function ContentTypeDashboard({ onSelect, onClose }: ContentTypeDashboardProps) {
  const { drafts } = useDrafts();
  const draftCount = drafts.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full bg-background relative overflow-hidden"
    >
      {/* Ambient background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-accent/5 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 border-b border-border/50">
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-lg hover:bg-secondary/50 transition-colors"
        >
          <ChevronRight className="h-5 w-5 rotate-180 text-muted-foreground" />
        </button>
        <h2 className="text-lg font-semibold tracking-wide text-foreground uppercase">
          ERA Studio
        </h2>
        <div className="w-9" /> {/* Spacer for alignment */}
      </div>

      {/* Brand Logo Section */}
      <div className="relative z-10 flex justify-center py-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
        >
          <BrandMark className="h-10 w-auto opacity-80" />
        </motion.div>
      </div>

      {/* Content Type Grid */}
      <div className="flex-1 flex items-start justify-center px-4 pb-4 relative z-10">
        <div className="grid grid-cols-2 gap-3 w-full max-w-md">
          {contentTypes.map((type, index) => (
            <motion.button
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: 0.1 + index * 0.05, 
                type: 'spring', 
                stiffness: 400, 
                damping: 25 
              }}
              onClick={() => onSelect(type.id)}
              className={cn(
                'group relative flex flex-col items-center justify-center gap-4 p-6',
                'bg-card/60 border border-border/50',
                'transition-all duration-300 ease-out',
                'hover:bg-card/80 hover:border-border',
                'hover:scale-[1.02] active:scale-[0.98]',
                'focus:outline-none focus:ring-2 focus:ring-primary/50',
                type.glowColor
              )}
            >
              {/* Icon Container with gradient background */}
              <div
                className={cn(
                  'relative w-14 h-14 rounded-xl flex items-center justify-center',
                  'bg-gradient-to-br',
                  type.accentColor,
                  'transition-transform duration-300 group-hover:scale-110',
                  'shadow-lg'
                )}
              >
                <type.icon className="h-7 w-7 text-white" />
              </div>

              {/* Text */}
              <div className="text-center space-y-1">
                <span className="block font-semibold text-foreground text-base">
                  {type.title}
                </span>
                <span className="block text-xs text-muted-foreground leading-tight">
                  {type.description}
                </span>
              </div>

              {/* Hover indicator */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="absolute bottom-3 flex items-center gap-1 text-xs text-primary font-medium"
              >
                <span>Start</span>
                <ChevronRight className="h-3 w-3" />
              </motion.div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quick Actions Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 p-4 border-t border-border/50 bg-card/30 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* Drafts Button */}
          <button 
            className="flex items-center gap-2 px-4 py-2.5 bg-secondary/50 hover:bg-secondary/80 rounded-lg transition-colors group"
          >
            <FileEdit className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              Drafts
            </span>
            {draftCount > 0 && (
              <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-primary/20 text-primary text-xs font-semibold rounded-full">
                {draftCount}
              </span>
            )}
          </button>

          {/* Recent Button */}
          <button 
            className="flex items-center gap-2 px-4 py-2.5 hover:bg-secondary/50 rounded-lg transition-colors group"
          >
            <Clock className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              Recent
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

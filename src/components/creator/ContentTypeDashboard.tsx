import { motion } from 'framer-motion';
import { Sparkles, Video, Image, FileText, ChevronRight, FileEdit, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BrandMark } from '@/components/BrandMark';
import { useDrafts } from './shared/DraftManager';
import { GlassCard } from '@/components/ui/GlassCard';

export type ContentType = 'expression' | 'video' | 'image' | 'post';

interface ContentTypeCard {
  id: ContentType;
  icon: typeof Sparkles;
  title: string;
  description: string;
  gradient: string;
  glowColor: string;
}

const contentTypes: ContentTypeCard[] = [
  {
    id: 'expression',
    icon: Sparkles,
    title: 'Expression',
    description: 'Moments that fade in 24h',
    gradient: 'from-rose-500 to-pink-600',
    glowColor: 'hover:shadow-[0_0_40px_-10px_hsl(346,77%,50%,0.4)]',
  },
  {
    id: 'video',
    icon: Video,
    title: 'Video',
    description: 'Long-form content',
    gradient: 'from-blue-500 to-indigo-600',
    glowColor: 'hover:shadow-[0_0_40px_-10px_hsl(217,91%,60%,0.4)]',
  },
  {
    id: 'image',
    icon: Image,
    title: 'Photo',
    description: 'Share with style',
    gradient: 'from-amber-500 to-orange-600',
    glowColor: 'hover:shadow-[0_0_40px_-10px_hsl(38,92%,50%,0.4)]',
  },
  {
    id: 'post',
    icon: FileText,
    title: 'Post',
    description: 'Thoughts & polls',
    gradient: 'from-emerald-500 to-teal-600',
    glowColor: 'hover:shadow-[0_0_40px_-10px_hsl(160,84%,39%,0.4)]',
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
      exit={{ opacity: 0 }}
      className="flex flex-col h-full bg-background relative overflow-hidden"
    >
      {/* Ambient background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-rose-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-border/30">
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-lg hover:bg-secondary/50 transition-colors"
          aria-label="Go back"
        >
          <ChevronRight className="h-5 w-5 rotate-180 text-muted-foreground" />
        </button>
        <h2 className="text-sm font-semibold tracking-widest text-foreground/80 uppercase">
          ERA Studio
        </h2>
        <button
          onClick={onClose}
          className="p-2 -mr-2 rounded-lg hover:bg-secondary/50 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto relative z-10">
        {/* Logo Hero Section */}
        <div className="flex flex-col items-center pt-8 pb-6 px-4">
          {/* Ambient glow behind logo */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-64 h-20 bg-gradient-to-r from-rose-500/20 via-purple-500/20 to-orange-500/20 blur-[60px] rounded-full" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 25 }}
            className="relative"
          >
            <BrandMark className="h-14 w-[240px]" />
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-base text-muted-foreground font-medium"
          >
            What would you like to create?
          </motion.p>
        </div>

        {/* Content Type Cards */}
        <div className="px-4 pb-6 space-y-3">
          {contentTypes.map((type, index) => (
            <motion.button
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: 0.15 + index * 0.05, 
                type: 'spring', 
                stiffness: 400, 
                damping: 30 
              }}
              onClick={() => onSelect(type.id)}
              className={cn(
                'group w-full flex items-center gap-4 p-4',
                'bg-card/40 border border-border/30',
                'transition-all duration-300 ease-out',
                'hover:bg-card/60 hover:border-border/50',
                'hover:scale-[1.01] active:scale-[0.99]',
                'focus:outline-none focus:ring-2 focus:ring-primary/30',
                type.glowColor
              )}
            >
              {/* Gradient Icon */}
              <div
                className={cn(
                  'flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center',
                  'bg-gradient-to-br shadow-lg',
                  type.gradient,
                  'transition-transform duration-300 group-hover:scale-105'
                )}
              >
                <type.icon className="h-6 w-6 text-white" />
              </div>

              {/* Text Content */}
              <div className="flex-1 text-left min-w-0">
                <span className="block font-semibold text-foreground text-base">
                  {type.title}
                </span>
                <span className="block text-sm text-muted-foreground mt-0.5">
                  {type.description}
                </span>
              </div>

              {/* Chevron Arrow */}
              <ChevronRight 
                className="flex-shrink-0 h-5 w-5 text-muted-foreground/50 transition-all duration-300 group-hover:text-muted-foreground group-hover:translate-x-1" 
              />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 p-4 border-t border-border/30 bg-card/20 backdrop-blur-sm"
      >
        <button 
          className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-secondary/50 hover:bg-secondary/80 rounded-lg transition-colors group"
        >
          <FileEdit className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            Drafts
          </span>
          {draftCount > 0 && (
            <span className="flex items-center justify-center min-w-[22px] h-5 px-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
              {draftCount}
            </span>
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}

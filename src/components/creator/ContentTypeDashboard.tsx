import { motion } from 'framer-motion';
import { Sparkles, Video, Image, FileText, FileEdit, X, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BrandMark } from '@/components/BrandMark';
import { useDrafts } from './shared/DraftManager';

export type ContentType = 'expression' | 'video' | 'image' | 'post';

interface ContentTypeCard {
  id: ContentType;
  icon: typeof Sparkles;
  title: string;
  description: string;
  gradient: string;
  nodeColor: string;
}

const contentTypes: ContentTypeCard[] = [
  {
    id: 'expression',
    icon: Sparkles,
    title: 'Expression',
    description: 'Moments that fade in 24h',
    gradient: 'from-rose-500 to-pink-600',
    nodeColor: 'bg-gradient-to-br from-rose-500 to-pink-600',
  },
  {
    id: 'video',
    icon: Video,
    title: 'Video',
    description: 'Long-form content',
    gradient: 'from-blue-500 to-indigo-600',
    nodeColor: 'bg-gradient-to-br from-blue-500 to-indigo-600',
  },
  {
    id: 'image',
    icon: Image,
    title: 'Photo',
    description: 'Share with style',
    gradient: 'from-amber-500 to-orange-600',
    nodeColor: 'bg-gradient-to-br from-amber-500 to-orange-600',
  },
  {
    id: 'post',
    icon: FileText,
    title: 'Post',
    description: 'Thoughts & polls',
    gradient: 'from-emerald-500 to-teal-600',
    nodeColor: 'bg-gradient-to-br from-emerald-500 to-teal-600',
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

      {/* Minimal Header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-border/30">
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-lg hover:bg-secondary/50 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <div className="w-5" /> {/* Spacer for centering */}
        <button
          onClick={onClose}
          className="p-2 -mr-2 rounded-lg hover:bg-secondary/50 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto relative z-10 flex flex-col">
        {/* Logo Hero Section */}
        <div className="flex flex-col items-center pt-8 pb-4 px-4">
          {/* Ambient glow behind logo */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-64 h-20 bg-gradient-to-r from-rose-500/20 via-purple-500/20 to-orange-500/20 blur-[60px] rounded-full" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 25 }}
            className="relative -ml-6"
          >
            <BrandMark className="h-14 w-[240px]" />
          </motion.div>
          
          {/* ERA STUDIO Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-xl font-bold tracking-[0.3em] text-foreground uppercase"
          >
            ERA STUDIO
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-2 text-sm text-muted-foreground font-medium"
          >
            What would you like to create?
          </motion.p>
        </div>

        {/* Editorial Numbered Grid */}
        <div className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="flex flex-col gap-4">
            {contentTypes.map((type, index) => {
              const numberStr = String(index + 1).padStart(2, '0');
              
              return (
                <motion.button
                  key={type.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 0.3 + index * 0.1, 
                    type: 'spring', 
                    stiffness: 300, 
                    damping: 25 
                  }}
                  onClick={() => onSelect(type.id)}
                  className={cn(
                    "group relative flex items-center gap-4 p-4 text-left focus:outline-none w-full",
                    "bg-secondary/30 hover:bg-secondary/50 transition-all duration-300",
                    "border border-primary/40 hover:border-primary"
                  )}
                >
                  {/* Large Number - Always Left */}
                  <div className="relative flex-shrink-0 w-16 h-16 flex items-center justify-center">
                    <span 
                      className={cn(
                        "text-5xl font-black tracking-tighter",
                        "bg-clip-text text-transparent",
                        `bg-gradient-to-br ${type.gradient}`
                      )}
                      style={{ 
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}
                    >
                      {numberStr}
                    </span>
                    {/* Subtle glow behind number */}
                    <div 
                      className={cn(
                        "absolute inset-0 blur-2xl opacity-20",
                        `bg-gradient-to-br ${type.gradient}`
                      )}
                    />
                  </div>
                  
                  {/* Content - Center Aligned */}
                  <div className="flex-1 flex flex-col gap-1 items-center text-center">
                    <span className="text-lg font-bold text-foreground tracking-wide group-hover:text-primary transition-colors">
                      {type.title}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {type.description}
                    </span>
                  </div>
                  
                  {/* Icon - Always Right, Circular, Larger */}
                  <div className={cn(
                    "flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center",
                    type.nodeColor
                  )}>
                    <type.icon className="h-7 w-7 text-white" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
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

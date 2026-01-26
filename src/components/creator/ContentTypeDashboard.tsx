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
  glowColor: string;
}

const contentTypes: ContentTypeCard[] = [
  {
    id: 'expression',
    icon: Sparkles,
    title: 'Expression',
    description: 'Moments that fade in 24h',
    gradient: 'from-rose-500 to-pink-600',
    glowColor: 'shadow-rose-500/40',
  },
  {
    id: 'video',
    icon: Video,
    title: 'Video',
    description: 'Long-form content',
    gradient: 'from-blue-500 to-indigo-600',
    glowColor: 'shadow-blue-500/40',
  },
  {
    id: 'image',
    icon: Image,
    title: 'Photo',
    description: 'Share with style',
    gradient: 'from-amber-500 to-orange-600',
    glowColor: 'shadow-amber-500/40',
  },
  {
    id: 'post',
    icon: FileText,
    title: 'Post',
    description: 'Thoughts & polls',
    gradient: 'from-emerald-500 to-teal-600',
    glowColor: 'shadow-emerald-500/40',
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
      {/* Cinematic ambient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-rose-500/10 via-purple-500/5 to-transparent rounded-full blur-[100px]" />
        <div className="absolute top-1/3 left-0 w-[300px] h-[300px] bg-blue-500/8 rounded-full blur-[80px]" />
        <div className="absolute top-1/2 right-0 w-[250px] h-[250px] bg-amber-500/8 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[200px] h-[200px] bg-emerald-500/8 rounded-full blur-[60px]" />
      </div>

      {/* Minimal Header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-border/20">
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-lg hover:bg-secondary/50 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <div className="w-5" />
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
        <div className="flex flex-col items-center pt-6 pb-2 px-4">
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-72 h-24 bg-gradient-to-r from-rose-500/20 via-purple-500/15 to-orange-500/20 blur-[50px] rounded-full" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 25 }}
            className="relative"
          >
            <BrandMark className="h-12 w-[200px]" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg font-bold tracking-[0.25em] text-foreground/90 uppercase"
          >
            ERA STUDIO
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-1.5 text-sm text-muted-foreground"
          >
            What would you like to create?
          </motion.p>
        </div>

        {/* Zig-Zag Timeline */}
        <div className="flex-1 px-4 py-4 relative">
          {/* Central spine with gradient */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px]">
            <motion.div
              className="h-full w-full bg-gradient-to-b from-rose-500/60 via-blue-500/60 via-amber-500/60 to-emerald-500/60"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{ originY: 0 }}
            />
          </div>

          {/* Timeline Items */}
          <div className="flex flex-col justify-evenly h-full relative">
            {contentTypes.map((type, index) => {
              const isLeft = index % 2 === 0;
              
              return (
                <motion.div
                  key={type.id}
                  initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    delay: 0.4 + index * 0.1, 
                    type: 'spring', 
                    stiffness: 300, 
                    damping: 25 
                  }}
                  className={cn(
                    "relative flex items-center",
                    isLeft ? "pr-[52%]" : "pl-[52%] flex-row-reverse"
                  )}
                >
                  {/* Central Node */}
                  <motion.div
                    className="absolute left-1/2 -translate-x-1/2 z-20"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      delay: 0.35 + index * 0.1, 
                      type: 'spring', 
                      stiffness: 500, 
                      damping: 20 
                    }}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full bg-gradient-to-br shadow-lg",
                      type.gradient,
                      type.glowColor
                    )} />
                  </motion.div>

                  {/* Connector Line */}
                  <motion.div
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r",
                      isLeft 
                        ? "right-[50%] left-auto w-[calc(50%-8px)] from-transparent via-border/40 to-border/60" 
                        : "left-[50%] right-auto w-[calc(50%-8px)] from-border/60 via-border/40 to-transparent"
                    )}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                    style={{ originX: isLeft ? 1 : 0 }}
                  />

                  {/* Content Card */}
                  <button
                    onClick={() => onSelect(type.id)}
                    className={cn(
                      "group relative flex items-center gap-3 p-3 rounded-xl w-full",
                      "bg-card/40 border border-border/30 backdrop-blur-sm",
                      "transition-all duration-300 ease-out",
                      "hover:bg-card/60 hover:border-border/50 hover:scale-[1.02]",
                      "active:scale-[0.98]",
                      "focus:outline-none focus:ring-2 focus:ring-primary/30",
                      isLeft ? "flex-row" : "flex-row-reverse text-right"
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
                        "bg-gradient-to-br shadow-md",
                        type.gradient,
                        "transition-transform duration-300 group-hover:scale-110",
                        `group-hover:${type.glowColor}`
                      )}
                    >
                      <type.icon className="h-5 w-5 text-white" />
                    </div>

                    {/* Text */}
                    <div className={cn(
                      "flex-1 min-w-0",
                      isLeft ? "text-left" : "text-right"
                    )}>
                      <span className="block font-semibold text-foreground text-sm">
                        {type.title}
                      </span>
                      <span className="block text-xs text-muted-foreground mt-0.5 truncate">
                        {type.description}
                      </span>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="relative z-10 p-4 border-t border-border/20 bg-card/30 backdrop-blur-md"
      >
        <button 
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-secondary/40 hover:bg-secondary/60 rounded-lg transition-all duration-200 group hover:scale-[1.01] active:scale-[0.99]"
        >
          <FileEdit className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            Drafts
          </span>
          {draftCount > 0 && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
              {draftCount}
            </span>
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { Sparkles, Video, Image, FileText, ChevronRight, FileEdit, X, ArrowLeft } from 'lucide-react';
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
        <div className="flex flex-col items-start pt-8 pb-4 px-6">
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

        {/* Editorial Timeline */}
        <div className="flex-1 px-6 py-6">
          <div className="relative h-full flex flex-col">
            {/* Vertical Timeline Line */}
            <motion.div 
              className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-rose-500 via-blue-500 via-amber-500 to-emerald-500 rounded-full"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
              style={{ originY: 0 }}
            />
            
            {/* Timeline Items */}
            <div className="flex flex-col flex-1 justify-evenly">
              {contentTypes.map((type, index) => (
                <motion.button
                  key={type.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    delay: 0.4 + index * 0.08, 
                    type: 'spring', 
                    stiffness: 400, 
                    damping: 30 
                  }}
                  onClick={() => onSelect(type.id)}
                  className="group relative flex items-center gap-5 py-4 text-left focus:outline-none"
                >
                  {/* Timeline Node */}
                  <motion.div 
                    className={cn(
                      "relative z-10 w-6 h-6 rounded-full shadow-lg flex items-center justify-center",
                      "transition-all duration-300",
                      "group-hover:scale-110 group-hover:shadow-xl",
                      type.nodeColor
                    )}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      delay: 0.35 + index * 0.08, 
                      type: 'spring', 
                      stiffness: 500, 
                      damping: 25 
                    }}
                  >
                    <type.icon className="h-3 w-3 text-white" />
                  </motion.div>
                  
                  {/* Horizontal Connector */}
                  <motion.div 
                    className="w-6 h-[2px] bg-border/40 group-hover:bg-border/60 transition-colors"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.45 + index * 0.08, duration: 0.2 }}
                    style={{ originX: 0 }}
                  />
                  
                  {/* Content */}
                  <div className="flex-1 flex flex-col gap-0.5 transition-transform duration-200 group-hover:translate-x-1">
                    <span className="text-lg font-semibold text-foreground tracking-wide">
                      {type.title}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {type.description}
                    </span>
                  </div>
                  
                  {/* Action Indicator */}
                  <ChevronRight 
                    className="h-5 w-5 text-muted-foreground/30 transition-all duration-200 group-hover:text-muted-foreground group-hover:translate-x-1" 
                  />
                </motion.button>
              ))}
            </div>
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

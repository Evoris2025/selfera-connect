import { motion } from 'framer-motion';
import { Sparkles, Video, Image, FileText, ChevronRight, FileEdit, X, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDrafts } from './shared/DraftManager';
import logo from '@/assets/selfera-app-logo.png';

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
        <div className="flex flex-col items-center justify-center pt-12 pb-10 px-4">
          {/* Ambient glow behind logo */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-80 h-32 bg-gradient-to-r from-rose-500/20 via-purple-500/20 to-orange-500/20 blur-[100px] rounded-full" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 25 }}
            className="relative flex flex-col items-center -translate-x-6"
          >
            {/* Logo - using raw image for perfect centering */}
            <img 
              src={logo} 
              alt="SelfERA" 
              className="h-32 w-auto object-contain"
            />
            
            {/* STUDIO Title */}
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-sm font-medium tracking-[0.4em] text-muted-foreground/80 uppercase text-center"
            >
              STUDIO
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-2 text-base text-muted-foreground/60 font-normal text-center"
            >
              What would you like to create?
            </motion.p>
          </motion.div>
        </div>

        {/* Content Type Selection */}
        <div className="flex-1 px-5 py-4">
          <div className="flex flex-col gap-3">
            {contentTypes.map((type, index) => (
              <motion.button
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 0.3 + index * 0.08, 
                  type: 'spring', 
                  stiffness: 400, 
                  damping: 30 
                }}
                onClick={() => onSelect(type.id)}
                className="group relative flex items-center gap-4 p-4 bg-secondary/20 hover:bg-secondary/40 border border-border/20 hover:border-border/40 transition-all duration-200 text-left focus:outline-none"
              >
                {/* Icon */}
                <div 
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-xl shadow-lg",
                    "transition-all duration-300",
                    "group-hover:scale-105 group-hover:shadow-xl",
                    type.nodeColor
                  )}
                >
                  <type.icon className="h-5 w-5 text-white" />
                </div>
                
                {/* Content */}
                <div className="flex-1 flex flex-col gap-0.5">
                  <span className="text-lg font-semibold text-foreground">
                    {type.title}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {type.description}
                  </span>
                </div>
                
                {/* Action Indicator */}
                <ChevronRight 
                  className="h-5 w-5 text-muted-foreground/40 transition-all duration-200 group-hover:text-muted-foreground group-hover:translate-x-1" 
                />
              </motion.button>
            ))}
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

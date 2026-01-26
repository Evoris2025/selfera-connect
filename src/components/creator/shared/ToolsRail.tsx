import { motion, AnimatePresence } from 'framer-motion';
import { 
  Type, 
  Pencil, 
  Sticker, 
  Music, 
  Layers, 
  Sparkles,
  LucideIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToolType = 'none' | 'text' | 'draw' | 'stickers' | 'sounds' | 'interactive' | 'effects';

interface ToolItem {
  id: ToolType;
  icon: LucideIcon;
  label: string;
  activeColor?: string;
  indicatorColor?: string;
}

const tools: ToolItem[] = [
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'draw', icon: Pencil, label: 'Draw', activeColor: 'bg-green-500' },
  { id: 'stickers', icon: Sticker, label: 'Stickers' },
  { id: 'sounds', icon: Music, label: 'Music', indicatorColor: 'ring-green-500' },
  { id: 'interactive', icon: Layers, label: 'Poll', indicatorColor: 'ring-purple-500' },
  { id: 'effects', icon: Sparkles, label: 'Effects' },
];

interface ToolsRailProps {
  activeTool: ToolType;
  onToolSelect: (tool: ToolType) => void;
  hasDrawing?: boolean;
  hasSound?: boolean;
  hasInteractive?: boolean;
  className?: string;
}

export function ToolsRail({
  activeTool,
  onToolSelect,
  hasDrawing = false,
  hasSound = false,
  hasInteractive = false,
  className,
}: ToolsRailProps) {
  const getIndicator = (tool: ToolItem) => {
    if (tool.id === 'draw' && hasDrawing) return true;
    if (tool.id === 'sounds' && hasSound) return true;
    if (tool.id === 'interactive' && hasInteractive) return true;
    return false;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className={cn(
        "flex flex-col gap-2 p-2 bg-black/40 backdrop-blur-md rounded-2xl",
        className
      )}
    >
      {tools.map((tool, index) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;
        const hasIndicator = getIndicator(tool);

        return (
          <motion.button
            key={tool.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * (index + 1) }}
            onClick={() => onToolSelect(tool.id)}
            className={cn(
              "relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all",
              isActive 
                ? tool.activeColor || "bg-primary text-primary-foreground" 
                : "bg-white/10 text-white hover:bg-white/20",
              hasIndicator && !isActive && (tool.indicatorColor || "ring-2 ring-offset-2 ring-offset-black/40")
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[9px] font-medium mt-0.5 opacity-80">{tool.label}</span>
            
            {/* Active indicator dot */}
            <AnimatePresence>
              {hasIndicator && !isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-black/40"
                />
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </motion.div>
  );
}

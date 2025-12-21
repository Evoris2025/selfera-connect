import { memo, useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Grid3X3, Sparkles, Play, Users, BookOpen, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProfileTab, useProfileTabOrder } from '@/hooks/useProfileTabOrder';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface RearrangeableTabBarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isOwnProfile: boolean;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Grid3X3,
  Sparkles,
  Play,
  Users,
  BookOpen,
};

interface DraggableTabProps {
  tab: ProfileTab;
  index: number;
  isActive: boolean;
  isRearrangeMode: boolean;
  isDragging: boolean;
  dragOverIndex: number | null;
  onTabChange: (tabId: string) => void;
  onTap: () => void;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDragEnd: () => void;
}

const DraggableTab = memo(function DraggableTab({
  tab,
  index,
  isActive,
  isRearrangeMode,
  isDragging,
  dragOverIndex,
  onTabChange,
  onTap,
  onDragStart,
  onDragOver,
  onDragEnd,
}: DraggableTabProps) {
  const tapCount = useRef(0);
  const tapTimer = useRef<NodeJS.Timeout | null>(null);

  const Icon = ICON_MAP[tab.icon];
  const isBeingDraggedOver = dragOverIndex === index && !isDragging;

  const handleClick = () => {
    if (isRearrangeMode) return;
    
    tapCount.current += 1;
    
    if (tapTimer.current) {
      clearTimeout(tapTimer.current);
    }
    
    if (tapCount.current >= 3) {
      tapCount.current = 0;
      onTap();
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    } else {
      // Single tap - switch tab after short delay to detect multi-tap
      const currentTaps = tapCount.current;
      tapTimer.current = setTimeout(() => {
        if (tapCount.current === currentTaps && currentTaps < 3) {
          onTabChange(tab.id);
        }
        tapCount.current = 0;
      }, 300);
    }
  };

  useEffect(() => {
    return () => {
      if (tapTimer.current) {
        clearTimeout(tapTimer.current);
      }
    };
  }, []);

  return (
    <motion.button
      layout
      layoutId={`tab-${tab.id}`}
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: isDragging ? 0.5 : 1,
        scale: isDragging ? 1.1 : isBeingDraggedOver ? 0.9 : 1,
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        'flex-1 h-full flex items-center justify-center relative',
        isRearrangeMode && 'cursor-grab active:cursor-grabbing animate-jiggle',
        isDragging && 'z-50',
        isActive && !isRearrangeMode && 'border-b-2 border-foreground'
      )}
      onClick={handleClick}
      draggable={isRearrangeMode}
      onDragStart={() => {
        if (isRearrangeMode) {
          onDragStart(index);
        }
      }}
      onDragOver={(e) => {
        if (isRearrangeMode) {
          e.preventDefault();
          onDragOver(index);
        }
      }}
      onDragEnd={onDragEnd}
    >
      {isRearrangeMode ? (
        <div className="flex flex-col items-center gap-0.5">
          <GripVertical className="h-3 w-3 text-muted-foreground" />
          {Icon && <Icon className="h-4 w-4" />}
        </div>
      ) : (
        Icon && <Icon className="h-5 w-5" />
      )}
    </motion.button>
  );
});

export const RearrangeableTabBar = memo(function RearrangeableTabBar({
  activeTab,
  onTabChange,
  isOwnProfile,
}: RearrangeableTabBarProps) {
  const {
    orderedTabs,
    loading,
    saving,
    reorderTabs,
    saveOrder,
    storeOriginalOrder,
    restoreOriginalOrder,
  } = useProfileTabOrder();

  const [isRearrangeMode, setIsRearrangeMode] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const enterRearrangeMode = useCallback(() => {
    storeOriginalOrder();
    setIsRearrangeMode(true);
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }, [storeOriginalOrder]);

  const exitRearrangeMode = useCallback(async (save: boolean) => {
    if (save) {
      const success = await saveOrder();
      if (!success) {
        toast({
          title: 'Failed to save',
          description: 'Could not save tab order. Please try again.',
          variant: 'destructive',
        });
        restoreOriginalOrder();
      }
    } else {
      restoreOriginalOrder();
    }
    setIsRearrangeMode(false);
  }, [saveOrder, restoreOriginalOrder]);

  const handleDragStart = useCallback((index: number) => {
    setDraggingIndex(index);
  }, []);

  const handleDragOver = useCallback((index: number) => {
    if (draggingIndex === null || draggingIndex === index) return;
    
    setDragOverIndex(index);
    reorderTabs(draggingIndex, index);
    setDraggingIndex(index);
  }, [draggingIndex, reorderTabs]);

  const handleDragEnd = useCallback(() => {
    setDraggingIndex(null);
    setDragOverIndex(null);
  }, []);

  if (loading) {
    return (
      <div className="w-full h-12 border-y border-border flex items-center justify-center">
        <div className="flex gap-8">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="w-5 h-5 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Rearrange mode header */}
      {isRearrangeMode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-2 flex items-center justify-between"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => exitRearrangeMode(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <span className="text-sm font-medium">Rearrange Tabs</span>
          <Button
            variant="default"
            size="sm"
            onClick={() => exitRearrangeMode(true)}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Done'}
          </Button>
        </motion.div>
      )}

      {/* Tab bar */}
      <div className={cn(
        'w-full h-12 border-y border-border flex',
        isRearrangeMode && 'bg-muted/30'
      )}>
        {orderedTabs.map((tab, index) => (
          <DraggableTab
            key={tab.id}
            tab={tab}
            index={index}
            isActive={activeTab === tab.id}
            isRearrangeMode={isRearrangeMode}
            isDragging={draggingIndex === index}
            dragOverIndex={dragOverIndex}
            onTabChange={onTabChange}
            onTap={enterRearrangeMode}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>

      {/* Hint text */}
      {isOwnProfile && !isRearrangeMode && (
        <p className="text-xs text-center text-muted-foreground py-1">
          Triple-tap any tab to rearrange
        </p>
      )}
    </div>
  );
});

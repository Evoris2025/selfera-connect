import { memo, useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Grid3X3, Sparkles, Play, Users, BookOpen, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProfileTab, useProfileTabOrder } from '@/hooks/useProfileTabOrder';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { GridLayoutPicker } from './GridLayoutPicker';
import { useGridLayout, GridLayoutStyle } from '@/hooks/useGridLayout';

interface RearrangeableTabBarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isOwnProfile: boolean;
  profileUserId?: string;
  onLayoutChange?: (layout: GridLayoutStyle) => void;
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
  isOwnProfile: boolean;
  onTabChange: (tabId: string) => void;
  onTap: () => void;
  onLongPress: () => void;
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
  isOwnProfile,
  onTabChange,
  onTap,
  onLongPress,
  onDragStart,
  onDragOver,
  onDragEnd,
}: DraggableTabProps) {
  const tapCount = useRef(0);
  const tapTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPressing = useRef(false);

  const Icon = ICON_MAP[tab.icon];
  const isBeingDraggedOver = dragOverIndex === index && !isDragging;
  const isGridTab = tab.id === 'posts';

  const handlePointerDown = useCallback(() => {
    if (isRearrangeMode || !isOwnProfile || !isGridTab) return;
    
    isLongPressing.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPressing.current = true;
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
      onLongPress();
    }, 3000); // 3 second hold
  }, [isRearrangeMode, isOwnProfile, isGridTab, onLongPress]);

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleClick = () => {
    if (isRearrangeMode || isLongPressing.current) return;
    
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
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
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
        'flex-1 h-full flex items-center justify-center relative transition-colors duration-200',
        isRearrangeMode && 'cursor-grab active:cursor-grabbing animate-jiggle',
        isDragging && 'z-50',
        isActive && !isRearrangeMode && 'text-foreground',
        !isActive && !isRearrangeMode && 'text-muted-foreground hover:text-foreground/70'
      )}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
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
        <>
          {Icon && <Icon className="h-5 w-5" />}
          {isActive && (
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-foreground rounded-full"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
        </>
      )}
    </motion.button>
  );
});

export const RearrangeableTabBar = memo(function RearrangeableTabBar({
  activeTab,
  onTabChange,
  isOwnProfile,
  profileUserId,
  onLayoutChange,
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

  const { layoutStyle, saving: savingLayout, setLayoutStyle } = useGridLayout(profileUserId);

  const [isRearrangeMode, setIsRearrangeMode] = useState(false);
  const [isLayoutPickerOpen, setIsLayoutPickerOpen] = useState(false);
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

  const openLayoutPicker = useCallback(() => {
    setIsLayoutPickerOpen(true);
  }, []);

  const handleLayoutSelect = useCallback(async (layout: GridLayoutStyle) => {
    const success = await setLayoutStyle(layout);
    if (success) {
      onLayoutChange?.(layout);
      toast({
        title: 'Layout updated',
        description: `Grid layout changed to ${layout}`,
      });
    } else {
      toast({
        title: 'Failed to update',
        description: 'Could not save layout preference.',
        variant: 'destructive',
      });
    }
    setIsLayoutPickerOpen(false);
  }, [setLayoutStyle, onLayoutChange]);

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
      <div className="w-full h-11 border-t border-border/30 flex items-center justify-center">
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
          className="sticky top-0 z-20 glass-heavy px-4 py-2 flex items-center justify-between"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => exitRearrangeMode(false)}
            disabled={saving}
            className="rounded-xl text-muted-foreground"
          >
            Cancel
          </Button>
          <span className="text-sm font-medium text-foreground">Rearrange Tabs</span>
          <Button
            variant="default"
            size="sm"
            onClick={() => exitRearrangeMode(true)}
            disabled={saving}
            className="rounded-xl"
          >
            {saving ? 'Saving...' : 'Done'}
          </Button>
        </motion.div>
      )}

      {/* Minimal Tab Bar */}
      <div className={cn(
        'w-full h-11 border-t border-border/30 flex bg-background',
        isRearrangeMode && 'bg-muted/20'
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
            isOwnProfile={isOwnProfile}
            onTabChange={onTabChange}
            onTap={enterRearrangeMode}
            onLongPress={openLayoutPicker}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>

      {/* Hint text */}
      {isOwnProfile && !isRearrangeMode && (
        <p className="text-[11px] text-center text-muted-foreground/60 py-1.5">
          Triple-tap to rearrange • Hold grid icon for layout
        </p>
      )}

      {/* Grid Layout Picker */}
      <GridLayoutPicker
        isOpen={isLayoutPickerOpen}
        currentLayout={layoutStyle}
        saving={savingLayout}
        onSelect={handleLayoutSelect}
        onClose={() => setIsLayoutPickerOpen(false)}
      />
    </div>
  );
});

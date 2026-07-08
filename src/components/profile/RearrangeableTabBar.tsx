import { memo, useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import { CONTENT_TYPE_ICONS, type ContentTypeIconKey } from '@/components/icons/contentTypeIcons';
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

// Tabs that should offer the grid-layout long-press picker.
const GRID_LAYOUT_TAB_IDS = new Set(['unified', 'expressions', 'video', 'images', 'posts']);

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

  const Icon = CONTENT_TYPE_ICONS[tab.icon as ContentTypeIconKey];
  const isBeingDraggedOver = dragOverIndex === index && !isDragging;
  // Allow the grid-layout long-press picker on grid-style content tabs.
  const isGridTab = GRID_LAYOUT_TAB_IDS.has(tab.id);

  const handlePointerDown = useCallback(() => {
    if (isRearrangeMode || !isOwnProfile || !isGridTab) return;
    
    isLongPressing.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPressing.current = true;
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
      onLongPress();
    }, 2000); // 2 second hold
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
        'relative flex items-center justify-center py-2.5 shrink-0 min-w-[56px] flex-1 transition-all duration-200',
        isRearrangeMode && 'cursor-grab active:cursor-grabbing animate-jiggle',
        isDragging && 'z-50',
        isActive && !isRearrangeMode && 'text-white',
        !isActive && !isRearrangeMode && 'text-white/45 hover:text-white/70',
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
      {/* Active indicator - 2px brand-gradient underline */}
      {isActive && !isRearrangeMode && (
        <motion.div
          layoutId="polishedTabIndicator"
          className="absolute bottom-0 left-0 right-0 h-[2px] gradient-brand pointer-events-none"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      
      {isRearrangeMode ? (
        <div className="relative z-10 flex flex-col items-center gap-0.5">
          <GripVertical className="h-3 w-3 text-muted-foreground" />
          {Icon && <Icon className="h-4 w-4" />}
        </div>
      ) : (
        <div className="relative z-10">
          {Icon && <Icon className="h-5 w-5" />}
        </div>
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

  useEffect(() => {
    onLayoutChange?.(layoutStyle);
  }, [layoutStyle, onLayoutChange]);

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
    // Seamless: render the bar shell only, no pulsing dots.
    return <div className="w-full h-11 border-t border-border/30" aria-hidden />;
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
          <span className="text-body font-medium text-foreground">Rearrange Tabs</span>
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

      {/* Polished Tab Bar — square edge, horizontally scrollable when 7 tabs
          overflow the viewport so icons stay the same size instead of shrinking. */}
      <div className={cn(
        'w-full overflow-x-auto scrollbar-none bg-[hsl(240,10%,8%)] border border-border/30 mx-4',
        isRearrangeMode && 'bg-muted/20'
      )}
        style={{ width: 'calc(100% - 2rem)' }}
      >
        <div className="flex items-center min-w-full w-max">
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
      </div>

      {/* Hint text - centered with proper spacing */}
      {isOwnProfile && !isRearrangeMode && (
        <div className="w-full flex items-center justify-center py-2 px-4">
          <p className="text-caption text-muted-foreground/50 leading-none text-center whitespace-nowrap">
            Triple-tap to rearrange • Hold grid icon for layout
          </p>
        </div>
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

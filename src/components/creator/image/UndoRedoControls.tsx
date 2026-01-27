import { motion } from 'framer-motion';
import { Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UndoRedoControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  className?: string;
}

export function UndoRedoControls({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  className,
}: UndoRedoControlsProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <motion.div whileTap={{ scale: 0.9 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          className={cn(
            'h-8 w-8 p-0 transition-opacity',
            !canUndo && 'opacity-40'
          )}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
      </motion.div>
      
      <motion.div whileTap={{ scale: 0.9 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          className={cn(
            'h-8 w-8 p-0 transition-opacity',
            !canRedo && 'opacity-40'
          )}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </motion.div>
    </div>
  );
}

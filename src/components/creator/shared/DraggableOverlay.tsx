import { useState, useRef, ReactNode } from 'react';
import { motion, useDragControls, PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraggableOverlayProps {
  id: string;
  children: ReactNode;
  initialPosition?: { x: number; y: number };
  onPositionChange?: (id: string, position: { x: number; y: number }) => void;
  onDelete?: (id: string) => void;
  containerRef: React.RefObject<HTMLElement>;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export function DraggableOverlay({
  id,
  children,
  initialPosition = { x: 50, y: 50 },
  onPositionChange,
  onDelete,
  containerRef,
  isSelected = false,
  onSelect,
}: DraggableOverlayProps) {
  const dragControls = useDragControls();
  const [position, setPosition] = useState(initialPosition);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (!containerRef.current || !elementRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const elementRect = elementRef.current.getBoundingClientRect();

    // Calculate percentage position
    const newX = ((elementRect.left - containerRect.left + elementRect.width / 2) / containerRect.width) * 100;
    const newY = ((elementRect.top - containerRect.top + elementRect.height / 2) / containerRect.height) * 100;

    // Clamp to container bounds
    const clampedX = Math.max(5, Math.min(95, newX));
    const clampedY = Math.max(5, Math.min(95, newY));

    setPosition({ x: clampedX, y: clampedY });
    onPositionChange?.(id, { x: clampedX, y: clampedY });
  };

  return (
    <motion.div
      ref={elementRef}
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(id);
      }}
      className={cn(
        "absolute cursor-move touch-none",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-transparent rounded"
      )}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Delete button - only visible when selected */}
      {isSelected && onDelete && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg z-10"
        >
          <X className="w-3 h-3" />
        </motion.button>
      )}
      
      {children}
    </motion.div>
  );
}

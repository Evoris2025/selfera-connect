import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Eraser, Undo2, Redo2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export interface DrawingData {
  dataUrl: string;
  strokes: Stroke[];
}

interface Stroke {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  size: number;
  tool: 'brush' | 'eraser';
}

interface DrawingCanvasProps {
  width: number;
  height: number;
  onSave: (data: DrawingData) => void;
  onCancel: () => void;
}

const BRUSH_COLORS = [
  '#FFFFFF',
  '#000000',
  '#FF3B30',
  '#FF9500',
  '#FFCC00',
  '#34C759',
  '#007AFF',
  '#5856D6',
  '#AF52DE',
  '#FF2D55',
];

const BRUSH_SIZES = [
  { name: 'thin', value: 2 },
  { name: 'medium', value: 6 },
  { name: 'thick', value: 12 },
];

export function DrawingCanvas({ width, height, onSave, onCancel }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [color, setColor] = useState('#FFFFFF');
  const [brushSize, setBrushSize] = useState(6);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [undoStack, setUndoStack] = useState<Stroke[][]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[][]>([]);

  const getCanvasCoords = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    setCurrentStroke({
      id: `stroke-${Date.now()}`,
      points: [coords],
      color: tool === 'eraser' ? 'eraser' : color,
      size: brushSize,
      tool,
    });
  }, [getCanvasCoords, tool, color, brushSize]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !currentStroke) return;
    e.preventDefault();
    const coords = getCanvasCoords(e);
    setCurrentStroke(prev => prev ? {
      ...prev,
      points: [...prev.points, coords],
    } : null);
  }, [isDrawing, currentStroke, getCanvasCoords]);

  const endDrawing = useCallback(() => {
    if (currentStroke && currentStroke.points.length > 1) {
      setUndoStack(prev => [...prev, strokes]);
      setRedoStack([]);
      setStrokes(prev => [...prev, currentStroke]);
    }
    setIsDrawing(false);
    setCurrentStroke(null);
  }, [currentStroke, strokes]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previousStrokes = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, strokes]);
    setStrokes(previousStrokes);
    setUndoStack(prev => prev.slice(0, -1));
  }, [undoStack, strokes]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const nextStrokes = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, strokes]);
    setStrokes(nextStrokes);
    setRedoStack(prev => prev.slice(0, -1));
  }, [redoStack, strokes]);

  // Render strokes to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all completed strokes
    const allStrokes = currentStroke ? [...strokes, currentStroke] : strokes;
    
    allStrokes.forEach(stroke => {
      if (stroke.points.length < 2) return;

      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = stroke.size;

      if (stroke.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
      }

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });
  }, [strokes, currentStroke]);

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    onSave({
      dataUrl: canvas.toDataURL('image/png'),
      strokes,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full bg-background"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <h3 className="font-semibold">Draw</h3>
        <Button size="sm" onClick={handleSave} disabled={strokes.length === 0}>
          Done
        </Button>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center p-4 bg-muted/30">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
          className="rounded-xl bg-transparent touch-none"
          style={{ 
            maxWidth: '100%',
            maxHeight: '50vh',
            aspectRatio: `${width}/${height}`,
          }}
        />
      </div>

      {/* Toolbar */}
      <div className="p-4 space-y-4 border-t border-border bg-background">
        {/* Tool Selection */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setTool('brush')}
              className={cn(
                "p-3 rounded-xl transition-colors",
                tool === 'brush' ? "bg-primary text-primary-foreground" : "bg-secondary"
              )}
            >
              <Pencil className="w-5 h-5" />
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={cn(
                "p-3 rounded-xl transition-colors",
                tool === 'eraser' ? "bg-primary text-primary-foreground" : "bg-secondary"
              )}
            >
              <Eraser className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={undo}
              disabled={undoStack.length === 0}
              className="p-3 rounded-xl bg-secondary disabled:opacity-50 transition-opacity"
            >
              <Undo2 className="w-5 h-5" />
            </button>
            <button
              onClick={redo}
              disabled={redoStack.length === 0}
              className="p-3 rounded-xl bg-secondary disabled:opacity-50 transition-opacity"
            >
              <Redo2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Brush Size */}
        <div className="flex items-center gap-4">
          <span className="text-body text-muted-foreground w-12">Size</span>
          <div className="flex gap-2">
            {BRUSH_SIZES.map((size) => (
              <button
                key={size.name}
                onClick={() => setBrushSize(size.value)}
                className={cn(
                  "p-2 rounded-lg transition-colors flex items-center justify-center",
                  brushSize === size.value ? "bg-primary text-primary-foreground" : "bg-secondary"
                )}
              >
                <Circle 
                  className="fill-current" 
                  style={{ width: size.value + 8, height: size.value + 8 }} 
                />
              </button>
            ))}
          </div>
        </div>

        {/* Color Picker */}
        {tool === 'brush' && (
          <div className="flex items-center gap-4">
            <span className="text-body text-muted-foreground w-12">Color</span>
            <div className="flex gap-2 flex-wrap">
              {BRUSH_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-transform border-2",
                    color === c ? "scale-110 border-primary" : "border-transparent"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

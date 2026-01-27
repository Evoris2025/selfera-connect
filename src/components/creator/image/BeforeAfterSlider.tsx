import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeClassName?: string;
  beforeStyle?: React.CSSProperties;
  afterClassName?: string;
  afterStyle?: React.CSSProperties;
  className?: string;
  /** Use object-cover to match normal/crop mode */
  objectFit?: 'contain' | 'cover';
}

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeClassName,
  beforeStyle,
  afterClassName,
  afterStyle,
  className,
  objectFit = 'cover',
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleMove(e.touches[0].clientX);
  };

  // Attach/detach global listeners
  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onMouseUp = () => setIsDragging(false);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const onTouchEnd = () => setIsDragging(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, handleMove]);

  const imgObjectFit = objectFit === 'cover' ? 'object-cover' : 'object-contain';

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full overflow-hidden cursor-col-resize select-none',
        className
      )}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Before Image (Full) */}
      <img
        src={beforeSrc}
        alt="Before"
        className={cn('absolute inset-0 w-full h-full', imgObjectFit, beforeClassName)}
        style={beforeStyle}
        draggable={false}
      />

      {/* After Image (Clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={afterSrc}
          alt="After"
          className={cn('w-full h-full', imgObjectFit, afterClassName)}
          style={afterStyle}
          draggable={false}
        />
      </div>

      {/* Slider Line */}
      <motion.div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        animate={{ opacity: isDragging ? 1 : 0.8 }}
      >
        {/* Handle */}
        <motion.div
          className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            'w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg',
            'flex items-center justify-center',
            'border-2 border-white'
          )}
          animate={{ 
            scale: isDragging ? 1.1 : 1,
            boxShadow: isDragging 
              ? '0 4px 20px rgba(0,0,0,0.3)' 
              : '0 2px 10px rgba(0,0,0,0.2)'
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          {/* Arrows */}
          <div className="flex items-center gap-0.5 text-gray-600">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </motion.div>
      </motion.div>

      {/* Labels */}
      <div className="absolute bottom-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm">
        <span className="text-xs font-medium text-white">Before</span>
      </div>
      <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm">
        <span className="text-xs font-medium text-white">After</span>
      </div>
    </div>
  );
}

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, AlignLeft, AlignCenter, AlignRight, Palette, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface TextOverlay {
  id: string;
  text: string;
  fontFamily: string;
  color: string;
  backgroundColor: string | null;
  alignment: 'left' | 'center' | 'right';
  position: { x: number; y: number };
  fontSize: 'small' | 'medium' | 'large';
}

interface TextOverlayEditorProps {
  overlay?: TextOverlay | null;
  onSave: (overlay: TextOverlay) => void;
  onCancel: () => void;
}

const fontFamilies = [
  { name: 'Sans', value: 'Inter, system-ui, sans-serif' },
  { name: 'Serif', value: 'Georgia, serif' },
  { name: 'Script', value: 'Brush Script MT, cursive' },
  { name: 'Bold', value: 'Impact, sans-serif' },
  { name: 'Mono', value: 'JetBrains Mono, monospace' },
];

const colorPresets = [
  '#FFFFFF', '#000000', '#FF3B30', '#FF9500', '#FFCC00',
  '#34C759', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55',
];

const backgroundPresets = [
  null, // No background
  'rgba(0,0,0,0.5)',
  'rgba(255,255,255,0.8)',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
];

export function TextOverlayEditor({ overlay, onSave, onCancel }: TextOverlayEditorProps) {
  const [text, setText] = useState(overlay?.text || '');
  const [fontFamily, setFontFamily] = useState(overlay?.fontFamily || fontFamilies[0].value);
  const [color, setColor] = useState(overlay?.color || '#FFFFFF');
  const [backgroundColor, setBackgroundColor] = useState<string | null>(overlay?.backgroundColor || null);
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>(overlay?.alignment || 'center');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>(overlay?.fontSize || 'medium');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!text.trim()) return;
    
    onSave({
      id: overlay?.id || `text-${Date.now()}`,
      text: text.trim(),
      fontFamily,
      color,
      backgroundColor,
      alignment,
      position: overlay?.position || { x: 50, y: 50 },
      fontSize,
    });
  };

  const fontSizeClasses = {
    small: 'text-title',
    medium: 'text-2xl',
    large: 'text-4xl',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute inset-x-0 bottom-0 bg-background/95 backdrop-blur-xl border-t border-border rounded-t-3xl p-4 z-50"
    >
      {/* Preview */}
      <div className="mb-4 p-4 bg-muted/50 rounded-xl min-h-[80px] flex items-center justify-center">
        <p
          className={cn(
            "font-semibold transition-all",
            fontSizeClasses[fontSize],
            alignment === 'left' && 'text-left w-full',
            alignment === 'center' && 'text-center',
            alignment === 'right' && 'text-right w-full'
          )}
          style={{
            fontFamily,
            color,
            background: backgroundColor || 'transparent',
            padding: backgroundColor ? '8px 16px' : '0',
            borderRadius: backgroundColor ? '8px' : '0',
          }}
        >
          {text || 'Enter your text...'}
        </p>
      </div>

      {/* Text Input */}
      <Input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your text here..."
        className="mb-4 text-title"
        autoFocus
      />

      {/* Font Family */}
      <div className="mb-4">
        <p className="text-label text-muted-foreground mb-2">Font</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {fontFamilies.map((font) => (
            <button
              key={font.name}
              onClick={() => setFontFamily(font.value)}
              className={cn(
                "px-4 py-2 rounded-lg text-body whitespace-nowrap transition-all",
                fontFamily === font.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary hover:bg-secondary/80"
              )}
              style={{ fontFamily: font.value }}
            >
              {font.name}
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div className="mb-4">
        <p className="text-label text-muted-foreground mb-2">Size</p>
        <div className="flex gap-2">
          {(['small', 'medium', 'large'] as const).map((size) => (
            <button
              key={size}
              onClick={() => setFontSize(size)}
              className={cn(
                "px-4 py-2 rounded-lg text-body capitalize transition-all flex-1",
                fontSize === size
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary hover:bg-secondary/80"
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Text Color */}
      <div className="mb-4">
        <p className="text-label text-muted-foreground mb-2">Text Color</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {colorPresets.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all shrink-0",
                color === c ? "border-primary scale-110" : "border-transparent"
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Background */}
      <div className="mb-4">
        <p className="text-label text-muted-foreground mb-2">Background</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {backgroundPresets.map((bg, index) => (
            <button
              key={index}
              onClick={() => setBackgroundColor(bg)}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all shrink-0 flex items-center justify-center",
                backgroundColor === bg ? "border-primary scale-110" : "border-muted"
              )}
              style={{ background: bg || 'transparent' }}
            >
              {bg === null && <X className="w-4 h-4 text-muted-foreground" />}
            </button>
          ))}
        </div>
      </div>

      {/* Alignment */}
      <div className="mb-6">
        <p className="text-label text-muted-foreground mb-2">Alignment</p>
        <div className="flex gap-2">
          {[
            { value: 'left', icon: AlignLeft },
            { value: 'center', icon: AlignCenter },
            { value: 'right', icon: AlignRight },
          ].map(({ value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setAlignment(value as 'left' | 'center' | 'right')}
              className={cn(
                "p-3 rounded-lg transition-all flex-1 flex items-center justify-center",
                alignment === value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary hover:bg-secondary/80"
              )}
            >
              <Icon className="w-5 h-5" />
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!text.trim()} className="flex-1 gap-2">
          <Check className="w-4 h-4" />
          Add Text
        </Button>
      </div>
    </motion.div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Video, User, Link2, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type EndScreenElementType = 'video' | 'profile' | 'link';

export interface EndScreenElement {
  id: string;
  type: EndScreenElementType;
  position: { x: number; y: number };
  data: {
    videoId?: string;
    videoTitle?: string;
    profileId?: string;
    profileName?: string;
    linkUrl?: string;
    linkLabel?: string;
  };
}

interface EndScreenEditorProps {
  elements: EndScreenElement[];
  onChange: (elements: EndScreenElement[]) => void;
  videoDuration: number;
}

const elementTypes: { type: EndScreenElementType; label: string; icon: React.ReactNode }[] = [
  { type: 'video', label: 'Video', icon: <Video className="w-5 h-5" /> },
  { type: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  { type: 'link', label: 'Link', icon: <Link2 className="w-5 h-5" /> },
];

export function EndScreenEditor({ elements, onChange, videoDuration }: EndScreenEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedType, setSelectedType] = useState<EndScreenElementType | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [inputLabel, setInputLabel] = useState('');

  const handleAdd = () => {
    if (!selectedType) return;

    let data: EndScreenElement['data'] = {};
    
    switch (selectedType) {
      case 'video':
        data = { videoTitle: inputValue || 'Best for viewer' };
        break;
      case 'profile':
        data = { profileName: inputValue || 'Subscribe' };
        break;
      case 'link':
        if (!inputValue) return;
        data = { linkUrl: inputValue, linkLabel: inputLabel || 'Visit' };
        break;
    }

    const newElement: EndScreenElement = {
      id: `endscreen-${Date.now()}`,
      type: selectedType,
      position: { x: 20 + elements.length * 25, y: 50 },
      data,
    };

    onChange([...elements, newElement]);
    setInputValue('');
    setInputLabel('');
    setSelectedType(null);
    setIsAdding(false);
  };

  const handleRemove = (id: string) => {
    onChange(elements.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">End Screen</label>
        {!isAdding && elements.length < 4 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="h-8 text-xs"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Element
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        End screens appear in the last 20 seconds of your video to promote content.
      </p>

      {/* Add element flow */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 p-3 bg-secondary/30 rounded-xl"
          >
            {!selectedType ? (
              <>
                <p className="text-sm font-medium">Choose element type</p>
                <div className="flex gap-2">
                  {elementTypes.map((type) => (
                    <button
                      key={type.type}
                      onClick={() => setSelectedType(type.type)}
                      className="flex-1 flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {type.icon}
                      </div>
                      <span className="text-xs font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAdding(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  {elementTypes.find(t => t.type === selectedType)?.icon}
                  <span className="font-medium text-sm">
                    {elementTypes.find(t => t.type === selectedType)?.label}
                  </span>
                </div>
                
                {selectedType === 'link' ? (
                  <div className="space-y-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="https://..."
                      type="url"
                    />
                    <Input
                      value={inputLabel}
                      onChange={(e) => setInputLabel(e.target.value)}
                      placeholder="Button label (optional)"
                      maxLength={20}
                    />
                  </div>
                ) : (
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={
                      selectedType === 'video' 
                        ? 'Video title (or leave blank for "Best for viewer")'
                        : 'Button text'
                    }
                    maxLength={40}
                  />
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedType(null);
                      setInputValue('');
                      setInputLabel('');
                    }}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button size="sm" onClick={handleAdd} className="flex-1">
                    Add
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Elements list */}
      {elements.length > 0 && (
        <div className="space-y-2">
          {elements.map((element) => (
            <div
              key={element.id}
              className="flex items-center gap-3 p-2 bg-secondary/50 rounded-lg group"
            >
              <div className="p-1.5 rounded bg-primary/10 text-primary">
                {elementTypes.find(t => t.type === element.type)?.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {element.type === 'video' && (element.data.videoTitle || 'Best for viewer')}
                  {element.type === 'profile' && (element.data.profileName || 'Subscribe')}
                  {element.type === 'link' && (element.data.linkLabel || element.data.linkUrl)}
                </p>
                <p className="text-xs text-muted-foreground capitalize">{element.type}</p>
              </div>
              <button
                onClick={() => handleRemove(element.id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-destructive transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Preview area */}
      {elements.length > 0 && (
        <div className="aspect-video bg-black/80 rounded-xl relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-white/50">End screen preview</span>
          </div>
          {elements.map((element, index) => (
            <motion.div
              key={element.id}
              drag
              dragMomentum={false}
              className={cn(
                "absolute p-2 rounded-lg cursor-move",
                element.type === 'video' && "w-32 h-20 bg-secondary/80",
                element.type === 'profile' && "w-24 h-24 rounded-full bg-primary/80",
                element.type === 'link' && "px-4 py-2 bg-blue-500/80 rounded-full"
              )}
              style={{
                left: `${element.position.x}%`,
                top: `${element.position.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="flex items-center justify-center h-full text-white text-xs">
                {elementTypes.find(t => t.type === element.type)?.icon}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

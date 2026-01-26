import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Camera, Image as ImageIcon, X, Loader2, Sparkles, Type, Sticker, Music, Pencil, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useFeedData } from '@/contexts/FeedDataContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { TextOverlayEditor, TextOverlay } from './TextOverlayEditor';
import { StickerPicker, Sticker as StickerType } from './StickerPicker';
import { SoundPicker, Sound } from './SoundPicker';
import { HashtagAutocomplete, TrendingHashtagChips } from './HashtagAutocomplete';
import { 
  DrawingCanvas, 
  DrawingData,
  InteractiveStickerPicker,
  InteractiveStickerDisplay,
  InteractiveSticker,
  CloseFriendsToggle,
  HighlightSelector,
  AddToHighlightPrompt,
  Highlight,
} from './expressions';

// Simulation mode flag - when true, uses FeedDataContext instead of Supabase
const SIMULATION_MODE = true;

type Step = 'capture' | 'preview' | 'drawing';
type ActiveTool = 'none' | 'text' | 'stickers' | 'sounds' | 'interactive' | 'draw';

// Extended sticker with position for rendering
interface PlacedSticker extends StickerType {
  placedId: string;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
}

interface ExpressionCreatorProps {
  onBack: () => void;
  onSuccess: () => void;
}

// Mock highlights for demo
const mockHighlights: Highlight[] = [
  { id: 'h1', name: 'Travel', expressionCount: 12 },
  { id: 'h2', name: 'Wellness', expressionCount: 8 },
  { id: 'h3', name: 'Gratitude', expressionCount: 5 },
];

export function ExpressionCreator({ onBack, onSuccess }: ExpressionCreatorProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { createExpression, isSimulationMode } = useFeedData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [step, setStep] = useState<Step>('capture');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isVideo, setIsVideo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  
  // Phase 2 creation tools state
  const [activeTool, setActiveTool] = useState<ActiveTool>('none');
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  const [interactiveStickers, setInteractiveStickers] = useState<InteractiveSticker[]>([]);
  const [selectedSound, setSelectedSound] = useState<Sound | null>(null);
  const [caption, setCaption] = useState('');
  const [drawingData, setDrawingData] = useState<DrawingData | null>(null);
  
  // Close Friends & Highlights
  const [closeFriendsOnly, setCloseFriendsOnly] = useState(false);
  const [showHighlightSelector, setShowHighlightSelector] = useState(false);
  const [showHighlightPrompt, setShowHighlightPrompt] = useState(false);
  const [highlights] = useState<Highlight[]>(mockHighlights);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsVideo(file.type.startsWith('video'));
      setStep('preview');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      setCameraStream(stream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: 'Camera Error',
        description: 'Could not access camera. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
        setSelectedFile(file);
        setPreviewUrl(canvas.toDataURL('image/jpeg'));
        setIsVideo(false);
        stopCamera();
        setStep('preview');
      }
    }, 'image/jpeg', 0.9);
  };

  const handleSaveTextOverlay = (overlay: TextOverlay) => {
    setTextOverlays(prev => [...prev, overlay]);
    setActiveTool('none');
  };

  const handleAddSticker = (sticker: StickerType) => {
    const placedSticker: PlacedSticker = {
      ...sticker,
      placedId: `${sticker.id}-${Date.now()}`,
      position: { x: 50, y: 50 },
      scale: 1,
      rotation: 0,
    };
    setStickers(prev => [...prev, placedSticker]);
    setActiveTool('none');
  };

  const handleAddInteractiveSticker = (sticker: InteractiveSticker) => {
    setInteractiveStickers(prev => [...prev, sticker]);
  };

  const handleRemoveInteractiveSticker = (id: string) => {
    setInteractiveStickers(prev => prev.filter(s => s.id !== id));
  };

  const handleSelectSound = (sound: Sound) => {
    setSelectedSound(sound);
    setActiveTool('none');
  };

  const handleSaveDrawing = (data: DrawingData) => {
    setDrawingData(data);
    setStep('preview');
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setIsSubmitting(true);

    try {
      // Use simulation mode via FeedDataContext
      if (SIMULATION_MODE || isSimulationMode) {
        const displayName = user?.email?.split('@')[0] || 'You';

        // Create expression via FeedDataContext - it will appear instantly
        createExpression({
          userId: user?.id || `sim-user-${Date.now()}`,
          userName: displayName,
          userAvatar: '',
          mediaUrl: previewUrl,
          mediaType: isVideo ? 'video' : 'image',
          caption: caption.trim() || undefined,
          hasUnseenExpression: true,
        });

        // Show highlight prompt after sharing
        setShowHighlightPrompt(true);
        return;
      }

      // Real Supabase mode (when not in simulation)
      if (!user) return;

      // Upload media
      const fileExt = selectedFile.name.split('.').pop() || 'jpg';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      // Create expression
      const { error: expressionError } = await supabase
        .from('expressions')
        .insert({
          user_id: user.id,
          media_url: urlData.publicUrl,
          media_type: isVideo ? 'video' : 'image',
        });

      if (expressionError) throw expressionError;

      // Show highlight prompt
      setShowHighlightPrompt(true);
    } catch (error) {
      console.error('Error creating expression:', error);
      toast({
        title: 'Error',
        description: 'Failed to add expression. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToHighlight = (highlightId: string) => {
    toast({
      title: 'Added to highlight!',
      description: 'Your expression will be saved permanently.',
    });
    onSuccess();
  };

  const handleCreateHighlight = (name: string) => {
    toast({
      title: 'Highlight created!',
      description: `"${name}" has been added to your profile.`,
    });
    onSuccess();
  };

  const handleBack = () => {
    if (activeTool !== 'none') {
      setActiveTool('none');
      return;
    }
    if (step === 'drawing') {
      setStep('preview');
      return;
    }
    if (step === 'preview') {
      setStep('capture');
      setSelectedFile(null);
      setPreviewUrl('');
      setTextOverlays([]);
      setStickers([]);
      setInteractiveStickers([]);
      setSelectedSound(null);
      setCaption('');
      setDrawingData(null);
      setCloseFriendsOnly(false);
    } else {
      stopCamera();
      onBack();
    }
  };

  const toggleTool = (tool: ActiveTool) => {
    if (tool === 'draw') {
      setStep('drawing');
    } else {
      setActiveTool(prev => prev === tool ? 'none' : tool);
    }
  };

  // Get font size in pixels based on size name
  const getFontSize = (size: 'small' | 'medium' | 'large') => {
    switch (size) {
      case 'small': return 14;
      case 'medium': return 20;
      case 'large': return 28;
    }
  };

  // Drawing mode
  if (step === 'drawing') {
    return (
      <DrawingCanvas
        width={1080}
        height={1920}
        onSave={handleSaveDrawing}
        onCancel={() => setStep('preview')}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full max-h-[85vh]"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-pink-500" />
          <h2 className="font-semibold">Expression</h2>
        </div>
        {step === 'preview' ? (
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="gradient-brand text-white"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Share'}
          </Button>
        ) : (
          <div className="w-12" />
        )}
      </div>

      <AnimatePresence mode="wait">
        {step === 'capture' && (
          <motion.div
            key="capture"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            {cameraActive ? (
              <div className="flex-1 relative bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-6">
                  <button
                    onClick={stopCamera}
                    className="p-3 rounded-full bg-white/20 backdrop-blur"
                  >
                    <X className="h-6 w-6 text-white" />
                  </button>
                  <button
                    onClick={capturePhoto}
                    className="w-20 h-20 rounded-full border-4 border-white bg-white/30 backdrop-blur flex items-center justify-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-white" />
                  </button>
                  <div className="w-12" />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <button
                  onClick={startCamera}
                  className="w-32 h-32 rounded-full gradient-brand flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
                >
                  <Camera className="h-12 w-12 text-white" />
                </button>
                <span className="text-sm text-muted-foreground">Tap to open camera</span>

                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <ImageIcon className="h-5 w-5" />
                  <span>Choose from gallery</span>
                </button>

                <p className="text-xs text-muted-foreground text-center max-w-[240px]">
                  Expressions disappear after 24 hours. Share moments that matter to you.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {step === 'preview' && (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col bg-black relative overflow-hidden"
          >
            {/* Media Preview with overlays */}
            <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
              {isVideo ? (
                <video
                  src={previewUrl}
                  className="max-w-full max-h-[40vh] rounded-xl"
                  controls
                  autoPlay
                  loop
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-[40vh] rounded-xl object-contain"
                />
              )}
              
              {/* Drawing overlay */}
              {drawingData && (
                <img
                  src={drawingData.dataUrl}
                  alt="Drawing"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />
              )}
              
              {/* Render text overlays */}
              {textOverlays.map((overlay) => (
                <div
                  key={overlay.id}
                  className="absolute pointer-events-none"
                  style={{
                    left: `${overlay.position.x}%`,
                    top: `${overlay.position.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: overlay.fontFamily,
                      fontSize: `${getFontSize(overlay.fontSize)}px`,
                      color: overlay.color,
                      textAlign: overlay.alignment,
                      background: overlay.backgroundColor || undefined,
                      padding: overlay.backgroundColor ? '4px 12px' : undefined,
                      borderRadius: overlay.backgroundColor ? '8px' : undefined,
                    }}
                    className="whitespace-pre-wrap"
                  >
                    {overlay.text}
                  </span>
                </div>
              ))}
              
              {/* Render stickers */}
              {stickers.map((sticker) => (
                <div
                  key={sticker.placedId}
                  className="absolute text-4xl pointer-events-none"
                  style={{
                    left: `${sticker.position.x}%`,
                    top: `${sticker.position.y}%`,
                    transform: `translate(-50%, -50%) scale(${sticker.scale}) rotate(${sticker.rotation}deg)`,
                  }}
                >
                  {sticker.emoji}
                </div>
              ))}
              
              {/* Render interactive stickers */}
              {interactiveStickers.map((sticker) => (
                <div
                  key={sticker.id}
                  className="absolute"
                  style={{
                    left: `${sticker.position.x}%`,
                    top: `${sticker.position.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <InteractiveStickerDisplay
                    sticker={sticker}
                    onRemove={() => handleRemoveInteractiveSticker(sticker.id)}
                  />
                </div>
              ))}
              
              {/* Sound indicator */}
              {selectedSound && (
                <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-sm rounded-full">
                  <Music className="h-4 w-4 text-white" />
                  <span className="text-xs text-white truncate max-w-[120px]">
                    {selectedSound.name}
                  </span>
                </div>
              )}
            </div>

            {/* Close Friends Toggle */}
            <div className="px-4 py-2">
              <CloseFriendsToggle
                enabled={closeFriendsOnly}
                onChange={setCloseFriendsOnly}
                closeFriendsCount={12}
              />
            </div>

            {/* Caption Input with Autocomplete */}
            <div className="px-4 py-3 bg-black/80 backdrop-blur-sm space-y-2">
              <HashtagAutocomplete
                value={caption}
                onChange={setCaption}
                placeholder="Add a caption... Use #hashtags for discovery"
                maxLength={200}
              />
              <div className="flex items-center justify-between">
                <TrendingHashtagChips
                  currentValue={caption}
                  onSelect={(tag) => {
                    const newCaption = caption.trim() ? `${caption.trim()} #${tag}` : `#${tag}`;
                    if (newCaption.length <= 200) {
                      setCaption(newCaption);
                    }
                  }}
                />
                <p className="text-xs text-white/50 ml-2 shrink-0">
                  {caption.length}/200
                </p>
              </div>
            </div>
            
            {/* Creative Tools Toolbar */}
            <div className="flex items-center justify-center gap-2 p-4 bg-black/80 backdrop-blur-sm">
              <button
                onClick={() => toggleTool('draw')}
                className={cn(
                  "flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all",
                  drawingData ? "bg-green-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
                )}
              >
                <Pencil className="h-5 w-5" />
                <span className="text-[10px] font-medium">Draw</span>
              </button>
              
              <button
                onClick={() => toggleTool('text')}
                className={cn(
                  "flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all",
                  activeTool === 'text' ? "bg-primary text-primary-foreground" : "bg-white/10 text-white hover:bg-white/20"
                )}
              >
                <Type className="h-5 w-5" />
                <span className="text-[10px] font-medium">Text</span>
              </button>
              
              <button
                onClick={() => toggleTool('stickers')}
                className={cn(
                  "flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all",
                  activeTool === 'stickers' ? "bg-primary text-primary-foreground" : "bg-white/10 text-white hover:bg-white/20"
                )}
              >
                <Sticker className="h-5 w-5" />
                <span className="text-[10px] font-medium">Stickers</span>
              </button>
              
              <button
                onClick={() => toggleTool('interactive')}
                className={cn(
                  "flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all",
                  activeTool === 'interactive' ? "bg-primary text-primary-foreground" : "bg-white/10 text-white hover:bg-white/20",
                  interactiveStickers.length > 0 && "ring-2 ring-purple-500"
                )}
              >
                <Layers className="h-5 w-5" />
                <span className="text-[10px] font-medium">Interactive</span>
              </button>
              
              <button
                onClick={() => toggleTool('sounds')}
                className={cn(
                  "flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all",
                  activeTool === 'sounds' ? "bg-primary text-primary-foreground" : "bg-white/10 text-white hover:bg-white/20",
                  selectedSound && "ring-2 ring-green-500"
                )}
              >
                <Music className="h-5 w-5" />
                <span className="text-[10px] font-medium">Sounds</span>
              </button>
            </div>

            {/* Tool Panels */}
            <AnimatePresence>
              {activeTool === 'text' && (
                <motion.div
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 100 }}
                  className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl max-h-[70%] overflow-hidden"
                >
                  <TextOverlayEditor
                    onSave={handleSaveTextOverlay}
                    onCancel={() => setActiveTool('none')}
                  />
                </motion.div>
              )}
              
              {activeTool === 'stickers' && (
                <motion.div
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 100 }}
                  className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl max-h-[70%] overflow-hidden"
                >
                  <StickerPicker
                    isOpen={true}
                    onSelect={handleAddSticker}
                    onClose={() => setActiveTool('none')}
                  />
                </motion.div>
              )}
              
              {activeTool === 'interactive' && (
                <InteractiveStickerPicker
                  isOpen={true}
                  onAdd={handleAddInteractiveSticker}
                  onClose={() => setActiveTool('none')}
                />
              )}
              
              {activeTool === 'sounds' && (
                <motion.div
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 100 }}
                  className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl max-h-[70%] overflow-hidden"
                >
                  <SoundPicker
                    isOpen={true}
                    onSelect={handleSelectSound}
                    onClose={() => setActiveTool('none')}
                    selectedSound={selectedSound}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-sm text-white/70 py-2 text-center bg-black">
              {closeFriendsOnly 
                ? '🟢 Visible to Close Friends only for 24 hours'
                : 'This expression will be visible for 24 hours'
              }
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Highlight Prompt after sharing */}
      <AddToHighlightPrompt
        isOpen={showHighlightPrompt}
        onClose={() => {
          setShowHighlightPrompt(false);
          onSuccess();
        }}
        onAddToHighlight={() => {
          setShowHighlightPrompt(false);
          setShowHighlightSelector(true);
        }}
        onSkip={() => {
          setShowHighlightPrompt(false);
          onSuccess();
        }}
      />

      {/* Highlight Selector */}
      <HighlightSelector
        isOpen={showHighlightSelector}
        onClose={() => {
          setShowHighlightSelector(false);
          onSuccess();
        }}
        onAddToHighlight={handleAddToHighlight}
        onCreateNew={handleCreateHighlight}
        existingHighlights={highlights}
      />
    </motion.div>
  );
}

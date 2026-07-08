import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Camera, Image as ImageIcon, X, Loader2, Sparkles, RotateCcw, FlipHorizontal, Music } from 'lucide-react';
import { ExpressionIcon } from '@/components/icons/ExpressionIcon';
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
import { ToolsRail, ToolType } from './shared/ToolsRail';
import { HoldToRecordButton } from './shared/HoldToRecordButton';
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
import { CreatorScreenHeader } from './CreatorScreenHeader';

// Simulation mode flag - when true, uses FeedDataContext instead of Supabase
const SIMULATION_MODE = true;

type Step = 'capture' | 'preview' | 'drawing';
type ActiveTool = ToolType;

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
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  
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
        video: { facingMode },
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

  const flipCamera = async () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    // Restart with new facing mode
    setTimeout(() => startCamera(), 100);
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

  const handleToolSelect = (tool: ToolType) => {
    if (tool === 'draw') {
      setStep('drawing');
    } else if (tool === 'effects') {
      // Effects not implemented yet
      toast({ title: 'Effects coming soon!' });
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
      className="flex flex-col h-full min-h-dvh bg-black"
    >
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
              /* Full-screen camera interface - Instagram/Snapchat style */
              <div className="flex-1 relative bg-black">
                {/* Camera preview */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Top bar - minimal */}
                <div className="absolute top-0 left-0 right-0 z-10">
                  <div className="flex items-center justify-between p-4 lg:mx-auto lg:max-w-2xl">
                  <button
                    onClick={() => { stopCamera(); handleBack(); }}
                    className="p-2.5 rounded-full bg-black/40 backdrop-blur-sm"
                  >
                    <ArrowLeft className="h-5 w-5 text-white" />
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <ExpressionIcon className="h-5 w-5" />
                    <span className="text-white font-medium text-body">Expression</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={flipCamera}
                      className="p-2.5 rounded-full bg-black/40 backdrop-blur-sm"
                    >
                      <FlipHorizontal className="h-5 w-5 text-white" />
                    </button>
                    <button
                      onClick={() => { stopCamera(); onBack(); }}
                      className="p-2.5 rounded-full bg-black/40 backdrop-blur-sm"
                    >
                      <X className="h-6 w-6 text-white" />
                    </button>
                  </div>
                  </div>
                </div>
                
                {/* Bottom controls - Instagram style */}
                <div className="absolute bottom-0 left-0 right-0 pb-8 pt-6 px-6">
                  <div className="flex items-end justify-between">
                    {/* Gallery button */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 rounded-xl bg-white/20 backdrop-blur-sm"
                    >
                      <ImageIcon className="h-6 w-6 text-white" />
                    </button>
                    
                    {/* Capture button - Hold for video */}
                    <HoldToRecordButton
                      onCapture={capturePhoto}
                      onRecordStart={() => {
                        // TODO: Start video recording
                        console.log('Start recording');
                      }}
                      onRecordEnd={() => {
                        // TODO: End video recording
                        console.log('End recording');
                      }}
                      size="lg"
                    />
                    
                    {/* Effects placeholder */}
                    <button
                      onClick={() => toast({ title: 'Effects coming soon!' })}
                      className="p-3 rounded-xl bg-white/20 backdrop-blur-sm"
                    >
                      <Sparkles className="h-6 w-6 text-white" />
                    </button>
                  </div>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              /* Initial state - tap to start camera */
              <div className="flex-1 flex flex-col bg-background">
                <CreatorScreenHeader type="expression" onBack={onBack} onClose={onBack} showAudience={false} />
                <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <motion.button
                  onClick={startCamera}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-32 h-32 rounded-full gradient-brand flex items-center justify-center shadow-lg"
                >
                  <Camera className="h-12 w-12 text-white" />
                </motion.button>
                <span className="text-body text-white/70">Tap to open camera</span>

                <div className="flex items-center gap-4 w-full max-w-[200px]">
                  <div className="h-px flex-1 bg-white/20" />
                  <span className="text-label text-white/50">or</span>
                  <div className="h-px flex-1 bg-white/20" />
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                >
                  <ImageIcon className="h-5 w-5" />
                  <span>Choose from gallery</span>
                </button>

                <p className="text-label text-white/50 text-center max-w-[240px]">
                  Expressions disappear after 24 hours. Share moments that matter to you.
                </p>
                </div>
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
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20">
              <div className="flex items-center justify-between p-4 lg:mx-auto lg:max-w-2xl">
              <button
                onClick={handleBack}
                className="p-2.5 rounded-full bg-black/40 backdrop-blur-sm"
              >
                <ArrowLeft className="h-5 w-5 text-white" />
              </button>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="gradient-brand text-white px-6"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Share'}
                </Button>
                <button
                  onClick={onBack}
                  className="p-2.5 rounded-full bg-black/40 backdrop-blur-sm"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              </div>
            </div>
            
            {/* Media Preview with overlays */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
              {isVideo ? (
                <video
                  src={previewUrl}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  loop
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
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
                <div className="absolute bottom-20 left-4 flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-sm rounded-full">
                  <Music className="h-4 w-4 text-white" />
                  <span className="text-label text-white truncate max-w-[120px]">
                    {selectedSound.name}
                  </span>
                </div>
              )}
              
              {/* Vertical Tools Rail - Instagram style (right side) */}
              <ToolsRail
                activeTool={activeTool}
                onToolSelect={handleToolSelect}
                hasDrawing={!!drawingData}
                hasSound={!!selectedSound}
                hasInteractive={interactiveStickers.length > 0}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10"
              />
            </div>

            {/* Close Friends Toggle */}
            <div className="px-4 py-2 bg-black">
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
                <p className="text-label text-white/50 ml-2 shrink-0">
                  {caption.length}/200
                </p>
              </div>
            </div>

            <p className="text-body text-white/70 py-2 text-center bg-black">
              {closeFriendsOnly 
                ? '🟢 Visible to Close Friends only for 24 hours'
                : 'This expression will be visible for 24 hours'
              }
            </p>

            {/* Tool Panels */}
            <AnimatePresence>
              {activeTool === 'text' && (
                <motion.div
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 100 }}
                  className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl max-h-[70%] overflow-hidden z-30"
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
                  className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl max-h-[70%] overflow-hidden z-30"
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
                  className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl max-h-[70%] overflow-hidden z-30"
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

import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Camera, Image as ImageIcon, X, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type Step = 'capture' | 'preview';

interface ExpressionCreatorProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function ExpressionCreator({ onBack, onSuccess }: ExpressionCreatorProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [step, setStep] = useState<Step>('capture');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isVideo, setIsVideo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

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

  const handleSubmit = async () => {
    if (!user || !selectedFile) return;

    setIsSubmitting(true);

    try {
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

      toast({
        title: 'Expression added!',
        description: 'Your expression will be visible for 24 hours.',
      });

      onSuccess();
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

  const handleBack = () => {
    if (step === 'preview') {
      setStep('capture');
      setSelectedFile(null);
      setPreviewUrl('');
    } else {
      stopCamera();
      onBack();
    }
  };

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
            className="flex-1 flex flex-col items-center justify-center p-4 bg-black"
          >
            {isVideo ? (
              <video
                src={previewUrl}
                className="max-w-full max-h-[60vh] rounded-xl"
                controls
                autoPlay
                loop
              />
            ) : (
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-[60vh] rounded-xl object-contain"
              />
            )}

            <p className="text-sm text-white/70 mt-4 text-center">
              This expression will be visible for 24 hours
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

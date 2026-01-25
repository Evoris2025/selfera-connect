// Phase F - Request Interaction Modal
// Modal for clients to request an interaction with a verified provider

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CinematicAvatar } from '@/components/ui/CinematicAvatar';
import { InteractionPriceDisplay } from '@/components/billing/InteractionPriceDisplay';
import { EraTier } from '@/lib/eraTiers';

const springGentle = { type: "spring" as const, stiffness: 300, damping: 30 };

interface ProviderInfo {
  id: string;
  display_name: string;
  handle: string;
  avatar_url?: string;
  is_verified: boolean;
  tier: EraTier;
}

interface RequestInteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: ProviderInfo;
  onSubmit: (notes: string) => Promise<boolean>;
  isLoading?: boolean;
}

export function RequestInteractionModal({
  isOpen,
  onClose,
  provider,
  onSubmit,
  isLoading = false,
}: RequestInteractionModalProps) {
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    const success = await onSubmit(notes);
    if (success) {
      setNotes('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto z-50"
            initial={{ opacity: 0, scale: 0.95, y: '-45%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, y: '-45%' }}
            transition={springGentle}
          >
            <div className="bg-card border border-white/10 rounded-3xl overflow-hidden">
              {/* Header */}
              <div className="relative p-5 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <CinematicAvatar
                    src={provider.avatar_url}
                    alt={provider.display_name}
                    fallback={provider.display_name[0] || 'P'}
                    size="lg"
                    ring="gradient"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-foreground">
                        {provider.display_name}
                      </h2>
                      {provider.is_verified && (
                        <Sparkles className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">@{provider.handle}</p>
                  </div>
                  <button
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 transition-colors"
                    onClick={onClose}
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-5">
                {/* Price Display */}
                <InteractionPriceDisplay providerTier={provider.tier} />

                {/* Notes Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Add a note (optional)
                  </label>
                  <Textarea
                    placeholder="Briefly describe what you'd like to discuss..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={500}
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {notes.length}/500
                  </p>
                </div>

                {/* Info Notice */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <AlertCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    The provider will review your request and can choose to accept or decline. 
                    You'll be notified of their response.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-5 pt-0 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="animate-pulse">Sending...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Request Interaction
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

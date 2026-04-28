import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onDiscard: () => void;
  onKeepEditing: () => void;
}

export function UnsavedChangesDialog({
  isOpen,
  onDiscard,
  onKeepEditing,
}: UnsavedChangesDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onKeepEditing}
          />
          
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-sm"
          >
            <div className="bg-background rounded-2xl border border-border shadow-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Discard changes?</h3>
                  <p className="text-body text-muted-foreground">Your edits will be lost.</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button
                  variant="destructive"
                  onClick={onDiscard}
                  className="w-full"
                >
                  Discard
                </Button>
                <Button
                  variant="outline"
                  onClick={onKeepEditing}
                  className="w-full"
                >
                  Keep Editing
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

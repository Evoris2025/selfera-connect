import { motion, AnimatePresence } from 'framer-motion';
import { Pause } from 'lucide-react';

interface PauseOverlayProps {
  isPaused: boolean;
}

export function PauseOverlay({ isPaused }: PauseOverlayProps) {
  return (
    <AnimatePresence>
      {isPaused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center"
          >
            <Pause className="h-10 w-10 text-white fill-white" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

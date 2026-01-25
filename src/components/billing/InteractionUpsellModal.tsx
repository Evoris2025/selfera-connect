import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, Lock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CLIENT_BASE_PRICE, formatPrice } from '@/lib/eraTiers';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

interface InteractionUpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InteractionUpsellModal({ isOpen, onClose }: InteractionUpsellModalProps) {
  const navigate = useNavigate();
  
  const handleUpgrade = () => {
    onClose();
    navigate('/settings?view=billing');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            variants={backdropVariants}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="relative w-full max-w-sm bg-card rounded-3xl border border-white/[0.08] shadow-2xl overflow-hidden"
            variants={modalVariants}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
            
            {/* Header Gradient */}
            <div className="h-24 bg-gradient-to-br from-pink-500/20 via-primary/20 to-purple-500/20 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-primary flex items-center justify-center shadow-lg shadow-pink-500/30">
                <Lock className="w-7 h-7 text-white" />
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 text-center">
              <h2 className="text-xl font-bold text-foreground mb-2">
                Unlock Interactions
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                Upgrade to Client Paid to request interactions with ERA Verified providers
              </p>
              
              {/* Features */}
              <div className="space-y-2 mb-6 text-left">
                {[
                  'Request interactions with verified providers',
                  'Pink ERA Verified client badge',
                  'Priority support access',
                  'Exclusive community features',
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-pink-500 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
              
              {/* Price */}
              <div className="py-4 border-t border-b border-white/[0.06] mb-6">
                <p className="text-3xl font-bold text-foreground">
                  {formatPrice(CLIENT_BASE_PRICE)}
                  <span className="text-base font-normal text-muted-foreground">/month</span>
                </p>
              </div>
              
              {/* CTA */}
              <Button
                className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-primary hover:opacity-90"
                size="lg"
                onClick={handleUpgrade}
              >
                Upgrade Now
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              
              <button
                onClick={onClose}
                className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
